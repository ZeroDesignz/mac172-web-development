/* ===================================================================
   Thread & Co. — MAC172 Group Project
   Shared JavaScript for all pages.

   JavaScript items in this file:
     1. Registration form validation  (register.html)  - required
     2. Shopping cart + running total (every page)
     3. Product filter / sort / search (shop.html)
     4. Contact + checkout + login validation
     5. Mobile navigation toggle
   =================================================================== */

/* -------------------------------------------------------------
   1. PRODUCT CATALOG
   In a later version this could come from a database. For now it
   lives here so every page reads from one source.
   ------------------------------------------------------------- */
var CATALOG = [
  { id: "tee-hw",   name: "Heavyweight Cotton Tee", cat: "Apparel", price: 28,  was: null, a: "#cfa9bd", b: "#8d3c68", sku: "TC-1001", material: "320gsm organic cotton", origin: "Portugal" },
  { id: "swt-mer",  name: "Merino Crew Sweater",    cat: "Apparel", price: 94,  was: 118,  a: "#9fb0a6", b: "#3f5a4c", sku: "TC-1014", material: "100% extra-fine merino", origin: "Scotland" },
  { id: "tote-cv",  name: "Canvas Field Tote",      cat: "Bags",    price: 34,  was: null, a: "#cbbb9a", b: "#7b6646", sku: "TC-2003", material: "18oz waxed canvas", origin: "USA" },
  { id: "card-lt",  name: "Leather Card Holder",    cat: "Bags",    price: 42,  was: null, a: "#c09b7f", b: "#6b4630", sku: "TC-2011", material: "Vegetable-tanned leather", origin: "Italy" },
  { id: "mug-en",   name: "Enamel Camp Mug",        cat: "Home",    price: 18,  was: null, a: "#a9c0cb", b: "#4f7489", sku: "TC-3002", material: "Steel core, enamel glaze", origin: "Poland" },
  { id: "towel-ln", name: "Linen Tea Towel Set",    cat: "Home",    price: 26,  was: 32,   a: "#ddd3bd", b: "#9c8f72", sku: "TC-3008", material: "Washed European linen", origin: "Lithuania" },
  { id: "hat-bn",   name: "Ribbed Knit Beanie",     cat: "Apparel", price: 24,  was: null, a: "#aba6c7", b: "#5f5a86", sku: "TC-1022", material: "Lambswool blend", origin: "Scotland" },
  { id: "cap-wx",   name: "Waxed Cotton Cap",       cat: "Apparel", price: 32,  was: null, a: "#9bada5", b: "#44605a", sku: "TC-1030", material: "Waxed cotton twill", origin: "England" },
  { id: "pour-st",  name: "Stoneware Pour-Over",    cat: "Home",    price: 58,  was: null, a: "#c8b6a6", b: "#73594a", sku: "TC-3015", material: "Hand-thrown stoneware", origin: "USA" },
  { id: "duf-wk",   name: "Weekender Duffel",       cat: "Bags",    price: 128, was: null, a: "#a8a295", b: "#55524a", sku: "TC-2020", material: "Waxed canvas, leather trim", origin: "USA" }
];

/* Helpers -------------------------------------------------- */

function findProduct(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) { return CATALOG[i]; }
  }
  return null;
}

/* Formats a number as US currency: 1234.5 -> "$1,234.50" */
function money(n) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* Placeholder artwork. Swap these for real <img> photos before
   you submit — the rubric scores Layout and Design. */
function artStyle(p) {
  return "background: repeating-linear-gradient(135deg, rgba(255,255,255,.10) 0 10px, "
       + "transparent 10px 20px), linear-gradient(150deg, " + p.a + ", " + p.b + ");";
}

/* Safe localStorage — some browsers block it in private mode. */
var store = {
  get: function (key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set: function (key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* cart still works for this page */ }
  }
};

/* -------------------------------------------------------------
   2. SHOPPING CART
   Stored as [{ id: "tee-hw", qty: 2 }, ...]
   ------------------------------------------------------------- */
var TAX_RATE      = 0.08875;  // New York City combined sales tax
var FREE_SHIP_MIN = 75;
var SHIP_FLAT     = 6.95;

