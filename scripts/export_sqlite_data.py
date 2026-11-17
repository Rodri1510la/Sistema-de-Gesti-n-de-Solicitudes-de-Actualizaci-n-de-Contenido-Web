import json
import sqlite3
import tempfile
from pathlib import Path


TABLES = ("Usuario", "Solicitud", "Archivo", "Historial", "Notificacion")
DATABASE_PATH = Path(__file__).resolve().parents[1] / "prisma" / "dev.db"
EXPORT_PATH = Path(tempfile.gettempdir()) / "sgsacw-sqlite-export.json"


def main():
    if not DATABASE_PATH.is_file():
        raise FileNotFoundError(f"No se encontró la base SQLite: {DATABASE_PATH}")

    connection = sqlite3.connect(f"{DATABASE_PATH.as_uri()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    try:
        export = {
            table: [
                dict(row)
                for row in connection.execute(f'SELECT * FROM "{table}" ORDER BY "id"')
            ]
            for table in TABLES
        }
    finally:
        connection.close()

    with EXPORT_PATH.open("w", encoding="utf-8") as file:
        json.dump(export, file, ensure_ascii=False)

    counts = ", ".join(f"{table}: {len(export[table])}" for table in TABLES)
    print(f"Exportación temporal creada en {EXPORT_PATH}")
    print(counts)


if __name__ == "__main__":
    main()
