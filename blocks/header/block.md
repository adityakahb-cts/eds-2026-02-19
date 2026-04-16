# Header

Renders the site-wide navigation bar including the logo, megamenu, search form, and mobile hamburger toggle. Navigation content is loaded automatically from the `/nav` page (or the URL specified in the `nav` metadata tag on the page).

The header block itself has no authored fields. All content is maintained on the `/nav` page as a collection of discrete blocks described below.

---

## Nav Fragment Content Model

The `/nav` page must contain the following blocks, in order.

---

### Logo block

Supplies the light-mode and dark-mode logo image URLs.

| Logo                         |                              |
|------------------------------|------------------------------|
| Light logo URL *(required)*  | Dark logo URL *(required)*   |
| Path or URL to the SVG/PNG logo image rendered when the site is in light mode | Path or URL to the SVG/PNG logo image rendered when the site is in dark mode |

---

### Navigation block

Defines the megamenu items. Each authored row produces one top-level navigation item. A row with content in cells 2 and 3 renders a full megamenu panel; a row with only cell 1 renders a plain link.

| Navigation                        |                                         |                                                               |
|-----------------------------------|-----------------------------------------|---------------------------------------------------------------|
| Main nav link *(required)*        | Megamenu image *(optional)*             | Megamenu content *(optional)*                                 |
| Heading element (`h2`/`h3`) wrapping the top-level navigation anchor | `<picture>` element used as a related representation image inside the megamenu panel | Landing link (bold heading anchor) followed by up to 2 `<ul>` sub-navigation link lists |

#### Megamenu content cell (cell 3) structure

- **Landing link** — a heading (`h2`/`h3`) containing a bold anchor; this is the primary link for the section.
- **Subnav 1** *(optional)* — a `<ul>` whose `<li>` elements each contain an anchor.
- **Subnav 2** *(optional)* — a second `<ul>` in the same cell; maximum of 2 sub-navigation groups per item.

---

### Search block

Supplies all content needed to render the search toggle button and the inline search form.

| Search                             |                                    |                                       |                                        |
|------------------------------------|------------------------------------|---------------------------------------|----------------------------------------|
| Search icon *(required)*           | Search label *(required)*          | Placeholder text *(required)*         | Submit button text *(required)*        |
| Icon name or SVG src for the search toggle button | Accessible `aria-label` for the toggle button and the search `<input>` | Placeholder text shown inside the search input field | Visible label / accessible text for the search form submit button |

---

### Hamburger block

Supplies the icon and accessible label for the mobile hamburger toggle button.

| Hamburger                          |                                    |
|------------------------------------|------------------------------------|
| Hamburger icon *(required)*        | Hamburger label *(required)*       |
| Icon name or SVG src for the mobile menu toggle button | Accessible `aria-label` for the hamburger toggle button |

---

## Header block (no authored fields)

| Header                 |
|------------------------|
| *(no authored fields)* |

The block fetches the navigation fragment automatically — no fields are authored directly in this block. All navigation content is maintained on the `/nav` page using the blocks documented above.

---

## Rendered markup and CSS

The block renders into a fixed-position shell using Bootstrap-style utility classes plus the following block-scoped classes. Add styles to the matching breakpoint partial in `./styles/` — never directly to `header.css`.

### CSS class reference

| Class | Element | Purpose |
|---|---|---|
| `.siteheader` | `<div>` | Top-level header content wrapper |
| `.siteheader-logo` | `<div>` | Logo container |
| `.siteheader-logo-light` | `<img>` | Logo image shown in light mode |
| `.siteheader-logo-dark` | `<img>` | Logo image shown in dark mode (hidden by default; revealed by `[data-eds-theme='dark']` or `prefers-color-scheme: dark`) |
| `.siteheader-nav` | `<nav>` | Desktop navigation (hidden below xl via utility classes) |
| `.siteheader-navlink` | `<a>` | Top-level navigation anchor; receives `aria-haspopup`, `aria-expanded`, and `aria-controls` when a megamenu is present |
| `.siteheader-right` | `<div>` | Wrapper for the contact CTA and mobile hamburger button |
| `.siteheader-subnav` | `<div>` | Megamenu panel — hidden by default (`visibility: hidden; opacity: 0`) and revealed at `≥ 1272px` on hover or when the trigger link has `aria-expanded="true"` |
| `.siteheader-megamenu-image` | `<div>` | Left column of the megamenu panel; contains the representative image |
| `.siteheader-megamenu-landing` | `<div>` | Centre column; contains the section's primary landing-page link and optional description |
| `.siteheader-megamenu-subnavs` | `<div>` | Right column; contains up to two `<ul>` sub-navigation link groups |

### Breakpoint partials

Styles are split across `./styles/` partials imported by `header.css`. Each partial targets a single breakpoint:

| File | Breakpoint | Contains |
|---|---|---|
| `default.css` | all (mobile-first base) | Logo light/dark swap, nav-link colours and focus rings, megamenu hidden state, megamenu content link styles |
| `sm.css` | `≥ 632px` | _(reserved — add overrides here)_ |
| `md.css` | `≥ 760px` | _(reserved — add overrides here)_ |
| `lg.css` | `≥ 992px` | _(reserved — add overrides here)_ |
| `xl.css` | `≥ 1272px` | Megamenu show on hover / `aria-expanded="true"`, active nav-link highlight |
| `xxl.css` | `≥ 1432px` | _(reserved — add overrides here)_ |

### Megamenu open/close

The megamenu uses CSS `visibility` + `opacity` transitions (not `display`) so the fade animation plays on both open and close. It is activated in two ways:

1. **Hover** — `li:hover .siteheader-subnav` (no JS required).
2. **Keyboard** — JS sets `aria-expanded="true"` on `.siteheader-navlink`; the rule `li:has(.siteheader-navlink[aria-expanded='true']) .siteheader-subnav` reveals the panel.

Both rules live in `styles/xl.css` and only take effect at `width ≥ 1272px`, where the desktop nav is visible.

---

## Testing

| File | Purpose |
|---|---|
| `header.spec.js` | Playwright e2e tests — nav-wrapper, nav#nav, hamburger button, brand/sections/tools sections, mobile toggle interaction |

Draft page: `tests/header-test.html` (uses `<meta name="nav" content="/tests/fragments/nav">` to load `tests/fragments/nav.plain.html` instead of the live CMS nav).
