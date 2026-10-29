/* ============================================================================
   Kestrel Air — all site behaviour.

   A booking is a single object kept in localStorage under "kestrel.booking",
   so the five steps (search, choose, seats, passengers, payment) can hand work
   to each other across page loads without a server. Each page picks up the
   parts it needs and ignores the rest.
   ========================================================================= */

/* ------------------------------------------------------------ utilities */

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function money(n) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function pad(n) { return (n < 10 ? "0" : "") + n; }

/* Minutes past midnight -> "14:05". The board is on a 24-hour clock, the way
   airline schedules are actually printed. */
function clock(mins) {
  return pad(Math.floor(mins / 60) % 24) + ":" + pad(mins % 60);
}

/* "+1" when the arrival crosses midnight — the detail that stops someone
   booking what looks like a short evening hop and landing tomorrow. */
function nextDay(dep, arr) { return Math.floor(arr / 1440) > Math.floor(dep / 1440) ? 1 : 0; }

function duration(mins) {
  return Math.floor(mins / 60) + "h " + pad(mins % 60) + "m";
}

function todayISO() {
  var d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function prettyDate(iso) {
  if (!iso) return "";
  var p = iso.split("-");
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return days[d.getDay()] + " " + d.getDate() + " " + mons[d.getMonth()];
}

/* ------------------------------------------------------- booking storage */

var STORE = "kestrel.booking";

function blank() {
  return {
    from: "", to: "", depart: "", ret: "", pax: 1, trip: "round",
    flight: null, seats: [], passengers: [], ref: "", paid: false
  };
}

function load() {
  try {
    var raw = localStorage.getItem(STORE);
    if (!raw) return blank();
    var b = JSON.parse(raw);
    var base = blank();
    for (var k in base) if (!(k in b)) b[k] = base[k];
    return b;
  } catch (e) {
    return blank();
  }
}

function save(b) {
  try { localStorage.setItem(STORE, JSON.stringify(b)); } catch (e) { /* private mode */ }
}

/* A six-character record locator, the format every airline uses. Letters only,
   with I and O left out because they are too easy to read as 1 and 0. */
function newRef() {
  var ok = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var s = "";
  for (var i = 0; i < 6; i++) s += ok.charAt(Math.floor(Math.random() * ok.length));
  return s;
}

/* ------------------------------------------------------------- airports */

var AIRPORTS = [
  { code: "JFK", city: "New York",      name: "John F. Kennedy" },
  { code: "LAX", city: "Los Angeles",   name: "Los Angeles Intl" },
  { code: "ORD", city: "Chicago",       name: "O'Hare" },
  { code: "MIA", city: "Miami",         name: "Miami Intl" },
  { code: "DEN", city: "Denver",        name: "Denver Intl" },
  { code: "SEA", city: "Seattle",       name: "Seattle-Tacoma" },
  { code: "ATL", city: "Atlanta",       name: "Hartsfield-Jackson" },
  { code: "BOS", city: "Boston",        name: "Logan" },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl" },
  { code: "AUS", city: "Austin",        name: "Austin-Bergstrom" }
];

function cityOf(code) {
  for (var i = 0; i < AIRPORTS.length; i++) {
    if (AIRPORTS[i].code === code) return AIRPORTS[i].city;
  }
  return code;
}

/* ===========================================================================
   1. FLIGHT SEARCH — validation
   =========================================================================*/

function initSearch() {
  var form = $("#search-form");
  if (!form) return;

  var from = $("#from"), to = $("#to"),
      dep = $("#depart"), ret = $("#ret"), pax = $("#pax");

  /* No searching for yesterday. */
  var today = todayISO();
  if (dep) { dep.min = today; if (!dep.value) dep.value = today; }
  if (ret) ret.min = today;

  /* Round trip vs one way. The return field is only required for a round trip,
     so the tabs have to move the requirement, not just hide a box. */
  var retWrap = $("#ret-wrap");
  $$(".trip-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".trip-tab").forEach(function (t) { t.classList.remove("on"); });
      tab.classList.add("on");
      var oneway = tab.getAttribute("data-trip") === "one";
      if (retWrap) retWrap.style.visibility = oneway ? "hidden" : "visible";
      if (ret && oneway) { ret.value = ""; setErr(ret, ""); }
    });
  });

  /* Keep the return on or after the departure. */
  if (dep && ret) {
    dep.addEventListener("change", function () {
      ret.min = dep.value || today;
      if (ret.value && ret.value < dep.value) ret.value = dep.value;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    if (!from.value) { setErr(from, "Choose a departure airport."); ok = false; }
    else setErr(from, "");

    if (!to.value) { setErr(to, "Choose a destination."); ok = false; }
    else if (to.value === from.value) {
      setErr(to, "Departure and destination cannot be the same airport.");
      ok = false;
    } else setErr(to, "");

    if (!dep.value) { setErr(dep, "Choose a departure date."); ok = false; }
    else if (dep.value < today) { setErr(dep, "That date has already passed."); ok = false; }
    else setErr(dep, "");

    var oneway = $(".trip-tab.on") && $(".trip-tab.on").getAttribute("data-trip") === "one";
    if (!oneway && ret) {
      if (!ret.value) { setErr(ret, "Choose a return date, or switch to one way."); ok = false; }
      else if (ret.value < dep.value) { setErr(ret, "The return is before the departure."); ok = false; }
      else setErr(ret, "");
    }

    var n = parseInt(pax.value, 10);
    if (!n || n < 1 || n > 6) { setErr(pax, "Between 1 and 6 passengers."); ok = false; }
    else setErr(pax, "");

    if (!ok) return;

    var b = load();
    b.from = from.value;
    b.to = to.value;
    b.depart = dep.value;
    b.ret = oneway ? "" : ret.value;
    b.pax = n;
    b.trip = oneway ? "one" : "round";
    b.flight = null;
    b.seats = [];
    save(b);
    window.location.href = "flights.html";
  });
}

