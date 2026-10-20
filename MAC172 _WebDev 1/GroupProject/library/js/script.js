/* ===================================================================
   Bridgeview Public Library — MAC172 Group Project
   Shared JavaScript for all pages.

   JavaScript items in this file:
     1. Library card application validation (register.html) - required
     2. Catalogue search, filter and sort    (catalog.html)
     3. Borrowing: due dates, renewals, overdue fines (myloans.html)
     4. Holds on titles that are all out
     5. Contact form validation
     6. Mobile navigation toggle
   =================================================================== */

/* -------------------------------------------------------------
   1. LIBRARY RULES
   ------------------------------------------------------------- */
var LOAN_DAYS   = 21;     // standard loan period
var MAX_RENEWS  = 2;      // renewals allowed per item
var FINE_PER_DAY = 0.25;  // charged per day after the due date
var FINE_CAP    = 10.00;  // maximum fine per item

/* -------------------------------------------------------------
   2. CATALOGUE
   Call numbers follow Dewey for non-fiction and FIC + the first
   three letters of the author's surname for fiction.
   ------------------------------------------------------------- */
var CATALOG = [
  { id:"beloved",   title:"Beloved", author:"Toni Morrison", genre:"Fiction",
    year:1987, call:"FIC MOR", copies:3, out:1, c1:"#5d2733", c2:"#2e1219" },
  { id:"solomon",   title:"Song of Solomon", author:"Toni Morrison", genre:"Fiction",
    year:1977, call:"FIC MOR", copies:2, out:2, c1:"#3f4a2e", c2:"#1d2315" },
  { id:"namesake",  title:"The Namesake", author:"Jhumpa Lahiri", genre:"Fiction",
    year:2003, call:"FIC LAH", copies:4, out:1, c1:"#8a5a2b", c2:"#4a2f13" },
  { id:"pachinko",  title:"Pachinko", author:"Min Jin Lee", genre:"Fiction",
    year:2017, call:"FIC LEE", copies:5, out:3, c1:"#2f4a5c", c2:"#16252e" },
  { id:"warmth",    title:"The Warmth of Other Suns", author:"Isabel Wilkerson", genre:"History",
    year:2010, call:"305.896 WIL", copies:3, out:0, c1:"#6b4226", c2:"#33200f" },
  { id:"broker",    title:"The Power Broker", author:"Robert A. Caro", genre:"History",
    year:1974, call:"974.71 CAR", copies:2, out:1, c1:"#3a3f4a", c2:"#1b1e24" },
  { id:"sweetgrass",title:"Braiding Sweetgrass", author:"Robin Wall Kimmerer", genre:"Science",
    year:2013, call:"581.6 KIM", copies:4, out:4, c1:"#2f5c47", c2:"#152b21" },
  { id:"sixth",     title:"The Sixth Extinction", author:"Elizabeth Kolbert", genre:"Science",
    year:2014, call:"576.84 KOL", copies:2, out:0, c1:"#27525c", c2:"#11272d" },
  { id:"silent",    title:"Silent Spring", author:"Rachel Carson", genre:"Science",
    year:1962, call:"363.738 CAR", copies:3, out:1, c1:"#4a5c2f", c2:"#232b15" },
  { id:"citizen",   title:"Citizen: An American Lyric", author:"Claudia Rankine", genre:"Poetry",
    year:2014, call:"811.6 RAN", copies:2, out:0, c1:"#45425c", c2:"#1f1e2b" },
  { id:"devotions", title:"Devotions", author:"Mary Oliver", genre:"Poetry",
    year:2017, call:"811.54 OLI", copies:3, out:2, c1:"#5c4a2f", c2:"#2b2215" },
  { id:"malcolm",   title:"The Autobiography of Malcolm X", author:"Malcolm X and Alex Haley",
    genre:"Biography", year:1965, call:"320.54 LIT", copies:4, out:2, c1:"#5c2f2f", c2:"#2b1515" }
];

var GENRES = ["Fiction", "History", "Science", "Poetry", "Biography"];

/* -------------------------------------------------------------
   3. HELPERS
   ------------------------------------------------------------- */
