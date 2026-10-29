#!/usr/bin/env python3
"""Generates the nine Bridgeview Public Library pages with an identical header and footer."""
import os, re

OUT = "/home/claude/bridgeview"

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&'
    'family=IBM+Plex+Sans:wght@400;500;600&'
    'family=IBM+Plex+Mono:wght@400;500&display=swap">\n'
)

NAV = [
    ("index.html",    "Home"),
    ("catalog.html",  "Catalogue"),
    ("branches.html", "Branches"),
    ("policies.html", "Policies"),
    ("contact.html",  "Contact"),
    ("login.html",    "Sign in"),
    ("register.html", "Get a card"),
]


def header(current):
    links = ""
    for href, label in NAV:
        cls = ' class="current"' if href == current else ""
        links += '        <a href="%s"%s>%s</a>\n' % (href, cls, label)
    cls = ' class="loan-link current"' if current == "myloans.html" else ' class="loan-link"'
    links += ('        <a%s href="myloans.html">My loans '
              '<span class="loan-flag" id="loan-flag">0</span></a>\n' % cls)
    return (
        '  <header class="site-head">\n'
        '    <div class="wrap head-bar">\n'
        '      <a class="wordmark" href="index.html">\n'
        '        <span class="wm-name">Bridgeview</span>\n'
        '        <span class="wm-sub">Public Library</span>\n'
        '      </a>\n'
        '      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" '
        'aria-controls="mainnav">Menu</button>\n'
        '      <nav class="mainnav" id="mainnav" aria-label="Main navigation">\n'
        + links +
        '      </nav>\n'
        '    </div>\n'
        '  </header>\n'
    )


FOOTER = """  <footer class="site-foot">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <div class="foot-mark">Bridgeview Public Library</div>
          <p>Three branches in Queens. Free cards for every borough resident,
          and no fines for anyone under 18.</p>
        </div>
        <div>
          <h4>Borrow</h4>
          <ul>
            <li><a href="catalog.html">Search the catalogue</a></li>
            <li><a href="myloans.html">My loans</a></li>
            <li><a href="register.html">Get a library card</a></li>
            <li><a href="policies.html">Borrowing policies</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li><a href="branches.html">Branches &amp; hours</a></li>
            <li><a href="branches.html">Accessibility</a></li>
            <li><a href="contact.html">Contact a librarian</a></li>
          </ul>
        </div>
        <div>
          <h4>About</h4>
          <ul>
            <li><a href="policies.html">Fines &amp; fees</a></li>
            <li><a href="policies.html">Privacy of records</a></li>
            <li><a href="policies.html">Code of conduct</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy; 2026 Bridgeview Public Library &mdash; a student project for MAC172, LaGuardia Community College.</span>
        <span>Long Island City, New York</span>
      </div>
    </div>
  </footer>
"""


def page(filename, title, body, current=None, desc=""):
    current = current or filename
    html = (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '  <meta charset="utf-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '  <meta name="description" content="%s">\n'
        '  <title>%s | Bridgeview Public Library</title>\n' % (desc, title)
        + FONTS +
        '  <link rel="stylesheet" href="css/styles.css">\n'
        '</head>\n'
        '<body>\n'
        + header(current)
        + '\n  <main>\n' + body + '  </main>\n\n'
        + FOOTER +
        '\n  <script src="js/script.js"></script>\n'
        '</body>\n'
        '</html>\n'
    )
    with open(os.path.join(OUT, filename), "w", encoding="utf-8") as fh:
        fh.write(html)


