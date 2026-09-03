"""add boosted field to vehicles

Revision ID: e4900e4639a1
Revises: 71afe85984e1
Create Date: 2026-09-03 23:36:09.576369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4900e4639a1'
down_revision: Union[str, None] = '71afe85984e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('vehicles', sa.Column('boosted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(op.f('ix_vehicles_boosted'), 'vehicles', ['boosted'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vehicles_boosted'), table_name='vehicles')
    op.drop_column('vehicles', 'boosted')