function findBook(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) { return CATALOG[i]; }
  }
  return null;
}

function available(b) { return Math.max(0, b.copies - b.out); }

function money(n) { return "$" + n.toFixed(2); }

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
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

/* Whole days from today until the due date. Negative means overdue. */
function daysUntil(dueStr) {
  var due = parseDate(dueStr);
  if (!due) { return 0; }
  var today = parseDate(isoDate(new Date()));
  return Math.round((due - today) / 86400000);
}

/* The fine on one item: $0.25 a day past the due date, capped at $10. */
function fineFor(dueStr) {
  var late = -daysUntil(dueStr);
  if (late <= 0) { return 0; }
  return Math.min(late * FINE_PER_DAY, FINE_CAP);
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
   4. THE BORROWER'S ACCOUNT
   Loans: [{ id, due: "YYYY-MM-DD", renews: 0 }]
   Holds: [ bookId, ... ]
   ------------------------------------------------------------- */
var Account = {
  loans: null,
  holds: null,

  /* A first-time visitor starts with two loans already on the card,
     one of them overdue, so the fines are visible straight away. */
  seed: function () {
    var today = new Date();
    return [
      { id: "pachinko", due: isoDate(addDays(today, 9)),  renews: 0 },
      { id: "warmth",   due: isoDate(addDays(today, -4)), renews: 1 }
    ];
  },

  load: function () {
    var saved = store.get("bv_loans", null);
    this.loans = saved === null ? this.seed() : saved;
    this.holds = store.get("bv_holds", []);
    if (saved === null) { this.save(); }
  },

  save: function () {
    store.set("bv_loans", this.loans);
    store.set("bv_holds", this.holds);
  },

  has: function (id) {
    return this.loans.some(function (l) { return l.id === id; });
  },

  borrow: function (id) {
    if (this.has(id)) { return false; }
    this.loans.push({ id: id, due: isoDate(addDays(new Date(), LOAN_DAYS)), renews: 0 });
    this.save();
    return true;
  },

  renew: function (id) {
    var line = this.loans.filter(function (l) { return l.id === id; })[0];
    if (!line || line.renews >= MAX_RENEWS) { return false; }
    /* A renewal runs from today, not from the old due date. */
    line.due = isoDate(addDays(new Date(), LOAN_DAYS));
    line.renews++;
    this.save();
    return true;
  },

  giveBack: function (id) {
    this.loans = this.loans.filter(function (l) { return l.id !== id; });
    this.save();
  },

  hold: function (id) {
    if (this.holds.indexOf(id) === -1) { this.holds.push(id); this.save(); return true; }
    return false;
  },

  totalFines: function () {
    return this.loans.reduce(function (sum, l) { return sum + fineFor(l.due); }, 0);
  },

  overdueCount: function () {
    return this.loans.filter(function (l) { return daysUntil(l.due) < 0; }).length;
  }
};

/* -------------------------------------------------------------
   5. BOOK COVER MARKUP
   Built from the title and author, so no image files are needed.
   ------------------------------------------------------------- */
function coverHTML(b) {
  return '<div class="cover" style="--c1:' + b.c1 + ';--c2:' + b.c2 + '" '
    + 'role="img" aria-label="' + b.title + ' by ' + b.author + '">'
    + '<div class="cover-inner">'
    +   '<span class="cover-title">' + b.title + '</span>'
    +   '<div class="cover-rule"></div>'
    +   '<span class="cover-author">' + b.author + '</span>'
    + '</div></div>';
}

/* -------------------------------------------------------------
   6. SHARED UI
   ------------------------------------------------------------- */
function initHeader() {
  var flag = document.getElementById("loan-flag");
  if (flag) {
    var n = Account.loans.length;
    flag.textContent = n;
    flag.classList.toggle("is-empty", n === 0);
    flag.classList.toggle("is-late", Account.overdueCount() > 0);
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

function rememberBook(root) {
  root.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("[data-goto]");
    if (link) { store.set("bv_book", link.getAttribute("data-goto")); }
  });
}

/* -------------------------------------------------------------
   7. HOME PAGE
   ------------------------------------------------------------- */
function initHome() {
  var shelf = document.getElementById("home-shelf");
  if (!shelf) { return; }

  shelf.innerHTML = CATALOG.slice(0, 6).map(function (b) {
    return '<div class="shelf-item">'
      + '<a href="book.html?id=' + b.id + '" data-goto="' + b.id + '">' + coverHTML(b) + '</a>'
      + '<h3 class="bt"><a href="book.html?id=' + b.id + '" data-goto="' + b.id + '">' + b.title + '</a></h3>'
      + '<div class="ba">' + b.author + '</div>'
      + '<div class="bc">' + b.call + '</div>'
      + '</div>';
  }).join("");
  rememberBook(shelf);

  var stack = document.getElementById("hero-stack");
  if (stack) {
    stack.innerHTML = [CATALOG[0], CATALOG[6], CATALOG[9]].map(coverHTML).join("");
  }

  /* The home-page search box hands off to the catalogue page. */
  var form = document.getElementById("quick-search");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      store.set("bv_query", document.getElementById("q-text").value.trim());
      window.location.href = "catalog.html";
    });
  }
}

