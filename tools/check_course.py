#!/usr/bin/env python3
"""Check generated course links, student archive and publication boundaries."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids = set()
        self.links = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "id":
                self.ids.add(value)
            if key in ("href", "src") and value:
                self.links.append(value)


def main():
    pages = {p.resolve(): Page(p) for p in SITE.rglob("*.html")}
    if len(pages) < 50:
        raise SystemExit("The full course has not been rendered")
    problems, checked = [], 0
    for path, page in pages.items():
        for target in page.links:
            url = urlsplit(target)
            if url.scheme or url.netloc:
                continue
            if url.path:
                destination = SITE / url.path.lstrip("/") if url.path.startswith("/") else path.parent / url.path
                destination = Path(unquote(str(destination))).resolve()
            else:
                destination = path
            checked += 1
            if not destination.exists():
                problems.append(f"{path.relative_to(SITE)}: missing {target}")
            elif url.fragment and not url.fragment.startswith("/") and destination in pages:
                if unquote(url.fragment) not in pages[destination].ids:
                    problems.append(f"{path.relative_to(SITE)}: missing anchor {target}")
    for private in ("instructor", "plan", "contentplan.html", "README.html"):
        if (SITE / private).exists():
            problems.append(f"Instructor document published: {private}")
    with ZipFile(ROOT / "downloads" / "physiology-student-files.zip") as archive:
        names = set(archive.namelist())
        for required in ("physiology.Rproj", "README-student.txt", "data/README.md", "optional-computing/respirometry.Rmd"):
            if required not in names:
                problems.append(f"Missing archive input: {required}")
        if any(n.startswith(("instructor/", "plan/")) for n in names):
            problems.append("Instructor material included in student archive")
        if archive.testzip():
            problems.append("Corrupt student archive")
    if problems:
        raise SystemExit("\n".join(problems))
    print(f"Checked {len(pages)} HTML pages, {checked} local links/anchors, archive and instructor exclusions.")


if __name__ == "__main__":
    main()
