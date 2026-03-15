import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "wardrobe.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS clothes (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            category  TEXT    NOT NULL,
            color     TEXT,
            season    TEXT,
            occasion  TEXT,
            filename  TEXT    NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """
    )
    conn.commit()
    conn.close()


def add_item(name, category, color, season, occasion, filename):
    conn = get_db()
    conn.execute(
        "INSERT INTO clothes (name,category,color,season,occasion,filename) VALUES (?,?,?,?,?,?)",
        (name, category, color, season, occasion, filename),
    )
    conn.commit()
    conn.close()


def get_all_items():
    conn = get_db()
    rows = conn.execute("SELECT * FROM clothes ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_items_by_category(category):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM clothes WHERE category=?", (category,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_item(item_id):
    conn = get_db()
    conn.execute("DELETE FROM clothes WHERE id=?", (item_id,))
    conn.commit()
    conn.close()


init_db()