/* -------------------------------------------------------------
   8. CATALOGUE PAGE — search, filter and sort
   ------------------------------------------------------------- */
function initCatalog() {
  var list = document.getElementById("catalogue");
  if (!list) { return; }

  var searchBox = document.getElementById("cat-search");
  var sortBox   = document.getElementById("cat-sort");
  var availBox  = document.getElementById("cat-avail");
  var countEl   = document.getElementById("cat-count");
  var chips     = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var genre     = "All";

  /* A search typed on the home page arrives here. */
  var carried = store.get("bv_query", "");
  if (carried) { searchBox.value = carried; store.set("bv_query", ""); }

  function render() {
    var q = searchBox.value.trim().toLowerCase();

    var rows = CATALOG.filter(function (b) {
      var inGenre = (genre === "All") || (b.genre === genre);
      var inQ = (q === "")
        || b.title.toLowerCase().indexOf(q) > -1
        || b.author.toLowerCase().indexOf(q) > -1
        || b.call.toLowerCase().indexOf(q) > -1;
      var inAvail = !availBox.checked || available(b) > 0;
      return inGenre && inQ && inAvail;
    });

    var how = sortBox.value;
    rows.sort(function (a, b) {
      if (how === "title")     { return a.title.localeCompare(b.title); }
      if (how === "author")    { return a.author.localeCompare(b.author); }
      if (how === "year-desc") { return b.year - a.year; }
      if (how === "year-asc")  { return a.year - b.year; }
      return 0;
    });

    countEl.textContent = rows.length === 1
      ? "1 title found" : rows.length + " titles found";

    list.innerHTML = rows.length
      ? rows.map(catRow).join("")
      : '<p class="empty-state"><strong>Nothing matched that search.</strong><br>'
        + 'Try an author’s surname, or choose All.</p>';
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      genre = chip.getAttribute("data-genre");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      render();
    });
  });

  searchBox.addEventListener("input", render);
  sortBox.addEventListener("change", render);
  availBox.addEventListener("change", render);
  rememberBook(list);
  render();
}

function catRow(b) {
  var free = available(b);
  return '<article class="cat-row' + (free === 0 ? " is-out" : "") + '">'
    + '<a href="book.html?id=' + b.id + '" data-goto="' + b.id + '">' + coverHTML(b) + '</a>'
    + '<div class="cinfo">'
    +   '<h3 class="bt"><a href="book.html?id=' + b.id + '" data-goto="' + b.id + '">' + b.title + '</a></h3>'
    +   '<div class="ba">' + b.author + ', ' + b.year + '</div>'
    +   '<ul class="cmeta">'
    +     '<li>' + b.genre + '</li>'
    +     '<li>' + b.call + '</li>'
    +     '<li>' + b.copies + ' copies</li>'
    +   '</ul>'
    + '</div>'
    + '<div class="cat-right">'
    +   (free > 0
        ? '<span class="badge badge-in">' + free + ' on shelf</span>'
        : '<span class="badge badge-out">All out</span>')
    +   '<a class="btn btn-sm ' + (free > 0 ? '' : 'btn-outline') + '" '
    +     'href="book.html?id=' + b.id + '" data-goto="' + b.id + '">'
    +     (free > 0 ? 'Borrow' : 'Place a hold') + '</a>'
    + '</div></article>';
}

