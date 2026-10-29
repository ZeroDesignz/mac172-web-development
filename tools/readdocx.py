#!/usr/bin/env python3
"""Print a .docx as plain text: paragraphs with heading markers, plus tables."""
import sys
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph


def iter_blocks(parent):
    body = parent.element.body
    for child in body.iterchildren():
        tag = child.tag.split('}')[-1]
        if tag == 'p':
            yield Paragraph(child, parent)
        elif tag == 'tbl':
            yield Table(child, parent)


for path in sys.argv[1:]:
    print("=" * 70)
    print(path)
    print("=" * 70)
    doc = Document(path)
    for block in iter_blocks(doc):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if not text:
                continue
            style = (block.style.name or "").lower()
            if "heading" in style or "title" in style:
                print("\n## " + text)
            elif "list" in style:
                print("  - " + text)
            else:
                print(text)
        else:
            print("\n[TABLE]")
            for row in block.rows:
                cells = [c.text.strip().replace("\n", " ") for c in row.cells]
                print(" | ".join(cells))
            print()
    print()