var Cart = {
  items: store.get("threadco_cart", []),

  save: function () {
    store.set("threadco_cart", this.items);
    this.paintCount();
  },

  add: function (id, qty) {
    qty = qty || 1;
    var line = null;
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) { line = this.items[i]; }
    }
    if (line) { line.qty += qty; } else { this.items.push({ id: id, qty: qty }); }
    this.save();
  },

  setQty: function (id, qty) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) {
        this.items[i].qty = qty;
        if (qty < 1) { this.items.splice(i, 1); }
        break;
      }
    }
    this.save();
  },

  remove: function (id) {
    this.items = this.items.filter(function (l) { return l.id !== id; });
    this.save();
  },

  count: function () {
    return this.items.reduce(function (n, l) { return n + l.qty; }, 0);
  },

  subtotal: function () {
    return this.items.reduce(function (sum, l) {
      var p = findProduct(l.id);
      return p ? sum + p.price * l.qty : sum;
    }, 0);
  },

  shipping: function () {
    var sub = this.subtotal();
    return (sub === 0 || sub >= FREE_SHIP_MIN) ? 0 : SHIP_FLAT;
  },

  tax: function () { return this.subtotal() * TAX_RATE; },

  total: function () { return this.subtotal() + this.tax() + this.shipping(); },

  /* Updates the number next to "Cart" in the header of every page. */
  paintCount: function () {
    var el = document.getElementById("cart-count");
    if (!el) { return; }
    var n = this.count();
    el.textContent = n;
    if (n === 0) { el.classList.add("is-empty"); }
    else { el.classList.remove("is-empty"); }
  }
};

/* -------------------------------------------------------------
   3. SHARED UI — runs on every page
   ------------------------------------------------------------- */
function initHeader() {
  Cart.paintCount();

  var toggle = document.getElementById("nav-toggle");
  var nav    = document.getElementById("mainnav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}

/* Builds one product card. Used by the home page and the shop page. */
function cardHTML(p) {
  return '<article class="card">'
    + '<a href="product.html?id=' + p.id + '" data-goto="' + p.id + '">'
    +   '<div class="card-art" style="' + artStyle(p) + '">'
    +     (p.was ? '<span class="card-badge">Sale</span>' : '')
    +   '</div>'
    + '</a>'
    + '<div class="card-body">'
    +   '<span class="card-cat">' + p.cat + '</span>'
    +   '<h3 class="card-name"><a href="product.html?id=' + p.id + '" data-goto="' + p.id + '">' + p.name + '</a></h3>'
    +   '<p class="card-price">'
    +     (p.was ? '<span class="was">' + money(p.was) + '</span>' : '')
    +     money(p.price) + '</p>'
    +   '<button class="btn btn-outline btn-sm" data-add="' + p.id + '">Add to cart</button>'
    + '</div></article>';
}

/* Remembers which product was clicked, so product.html can open it
   even when the page is served without query strings. */
function wireCardClicks(root) {
  root.addEventListener("click", function (e) {
    var addId = e.target.getAttribute && e.target.getAttribute("data-add");
    if (addId) {
      Cart.add(addId, 1);
      e.target.textContent = "Added ✓";
      window.setTimeout(function () { e.target.textContent = "Add to cart"; }, 1200);
      return;
    }
    var link = e.target.closest && e.target.closest("[data-goto]");
    if (link) { store.set("threadco_product", link.getAttribute("data-goto")); }
  });
}

/* -------------------------------------------------------------
   4. HOME PAGE
   ------------------------------------------------------------- */
function initHome() {
  var grid = document.getElementById("featured-grid");
  if (!grid) { return; }
  var featured = CATALOG.slice(0, 4);
  grid.innerHTML = featured.map(cardHTML).join("");
  wireCardClicks(grid);
}

/* -------------------------------------------------------------
   5. SHOP PAGE — JavaScript item: filter, sort and search
   ------------------------------------------------------------- */
function initShop() {
  var grid = document.getElementById("shop-grid");
  if (!grid) { return; }

  var searchBox = document.getElementById("shop-search");
  var sortBox   = document.getElementById("shop-sort");
  var countEl   = document.getElementById("shop-count");
  var chips     = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var category  = "All";

  function render() {
    var q = searchBox.value.trim().toLowerCase();

    var list = CATALOG.filter(function (p) {
      var inCat    = (category === "All") || (p.cat === category);
      var inSearch = (q === "")
        || p.name.toLowerCase().indexOf(q) > -1
        || p.cat.toLowerCase().indexOf(q) > -1
        || p.material.toLowerCase().indexOf(q) > -1;
      return inCat && inSearch;
    });

    var how = sortBox.value;
    list.sort(function (a, b) {
      if (how === "price-asc")  { return a.price - b.price; }
      if (how === "price-desc") { return b.price - a.price; }
      if (how === "name")       { return a.name.localeCompare(b.name); }
      return 0;
    });

    countEl.textContent = list.length === 1
      ? "1 product"
      : list.length + " products";

    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<p class="empty-state" style="grid-column:1/-1">No products match that search. '
        + 'Try a different word or choose All.</p>';
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      category = chip.getAttribute("data-cat");
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      render();
    });
  });

  searchBox.addEventListener("input", render);
  sortBox.addEventListener("change", render);
  wireCardClicks(grid);
  render();
}