/* -------------------------------------------------------------
   9. BOOK PAGE
   ------------------------------------------------------------- */
function initBook() {
  var root = document.getElementById("book-detail");
  if (!root) { return; }

  var id = null;
  var m = window.location.search.match(/[?&]id=([^&]+)/);
  if (m) { id = decodeURIComponent(m[1]); }
  if (!id) { id = store.get("bv_book", null); }
  var b = findBook(id) || CATALOG[0];

  document.getElementById("bk-crumb").textContent  = b.title;
  document.getElementById("bk-cover").innerHTML    = coverHTML(b);
  document.getElementById("bk-genre").textContent  = b.genre;
  document.getElementById("bk-title").textContent  = b.title;
  document.getElementById("bk-author").textContent = b.author;
  document.getElementById("bk-year").textContent   = b.year;
  document.getElementById("bk-call").textContent   = b.call;
  document.getElementById("bk-copies").textContent = b.copies;

  var free = available(b);
  var availEl = document.getElementById("bk-avail");
  availEl.textContent = free > 0
    ? free + " of " + b.copies + " on the shelf"
    : "All " + b.copies + " copies are out";
  availEl.className = "badge " + (free > 0 ? "badge-in" : "badge-out");

  /* What happens when the loan period starts today. */
  var dueIfBorrowed = isoDate(addDays(new Date(), LOAN_DAYS));
  document.getElementById("bk-wouldbe").textContent = prettyDate(dueIfBorrowed);

  var action = document.getElementById("bk-action");
  var msg    = document.getElementById("bk-msg");

  function paintAction() {
    if (Account.has(b.id)) {
      var line = Account.loans.filter(function (l) { return l.id === b.id; })[0];
      action.textContent = "Already on your card";
      action.disabled = true;
      msg.hidden = false;
      msg.className = "alert alert-ok";
      msg.innerHTML = "You have this out. Due <strong>" + prettyDate(line.due)
        + "</strong>. <a href=\"myloans.html\">See your loans</a>.";
    } else if (free > 0) {
      action.textContent = "Borrow this title";
      action.className = "btn btn-block";
      action.disabled = false;
    } else {
      action.textContent = Account.holds.indexOf(b.id) > -1
        ? "Hold already placed" : "Place a hold";
      action.className = "btn btn-stamp btn-block";
      action.disabled = Account.holds.indexOf(b.id) > -1;
    }
  }

  action.addEventListener("click", function () {
    msg.hidden = false;
    if (free > 0) {
      Account.borrow(b.id);
      msg.className = "alert alert-ok";
      msg.innerHTML = "Checked out. Due <strong>" + prettyDate(dueIfBorrowed)
        + "</strong> — that is " + LOAN_DAYS + " days from today. "
        + "<a href=\"myloans.html\">See your loans</a>.";
    } else {
      Account.hold(b.id);
      msg.className = "alert alert-bad";
      msg.textContent = "Hold placed. We will email you when a copy comes back.";
    }
    paintAction();
    initHeader();
  });

  paintAction();

  /* Other titles by the same author, then by the same genre. */
  var more = document.getElementById("bk-more");
  if (more) {
    var related = CATALOG.filter(function (x) {
      return x.id !== b.id && (x.author === b.author || x.genre === b.genre);
    }).slice(0, 6);
    more.innerHTML = related.map(function (x) {
      return '<div class="shelf-item">'
        + '<a href="book.html?id=' + x.id + '" data-goto="' + x.id + '">' + coverHTML(x) + '</a>'
        + '<h3 class="bt"><a href="book.html?id=' + x.id + '" data-goto="' + x.id + '">' + x.title + '</a></h3>'
        + '<div class="ba">' + x.author + '</div></div>';
    }).join("");
    rememberBook(more);
  }
}

