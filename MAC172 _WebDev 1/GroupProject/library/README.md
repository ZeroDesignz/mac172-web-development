# Bridgeview Public Library — Library Management Site

Candidate for the MAC172 group project (Fall I 2026). A fictional public library built
with HTML, CSS and JavaScript only — no frameworks, no backend.

## Running it

Open `index.html` in any browser. No build step and no server needed.

## Pages (9)

| File | Purpose |
|---|---|
| `index.html` | Home — hero, quick search, new arrivals, how borrowing works |
| `catalog.html` | Twelve titles with subject filter, search, sort, availability toggle |
| `book.html` | One title: availability, call number, borrow or place a hold |
| `myloans.html` | Current loans with due dates, renewals and fines |
| `branches.html` | Three branches, hours, facilities, returns |
| `register.html` | Library card application with full validation |
| `login.html` | Sign in with card number and PIN |
| `contact.html` | Ask a librarian |
| `policies.html` | Loan periods, renewals, fines, holds, privacy |

## JavaScript features

All in `js/script.js`:

1. **Library card application validation** — email pattern, address, a Queens ZIP code
   check (11001–11697, since free cards are issued on borough residency), password rules
   with a live strength meter, confirm-password match, required rules checkbox. On
   success it issues a card number in the `BV` + 10-digit format.
2. **Catalogue search, filter and sort** — subject chips, text search across title,
   author and Dewey call number, an "on the shelf only" toggle, and four sort orders.
3. **Borrowing with due dates and fines** — borrowing sets a due date 21 days out.
   `My loans` shows days remaining or days overdue, and charges $0.25 per day past due,
   capped at $10 per item. Renewals run 21 days from the day you renew, with a limit of
   two per item.
4. **Holds** — titles with every copy out offer a hold instead of a loan, tracked on the
   loans page.
5. **Contact form validation** — with a live character counter.
6. **Mobile navigation toggle.**

Loans and holds persist in `localStorage`, so the count in the header follows you across
pages. A first-time visitor starts with two items already out, one of them four days
overdue, so the fine calculation is visible without having to set it up.

## Worked example

```
  item 4 days overdue    4 x $0.25  = $1.00
  item 20 days overdue  20 x $0.25  = $5.00
  item 40 days overdue  40 x $0.25  = $10.00  (capped)
  item 60 days overdue              = $10.00  (still capped)
```

## Styling

One external stylesheet, `css/styles.css`, linked by all nine pages. The palette follows
library stationery: catalogue-card blue for structure and date-stamp red for anything
overdue. Book covers are generated from the title and author in CSS, so the catalogue
has real visual weight without any image files.

## Still to do

- Swap the generated covers for real jacket images if the team can source them.
- Change the library name and branch addresses if the team picks a different institution.
