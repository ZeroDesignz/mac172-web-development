# Kestrel Air — Airline Reservation Site

Candidate for the MAC172 group project (Fall I 2026). A fictional airline built
with HTML, CSS and JavaScript only — no frameworks, no backend, no build step.

## Running it

Open `index.html` in any browser. Nothing to install and no server needed.

## Pages (12)

| File | Purpose |
|---|---|
| `index.html` | Home — flight search, network stats, popular routes |
| `flights.html` | Search results, with filters and four sort orders |
| `seats.html` | Interactive cabin map, 22 rows, three fare classes |
| `passengers.html` | One form per passenger, built from the search |
| `payment.html` | Card details with validation and a fare summary |
| `confirmation.html` | Boarding pass with record locator and barcode |
| `manage.html` | Look up, view or cancel a booking |
| `destinations.html` | All ten cities, fares, flight times and the fleet |
| `register.html` | Kestrel Club signup with a password strength meter |
| `login.html` | Sign in |
| `contact.html` | Contact form with a live character counter |
| `terms.html` | Conditions of carriage |

## The booking flow

The five steps hand work to each other through a single object in
`localStorage` under `kestrel.booking`. Search writes the route, date and
passenger count; the results page writes the chosen flight; the seat map writes
the seats; the passenger page writes the travellers. Payment reads all of it,
generates a record locator and marks the booking paid. Nothing leaves the
browser, because there is no server to send it to.

A step reached out of order says so instead of breaking — open `seats.html`
with no flight chosen and it points you back to the search.

## JavaScript features

All in `js/script.js`:

1. **Search validation** — departure and destination cannot match, dates cannot
   be in the past, the return cannot precede the departure, and the passenger
   count is held between 1 and 6. Switching to one way moves the requirement off
   the return field rather than just hiding it.
2. **Results, filtered and sorted** — filter by stops and by departure window
   (morning, afternoon, evening); sort by fare, duration, departure or arrival.
   The schedule is generated from the route itself, so the same search always
   produces the same eight flights and the filters can actually be checked.
   Arrivals that cross midnight are marked `+1`.
3. **Interactive seat map** — 132 seats across 22 rows in three classes. Sold
   seats are derived from the flight number, so a given flight always has the
   same cabin. You may select exactly as many seats as you have passengers; the
   button counts down and the page explains the limit rather than silently
   refusing the click.
4. **Passenger forms built at runtime** — one fieldset per passenger, each with
   name, date of birth and a nine-character passport number. Fields validate on
   blur, not on every keystroke.
5. **Payment validation** — the card number spaces itself into groups of four
   as it is typed, the expiry formats to MM/YY and is rejected if it has already
   passed, and the CVV and billing ZIP have their own patterns.
6. **Fare arithmetic** — air fare × passengers, plus seat fees by class, plus
   the three taxes that actually appear on a US ticket: 7.5% federal excise,
   $5.20 per segment and the $5.60 September 11 fee.
7. **Record locator** — six characters, letters and digits, with `I` and `O`
   left out so nothing is misread as `1` or `0`.
8. **Booking lookup** — `manage.html` matches the locator against the surname
   and will cancel the booking.
9. **Password strength meter** on the Kestrel Club signup.
10. **Character counter** on the contact form.
11. **Mobile navigation toggle.**

## Styling

One external stylesheet, `css/styles.css`, shared by all twelve pages.

The reference is airport wayfinding and the mechanical departure board. Signage
is dark with light type, so the structural bands — header, hero, board header,
footer — keep that relationship and the reading areas invert it. Anything that
belongs in a column is set in a monospace with tabular figures, which is why
flight times, fares and gate numbers line up the way a real board lines up.

- **Space Grotesk** for the wordmark and headings — squared-off terminals that
  read as engineered transport lettering rather than as a generic sans.
- **Inter** for body copy and form labels.
- **JetBrains Mono** for every figure: times, fares, seat numbers, the record
  locator.

Every image on the site is drawn in CSS. The destination cards use a two-stop
gradient sky with a clipped horizon rather than photographs; the barcode on the
boarding pass is a repeating linear gradient; the kestrel mark in the header is
two swept chevrons made from pseudo-elements. There are no image files to lose.

## Responsive

Three breakpoints. At 1000px the sidebar drops below the content. At 760px the
navigation collapses behind a Menu button and the five-column flight board
becomes a stack of cards — a five-column grid cannot survive a phone, so each
flight reflows into two rows instead of being squeezed. At 400px the seat grid
tightens so the cabin still fits without sideways scrolling.

Checked at 390px: no horizontal overflow on any of the twelve pages.

## Accessibility

Labels are bound to every input, the seat buttons carry `aria-label` text saying
whether a seat is taken, the nav toggle reports `aria-expanded`, and error text
sits in the document rather than only in colour.