/* -------------------------------------------------------------
   10. MY LOANS — due dates, renewals and fines
   ------------------------------------------------------------- */
function initLoans() {
  var list = document.getElementById("loan-list");
  if (!list) { return; }

  function render() {
    if (Account.loans.length === 0) {
      list.innerHTML = '<p class="empty-state"><strong>Nothing out at the moment.</strong><br>'
        + 'Browse the <a href="catalog.html">catalogue</a> to borrow something.</p>';
    } else {
      list.innerHTML = Account.loans.map(function (l) {
        var b = findBook(l.id);
        if (!b) { return ""; }
        var left = daysUntil(l.due);
        var fine = fineFor(l.due);
        var late = left < 0;

        var status;
        if (late)            { status = '<span class="badge badge-late">' + (-left) + ' days overdue</span>'; }
        else if (left === 0) { status = '<span class="badge badge-due">Due today</span>'; }
        else                 { status = '<span class="badge badge-due">Due in ' + left + ' days</span>'; }

        var canRenew = l.renews < MAX_RENEWS;

        return '<article class="slip' + (late ? " is-late" : "") + '">'
          + coverHTML(b)
          + '<div>'
          +   '<div class="st">' + b.title + '</div>'
          +   '<div class="sa">' + b.author + '</div>'
          +   '<div class="sd">' + b.call + ' · renewed ' + l.renews + ' of ' + MAX_RENEWS
          +     (fine > 0 ? ' · fine ' + money(fine) : '') + '</div>'
          + '</div>'
          + '<div class="slip-right">'
          +   '<div class="stamp-box"><b>Date due</b>' + prettyDate(l.due) + '</div>'
          +   status
          +   '<div class="slip-actions">'
          +     '<button class="btn btn-sm btn-outline" data-renew="' + l.id + '"'
          +       (canRenew ? '' : ' disabled title="No renewals left"') + '>Renew</button>'
          +     '<button class="btn btn-sm" data-return="' + l.id + '">Return</button>'
          +   '</div>'
          + '</div></article>';
      }).join("");
    }

    var fines = Account.totalFines();
    document.getElementById("ln-count").textContent   = Account.loans.length;
    document.getElementById("ln-overdue").textContent = Account.overdueCount();
    document.getElementById("ln-fines").textContent   = money(fines);

    var note = document.getElementById("ln-note");
    if (fines > 0) {
      note.innerHTML = "Fines run at " + money(FINE_PER_DAY) + " a day per item, up to "
        + money(FINE_CAP) + ". Borrowing stops once you owe more than $15.";
    } else {
      note.textContent = "Nothing owed. Items renew twice, " + LOAN_DAYS + " days each time.";
    }

    var holdBox = document.getElementById("ln-holds");
    if (holdBox) {
      holdBox.innerHTML = Account.holds.length
        ? Account.holds.map(function (id) {
            var b = findBook(id);
            return b ? '<div class="p-row"><span class="label">' + b.title
              + '</span><span>waiting</span></div>' : "";
          }).join("")
        : '<div class="p-row"><span class="label">No holds</span><span>&mdash;</span></div>';
    }
  }

  list.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.getAttribute) { return; }
    var r = t.getAttribute("data-renew");
    var g = t.getAttribute("data-return");
    var banner = document.getElementById("ln-result");

    if (r) {
      var ok = Account.renew(r);
      banner.hidden = false;
      if (ok) {
        var line = Account.loans.filter(function (l) { return l.id === r; })[0];
        banner.className = "alert alert-ok";
        banner.innerHTML = "Renewed. New due date <strong>" + prettyDate(line.due) + "</strong>.";
      } else {
        banner.className = "alert alert-bad";
        banner.textContent = "That item has used both renewals. Please bring it back.";
      }
      render(); initHeader();
    } else if (g) {
      var owed = fineFor(Account.loans.filter(function (l) { return l.id === g; })[0].due);
      var title = findBook(g).title;
      Account.giveBack(g);
      banner.hidden = false;
      banner.className = owed > 0 ? "alert alert-bad" : "alert alert-ok";
      banner.textContent = owed > 0
        ? "“" + title + "” returned. " + money(owed) + " is owed on it."
        : "“" + title + "” returned. Nothing owed, thank you.";
      render(); initHeader();
    }
  });

  render();
}