# ----------------------------------------------------------------- home
home = """    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">Queens, New York &middot; Est. 1931</p>
          <h1>Borrow anything. Keep it three weeks.</h1>
          <p class="lede">Twelve thousand titles across three branches, a card that
          costs nothing, and a renewal you can do from this page at two in the morning.</p>

          <form id="quick-search" style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.3rem">
            <label class="visually-hidden" for="q-text">Search the catalogue</label>
            <input type="search" id="q-text" placeholder="Title, author or call number"
                   style="flex:1 1 240px">
            <button class="btn" type="submit">Search</button>
          </form>

          <div class="hero-actions">
            <a class="btn btn-outline" href="catalog.html">Browse the catalogue</a>
            <a class="btn btn-outline" href="register.html">Get a card</a>
          </div>
        </div>
        <div class="hero-stack" id="hero-stack"></div>
      </div>
    </section>

    <section class="wrap section">
      <p class="eyebrow">On the new shelf</p>
      <h2>Recently added</h2>
      <div class="shelf" id="home-shelf"></div>
      <p style="margin-top:1.6rem"><a class="btn btn-outline" href="catalog.html">See all twelve titles</a></p>
    </section>

    <section class="wrap section-tight">
      <h2>How borrowing works</h2>
      <div class="strip">
        <div class="strip-item">
          <h4>Three weeks per loan</h4>
          <p>Every item goes out for 21 days, counted from the day you borrow it.</p>
        </div>
        <div class="strip-item">
          <h4>Two renewals</h4>
          <p>Renew twice from My loans, 21 days each time, as long as nobody is waiting.</p>
        </div>
        <div class="strip-item">
          <h4>25&cent; a day late</h4>
          <p>Capped at $10 per item. Nothing is owed by borrowers under 18.</p>
        </div>
        <div class="strip-item">
          <h4>Holds on anything out</h4>
          <p>Place a hold and we will email you the day a copy is back on the shelf.</p>
        </div>
      </div>
    </section>
"""

# -------------------------------------------------------------- catalog
catalog = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Catalogue</p>
        <h1>The catalogue</h1>
        <p>Search by title, author or call number. Filter by subject, and hide anything already out.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="toolbar">
        <div>
          <span class="fld">Subject</span>
          <div class="filter-chips" role="group" aria-label="Filter by subject">
            <button type="button" class="chip" data-genre="All" aria-pressed="true">All</button>
            <button type="button" class="chip" data-genre="Fiction" aria-pressed="false">Fiction</button>
            <button type="button" class="chip" data-genre="History" aria-pressed="false">History</button>
            <button type="button" class="chip" data-genre="Science" aria-pressed="false">Science</button>
            <button type="button" class="chip" data-genre="Poetry" aria-pressed="false">Poetry</button>
            <button type="button" class="chip" data-genre="Biography" aria-pressed="false">Biography</button>
          </div>
        </div>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap;align-items:end">
          <div>
            <label class="fld" for="cat-search">Search</label>
            <input type="search" id="cat-search" placeholder="Morrison, 811.6&hellip;" style="min-width:180px">
          </div>
          <div>
            <label class="fld" for="cat-sort">Sort by</label>
            <select id="cat-sort">
              <option value="featured">Shelf order</option>
              <option value="title">Title, A&ndash;Z</option>
              <option value="author">Author, A&ndash;Z</option>
              <option value="year-desc">Newest first</option>
              <option value="year-asc">Oldest first</option>
            </select>
          </div>
          <label class="check" style="padding-bottom:.55rem">
            <input type="checkbox" id="cat-avail">
            <span>On the shelf only</span>
          </label>
        </div>
      </div>

      <p class="result-count" id="cat-count" aria-live="polite"></p>
      <div class="catalogue" id="catalogue"></div>
    </section>
