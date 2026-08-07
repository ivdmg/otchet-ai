import json
import logging
import asyncio
from typing import AsyncGenerator
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.redis import get_async_redis_client
from app.services.checkpoint_service import CheckpointService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/generation/{doc_id}")
async def websocket_generation_progress(websocket: WebSocket, doc_id: str):
    """
    WebSocket endpoint for real-time document generation progress streaming.
    Subscribes to Redis Pub/Sub channel `doc:{doc_id}:progress`.
    """
    await websocket.accept()
    logger.info(f"WebSocket client connected for doc_id: {doc_id}")

    redis_client = get_async_redis_client()
    pubsub = redis_client.pubsub()
    channel = f"doc:{doc_id}:progress"

    try:
        # 1. Send initial checkpoint state if available
        initial_ast = await CheckpointService.get_checkpoint_async(doc_id)
        if initial_ast:
            await websocket.send_json({
                "doc_id": doc_id,
                "step": "INITIAL_STATE",
                "progress_percent": 0,
                "status": "processing",
                "message": "Existing checkpoint state loaded",
                "ast_graph": initial_ast,
            })

        # 2. Subscribe to Redis Pub/Sub channel
        await pubsub.subscribe(channel)

        while True:
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    raw_data = message["data"]
                    if isinstance(raw_data, bytes):
                        raw_data = raw_data.decode("utf-8")

                    data = json.loads(raw_data)
                    await websocket.send_json(data)

                    # Close connection upon final completion or failure
                    if data.get("status") in ["completed", "failed"]:
                        logger.info(f"Generation for doc {doc_id} reached terminal state: {data.get('status')}")
                        break
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected by client for doc {doc_id}")
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message for doc {doc_id}: {e}")
                await websocket.send_json({
                    "doc_id": doc_id,
                    "status": "failed",
                    "message": f"WebSocket internal streaming error: {str(e)}",
                })
                break

            await asyncio.sleep(0.05)

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from WebSocket doc {doc_id}")
    except Exception as e:
        logger.error(f"WebSocket connection error for doc {doc_id}: {e}")
    finally:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
            await redis_client.aclose()
        except Exception:
            pass
        logger.info(f"Cleaned up WebSocket Pub/Sub resources for doc {doc_id}")


@router.get("/documents/{doc_id}/events", response_class=StreamingResponse, summary="SSE Generation Progress Stream")
async def sse_generation_progress(doc_id: str):
    """
    SSE (Server-Sent Events) endpoint streaming progress events via EventSource.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        redis_client = get_async_redis_client()
        pubsub = redis_client.pubsub()
        channel = f"doc:{doc_id}:progress"

        try:
            initial_ast = await CheckpointService.get_checkpoint_async(doc_id)
            if initial_ast:
                init_payload = {
                    "doc_id": doc_id,
                    "step": "INITIAL_STATE",
                    "progress_percent": 0,
                    "status": "processing",
                    "message": "Existing checkpoint loaded",
                    "ast_graph": initial_ast,
                }
                yield f"data: {json.dumps(init_payload, ensure_ascii=False)}\n\n"

            await pubsub.subscribe(channel)

            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    raw_data = message["data"]
                    if isinstance(raw_data, bytes):
                        raw_data = raw_data.decode("utf-8")

                    yield f"data: {raw_data}\n\n"

                    data = json.loads(raw_data)
                    if data.get("status") in ["completed", "failed"]:
                        break

                await asyncio.sleep(0.05)

        except Exception as e:
            err_payload = {"doc_id": doc_id, "status": "failed", "message": str(e)}
            yield f"data: {json.dumps(err_payload, ensure_ascii=False)}\n\n"
        finally:
            try:
                await pubsub.unsubscribe(channel)
                await pubsub.close()
                await redis_client.aclose()
            except Exception:
                pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")