/* -------------------------------------------------------------
   11. VALIDATION HELPERS
   ------------------------------------------------------------- */
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
var ZIP_RE   = /^\d{5}(-\d{4})?$/;

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
   12. LIBRARY CARD APPLICATION — the required JavaScript item
   ------------------------------------------------------------- */
function initRegister() {
  var form = document.getElementById("register-form");
  if (!form) { return; }

  var f = {
    first: document.getElementById("reg-first"),
    last:  document.getElementById("reg-last"),
    email: document.getElementById("reg-email"),
    addr:  document.getElementById("reg-addr"),
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
  function checkAddr() {
    return setError(f.addr, f.addr.value.trim().length < 5
      ? "A card needs a home address." : "");
  }
  /* Borough residency: Bridgeview cards are issued on Queens ZIPs,
     which run 11001 to 11697. */
  function checkZip() {
    var v = f.zip.value.trim();
    if (!ZIP_RE.test(v)) { return setError(f.zip, "Enter a 5-digit ZIP code."); }
    var n = parseInt(v.slice(0, 5), 10);
    if (n < 11001 || n > 11697) {
      return setError(f.zip, "Free cards are for Queens residents. Try 11101.");
    }
    return setError(f.zip, "");
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
    var tints = ["", "#8c2f39", "#9a6f1c", "#44735a", "#2f6349"];

    if (bar) { bar.style.width = pct + "%"; bar.style.background = tints[score] || "#8c2f39"; }
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
      if (slot) { slot.textContent = "You must accept the borrowing rules."; }
      return false;
    }
    if (slot) { slot.textContent = ""; }
    return true;
  }

  f.first.addEventListener("blur", checkFirst);
  f.last.addEventListener("blur",  checkLast);
  f.email.addEventListener("blur", checkEmail);
  f.addr.addEventListener("blur",  checkAddr);
  f.zip.addEventListener("blur",   checkZip);
  f.pass.addEventListener("input", checkPass);
  f.conf.addEventListener("blur",  checkConf);
  f.terms.addEventListener("change", checkTerms);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = checkFirst() & checkLast() & checkEmail() & checkAddr()
           & checkZip() & checkPass() & checkConf() & checkTerms();

    var banner = document.getElementById("reg-result");
    banner.hidden = false;
    if (ok) {
      /* Card numbers run BV + 10 digits, as printed on the card. */
      var card = "BV" + String(Math.floor(Math.random() * 1e10)).padStart(10, "0");
      banner.className = "alert alert-ok";
      banner.innerHTML = "Welcome, " + f.first.value.trim()
        + ". Your card number is <span class=\"mono\">" + card + "</span>. "
        + "Bring photo ID to any branch to collect the physical card.";
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
   13. LOGIN
   ------------------------------------------------------------- */
function initLogin() {
  var form = document.getElementById("login-form");
  if (!form) { return; }
  var card = document.getElementById("log-card");
  var pin  = document.getElementById("log-pin");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = setError(card, /^BV\d{10}$/i.test(card.value.trim())
               ? "" : "Card numbers look like BV0000000000.")
           & setError(pin, /^\d{4}$/.test(pin.value.trim())
               ? "" : "Your PIN is four digits.");
    var banner = document.getElementById("log-result");
    banner.hidden = false;
    if (ok) {
      banner.className = "alert alert-ok";
      banner.textContent = "Signed in. (This demo does not store accounts.)";
    } else {
      banner.className = "alert alert-bad";
      banner.textContent = "Check your card number and PIN.";
    }
  });
}

/* -------------------------------------------------------------
   14. CONTACT
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
        + ". A librarian will reply within two business days.";
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
   15. START
   ------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  Account.load();
  initHeader();
  initHome();
  initCatalog();
  initBook();
  initLoans();
  initRegister();
  initLogin();
  initContact();
});
