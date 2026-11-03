"""Persist account profile independently of the browser."""
from alembic import op
import sqlalchemy as sa
revision = 'studio_profile'
down_revision = 'studio_units'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('gd_users', sa.Column('profile_data', sa.JSON(), nullable=False, server_default='{}'))

def downgrade():
    op.drop_column('gd_users', 'profile_data')
