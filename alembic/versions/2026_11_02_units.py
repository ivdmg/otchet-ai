"""Freeze pipeline weights, units and target words before admission."""
from alembic import op
import sqlalchemy as sa
revision='studio_units'
down_revision='studio_metrics'
branch_labels=None
depends_on=None

def upgrade():
    op.add_column('gd_jobs',sa.Column('units',sa.JSON(),nullable=False,server_default='[]'))

def downgrade():
    op.drop_column('gd_jobs','units')
