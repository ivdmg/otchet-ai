# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.generation_task import GenerationTask  # noqa: F401
from app.models.prompt_history import PromptHistory  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