/* -------------------------------------------------------------
   6. PRODUCT DETAIL PAGE
   ------------------------------------------------------------- */
function initProduct() {
  var root = document.getElementById("product-detail");
  if (!root) { return; }

  /* Look for ?id= first, then the last product clicked, then a default. */
  var id = null;
  var match = window.location.search.match(/[?&]id=([^&]+)/);
  if (match) { id = decodeURIComponent(match[1]); }
  if (!id) { id = store.get("threadco_product", null); }

  var p = findProduct(id) || CATALOG[0];

  document.getElementById("pd-crumb").textContent = p.name;
  document.getElementById("pd-art").setAttribute("style", artStyle(p));
  document.getElementById("pd-cat").textContent   = p.cat;
  document.getElementById("pd-name").textContent  = p.name;
  document.getElementById("pd-sku").textContent   = p.sku;
  document.getElementById("pd-material").textContent = p.material;
  document.getElementById("pd-origin").textContent   = p.origin;

  document.getElementById("pd-price").innerHTML =
    (p.was ? '<span class="was" style="color:var(--ink-faint);text-decoration:line-through;font-size:.75em;margin-right:.4rem">'
      + money(p.was) + '</span>' : '') + money(p.price);

  /* Thumbnails just re-tint the main image — enough to show the
     interaction without real photography. */
  var thumbs = document.getElementById("pd-thumbs");
  var angles = ["150deg", "30deg", "90deg"];
  thumbs.innerHTML = angles.map(function (ang, i) {
    return '<button type="button" aria-pressed="' + (i === 0) + '" data-ang="' + ang + '"'
      + ' aria-label="View ' + (i + 1) + '"'
      + ' style="background:linear-gradient(' + ang + ',' + p.a + ',' + p.b + ')"></button>';
  }).join("");

  thumbs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ang]");
    if (!b) { return; }
    Array.prototype.forEach.call(thumbs.children, function (c) {
      c.setAttribute("aria-pressed", String(c === b));
    });
    document.getElementById("pd-art").setAttribute("style",
      "background: repeating-linear-gradient(135deg, rgba(255,255,255,.10) 0 10px, transparent 10px 20px),"
      + "linear-gradient(" + b.getAttribute("data-ang") + "," + p.a + "," + p.b + ");");
  });

  var qtyEl = document.getElementById("pd-qty");
  document.getElementById("pd-add").addEventListener("click", function () {
    var n = Math.max(1, parseInt(qtyEl.value, 10) || 1);
    Cart.add(p.id, n);
    var msg = document.getElementById("pd-msg");
    msg.textContent = n + (n === 1 ? " item" : " items") + " added to your cart.";
    msg.hidden = false;
  });

  /* "You may also like" — three other items from the catalog. */
  var also = document.getElementById("pd-also");
  if (also) {
    var others = CATALOG.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
    also.innerHTML = others.map(cardHTML).join("");
    wireCardClicks(also);
  }
}

/* -------------------------------------------------------------
   7. CART PAGE — JavaScript item: running total
   ------------------------------------------------------------- */
