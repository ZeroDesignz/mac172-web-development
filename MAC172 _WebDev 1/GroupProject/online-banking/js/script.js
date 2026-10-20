/* ===================================================================
   Meridian Credit Union — MAC172 Group Project
   Shared JavaScript for all pages.

   JavaScript items in this file:
     1. Account opening form validation (register.html) - required
     2. Transfer between accounts, with balance checking
     3. Loan and mortgage payment calculator (amortisation formula)
     4. Transaction search, category filter and date range
     5. Spending-by-category chart drawn from the transactions
     6. Bill pay: schedule and pay a payee
     7. Contact form validation
     8. Mobile navigation toggle
   =================================================================== */

/* -------------------------------------------------------------
   1. HELPERS
   ------------------------------------------------------------- */
function money(n) {
  var sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name) {
  return name.replace(/[^A-Za-z ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2)
    .map(function (w) { return w[0].toUpperCase(); }).join("");
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
   2. THE MEMBER'S ACCOUNTS
   ------------------------------------------------------------- */
var ACCOUNT_META = {
  chk:  { name: "Everyday Checking", num: "···4417", kind: "deposit" },
  sav:  { name: "Share Savings",     num: "···9032", kind: "deposit" },
  card: { name: "Meridian Visa",     num: "···8821", kind: "credit"  }
};

var Bank = {
  balances: null,
  txns: null,

  /* Opening figures and six weeks of activity, dated from today so
     the statement is never stale. */
  seed: function () {
    var t = new Date();
    var d = function (back) { return isoDate(addDays(t, -back)); };
    return {
      balances: { chk: 2418.50, sav: 7940.00, card: -612.35 },
      txns: [
        { date: d(1),  acct: "chk",  name: "Key Food Supermarket",   cat: "Groceries", amt: -86.41 },
        { date: d(2),  acct: "card", name: "Vesuvio Bakery",         cat: "Dining",    amt: -14.25 },
        { date: d(3),  acct: "chk",  name: "MTA OMNY",               cat: "Transit",   amt: -34.00 },
        { date: d(4),  acct: "chk",  name: "Con Edison",             cat: "Utilities", amt: -118.74 },
        { date: d(5),  acct: "card", name: "Trader Joe's",           cat: "Groceries", amt: -62.08 },
        { date: d(7),  acct: "chk",  name: "Payroll — Northstar", cat: "Income",  amt: 1284.22 },
        { date: d(8),  acct: "card", name: "Duane Reade",            cat: "Health",    amt: -23.47 },
        { date: d(9),  acct: "chk",  name: "Verizon Fios",           cat: "Utilities", amt: -89.99 },
        { date: d(11), acct: "card", name: "Uniqlo",                 cat: "Shopping",  amt: -78.00 },
        { date: d(12), acct: "chk",  name: "MTA OMNY",               cat: "Transit",   amt: -34.00 },
        { date: d(13), acct: "card", name: "Kabab King",             cat: "Dining",    amt: -31.60 },
        { date: d(15), acct: "sav",  name: "Interest paid",          cat: "Income",    amt: 9.84 },
        { date: d(16), acct: "chk",  name: "Transfer to Savings",    cat: "Transfer",  amt: -300.00 },
        { date: d(16), acct: "sav",  name: "Transfer from Checking", cat: "Transfer",  amt: 300.00 },
        { date: d(18), acct: "chk",  name: "Key Food Supermarket",   cat: "Groceries", amt: -102.33 },
        { date: d(21), acct: "chk",  name: "Payroll — Northstar", cat: "Income",  amt: 1284.22 },
        { date: d(23), acct: "card", name: "Citi Bike membership",   cat: "Transit",   amt: -219.00 },
        { date: d(25), acct: "chk",  name: "National Grid",          cat: "Utilities", amt: -64.12 },
        { date: d(28), acct: "card", name: "Film Forum",             cat: "Dining",    amt: -17.00 },
        { date: d(31), acct: "chk",  name: "CVS Pharmacy",           cat: "Health",    amt: -41.86 }
      ]
    };
  },

  load: function () {
    var saved = store.get("mcu_state", null);
    if (saved === null) {
      var s = this.seed();
      this.balances = s.balances;
      this.txns = s.txns;
      this.save();
    } else {
      this.balances = saved.balances;
      this.txns = saved.txns;
    }
  },

  save: function () {
    store.set("mcu_state", { balances: this.balances, txns: this.txns });
  },

  post: function (acct, name, cat, amt) {
    this.txns.unshift({ date: isoDate(new Date()), acct: acct, name: name, cat: cat, amt: amt });
    this.balances[acct] += amt;
    this.save();
  },

  forAccount: function (acct) {
    return this.txns.filter(function (t) { return t.acct === acct; });
  },

  /* Money out, grouped by category. Income and transfers are left
     out — they are not spending. */
  spendingByCategory: function (days) {
    var cutoff = addDays(new Date(), -days);
    var totals = {};
    this.txns.forEach(function (t) {
      if (t.amt >= 0) { return; }
      if (t.cat === "Transfer" || t.cat === "Income") { return; }
      var d = parseDate(t.date);
      if (d && d < cutoff) { return; }
      totals[t.cat] = (totals[t.cat] || 0) + Math.abs(t.amt);
    });
    return Object.keys(totals)
      .map(function (k) { return { cat: k, total: totals[k] }; })
      .sort(function (a, b) { return b.total - a.total; });
  }
};

/* -------------------------------------------------------------
   3. SHARED UI
   ------------------------------------------------------------- */
function initHeader() {
  var toggle = document.getElementById("nav-toggle");
  var nav    = document.getElementById("mainnav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}

function accountOptions(selected) {
  return Object.keys(ACCOUNT_META).map(function (k) {
    return '<option value="' + k + '"' + (k === selected ? " selected" : "") + '>'
      + ACCOUNT_META[k].name + " " + ACCOUNT_META[k].num + '</option>';
  }).join("");
}

function txnHTML(t) {
  var credit = t.amt >= 0;
  return '<li class="txn">'
    + '<span class="ticon" aria-hidden="true">' + initials(t.name) + '</span>'
    + '<span><span class="tname">' + t.name + '</span>'
    +   '<span class="cat-tag">' + t.cat + '</span>'
    +   '<br><span class="tmeta">' + prettyDate(t.date) + " · "
    +   ACCOUNT_META[t.acct].name + '</span></span>'
    + '<span class="tamt ' + (credit ? "credit" : "debit") + '">'
    +   (credit ? "+" : "−") + money(Math.abs(t.amt)).replace("$", "$") + '</span>'
    + '</li>';
}

/* -------------------------------------------------------------
   4. SPENDING CHART
   One measure, split by category: a single hue, a value printed at
   the end of each bar, bars sorted largest first, no legend needed.
   ------------------------------------------------------------- */
function drawSpending(mountId, footId, days) {
  var mount = document.getElementById(mountId);
  if (!mount) { return; }

  var rows = Bank.spendingByCategory(days);
  if (rows.length === 0) {
    mount.innerHTML = '<p class="empty-state">No spending in this period.</p>';
    return;
  }

  var max = rows[0].total;
  var sum = rows.reduce(function (s, r) { return s + r.total; }, 0);

  mount.innerHTML = rows.map(function (r) {
    var pct = (r.total / max) * 100;
    return '<div class="bar-row">'
      + '<span class="bar-label">' + r.cat + '</span>'
      + '<span class="bar-track"><span class="bar-fill" style="width:' + pct.toFixed(1) + '%"></span></span>'
      + '<span class="bar-value">' + money(r.total) + '</span>'
      + '</div>';
  }).join("");

  var foot = document.getElementById(footId);
  if (foot) {
    foot.textContent = money(sum) + " spent over the last " + days
      + " days, across " + rows.length + " categories. Transfers and income are excluded.";
  }
}

/* -------------------------------------------------------------
   5. DASHBOARD
   ------------------------------------------------------------- */
function initDashboard() {
  var grid = document.getElementById("acct-grid");
  if (!grid) { return; }

  grid.innerHTML = Object.keys(ACCOUNT_META).map(function (k) {
    var m = ACCOUNT_META[k];
    var bal = Bank.balances[k];
    var owed = m.kind === "credit";
    return '<a class="acct" href="account.html?a=' + k + '" data-acct="' + k + '">'
      + '<div class="aname">' + m.name + '</div>'
      + '<div class="anum">' + m.num + '</div>'
      + '<div class="abal' + (owed ? " is-owed" : "") + '">' + money(Math.abs(bal)) + '</div>'
      + '<div class="ameta">' + (owed ? "Balance owed" : "Available now") + '</div>'
      + '</a>';
  }).join("");

  grid.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-acct]");
    if (a) { store.set("mcu_acct", a.getAttribute("data-acct")); }
  });

  var recent = document.getElementById("recent-txns");
  if (recent) {
    recent.innerHTML = Bank.txns.slice(0, 8).map(txnHTML).join("");
  }

  /* Net position across deposit accounts minus the card balance. */
  var net = Bank.balances.chk + Bank.balances.sav + Bank.balances.card;
  var netEl = document.getElementById("net-worth");
  if (netEl) { netEl.textContent = money(net); }

  drawSpending("spend-chart", "spend-foot", 30);
}

/* -------------------------------------------------------------
   6. ACCOUNT PAGE — search, category filter, date range
   ------------------------------------------------------------- */
function initAccount() {
  var list = document.getElementById("acct-txns");
  if (!list) { return; }

  var key = null;
  var m = window.location.search.match(/[?&]a=([^&]+)/);
  if (m) { key = decodeURIComponent(m[1]); }
  if (!key || !ACCOUNT_META[key]) { key = store.get("mcu_acct", "chk"); }
  if (!ACCOUNT_META[key]) { key = "chk"; }

  var meta = ACCOUNT_META[key];
  document.getElementById("ac-name").textContent  = meta.name;
  document.getElementById("ac-crumb").textContent = meta.name;
  document.getElementById("ac-num").textContent   = meta.num;

  var bal = Bank.balances[key];
  var balEl = document.getElementById("ac-balance");
  balEl.textContent = money(Math.abs(bal));
  balEl.classList.toggle("is-owed", meta.kind === "credit");
  document.getElementById("ac-kind").textContent =
    meta.kind === "credit" ? "Balance owed" : "Available now";

  var switcher = document.getElementById("ac-switch");
  switcher.innerHTML = accountOptions(key);
  switcher.addEventListener("change", function () {
    store.set("mcu_acct", switcher.value);
    window.location.href = "account.html?a=" + switcher.value;
  });

  var searchBox = document.getElementById("ac-search");
  var catBox    = document.getElementById("ac-cat");
  var fromBox   = document.getElementById("ac-from");
  var countEl   = document.getElementById("ac-count");

  var rows = Bank.forAccount(key);
  var cats = [];
  rows.forEach(function (t) { if (cats.indexOf(t.cat) === -1) { cats.push(t.cat); } });
  cats.sort();
  catBox.innerHTML = '<option value="">All categories</option>'
    + cats.map(function (c) { return '<option>' + c + '</option>'; }).join("");

  fromBox.value = isoDate(addDays(new Date(), -45));

  function render() {
    var q    = searchBox.value.trim().toLowerCase();
    var cat  = catBox.value;
    var from = parseDate(fromBox.value);

    var shown = rows.filter(function (t) {
      var inQ   = q === "" || t.name.toLowerCase().indexOf(q) > -1;
      var inCat = cat === "" || t.cat === cat;
      var d = parseDate(t.date);
      var inDate = !from || !d || d >= from;
      return inQ && inCat && inDate;
    });

    var inflow  = shown.reduce(function (s, t) { return t.amt > 0 ? s + t.amt : s; }, 0);
    var outflow = shown.reduce(function (s, t) { return t.amt < 0 ? s + Math.abs(t.amt) : s; }, 0);

    countEl.textContent = shown.length
      + (shown.length === 1 ? " transaction" : " transactions");
    document.getElementById("ac-in").textContent  = money(inflow);
    document.getElementById("ac-out").textContent = money(outflow);
    document.getElementById("ac-net").textContent = money(inflow - outflow);

    list.innerHTML = shown.length
      ? shown.map(txnHTML).join("")
      : '<li class="empty-state">Nothing matches those filters.</li>';
  }

  searchBox.addEventListener("input", render);
  catBox.addEventListener("change", render);
  fromBox.addEventListener("change", render);
  render();
}

/* -------------------------------------------------------------
   7. TRANSFER
   ------------------------------------------------------------- */
function initTransfer() {
  var form = document.getElementById("transfer-form");
  if (!form) { return; }

  var from = document.getElementById("tf-from");
  var to   = document.getElementById("tf-to");
  var amt  = document.getElementById("tf-amt");

  from.innerHTML = accountOptions("chk");
  to.innerHTML   = accountOptions("sav");

  function paintBalances() {
    document.getElementById("tf-from-bal").textContent = money(Bank.balances[from.value]);
    document.getElementById("tf-to-bal").textContent   = money(Bank.balances[to.value]);
  }
  from.addEventListener("change", paintBalances);
  to.addEventListener("change", paintBalances);
  paintBalances();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var banner = document.getElementById("tf-result");
    var value  = parseFloat(amt.value);
    banner.hidden = false;
    banner.className = "alert alert-bad";

    if (from.value === to.value) {
      banner.textContent = "Choose two different accounts.";
      return;
    }
    if (!(value > 0)) {
      banner.textContent = "Enter an amount greater than zero.";
      return;
    }
    if (ACCOUNT_META[from.value].kind === "deposit" && value > Bank.balances[from.value]) {
      banner.textContent = "Insufficient funds. " + ACCOUNT_META[from.value].name
        + " holds " + money(Bank.balances[from.value]) + ".";
      return;
    }

    Bank.post(from.value, "Transfer to " + ACCOUNT_META[to.value].name, "Transfer", -value);
    Bank.post(to.value,   "Transfer from " + ACCOUNT_META[from.value].name, "Transfer", value);

    banner.className = "alert alert-ok";
    banner.textContent = money(value) + " moved from " + ACCOUNT_META[from.value].name
      + " to " + ACCOUNT_META[to.value].name + ". New balance "
      + money(Bank.balances[from.value]) + ".";
    paintBalances();
    renderTransferHistory();
  });

  renderTransferHistory();

  function renderTransferHistory() {
    var box = document.getElementById("tf-history");
    if (!box) { return; }
    var recent = Bank.txns.filter(function (t) { return t.cat === "Transfer"; }).slice(0, 6);
    box.innerHTML = recent.length
      ? recent.map(txnHTML).join("")
      : '<li class="empty-state">No transfers yet.</li>';
  }
}

