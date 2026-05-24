"""Add image public IDs for cloud storage cleanup.

Revision ID: 20260524_3h4
Revises: 20260523_3h3
Create Date: 2026-05-24 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260524_3h4"
down_revision: Union[str, Sequence[str], None] = "20260523_3h3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "clothing_items",
        sa.Column("image_public_id", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "outfits",
        sa.Column("image_public_id", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("outfits", "image_public_id")
    op.drop_column("clothing_items", "image_public_id")
