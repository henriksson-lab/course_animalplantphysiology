#!/usr/bin/env python3
"""Render the student archive in a fresh directory and a clean R process."""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]


def main():
    with TemporaryDirectory(prefix="physiology-student-check-") as folder:
        with ZipFile(ROOT / "downloads" / "physiology-student-files.zip") as archive:
            archive.extractall(folder)
        subprocess.run(
            ["Rscript", "--vanilla", "-e",
             'rmarkdown::render("optional-computing/respirometry.Rmd", quiet=TRUE)'],
            cwd=folder,
            check=True,
        )
        output = Path(folder) / "optional-computing" / "respirometry.html"
        if not output.exists() or output.stat().st_size < 1000:
            raise SystemExit("Expected an HTML report from the extracted project")
        print("Optional report rendered from the extracted student archive in a clean R process.")


if __name__ == "__main__":
    main()
