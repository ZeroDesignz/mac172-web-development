# Meridian Credit Union — Online Banking Site

Candidate for the MAC172 group project (Fall I 2026). A fictional member-owned credit
union built with HTML, CSS and JavaScript only — no frameworks, no backend.

## Running it

Open `index.html` in any browser. No build step and no server needed.

## Pages (10)

| File | Purpose |
|---|---|
| `index.html` | Public landing — rates, products, what members get |
| `dashboard.html` | Account tiles, spending chart, recent activity, net position |
| `account.html` | One account: transactions with search, category and date filters |
| `transfer.html` | Move money between accounts, with balance checking |
| `billpay.html` | Payees, pay now or schedule for later |
| `loans.html` | Loan and mortgage calculator with a first-year schedule |
| `register.html` | Account opening with full validation |
| `login.html` | Sign in with a member number |
| `contact.html` | Member services, lost card line, branch |
| `terms.html` | Membership agreement, fee schedule, liability, privacy |

Ten pages clears the rubric's "8 or more" bar for Excellent on Content.

## JavaScript features

All in `js/script.js`:

1. **Account opening validation** — email and phone patterns, a date-of-birth check
   against the 18-and-over rule, last-four-of-SSN format, ZIP code, and a stricter
   banking password rule (10 characters with a capital, a number and a symbol) driving
   a live strength meter. Issues a member number in the `MC` + 8-digit format.
2. **Transfers** — validates the two accounts differ, the amount is positive, and the
   source has the funds. Posts matching debit and credit transactions and updates both
   balances.
3. **Loan calculator** — the standard amortization formula:

   ```
   M = P · r(1 + r)^n / ((1 + r)^n − 1)
   ```

   where `P` is the principal, `r` the monthly rate and `n` the number of payments.
   Returns the monthly payment, total repaid, total interest, and a month-by-month
   first-year schedule showing the interest/principal split. Guards the zero-rate case.
4. **Transaction search, category filter and date range** — three filters working
   together, with money-in, money-out and net totals for whatever is shown.
5. **Spending-by-category chart** — computed from the transaction list, excluding
   transfers and income. One hue, bars sorted largest first, value printed at the end
   of each bar.
6. **Bill pay** — today's date pays immediately and posts a transaction; a future date
   schedules it. Validates funds and refuses back-dated payments.
7. **Contact form validation** — with a live character counter.
8. **Mobile navigation toggle.**

Balances and transactions persist in `localStorage`, so a transfer made on one page is
visible on the dashboard and in the account history.

## Worked example

A $300,000 mortgage at 6.25% APR over 30 years:

```
  n = 30 × 12 = 360 payments
  r = 6.25 / 100 / 12 = 0.00520833 per month
  M = 300000 × 0.00520833 × 1.00520833^360 / (1.00520833^360 − 1)
    = $1,847.15 per month
  total repaid  = 1847.15 × 360 = $664,974.58
  interest paid = 664,974.58 − 300,000 = $364,974.58  (54.9% of what you repay)
```

## Styling

One external stylesheet, `css/styles.css`, linked by all ten pages. Green and red are
reserved for credits and debits — the banking convention — and never used as decoration,
so an amount's sign is readable at a glance. All colors, fonts and spacing are custom
properties in the `:root` block at the top.

## Still to do

- Change the institution name, routing number and addresses if the team picks a
  different brand.
- The hero card graphic is drawn in CSS; swap it for a real product photograph if one
  is available.
