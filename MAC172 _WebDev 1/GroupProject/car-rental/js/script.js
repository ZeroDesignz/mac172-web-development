/* ===================================================================
   Hudson Auto Rental — MAC172 Group Project
   Shared JavaScript for all pages.

   JavaScript items in this file:
     1. Registration form validation   (register.html)  - required
     2. Rental cost calculator          (vehicle.html, booking.html)
     3. Fleet filter / sort / search    (fleet.html)
     4. Date and driver-age validation  (every booking step)
     5. Contact form validation
     6. Mobile navigation toggle
   =================================================================== */

/* -------------------------------------------------------------
   1. DATA
   ------------------------------------------------------------- */
var FLEET = [
  { id:"versa",   cls:"Economy",  name:"Nissan Versa",        body:"sedan", rate:39,  seats:5, bags:2, doors:4, trans:"Automatic", mpg:"35 mpg", a:"#8fa9b8", b:"#2f5064" },
  { id:"rio",     cls:"Economy",  name:"Kia Rio",             body:"sedan", rate:42,  seats:5, bags:2, doors:4, trans:"Automatic", mpg:"36 mpg", a:"#a4b3a0", b:"#3d5244" },
  { id:"corolla", cls:"Midsize",  name:"Toyota Corolla",      body:"sedan", rate:48,  seats:5, bags:3, doors:4, trans:"Automatic", mpg:"34 mpg", a:"#9fa8bb", b:"#3a4361" },
  { id:"accord",  cls:"Midsize",  name:"Honda Accord",        body:"sedan", rate:62,  seats:5, bags:3, doors:4, trans:"Automatic", mpg:"32 mpg", a:"#8e98a3", b:"#333c47" },
  { id:"rav4",    cls:"SUV",      name:"Toyota RAV4",         body:"suv",   rate:78,  seats:5, bags:4, doors:5, trans:"Automatic", mpg:"30 mpg", a:"#9bb0a2", b:"#2f4a3a" },
  { id:"cherokee",cls:"SUV",      name:"Jeep Grand Cherokee", body:"suv",   rate:96,  seats:5, bags:4, doors:5, trans:"Automatic", mpg:"22 mpg", a:"#b0a38d", b:"#4c4132" },
  { id:"pacifica",cls:"Van",      name:"Chrysler Pacifica",   body:"van",   rate:104, seats:7, bags:5, doors:5, trans:"Automatic", mpg:"22 mpg", a:"#9aa7b4", b:"#36414d" },
  { id:"transit", cls:"Van",      name:"Ford Transit 12-Seat",body:"van",   rate:126, seats:12,bags:8, doors:4, trans:"Automatic", mpg:"17 mpg", a:"#a8aaa6", b:"#434641" },
  { id:"bmw5",    cls:"Luxury",   name:"BMW 5 Series",        body:"sedan", rate:135, seats:5, bags:3, doors:4, trans:"Automatic", mpg:"28 mpg", a:"#8c8f99", b:"#2b2e38" },
  { id:"model3",  cls:"Electric", name:"Tesla Model 3",       body:"sedan", rate:89,  seats:5, bags:3, doors:4, trans:"Automatic", mpg:"132 MPGe", a:"#9db8c4", b:"#2b4d5c" }
];

var EXTRAS = [
  { id:"cdw",   label:"Collision damage waiver", cost:19 },
  { id:"gps",   label:"GPS navigation",          cost:7  },
  { id:"driver",label:"Additional driver",       cost:12 },
  { id:"seat",  label:"Child safety seat",       cost:9  },
  { id:"miles", label:"Unlimited mileage",       cost:15 }
];

var LOCATIONS = ["LaGuardia Airport (LGA)", "JFK Airport (JFK)",
                 "Long Island City", "Midtown Manhattan", "Downtown Brooklyn"];

var TAX_RATE      = 0.145;  // NY state tax + airport concession recovery fee
var YOUNG_SURCH   = 25;     // per day, drivers aged 21-24
var YOUNG_CUTOFF  = 25;

