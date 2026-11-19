#!/usr/bin/env python3
"""Build a student archive from an explicit, instructor-free source list."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "downloads" / "physiology-student-files.zip"


def main():
    sources = [ROOT / "README-student.txt", ROOT / "physiology.Rproj"]
    sources += sorted((ROOT / "data").glob("*.csv"))
    sources += [ROOT / "data" / "README.md"]
    sources += sorted((ROOT / "optional-computing").glob("*.R"))
    sources += sorted((ROOT / "optional-computing").glob("*.Rmd"))
    if len(list((ROOT / "data").glob("*.csv"))) != 4:
        raise SystemExit("Expected four supplied teaching datasets")
    for source in sources:
        if not source.is_file():
            raise SystemExit(f"Missing student source: {source.relative_to(ROOT)}")
    if not any(p.suffix == ".Rmd" for p in sources):
        raise SystemExit("Missing optional report source")
    DEST.parent.mkdir(exist_ok=True)
    with ZipFile(DEST, "w", compression=ZIP_DEFLATED) as archive:
        for source in sources:
            archive.write(source, source.relative_to(ROOT))
    print(f"Packaged {len(sources)} files: {DEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