/* -------------------------------------------------------------
   8. LOAN CALCULATOR
   Standard amortisation:  M = P · r(1+r)^n / ((1+r)^n − 1)
   where r is the monthly rate and n the number of payments.
   ------------------------------------------------------------- */
var LOAN_PRODUCTS = {
  auto:     { label: "New auto loan",   apr: 6.49,  min: 5000,  max: 75000,  years: 5  },
  personal: { label: "Personal loan",   apr: 11.99, min: 1000,  max: 40000,  years: 3  },
  home:     { label: "30-year mortgage",apr: 6.25,  min: 50000, max: 900000, years: 30 },
  equity:   { label: "Home equity line",apr: 8.50,  min: 10000, max: 250000, years: 10 }
};

function monthlyPayment(principal, annualRate, years) {
  var n = years * 12;
  var r = annualRate / 100 / 12;
  if (n <= 0) { return 0; }
  if (r === 0) { return principal / n; }
  var growth = Math.pow(1 + r, n);
  return principal * r * growth / (growth - 1);
}

function initLoans() {
  var form = document.getElementById("loan-form");
  if (!form) { return; }

  var kind   = document.getElementById("ln-kind");
  var amount = document.getElementById("ln-amount");
  var years  = document.getElementById("ln-years");
  var apr    = document.getElementById("ln-apr");

  kind.innerHTML = Object.keys(LOAN_PRODUCTS).map(function (k) {
    return '<option value="' + k + '">' + LOAN_PRODUCTS[k].label
      + " — " + LOAN_PRODUCTS[k].apr.toFixed(2) + "% APR</option>";
  }).join("");

  function loadProduct() {
    var p = LOAN_PRODUCTS[kind.value];
    amount.min = p.min;
    amount.max = p.max;
    amount.value = Math.round((p.min + p.max) / 2 / 1000) * 1000;
    years.value = p.years;
    apr.value = p.apr.toFixed(2);
    recalc();
  }

  function recalc() {
    var P = Math.max(0, Number(amount.value) || 0);
    var Y = Math.max(0, Number(years.value) || 0);
    var A = Math.max(0, Number(apr.value) || 0);

    var warn = document.getElementById("ln-warn");
    var p = LOAN_PRODUCTS[kind.value];
    if (P < p.min || P > p.max) {
      warn.hidden = false;
      warn.className = "alert alert-bad";
      warn.textContent = p.label + "s run from " + money(p.min) + " to " + money(p.max) + ".";
    } else {
      warn.hidden = true;
    }

    var M = monthlyPayment(P, A, Y);
    var n = Y * 12;
    var totalPaid = M * n;
    var interest  = totalPaid - P;

    document.getElementById("ln-monthly").textContent = money(M);
    document.getElementById("ln-n").textContent       = n + " payments";
    document.getElementById("ln-principal").textContent = money(P);
    document.getElementById("ln-interest").textContent  = money(interest);
    document.getElementById("ln-total").textContent     = money(totalPaid);

    var share = totalPaid > 0 ? (interest / totalPaid) * 100 : 0;
    document.getElementById("ln-share").textContent =
      share.toFixed(1) + "% of what you repay is interest.";

    /* First-year schedule, so the split between interest and
       principal is visible rather than just asserted. */
    var body = document.getElementById("ln-schedule");
    if (body) {
      var rows = "";
      var bal = P;
      var r = A / 100 / 12;
      for (var i = 1; i <= Math.min(12, n); i++) {
        var int = bal * r;
        var prin = M - int;
        bal = Math.max(0, bal - prin);
        rows += "<tr><td>" + i + "</td>"
          + '<td class="num">' + money(M) + "</td>"
          + '<td class="num">' + money(int) + "</td>"
          + '<td class="num">' + money(prin) + "</td>"
          + '<td class="num">' + money(bal) + "</td></tr>";
      }
      body.innerHTML = rows;
    }
  }

  kind.addEventListener("change", loadProduct);
  [amount, years, apr].forEach(function (el) {
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });

  loadProduct();
}

