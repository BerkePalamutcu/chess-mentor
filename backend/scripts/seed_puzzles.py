"""
Seed puzzles from the Lichess open puzzle database.

Usage:
    cd backend
    uv run python scripts/seed_puzzles.py            # 10 000 puzzles (default)
    uv run python scripts/seed_puzzles.py --limit 50000
    uv run python scripts/seed_puzzles.py --limit 0  # all (~4M, slow)
"""
import argparse
import csv
import io
import sys
import urllib.request

import zstandard as zstd
from sqlmodel import Session, select

sys.path.insert(0, ".")   # allow imports from backend root

from db.database import create_db_and_tables, engine
from db.models import Puzzle

CSV_URL = "https://database.lichess.org/lichess_db_puzzle.csv.zst"


def seed(limit: int = 10_000) -> None:
    create_db_and_tables()

    existing = 0
    inserted = 0
    skipped = 0

    print(f"Downloading puzzle database from Lichess (limit={limit or 'all'})…")
    dctx = zstd.ZstdDecompressor()

    with urllib.request.urlopen(CSV_URL) as response:
        with dctx.stream_reader(response) as stream:
            text = io.TextIOWrapper(stream, encoding="utf-8")
            reader = csv.DictReader(text)

            with Session(engine) as session:
                # Check how many already exist
                existing = session.exec(select(Puzzle)).first()
                batch: list[Puzzle] = []

                for i, row in enumerate(reader):
                    if limit and i >= limit:
                        break

                    if i % 1000 == 0:
                        print(f"  {i:>6} rows processed, {inserted} inserted…", end="\r")

                    lid = row["PuzzleId"]
                    if session.exec(select(Puzzle).where(Puzzle.lichess_id == lid)).first():
                        skipped += 1
                        continue

                    batch.append(Puzzle(
                        lichess_id=lid,
                        fen=row["FEN"],
                        moves=row["Moves"],
                        rating=int(row["Rating"]),
                        rating_deviation=int(row.get("RatingDeviation", 80)),
                        themes=row.get("Themes", ""),
                        opening_tags=row.get("OpeningTags") or None,
                        popularity=int(row.get("Popularity", 0)),
                        nb_plays=int(row.get("NbPlays", 0)),
                    ))

                    if len(batch) >= 500:
                        session.add_all(batch)
                        session.commit()
                        inserted += len(batch)
                        batch.clear()

                if batch:
                    session.add_all(batch)
                    session.commit()
                    inserted += len(batch)

    print(f"\nDone. Inserted {inserted} puzzles, skipped {skipped} duplicates.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=10_000)
    args = parser.parse_args()
    seed(args.limit)