/* -------------------------------------------------------------
   2. HELPERS
   ------------------------------------------------------------- */
function findVehicle(id) {
  for (var i = 0; i < FLEET.length; i++) {
    if (FLEET[i].id === id) { return FLEET[i]; }
  }
  return null;
}

function money(n) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isoDate(d) {
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function addDays(d, n) {
  var x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function parseDate(s) {
  if (!s) { return null; }
  var d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function prettyDate(s) {
  var d = parseDate(s);
  if (!d) { return "—"; }
  return d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
}

/* Number of rental days between two date strings. */
function daysBetween(fromStr, toStr) {
  var a = parseDate(fromStr);
  var b = parseDate(toStr);
  if (!a || !b) { return 0; }
  var n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}

var store = {
  get: function (key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set: function (key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
};

/* -------------------------------------------------------------
   3. SEARCH STATE — shared by every page
   ------------------------------------------------------------- */
var Search = {
  data: null,

  defaults: function () {
    var now = new Date();
    return {
      location: LOCATIONS[0],
      pickup:   isoDate(addDays(now, 3)),
      dropoff:  isoDate(addDays(now, 8)),
      age:      30
    };
  },

  load: function () {
    this.data = store.get("hudson_search", null) || this.defaults();
    return this.data;
  },

  save: function (next) {
    this.data = next;
    store.set("hudson_search", next);
  },

  days: function () { return daysBetween(this.data.pickup, this.data.dropoff); }
};

var Booking = {
  get: function () { return store.get("hudson_booking", null); },
  set: function (b) { store.set("hudson_booking", b); },
  clear: function () { store.set("hudson_booking", null); }
};

/* -------------------------------------------------------------
   4. PRICING — the rental cost calculator
   ------------------------------------------------------------- */
function priceRental(vehicle, days, chosenExtras, age) {
  var base = vehicle.rate * days;

  var perDayExtras = 0;
  chosenExtras.forEach(function (id) {
    EXTRAS.forEach(function (x) { if (x.id === id) { perDayExtras += x.cost; } });
  });
  var extrasTotal = perDayExtras * days;

  var young = (age && age < YOUNG_CUTOFF) ? YOUNG_SURCH * days : 0;

  var subtotal = base + extrasTotal + young;
  var taxes    = subtotal * TAX_RATE;

  return {
    days: days,
    base: base,
    extras: extrasTotal,
    young: young,
    subtotal: subtotal,
    taxes: taxes,
    total: subtotal + taxes,
    perDay: days > 0 ? (subtotal + taxes) / days : 0
  };
}

/* -------------------------------------------------------------
   5. VEHICLE ARTWORK
   Simple silhouettes stand in for photographs. Replace with real
   <img> tags before submitting — Layout and Design is 20%.
   ------------------------------------------------------------- */
var SHAPES = {
  sedan: "M6,56 C6,50 10,46 16,45 L34,42 L48,30 C50,28 53,27 56,27 L84,27 "
       + "C88,27 91,29 93,32 L102,45 L114,48 C119,49 122,52 122,56 L122,62 "
       + "C122,64 120,66 118,66 L10,66 C8,66 6,64 6,62 Z",
  suv:   "M6,52 C6,46 10,42 16,41 L30,38 L42,24 C44,22 47,21 50,21 L92,21 "
       + "C96,21 99,23 101,26 L108,40 L114,43 C119,44 122,48 122,52 L122,62 "
       + "C122,64 120,66 118,66 L10,66 C8,66 6,64 6,62 Z",
  van:   "M8,46 C8,38 12,32 20,28 L40,20 C43,19 46,18 49,18 L104,18 "
       + "C112,18 118,24 118,32 L118,62 C118,64 116,66 114,66 L12,66 "
       + "C10,66 8,64 8,62 Z"
};

function vehicleArt(v, extraClass) {
  return '<div class="veh-art ' + (extraClass || "") + '" role="img" aria-label="'
    + v.name + '" style="background:linear-gradient(160deg,' + v.a + ',' + v.b + ')">'
    + '<svg viewBox="0 0 128 80" aria-hidden="true">'
    +   '<path class="silhouette" d="' + SHAPES[v.body] + '"></path>'
    +   '<circle class="wheel" cx="36" cy="66" r="10"></circle>'
    +   '<circle class="wheel" cx="94" cy="66" r="10"></circle>'
    + '</svg></div>';
}

/* -------------------------------------------------------------
   6. SHARED UI
   ------------------------------------------------------------- */
function initHeader() {
  var flag = document.getElementById("quote-flag");
  if (flag) {
    var b = Booking.get();
    if (b && findVehicle(b.vehicleId)) {
      flag.textContent = "1";
      flag.classList.remove("is-empty");
    } else {
      flag.textContent = "0";
      flag.classList.add("is-empty");
    }
  }

  var toggle = document.getElementById("nav-toggle");
  var nav    = document.getElementById("mainnav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}

/* Fills the five search fields and keeps them in sync with storage. */
function initSearchBar() {
  var form = document.getElementById("search-form");
  if (!form) { return; }

  var s = Search.load();
  var loc  = document.getElementById("s-loc");
  var pick = document.getElementById("s-pick");
  var drop = document.getElementById("s-drop");
  var age  = document.getElementById("s-age");

  loc.innerHTML = LOCATIONS.map(function (l) {
    return '<option' + (l === s.location ? " selected" : "") + '>' + l + '</option>';
  }).join("");
  pick.value = s.pickup;
  drop.value = s.dropoff;
  age.value  = s.age;

  var today = isoDate(new Date());
  pick.min = today;
  drop.min = today;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("s-msg");

    var days = daysBetween(pick.value, drop.value);
    if (days < 1) {
      msg.hidden = false;
      msg.className = "alert alert-bad";
      msg.textContent = "The return date must be after the pick-up date.";
      return;
    }
    if (Number(age.value) < 21) {
      msg.hidden = false;
      msg.className = "alert alert-bad";
      msg.textContent = "Drivers must be at least 21 to rent from Hudson.";
      return;
    }
    if (msg) { msg.hidden = true; }

    Search.save({
      location: loc.value, pickup: pick.value,
      dropoff: drop.value, age: Number(age.value)
    });
    window.location.href = "fleet.html";
  });
}

/* -------------------------------------------------------------
   7. HOME PAGE
   ------------------------------------------------------------- */
function initHome() {
  var grid = document.getElementById("home-fleet");
  if (!grid) { return; }
  Search.load();
  var days = Search.days();

  grid.innerHTML = FLEET.slice(0, 3).map(function (v) {
    return vehicleRow(v, days);
  }).join("");
  wireVehicleLinks(grid);
}

/* -------------------------------------------------------------
   8. ONE VEHICLE ROW — used on the home and fleet pages
   ------------------------------------------------------------- */
function vehicleRow(v, days) {
  var est = days > 0 ? priceRental(v, days, [], Search.data ? Search.data.age : 30) : null;
  return '<article class="veh-row">'
    + vehicleArt(v)
    + '<div class="veh-body">'
    +   '<span class="veh-class">' + v.cls + '</span>'
    +   '<h3 class="veh-name">' + v.name + '</h3>'
    +   '<span class="veh-or">or similar</span>'
    +   '<ul class="specs">'
    +     '<li>' + v.seats + ' seats</li>'
    +     '<li>' + v.bags + ' bags</li>'
    +     '<li>' + v.doors + ' doors</li>'
    +     '<li>' + v.trans + '</li>'
    +     '<li>' + v.mpg + '</li>'
    +   '</ul>'
    + '</div>'
    + '<div class="veh-buy">'
    +   '<div class="veh-rate">' + money(v.rate) + '<small>/day</small></div>'
    +   (est ? '<div class="veh-est">' + est.days + ' days, all in: <strong>'
            + money(est.total) + '</strong></div>' : '')
    +   '<a class="btn btn-sm" href="vehicle.html?id=' + v.id + '" data-goto="' + v.id + '">Select</a>'
    + '</div></article>';
}

function wireVehicleLinks(root) {
  root.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("[data-goto]");
    if (link) { store.set("hudson_vehicle", link.getAttribute("data-goto")); }
  });
}

/* -------------------------------------------------------------
   9. FLEET PAGE — filter, sort and search
   ------------------------------------------------------------- */
function initFleet() {
  var list = document.getElementById("fleet-list");
  if (!list) { return; }

  Search.load();
  var days = Search.days();

  var summary = document.getElementById("fleet-summary");
  if (summary) {
    summary.textContent = Search.data.location + " · "
      + prettyDate(Search.data.pickup) + " to " + prettyDate(Search.data.dropoff)
      + " · " + days + (days === 1 ? " day" : " days")
      + " · driver age " + Search.data.age;
  }

  var searchBox = document.getElementById("fleet-search");
  var sortBox   = document.getElementById("fleet-sort");
  var countEl   = document.getElementById("fleet-count");
  var chips     = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cls       = "All";

  function render() {
    var q = searchBox.value.trim().toLowerCase();

    var rows = FLEET.filter(function (v) {
      var inCls = (cls === "All") || (v.cls === cls);
      var inQ   = (q === "")
        || v.name.toLowerCase().indexOf(q) > -1
        || v.cls.toLowerCase().indexOf(q) > -1;
      return inCls && inQ;
    });

    var how = sortBox.value;
    rows.sort(function (a, b) {
      if (how === "price-asc")  { return a.rate - b.rate; }
      if (how === "price-desc") { return b.rate - a.rate; }
      if (how === "seats")      { return b.seats - a.seats; }
      if (how === "name")       { return a.name.localeCompare(b.name); }
      return 0;
    });

    countEl.textContent = rows.length === 1
      ? "1 vehicle available"
      : rows.length + " vehicles available";

    list.innerHTML = rows.length
      ? rows.map(function (v) { return vehicleRow(v, days); }).join("")
      : '<p class="empty-state">No vehicles match that search. Choose All to start over.</p>';
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      cls = chip.getAttribute("data-cls");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      render();
    });
  });

  searchBox.addEventListener("input", render);
  sortBox.addEventListener("change", render);
  wireVehicleLinks(list);
  render();
}

