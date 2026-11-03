"""Bounded plan regeneration and manual job recovery."""
from alembic import op
import sqlalchemy as sa
revision = 'studio_recovery'
down_revision = 'studio_title_layout'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('gd_documents',sa.Column('plan_regenerations',sa.Integer(),nullable=False,server_default='0'))
    op.add_column('gd_documents',sa.Column('plan_revision',sa.Integer(),nullable=False,server_default='0'))
    op.add_column('gd_jobs',sa.Column('manual_retries',sa.Integer(),nullable=False,server_default='0'))

def downgrade():
    op.drop_column('gd_jobs','manual_retries')
    op.drop_column('gd_documents','plan_revision')
    op.drop_column('gd_documents','plan_regenerations')
