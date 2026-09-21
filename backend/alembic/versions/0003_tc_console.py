"""TC console: worker hours, leavers, drafts; contractor login link; upload paths

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-02 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003'
down_revision: Union[str, Sequence[str], None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('gc_worker_hours',
    sa.Column('worker_id', sa.String(length=36), nullable=False),
    sa.Column('pct', sa.Integer(), nullable=False),
    sa.Column('hours_label', sa.String(length=32), nullable=False),
    sa.Column('days_label', sa.String(length=32), nullable=False),
    sa.Column('warned', sa.Boolean(), nullable=False),
    sa.Column('flag', sa.String(length=32), nullable=False),
    sa.Column('rest_day_planned', sa.String(length=32), nullable=False),
    sa.Column('project_id', sa.String(length=36), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['gc_projects.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['worker_id'], ['gc_workers.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gc_worker_hours_project_id'), 'gc_worker_hours', ['project_id'], unique=False)
    op.create_index(op.f('ix_gc_worker_hours_worker_id'), 'gc_worker_hours', ['worker_id'], unique=False)
    op.create_table('gc_worker_leavers',
    sa.Column('worker_id', sa.String(length=36), nullable=False),
    sa.Column('last_day', sa.String(length=32), nullable=False),
    sa.Column('reason', sa.String(length=200), nullable=False),
    sa.Column('card_returned', sa.String(length=64), nullable=False),
    sa.Column('hours_label', sa.String(length=32), nullable=False),
    sa.Column('status_label', sa.String(length=120), nullable=False),
    sa.Column('level', sa.Integer(), nullable=False),
    sa.Column('meta', sa.String(length=200), nullable=False),
    sa.Column('confirmed', sa.Boolean(), nullable=False),
    sa.Column('project_id', sa.String(length=36), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['gc_projects.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['worker_id'], ['gc_workers.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gc_worker_leavers_project_id'), 'gc_worker_leavers', ['project_id'], unique=False)
    op.create_index(op.f('ix_gc_worker_leavers_worker_id'), 'gc_worker_leavers', ['worker_id'], unique=False)
    op.create_table('gc_worker_drafts',
    sa.Column('company_id', sa.String(length=36), nullable=False),
    sa.Column('created_by', sa.String(length=36), nullable=False),
    sa.Column('step', sa.Integer(), nullable=False),
    sa.Column('payload', sa.Text(), nullable=False),
    sa.Column('project_id', sa.String(length=36), nullable=False),
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['company_id'], ['gc_companies.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['project_id'], ['gc_projects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gc_worker_drafts_company_id'), 'gc_worker_drafts', ['company_id'], unique=False)
    op.create_index(op.f('ix_gc_worker_drafts_project_id'), 'gc_worker_drafts', ['project_id'], unique=False)

    # Existing rows get the model defaults, then the columns go NOT NULL to match.
    op.add_column('gc_contractor_accounts', sa.Column('user_id', sa.String(length=36), nullable=True))
    op.create_index(op.f('ix_gc_contractor_accounts_user_id'), 'gc_contractor_accounts', ['user_id'], unique=False)
    op.create_foreign_key(
        'fk_gc_contractor_accounts_user_id_users', 'gc_contractor_accounts', 'users',
        ['user_id'], ['id'], ondelete='SET NULL',
    )
    op.add_column('gc_workers', sa.Column('last_seen_on', sa.String(length=32), nullable=False, server_default='—'))
    op.add_column('gc_workers', sa.Column('inactivity_warnings', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('gc_document_submissions', sa.Column('file_path', sa.String(length=500), nullable=False, server_default=''))
    op.alter_column('gc_workers', 'last_seen_on', server_default=None)
    op.alter_column('gc_workers', 'inactivity_warnings', server_default=None)
    op.alter_column('gc_document_submissions', 'file_path', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('gc_document_submissions', 'file_path')
    op.drop_column('gc_workers', 'inactivity_warnings')
    op.drop_column('gc_workers', 'last_seen_on')
    op.drop_constraint('fk_gc_contractor_accounts_user_id_users', 'gc_contractor_accounts', type_='foreignkey')
    op.drop_index(op.f('ix_gc_contractor_accounts_user_id'), table_name='gc_contractor_accounts')
    op.drop_column('gc_contractor_accounts', 'user_id')
    op.drop_index(op.f('ix_gc_worker_drafts_project_id'), table_name='gc_worker_drafts')
    op.drop_index(op.f('ix_gc_worker_drafts_company_id'), table_name='gc_worker_drafts')
    op.drop_table('gc_worker_drafts')
    op.drop_index(op.f('ix_gc_worker_leavers_worker_id'), table_name='gc_worker_leavers')
    op.drop_index(op.f('ix_gc_worker_leavers_project_id'), table_name='gc_worker_leavers')
    op.drop_table('gc_worker_leavers')
    op.drop_index(op.f('ix_gc_worker_hours_worker_id'), table_name='gc_worker_hours')
    op.drop_index(op.f('ix_gc_worker_hours_project_id'), table_name='gc_worker_hours')
    op.drop_table('gc_worker_hours')
