"""Sanitized provider latency/usage, no prompts or content."""
from alembic import op
import sqlalchemy as sa
revision='studio_metrics'
down_revision='studio_v2'
branch_labels=None
depends_on=None

def upgrade():
    op.add_column('gd_jobs',sa.Column('metrics',sa.JSON(),nullable=False,server_default='{}'))

def downgrade():
    op.drop_column('gd_jobs','metrics')