/* Attach or clear a message under a field, and colour the field to match. */
function setErr(el, msg) {
  if (!el) return;
  var box = el.parentNode.querySelector(".err");
  if (!box) {
    box = document.createElement("div");
    box.className = "err";
    el.parentNode.appendChild(box);
  }
  box.textContent = msg;
  el.classList.toggle("bad", !!msg);
  el.classList.toggle("ok", !msg && !!el.value);
}

/* ===========================================================================
   2. RESULTS — build a schedule, then filter and sort it
   =========================================================================*/

/* The schedule is generated from the route so the same search always produces
   the same flights. A random list that changed on every reload would make the
   filters impossible to check. */
function schedule(from, to) {
  var seed = 0;
  var key = from + to;
  for (var i = 0; i < key.length; i++) seed += key.charCodeAt(i) * (i + 3);

  var base = 160 + (seed % 220);           /* block time, minutes */
  var fare = 118 + (seed % 90);            /* cheapest fare       */
  var out = [];
  var departs = [370, 475, 620, 755, 880, 1010, 1135, 1265];

  for (var j = 0; j < departs.length; j++) {
    var stops = (j === 2 || j === 5) ? 1 : 0;
    var extra = stops ? 85 + ((seed + j * 17) % 50) : 0;
    var mins = base + extra + ((seed + j * 13) % 25);
    var price = fare + j * 11 + (stops ? -34 : 26) + ((seed + j * 7) % 40);
    out.push({
      no: "KS " + (100 + ((seed + j * 29) % 800)),
      dep: departs[j],
      arr: departs[j] + mins,
      mins: mins,
      stops: stops,
      via: stops ? ["ORD", "ATL", "DEN"][(seed + j) % 3] : "",
      fare: price,
      aircraft: ["A320neo", "737-800", "A321", "E190"][(seed + j) % 4],
      ontime: 72 + ((seed + j * 5) % 26)
    });
  }
  return out;
}

var RESULTS = { all: [], shown: [], stops: "any", when: "any", sort: "price" };

function initResults() {
  var board = $("#board");
  if (!board) return;

  var b = load();
  if (!b.from || !b.to) {
    board.innerHTML = '<div class="notice bad">No search yet. ' +
      '<a href="index.html">Start on the home page</a> and choose a route.</div>';
    return;
  }

  /* Route line above the board. */
  var head = $("#route-line");
  if (head) {
    head.innerHTML = cityOf(b.from) + ' <span class="code">(' + b.from + ')</span> to ' +
      cityOf(b.to) + ' <span class="code">(' + b.to + ')</span> &middot; ' +
      prettyDate(b.depart) + ' &middot; ' + b.pax +
      (b.pax === 1 ? " passenger" : " passengers");
  }

  RESULTS.all = schedule(b.from, b.to);

  $$("[data-stops]").forEach(function (c) {
    c.addEventListener("click", function () {
      $$("[data-stops]").forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      RESULTS.stops = c.getAttribute("data-stops");
      paintResults(b);
    });
  });

  $$("[data-when]").forEach(function (c) {
    c.addEventListener("click", function () {
      $$("[data-when]").forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      RESULTS.when = c.getAttribute("data-when");
      paintResults(b);
    });
  });

  var sortSel = $("#sort");
  if (sortSel) {
    sortSel.addEventListener("change", function () {
      RESULTS.sort = sortSel.value;
      paintResults(b);
    });
  }

  paintResults(b);
}

