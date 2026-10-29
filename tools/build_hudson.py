#!/usr/bin/env python3
"""Generates the nine Hudson Auto Rental pages with an identical header and footer."""
import os, re

OUT = "/home/claude/hudson"

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&'
    'family=IBM+Plex+Mono:wght@400;500&display=swap">\n'
)

NAV = [
    ("index.html",     "Home"),
    ("fleet.html",     "Fleet"),
    ("locations.html", "Locations"),
    ("contact.html",   "Contact"),
    ("login.html",     "Sign in"),
    ("register.html",  "Register"),
]


def header(current):
    links = ""
    for href, label in NAV:
        cls = ' class="current"' if href == current else ""
        links += '        <a href="%s"%s>%s</a>\n' % (href, cls, label)
    cls = ' class="quote-link current"' if current == "booking.html" else ' class="quote-link"'
    links += ('        <a%s href="booking.html">Booking '
              '<span class="quote-flag is-empty" id="quote-flag">0</span></a>\n' % cls)
    return (
        '  <header class="site-head">\n'
        '    <div class="wrap head-bar">\n'
        '      <a class="wordmark" href="index.html">Hudson<em>&middot;</em>Auto Rental</a>\n'
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
          <div class="foot-mark">Hudson<em>&middot;</em>Auto Rental</div>
          <p>Cars, vans and SUVs across five New York locations. Open every day,
          airport counters open late.</p>
        </div>
        <div>
          <h4>Rent</h4>
          <ul>
            <li><a href="fleet.html">The fleet</a></li>
            <li><a href="locations.html">Locations</a></li>
            <li><a href="booking.html">Your booking</a></li>
            <li><a href="terms.html">Rates &amp; fees</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><a href="register.html">Create an account</a></li>
            <li><a href="login.html">Sign in</a></li>
            <li><a href="contact.html">Contact us</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="terms.html">Rental terms</a></li>
            <li><a href="terms.html">Insurance</a></li>
            <li><a href="terms.html">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy; 2026 Hudson Auto Rental &mdash; a student project for MAC172, LaGuardia Community College.</span>
        <span>Long Island City, New York</span>
      </div>
    </div>
  </footer>
"""

SEARCHBAR = """      <form class="searchbar" id="search-form" novalidate>
        <h3>Find a vehicle</h3>
        <p class="alert" id="s-msg" hidden></p>
        <div class="search-grid">
          <div>
            <label class="fld" for="s-loc">Pick-up location</label>
            <select id="s-loc"></select>
          </div>
          <div>
            <label class="fld" for="s-pick">Pick-up date</label>
            <input type="date" id="s-pick">
          </div>
          <div>
            <label class="fld" for="s-drop">Return date</label>
            <input type="date" id="s-drop">
          </div>
          <div>
            <label class="fld" for="s-age">Driver age</label>
            <input type="number" id="s-age" min="18" max="99" value="30">
          </div>
          <button class="btn" type="submit">Search</button>
        </div>
      </form>
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
        '  <title>%s | Hudson Auto Rental</title>\n' % (desc, title)
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
    return filename


# ----------------------------------------------------------------- home
home = """    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">Five New York locations</p>
        <h1>Keys in ten<br>minutes flat.</h1>
        <p class="lede">Airport counters at LaGuardia and JFK, three more around the
        city. No queue, no upsell at the desk, and the price you see here is the price
        you pay.</p>
      </div>
    </section>

    <div class="wrap">
""" + SEARCHBAR + """    </div>

    <section class="wrap section">
      <h2>Popular right now</h2>
      <div class="fleet-list" id="home-fleet"></div>
      <p style="margin-top:1.4rem"><a class="btn btn-outline" href="fleet.html">See the whole fleet</a></p>
    </section>

    <section class="wrap section-tight">
      <h2>How it works</h2>
      <div class="strip">
        <div class="strip-item">
          <span class="n">STEP 01</span>
          <h4>Pick your dates</h4>
          <p>Rates are per day. The total updates the moment you change a date.</p>
        </div>
        <div class="strip-item">
          <span class="n">STEP 02</span>
          <h4>Choose a vehicle</h4>
          <p>Ten vehicles across six classes, from a Kia Rio to a 12-seat Transit.</p>
        </div>
        <div class="strip-item">
          <span class="n">STEP 03</span>
          <h4>Add what you need</h4>
          <p>Damage waiver, GPS, child seat, extra driver, unlimited mileage.</p>
        </div>
        <div class="strip-item">
          <span class="n">STEP 04</span>
          <h4>Collect the keys</h4>
          <p>Bring your licence and the confirmation number. That is the whole desk visit.</p>
        </div>
      </div>
    </section>

    <section class="wrap section-tight">
      <div class="strip">
        <div class="strip-item">
          <h4>Free cancellation</h4>
          <p>Up to 24 hours before pick-up, no questions and no fee.</p>
        </div>
        <div class="strip-item">
          <h4>Fuel-neutral returns</h4>
          <p>Bring it back at the level you took it. No refuelling markup.</p>
        </div>
        <div class="strip-item">
          <h4>Drivers 21 and over</h4>
          <p>A $25 per day surcharge applies to drivers aged 21 to 24.</p>
        </div>
      </div>
    </section>
"""

# ---------------------------------------------------------------- fleet
fleet = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Fleet</p>
        <h1>The fleet</h1>
        <p id="fleet-summary">Loading your search&hellip;</p>
      </div>
    </section>

    <div class="wrap" style="padding-top:1.5rem">
""" + SEARCHBAR.replace('margin-top:-4.5rem', '') + """    </div>

    <section class="wrap section">
      <div class="toolbar">
        <div>
          <span class="fld">Vehicle class</span>
          <div class="filter-chips" role="group" aria-label="Filter by vehicle class">
            <button type="button" class="chip" data-cls="All" aria-pressed="true">All</button>
            <button type="button" class="chip" data-cls="Economy" aria-pressed="false">Economy</button>
            <button type="button" class="chip" data-cls="Midsize" aria-pressed="false">Midsize</button>
            <button type="button" class="chip" data-cls="SUV" aria-pressed="false">SUV</button>
            <button type="button" class="chip" data-cls="Van" aria-pressed="false">Van</button>
            <button type="button" class="chip" data-cls="Luxury" aria-pressed="false">Luxury</button>
            <button type="button" class="chip" data-cls="Electric" aria-pressed="false">Electric</button>
          </div>
        </div>
        <div style="display:flex;gap:.8rem;flex-wrap:wrap">
          <div>
            <label class="fld" for="fleet-search">Search</label>
            <input type="search" id="fleet-search" placeholder="RAV4, luxury&hellip;" style="min-width:160px">
          </div>
          <div>
            <label class="fld" for="fleet-sort">Sort by</label>
            <select id="fleet-sort">
              <option value="featured">Featured</option>
              <option value="price-asc">Daily rate, low to high</option>
              <option value="price-desc">Daily rate, high to low</option>
              <option value="seats">Most seats</option>
              <option value="name">Name, A&ndash;Z</option>
            </select>
          </div>
        </div>
      </div>

      <p class="result-count" id="fleet-count" aria-live="polite"></p>
      <div class="fleet-list" id="fleet-list"></div>
    </section>
"""

# -------------------------------------------------------------- vehicle
vehicle = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="fleet.html">Fleet</a> /
          <span id="v-crumb">Vehicle</span></p>
      </div>
    </section>

    <section class="wrap section" id="vehicle-detail">
      <div class="book-layout">
        <div>
          <div id="v-art"></div>

          <p class="eyebrow" id="v-cls" style="margin-top:1.4rem">Class</p>
          <h1 id="v-name">Vehicle</h1>
          <p>Late-model, under 30,000 miles, and valeted between every rental.
          Pick it up with a full tank and bring it back the same way.</p>

          <div class="spec-grid">
            <div class="spec-cell"><span class="k">Daily rate</span><span class="v" id="v-rate">&mdash;</span></div>
            <div class="spec-cell"><span class="k">Seats</span><span class="v" id="v-seats">&mdash;</span></div>
            <div class="spec-cell"><span class="k">Luggage</span><span class="v" id="v-bags">&mdash;</span></div>
            <div class="spec-cell"><span class="k">Doors</span><span class="v" id="v-doors">&mdash;</span></div>
            <div class="spec-cell"><span class="k">Transmission</span><span class="v" id="v-trans">&mdash;</span></div>
            <div class="spec-cell"><span class="k">Economy</span><span class="v" id="v-mpg">&mdash;</span></div>
          </div>

          <hr class="rule">
          <h3>Your rental</h3>
          <p class="alert" id="v-warn" hidden></p>

          <div class="form-row">
            <div class="field">
              <label for="v-loc">Pick-up location</label>
              <select id="v-loc"></select>
            </div>
            <div class="field">
              <label for="v-age">Driver age</label>
              <input type="number" id="v-age" min="18" max="99">
              <span class="hint">Drivers 21&ndash;24 pay a $25 per day surcharge.</span>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="v-pick">Pick-up date</label>
              <input type="date" id="v-pick">
            </div>
            <div class="field">
              <label for="v-drop">Return date</label>
              <input type="date" id="v-drop">
            </div>
          </div>

          <h3 style="margin-top:1.4rem">Add to your rental</h3>
          <div class="extras" id="v-extras"></div>
        </div>

        <aside class="quote">
          <h3>Your quote</h3>
          <div class="q-row"><span class="label">Length of rental</span><span id="q-days">&mdash;</span></div>
          <div class="q-row"><span class="label">Vehicle</span><span id="q-base">$0.00</span></div>
          <div class="q-row"><span class="label">Options</span><span id="q-extras">$0.00</span></div>
          <div class="q-row" id="q-young-row" hidden><span class="label">Young driver surcharge</span><span id="q-young">$0.00</span></div>
          <div class="q-row"><span class="label">Taxes &amp; airport fees</span><span id="q-taxes">$0.00</span></div>
          <div class="q-row q-total"><span class="label" style="font-family:var(--font-body)">Total</span><span id="q-total">$0.00</span></div>
          <p class="q-note" id="q-perday"></p>
          <button class="btn btn-block" id="v-reserve" type="button" style="margin-top:.9rem">Reserve this vehicle</button>
          <a class="btn btn-outline btn-block" href="fleet.html" style="margin-top:.5rem">Back to the fleet</a>
        </aside>
      </div>
    </section>
"""

# -------------------------------------------------------------- booking
booking = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="fleet.html">Fleet</a> / Booking</p>
        <h1>Confirm your booking</h1>
        <p>Check the details, add the driver, and the reservation is made.</p>
      </div>
    </section>

    <section class="wrap section" id="booking-page">
      <div class="book-layout">
        <div>
          <div id="b-summary"></div>

          <hr class="rule">
          <h3>Driver details</h3>
          <form class="form-panel form-wide" id="booking-form" novalidate style="padding:0;border:0;background:none">
            <p class="alert" id="b-result" hidden></p>
            <div class="form-row">
              <div class="field">
                <label for="b-name">Full name, as printed on the licence</label>
                <input type="text" id="b-name" autocomplete="name">
                <span class="error-text" id="b-name-error"></span>
              </div>
              <div class="field">
                <label for="b-lic">Driver licence number</label>
                <input type="text" id="b-lic" placeholder="NY-123456789">
                <span class="error-text" id="b-lic-error"></span>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="b-email">Email</label>
                <input type="email" id="b-email" autocomplete="email">
                <span class="error-text" id="b-email-error"></span>
              </div>
              <div class="field">
                <label for="b-phone">Phone</label>
                <input type="tel" id="b-phone" placeholder="(718) 555-0147">
                <span class="error-text" id="b-phone-error"></span>
              </div>
            </div>
            <button class="btn" type="submit">Confirm reservation</button>
            <p class="form-note">Nothing is charged now. You pay at the counter.</p>
          </form>
        </div>

        <aside class="quote" id="b-quote">
          <h3>Price breakdown</h3>
          <div class="q-row"><span class="label">Length of rental</span><span id="bq-days">&mdash;</span></div>
          <div class="q-row"><span class="label">Vehicle</span><span id="bq-base">$0.00</span></div>
          <div class="q-row"><span class="label">Options</span><span id="bq-extras">$0.00</span></div>
          <div class="q-row" id="bq-young-row" hidden><span class="label">Young driver surcharge</span><span id="bq-young">$0.00</span></div>
          <div class="q-row"><span class="label">Taxes &amp; airport fees</span><span id="bq-taxes">$0.00</span></div>
          <div class="q-row q-total"><span class="label" style="font-family:var(--font-body)">Total</span><span id="bq-total">$0.00</span></div>
          <p class="q-note">Free cancellation up to 24 hours before pick-up.</p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------ locations
locations = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Locations</p>
        <h1>Where to collect</h1>
        <p>Five counters across New York City. Airport desks open late.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="loc-grid">
        <div class="loc-card">
          <div class="loc-head"><span class="code">LGA</span><h4>LaGuardia Airport</h4></div>
          <div class="loc-body">
            Terminal B, Arrivals level<br>Queens, NY 11371
            <dl><dt>Mon&ndash;Sun</dt><dd>05:00 &ndash; 01:00</dd>
                <dt>Shuttle</dt><dd>Every 10 min</dd></dl>
          </div>
        </div>
        <div class="loc-card">
          <div class="loc-head"><span class="code">JFK</span><h4>JFK Airport</h4></div>
          <div class="loc-body">
            Federal Circle, Building 305<br>Jamaica, NY 11430
            <dl><dt>Mon&ndash;Sun</dt><dd>24 hours</dd>
                <dt>AirTrain</dt><dd>Federal Circle stop</dd></dl>
          </div>
        </div>
        <div class="loc-card">
          <div class="loc-head"><span class="code">LIC</span><h4>Long Island City</h4></div>
          <div class="loc-body">
            31-10 Thomson Avenue<br>Long Island City, NY 11101
            <dl><dt>Mon&ndash;Fri</dt><dd>07:00 &ndash; 20:00</dd>
                <dt>Sat&ndash;Sun</dt><dd>08:00 &ndash; 18:00</dd></dl>
          </div>
        </div>
        <div class="loc-card">
          <div class="loc-head"><span class="code">MID</span><h4>Midtown Manhattan</h4></div>
          <div class="loc-body">
            440 West 41st Street<br>New York, NY 10036
            <dl><dt>Mon&ndash;Fri</dt><dd>06:30 &ndash; 21:00</dd>
                <dt>Sat&ndash;Sun</dt><dd>08:00 &ndash; 19:00</dd></dl>
          </div>
        </div>
        <div class="loc-card">
          <div class="loc-head"><span class="code">BKN</span><h4>Downtown Brooklyn</h4></div>
          <div class="loc-body">
            185 Livingston Street<br>Brooklyn, NY 11201
            <dl><dt>Mon&ndash;Fri</dt><dd>07:00 &ndash; 19:00</dd>
                <dt>Sat&ndash;Sun</dt><dd>09:00 &ndash; 17:00</dd></dl>
          </div>
        </div>
      </div>

      <hr class="rule">
      <h2>One-way rentals</h2>
      <p>Collect at one counter and return at another. The drop fee depends on the pair.</p>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Collect</th><th>Return</th><th>Drop fee</th><th>Notice needed</th></tr></thead>
          <tbody>
            <tr><td>Any NYC counter</td><td>Any NYC counter</td><td class="num">$0.00</td><td>None</td></tr>
            <tr><td>NYC</td><td>Upstate New York</td><td class="num">$75.00</td><td>24 hours</td></tr>
            <tr><td>NYC</td><td>New Jersey / Connecticut</td><td class="num">$95.00</td><td>48 hours</td></tr>
            <tr><td>NYC</td><td>Outside the tri-state area</td><td class="num">$250.00</td><td>7 days</td></tr>
          </tbody>
        </table>
      </div>
    </section>
"""

# ------------------------------------------------------------- register
register = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Register</p>
        <h1>Create an account</h1>
        <p>Save your licence details once and skip the counter paperwork.</p>
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
          <label for="reg-dob">Date of birth
            <span class="hint">We rent to drivers aged 21 and over.</span>
          </label>
          <input type="date" id="reg-dob">
          <span class="error-text" id="reg-dob-error"></span>
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
            <span>I have read and accept the <a href="terms.html">rental terms</a>.</span>
          </label>
          <span class="error-text" id="reg-terms-error"></span>
        </div>

        <button class="btn btn-block" type="submit">Create account</button>
        <p class="form-note">Already have one? <a href="login.html">Sign in instead</a>.</p>
      </form>
    </section>
"""

# ---------------------------------------------------------------- login
login = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Sign in</p>
        <h1>Sign in</h1>
        <p>Pick up where you left off.</p>
      </div>
    </section>

    <section class="wrap section">
      <form class="form-panel" id="login-form" novalidate>
        <p class="alert" id="log-result" hidden></p>
        <div class="field">
          <label for="log-email">Email address</label>
          <input type="email" id="log-email" autocomplete="email">
          <span class="error-text" id="log-email-error"></span>
        </div>
        <div class="field">
          <label for="log-pass">Password</label>
          <input type="password" id="log-pass" autocomplete="current-password">
          <span class="error-text" id="log-pass-error"></span>
        </div>
        <div class="field">
          <label class="check">
            <input type="checkbox" id="log-remember">
            <span>Keep me signed in on this device</span>
          </label>
        </div>
        <button class="btn btn-block" type="submit">Sign in</button>
        <p class="form-note">New here? <a href="register.html">Create an account</a>.</p>
      </form>
    </section>
"""

# -------------------------------------------------------------- contact
contact = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Contact</p>
        <h1>Contact us</h1>
        <p>Reservations, billing questions, lost property.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="book-layout">
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
              <option>Change or cancel a reservation</option>
              <option>Question about a charge</option>
              <option>Damage or incident report</option>
              <option>Lost property</option>
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

        <aside class="quote">
          <h3>Reservations desk</h3>
          <div class="q-row"><span class="label">Phone</span><span>(718) 555-0147</span></div>
          <div class="q-row"><span class="label">Mon&ndash;Fri</span><span>07:00 &ndash; 21:00</span></div>
          <div class="q-row"><span class="label">Sat&ndash;Sun</span><span>08:00 &ndash; 19:00</span></div>
          <hr class="rule" style="margin-block:1rem">
          <h3>Roadside assistance</h3>
          <div class="q-row"><span class="label">24 hours</span><span>(718) 555-0199</span></div>
          <p class="q-note">Included free with every rental, anywhere in the tri-state area.</p>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- terms
terms = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Rental terms</p>
        <h1>Rental terms</h1>
        <p>Last updated 19 October 2026.</p>
      </div>
    </section>

    <section class="wrap section prose">
      <p class="lede">These terms apply to every Hudson rental. They are written plainly
      on purpose. If anything here is unclear, <a href="contact.html">ask us</a> before
      you book.</p>

      <h2>1. Who can rent</h2>
      <p>Drivers must be 21 or over and hold a licence valid for at least one year.
      Drivers aged 21 to 24 pay a surcharge of $25 per day, added automatically to the
      quote. Every additional driver must be present at the counter with their licence.</p>

      <h2>2. What the price includes</h2>
      <p>The total shown at booking covers the daily rate, any options you chose, the
      young driver surcharge where it applies, and all taxes and airport fees. There is
      nothing further to pay at the counter unless you change the booking.</p>

      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Charge</th><th>Amount</th><th>When it applies</th></tr></thead>
          <tbody>
            <tr><td>Taxes &amp; airport concession fee</td><td class="num">14.5%</td><td>Every rental</td></tr>
            <tr><td>Young driver surcharge</td><td class="num">$25.00 / day</td><td>Drivers aged 21&ndash;24</td></tr>
            <tr><td>Collision damage waiver</td><td class="num">$19.00 / day</td><td>Optional</td></tr>
            <tr><td>Additional driver</td><td class="num">$12.00 / day</td><td>Optional</td></tr>
            <tr><td>Late return</td><td class="num">$15.00 / hour</td><td>After a 59-minute grace period</td></tr>
            <tr><td>Refuelling</td><td class="num">$9.50 / gallon</td><td>If returned below the starting level</td></tr>
          </tbody>
        </table>
      </div>

      <h2>3. Mileage</h2>
      <p>Rentals include 150 miles per day. Beyond that the rate is $0.29 per mile, or
      add unlimited mileage for $15 per day at booking.</p>

      <h2>4. Fuel</h2>
      <p>Collect the vehicle with a full tank and return it full. We do not charge a
      refuelling markup if you bring it back at the level you took it.</p>

      <h2>5. Changes and cancellation</h2>
      <ul>
        <li>Cancel free up to 24 hours before pick-up.</li>
        <li>Inside 24 hours, one day's rate is retained.</li>
        <li>Change dates or vehicle free of charge, subject to availability.</li>
        <li>No-shows are charged one day's rate.</li>
      </ul>

      <h2>6. Damage and insurance</h2>
      <p>Without the collision damage waiver you are liable for damage up to the value
      of the vehicle. With it, your liability is capped at $250. Neither covers damage
      caused by driving under the influence, off-road use, or an unlisted driver.</p>

      <h2>7. Your information</h2>
      <p>We collect the name, licence number, address and contact details needed to
      rent you a vehicle, and nothing else. We do not sell personal information.</p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of the State of New York.</p>

      <hr class="rule">
      <p style="font-size:.88rem;color:var(--ink-faint)">
        Hudson Auto Rental is a fictional business built as coursework for MAC172 Web
        Development I at LaGuardia Community College. No real reservations are taken and
        no payment information is collected or transmitted.</p>
    </section>
"""

pages = [
    ("index.html",     "Car rental in New York", home,
     "Rent cars, vans and SUVs across five New York locations."),
    ("fleet.html",     "The fleet", fleet,
     "Ten vehicles across six classes; filter, search and sort."),
    ("vehicle.html",   "Vehicle", vehicle,
     "Vehicle specifications and a live rental quote."),
    ("booking.html",   "Your booking", booking,
     "Review and confirm your reservation."),
    ("locations.html", "Locations", locations,
     "Five Hudson counters across New York City."),
    ("register.html",  "Create an account", register,
     "Create a Hudson Auto Rental account."),
    ("login.html",     "Sign in", login,
     "Sign in to your Hudson account."),
    ("contact.html",   "Contact us", contact,
     "Reservations, billing and roadside assistance."),
    ("terms.html",     "Rental terms", terms,
     "Rates, fees, mileage, insurance and cancellation."),
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
with open("/home/claude/hudson-artifact-index.html", "w", encoding="utf-8") as fh:
    fh.write(artifact)
print("wrote artifact entry page")
