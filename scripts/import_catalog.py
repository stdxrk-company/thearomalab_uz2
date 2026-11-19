"""
Import the catalog into the site.

Reads data/catalog-source.tsv (one row per perfume, price per 10 ml in USD)
and the Telegram export folder with the photos, then writes:
  - src/data/products.json            catalog used by the site (with notes from data/notes.json)
  - public/images/products/<slug>.jpg  large photo (product page)
  - public/images/products/<slug>-sm.jpg  thumbnail (catalog grid)

Usage (needs Pillow: pip install pillow):
  python scripts/import_catalog.py "C:/Users/HP/Downloads/Telegram Desktop/ChatExport_2026-11-19"
"""
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "catalog-source.tsv"
NOTES = ROOT / "data" / "notes.json"
OUT_JSON = ROOT / "src" / "data" / "products.json"
OUT_IMG = ROOT / "public" / "images" / "products"

LARGE = 1200
SMALL = 560


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text


def save_resized(src: Path, dst: Path, size: int) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB")
        im.thumbnail((size, size), Image.LANCZOS)
        im.save(dst, "JPEG", quality=84, optimize=True, progressive=True)


def main() -> None:
    export_dir = Path(sys.argv[1])
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    notes = {k: v for k, v in json.loads(NOTES.read_text(encoding="utf-8")).items() if not k.startswith("_")}

    products = []
    seen = set()
    with open(SOURCE, encoding="utf-8") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            slug = slugify(f"{row['brand']} {row['name']}")
            if slug in seen:
                raise SystemExit(f"duplicate slug: {slug}")
            seen.add(slug)
            src = export_dir / row["photo"]
            save_resized(src, OUT_IMG / f"{slug}.jpg", LARGE)
            save_resized(src, OUT_IMG / f"{slug}-sm.jpg", SMALL)
            product = {
                "id": slug,
                "brand": row["brand"],
                "name": row["name"],
                "gender": {"M": "men", "W": "women", "U": "unisex"}[row["gender"]],
                "image": f"/images/products/{slug}.jpg",
                "thumb": f"/images/products/{slug}-sm.jpg",
                "inStock": True,
                "volumes": [{"ml": 10, "priceUsd": int(row["price_usd_10ml"])}],
                "order": int(row["idx"]),
            }
            if row["idx"] in notes:
                product["notes"] = notes[row["idx"]]
            products.append(product)

    OUT_JSON.write_text(json.dumps(products, ensure_ascii=False, indent=1), encoding="utf-8")
    with_notes = sum(1 for p in products if "notes" in p)
    print(f"{len(products)} products ({with_notes} with notes) -> {OUT_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
