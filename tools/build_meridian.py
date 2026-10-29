#!/usr/bin/env python3
"""Generates the ten Meridian Credit Union pages with an identical header and footer."""
import os, re

OUT = "/home/claude/meridian"

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Plus+Jakarta+Sans:wght@600;700;800&'
    'family=Source+Sans+3:wght@400;500;600&'
    'family=Roboto+Mono:wght@400;500&display=swap">\n'
)

NAV = [
    ("index.html",     "Home"),
    ("dashboard.html", "Accounts"),
    ("transfer.html",  "Transfer"),
    ("billpay.html",   "Bill pay"),
    ("loans.html",     "Loans"),
    ("contact.html",   "Contact"),
    ("login.html",     "Sign in"),
]


def header(current):
    links = ""
    for href, label in NAV:
        cls = ' class="current"' if href == current else ""
        links += '        <a href="%s"%s>%s</a>\n' % (href, cls, label)
    links += '        <a class="btn btn-sm" href="register.html">Open an account</a>\n'
    return (
        '  <header class="site-head">\n'
        '    <div class="wrap head-bar">\n'
        '      <a class="wordmark" href="index.html">\n'
        '        <span class="wm-dot" aria-hidden="true">M</span>\n'
        '        <span class="wm-name">Meridian</span>\n'
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
          <div class="foot-mark">Meridian Credit Union</div>
          <p>A not-for-profit cooperative owned by its members, serving Queens
          and Brooklyn since 1954.</p>
          <p style="margin-top:.8rem"><span class="ncua">Federally insured by NCUA</span></p>
        </div>
        <div>
          <h4>Bank</h4>
          <ul>
            <li><a href="dashboard.html">Your accounts</a></li>
            <li><a href="transfer.html">Transfer money</a></li>
            <li><a href="billpay.html">Pay a bill</a></li>
            <li><a href="loans.html">Loan calculator</a></li>
          </ul>
        </div>
        <div>
          <h4>Join</h4>
          <ul>
            <li><a href="register.html">Open an account</a></li>
            <li><a href="login.html">Sign in</a></li>
            <li><a href="contact.html">Contact us</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="terms.html">Membership agreement</a></li>
            <li><a href="terms.html">Fee schedule</a></li>
            <li><a href="terms.html">Privacy &amp; security</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy; 2026 Meridian Credit Union &mdash; a student project for MAC172, LaGuardia Community College.</span>
        <span>Routing 226078XXX</span>
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
        '  <title>%s | Meridian Credit Union</title>\n' % (desc, title)
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
          <p class="eyebrow">Member-owned since 1954</p>
          <h1>Banking that answers to you, not shareholders.</h1>
          <p class="lede">No monthly fee, no minimum balance, and every surplus we make
          comes back as a better rate. Open an account in about seven minutes.</p>
          <div class="hero-actions">
            <a class="btn" href="register.html">Open an account</a>
            <a class="btn btn-outline" href="loans.html"
               style="color:#fff;border-color:#4a4f74">Try the loan calculator</a>
          </div>
        </div>
        <div class="plastic" aria-hidden="true">
          <div class="chip"></div>
          <div class="pan">4417&nbsp; 8290&nbsp; 1134&nbsp; 0062</div>
          <div class="prow">
            <span class="pname">J. Paulino</span>
            <span class="pname">09 / 30</span>
          </div>
        </div>
      </div>
    </section>

    <section class="wrap section">
      <h2>Today&rsquo;s rates</h2>
      <div class="prod-grid">
        <div class="prod">
          <div class="rate">4.35<small>% APY</small></div>
          <h4>Share Savings</h4>
          <p>Compounded daily, paid monthly. No minimum.</p>
          <a class="btn btn-sm btn-outline" href="register.html">Open one</a>
        </div>
        <div class="prod">
          <div class="rate">6.49<small>% APR</small></div>
          <h4>New auto loan</h4>
          <p>Up to 72 months on vehicles under three years old.</p>
          <a class="btn btn-sm btn-outline" href="loans.html">Calculate a payment</a>
        </div>
        <div class="prod">
          <div class="rate">6.25<small>% APR</small></div>
          <h4>30-year mortgage</h4>
          <p>Fixed for the full term, no prepayment penalty.</p>
          <a class="btn btn-sm btn-outline" href="loans.html">Calculate a payment</a>
        </div>
        <div class="prod">
          <div class="rate">0.00<small>/month</small></div>
          <h4>Everyday Checking</h4>
          <p>No monthly fee and no minimum balance, ever.</p>
          <a class="btn btn-sm btn-outline" href="register.html">Open one</a>
        </div>
      </div>
    </section>

    <section class="wrap section-tight">
      <h2>What members get</h2>
      <div class="strip">
        <div class="strip-item">
          <h4>Surplus returned</h4>
          <p>We are not-for-profit. What is left at year end goes back into rates.</p>
        </div>
        <div class="strip-item">
          <h4>55,000 free ATMs</h4>
          <p>Through the CO-OP network, including most bodega and pharmacy machines.</p>
        </div>
        <div class="strip-item">
          <h4>Insured to $250,000</h4>
          <p>Every account is federally insured by the NCUA, per depositor.</p>
        </div>
        <div class="strip-item">
          <h4>A person on the phone</h4>
          <p>Member services answers in Long Island City, not an overseas queue.</p>
        </div>
      </div>
    </section>
"""

# ------------------------------------------------------------ dashboard
dashboard = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Accounts</p>
        <h1>Good afternoon</h1>
        <p>Everything on your membership, as of today.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="acct-grid" id="acct-grid"></div>

      <div class="two-up" style="margin-top:1.6rem">
        <div class="card">
          <h3>Spending by category</h3>
          <p style="font-size:.88rem;color:var(--ink-soft);margin-bottom:.8rem">
            Money out over the last 30 days, largest first.</p>
          <div class="chart" id="spend-chart"></div>
          <p class="chart-foot" id="spend-foot"></p>
        </div>

        <div class="card">
          <h3>Recent activity</h3>
          <ul class="txn-list" id="recent-txns"></ul>
          <p style="margin:1rem 0 0"><a class="btn btn-sm btn-outline" href="account.html">See all transactions</a></p>
        </div>
      </div>

      <div class="card" style="margin-top:1.6rem">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
          <h3 style="margin:0">Net position</h3>
          <span class="mono" id="net-worth" style="font-size:1.6rem;font-weight:500">$0.00</span>
        </div>
        <p style="font-size:.86rem;color:var(--ink-soft);margin:.5rem 0 0">
          Deposits less what is owed on the card. Loans held elsewhere are not counted.</p>
      </div>
    </section>
"""

# -------------------------------------------------------------- account
account = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="dashboard.html">Accounts</a> /
          <span id="ac-crumb">Account</span></p>
        <h1 id="ac-name">Account</h1>
        <p class="mono" id="ac-num">&mdash;</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.8rem;margin-bottom:1.2rem">
            <div>
              <label class="fld" for="ac-search">Search</label>
              <input type="search" id="ac-search" placeholder="Con Edison&hellip;">
            </div>
            <div>
              <label class="fld" for="ac-cat">Category</label>
              <select id="ac-cat"></select>
            </div>
            <div>
              <label class="fld" for="ac-from">Since</label>
              <input type="date" id="ac-from">
            </div>
          </div>

          <p class="mono" id="ac-count" style="font-size:.78rem;color:var(--ink-faint)" aria-live="polite"></p>
          <ul class="txn-list" id="acct-txns"></ul>
        </div>

        <aside class="card sticky">
          <h3>Balance</h3>
          <div class="abal mono" id="ac-balance" style="font-size:1.9rem">$0.00</div>
          <div class="ameta" id="ac-kind" style="font-size:.8rem;color:var(--ink-faint)">&mdash;</div>

          <hr class="rule" style="margin-block:1.1rem">
          <h3 style="font-size:1rem">Shown above</h3>
          <div class="p-row"><span class="label">Money in</span><span id="ac-in">$0.00</span></div>
          <div class="p-row"><span class="label">Money out</span><span id="ac-out">$0.00</span></div>
          <div class="p-row"><span class="label">Net</span><span id="ac-net">$0.00</span></div>

          <hr class="rule" style="margin-block:1.1rem">
          <label class="fld" for="ac-switch">Switch account</label>
          <select id="ac-switch"></select>
          <p class="p-note">Statements are produced on the first of each month.</p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- transfer
transfer = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Transfer</p>
        <h1>Transfer money</h1>
        <p>Between your own accounts, instantly and at no charge.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <form class="card" id="transfer-form" novalidate>
          <p class="alert" id="tf-result" hidden></p>

          <div class="form-row">
            <div class="field">
              <label for="tf-from">From</label>
              <select id="tf-from"></select>
              <span class="hint">Balance <span class="mono" id="tf-from-bal">$0.00</span></span>
            </div>
            <div class="field">
              <label for="tf-to">To</label>
              <select id="tf-to"></select>
              <span class="hint">Balance <span class="mono" id="tf-to-bal">$0.00</span></span>
            </div>
          </div>

          <div class="field">
            <label for="tf-amt">Amount</label>
            <input type="number" id="tf-amt" min="0" step="0.01" value="250.00" style="max-width:12rem">
            <span class="hint">Transfers between your own accounts clear immediately.</span>
          </div>

          <button class="btn" type="submit">Transfer</button>
        </form>

        <aside class="card sticky">
          <h3>Recent transfers</h3>
          <ul class="txn-list" id="tf-history"></ul>
          <p class="p-note">Transfers to another institution take one to three business days
          and go through the ACH network.</p>
        </aside>
      </div>
    </section>
"""

# -------------------------------------------------------------- billpay
billpay = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Bill pay</p>
        <h1>Pay a bill</h1>
        <p>Pay today or schedule it. Nothing leaves your account before the date you set.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <div>
          <div class="card">
            <h3 style="margin-top:0">Your payees</h3>
            <ul class="payees" id="payee-list"></ul>
          </div>

          <form class="card" id="bill-form" novalidate style="margin-top:1.2rem">
            <h3 style="margin-top:0">Make a payment</h3>
            <p class="alert" id="bp-result" hidden></p>

            <div class="form-row">
              <div class="field">
                <label for="bp-payee">Payee</label>
                <select id="bp-payee"></select>
              </div>
              <div class="field">
                <label for="bp-from">Pay from</label>
                <select id="bp-from"></select>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="bp-amt">Amount</label>
                <input type="number" id="bp-amt" min="0" step="0.01">
              </div>
              <div class="field">
                <label for="bp-date">Payment date</label>
                <input type="date" id="bp-date">
                <span class="hint">Today's date pays now. A later date schedules it.</span>
              </div>
            </div>

            <button class="btn" type="submit">Submit payment</button>
          </form>
        </div>

        <aside class="card sticky">
          <h3>Scheduled</h3>
          <ul class="scheduled" id="bp-scheduled"></ul>
          <p class="p-note">Scheduled payments can be cancelled up to 5pm on the
          business day before they are due.</p>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- loans
loans = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Loans</p>
        <h1>Loan calculator</h1>
        <p>What a loan actually costs, month by month and over its whole life.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <div>
          <form class="card" id="loan-form" novalidate>
            <p class="alert" id="ln-warn" hidden></p>

            <div class="field">
              <label for="ln-kind">What are you borrowing for?</label>
              <select id="ln-kind"></select>
            </div>

            <div class="form-row">
              <div class="field">
                <label for="ln-amount">Amount</label>
                <input type="number" id="ln-amount" step="500">
              </div>
              <div class="field">
                <label for="ln-years">Term in years</label>
                <input type="number" id="ln-years" min="1" max="40" step="1">
              </div>
            </div>

            <div class="field">
              <label for="ln-apr">Interest rate (APR)
                <span class="hint">Pre-filled with our posted rate. Change it to compare.</span>
              </label>
              <input type="number" id="ln-apr" min="0" max="30" step="0.01" style="max-width:9rem">
            </div>
          </form>

          <div class="card" style="margin-top:1.2rem">
            <h3 style="margin-top:0">First year of payments</h3>
            <p style="font-size:.88rem;color:var(--ink-soft)">
              Early payments are mostly interest. This is where that shows.</p>
            <div class="table-wrap">
              <table class="data">
                <thead>
                  <tr><th>#</th><th style="text-align:right">Payment</th>
                      <th style="text-align:right">Interest</th>
                      <th style="text-align:right">Principal</th>
                      <th style="text-align:right">Balance</th></tr>
                </thead>
                <tbody id="ln-schedule"></tbody>
              </table>
            </div>
          </div>
        </div>

        <aside class="card sticky">
          <h3>Your payment</h3>
          <div class="mono" id="ln-monthly"
               style="font-size:2.3rem;font-weight:500;color:var(--mint-deep);line-height:1">$0.00</div>
          <div style="font-size:.82rem;color:var(--ink-faint);margin-top:.2rem">
            per month for <span id="ln-n">0 payments</span></div>

          <hr class="rule" style="margin-block:1.1rem">
          <div class="p-row"><span class="label">Amount borrowed</span><span id="ln-principal">$0.00</span></div>
          <div class="p-row"><span class="label">Interest paid</span><span id="ln-interest">$0.00</span></div>
          <div class="p-row p-total"><span class="label" style="font-family:var(--font-body)">Total repaid</span><span id="ln-total">$0.00</span></div>
          <p class="p-note" id="ln-share"></p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- register
register = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Open an account</p>
        <h1>Open an account</h1>
        <p>Membership is open to anyone living, working or studying in Queens or Brooklyn.</p>
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

        <div class="form-row">
          <div class="field">
            <label for="reg-email">Email address</label>
            <input type="email" id="reg-email" autocomplete="email" placeholder="you@example.com">
            <span class="error-text" id="reg-email-error"></span>
          </div>
          <div class="field">
            <label for="reg-phone">Phone</label>
            <input type="tel" id="reg-phone" autocomplete="tel" placeholder="(718) 555-0147">
            <span class="error-text" id="reg-phone-error"></span>
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="reg-dob">Date of birth
              <span class="hint">You must be 18 to open an account on your own.</span>
            </label>
            <input type="date" id="reg-dob">
            <span class="error-text" id="reg-dob-error"></span>
          </div>
          <div class="field">
            <label for="reg-zip">ZIP code</label>
            <input type="text" id="reg-zip" autocomplete="postal-code" placeholder="11101">
            <span class="error-text" id="reg-zip-error"></span>
          </div>
        </div>

        <div class="field">
          <label for="reg-ssn">Last four of your Social Security number
            <span class="hint">Four digits only. A real application would never take the
            whole number through a form like this.</span>
          </label>
          <input type="text" id="reg-ssn" inputmode="numeric" maxlength="4" style="max-width:8rem">
          <span class="error-text" id="reg-ssn-error"></span>
        </div>

        <div class="field">
          <label for="reg-pass">Password</label>
          <input type="password" id="reg-pass" autocomplete="new-password">
          <div class="meter" id="pass-meter" aria-hidden="true"><span></span></div>
          <span class="meter-label" id="pass-label">Banking passwords need 10 characters, a capital, a number and a symbol.</span>
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
            <span>I have read and accept the <a href="terms.html">membership agreement</a>
            and fee schedule.</span>
          </label>
          <span class="error-text" id="reg-terms-error"></span>
        </div>

        <button class="btn btn-block" type="submit">Open my account</button>
        <p class="form-note">Already a member? <a href="login.html">Sign in instead</a>.</p>
      </form>
    </section>
"""

# ---------------------------------------------------------------- login
login = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Sign in</p>
        <h1>Sign in</h1>
        <p>Use the member number on your statement.</p>
      </div>
    </section>

    <section class="wrap section">
      <form class="form-panel" id="login-form" novalidate>
        <p class="alert" id="log-result" hidden></p>
        <div class="field">
          <label for="log-member">Member number
            <span class="hint">Two letters and eight digits, for example MC00000000.</span>
          </label>
          <input type="text" id="log-member" placeholder="MC00000000">
          <span class="error-text" id="log-member-error"></span>
        </div>
        <div class="field">
          <label for="log-pass">Password</label>
          <input type="password" id="log-pass" autocomplete="current-password">
          <span class="error-text" id="log-pass-error"></span>
        </div>
        <div class="field">
          <label class="check">
            <input type="checkbox" id="log-trust">
            <span>Trust this device for 30 days</span>
          </label>
        </div>
        <button class="btn btn-block" type="submit">Sign in</button>
        <p class="form-note">Not a member yet? <a href="register.html">Open an account</a>.</p>
      </form>
    </section>
"""

# -------------------------------------------------------------- contact
contact = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Contact</p>
        <h1>Member services</h1>
        <p>A question about an account, a charge you do not recognise, or a loan application.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="split">
        <form class="card" id="contact-form" novalidate>
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
              <option>Question about a transaction</option>
              <option>Report a lost or stolen card</option>
              <option>Dispute a charge</option>
              <option>Loan application</option>
              <option>Update my details</option>
              <option>Something else</option>
            </select>
            <span class="error-text" id="ct-topic-error"></span>
          </div>
          <div class="field">
            <label for="ct-msg">Message
              <span class="hint">Never include your full account number or password.</span>
            </label>
            <textarea id="ct-msg" maxlength="600"></textarea>
            <span class="meter-label" id="ct-count">0 / 600 characters</span>
            <span class="error-text" id="ct-msg-error"></span>
          </div>
          <button class="btn" type="submit">Send message</button>
        </form>

        <aside class="card sticky">
          <h3>Call us</h3>
          <div class="p-row"><span class="label">Member services</span><span>(718) 555-0160</span></div>
          <div class="p-row"><span class="label">Mon&ndash;Fri</span><span>08:00 &ndash; 19:00</span></div>
          <div class="p-row"><span class="label">Saturday</span><span>09:00 &ndash; 14:00</span></div>

          <hr class="rule" style="margin-block:1.1rem">
          <h3 style="font-size:1rem">Lost or stolen card</h3>
          <div class="p-row"><span class="label">24 hours</span><span>(800) 555-0191</span></div>
          <p class="p-note">Report it immediately. Under Regulation E your liability is
          capped at $50 if you report within two business days.</p>

          <hr class="rule" style="margin-block:1.1rem">
          <h3 style="font-size:1rem">Branch</h3>
          <p style="font-size:.88rem;color:var(--ink-soft);margin:0">
            31-10 Thomson Avenue<br>Long Island City, NY 11101</p>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- terms
terms = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Membership agreement</p>
        <h1>Membership agreement</h1>
        <p>Last updated 19 October 2026.</p>
      </div>
    </section>

    <section class="wrap section prose">
      <p class="lede">This agreement covers every Meridian account. It is written plainly
      on purpose. If anything here is unclear, <a href="contact.html">ask us</a> before
      you open an account.</p>

      <h2>1. Membership</h2>
      <p>Meridian is a not-for-profit cooperative. Opening an account makes you an owner,
      not a customer: you hold one vote at the annual meeting regardless of your balance.
      Membership is open to anyone who lives, works or studies in Queens or Brooklyn, and
      to their immediate family.</p>

      <h2>2. Your deposits are insured</h2>
      <p>Accounts are federally insured by the National Credit Union Administration to at
      least $250,000 per depositor, per ownership category. That insurance is backed by
      the full faith and credit of the United States Government.</p>

      <h2>3. Fee schedule</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Service</th><th style="text-align:right">Fee</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Everyday Checking, monthly</td><td class="num">$0.00</td><td>No minimum balance</td></tr>
            <tr><td>Share Savings, monthly</td><td class="num">$0.00</td><td>$5 opening deposit</td></tr>
            <tr><td>ATM withdrawal, CO-OP network</td><td class="num">$0.00</td><td>55,000 machines</td></tr>
            <tr><td>ATM withdrawal, out of network</td><td class="num">$1.50</td><td>Plus the operator's own fee</td></tr>
            <tr><td>Overdraft, per item</td><td class="num">$25.00</td><td>Maximum three per day</td></tr>
            <tr><td>Returned deposit item</td><td class="num">$12.00</td><td>&mdash;</td></tr>
            <tr><td>Stop payment</td><td class="num">$20.00</td><td>&mdash;</td></tr>
            <tr><td>Outgoing domestic wire</td><td class="num">$20.00</td><td>Same business day before 3pm</td></tr>
            <tr><td>Replacement debit card</td><td class="num">$5.00</td><td>First replacement free</td></tr>
          </tbody>
        </table>
      </div>

      <h2>4. Rates</h2>
      <p>Deposit rates are variable and may change at any time at the discretion of the
      board. Loan rates quoted on this site are the rates available to members with
      strong credit; your rate is set when the application is approved.</p>

      <h2>5. Transfers and payments</h2>
      <ul>
        <li>Transfers between your own Meridian accounts clear immediately.</li>
        <li>ACH transfers to another institution take one to three business days.</li>
        <li>Scheduled bill payments can be cancelled until 5pm the business day before.</li>
        <li>We may decline a payment that would overdraw an account.</li>
      </ul>

      <h2>6. Unauthorised transactions</h2>
      <p>Tell us at once if you believe your card or password has been used without your
      permission. Under Regulation E, if you report a lost or stolen card within two
      business days your liability is capped at $50. After that it can rise to $500, and
      after sixty days from the statement date it may be unlimited.</p>

      <h2>7. Privacy and security</h2>
      <p>We collect the information needed to operate your accounts and meet our
      obligations under the Bank Secrecy Act, and nothing beyond it. We do not sell member
      information. We will never ask for your full password, your PIN, or a one-time code
      by phone, email or text. If someone does, it is not us.</p>

      <h2>8. Closing an account</h2>
      <p>You may close any account at any time with no fee. Any balance is returned by
      cheque or transfer within five business days.</p>

      <h2>9. Governing law</h2>
      <p>This agreement is governed by the laws of the State of New York and the Federal
      Credit Union Act.</p>

      <hr class="rule">
      <p style="font-size:.88rem;color:var(--ink-faint)">
        Meridian Credit Union is a fictional institution built as coursework for MAC172
        Web Development I at LaGuardia Community College. No real accounts are opened, no
        money moves, and no personal or financial information is collected or transmitted.
        The balances shown are sample data stored only in your own browser.</p>
    </section>
"""

pages = [
    ("index.html",     "Member-owned banking", home,
     "A not-for-profit credit union serving Queens and Brooklyn."),
    ("dashboard.html", "Your accounts", dashboard,
     "Balances, recent activity and spending by category."),
    ("account.html",   "Account activity", account,
     "Search and filter the transactions on one account."),
    ("transfer.html",  "Transfer money", transfer,
     "Move money between your own accounts instantly."),
    ("billpay.html",   "Bill pay", billpay,
     "Pay a bill today or schedule it for later."),
    ("loans.html",     "Loan calculator", loans,
     "Monthly payment, total interest and a first-year schedule."),
    ("register.html",  "Open an account", register,
     "Open a Meridian Credit Union account."),
    ("login.html",     "Sign in", login,
     "Sign in with your member number."),
    ("contact.html",   "Member services", contact,
     "Call, write, or report a lost card."),
    ("terms.html",     "Membership agreement", terms,
     "Membership, fees, transfers, liability and privacy."),
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
with open("/home/claude/meridian-artifact-index.html", "w", encoding="utf-8") as fh:
    fh.write(artifact)
print("wrote artifact entry page")