function paintResults(b) {
  var list = RESULTS.all.filter(function (f) {
    if (RESULTS.stops === "0" && f.stops !== 0) return false;
    if (RESULTS.stops === "1" && f.stops < 1) return false;
    if (RESULTS.when === "am" && f.dep >= 720) return false;
    if (RESULTS.when === "pm" && (f.dep < 720 || f.dep >= 1080)) return false;
    if (RESULTS.when === "eve" && f.dep < 1080) return false;
    return true;
  });

  list.sort(function (a, c) {
    if (RESULTS.sort === "price")    return a.fare - c.fare;
    if (RESULTS.sort === "duration") return a.mins - c.mins;
    if (RESULTS.sort === "depart")   return a.dep - c.dep;
    if (RESULTS.sort === "arrive")   return a.arr - c.arr;
    return 0;
  });

  RESULTS.shown = list;

  var count = $("#count");
  if (count) {
    count.textContent = list.length +
      (list.length === 1 ? " flight" : " flights") + " found";
  }

  var board = $("#board");
  if (!list.length) {
    board.innerHTML = '<div class="notice">No flights match those filters. ' +
      'Try "Any time" or allowing a connection.</div>';
    return;
  }

  var html = '<div class="board-head">' +
    "<div>Flight</div><div>Depart &rarr; Arrive</div><div>Duration</div>" +
    "<div>Stops</div><div></div></div>";

  list.forEach(function (f, i) {
    html += '<div class="flight" data-i="' + i + '">' +
      '<div class="f-carrier"><div><div class="f-no code">' + f.no + "</div>" +
        '<div class="faint">' + f.aircraft + "</div></div></div>" +
      '<div class="f-times">' +
        '<span class="f-time">' + clock(f.dep) + "</span>" +
        '<span class="f-arrow"></span>' +
        '<span class="f-time">' + clock(f.arr) +
          (nextDay(f.dep, f.arr) ? '<sup style="color:var(--signal)">+1</sup>' : "") +
          "</span>" +
      "</div>" +
      '<div><div class="f-dur">' + duration(f.mins) + "</div>" +
        '<div class="faint">' + f.ontime + "% on time</div></div>" +
      '<div class="f-stops">' + (f.stops
        ? '<span class="tag tag-hold">1 stop</span><div class="faint">via ' + f.via + "</div>"
        : '<span class="tag tag-go">Nonstop</span>') + "</div>" +
      '<div><div class="f-fare">' + money(f.fare) + "</div>" +
        '<button class="btn btn-sm pick" data-i="' + i + '">Select</button></div>' +
      "</div>";
  });

  board.innerHTML = html;

  $$(".pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = RESULTS.shown[parseInt(btn.getAttribute("data-i"), 10)];
      var bk = load();
      bk.flight = f;
      bk.seats = [];
      save(bk);
      window.location.href = "seats.html";
    });
  });
}

/* ===========================================================================
   3. SEAT MAP
   =========================================================================*/

var CABIN = { rows: 22, letters: ["A", "B", "C", "D", "E", "F"] };

/* Which seats are already sold. Derived from the flight number so the map is
   stable across reloads — the same flight always has the same cabin. */
function taken(flightNo) {
  var seed = 0;
  for (var i = 0; i < flightNo.length; i++) seed += flightNo.charCodeAt(i) * (i + 2);
  var out = {};
  for (var r = 1; r <= CABIN.rows; r++) {
    for (var c = 0; c < 6; c++) {
      if (((seed + r * 7 + c * 13) % 10) < 4) out[r + CABIN.letters[c]] = true;
    }
  }
  return out;
}

function seatClass(row) {
  if (row <= 3) return "first";
  if (row <= 7) return "extra";
  return "main";
}

function seatFee(row) {
  if (row <= 3) return 89;
  if (row <= 7) return 34;
  return 0;
}

