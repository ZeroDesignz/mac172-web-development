# Hudson Auto Rental — Car Rental Site

Candidate for the MAC172 group project (Fall I 2026). A fictional car rental company
built with HTML, CSS and JavaScript only — no frameworks, no backend.

## Running it

Open `index.html` in any browser. No build step and no server needed.

## Pages (9)

| File | Purpose |
|---|---|
| `index.html` | Home — hero, search widget, popular vehicles, how it works |
| `fleet.html` | Ten vehicles with class filter, search and sort |
| `vehicle.html` | Vehicle detail with the live rental quote |
| `booking.html` | Reservation review, driver details, confirmation number |
| `locations.html` | Five counters, hours, one-way drop fees |
| `register.html` | Account registration with full validation |
| `login.html` | Sign in |
| `contact.html` | Contact form, reservations desk, roadside assistance |
| `terms.html` | Rental terms, rates and fees |

## JavaScript features

All in `js/script.js`:

1. **Registration form validation** — email pattern, date-of-birth age check against
   the 21-and-over rental rule, password rules (8+ characters, a capital letter, a
   number) with a live strength meter, confirm-password match, required terms checkbox.
2. **Rental cost calculator** — counts the days between the two dates, multiplies by the
   daily rate, adds the per-day options, applies the $25/day young driver surcharge for
   drivers aged 21 to 24, then 14.5% taxes and airport fees. Recalculates on every change.
3. **Fleet filter, search and sort** — six class chips, text search, four sort orders.
   Each row shows the all-in total for the dates currently chosen.
4. **Date and age validation** — the return date must fall after the pick-up date, no
   past dates, drivers under 21 are refused. The Reserve button disables until the
   dates make sense.
5. **Contact form validation** — with a live character counter.
6. **Mobile navigation toggle.**

The search is carried between pages in `localStorage`, so the dates chosen on the home
page follow you to the fleet, the vehicle page and the booking.

## Worked example

Toyota RAV4 at $78/day, 5 days, with the collision damage waiver at $19/day:

```
  vehicle     78.00 x 5            = 390.00
  options     19.00 x 5            =  95.00
  subtotal                           485.00
  taxes       485.00 x 14.5%        =  70.33
  total                              555.33
```

The same rental for a 22-year-old driver adds $25 x 5 = $125, giving $698.45.

## Styling

One external stylesheet, `css/styles.css`, linked by all nine pages. Barlow and Barlow
Condensed are used throughout; Barlow was drawn from American highway signage, which
suits a rental company. All colors, fonts and spacing are custom properties in the
`:root` block at the top.

## Still to do

- Replace the SVG vehicle silhouettes with real photographs in `images/`.
  See `images/README.txt` for the naming scheme.
- Change the company name and addresses if the team picks a different brand.