function initCartPage() {
  var list = document.getElementById("cart-items");
  if (!list) { return; }

  function render() {
    if (Cart.items.length === 0) {
      list.innerHTML = '<li class="empty-state"><h3>Your cart is empty</h3>'
        + '<p>Nothing here yet. Have a look at what is in stock.</p>'
        + '<a class="btn" href="shop.html">Browse the shop</a></li>';
    } else {
      list.innerHTML = Cart.items.map(function (line) {
        var p = findProduct(line.id);
        if (!p) { return ""; }
        return '<li class="cart-row">'
          + '<div class="thumb" style="' + artStyle(p) + '"></div>'
          + '<div><div class="cname">' + p.name + '</div>'
          +   '<div class="cmeta">' + p.cat + ' &middot; ' + p.sku + ' &middot; ' + money(p.price) + ' each</div>'
          +   '<div class="qty" style="margin-top:.5rem">'
          +     '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity">&minus;</button>'
          +     '<span class="n">' + line.qty + '</span>'
          +     '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity">+</button>'
          +   '</div></div>'
          + '<div class="cright">'
          +   '<span class="cprice">' + money(p.price * line.qty) + '</span>'
          +   '<button type="button" class="link-remove" data-del="' + p.id + '">Remove</button>'
          + '</div></li>';
      }).join("");
    }

    var sub  = Cart.subtotal();
    var ship = Cart.shipping();
    document.getElementById("sum-sub").textContent   = money(sub);
    document.getElementById("sum-tax").textContent   = money(Cart.tax());
    document.getElementById("sum-ship").textContent  = ship === 0 ? "Free" : money(ship);
    document.getElementById("sum-total").textContent = money(Cart.total());

    var note = document.getElementById("ship-note");
    if (sub === 0) {
      note.textContent = "Shipping is free on orders over " + money(FREE_SHIP_MIN) + ".";
    } else if (ship === 0) {
      note.textContent = "This order ships free.";
    } else {
      note.textContent = "Add " + money(FREE_SHIP_MIN - sub) + " more for free shipping.";
    }

    var go = document.getElementById("to-checkout");
    if (go) { go.classList.toggle("btn-quiet", Cart.items.length === 0); }
  }

  list.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.getAttribute) { return; }
    var inc = t.getAttribute("data-inc");
    var dec = t.getAttribute("data-dec");
    var del = t.getAttribute("data-del");
    if (inc) {
      var li = Cart.items.filter(function (l) { return l.id === inc; })[0];
      Cart.setQty(inc, li.qty + 1); render();
    } else if (dec) {
      var ld = Cart.items.filter(function (l) { return l.id === dec; })[0];
      Cart.setQty(dec, ld.qty - 1); render();
    } else if (del) {
      Cart.remove(del); render();
    }
  });

  render();
}

/* -------------------------------------------------------------
   8. VALIDATION HELPERS
   ------------------------------------------------------------- */
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
var ZIP_RE   = /^\d{5}(-\d{4})?$/;
var PHONE_RE = /^[\d\s().+-]{10,}$/;

/* Shows or clears the message under one field. */
function setError(input, message) {
  var slot = document.getElementById(input.id + "-error");
  if (slot) { slot.textContent = message || ""; }
  if (message) {
    input.classList.add("invalid");
    input.classList.remove("valid");
    input.setAttribute("aria-invalid", "true");
  } else {
    input.classList.remove("invalid");
    input.classList.add("valid");
    input.setAttribute("aria-invalid", "false");
  }
  return !message;
}

/* -------------------------------------------------------------
   9. REGISTRATION FORM — the required JavaScript item
   ------------------------------------------------------------- */
