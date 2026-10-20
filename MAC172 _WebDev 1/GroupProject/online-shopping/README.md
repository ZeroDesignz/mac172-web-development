# Thread &amp; Co. — Online Shopping Site

Candidate for the MAC172 group project (Fall I 2026). A fictional retail site built
with HTML, CSS and JavaScript only — no frameworks, no backend.

## Running it

Open `index.html` in any browser. No build step and no server needed.

## Pages (9)

| File | Purpose |
|---|---|
| `index.html` | Home — hero, featured products, categories |
| `shop.html` | Full catalog with filter, search and sort |
| `product.html` | Product detail, specs, quantity, add to cart |
| `cart.html` | Line items, quantity stepper, running total |
| `checkout.html` | Shipping and payment form with validation |
| `register.html` | Account registration with full validation |
| `login.html` | Sign in |
| `contact.html` | Contact and feedback form |
| `terms.html` | Terms of Service |

## JavaScript features

All in `js/script.js`:

1. **Registration form validation** — email pattern, password rules (8+ characters,
   a capital letter, a number), a live strength meter, confirm-password match, and a
   required terms checkbox. Fields validate on blur; the whole form validates on submit.
2. **Shopping cart** — add, remove and change quantities. Subtotal, 8.875% New York
   City sales tax, and free shipping over $75. Saved to `localStorage`, so the item
   count in the header follows you from page to page.
3. **Product filter, search and sort** — category chips, live text search across name,
   category and material, and four sort orders.
4. **Checkout validation** — ZIP code, phone and 16-digit card number patterns.
5. **Contact form validation** — with a live character counter.
6. **Mobile navigation toggle.**

## Styling

One external stylesheet, `css/styles.css`, is linked by all nine pages, so the design
stays consistent across the site. Colors, fonts and spacing are defined once as custom
properties in the `:root` block at the top.

## Still to do

- Replace the CSS gradient placeholders with real product photographs in `images/`.
  See `images/README.txt` for the naming scheme.
- Change the business name and address if the team picks a different brand.