/* -------------------------------------------------------------
   9. BILL PAY
   ------------------------------------------------------------- */
var PAYEES = [
  { id: "coned",   name: "Con Edison",      acct: "···4410", due: 6,  amt: 118.74 },
  { id: "grid",    name: "National Grid",   acct: "···2187", due: 11, amt: 64.12  },
  { id: "verizon", name: "Verizon Fios",    acct: "···9903", due: 3,  amt: 89.99  },
  { id: "tmobile", name: "T-Mobile",        acct: "···5521", due: 18, amt: 75.00  },
  { id: "visa",    name: "Meridian Visa",   acct: "···8821", due: 21, amt: 35.00  }
];

function initBillpay() {
  var form = document.getElementById("bill-form");
  if (!form) { return; }

  var who  = document.getElementById("bp-payee");
  var amt  = document.getElementById("bp-amt");
  var when = document.getElementById("bp-date");
  var acct = document.getElementById("bp-from");

  who.innerHTML = PAYEES.map(function (p) {
    return '<option value="' + p.id + '">' + p.name + " " + p.acct + '</option>';
  }).join("");
  acct.innerHTML = accountOptions("chk");
  when.value = isoDate(new Date());
  when.min = isoDate(new Date());

  function findPayee(id) {
    return PAYEES.filter(function (p) { return p.id === id; })[0];
  }

  function loadPayee() {
    var p = findPayee(who.value);
    amt.value = p.amt.toFixed(2);
  }
  who.addEventListener("change", loadPayee);
  loadPayee();

  /* The payee list, with anything due inside a week marked. */
  var list = document.getElementById("payee-list");
  list.innerHTML = PAYEES.map(function (p) {
    var soon = p.due <= 7;
    return '<li class="payee">'
      + '<span><span class="pname">' + p.name + '</span><br>'
      +   '<span class="pacct">Account ' + p.acct + '</span></span>'
      + '<span class="pdue' + (soon ? " soon" : "") + '">' + money(p.amt) + '<br>'
      +   '<span class="pacct">due in ' + p.due + ' days</span></span>'
      + '<button class="btn btn-sm btn-outline" type="button" data-pick="' + p.id + '">Pay</button>'
      + '</li>';
  }).join("");

  list.addEventListener("click", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-pick");
    if (!id) { return; }
    who.value = id;
    loadPayee();
    amt.focus();
  });

  var scheduled = store.get("mcu_scheduled", []);

  function renderScheduled() {
    var box = document.getElementById("bp-scheduled");
    box.innerHTML = scheduled.length
      ? scheduled.map(function (s) {
          return "<li><span>" + s.name + " · " + prettyDate(s.date)
            + "</span><span>" + money(s.amt) + "</span></li>";
        }).join("")
      : '<li style="color:var(--ink-faint)"><span>Nothing scheduled</span><span>&mdash;</span></li>';
  }
  renderScheduled();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var banner = document.getElementById("bp-result");
    var p = findPayee(who.value);
    var value = parseFloat(amt.value);
    var payDate = parseDate(when.value);
    var today = parseDate(isoDate(new Date()));

    banner.hidden = false;
    banner.className = "alert alert-bad";

    if (!(value > 0)) { banner.textContent = "Enter an amount greater than zero."; return; }
    if (!payDate)     { banner.textContent = "Choose a payment date."; return; }
    if (payDate < today) { banner.textContent = "Payments cannot be dated in the past."; return; }
    if (value > Bank.balances[acct.value] && ACCOUNT_META[acct.value].kind === "deposit") {
      banner.textContent = "Insufficient funds. " + ACCOUNT_META[acct.value].name
        + " holds " + money(Bank.balances[acct.value]) + ".";
      return;
    }

    if (payDate.getTime() === today.getTime()) {
      Bank.post(acct.value, p.name, "Utilities", -value);
      banner.className = "alert alert-ok";
      banner.textContent = money(value) + " paid to " + p.name + " today. "
        + ACCOUNT_META[acct.value].name + " is now " + money(Bank.balances[acct.value]) + ".";
    } else {
      scheduled.unshift({ name: p.name, amt: value, date: when.value });
      store.set("mcu_scheduled", scheduled);
      banner.className = "alert alert-ok";
      banner.textContent = money(value) + " scheduled to " + p.name
        + " for " + prettyDate(when.value) + ".";
    }
    renderScheduled();
  });
}

