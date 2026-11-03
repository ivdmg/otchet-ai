"""Freeze title-page profile independently of model input."""
from alembic import op
import sqlalchemy as sa
revision = 'studio_title_layout'
down_revision = 'studio_profile'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('gd_documents', sa.Column('title_data', sa.JSON(), nullable=False, server_default='{}'))

def downgrade():
    op.drop_column('gd_documents', 'title_data')