function initRegister() {
  var form = document.getElementById("register-form");
  if (!form) { return; }

  var f = {
    first: document.getElementById("reg-first"),
    last:  document.getElementById("reg-last"),
    email: document.getElementById("reg-email"),
    pass:  document.getElementById("reg-pass"),
    conf:  document.getElementById("reg-conf"),
    terms: document.getElementById("reg-terms")
  };

  function checkFirst() {
    return setError(f.first, f.first.value.trim().length < 2
      ? "Enter your first name." : "");
  }
  function checkLast() {
    return setError(f.last, f.last.value.trim().length < 2
      ? "Enter your last name." : "");
  }
  function checkEmail() {
    var v = f.email.value.trim();
    if (v === "")             { return setError(f.email, "Enter your email address."); }
    if (!EMAIL_RE.test(v))    { return setError(f.email, "That does not look like an email address."); }
    return setError(f.email, "");
  }

  /* Scores a password out of 4 and drives the strength meter. */
  function scorePassword(v) {
    var score = 0;
    if (v.length >= 8)        { score++; }
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) { score++; }
    if (/\d/.test(v))         { score++; }
    if (/[^A-Za-z0-9]/.test(v)) { score++; }
    return score;
  }
  function checkPass() {
    var v = f.pass.value;
    var score = scorePassword(v);
    var bar   = document.querySelector("#pass-meter span");
    var label = document.getElementById("pass-label");
    var pct   = [0, 25, 50, 75, 100][score];
    var words = ["", "Weak", "Fair", "Good", "Strong"];
    var tints = ["", "#a3342c", "#9a6f1c", "#4b7a5e", "#27584a"];

    if (bar) {
      bar.style.width = pct + "%";
      bar.style.background = tints[score] || "#a3342c";
    }
    if (label) {
      label.textContent = v === ""
        ? "At least 8 characters, with a capital letter and a number."
        : words[score] + " password";
    }

    if (v === "")        { return setError(f.pass, "Choose a password."); }
    if (v.length < 8)    { return setError(f.pass, "Use at least 8 characters."); }
    if (!/[A-Z]/.test(v)){ return setError(f.pass, "Include at least one capital letter."); }
    if (!/\d/.test(v))   { return setError(f.pass, "Include at least one number."); }
    return setError(f.pass, "");
  }
  function checkConf() {
    if (f.conf.value === "")            { return setError(f.conf, "Re-type your password."); }
    if (f.conf.value !== f.pass.value)  { return setError(f.conf, "The two passwords do not match."); }
    return setError(f.conf, "");
  }
  function checkTerms() {
    var slot = document.getElementById("reg-terms-error");
    if (!f.terms.checked) {
      if (slot) { slot.textContent = "You must accept the Terms of Service."; }
      return false;
    }
    if (slot) { slot.textContent = ""; }
    return true;
  }

  /* Validate each field as the user leaves it, not while they type. */
  f.first.addEventListener("blur", checkFirst);
  f.last.addEventListener("blur",  checkLast);
  f.email.addEventListener("blur", checkEmail);
  f.pass.addEventListener("input", checkPass);
  f.conf.addEventListener("blur",  checkConf);
  f.terms.addEventListener("change", checkTerms);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Run every check — & would stop at the first failure. */
    var ok = checkFirst() & checkLast() & checkEmail()
           & checkPass() & checkConf() & checkTerms();

    var banner = document.getElementById("reg-result");
    banner.hidden = false;

    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Welcome, " + f.first.value.trim()
        + ". Your account has been created.";
      form.reset();
      document.querySelector("#pass-meter span").style.width = "0";
      document.getElementById("pass-label").textContent =
        "At least 8 characters, with a capital letter and a number.";
      Array.prototype.forEach.call(form.querySelectorAll(".valid"), function (el) {
        el.classList.remove("valid");
      });
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Please fix the highlighted fields below.";
      var firstBad = form.querySelector(".invalid");
      if (firstBad) { firstBad.focus(); }
    }
  });
}

/* -------------------------------------------------------------
   10. LOGIN FORM
   ------------------------------------------------------------- */
function initLogin() {
  var form = document.getElementById("login-form");
  if (!form) { return; }
  var email = document.getElementById("log-email");
  var pass  = document.getElementById("log-pass");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var okEmail = setError(email, EMAIL_RE.test(email.value.trim())
      ? "" : "Enter a valid email address.");
    var okPass  = setError(pass, pass.value.length >= 1
      ? "" : "Enter your password.");

    var banner = document.getElementById("log-result");
    banner.hidden = false;
    if (okEmail && okPass) {
      banner.className = "alert alert-ok";
      banner.textContent = "Signed in. (This demo does not store accounts.)";
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Check your email and password.";
    }
  });
}