function initSeats() {
  var map = $("#seatmap");
  if (!map) return;

  var b = load();
  if (!b.flight) {
    map.innerHTML = '<div class="notice bad">No flight chosen yet. ' +
      '<a href="index.html">Search for a flight</a> first.</div>';
    return;
  }

  var sold = taken(b.flight.no);
  var html = '<div class="cabin">';
  var lastClass = "";

  for (var r = 1; r <= CABIN.rows; r++) {
    var cls = seatClass(r);
    if (cls !== lastClass) {
      var label = cls === "first" ? "First &middot; $89 a seat"
                : cls === "extra" ? "Extra legroom &middot; $34 a seat"
                : "Main cabin &middot; included";
      html += '<div class="cabin-class">' + label + "</div>";
      lastClass = cls;
    }
    html += '<div class="seat-row">';
    for (var c = 0; c < 6; c++) {
      if (c === 3) html += '<div class="row-no">' + r + "</div>";
      var id = r + CABIN.letters[c];
      var isTaken = !!sold[id];
      html += '<button type="button" class="seat ' +
        (isTaken ? "taken" : cls === "main" ? "" : cls) +
        '" data-seat="' + id + '" data-row="' + r + '"' +
        (isTaken ? " disabled" : "") +
        ' aria-label="Seat ' + id + (isTaken ? ", taken" : ", available") + '">' +
        CABIN.letters[c] + "</button>";
    }
    html += "</div>";
  }

  map.innerHTML = html + "</div>";

  $$(".seat:not(.taken)", map).forEach(function (s) {
    s.addEventListener("click", function () { toggleSeat(s); });
  });

  paintSeatSummary();
}

function toggleSeat(el) {
  var b = load();
  var id = el.getAttribute("data-seat");
  var at = b.seats.indexOf(id);

  if (at > -1) {
    b.seats.splice(at, 1);
    el.classList.remove("sel");
  } else {
    /* One seat per passenger, no more. Say so rather than silently refusing. */
    if (b.seats.length >= b.pax) {
      var warn = $("#seat-warn");
      if (warn) {
        warn.textContent = "You have chosen " + b.pax +
          (b.pax === 1 ? " seat for 1 passenger." : " seats for " + b.pax + " passengers.") +
          " Deselect one before picking another.";
        warn.style.display = "block";
        setTimeout(function () { warn.style.display = "none"; }, 3200);
      }
      return;
    }
    b.seats.push(id);
    el.classList.add("sel");
  }
  save(b);
  paintSeatSummary();
}

function paintSeatSummary() {
  var b = load();
  var box = $("#seat-list");
  if (box) {
    box.textContent = b.seats.length ? b.seats.join(", ") : "None chosen yet";
  }

  var n = $("#seat-count");
  if (n) n.textContent = b.seats.length + " of " + b.pax;

  var fees = 0;
  b.seats.forEach(function (s) { fees += seatFee(parseInt(s, 10)); });

  var fe = $("#seat-fees");
  if (fe) fe.textContent = money(fees);

  var go = $("#to-passengers");
  if (go) {
    var ready = b.seats.length === b.pax;
    go.disabled = !ready;
    go.textContent = ready ? "Continue to passengers"
                           : "Choose " + (b.pax - b.seats.length) + " more";
  }

  paintFare();
}

/* ===========================================================================
   4. FARE SUMMARY — shared by seats, passengers and payment
   =========================================================================*/

function fareParts() {
  var b = load();
  if (!b.flight) return null;

  var air = b.flight.fare * b.pax;
  var seats = 0;
  b.seats.forEach(function (s) { seats += seatFee(parseInt(s, 10)); });

  /* The US passenger taxes that actually appear on a ticket. */
  var excise = air * 0.075;                  /* federal excise tax      */
  var segment = 5.20 * b.pax * (b.flight.stops + 1);
  var security = 5.60 * b.pax;               /* September 11 fee        */
  var tax = excise + segment + security;

  return {
    air: air, seats: seats, tax: tax,
    total: air + seats + tax,
    pax: b.pax, flight: b.flight
  };
}

function paintFare() {
  var box = $("#fare");
  if (!box) return;

  var f = fareParts();
  if (!f) { box.innerHTML = '<p class="faint">No flight chosen yet.</p>'; return; }

  var b = load();
  box.innerHTML =
    '<div class="sumline"><span>Air fare &times; ' + f.pax + "</span>" +
      '<span class="fig">' + money(f.air) + "</span></div>" +
    '<div class="sumline"><span>Seat selection</span>' +
      '<span class="fig">' + money(f.seats) + "</span></div>" +
    '<div class="sumline"><span>Taxes and fees</span>' +
      '<span class="fig">' + money(f.tax) + "</span></div>" +
    '<div class="sumline total"><span>Total</span>' +
      '<span class="fig">' + money(f.total) + "</span></div>" +
    '<p class="faint" style="margin-top:.8rem">' + b.flight.no + " &middot; " +
      b.from + " &rarr; " + b.to + " &middot; " + prettyDate(b.depart) + "</p>";
}

/* ===========================================================================
   5. PASSENGER DETAILS
   =========================================================================*/

var NAME_RE  = /^[A-Za-z][A-Za-z'\-\s]{1,38}$/;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
var PHONE_RE = /^\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}$/;
var PASS_RE  = /^[A-Z0-9]{9}$/;

