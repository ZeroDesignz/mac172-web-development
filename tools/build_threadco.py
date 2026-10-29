#!/usr/bin/env python3
"""Generates the nine Thread & Co. pages with an identical header and footer."""
import os, re

OUT = "/home/claude/threadco"

FONTS = (
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Archivo:wght@600;700;800&family=Karla:wght@400;500;700&'
    'family=IBM+Plex+Mono:wght@400;500&display=swap">\n'
)

NAV = [
    ("index.html",    "Home"),
    ("shop.html",     "Shop"),
    ("contact.html",  "Contact"),
    ("login.html",    "Sign in"),
    ("register.html", "Register"),
]


def header(current):
    links = ""
    for href, label in NAV:
        cls = ' class="current"' if href == current else ""
        links += '        <a href="%s"%s>%s</a>\n' % (href, cls, label)
    cart_cls = ' class="cart-link current"' if current == "cart.html" else ' class="cart-link"'
    links += ('        <a%s href="cart.html">Cart '
              '<span class="cart-count is-empty" id="cart-count">0</span></a>\n' % cart_cls)
    return (
        '  <header class="site-head">\n'
        '    <div class="wrap head-bar">\n'
        '      <a class="wordmark" href="index.html">Thread &amp; Co.</a>\n'
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
          <div class="foot-mark">Thread &amp; Co.</div>
          <p>Everyday apparel, bags and home goods, made in small runs and built to last.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="shop.html">All products</a></li>
            <li><a href="shop.html">Apparel</a></li>
            <li><a href="shop.html">Bags</a></li>
            <li><a href="shop.html">Home</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><a href="register.html">Create an account</a></li>
            <li><a href="login.html">Sign in</a></li>
            <li><a href="cart.html">Your cart</a></li>
            <li><a href="checkout.html">Checkout</a></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="contact.html">Contact us</a></li>
            <li><a href="terms.html">Terms of Service</a></li>
            <li><a href="terms.html">Shipping &amp; returns</a></li>
            <li><a href="terms.html">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy; 2026 Thread &amp; Co. &mdash; a student project for MAC172, LaGuardia Community College.</span>
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
        '  <title>%s | Thread &amp; Co.</title>\n' % (desc, title)
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
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">Autumn collection &middot; 2026</p>
          <h1>Things you keep.</h1>
          <p class="lede">Apparel, bags and home goods made in small runs by workshops
          we have visited. No seasonal churn, no fast fashion &mdash; just a short list
          of things worth owning for years.</p>
          <div class="hero-actions">
            <a class="btn" href="shop.html">Shop the collection</a>
            <a class="btn btn-outline" href="register.html">Create an account</a>
          </div>
        </div>
        <div class="hero-art" role="img" aria-label="Thread &amp; Co. autumn collection"></div>
      </div>
    </section>

    <section class="wrap section">
      <p class="eyebrow">Featured</p>
      <h2>New this season</h2>
      <div class="grid-products" id="featured-grid"></div>
      <p style="margin-top:1.5rem"><a class="btn btn-outline" href="shop.html">See all products</a></p>
    </section>

    <section class="wrap section-tight">
      <h2>Shop by category</h2>
      <div class="cat-tiles">
        <a class="cat-tile" href="shop.html"
           style="background:linear-gradient(150deg,#8d3c68,#4a1e36)"><span>Apparel</span></a>
        <a class="cat-tile" href="shop.html"
           style="background:linear-gradient(150deg,#7b6646,#3d3122)"><span>Bags</span></a>
        <a class="cat-tile" href="shop.html"
           style="background:linear-gradient(150deg,#4f7489,#243944)"><span>Home</span></a>
      </div>
    </section>

    <section class="wrap section">
      <div class="strip">
        <div class="strip-item">
          <h4>Free shipping over $75</h4>
          <p>Flat $6.95 below that, anywhere in the United States.</p>
        </div>
        <div class="strip-item">
          <h4>60-day returns</h4>
          <p>Unworn and with tags, for any reason at all.</p>
        </div>
        <div class="strip-item">
          <h4>Repairs, not replacements</h4>
          <p>Send knitwear back for mending in the first two years.</p>
        </div>
        <div class="strip-item">
          <h4>Named workshops</h4>
          <p>Every product page lists where the item was made.</p>
        </div>
      </div>
    </section>
"""

# ----------------------------------------------------------------- shop
shop = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Shop</p>
        <h1>The collection</h1>
        <p>Ten products. Filter by category, search by name or material, sort by price.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="toolbar">
        <div>
          <label class="visually-hidden" for="shop-search">Search products</label>
          <div class="filter-chips" role="group" aria-label="Filter by category">
            <button type="button" class="chip" data-cat="All" aria-pressed="true">All</button>
            <button type="button" class="chip" data-cat="Apparel" aria-pressed="false">Apparel</button>
            <button type="button" class="chip" data-cat="Bags" aria-pressed="false">Bags</button>
            <button type="button" class="chip" data-cat="Home" aria-pressed="false">Home</button>
          </div>
        </div>
        <div>
          <label for="shop-search" style="font-size:.78rem;font-weight:700;display:block;margin-bottom:.3rem">Search</label>
          <input type="search" id="shop-search" placeholder="linen, tote, merino&hellip;" style="min-width:180px">
        </div>
        <div>
          <label for="shop-sort" style="font-size:.78rem;font-weight:700;display:block;margin-bottom:.3rem">Sort by</label>
          <select id="shop-sort">
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="name">Name, A&ndash;Z</option>
          </select>
        </div>
      </div>

      <p class="result-count" id="shop-count" aria-live="polite"></p>
      <div class="grid-products" id="shop-grid"></div>
    </section>
"""

# -------------------------------------------------------------- product
product = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> /
          <span id="pd-crumb">Product</span></p>
      </div>
    </section>

    <section class="wrap section" id="product-detail">
      <div class="detail">
        <div>
          <div class="detail-art" id="pd-art" role="img" aria-label="Product photograph"></div>
          <div class="thumbs" id="pd-thumbs" role="group" aria-label="Other views"></div>
        </div>

        <div>
          <p class="eyebrow" id="pd-cat">Category</p>
          <h1 id="pd-name">Product name</h1>
          <p class="detail-price" id="pd-price">$0.00</p>
          <p>Cut and finished in a workshop we have visited, from materials chosen to
          wear in rather than wear out. Every piece carries a two-year repair promise.</p>

          <ul class="spec-list">
            <li><span class="k">SKU</span><span class="v" id="pd-sku">&mdash;</span></li>
            <li><span class="k">Material</span><span class="v" id="pd-material">&mdash;</span></li>
            <li><span class="k">Made in</span><span class="v" id="pd-origin">&mdash;</span></li>
            <li><span class="k">Shipping</span><span class="v">Free over $75</span></li>
          </ul>

          <div class="buy-row">
            <div>
              <label class="visually-hidden" for="pd-qty">Quantity</label>
              <input type="number" id="pd-qty" value="1" min="1" max="10" style="width:5rem">
            </div>
            <button class="btn" id="pd-add" type="button">Add to cart</button>
            <a class="btn btn-outline" href="cart.html">View cart</a>
          </div>
          <p class="alert alert-ok" id="pd-msg" hidden style="margin-top:1rem"></p>
        </div>
      </div>

      <hr class="rule">
      <h2>You may also like</h2>
      <div class="grid-products" id="pd-also"></div>
    </section>
"""

# ----------------------------------------------------------------- cart
cart = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Cart</p>
        <h1>Your cart</h1>
        <p>Change quantities and the totals update as you go.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="cart-layout">
        <ul class="cart-list" id="cart-items"></ul>

        <aside class="summary">
          <h3>Order summary</h3>
          <div class="sum-row"><span class="label">Subtotal</span><span id="sum-sub">$0.00</span></div>
          <div class="sum-row"><span class="label">Sales tax (8.875%)</span><span id="sum-tax">$0.00</span></div>
          <div class="sum-row"><span class="label">Shipping</span><span id="sum-ship">Free</span></div>
          <div class="sum-row sum-total"><span class="label" style="font-family:var(--font-body)">Total</span><span id="sum-total">$0.00</span></div>
          <p class="ship-note" id="ship-note"></p>
          <a class="btn btn-block" id="to-checkout" href="checkout.html" style="margin-top:1rem">Checkout</a>
          <a class="btn btn-quiet btn-block" href="shop.html" style="margin-top:.5rem">Keep shopping</a>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- checkout
checkout = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / <a href="cart.html">Cart</a> / Checkout</p>
        <h1>Checkout</h1>
        <p>Every field is checked before the order goes through.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="cart-layout">
        <form class="form-panel form-wide" id="checkout-form" novalidate>
          <p class="alert" id="co-result" hidden></p>

          <h3>Shipping address</h3>
          <div class="field">
            <label for="co-name">Full name</label>
            <input type="text" id="co-name" autocomplete="name">
            <span class="error-text" id="co-name-error"></span>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="co-email">Email</label>
              <input type="email" id="co-email" autocomplete="email">
              <span class="error-text" id="co-email-error"></span>
            </div>
            <div class="field">
              <label for="co-phone">Phone</label>
              <input type="tel" id="co-phone" autocomplete="tel" placeholder="(718) 555-0147">
              <span class="error-text" id="co-phone-error"></span>
            </div>
          </div>
          <div class="field">
            <label for="co-addr">Street address</label>
            <input type="text" id="co-addr" autocomplete="street-address">
            <span class="error-text" id="co-addr-error"></span>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="co-city">City</label>
              <input type="text" id="co-city" autocomplete="address-level2">
              <span class="error-text" id="co-city-error"></span>
            </div>
            <div class="field">
              <label for="co-zip">ZIP code</label>
              <input type="text" id="co-zip" autocomplete="postal-code" placeholder="11101">
              <span class="error-text" id="co-zip-error"></span>
            </div>
          </div>

          <hr class="rule">
          <h3>Payment</h3>
          <div class="field">
            <label for="co-card">Card number
              <span class="hint">16 digits. This demo does not send card data anywhere.</span>
            </label>
            <input type="text" id="co-card" inputmode="numeric" placeholder="4111 1111 1111 1111">
            <span class="error-text" id="co-card-error"></span>
          </div>

          <button class="btn btn-block" type="submit">Place order</button>
        </form>

        <aside class="summary">
          <h3>Your order</h3>
          <div id="co-lines"></div>
          <hr class="rule" style="margin-block:.8rem">
          <div class="sum-row"><span class="label">Subtotal</span><span id="co-sub">$0.00</span></div>
          <div class="sum-row"><span class="label">Sales tax</span><span id="co-tax">$0.00</span></div>
          <div class="sum-row"><span class="label">Shipping</span><span id="co-ship">Free</span></div>
          <div class="sum-row sum-total"><span class="label" style="font-family:var(--font-body)">Total</span><span id="co-total">$0.00</span></div>
          <p class="ship-note"><a href="cart.html">Edit your cart</a></p>
        </aside>
      </div>
    </section>
"""

# ------------------------------------------------------------- register
register = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Register</p>
        <h1>Create an account</h1>
        <p>Order history, saved addresses, and first look at new runs.</p>
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
            <span>I have read and accept the <a href="terms.html">Terms of Service</a>.</span>
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
        <p>Welcome back.</p>
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
        <p>Questions about an order, a repair, or a product.</p>
      </div>
    </section>

    <section class="wrap section">
      <div class="cart-layout">
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
              <option>Order status</option>
              <option>Return or exchange</option>
              <option>Repair request</option>
              <option>Product question</option>
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

        <aside class="summary">
          <h3>Visit the shop</h3>
          <p style="font-size:.92rem;color:var(--ink-soft)">
            31-10 Thomson Avenue<br>
            Long Island City, NY 11101
          </p>
          <hr class="rule" style="margin-block:1rem">
          <h4 style="font-size:.95rem">Hours</h4>
          <div class="sum-row"><span class="label">Mon &ndash; Fri</span><span>11:00 &ndash; 19:00</span></div>
          <div class="sum-row"><span class="label">Saturday</span><span>11:00 &ndash; 18:00</span></div>
          <div class="sum-row"><span class="label">Sunday</span><span>Closed</span></div>
          <p class="ship-note">We answer messages within two business days.</p>
        </aside>
      </div>
    </section>
"""

# ---------------------------------------------------------------- terms
terms = """    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="index.html">Home</a> / Terms of Service</p>
        <h1>Terms of Service</h1>
        <p>Last updated 19 October 2026.</p>
      </div>
    </section>

    <section class="wrap section prose">
      <p class="lede">These terms cover orders placed on this site. They are written
      plainly on purpose. If something here is unclear, <a href="contact.html">ask us</a>
      before you order.</p>

      <h2>1. Placing an order</h2>
      <p>An order is an offer to buy. We accept it when we send the shipping
      confirmation, not when you submit the form. If an item sells out between those
      two moments we will cancel that line and refund it in full.</p>

      <h2>2. Prices and tax</h2>
      <p>Prices are in US dollars and exclude sales tax. Orders shipped within New
      York State are charged the combined state and city rate shown at checkout.</p>

      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>Destination</th><th>Shipping</th><th>Transit time</th></tr>
          </thead>
          <tbody>
            <tr><td>New York City</td><td>Free over $75, else $6.95</td><td>1&ndash;2 business days</td></tr>
            <tr><td>Continental US</td><td>Free over $75, else $6.95</td><td>3&ndash;6 business days</td></tr>
            <tr><td>Alaska and Hawaii</td><td>$14.95</td><td>5&ndash;9 business days</td></tr>
            <tr><td>Canada</td><td>$22.00</td><td>7&ndash;14 business days</td></tr>
          </tbody>
        </table>
      </div>

      <h2>3. Returns</h2>
      <p>Return anything unworn and tagged within 60 days for a full refund. We pay
      return postage on faulty goods; you pay it on a change of mind.</p>
      <ul>
        <li>Start a return from your account, or by contacting us.</li>
        <li>Refunds are issued to the original payment method within 10 business days.</li>
        <li>Made-to-order and final-sale items cannot be returned.</li>
      </ul>

      <h2>4. Repairs</h2>
      <p>Knitwear and bags carry a two-year repair promise. Send the item back and we
      will mend it where a mend is possible, or replace it where it is not.</p>

      <h2>5. Your account</h2>
      <p>Keep your password to yourself. You are responsible for what happens on your
      account. Tell us at once if you think someone else has used it.</p>

      <h2>6. Your information</h2>
      <p>We collect the name, address, email and phone number needed to fulfil your
      order, and nothing else. We do not sell personal information.</p>

      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of the State of New York.</p>

      <hr class="rule">
      <p style="font-size:.88rem;color:var(--ink-faint)">
        Thread &amp; Co. is a fictional business built as coursework for MAC172 Web
        Development I at LaGuardia Community College. No real orders are taken and no
        payment information is collected or transmitted.</p>
    </section>
"""

pages = [
    ("index.html",    "Everyday goods made to last", home,
     "Apparel, bags and home goods made in small runs."),
    ("shop.html",     "Shop", shop,
     "Browse the full Thread & Co. collection; filter, search and sort."),
    ("product.html",  "Product", product,
     "Product details, materials and origin."),
    ("cart.html",     "Your cart", cart,
     "Review your cart and see the running total."),
    ("checkout.html", "Checkout", checkout,
     "Enter shipping and payment details."),
    ("register.html", "Create an account", register,
     "Create a Thread & Co. account."),
    ("login.html",    "Sign in", login,
     "Sign in to your Thread & Co. account."),
    ("contact.html",  "Contact us", contact,
     "Questions about an order, a repair, or a product."),
    ("terms.html",    "Terms of Service", terms,
     "Ordering, shipping, returns and repair terms."),
]

os.makedirs(OUT, exist_ok=True)
for fn, title, body, desc in pages:
    page(fn, title, body, current=fn, desc=desc)
    print("wrote", fn)

# ---- artifact entry page: same home page without the document wrapper ----
with open(os.path.join(OUT, "index.html"), encoding="utf-8") as fh:
    src = fh.read()

head_bits = re.search(r"<title>.*?</title>", src, re.S).group(0)
fonts = "\n".join(re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', src))
body_inner = re.search(r"<body>(.*)</body>", src, re.S).group(1)

artifact = (
    head_bits + "\n"
    + '<meta name="claude:viewport-fit-sides" content="cover">\n'
    + fonts + "\n"
    + body_inner.strip() + "\n"
)
with open("/home/claude/threadco-artifact-index.html", "w", encoding="utf-8") as fh:
    fh.write(artifact)
print("wrote artifact entry page")
