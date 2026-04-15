# Header

Renders the site-wide navigation bar. Navigation content is loaded automatically from the `/nav` page (or the URL specified in the `nav` metadata tag on the page).

## Default

| Header                 |
|------------------------|
| *(no authored fields)* |

The block fetches the navigation fragment automatically — no fields are authored directly in this block. All navigation content is maintained on the `/nav` page.

## Testing

| File | Purpose |
|---|---|
| `header.spec.js` | Playwright e2e tests — nav-wrapper, nav#nav, hamburger button, brand/sections/tools sections, mobile toggle interaction |

Draft page: `tests/header-test.html` (uses `<meta name="nav" content="/tests/fragments/nav">` to load `tests/fragments/nav.plain.html` instead of the live CMS nav).