/* -------------------------------------------------------------
   10. VEHICLE PAGE — the booking calculator
   ------------------------------------------------------------- */
function initVehicle() {
  var root = document.getElementById("vehicle-detail");
  if (!root) { return; }

  Search.load();

  var id = null;
  var m = window.location.search.match(/[?&]id=([^&]+)/);
  if (m) { id = decodeURIComponent(m[1]); }
  if (!id) { id = store.get("hudson_vehicle", null); }
  var v = findVehicle(id) || FLEET[4];

  document.getElementById("v-crumb").textContent = v.name;
  document.getElementById("v-art").innerHTML = vehicleArt(v, "detail-art");
  document.getElementById("v-cls").textContent   = v.cls;
  document.getElementById("v-name").textContent  = v.name;
  document.getElementById("v-seats").textContent = v.seats;
  document.getElementById("v-bags").textContent  = v.bags;
  document.getElementById("v-doors").textContent = v.doors;
  document.getElementById("v-trans").textContent = v.trans;
  document.getElementById("v-mpg").textContent   = v.mpg;
  document.getElementById("v-rate").textContent  = money(v.rate);

  /* Booking controls */
  var pick = document.getElementById("v-pick");
  var drop = document.getElementById("v-drop");
  var age  = document.getElementById("v-age");
  var loc  = document.getElementById("v-loc");

  loc.innerHTML = LOCATIONS.map(function (l) {
    return '<option' + (l === Search.data.location ? " selected" : "") + '>' + l + '</option>';
  }).join("");
  pick.value = Search.data.pickup;
  drop.value = Search.data.dropoff;
  age.value  = Search.data.age;
  pick.min = isoDate(new Date());
  drop.min = isoDate(new Date());

  var box = document.getElementById("v-extras");
  box.innerHTML = EXTRAS.map(function (x) {
    return '<label><input type="checkbox" data-x="' + x.id + '"'
      + (x.id === "cdw" ? " checked" : "") + '> ' + x.label
      + '<span class="x-price">' + money(x.cost) + '/day</span></label>';
  }).join("");

  function chosenExtras() {
    return Array.prototype.map.call(
      box.querySelectorAll("input:checked"),
      function (cb) { return cb.getAttribute("data-x"); }
    );
  }

  function recalc() {
    var days = daysBetween(pick.value, drop.value);
    var warn = document.getElementById("v-warn");
    var go   = document.getElementById("v-reserve");

    /* Date and age validation */
    if (days < 1) {
      warn.hidden = false;
      warn.className = "alert alert-bad";
      warn.textContent = "The return date must be after the pick-up date.";
      go.disabled = true; go.classList.add("btn-outline");
    } else if (Number(age.value) < 21) {
      warn.hidden = false;
      warn.className = "alert alert-bad";
      warn.textContent = "Drivers must be at least 21 to rent from Hudson.";
      go.disabled = true; go.classList.add("btn-outline");
    } else {
      warn.hidden = true;
      go.disabled = false; go.classList.remove("btn-outline");
    }

    var q = priceRental(v, days, chosenExtras(), Number(age.value));

    document.getElementById("q-days").textContent  = q.days + (q.days === 1 ? " day" : " days");
    document.getElementById("q-base").textContent  = money(q.base);
    document.getElementById("q-extras").textContent = money(q.extras);
    document.getElementById("q-taxes").textContent = money(q.taxes);
    document.getElementById("q-total").textContent = money(q.total);

    var youngRow = document.getElementById("q-young-row");
    if (q.young > 0) {
      youngRow.hidden = false;
      document.getElementById("q-young").textContent = money(q.young);
    } else {
      youngRow.hidden = true;
    }

    document.getElementById("q-perday").textContent = q.days > 0
      ? money(q.perDay) + " per day, everything included"
      : "Choose your dates to see a price.";

    return q;
  }

  [pick, drop, age, loc].forEach(function (el) {
    el.addEventListener("change", recalc);
    el.addEventListener("input", recalc);
  });
  box.addEventListener("change", recalc);

  document.getElementById("v-reserve").addEventListener("click", function () {
    var days = daysBetween(pick.value, drop.value);
    if (days < 1 || Number(age.value) < 21) { recalc(); return; }

    Search.save({
      location: loc.value, pickup: pick.value,
      dropoff: drop.value, age: Number(age.value)
    });
    Booking.set({
      vehicleId: v.id,
      extras: chosenExtras(),
      location: loc.value,
      pickup: pick.value,
      dropoff: drop.value,
      age: Number(age.value)
    });
    window.location.href = "booking.html";
  });

  recalc();
}