function initPassengers() {
  var form = $("#pax-form");
  if (!form) return;

  var b = load();
  if (!b.flight) {
    form.innerHTML = '<div class="notice bad">No flight chosen yet. ' +
      '<a href="index.html">Start a search</a>.</div>';
    return;
  }

  /* One fieldset per passenger, built from the count chosen at search. */
  var slot = $("#pax-fields");
  var html = "";
  for (var i = 0; i < b.pax; i++) {
    html +=
      "<fieldset>" +
      "<legend>Passenger " + (i + 1) +
        (b.seats[i] ? ' &middot; <span class="code">seat ' + b.seats[i] + "</span>" : "") +
      "</legend>" +
      '<div class="row row-2">' +
        '<div class="field"><label for="fn' + i + '">First name</label>' +
          '<input type="text" id="fn' + i + '" data-rule="name" required></div>' +
        '<div class="field"><label for="ln' + i + '">Last name</label>' +
          '<input type="text" id="ln' + i + '" data-rule="name" required></div>' +
      "</div>" +
      '<div class="row row-2">' +
        '<div class="field"><label for="dob' + i + '">Date of birth</label>' +
          '<input type="date" id="dob' + i + '" data-rule="dob" required></div>' +
        '<div class="field"><label for="pp' + i + '">Passport number</label>' +
          '<input type="text" id="pp' + i + '" data-rule="passport" maxlength="9" ' +
            'placeholder="9 characters" required>' +
          '<div class="hint">Nine letters or digits, as printed on the passport.</div></div>' +
      "</div>" +
      "</fieldset>";
  }
  if (slot) slot.innerHTML = html;

  /* Validate each field when the person leaves it, not while they type: an
     error that appears on the second keystroke is just noise. */
  $$("[data-rule]", form).forEach(function (el) {
    el.addEventListener("blur", function () { checkField(el); });
    if (el.getAttribute("data-rule") === "passport") {
      el.addEventListener("input", function () {
        el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[data-rule]", form).forEach(function (el) {
      if (!checkField(el)) ok = false;
    });
    if (!ok) {
      var bad = $(".bad", form);
      if (bad) bad.focus();
      return;
    }

    var bk = load();
    bk.passengers = [];
    for (var i = 0; i < bk.pax; i++) {
      bk.passengers.push({
        first: $("#fn" + i).value.trim(),
        last:  $("#ln" + i).value.trim(),
        dob:   $("#dob" + i).value,
        pp:    $("#pp" + i).value
      });
    }
    bk.email = $("#email").value.trim();
    bk.phone = $("#phone").value.trim();
    save(bk);
    window.location.href = "payment.html";
  });

  paintFare();
}

function checkField(el) {
  var rule = el.getAttribute("data-rule");
  var v = el.value.trim();

  if (rule === "name") {
    if (!v) return setErr(el, "Required."), false;
    if (!NAME_RE.test(v)) {
      setErr(el, "Letters, spaces, hyphens and apostrophes only.");
      return false;
    }
  }

  if (rule === "dob") {
    if (!v) return setErr(el, "Required."), false;
    var d = new Date(v), now = new Date();
    if (d > now) { setErr(el, "A date of birth cannot be in the future."); return false; }
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    if (age > 120) { setErr(el, "Check the year."); return false; }
  }

  if (rule === "passport") {
    if (!v) return setErr(el, "Required."), false;
    if (!PASS_RE.test(v)) {
      setErr(el, "Nine characters, letters and digits only.");
      return false;
    }
  }

  if (rule === "email") {
    if (!v) return setErr(el, "Required."), false;
    if (!EMAIL_RE.test(v)) { setErr(el, "That does not look like an email address."); return false; }
  }

  if (rule === "phone") {
    if (!v) return setErr(el, "Required."), false;
    if (!PHONE_RE.test(v)) { setErr(el, "Ten digits, for example (212) 555-0147."); return false; }
  }

  setErr(el, "");
  return true;
}

/* ===========================================================================
   6. PAYMENT
   =========================================================================*/

function initPayment() {
  var form = $("#pay-form");
  if (!form) return;

  var b = load();
  if (!b.flight) {
    form.innerHTML = '<div class="notice bad">Nothing to pay for yet. ' +
      '<a href="index.html">Start a search</a>.</div>';
    return;
  }

  var card = $("#card");
  /* Space the digits in groups of four as they are typed. Easier to proofread,
     and it is what the plastic looks like. */
  card.addEventListener("input", function () {
    var digits = card.value.replace(/\D/g, "").slice(0, 16);
    card.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  var exp = $("#exp");
  exp.addEventListener("input", function () {
    var d = exp.value.replace(/\D/g, "").slice(0, 4);
    exp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });

  var cvv = $("#cvv");
  cvv.addEventListener("input", function () {
    cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
  });

  $$("[data-rule]", form).forEach(function (el) {
    el.addEventListener("blur", function () { checkPay(el); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[data-rule]", form).forEach(function (el) { if (!checkPay(el)) ok = false; });

    var agree = $("#agree");
    var agreeErr = $("#agree-err");
    if (!agree.checked) {
      if (agreeErr) agreeErr.textContent = "Please accept the conditions of carriage.";
      ok = false;
    } else if (agreeErr) agreeErr.textContent = "";

    if (!ok) return;

    var bk = load();
    bk.ref = newRef();
    bk.paid = true;
    bk.card = card.value.replace(/\D/g, "").slice(-4);
    save(bk);
    window.location.href = "confirmation.html";
  });

  paintFare();
}

function checkPay(el) {
  var rule = el.getAttribute("data-rule");
  var v = el.value.trim();

  if (rule === "cardname") {
    if (!v) return setErr(el, "Required."), false;
    if (!NAME_RE.test(v)) { setErr(el, "Name as printed on the card."); return false; }
  }

  if (rule === "card") {
    var d = v.replace(/\D/g, "");
    if (!d) return setErr(el, "Required."), false;
    if (d.length !== 16) { setErr(el, "A card number is 16 digits."); return false; }
  }

  if (rule === "exp") {
    if (!/^\d{2}\/\d{2}$/.test(v)) { setErr(el, "Use MM/YY."); return false; }
    var mm = parseInt(v.slice(0, 2), 10), yy = parseInt(v.slice(3), 10);
    if (mm < 1 || mm > 12) { setErr(el, "Month must be 01 to 12."); return false; }
    var now = new Date();
    var thisYY = now.getFullYear() % 100, thisMM = now.getMonth() + 1;
    if (yy < thisYY || (yy === thisYY && mm < thisMM)) {
      setErr(el, "That card has expired.");
      return false;
    }
  }

  if (rule === "cvv") {
    if (!/^\d{3,4}$/.test(v)) { setErr(el, "Three digits, or four on an Amex."); return false; }
  }

  if (rule === "zip") {
    if (!/^\d{5}(-\d{4})?$/.test(v)) { setErr(el, "Five digits, for example 11101."); return false; }
  }

  setErr(el, "");
  return true;
}

/* ===========================================================================
   7. CONFIRMATION — the boarding pass
   =========================================================================*/

function initConfirmation() {
  var box = $("#pass-box");
  if (!box) return;

  var b = load();
  if (!b.paid || !b.flight) {
    box.innerHTML = '<div class="notice bad">No completed booking to show. ' +
      '<a href="index.html">Book a flight</a> and it will appear here.</div>';
    return;
  }

  var ref = $("#ref");
  if (ref) ref.textContent = b.ref;

  var p = b.passengers[0] || { first: "Passenger", last: "" };
  var gate = String.fromCharCode(65 + (b.ref.charCodeAt(0) % 5)) + (1 + b.ref.charCodeAt(1) % 24);
  var boards = clock(b.flight.dep - 40);

  box.innerHTML =
    '<div class="pass">' +
      '<div class="pass-main">' +
        '<p class="eyebrow">Boarding pass &middot; ' + b.flight.no + "</p>" +
        '<div class="pass-route">' +
          '<div><div class="pass-iata">' + b.from + "</div>" +
            '<div class="faint">' + cityOf(b.from) + "</div></div>" +
          '<div class="pass-line"></div>' +
          '<div><div class="pass-iata">' + b.to + "</div>" +
            '<div class="faint">' + cityOf(b.to) + "</div></div>" +
        "</div>" +
        '<div class="pass-grid">' +
          '<div><div class="pass-k">Passenger</div><div class="pass-v">' +
            (p.last + "/" + p.first.charAt(0)).toUpperCase() + "</div></div>" +
          '<div><div class="pass-k">Date</div><div class="pass-v">' +
            prettyDate(b.depart) + "</div></div>" +
          '<div><div class="pass-k">Departs</div><div class="pass-v">' +
            clock(b.flight.dep) + "</div></div>" +
          '<div><div class="pass-k">Arrives</div><div class="pass-v">' +
            clock(b.flight.arr) +
            (nextDay(b.flight.dep, b.flight.arr)
              ? '<sup style="color:var(--signal)">+1</sup>' : "") + "</div></div>" +
          '<div><div class="pass-k">Gate</div><div class="pass-v">' + gate + "</div></div>" +
          '<div><div class="pass-k">Boards</div><div class="pass-v">' + boards + "</div></div>" +
          '<div><div class="pass-k">Seat</div><div class="pass-v">' +
            (b.seats[0] || "--") + "</div></div>" +
          '<div><div class="pass-k">Group</div><div class="pass-v">' +
            (parseInt(b.seats[0], 10) <= 7 ? "1" : "4") + "</div></div>" +
        "</div>" +
      "</div>" +
      '<div class="pass-stub">' +
        "<div>" +
          '<div class="pass-k">Record locator</div>' +
          '<div class="pass-v" style="font-size:1.3rem">' + b.ref + "</div>" +
        "</div>" +
        "<div>" +
          '<div class="barcode"></div>' +
          '<div class="faint code" style="font-size:.6rem">' + b.ref + " " + b.flight.no.replace(" ", "") + "</div>" +
        "</div>" +
      "</div>" +
    "</div>";

  /* Every passenger, not only the first — a family needs all the seat numbers. */
  var rest = $("#pax-list");
  if (rest && b.passengers.length) {
    var rows = "";
    b.passengers.forEach(function (q, i) {
      rows += "<tr><td>" + (i + 1) + "</td><td>" + q.first + " " + q.last +
        '</td><td class="code">' + (b.seats[i] || "--") +
        '</td><td class="code">' + q.pp + "</td></tr>";
    });
    rest.innerHTML =
      "<table><thead><tr><th>#</th><th>Name</th><th>Seat</th><th>Passport</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  var fs = $("#final-sum");
  if (fs) {
    var f = fareParts();
    fs.innerHTML =
      '<div class="sumline"><span>Air fare</span><span class="fig">' + money(f.air) + "</span></div>" +
      '<div class="sumline"><span>Seats</span><span class="fig">' + money(f.seats) + "</span></div>" +
      '<div class="sumline"><span>Taxes and fees</span><span class="fig">' + money(f.tax) + "</span></div>" +
      '<div class="sumline total"><span>Charged to card &bull;&bull;&bull;&bull; ' +
        (b.card || "0000") + '</span><span class="fig">' + money(f.total) + "</span></div>";
  }

  var pr = $("#print");
  if (pr) pr.addEventListener("click", function () { window.print(); });
}

/* ===========================================================================
   8. MANAGE BOOKING — look one up
   =========================================================================*/

function initManage() {
  var form = $("#find-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ref = $("#find-ref"), last = $("#find-last");
    var out = $("#find-out");
    var ok = true;

    if (!/^[A-Z0-9]{6}$/.test(ref.value.trim().toUpperCase())) {
      setErr(ref, "A record locator is six letters and digits.");
      ok = false;
    } else setErr(ref, "");

    if (!last.value.trim()) { setErr(last, "Required."); ok = false; }
    else setErr(last, "");

    if (!ok) return;

    var b = load();
    var code = ref.value.trim().toUpperCase();
    var surname = last.value.trim().toLowerCase();
    var holder = (b.passengers[0] || {}).last || "";

    if (b.paid && b.ref === code && holder.toLowerCase() === surname) {
      out.innerHTML =
        '<div class="notice good"><strong>Booking found.</strong> ' +
        code + " &middot; " + b.from + " &rarr; " + b.to + " &middot; " +
        prettyDate(b.depart) + " &middot; " + b.flight.no + "</div>" +
        '<div class="btn-row"><a class="btn" href="confirmation.html">View boarding pass</a>' +
        '<button class="btn btn-ghost" id="cancel-bk">Cancel this booking</button></div>';

      var cx = $("#cancel-bk");
      if (cx) {
        cx.addEventListener("click", function () {
          localStorage.removeItem(STORE);
          out.innerHTML = '<div class="notice">Booking ' + code +
            " has been cancelled. A refund of the base fare will reach the " +
            "original card within seven business days.</div>";
        });
      }
    } else {
      out.innerHTML = '<div class="notice bad"><strong>No booking matches that.</strong> ' +
        "Check the record locator and the surname exactly as they appear on the " +
        "confirmation email.</div>";
    }
  });
}

/* ===========================================================================
   9. ACCOUNT — registration with a password meter
   =========================================================================*/

function initRegister() {
  var form = $("#reg-form");
  if (!form) return;

  var pw = $("#pw"), pw2 = $("#pw2"), meter = $("#pw-meter");

  if (pw) {
    pw.addEventListener("input", function () {
      var v = pw.value, score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      var bar = $("i", meter);
      bar.style.width = (score / 4 * 100) + "%";
      meter.className = "meter" + (score >= 4 ? " m3" : score >= 3 ? " m2" : "");
      var txt = $("#pw-word");
      /* Index 0 has to say something — an empty label reads as "no opinion"
         when the password is in fact the weakest it can be. */
      if (txt) txt.textContent = v ? ["too short", "weak", "fair", "good", "strong"][score]
                                   : "—";
    });
  }

  $$("[data-rule]", form).forEach(function (el) {
    el.addEventListener("blur", function () { checkReg(el); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[data-rule]", form).forEach(function (el) { if (!checkReg(el)) ok = false; });

    var terms = $("#terms");
    var te = $("#terms-err");
    if (terms && !terms.checked) {
      if (te) te.textContent = "Please accept the programme terms.";
      ok = false;
    } else if (te) te.textContent = "";

    if (!ok) return;

    form.innerHTML = '<div class="notice good"><strong>Welcome to Kestrel Club.</strong> ' +
      "Your membership number is " +
      '<span class="code">KC-' + newRef() + "</span>. " +
      "Add it to any booking to earn miles.</div>";
  });
}

function checkReg(el) {
  var rule = el.getAttribute("data-rule");
  var v = el.value.trim();

  if (rule === "pw") {
    if (v.length < 8) { setErr(el, "At least 8 characters."); return false; }
    if (!/[A-Z]/.test(v)) { setErr(el, "Include a capital letter."); return false; }
    if (!/[0-9]/.test(v)) { setErr(el, "Include a number."); return false; }
    setErr(el, "");
    return true;
  }

  if (rule === "pw2") {
    var first = $("#pw");
    if (!v) { setErr(el, "Repeat the password."); return false; }
    if (first && v !== first.value) { setErr(el, "The two passwords do not match."); return false; }
    setErr(el, "");
    return true;
  }

  return checkField(el);
}

/* ===========================================================================
   10. CONTACT
   =========================================================================*/

function initContact() {
  var form = $("#contact-form");
  if (!form) return;

  var msg = $("#message"), counter = $("#chars");
  if (msg && counter) {
    msg.addEventListener("input", function () {
      counter.textContent = msg.value.length + " / 600";
      counter.style.color = msg.value.length > 600 ? "var(--stop)" : "var(--ink-faint)";
    });
  }

  $$("[data-rule]", form).forEach(function (el) {
    el.addEventListener("blur", function () { checkField(el); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[data-rule]", form).forEach(function (el) { if (!checkField(el)) ok = false; });

    if (msg) {
      if (msg.value.trim().length < 20) {
        setErr(msg, "Please give us at least 20 characters to work with.");
        ok = false;
      } else if (msg.value.length > 600) {
        setErr(msg, "600 characters maximum.");
        ok = false;
      } else setErr(msg, "");
    }

    if (!ok) return;

    form.innerHTML = '<div class="notice good"><strong>Message received.</strong> ' +
      "A reference has been emailed to you. We answer most messages within one " +
      "business day.</div>";
  });
}

/* ===========================================================================
   11. SIGN IN
   =========================================================================*/

function initLogin() {
  var form = $("#login-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = $("#login-id"), pw = $("#login-pw");
    var ok = true;

    if (!id.value.trim()) { setErr(id, "Enter your email or membership number."); ok = false; }
    else setErr(id, "");

    if (!pw.value) { setErr(pw, "Enter your password."); ok = false; }
    else setErr(pw, "");

    if (!ok) return;

    var out = $("#login-out");
    if (out) {
      out.innerHTML = '<div class="notice">This is a coursework demo, so there is ' +
        "no account server to sign in to. Everything else on the site works.</div>";
    }
  });
}

/* ===========================================================================
   12. NAV + ROUTE SUMMARY STRIP
   =========================================================================*/

function initNav() {
  var btn = $("#nav-toggle"), nav = $("#mainnav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Close" : "Menu";
  });
}

/* A one-line reminder of what is being booked, on every step page. */
function initStrip() {
  var strip = $("#trip-strip");
  if (!strip) return;
  var b = load();
  if (!b.flight) { strip.style.display = "none"; return; }
  strip.innerHTML = '<span class="code">' + b.flight.no + "</span> &middot; " +
    b.from + " &rarr; " + b.to + " &middot; " + prettyDate(b.depart) +
    " &middot; " + clock(b.flight.dep) + " &ndash; " + clock(b.flight.arr) +
    (nextDay(b.flight.dep, b.flight.arr) ? "+1" : "") +
    " &middot; " + b.pax + (b.pax === 1 ? " passenger" : " passengers");
}

/* --------------------------------------------------------------- start */

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initStrip();
  initSearch();
  initResults();
  initSeats();
  initPassengers();
  initPayment();
  initConfirmation();
  initManage();
  initRegister();
  initContact();
  initLogin();
  paintFare();
});
