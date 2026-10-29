#!/usr/bin/env python3
"""Generates the twelve Kestrel Air pages with an identical header and footer.

Running this writes every .html file in /home/claude/kestrel. The stylesheet
and the script are hand-written and are not touched here.
"""
import os
import re

OUT = "/home/claude/kestrel"

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Space+Grotesk:wght@500;600;700&'
    'family=Inter:wght@400;500;600;700&'
    'family=JetBrains+Mono:wght@400;500&display=swap">\n'
)

NAV = [
    ("index.html",        "Book"),
    ("flights.html",      "Flights"),
    ("destinations.html", "Where we fly"),
    ("manage.html",       "My trips"),
    ("contact.html",      "Help"),
    ("login.html",        "Sign in"),
]

AIRPORTS = [
    ("JFK", "New York"), ("LAX", "Los Angeles"), ("ORD", "Chicago"),
    ("MIA", "Miami"), ("DEN", "Denver"), ("SEA", "Seattle"),
    ("ATL", "Atlanta"), ("BOS", "Boston"), ("SFO", "San Francisco"),
    ("AUS", "Austin"),
]


def options(selected=""):
    out = ""
    for code, city in AIRPORTS:
        sel = " selected" if code == selected else ""
        out += '            <option value="%s"%s>%s (%s)</option>\n' % (
            code, sel, city, code)
    return out


