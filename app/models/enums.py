from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class DocType(str, Enum):
    COURSEWORK = "coursework"
    ABSTRACT = "abstract"
    VKR = "vkr"


class DocStatus(str, Enum):
    DRAFT = "draft"
    OUTLINE_GENERATED = "outline_generated"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TransactionType(str, Enum):
    TOPUP = "topup"
    SPEND_GENERATION = "spend_generation"
    SPEND_SPOT_REGEN = "spend_spot_regen"
    REFUND = "refund"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
