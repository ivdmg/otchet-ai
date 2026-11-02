"""Studio inputs and temporary delivery. Existing files remain untouched."""
from alembic import op
import sqlalchemy as sa
revision = 'studio_v2'
down_revision = '402307d3833f'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('gd_documents', sa.Column('settings',sa.JSON(),nullable=False,server_default='{}'))
    for name in ('approval_hash','pdf_hash'):
        op.add_column('gd_documents',sa.Column(name,sa.String(64)))
    op.add_column('gd_documents',sa.Column('actual_pages',sa.Integer()))
    op.add_column('gd_documents',sa.Column('delivery_id',sa.String(36),unique=True))
    op.add_column('gd_documents',sa.Column('pdf_path',sa.Text()))

def downgrade():
    for name in ('settings','approval_hash','pdf_hash','actual_pages','delivery_id','pdf_path'):
        op.drop_column('gd_documents',name)
