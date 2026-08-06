import hashlib
import hmac
import uuid
from typing import Any, Dict, Optional, Tuple


class PaymentService:
    """
    Сервис-клиент эквайринга (ЮKassa / CloudPayments).
    Курс: 1 кредит = 10 руб.
    """

    CREDIT_PRICE_RUB: float = 10.0
    DEFAULT_SECRET_KEY: str = "secret_payment_webhook_key_2026"

    @classmethod
    def calculate_credits(cls, amount_rub: float) -> int:
        """Расчет количества кредитов исходя из суммы в рублях (10 руб = 1 кредит)."""
        return int(amount_rub // cls.CREDIT_PRICE_RUB)

    @classmethod
    def calculate_rub(cls, amount_credits: int) -> float:
        """Расчет суммы в рублях по количеству кредитов."""
        return float(amount_credits * cls.CREDIT_PRICE_RUB)

    def create_payment_session(
        self,
        user_id: uuid.UUID,
        amount_rub: float,
        amount_credits: int,
        return_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Создание платежной сессии в эквайринге.
        Возвращает идентификатор платежа в провайдере и URL для перенаправления пользователя.
        """
        payment_provider_id = f"pay_{uuid.uuid4().hex[:16]}"
        confirmation_url = (
            return_url
            or f"https://payment-gateway.ru/pay/{payment_provider_id}"
        )

        return {
            "payment_id": payment_provider_id,
            "confirmation_url": confirmation_url,
            "status": "pending",
            "amount_rub": amount_rub,
            "amount_credits": amount_credits,
            "user_id": str(user_id),
        }

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature: str,
        secret: Optional[str] = None,
    ) -> bool:
        """
        Проверка HMAC SHA-256 подписи входящего вебхука от эквайринга.
        """
        if not signature:
            return False
        secret_key = (secret or self.DEFAULT_SECRET_KEY).encode("utf-8")
        expected_hash = hmac.new(
            secret_key, payload_bytes, hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_hash, signature.lower())

    def parse_webhook_payload(self, payload: Dict[str, Any]) -> Tuple[str, str, float, int]:
        """
        Парсинг нагрузки вебхука.
        Возвращает (payment_id, status, amount_rub, amount_credits).
        """
        payment_id = payload.get("payment_id") or payload.get("id")
        event_status = payload.get("status") or payload.get("event")

        # Приведение статусов ЮKassa/CloudPayments к нашей схеме
        if event_status in ["payment.succeeded", "succeeded", "COMPLETED"]:
            status_str = "succeeded"
        elif event_status in ["payment.canceled", "canceled", "DECLINED"]:
            status_str = "canceled"
        else:
            status_str = "pending"

        amount_rub = float(payload.get("amount_rub", 0.0))
        amount_credits = int(payload.get("amount_credits", 0))

        return payment_id, status_str, amount_rub, amount_credits


payment_service = PaymentService()
