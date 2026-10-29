# tools

**Not coursework.** Nothing in this folder is submitted, and nothing in it runs
in a browser. It sits outside `MAC172 _WebDev 1/` on purpose.

These are the Python generators that wrote the demo sites in
`MAC172 _WebDev 1/GroupProject/`. Each one holds the shared header, footer and
page body for a site and writes its `.html` files. The CSS and JavaScript for
each site are hand-written and are **not** generated — a build script never
touches `css/styles.css` or `js/script.js`.

## Why a generator at all

Each site is nine to twelve pages with an identical header and footer. Editing a
nav link by hand means editing it twelve times and getting it right twelve
times. The generator makes that one edit in one place, which is the same reason
a real site uses includes or a template engine.

The submitted sites are still plain HTML, CSS and JavaScript — the generator is
a writing tool, like a text editor with better find-and-replace, and nothing it
produces depends on it.

## Running one

```bash
python3 build_kestrel.py
```

Each script writes to a hard-coded `OUT` path near the top. Change that to
wherever you want the pages, or point it straight at the site's folder in
`MAC172 _WebDev 1/GroupProject/`.

| Script | Site | Pages |
|---|---|---|
| `build_threadco.py` | Thread & Co. — online shopping | 9 |
| `build_hudson.py` | Hudson Auto Rental — car rental | 9 |
| `build_bridgeview.py` | Bridgeview Public Library — library management | 9 |
| `build_meridian.py` | Meridian Credit Union — online banking | 10 |
| `build_kestrel.py` | Kestrel Air — airline reservation | 12 |

Each also writes an "artifact entry page": the home page with its document
wrapper stripped and `href="index.html"` rewritten to `href="./"`, which is what
gets published as a live demo link.

## Other files

- `readdocx.py` — pulls the text out of a `.docx` so an assignment handout can
  be read without opening Word.
- `demos-index.html` — the side-by-side comparison page for all six candidate
  topics, used to pick one for the group project.