def header(current):
    links = ""
    for href, label in NAV:
        cls = ' class="current"' if href == current else ""
        links += '        <a href="%s"%s>%s</a>\n' % (href, cls, label)
    links += '        <a class="btn btn-sm" href="register.html">Join Kestrel Club</a>\n'
    return (
        '  <header class="site-head">\n'
        '    <div class="wrap head-bar">\n'
        '      <a class="wordmark" href="index.html">\n'
        '        <span class="wm-mark" aria-hidden="true"></span>\n'
        '        <span>Kestrel Air</span>\n'
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
          <div class="foot-mark">Kestrel Air</div>
          <p>A fictional carrier built for MAC172 Web Development I at
          LaGuardia Community College. Ten cities, one hub at JFK, and no
          real aeroplanes whatsoever.</p>
        </div>
        <div>
          <h4>Travel</h4>
          <a href="index.html">Book a flight</a>
          <a href="destinations.html">Where we fly</a>
          <a href="manage.html">Manage a booking</a>
          <a href="seats.html">Seat maps</a>
        </div>
        <div>
          <h4>Kestrel Club</h4>
          <a href="register.html">Join the programme</a>
          <a href="login.html">Sign in</a>
          <a href="destinations.html">Award destinations</a>
        </div>
        <div>
          <h4>Help</h4>
          <a href="contact.html">Contact us</a>
          <a href="terms.html">Conditions of carriage</a>
          <a href="terms.html#baggage">Baggage</a>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy; 2026 Kestrel Air. Student coursework &mdash; not a real airline.</span>
        <span class="code">HTML &middot; CSS &middot; JavaScript</span>
      </div>
    </div>
  </footer>
"""


def steps(active):
    """The five-step booking rail. `active` is 1-5."""
    names = ["Search", "Choose a flight", "Seats", "Passengers", "Payment"]
    out = '    <div class="steps">\n'
    for i, nm in enumerate(names, start=1):
        cls = "step on" if i == active else ("step done" if i < active else "step")
        out += '      <div class="%s"><span class="step-n">%d</span>%s</div>\n' % (
            cls, i, nm)
    out += "    </div>\n"
    return out


def page(filename, title, body, current=None, desc=""):
    current = current or filename
    html = (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '  <meta charset="utf-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '  <meta name="description" content="%s">\n'
        '  <title>%s | Kestrel Air</title>\n' % (desc, title)
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


# ================================================================== home
home = """    <section class="hero">
      <div class="wrap hero-grid">
        <p class="eyebrow">Ten cities &middot; One hub at JFK</p>
        <h1>Fares you can read in one line.</h1>
        <p class="lede">No bundles, no fare families, no asterisk that changes
        the price at the last screen. The number on the board is the number on
        the card.</p>

        <div class="search-card" style="margin-top:2rem">
          <form id="search-form" novalidate>
            <div class="trip-tabs">
              <button type="button" class="trip-tab on" data-trip="round">Round trip</button>
              <button type="button" class="trip-tab" data-trip="one">One way</button>
            </div>

            <div class="search-grid">
              <div class="field" style="margin:0">
                <label for="from">From</label>
                <select id="from">
                  <option value="">Choose an airport</option>
%s                </select>
              </div>
              <div class="field" style="margin:0">
                <label for="to">To</label>
                <select id="to">
                  <option value="">Choose an airport</option>
%s                </select>
              </div>
              <div class="field" style="margin:0">
                <label for="depart">Departing</label>
                <input type="date" id="depart">
              </div>
              <div class="field" id="ret-wrap" style="margin:0">
                <label for="ret">Returning</label>
                <input type="date" id="ret">
              </div>
              <div class="field" style="margin:0">
                <label for="pax">Passengers</label>
                <input type="number" id="pax" value="1" min="1" max="6">
              </div>
            </div>

            <div class="btn-row" style="margin-top:1.1rem">
              <button type="submit" class="btn btn-lg">Search flights</button>
              <span class="faint">Fares shown include all taxes and fees.</span>
            </div>
          </form>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="grid g4">
          <div class="stat"><div class="n">10</div>
            <div class="l">Cities, all reachable nonstop from JFK</div></div>
          <div class="stat"><div class="n">87%%</div>
            <div class="l">Departures within fifteen minutes of schedule</div></div>
          <div class="stat"><div class="n">2</div>
            <div class="l">Free carry-on bags, every fare, no exceptions</div></div>
          <div class="stat"><div class="n">$0</div>
            <div class="l">Change fee on any booking, any time</div></div>
        </div>
      </div>
    </section>

    <section class="sunk">
      <div class="wrap">
        <div class="sec-head">
          <h2>Why people book with us twice</h2>
          <p class="muted">Three decisions, all of which cost us money and all
          of which we have kept.</p>
        </div>
        <div class="grid g3">
          <div class="card">
            <span class="tag tag-new">No change fee</span>
            <h3 style="margin-top:.7rem">Change it, free, until departure</h3>
            <p class="muted">Move to another Kestrel flight on the same route at
            no charge. If the new fare is lower, the difference comes back to
            you as a travel credit rather than disappearing.</p>
          </div>
          <div class="card">
            <span class="tag tag-go">Seats included</span>
            <h3 style="margin-top:.7rem">A seat assignment is not an upsell</h3>
            <p class="muted">Every main-cabin seat is free to choose. Extra
            legroom and first cost more because the seat is bigger, not because
            we hid the ordinary one behind a paywall.</p>
          </div>
          <div class="card">
            <span class="tag tag-hold">Delay policy</span>
            <h3 style="margin-top:.7rem">Three hours and we pay you</h3>
            <p class="muted">A controllable delay past three hours earns a $150
            credit automatically. You do not have to ask, and you do not have to
            find the form.</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="sec-head"><h2>Popular this week</h2></div>
        <div class="grid g3">
          <div class="dest">
            <div class="dest-sky sky-a"></div>
            <div class="dest-body">
              <div class="dest-iata">JFK &rarr; MIA</div>
              <h3>Miami</h3>
              <p class="muted">Three nonstops a day, the first out at 06:10.</p>
              <p class="dest-from">from $148</p>
            </div>
          </div>
          <div class="dest">
            <div class="dest-sky sky-b"></div>
            <div class="dest-body">
              <div class="dest-iata">JFK &rarr; SEA</div>
              <h3>Seattle</h3>
              <p class="muted">Six hours across, and worth the window seat.</p>
              <p class="dest-from">from $214</p>
            </div>
          </div>
          <div class="dest">
            <div class="dest-sky sky-c"></div>
            <div class="dest-body">
              <div class="dest-iata">JFK &rarr; AUS</div>
              <h3>Austin</h3>
              <p class="muted">New this season, twice daily.</p>
              <p class="dest-from">from $179</p>
            </div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:1.6rem">
          <a class="btn btn-ghost" href="destinations.html">See all ten cities</a>
        </div>
      </div>
    </section>
""" % (options(), options())


# =============================================================== flights
flights = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Step 2 of 5</p>
        <h1>Choose your flight</h1>
        <p class="lede" id="route-line">Searching&hellip;</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
""" + steps(2) + """
        <div class="split">
          <div>
            <div class="chips">
              <button class="chip on" data-stops="any">Any stops</button>
              <button class="chip" data-stops="0">Nonstop only</button>
              <button class="chip" data-stops="1">With a connection</button>
            </div>
            <div class="chips">
              <button class="chip on" data-when="any">Any time</button>
              <button class="chip" data-when="am">Morning</button>
              <button class="chip" data-when="pm">Afternoon</button>
              <button class="chip" data-when="eve">Evening</button>
            </div>

            <div class="btn-row" style="margin-bottom:1rem">
              <span class="faint" id="count">&nbsp;</span>
              <span style="margin-left:auto"></span>
              <label for="sort" style="margin:0 .5rem 0 0">Sort by</label>
              <select id="sort" style="width:auto">
                <option value="price">Lowest fare</option>
                <option value="duration">Shortest trip</option>
                <option value="depart">Earliest departure</option>
                <option value="arrive">Earliest arrival</option>
              </select>
            </div>

            <div id="board"></div>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>Every fare includes</h3>
              <p class="muted" style="font-size:.92rem">A personal item and a
              full-size carry-on, a main-cabin seat of your choosing, and a free
              change to another Kestrel flight on the same route.</p>
              <hr style="border:none;border-top:1px solid var(--line);margin:1rem 0">
              <h4>Checked bags</h4>
              <table>
                <tr><td>First bag</td><td class="num">$35</td></tr>
                <tr><td>Second bag</td><td class="num">$45</td></tr>
                <tr><td>Kestrel Club</td><td class="num">Free</td></tr>
              </table>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ================================================================= seats
seats = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Step 3 of 5</p>
        <h1>Pick your seats</h1>
        <p class="lede" id="trip-strip"></p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
""" + steps(3) + """
        <div class="split">
          <div>
            <div class="notice" id="seat-warn" style="display:none"></div>
            <div id="seatmap"></div>
            <div class="legend">
              <span><i class="key"></i> Available</span>
              <span><i class="key k-extra"></i> Extra legroom</span>
              <span><i class="key k-first"></i> First</span>
              <span><i class="key k-taken"></i> Taken</span>
              <span><i class="key k-sel"></i> Yours</span>
            </div>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>Your seats</h3>
              <p class="muted" style="margin-bottom:.3rem">Chosen
                <strong id="seat-count">0 of 1</strong></p>
              <p class="code" id="seat-list">None chosen yet</p>
              <div class="sumline"><span>Seat fees</span>
                <span class="fig" id="seat-fees">$0.00</span></div>
              <button class="btn btn-wide" id="to-passengers" disabled
                onclick="window.location.href='passengers.html'">Choose 1 more</button>
            </div>

            <div class="card" style="margin-top:1rem">
              <h3>Fare summary</h3>
              <div id="fare"></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ============================================================ passengers
passengers = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Step 4 of 5</p>
        <h1>Who is travelling?</h1>
        <p class="lede" id="trip-strip"></p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
""" + steps(4) + """
        <div class="split">
          <div>
            <div class="notice">Names must match the photo identification each
            passenger will present at the airport. A name change after booking
            costs $75, so it is worth a second read.</div>

            <form id="pax-form" novalidate>
              <div id="pax-fields"></div>

              <fieldset>
                <legend>Contact for this booking</legend>
                <div class="row row-2">
                  <div class="field">
                    <label for="email">Email address</label>
                    <input type="email" id="email" data-rule="email" required>
                    <div class="hint">Your confirmation and any delay notice go here.</div>
                  </div>
                  <div class="field">
                    <label for="phone">Mobile number</label>
                    <input type="tel" id="phone" data-rule="phone"
                      placeholder="(212) 555-0147" required>
                  </div>
                </div>
              </fieldset>

              <div class="btn-row">
                <button type="submit" class="btn btn-lg">Continue to payment</button>
                <a class="btn btn-ghost" href="seats.html">Back to seats</a>
              </div>
            </form>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>Fare summary</h3>
              <div id="fare"></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# =============================================================== payment
payment = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Step 5 of 5</p>
        <h1>Payment</h1>
        <p class="lede" id="trip-strip"></p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
""" + steps(5) + """
        <div class="split">
          <div>
            <form id="pay-form" novalidate>
              <fieldset>
                <legend>Card</legend>
                <div class="field">
                  <label for="cardname">Name on the card</label>
                  <input type="text" id="cardname" data-rule="cardname" required>
                </div>
                <div class="field">
                  <label for="card">Card number</label>
                  <input type="text" id="card" data-rule="card" inputmode="numeric"
                    placeholder="4111 1111 1111 1111" maxlength="19" required>
                  <div class="hint">Sixteen digits. Nothing is sent anywhere &mdash;
                  this is coursework.</div>
                </div>
                <div class="row row-3">
                  <div class="field">
                    <label for="exp">Expires</label>
                    <input type="text" id="exp" data-rule="exp" placeholder="MM/YY"
                      maxlength="5" required>
                  </div>
                  <div class="field">
                    <label for="cvv">Security code</label>
                    <input type="text" id="cvv" data-rule="cvv" inputmode="numeric"
                      maxlength="4" required>
                  </div>
                  <div class="field">
                    <label for="zip">Billing ZIP</label>
                    <input type="text" id="zip" data-rule="zip" inputmode="numeric"
                      placeholder="11101" maxlength="10" required>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Before you pay</legend>
                <label class="check">
                  <input type="checkbox" id="agree">
                  <span>I have read the <a href="terms.html">conditions of
                  carriage</a> and confirm every passenger name matches their
                  identification.</span>
                </label>
                <div class="err" id="agree-err"></div>
              </fieldset>

              <div class="btn-row">
                <button type="submit" class="btn btn-lg">Pay and confirm</button>
                <a class="btn btn-ghost" href="passengers.html">Back</a>
              </div>
            </form>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>Fare summary</h3>
              <div id="fare"></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ========================================================== confirmation
confirmation = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Booked</p>
        <h1>You are on the flight.</h1>
        <p class="lede">Record locator
          <strong class="code" id="ref" style="color:#fff">&mdash;</strong>.
          A copy is on its way to your email.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
        <div class="split">
          <div>
            <div id="pass-box"></div>

            <h2 style="margin-top:2.2rem">Everyone on this booking</h2>
            <div id="pax-list"></div>

            <div class="btn-row" style="margin-top:1.4rem">
              <button class="btn" id="print">Print the pass</button>
              <a class="btn btn-ghost" href="manage.html">Manage this trip</a>
            </div>

            <h2 style="margin-top:2.4rem">Before you fly</h2>
            <div class="grid g3">
              <div class="card">
                <h4>Check in</h4>
                <p class="muted" style="font-size:.92rem">Opens 24 hours before
                departure. Do it online and skip the counter entirely if you are
                carrying on only.</p>
              </div>
              <div class="card">
                <h4>Arrive by</h4>
                <p class="muted" style="font-size:.92rem">Two hours for a domestic
                departure from JFK. The gate closes fifteen minutes before push.</p>
              </div>
              <div class="card">
                <h4>Bags</h4>
                <p class="muted" style="font-size:.92rem">Two carry-ons are free.
                Add a checked bag online for $35 &mdash; it is $45 at the airport.</p>
              </div>
            </div>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>What you paid</h3>
              <div id="final-sum"></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ================================================================ manage
manage = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">My trips</p>
        <h1>Find a booking</h1>
        <p class="lede">Enter the six-character record locator from your
        confirmation, and the surname it was booked under.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
        <div class="split">
          <div>
            <form id="find-form" novalidate>
              <div class="row row-2">
                <div class="field">
                  <label for="find-ref">Record locator</label>
                  <input type="text" id="find-ref" maxlength="6"
                    placeholder="ABC123" style="text-transform:uppercase">
                </div>
                <div class="field">
                  <label for="find-last">Passenger surname</label>
                  <input type="text" id="find-last">
                </div>
              </div>
              <button type="submit" class="btn">Find my booking</button>
            </form>

            <div id="find-out" style="margin-top:1.4rem"></div>

            <h2 style="margin-top:2.6rem">What you can change</h2>
            <table>
              <thead>
                <tr><th>Change</th><th>When</th><th class="num">Cost</th></tr>
              </thead>
              <tbody>
                <tr><td>Move to another Kestrel flight, same route</td>
                    <td>Any time before departure</td><td class="num">Free</td></tr>
                <tr><td>Change the route</td>
                    <td>Any time before departure</td><td class="num">Fare difference</td></tr>
                <tr><td>Change a passenger name</td>
                    <td>Up to 24 hours before</td><td class="num">$75</td></tr>
                <tr><td>Add a checked bag</td>
                    <td>Online, before check-in</td><td class="num">$35</td></tr>
                <tr><td>Cancel for a travel credit</td>
                    <td>Any time before departure</td><td class="num">Free</td></tr>
                <tr><td>Cancel for a refund to the card</td>
                    <td>Within 24 hours of booking</td><td class="num">Free</td></tr>
              </tbody>
            </table>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>No locator?</h3>
              <p class="muted" style="font-size:.93rem">It is the six-character
              code at the top of your confirmation email, made of capital letters
              and digits. We leave out I and O so nothing is mistaken for 1 or 0.</p>
              <p class="muted" style="font-size:.93rem">Kestrel Club members can
              <a href="login.html">sign in</a> and see every trip without one.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ========================================================== destinations
DESTS = [
    ("LAX", "Los Angeles", "sky-a", "$198", "6h 05m", "3 daily",
     "Nonstop to the west coast, with the afternoon departure arriving before dinner."),
    ("MIA", "Miami", "sky-b", "$148", "3h 10m", "4 daily",
     "Our shortest beach run. The 06:10 gets you on the sand by lunchtime."),
    ("ORD", "Chicago", "sky-f", "$129", "2h 30m", "5 daily",
     "The business shuttle. Hourly through the morning, and rarely full."),
    ("DEN", "Denver", "sky-c", "$186", "4h 25m", "2 daily",
     "Mountains from the left side going out, city from the right coming back."),
    ("SEA", "Seattle", "sky-b", "$214", "6h 20m", "2 daily",
     "The long one. Extra legroom is worth the $34 on this route."),
    ("ATL", "Atlanta", "sky-d", "$139", "2h 25m", "4 daily",
     "Quick, cheap and almost always on time."),
    ("BOS", "Boston", "sky-f", "$98", "1h 15m", "6 daily",
     "Barely long enough for the drink service. Our cheapest fare."),
    ("SFO", "San Francisco", "sky-e", "$221", "6h 35m", "2 daily",
     "Red-eye back lands at 06:40, which is either brilliant or brutal."),
    ("AUS", "Austin", "sky-c", "$179", "4h 05m", "2 daily",
     "New this season. The evening flight is the quiet one."),
    ("JFK", "New York", "sky-a", "Hub", "&mdash;", "All of them",
     "Home. Terminal 7, gates A1 to A24, and the good coffee is past security."),
]

cards = ""
for code, city, sky, fare, dur, freq, blurb in DESTS:
    cards += """          <div class="dest">
            <div class="dest-sky %s"></div>
            <div class="dest-body">
              <div class="dest-iata">%s</div>
              <h3>%s</h3>
              <p class="muted" style="font-size:.93rem">%s</p>
              <table style="margin-top:.6rem">
                <tr><td>Flight time</td><td class="num">%s</td></tr>
                <tr><td>Frequency</td><td class="num">%s</td></tr>
              </table>
              <p class="dest-from" style="margin-top:.8rem">from %s</p>
            </div>
          </div>
""" % (sky, code, city, blurb, dur, freq, fare)

destinations = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Route map</p>
        <h1>Ten cities, all from JFK</h1>
        <p class="lede">A small network flown often, rather than a large one
        flown once a week. Every city below has at least two departures a day.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
        <div class="grid g3">
""" + cards + """        </div>
      </div>
    </section>

    <section class="sunk">
      <div class="wrap">
        <div class="sec-head">
          <h2>What the fleet looks like</h2>
          <p class="muted">Four aircraft types, all narrow-body, all with the
          same seat pitch so the booking you make is the seat you get.</p>
        </div>
        <table>
          <thead>
            <tr><th>Aircraft</th><th class="num">Seats</th><th class="num">Pitch</th>
                <th>Typical routes</th></tr>
          </thead>
          <tbody>
            <tr><td>Airbus A320neo</td><td class="num">150</td><td class="num">32"</td>
                <td>Transcontinental &mdash; LAX, SFO, SEA</td></tr>
            <tr><td>Airbus A321</td><td class="num">190</td><td class="num">32"</td>
                <td>High-demand &mdash; MIA, LAX</td></tr>
            <tr><td>Boeing 737-800</td><td class="num">162</td><td class="num">32"</td>
                <td>Mid-haul &mdash; DEN, AUS, ATL</td></tr>
            <tr><td>Embraer E190</td><td class="num">100</td><td class="num">32"</td>
                <td>Short-haul &mdash; BOS, ORD</td></tr>
          </tbody>
        </table>
      </div>
    </section>
"""


# ============================================================== register
register = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Kestrel Club</p>
        <h1>Miles that do not expire</h1>
        <p class="lede">Free to join. One mile for every mile flown, a free
        checked bag from your first flight, and no blackout dates because we do
        not have enough routes to need them.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
        <div class="split">
          <div>
            <form id="reg-form" novalidate>
              <fieldset>
                <legend>Your name</legend>
                <div class="row row-2">
                  <div class="field">
                    <label for="rfn">First name</label>
                    <input type="text" id="rfn" data-rule="name" required>
                  </div>
                  <div class="field">
                    <label for="rln">Last name</label>
                    <input type="text" id="rln" data-rule="name" required>
                  </div>
                </div>
                <div class="field">
                  <label for="rdob">Date of birth</label>
                  <input type="date" id="rdob" data-rule="dob" required>
                </div>
              </fieldset>

              <fieldset>
                <legend>How we reach you</legend>
                <div class="row row-2">
                  <div class="field">
                    <label for="remail">Email address</label>
                    <input type="email" id="remail" data-rule="email" required>
                  </div>
                  <div class="field">
                    <label for="rphone">Mobile number</label>
                    <input type="tel" id="rphone" data-rule="phone"
                      placeholder="(212) 555-0147" required>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Password</legend>
                <div class="field">
                  <label for="pw">Choose a password</label>
                  <input type="password" id="pw" data-rule="pw" required>
                  <div class="meter" id="pw-meter"><i></i></div>
                  <div class="hint">At least 8 characters, one capital and one
                  number. Strength: <span id="pw-word">&mdash;</span></div>
                </div>
                <div class="field">
                  <label for="pw2">Repeat it</label>
                  <input type="password" id="pw2" data-rule="pw2" required>
                </div>
                <label class="check">
                  <input type="checkbox" id="terms">
                  <span>I accept the <a href="terms.html">programme terms</a>.</span>
                </label>
                <div class="err" id="terms-err"></div>
              </fieldset>

              <button type="submit" class="btn btn-lg">Create my account</button>
            </form>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>What membership gets you</h3>
              <table>
                <tr><td>First checked bag</td><td class="num">Free</td></tr>
                <tr><td>Extra legroom</td><td class="num">Half price</td></tr>
                <tr><td>Miles per mile flown</td><td class="num">1</td></tr>
                <tr><td>Mile expiry</td><td class="num">Never</td></tr>
                <tr><td>Annual fee</td><td class="num">$0</td></tr>
              </table>
              <p class="faint" style="margin-top:.9rem">A round trip to Los
              Angeles earns about 4,950 miles. An award seat on the same route
              costs 12,500.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ================================================================= login
login = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Kestrel Club</p>
        <h1>Sign in</h1>
      </div>
    </div>

    <section class="tight">
      <div class="wrap" style="max-width:520px">
        <div class="card">
          <form id="login-form" novalidate>
            <div class="field">
              <label for="login-id">Email or membership number</label>
              <input type="text" id="login-id">
            </div>
            <div class="field">
              <label for="login-pw">Password</label>
              <input type="password" id="login-pw">
            </div>
            <label class="check">
              <input type="checkbox" id="remember"> <span>Keep me signed in</span>
            </label>
            <button type="submit" class="btn btn-wide btn-lg"
              style="margin-top:.6rem">Sign in</button>
          </form>
          <div id="login-out" style="margin-top:1rem"></div>
          <p class="faint" style="margin-top:1rem;text-align:center">
            Not a member yet? <a href="register.html">Join Kestrel Club</a> &mdash;
            it takes a minute and costs nothing.</p>
        </div>

        <p class="faint" style="margin-top:1.2rem;text-align:center">
          Looking for a trip you booked as a guest?
          <a href="manage.html">Find it with your record locator</a>.</p>
      </div>
    </section>
"""


# =============================================================== contact
contact = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Help</p>
        <h1>Talk to a person</h1>
        <p class="lede">We answer most messages within one business day. For a
        flight in the next 24 hours, call instead &mdash; it is faster.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap">
        <div class="split">
          <div>
            <form id="contact-form" novalidate>
              <div class="row row-2">
                <div class="field">
                  <label for="cname">Your name</label>
                  <input type="text" id="cname" data-rule="name" required>
                </div>
                <div class="field">
                  <label for="cemail">Email address</label>
                  <input type="email" id="cemail" data-rule="email" required>
                </div>
              </div>
              <div class="row row-2">
                <div class="field">
                  <label for="cphone">Mobile number</label>
                  <input type="tel" id="cphone" data-rule="phone"
                    placeholder="(212) 555-0147" required>
                </div>
                <div class="field">
                  <label for="ctopic">What is it about?</label>
                  <select id="ctopic">
                    <option>An existing booking</option>
                    <option>Baggage</option>
                    <option>A delay or cancellation</option>
                    <option>Kestrel Club miles</option>
                    <option>Accessibility</option>
                    <option>Something else</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label for="message">Your message</label>
                <textarea id="message" maxlength="700"></textarea>
                <div class="hint"><span id="chars">0 / 600</span> &middot; include
                your record locator if you have one.</div>
                <div class="err"></div>
              </div>
              <button type="submit" class="btn btn-lg">Send the message</button>
            </form>
          </div>

          <aside class="aside">
            <div class="card">
              <h3>Faster than writing</h3>
              <table>
                <tr><td>Reservations</td><td class="num">(212) 555-0100</td></tr>
                <tr><td>Baggage</td><td class="num">(212) 555-0144</td></tr>
                <tr><td>Accessibility</td><td class="num">(212) 555-0188</td></tr>
                <tr><td>Kestrel Club</td><td class="num">(212) 555-0122</td></tr>
              </table>
              <p class="faint" style="margin-top:.9rem">Lines are open 05:00 to
              23:00 Eastern, every day.</p>
              <hr style="border:none;border-top:1px solid var(--line);margin:1rem 0">
              <h4>At JFK</h4>
              <p class="muted" style="font-size:.92rem">Terminal 7, departures
              level. The Kestrel desk is opposite gate A4 and is staffed from
              two hours before the first departure.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""


# ================================================================= terms
terms = """    <div class="page-head">
      <div class="wrap">
        <p class="eyebrow">Legal</p>
        <h1>Conditions of carriage</h1>
        <p class="lede">Written to be read. If a clause below needs a lawyer to
        understand, that is our mistake and we would like to hear about it.</p>
      </div>
    </div>

    <section class="tight">
      <div class="wrap" style="max-width:780px">
        <h2>1. What a ticket is</h2>
        <p>A confirmed booking is a contract between you and Kestrel Air to carry
        you and your baggage between the airports shown, on the date shown. The
        record locator identifies that contract. Fares are quoted in US dollars
        and include all federal taxes and security fees.</p>

        <h2>2. Changes and cancellations</h2>
        <p>You may change to another Kestrel flight on the same route at no
        charge at any time before departure. If the new fare is lower, the
        difference is issued as a travel credit valid for twelve months. If it is
        higher, you pay the difference only.</p>
        <p>A cancellation before departure is refunded as a travel credit. A
        cancellation within 24 hours of booking is refunded to the original card
        in full, as required by US Department of Transportation rules.</p>

        <h2 id="baggage">3. Baggage</h2>
        <p>Every fare includes one personal item and one full-size carry-on, up
        to 22 x 14 x 9 inches. Checked bags cost $35 for the first and $45 for
        the second, up to 50 pounds each. Kestrel Club members check the first
        bag free.</p>
        <p>We are liable for checked baggage up to $4,700 per passenger on
        domestic flights. Fragile items, electronics, medication and documents
        should travel in the cabin.</p>

        <h2>4. Delays and cancellations by us</h2>
        <p>If we delay a departure by more than three hours for a reason within
        our control, we issue a $150 travel credit automatically to the email on
        the booking. You do not need to claim it.</p>
        <p>If we cancel a flight, you may take the next available Kestrel flight
        at no charge or take a full refund to the original form of payment. We do
        not require you to choose the credit.</p>

        <h2>5. Seats</h2>
        <p>Main-cabin seat assignment is free. Extra-legroom and first-class
        seats carry the fee shown at the time of selection. We may move you to a
        different seat of the same class for safety or operational reasons; if we
        move you to a lower class, we refund the difference.</p>

        <h2>6. Conduct</h2>
        <p>We may refuse carriage to a passenger whose conduct endangers the
        aircraft, the crew or other passengers. This is the only circumstance in
        which a fare is forfeited.</p>

        <h2>7. Privacy</h2>
        <p>We collect the information needed to carry you: names, contact
        details, payment details and travel documents. We share it with the
        Transportation Security Administration where the law requires it, and
        with no one else. We do not sell passenger data.</p>

        <h2>8. This is coursework</h2>
        <p>Kestrel Air is a fictional carrier built as a student project for
        MAC172 Web Development I. No booking made here is real, no payment is
        processed, and no data leaves your browser. Everything you enter is kept
        in your own browser's local storage and disappears when you clear it.</p>
      </div>
    </section>
"""


pages = [
    ("index.html", "Book a flight", home,
     "Book flights with Kestrel Air: ten US cities from JFK, fares that include every tax and fee."),
    ("flights.html", "Choose your flight", flights,
     "Compare Kestrel Air flights by fare, duration and departure time."),
    ("seats.html", "Pick your seats", seats,
     "Choose your seat on the Kestrel Air cabin map."),
    ("passengers.html", "Passenger details", passengers,
     "Enter passenger names, dates of birth and travel documents."),
    ("payment.html", "Payment", payment,
     "Pay for your Kestrel Air booking."),
    ("confirmation.html", "Your boarding pass", confirmation,
     "Your Kestrel Air booking confirmation and boarding pass."),
    ("manage.html", "My trips", manage,
     "Find, change or cancel a Kestrel Air booking with your record locator."),
    ("destinations.html", "Where we fly", destinations,
     "Every Kestrel Air destination, with fares, flight times and frequency."),
    ("register.html", "Join Kestrel Club", register,
     "Join Kestrel Club: free checked bag, miles that never expire, no annual fee."),
    ("login.html", "Sign in", login,
     "Sign in to your Kestrel Club account."),
    ("contact.html", "Help", contact,
     "Contact Kestrel Air by message or phone."),
    ("terms.html", "Conditions of carriage", terms,
     "Kestrel Air conditions of carriage: changes, baggage, delays and privacy."),
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
with open("/home/claude/kestrel-artifact-index.html", "w", encoding="utf-8") as fh:
    fh.write(artifact)
print("wrote artifact entry page")
