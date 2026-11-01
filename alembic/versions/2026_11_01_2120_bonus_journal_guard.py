"""Append-only bonus ledger, enforced in PostgreSQL."""
from alembic import op

revision = 'bonus_journal_guard'
down_revision = '8cae790b104f'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
    CREATE FUNCTION gd_immutable_bonus_entry() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'bonus_entries is append-only';
    END;
    $$;
    CREATE TRIGGER gd_bonus_entries_immutable BEFORE UPDATE OR DELETE ON gd_bonus_entries
    FOR EACH ROW EXECUTE FUNCTION gd_immutable_bonus_entry();
    """)


def downgrade():
    op.execute('DROP TRIGGER gd_bonus_entries_immutable ON gd_bonus_entries')
    op.execute('DROP FUNCTION gd_immutable_bonus_entry()')
