"""Keep the existing brand guide's absolute asset URLs inside /brand/."""
import re
from pathlib import Path

for path in Path("brand").rglob("*"):
    if path.is_file() and path.suffix.lower() in {".html", ".css", ".js", ".json", ".svg", ".xml"}:
        source = path.read_text(encoding="utf-8")
        source = re.sub(r'''(["'(=])/(?!/|brand/)''', r"\1/brand/", source)
        path.write_text(source, encoding="utf-8")