"""

# ----------------------------------------------------------------- book
book = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="catalog.html">Catalogue</a> /
          <span id="bk-crumb">Title</span></p>
      </div>
    </section>

    <section class="wrap section" id="book-detail">
      <div class="split">
        <div>
          <div style="display:grid;grid-template-columns:180px 1fr;gap:2rem;align-items:start">
            <div id="bk-cover"></div>
            <div>
              <p class="eyebrow" id="bk-genre">Subject</p>
              <h1 id="bk-title" style="margin-bottom:.15rem">Title</h1>
              <p class="lede" id="bk-author" style="margin-bottom:1rem">Author</p>
              <p>Held at all three branches. Shelved by call number in the main reading
              room; ask at the desk if you cannot find it.</p>
            </div>
          </div>

          <hr class="rule">
          <h3>Other titles you might want</h3>
          <div class="shelf" id="bk-more"></div>
        </div>

        <aside class="panel">
          <h3>Availability</h3>
          <p style="margin-bottom:.9rem"><span id="bk-avail" class="badge badge-in">&mdash;</span></p>
          <div class="p-row"><span class="label">Call number</span><span id="bk-call">&mdash;</span></div>
          <div class="p-row"><span class="label">Published</span><span id="bk-year">&mdash;</span></div>
          <div class="p-row"><span class="label">Copies held</span><span id="bk-copies">&mdash;</span></div>
          <div class="p-row"><span class="label">Loan period</span><span>21 days</span></div>
          <div class="p-row"><span class="label">Due if borrowed today</span><span id="bk-wouldbe">&mdash;</span></div>

          <button class="btn btn-block" id="bk-action" type="button" style="margin-top:1rem">Borrow this title</button>
          <p class="alert" id="bk-msg" hidden style="margin-top:.9rem;margin-bottom:0"></p>
          <p class="p-note">Renew twice, 21 days each. Fines are 25&cent; a day after that.</p>
        </aside>
      </div>
    </section>
"""

# -------------------------------------------------------------- myloans
myloans = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / My loans</p>
        <h1>My loans</h1>
        <p>Everything currently out on your card, with due dates and anything owed.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <div>
          <p class="alert" id="ln-result" hidden></p>
          <div id="loan-list"></div>
        </div>

        <aside class="panel">
          <h3>Card summary</h3>
          <div class="p-row"><span class="label">Items out</span><span id="ln-count">0</span></div>
          <div class="p-row"><span class="label">Overdue</span><span id="ln-overdue">0</span></div>
          <div class="p-row"><span class="label">Fines owed</span><span id="ln-fines">$0.00</span></div>
          <p class="p-note" id="ln-note"></p>

          <hr class="rule" style="margin-block:1rem">
          <h3>Holds</h3>
          <div id="ln-holds"></div>
          <p class="p-note">Holds are filled in the order they were placed.</p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- branches
branches = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Branches</p>
        <h1>Branches &amp; hours</h1>
        <p>Three buildings in western Queens. Returns can go to any of them.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="branch-grid">
        <div class="branch">
          <div class="branch-head"><span class="code">MAIN</span><h4>Thomson Avenue</h4></div>
          <div class="branch-body">
            31-10 Thomson Avenue<br>Long Island City, NY 11101
            <dl>
              <dt>Mon&ndash;Thu</dt><dd>09:00 &ndash; 21:00</dd>
              <dt>Fri&ndash;Sat</dt><dd>10:00 &ndash; 18:00</dd>
              <dt>Sunday</dt><dd>12:00 &ndash; 17:00</dd>
            </dl>
          </div>
        </div>
        <div class="branch">
          <div class="branch-head"><span class="code">SUN</span><h4>Sunnyside</h4></div>
          <div class="branch-body">
            43-06 Greenpoint Avenue<br>Sunnyside, NY 11104
            <dl>
              <dt>Mon&ndash;Thu</dt><dd>10:00 &ndash; 19:00</dd>
              <dt>Fri&ndash;Sat</dt><dd>10:00 &ndash; 17:00</dd>
              <dt>Sunday</dt><dd>Closed</dd>
            </dl>
          </div>
        </div>
        <div class="branch">
          <div class="branch-head"><span class="code">AST</span><h4>Astoria</h4></div>
          <div class="branch-body">
            14-01 Astoria Boulevard<br>Astoria, NY 11102
            <dl>
              <dt>Mon&ndash;Thu</dt><dd>10:00 &ndash; 20:00</dd>
              <dt>Fri&ndash;Sat</dt><dd>10:00 &ndash; 17:00</dd>
              <dt>Sunday</dt><dd>Closed</dd>
            </dl>
          </div>
        </div>
      </div>

      <hr class="rule">
      <h2>What each branch has</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Branch</th><th>Study rooms</th><th>Public computers</th><th>Children's room</th><th>Step-free entry</th></tr></thead>
          <tbody>
            <tr><td>Thomson Avenue</td><td class="num">6</td><td class="num">24</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>Sunnyside</td><td class="num">2</td><td class="num">10</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>Astoria</td><td class="num">3</td><td class="num">14</td><td>No</td><td>Ramp on 14th Street</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Returns</h2>
      <p>Any item may be returned to any branch. The book drops outside Thomson Avenue
      and Astoria are open whenever the buildings are closed, and anything left in them
      overnight is checked in with the previous day's date.</p>
    </section>