/* -------------------------------------------------------------
   11. CONTACT FORM
   ------------------------------------------------------------- */
function initContact() {
  var form = document.getElementById("contact-form");
  if (!form) { return; }
  var name  = document.getElementById("ct-name");
  var email = document.getElementById("ct-email");
  var topic = document.getElementById("ct-topic");
  var msg   = document.getElementById("ct-msg");
  var countEl = document.getElementById("ct-count");

  msg.addEventListener("input", function () {
    countEl.textContent = msg.value.length + " / 600 characters";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = setError(name, name.value.trim().length >= 2 ? "" : "Enter your name.")
           & setError(email, EMAIL_RE.test(email.value.trim()) ? "" : "Enter a valid email address.")
           & setError(topic, topic.value !== "" ? "" : "Choose a subject.")
           & setError(msg, msg.value.trim().length >= 15
               ? "" : "Tell us a little more — at least 15 characters.");

    var banner = document.getElementById("ct-result");
    banner.hidden = false;
    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Thanks, " + name.value.trim()
        + ". We reply to messages within two business days.";
      form.reset();
      countEl.textContent = "0 / 600 characters";
      Array.prototype.forEach.call(form.querySelectorAll(".valid"), function (el) {
        el.classList.remove("valid");
      });
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Please fix the highlighted fields below.";
    }
  });
}

/* -------------------------------------------------------------
   12. CHECKOUT
   ------------------------------------------------------------- */
function initCheckout() {
  var form = document.getElementById("checkout-form");
  if (!form) { return; }

  /* Order summary mirrors the cart. */
  var box = document.getElementById("co-lines");
  if (box) {
    box.innerHTML = Cart.items.length
      ? Cart.items.map(function (l) {
          var p = findProduct(l.id);
          return '<div class="sum-row"><span class="label">' + p.name
            + ' &times;' + l.qty + '</span><span>' + money(p.price * l.qty) + '</span></div>';
        }).join("")
      : '<div class="sum-row"><span class="label">No items yet</span><span>$0.00</span></div>';

    document.getElementById("co-sub").textContent   = money(Cart.subtotal());
    document.getElementById("co-tax").textContent   = money(Cart.tax());
    document.getElementById("co-ship").textContent  = Cart.shipping() === 0 ? "Free" : money(Cart.shipping());
    document.getElementById("co-total").textContent = money(Cart.total());
  }

  var fullname = document.getElementById("co-name");
  var email    = document.getElementById("co-email");
  var addr     = document.getElementById("co-addr");
  var city     = document.getElementById("co-city");
  var zip      = document.getElementById("co-zip");
  var phone    = document.getElementById("co-phone");
  var card     = document.getElementById("co-card");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var digits = card.value.replace(/\D/g, "");

    var ok = setError(fullname, fullname.value.trim().length >= 3 ? "" : "Enter the name on the order.")
           & setError(email, EMAIL_RE.test(email.value.trim()) ? "" : "Enter a valid email address.")
           & setError(addr, addr.value.trim().length >= 5 ? "" : "Enter a street address.")
           & setError(city, city.value.trim().length >= 2 ? "" : "Enter a city.")
           & setError(zip, ZIP_RE.test(zip.value.trim()) ? "" : "Enter a 5-digit ZIP code.")
           & setError(phone, PHONE_RE.test(phone.value.trim()) ? "" : "Enter a phone number.")
           & setError(card, digits.length === 16 ? "" : "Enter the 16 digits of your card.");

    var banner = document.getElementById("co-result");
    banner.hidden = false;
    if (ok && Cart.items.length === 0) {
      banner.className = "alert alert-bad";
      banner.textContent = "Your cart is empty. Add something before checking out.";
      return;
    }
    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Order placed. A confirmation is on its way to "
        + email.value.trim() + ".";
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Please fix the highlighted fields below.";
    }
  });
}

/* -------------------------------------------------------------
   13. START
   ------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  initHeader();
  initHome();
  initShop();
  initProduct();
  initCartPage();
  initRegister();
  initLogin();
  initContact();
  initCheckout();
});