/* -------------------------------------------------------------
   11. BOOKING PAGE — review and confirm
   ------------------------------------------------------------- */
function initBooking() {
  var root = document.getElementById("booking-page");
  if (!root) { return; }

  var b = Booking.get();
  var v = b ? findVehicle(b.vehicleId) : null;

  var panel = document.getElementById("b-summary");
  var form  = document.getElementById("booking-form");

  if (!v) {
    panel.innerHTML = '<p class="empty-state"><strong>No reservation yet.</strong><br>'
      + 'Choose a vehicle first.</p>';
    document.getElementById("b-quote").hidden = true;
    form.hidden = true;
    return;
  }

  var days = daysBetween(b.pickup, b.dropoff);
  var q = priceRental(v, days, b.extras, b.age);

  var extraNames = b.extras.map(function (id) {
    var found = "";
    EXTRAS.forEach(function (x) { if (x.id === id) { found = x.label; } });
    return found;
  }).filter(Boolean);

  panel.innerHTML =
      vehicleArt(v, "detail-art")
    + '<div class="spec-grid" style="margin-top:1.2rem">'
    +   '<div class="spec-cell"><span class="k">Vehicle</span><span class="v">' + v.name + '</span></div>'
    +   '<div class="spec-cell"><span class="k">Class</span><span class="v">' + v.cls + '</span></div>'
    +   '<div class="spec-cell"><span class="k">Pick-up</span><span class="v">' + prettyDate(b.pickup) + '</span></div>'
    +   '<div class="spec-cell"><span class="k">Return</span><span class="v">' + prettyDate(b.dropoff) + '</span></div>'
    +   '<div class="spec-cell"><span class="k">Location</span><span class="v">' + b.location + '</span></div>'
    +   '<div class="spec-cell"><span class="k">Driver age</span><span class="v">' + b.age + '</span></div>'
    + '</div>'
    + '<h3 style="margin-top:1.4rem">Options included</h3>'
    + (extraNames.length
        ? '<ul class="specs">' + extraNames.map(function (n) { return '<li>' + n + '</li>'; }).join("") + '</ul>'
        : '<p style="color:var(--ink-faint);font-size:.9rem">No extras selected. '
          + '<a href="vehicle.html?id=' + v.id + '">Add some</a>.</p>');

  document.getElementById("bq-days").textContent   = days + (days === 1 ? " day" : " days");
  document.getElementById("bq-base").textContent   = money(q.base);
  document.getElementById("bq-extras").textContent = money(q.extras);
  document.getElementById("bq-taxes").textContent  = money(q.taxes);
  document.getElementById("bq-total").textContent  = money(q.total);
  var yr = document.getElementById("bq-young-row");
  if (q.young > 0) {
    yr.hidden = false;
    document.getElementById("bq-young").textContent = money(q.young);
  } else { yr.hidden = true; }

  /* Driver details form */
  var name  = document.getElementById("b-name");
  var email = document.getElementById("b-email");
  var phone = document.getElementById("b-phone");
  var lic   = document.getElementById("b-lic");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = setError(name, name.value.trim().length >= 3 ? "" : "Enter the driver's full name.")
           & setError(email, EMAIL_RE.test(email.value.trim()) ? "" : "Enter a valid email address.")
           & setError(phone, PHONE_RE.test(phone.value.trim()) ? "" : "Enter a phone number.")
           & setError(lic, /^[A-Za-z0-9-]{6,}$/.test(lic.value.trim())
               ? "" : "Enter the licence number, at least 6 characters.");

    var banner = document.getElementById("b-result");
    banner.hidden = false;
    if (ok) {
      /* Confirmation number: HA + date + a short random block. */
      var ref = "HA-" + isoDate(new Date()).replace(/-/g, "").slice(2)
              + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      banner.className = "alert alert-ok";
      banner.innerHTML = "<strong>Reservation confirmed.</strong><br>"
        + "Confirmation number <span class=\"mono\">" + ref + "</span>. "
        + "Bring this and your licence to " + b.location + " on "
        + prettyDate(b.pickup) + ".";
      form.querySelector("button[type=submit]").disabled = true;
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Please fix the highlighted fields below.";
    }
  });
}