"""

# ------------------------------------------------------------- register
register = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Get a card</p>
        <h1>Apply for a library card</h1>
        <p>Free to anyone living, working or studying in Queens.</p>
      </div>
    </section>

    <section class="wrap section">
      <form class="form-panel" id="register-form" novalidate>
        <p class="alert" id="reg-result" hidden></p>

        <div class="form-row">
          <div class="field">
            <label for="reg-first">First name</label>
            <input type="text" id="reg-first" autocomplete="given-name">
            <span class="error-text" id="reg-first-error"></span>
          </div>
          <div class="field">
            <label for="reg-last">Last name</label>
            <input type="text" id="reg-last" autocomplete="family-name">
            <span class="error-text" id="reg-last-error"></span>
          </div>
        </div>

        <div class="field">
          <label for="reg-email">Email address</label>
          <input type="email" id="reg-email" autocomplete="email" placeholder="you@example.com">
          <span class="error-text" id="reg-email-error"></span>
        </div>

        <div class="field">
          <label for="reg-addr">Home address</label>
          <input type="text" id="reg-addr" autocomplete="street-address">
          <span class="error-text" id="reg-addr-error"></span>
        </div>

        <div class="field">
          <label for="reg-zip">ZIP code
            <span class="hint">Free cards are issued on Queens ZIP codes, 11001 to 11697.</span>
          </label>
          <input type="text" id="reg-zip" autocomplete="postal-code" placeholder="11101" style="max-width:9rem">
          <span class="error-text" id="reg-zip-error"></span>
        </div>

        <div class="field">
          <label for="reg-pass">Password</label>
          <input type="password" id="reg-pass" autocomplete="new-password">
          <div class="meter" id="pass-meter" aria-hidden="true"><span></span></div>
          <span class="meter-label" id="pass-label">At least 8 characters, with a capital letter and a number.</span>
          <span class="error-text" id="reg-pass-error"></span>
        </div>

        <div class="field">
          <label for="reg-conf">Confirm password</label>
          <input type="password" id="reg-conf" autocomplete="new-password">
          <span class="error-text" id="reg-conf-error"></span>
        </div>

        <div class="field">
          <label class="check">
            <input type="checkbox" id="reg-terms">
            <span>I have read and accept the <a href="policies.html">borrowing rules</a>.</span>
          </label>
          <span class="error-text" id="reg-terms-error"></span>
        </div>

        <button class="btn btn-block" type="submit">Apply for a card</button>
        <p class="form-note">Already a member? <a href="login.html">Sign in instead</a>.</p>
      </form>
    </section>
"""

# ---------------------------------------------------------------- login
login = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Sign in</p>
        <h1>Sign in</h1>
        <p>Use the number printed on the back of your card.</p>
      </div>
    </section>

    <section class="wrap section">
      <form class="form-panel" id="login-form" novalidate>
        <p class="alert" id="log-result" hidden></p>
        <div class="field">
          <label for="log-card">Card number
            <span class="hint">Two letters and ten digits, for example BV0000000000.</span>
          </label>
          <input type="text" id="log-card" placeholder="BV0000000000">
          <span class="error-text" id="log-card-error"></span>
        </div>
        <div class="field">
          <label for="log-pin">PIN</label>
          <input type="password" id="log-pin" inputmode="numeric" maxlength="4" style="max-width:8rem">
          <span class="error-text" id="log-pin-error"></span>
        </div>
        <button class="btn btn-block" type="submit">Sign in</button>
        <p class="form-note">No card yet? <a href="register.html">Apply for one</a>.</p>
      </form>
    </section>