/* -------------------------------------------------------------
   10. VALIDATION HELPERS
   ------------------------------------------------------------- */
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
var ZIP_RE   = /^\d{5}(-\d{4})?$/;
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
   11. OPEN AN ACCOUNT — the required JavaScript item
   ------------------------------------------------------------- */
function initRegister() {
  var form = document.getElementById("register-form");
  if (!form) { return; }

  var f = {
    first: document.getElementById("reg-first"),
    last:  document.getElementById("reg-last"),
    email: document.getElementById("reg-email"),
    phone: document.getElementById("reg-phone"),
    dob:   document.getElementById("reg-dob"),
    ssn:   document.getElementById("reg-ssn"),
    zip:   document.getElementById("reg-zip"),
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
  function checkPhone() {
    return setError(f.phone, PHONE_RE.test(f.phone.value.trim())
      ? "" : "Enter a phone number we can reach you on.");
  }

  /* Federal law requires members to be 18 to open an account alone. */
  function checkDob() {
    var d = parseDate(f.dob.value);
    if (!d) { return setError(f.dob, "Enter your date of birth."); }
    var now = new Date();
    var years = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) { years--; }
    if (years < 18)  { return setError(f.dob, "You must be 18 to open an account on your own."); }
    if (years > 110) { return setError(f.dob, "Check that date of birth."); }
    return setError(f.dob, "");
  }

  /* Only the last four digits — a real application would never take
     the whole number over a form like this. */
  function checkSsn() {
    return setError(f.ssn, /^\d{4}$/.test(f.ssn.value.trim())
      ? "" : "Enter the last four digits only.");
  }
  function checkZip() {
    return setError(f.zip, ZIP_RE.test(f.zip.value.trim())
      ? "" : "Enter a 5-digit ZIP code.");
  }

  function scorePassword(v) {
    var score = 0;
    if (v.length >= 10) { score++; }
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
    var tints = ["", "#b03c33", "#9a6a12", "#3d8a68", "#0e8f63"];

    if (bar) { bar.style.width = pct + "%"; bar.style.background = tints[score] || "#b03c33"; }
    if (label) {
      label.textContent = v === ""
        ? "Banking passwords need 10 characters, a capital, a number and a symbol."
        : words[score] + " password";
    }

    if (v === "")                 { return setError(f.pass, "Choose a password."); }
    if (v.length < 10)            { return setError(f.pass, "Use at least 10 characters."); }
    if (!/[A-Z]/.test(v))         { return setError(f.pass, "Include at least one capital letter."); }
    if (!/\d/.test(v))            { return setError(f.pass, "Include at least one number."); }
    if (!/[^A-Za-z0-9]/.test(v))  { return setError(f.pass, "Include at least one symbol."); }
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
      if (slot) { slot.textContent = "You must accept the membership agreement."; }
      return false;
    }
    if (slot) { slot.textContent = ""; }
    return true;
  }

  f.first.addEventListener("blur", checkFirst);
  f.last.addEventListener("blur",  checkLast);
  f.email.addEventListener("blur", checkEmail);
  f.phone.addEventListener("blur", checkPhone);
  f.dob.addEventListener("change", checkDob);
  f.ssn.addEventListener("blur",   checkSsn);
  f.zip.addEventListener("blur",   checkZip);
  f.pass.addEventListener("input", checkPass);
  f.conf.addEventListener("blur",  checkConf);
  f.terms.addEventListener("change", checkTerms);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = checkFirst() & checkLast() & checkEmail() & checkPhone() & checkDob()
           & checkSsn() & checkZip() & checkPass() & checkConf() & checkTerms();

    var banner = document.getElementById("reg-result");
    banner.hidden = false;
    if (ok) {
      var member = "MC" + String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
      banner.className = "alert alert-ok";
      banner.innerHTML = "Welcome, " + f.first.value.trim()
        + ". Your member number is <span class=\"mono\">" + member + "</span>. "
        + "We will post your card within five business days.";
      form.reset();
      document.querySelector("#pass-meter span").style.width = "0";
      document.getElementById("pass-label").textContent =
        "Banking passwords need 10 characters, a capital, a number and a symbol.";
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
   12. LOGIN
   ------------------------------------------------------------- */
function initLogin() {
  var form = document.getElementById("login-form");
  if (!form) { return; }
  var member = document.getElementById("log-member");
  var pass   = document.getElementById("log-pass");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = setError(member, /^MC\d{8}$/i.test(member.value.trim())
               ? "" : "Member numbers look like MC00000000.")
           & setError(pass, pass.value.length >= 1 ? "" : "Enter your password.");
    var banner = document.getElementById("log-result");
    banner.hidden = false;
    if (ok) {
      banner.className = "alert alert-ok";
      banner.innerHTML = "Signed in. <a href=\"dashboard.html\">Go to your accounts</a>.";
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Check your member number and password.";
    }
  });
}

/* -------------------------------------------------------------
   13. CONTACT
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
        + ". A member services officer will reply within one business day.";
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
   14. START
   ------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  Bank.load();
  initHeader();
  initDashboard();
  initAccount();
  initTransfer();
  initLoans();
  initBillpay();
  initRegister();
  initLogin();
  initContact();
});