/* -------------------------------------------------------------
   12. VALIDATION HELPERS
   ------------------------------------------------------------- */
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
var PHONE_RE = /^[\d\s().+-]{10,}$/;

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
   13. REGISTRATION — the required JavaScript item
   ------------------------------------------------------------- */
function initRegister() {
  var form = document.getElementById("register-form");
  if (!form) { return; }

  var f = {
    first: document.getElementById("reg-first"),
    last:  document.getElementById("reg-last"),
    email: document.getElementById("reg-email"),
    dob:   document.getElementById("reg-dob"),
    pass:  document.getElementById("reg-pass"),
    conf:  document.getElementById("reg-conf"),
    terms: document.getElementById("reg-terms")
  };

  function checkFirst() {
    return setError(f.first, f.first.value.trim().length < 2 ? "Enter your first name." : "");
  }
  function checkLast() {
    return setError(f.last, f.last.value.trim().length < 2 ? "Enter your last name." : "");
  }
  function checkEmail() {
    var v = f.email.value.trim();
    if (v === "")          { return setError(f.email, "Enter your email address."); }
    if (!EMAIL_RE.test(v)) { return setError(f.email, "That does not look like an email address."); }
    return setError(f.email, "");
  }

  /* Rental-specific rule: the account holder must be old enough to drive. */
  function checkDob() {
    var d = parseDate(f.dob.value);
    if (!d) { return setError(f.dob, "Enter your date of birth."); }
    var now = new Date();
    var years = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) { years--; }
    if (years < 21)  { return setError(f.dob, "Hudson rents to drivers aged 21 and over."); }
    if (years > 100) { return setError(f.dob, "Check that date of birth."); }
    return setError(f.dob, "");
  }

  function scorePassword(v) {
    var score = 0;
    if (v.length >= 8) { score++; }
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) { score++; }
    if (/\d/.test(v)) { score++; }
    if (/[^A-Za-z0-9]/.test(v)) { score++; }
    return score;
  }
  function checkPass() {
    var v = f.pass.value;
    var score = scorePassword(v);
    var bar = document.querySelector("#pass-meter span");
    var label = document.getElementById("pass-label");
    var pct = [0, 25, 50, 75, 100][score];
    var words = ["", "Weak", "Fair", "Good", "Strong"];
    var tints = ["", "#a8302a", "#b07518", "#3f7f5f", "#1d6b4a"];

    if (bar) { bar.style.width = pct + "%"; bar.style.background = tints[score] || "#a8302a"; }
    if (label) {
      label.textContent = v === ""
        ? "At least 8 characters, with a capital letter and a number."
        : words[score] + " password";
    }

    if (v === "")         { return setError(f.pass, "Choose a password."); }
    if (v.length < 8)     { return setError(f.pass, "Use at least 8 characters."); }
    if (!/[A-Z]/.test(v)) { return setError(f.pass, "Include at least one capital letter."); }
    if (!/\d/.test(v))    { return setError(f.pass, "Include at least one number."); }
    return setError(f.pass, "");
  }
  function checkConf() {
    if (f.conf.value === "")           { return setError(f.conf, "Re-type your password."); }
    if (f.conf.value !== f.pass.value) { return setError(f.conf, "The two passwords do not match."); }
    return setError(f.conf, "");
  }
  function checkTerms() {
    var slot = document.getElementById("reg-terms-error");
    if (!f.terms.checked) {
      if (slot) { slot.textContent = "You must accept the rental terms."; }
      return false;
    }
    if (slot) { slot.textContent = ""; }
    return true;
  }

  f.first.addEventListener("blur", checkFirst);
  f.last.addEventListener("blur",  checkLast);
  f.email.addEventListener("blur", checkEmail);
  f.dob.addEventListener("change", checkDob);
  f.pass.addEventListener("input", checkPass);
  f.conf.addEventListener("blur",  checkConf);
  f.terms.addEventListener("change", checkTerms);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = checkFirst() & checkLast() & checkEmail() & checkDob()
           & checkPass() & checkConf() & checkTerms();

    var banner = document.getElementById("reg-result");
    banner.hidden = false;
    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Welcome, " + f.first.value.trim()
        + ". Your Hudson account is ready.";
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
   14. LOGIN
   ------------------------------------------------------------- */
function initLogin() {
  var form = document.getElementById("login-form");
  if (!form) { return; }
  var email = document.getElementById("log-email");
  var pass  = document.getElementById("log-pass");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = setError(email, EMAIL_RE.test(email.value.trim()) ? "" : "Enter a valid email address.")
           & setError(pass, pass.value.length >= 1 ? "" : "Enter your password.");
    var banner = document.getElementById("log-result");
    banner.hidden = false;
    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Signed in. (This demo does not store accounts.)";
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Check your email and password.";
    }
  });
}

/* -------------------------------------------------------------
   15. CONTACT
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
        + ". Our team replies within one business day.";
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
   16. START
   ------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  Search.load();
  initHeader();
  initSearchBar();
  initHome();
  initFleet();
  initVehicle();
  initBooking();
  initRegister();
  initLogin();
  initContact();
});
