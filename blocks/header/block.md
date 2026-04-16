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

## Testing

| File | Purpose |
|---|---|
| `header.spec.js` | Playwright e2e tests — nav-wrapper, nav#nav, hamburger button, brand/sections/tools sections, mobile toggle interaction |

Draft page: `tests/header-test.html` (uses `<meta name="nav" content="/tests/fragments/nav">` to load `tests/fragments/nav.plain.html` instead of the live CMS nav).
