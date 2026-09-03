"""add cascade delete for vehicle foreign keys

Revision ID: fb03bfab2e7b
Revises: 7f78d8b6416b
Create Date: 2026-09-03 20:47:48.860360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb03bfab2e7b'
down_revision: Union[str, None] = '7f78d8b6416b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('favorites_vehicle_id_fkey', 'favorites', type_='foreignkey')
    op.create_foreign_key(None, 'favorites', 'vehicles', ['vehicle_id'], ['id'], ondelete='CASCADE')
    op.drop_constraint('vehicle_embeddings_vehicle_id_fkey', 'vehicle_embeddings', type_='foreignkey')
    op.create_foreign_key(None, 'vehicle_embeddings', 'vehicles', ['vehicle_id'], ['id'], ondelete='CASCADE')
    op.drop_constraint('vehicle_images_vehicle_id_fkey', 'vehicle_images', type_='foreignkey')
    op.create_foreign_key(None, 'vehicle_images', 'vehicles', ['vehicle_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    op.drop_constraint(None, 'vehicle_images', type_='foreignkey')
    op.create_foreign_key('vehicle_images_vehicle_id_fkey', 'vehicle_images', 'vehicles', ['vehicle_id'], ['id'])
    op.drop_constraint(None, 'vehicle_embeddings', type_='foreignkey')
    op.create_foreign_key('vehicle_embeddings_vehicle_id_fkey', 'vehicle_embeddings', 'vehicles', ['vehicle_id'], ['id'])
    op.drop_constraint(None, 'favorites', type_='foreignkey')
    op.create_foreign_key('favorites_vehicle_id_fkey', 'favorites', 'vehicles', ['vehicle_id'], ['id'])
