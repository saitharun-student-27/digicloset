"""Initial DigiCloset schema.

Revision ID: 20260523_3h3
Revises:
Create Date: 2026-05-23 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260523_3h3"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "clothing_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("color", sa.String(length=50), nullable=False),
        sa.Column("season", sa.String(length=50), nullable=True),
        sa.Column("occasion", sa.String(length=50), nullable=True),
        sa.Column("style", sa.String(length=80), nullable=True),
        sa.Column("formality_level", sa.String(length=50), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_clothing_items_id"), "clothing_items", ["id"], unique=False)
    op.create_index(op.f("ix_clothing_items_user_id"), "clothing_items", ["user_id"], unique=False)

    op.create_table(
        "outfits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("occasion", sa.String(length=50), nullable=False),
        sa.Column("season", sa.String(length=50), nullable=False),
        sa.Column("style", sa.String(length=80), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("is_favorite", sa.Boolean(), nullable=False),
        sa.Column("last_worn_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_outfits_id"), "outfits", ["id"], unique=False)
    op.create_index(op.f("ix_outfits_user_id"), "outfits", ["user_id"], unique=False)

    op.create_table(
        "outfit_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("outfit_id", sa.Integer(), nullable=False),
        sa.Column("clothing_item_id", sa.Integer(), nullable=False),
        sa.Column("slot", sa.String(length=50), nullable=False),
        sa.Column("layer_order", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["clothing_item_id"], ["clothing_items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["outfit_id"], ["outfits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_outfit_items_id"), "outfit_items", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_outfit_items_id"), table_name="outfit_items")
    op.drop_table("outfit_items")

    op.drop_index(op.f("ix_outfits_user_id"), table_name="outfits")
    op.drop_index(op.f("ix_outfits_id"), table_name="outfits")
    op.drop_table("outfits")

    op.drop_index(op.f("ix_clothing_items_user_id"), table_name="clothing_items")
    op.drop_index(op.f("ix_clothing_items_id"), table_name="clothing_items")
    op.drop_table("clothing_items")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