"""

# -------------------------------------------------------------- contact
contact = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Contact</p>
        <h1>Ask a librarian</h1>
        <p>Research help, a title we do not hold, or a problem with your card.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <form class="form-panel form-wide" id="contact-form" novalidate>
          <p class="alert" id="ct-result" hidden></p>
          <div class="form-row">
            <div class="field">
              <label for="ct-name">Your name</label>
              <input type="text" id="ct-name" autocomplete="name">
              <span class="error-text" id="ct-name-error"></span>
            </div>
            <div class="field">
              <label for="ct-email">Email address</label>
              <input type="email" id="ct-email" autocomplete="email">
              <span class="error-text" id="ct-email-error"></span>
            </div>
          </div>
          <div class="field">
            <label for="ct-topic">Subject</label>
            <select id="ct-topic">
              <option value="">Choose one&hellip;</option>
              <option>Research help</option>
              <option>Suggest a purchase</option>
              <option>Interlibrary loan request</option>
              <option>Problem with my card</option>
              <option>Fines or fees</option>
              <option>Something else</option>
            </select>
            <span class="error-text" id="ct-topic-error"></span>
          </div>
          <div class="field">
            <label for="ct-msg">Message</label>
            <textarea id="ct-msg" maxlength="600"></textarea>
            <span class="meter-label" id="ct-count">0 / 600 characters</span>
            <span class="error-text" id="ct-msg-error"></span>
          </div>
          <button class="btn" type="submit">Send message</button>
        </form>

        <aside class="panel">
          <h3>Reference desk</h3>
          <div class="p-row"><span class="label">Phone</span><span>(718) 555-0132</span></div>
          <div class="p-row"><span class="label">Mon&ndash;Thu</span><span>09:00 &ndash; 21:00</span></div>
          <div class="p-row"><span class="label">Fri&ndash;Sat</span><span>10:00 &ndash; 18:00</span></div>
          <div class="p-row"><span class="label">Sunday</span><span>12:00 &ndash; 17:00</span></div>
          <hr class="rule" style="margin-block:1rem">
          <h3>Interlibrary loan</h3>
          <p style="font-size:.88rem;color:var(--ink-soft);margin:0">
            If we do not hold a title, we can usually borrow it from another New York
            system within ten days. There is no charge.</p>
          <p class="p-note">Messages are answered within two business days.</p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- policies
policies = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Policies</p>
        <h1>Borrowing policies</h1>
        <p>Last updated 19 October 2026.</p>
      </div>
    </section>

    <section class="wrap section prose">
      <p class="lede">These rules apply to every card. They are written plainly on
      purpose. If something here is unclear, <a href="contact.html">ask a librarian</a>.</p>

      <h2>1. Getting a card</h2>
      <p>Cards are free to anyone who lives, works or studies in Queens. Bring photo
      identification and something showing your address to any branch. Cards for
      borrowers under 18 need a parent or guardian signature and carry no fines.</p>

      <h2>2. Loan periods and limits</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Item</th><th>Loan period</th><th>Renewals</th><th>Limit per card</th></tr></thead>
          <tbody>
            <tr><td>Books</td><td class="num">21 days</td><td class="num">2</td><td class="num">30</td></tr>
            <tr><td>Audiobooks</td><td class="num">21 days</td><td class="num">2</td><td class="num">10</td></tr>
            <tr><td>DVDs and Blu-ray</td><td class="num">7 days</td><td class="num">1</td><td class="num">6</td></tr>
            <tr><td>New releases</td><td class="num">14 days</td><td class="num">0</td><td class="num">3</td></tr>
            <tr><td>Reference</td><td>In library only</td><td>&mdash;</td><td>&mdash;</td></tr>
          </tbody>
        </table>
      </div>

      <h2>3. Renewals</h2>
      <p>Renew from <a href="myloans.html">My loans</a> at any hour. A renewal runs 21
      days from the day you renew, not from the old due date, so renewing early costs
      you nothing. An item cannot be renewed once somebody has placed a hold on it.</p>

      <h2>4. Fines</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Situation</th><th>Charge</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Item returned late</td><td class="num">$0.25 / day</td><td>Capped at $10.00 per item</td></tr>
            <tr><td>Borrower under 18</td><td class="num">$0.00</td><td>No fines on youth cards</td></tr>
            <tr><td>Item lost or unreturned after 60 days</td><td>Replacement cost</td><td>Plus a $5.00 processing fee</td></tr>
            <tr><td>Damaged beyond repair</td><td>Replacement cost</td><td>Assessed at the desk</td></tr>
            <tr><td>Replacement card</td><td class="num">$2.00</td><td>First replacement free</td></tr>
          </tbody>
        </table>
      </div>
      <p>Borrowing is suspended once a card owes more than $15. Paying the balance
      restores it the same day.</p>

      <h2>5. Holds</h2>
      <ul>
        <li>Place a hold on anything currently out. There is no charge.</li>
        <li>Holds are filled in the order they were placed.</li>
        <li>We email you when a copy arrives, and hold it at the desk for seven days.</li>
        <li>A hold not collected within seven days goes to the next person waiting.</li>
      </ul>

      <h2>6. Privacy of records</h2>
      <p>Under New York Civil Practice Law and Rules &sect; 4509, library records
      identifying what a person borrowed are confidential. We do not disclose them
      except on a court order. Loan history is deleted once an item is returned and
      any fine is settled.</p>

      <h2>7. Code of conduct</h2>
      <p>Branches are shared space. We ask for quiet in the reading rooms, no food at
      the computers, and that children under eight stay with an adult.</p>

      <hr class="rule">
      <p style="font-size:.88rem;color:var(--ink-faint)">
        Bridgeview Public Library is a fictional institution built as coursework for
        MAC172 Web Development I at LaGuardia Community College. No real cards are
        issued and no personal information is collected or transmitted.</p>
    </section>
"""

pages = [
    ("index.html",    "Borrow anything", home,
     "Search the catalogue, borrow for three weeks, renew online."),
    ("catalog.html",  "Catalogue", catalog,
     "Search twelve titles by title, author, call number or subject."),
    ("book.html",     "Title", book,
     "Availability, call number and borrowing for one title."),
    ("myloans.html",  "My loans", myloans,
     "Due dates, renewals and fines on your card."),
    ("branches.html", "Branches & hours", branches,
     "Three branches in western Queens, with hours and facilities."),
    ("register.html", "Get a library card", register,
     "Apply for a free Bridgeview library card."),
    ("login.html",    "Sign in", login,
     "Sign in with your card number and PIN."),
    ("contact.html",  "Ask a librarian", contact,
     "Research help, purchase suggestions and interlibrary loans."),
    ("policies.html", "Borrowing policies", policies,
     "Loan periods, renewals, fines, holds and privacy."),
]

os.makedirs(OUT, exist_ok=True)
for fn, title, body, desc in pages:
    page(fn, title, body, current=fn, desc=desc)
    print("wrote", fn)

# ---- artifact entry page: the home page without the document wrapper ----
with open(os.path.join(OUT, "index.html"), encoding="utf-8") as fh:
    src = fh.read()

title_tag = re.search(r"<title>.*?</title>", src, re.S).group(0)
fonts = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', src))
body_inner = re.search(r"<body>(.*)</body>", src, re.S).group(1)

artifact = (
    title_tag + "\n"
    + '<meta name="claude:viewport-fit-sides" content="cover">\n'
    + fonts + "\n"
    + body_inner.strip().replace('href="index.html"', 'href="./"') + "\n"
)
with open("/home/claude/bridgeview-artifact-index.html", "w", encoding="utf-8") as fh:
    fh.write(artifact)
print("wrote artifact entry page")
