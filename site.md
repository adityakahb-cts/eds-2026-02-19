# Site Plan — Bootstrap-Style Documentation Site

A documentation and showcase website built on Edge Delivery Services (EDS / AEM), surfacing all design system elements: typography, grid, blocks, helper classes, utilities, and forms. Supports dark and light modes via a CSS `prefers-color-scheme` media query plus an explicit toggle.

---

## Site Architecture

### Pages

| Page | Path | Description |
|---|---|---|
| Home | `/` | Intro, quick-start links, design system overview |
| Typography | `/typography` | Font families, sizes, weights, headings, body text, lists, quotes |
| Grid | `/grid` | 12-column grid, section layouts, responsive breakpoints, offset and nesting |
| Blocks | `/blocks` | Live demos of every block with authored markup and decoration output |
| Helper Classes | `/helpers` | Utility classes for spacing, alignment, visibility, and text treatment |
| Utilities | `/utilities` | CSS custom properties reference, icons, images, colour swatches |
| Forms | `/forms` | Input types, select, textarea, checkbox, radio, validation states |

---

## Dark / Light Mode Strategy

- **Auto mode**: Respect `prefers-color-scheme` media query by default.
- **Manual toggle**: A theme-toggle block injects a `<button>` in the header that writes `data-eds-theme="dark"` or `data-eds-theme="light"` to `<html>` and persists the choice to `localStorage`.
- **CSS implementation**: All colour tokens are already defined in `styles/config/themes.css` (light) and overridden in `[data-eds-theme="dark"]` plus `@media (prefers-color-scheme: dark)`. Project-level colour adjustments go in `styles/config/overrides.css` — see `docs/globals.md` for the full token reference.
- The toggle block is added to the header fragment via auto-blocking so it is available on every page.

---

## Blocks to Develop

> **Naming convention**: Blocks prefixed with `_` (e.g. `_type-specimen`) are documentation-only demo blocks. They exist solely to showcase design system elements on doc pages and are never used on production content pages.
>
> **Globally handled**: `button`, `form`, and `grid` are **not** implemented as blocks. Button styles live in `styles/config/globals.css`, form element styles in `styles/config/forms.css`, and the grid system in `styles/config/grid.css`. Demo pages for these use native HTML elements and global CSS classes directly — no block decoration required.

---

### 1. `theme-toggle`
**Purpose**: Dark / light mode toggle button rendered in the header.  
**Authored content**: None — zero-configuration block. Authors add an empty `Theme Toggle` block to the header fragment and the block wires up the rest.  
**Behaviour**:
- Reads current theme from `localStorage` or `prefers-color-scheme` on load.
- Sets `data-eds-theme` on `<html>`.
- Provides a `<button aria-pressed>` with sun/moon SVG icons.
- Listens to `change` events on the OS media query to sync when user changes OS preference and no manual override exists.  
**Files**: `theme-toggle.js`, `theme-toggle.css`, `block.md`, `markup.js`, `theme-toggle.spec.js`

---

### 2. `tabs`
**Purpose**: Tabbed content panels for multi-variant documentation (e.g., HTML / CSS / JS views).  
**Authored content**: Each row is one tab — Row 1: tab label, Row 2: tab panel content (rich text only).  
**Behaviour**:
- Renders a `<ul role="tablist">` with `<button role="tab">` elements.
- Panels use `role="tabpanel"` with `hidden` attribute toggled on activation.
- Keyboard navigation: arrow keys cycle tabs; Home/End jump to first/last.  
**Files**: `tabs.js`, `tabs.css`, `block.md`, `markup.js`, `tabs.spec.js`

---

### 3. `accordion`
**Purpose**: Collapsible content sections for FAQs, documentation details, and progressive disclosure.  
**Authored content**: Each row is one panel — Row 1: panel heading (trigger text), Row 2: panel body (rich text).  
**Behaviour**:
- Renders `<details>`/`<summary>` pairs for native, JS-free fallback.
- Enhanced with ARIA `aria-expanded` / `aria-controls` and smooth height animation via CSS `grid-template-rows` trick.
- Supports `accordion (exclusive)` variation where only one panel is open at a time.
- Keyboard: Enter/Space toggle; arrow keys move between triggers.  
**Files**: `accordion.js`, `accordion.css`, `block.md`, `markup.js`, `accordion.spec.js`

---

### 4. `card`
**Purpose**: Content card with image, heading, body text, and optional CTA link.  
**Authored content**: Each row is one card — Row 1: image, Row 2: heading, Row 3: body text, Row 4 (optional): CTA link.  
**Behaviour**:
- Renders a `<ul>` of `<li>` card items in a responsive CSS grid (1 → 2 → 3 columns).
- Supports `card (horizontal)` variation for image-left layout.
- Image uses `createOptimizedPicture` for responsive art direction.
- CTA link styled as a button using existing `.button` class.  
**Files**: `card.js`, `card.css`, `block.md`, `markup.js`, `card.spec.js`

---

### 5. `offcanvas`
**Purpose**: Slide-in panel from any edge (left, right, top, bottom) for navigation, filters, or supplemental content.  
**Authored content**: Row 1: trigger label, Row 2: panel position (left | right | top | bottom), Row 3: panel content (rich text only).  
**Behaviour**:
- Trigger button opens the panel; overlay click and Escape key close it.
- Panel slides in with a CSS `transform` transition; overlay fades in.
- Focus is trapped inside the open panel (`Tab` / `Shift+Tab` cycle).
- `aria-modal="true"` and `role="dialog"` on the panel; `aria-expanded` on trigger.
- Body scroll locked while panel is open (`overflow: hidden` on `<body>`).  
**Files**: `offcanvas.js`, `offcanvas.css`, `block.md`, `markup.js`, `offcanvas.spec.js`

---

### 6. `modal`
**Purpose**: Overlay dialog for confirmations, forms, image lightboxes, or detailed content.  
**Authored content**: Row 1: trigger label, Row 2: modal title, Row 3: modal body content (rich text), Row 4 (optional): footer actions (links/buttons).  
**Behaviour**:
- Uses the native `<dialog>` element with `showModal()` / `close()` for built-in backdrop and focus management.
- Escape key and close button dismiss the modal.
- Supports `modal (fullscreen)` variation.
- Focus returns to the trigger element on close.
- `aria-labelledby` wired to the modal title.  
**Files**: `modal.js`, `modal.css`, `block.md`, `markup.js`, `modal.spec.js`

---

### 7. `breadcrumbs`
**Purpose**: Hierarchical page location trail for navigation context.  
**Authored content**: Each row is one crumb — Row 1: label, Row 2: href (omit for current page).  
**Behaviour**:
- Renders a `<nav aria-label="Breadcrumb">` with an `<ol>` list.
- Last item has `aria-current="page"` and no link.
- Separator is injected via CSS `::after` (configurable via `--breadcrumb-separator` token).
- Truncates on narrow viewports with an ellipsis crumb that expands on tap.  
**Files**: `breadcrumbs.js`, `breadcrumbs.css`, `block.md`, `markup.js`, `breadcrumbs.spec.js`

---

### 8. `toc` (Table of Contents)
**Purpose**: Auto-generated in-page navigation for long documentation pages.  
**Authored content**: Zero-configuration block placed at the top of a documentation page.  
**Behaviour**:
- Scans the page for `h2` and `h3` elements after decoration.
- Builds a nested `<nav>` with anchor links.
- Highlights the active section on scroll using `IntersectionObserver`.
- Sticky on desktop (positioned in the left rail).  
**Files**: `toc.js`, `toc.css`, `block.md`, `markup.js`, `toc.spec.js`

---

### 9. `callouts`
**Purpose**: Highlighted info, warning, tip, and danger notices inline with content.  
**Authored content**: Row 1: variant (info | warning | tip | danger), Row 2: message content (rich text).  
**Behaviour**:
- Applies `.callouts--{variant}` class to drive icon and colour.
- SVG icon injected from `/icons/{variant}.svg`.
- `role="note"` or `role="alert"` depending on variant severity.  
**Files**: `callouts.js`, `callouts.css`, `block.md`, `markup.js`, `callouts.spec.js`

---

### 10. `_type-specimen` *(demo)*
**Purpose**: Full typography specimen showing every heading level, body size, weight, and style in the current theme.  
**Authored content**: Zero-configuration block; authors drop an empty `Type Specimen` block on the typography page.  
**Behaviour**:
- Programmatically generates `h1`–`h6`, paragraph, lead, small, monospace, and blockquote examples.
- Each entry shows the CSS variable name used.
- Mirrors live values from `getComputedStyle` so the page always reflects the current token values.  
**Files**: `_type-specimen.js`, `_type-specimen.css`, `block.md`, `markup.js`, `_type-specimen.spec.js`

---

### 11. `_grid-demo` *(demo)*
**Purpose**: Interactive visualiser showing the 12-column layout system and responsive breakpoints.  
**Authored content**:
- Row 1: column spans to demonstrate (e.g. "4 4 4" renders three 4-col spans)
- Row 2 (optional): label per span  
**Behaviour**:
- Renders labelled column cells inside a 12-column CSS grid container using the global grid classes from `styles/config/grid.css`.
- A breakpoint bar shows the current active breakpoint (default / sm / md / lg / xl / xxl).
- Highlighted cells display their span count.  
**Files**: `_grid-demo.js`, `_grid-demo.css`, `block.md`, `markup.js`, `_grid-demo.spec.js`

---

### 12. `_form-demo` *(demo)*
**Purpose**: Showcase all form element types and validation states using the global form styles from `styles/config/forms.css`.  
**Authored content**: Each row is one form field — Row 1: input type (text | email | password | select | textarea | checkbox | radio), Row 2: label, Row 3 (optional): help text.  
**Behaviour**:
- Renders fully functional, accessible form controls styled entirely by global CSS — no block-scoped form styles.
- Each control shown in all states (default / focus / error / disabled) in a grid.
- Uses `fieldset` + `legend` grouping for radio/checkbox groups.
- Validation states driven by CSS classes: `.is-valid`, `.is-invalid`.  
**Files**: `_form-demo.js`, `_form-demo.css`, `block.md`, `markup.js`, `_form-demo.spec.js`

---

## Global Style Additions

### styles/config/overrides.css
- The single file new developers should edit to customise design tokens (colours, fonts, spacing, etc.) for this project. All overrides placed here win the cascade without `!important`. See `docs/globals.md` for the full token reference and usage guidance.

### styles/config/globals.css
- **Button styles**: All `.button` variant and size modifier classes (`.button--primary`, `.button--secondary`, `.button--outline`, `.button--ghost`, `.button--danger`, `.button--sm`, `.button--lg`). No separate `button` block exists — styling is purely global CSS.

### styles/config/forms.css
- **Form element styles**: All input, select, textarea, checkbox, radio, and validation state styles (`.is-valid`, `.is-invalid`). No separate `form` block exists — all form elements on any page are styled globally.

### styles/config/grid.css
- **Grid system**: The 12-column layout via `.container`, `.row`, `.col-{n}`, and CSS Grid helper classes. No separate `grid` block exists — grid layout is authored directly with these utility classes.

### styles/lazy-styles.css
- Helper / utility classes (loaded post-LCP, safe for layout):
  - **Spacing**: `.mt-{1-5}`, `.mb-{1-5}`, `.p-{1-5}` using `--spacing-{n}` tokens.
  - **Text alignment**: `.text-left`, `.text-center`, `.text-right`.
  - **Display**: `.d-none`, `.d-block`, `.d-flex`, `.d-grid`.
  - **Visibility**: `.visually-hidden` (SR-only pattern).
  - **Flex utilities**: `.flex-row`, `.flex-col`, `.gap-{1-3}`, `.align-center`, `.justify-between`.
  - **Grid utilities**: `.col-{1-12}` for spanning columns in a grid section.
  - **Text treatment**: `.text-muted`, `.text-small`, `.text-lead`, `.text-mono`, `.text-truncate`.
  - **Surface**: `.surface` (applies `--surface-color` background), `.rounded`, `.bordered`.

### scripts/scripts.js
- Wire up `theme-toggle` detection in `buildAutoBlocks`: if the header contains a `[href*="theme-toggle"]` or `theme toggle` block, initialise theme from `localStorage` / `prefers-color-scheme` before first paint to prevent flash of wrong theme (FOWT).

---

## Fonts & Colour Palette (Pending)

Font choices and the full colour palette will be added by the user. Placeholder tokens are defined in `styles/styles.css` using the existing Roboto stack. Once fonts are confirmed:
1. Add `@font-face` declarations to `styles/fonts.css`.
2. Update `--body-font-family` and `--heading-font-family` tokens.
3. Add `size-adjust` fallback metrics.

Once the colour palette is confirmed:
1. Replace placeholder hex values in `--color-*` tokens.
2. Update dark-mode overrides accordingly.

---

## Development Order

1. **Global styles** — Verify tokens in `styles/config/`, confirm `styles/config/overrides.css` is wired. Add any missing button/form/grid utility classes to `globals.css`, `forms.css`, and `grid.css`. Add helper classes to `lazy-styles.css`.
2. **`theme-toggle`** — Needed early so every subsequent page can be tested in both themes.
3. **`toc`** — Needed to navigate long doc pages during development.
4. **`breadcrumbs`** — Shared navigation chrome; needed on all doc pages.
5. **`callouts`** — Used heavily across all doc pages for notes and warnings.
6. **`tabs`** — Used for variant switching on block demo pages.
7. **`accordion`** — Docs and FAQ sections.
8. **`card`** — Grid and blocks pages.
9. **`modal`** — Standalone interactive block.
10. **`offcanvas`** — Standalone interactive block.
11. **`_type-specimen`** — Typography page.
12. **`_grid-demo`** — Grid page.
13. **`_form-demo`** — Forms page.
14. **Content pages** — Author all seven doc pages (home, typography, grid, blocks, helpers, utilities, forms).

---

## Modern Platform Features

All features in this section are baseline-available across Chrome, Firefox, and Safari stable releases as of 2026. No polyfills or transpilation are used; EDS ships vanilla JS and CSS as-is.

---

### CSS Modern Features

#### Math Functions (CSS Values Level 4)
Use in token definitions and utility classes wherever they replace magic numbers.

| Function | Purpose | Example |
|---|---|---|
| `rem(a, b)` | Remainder of `a ÷ b`, same sign as `a` | `rem(17px, 5px)` → `2px` |
| `mod(a, b)` | Modulo, same sign as `b` | `mod(-1, 3)` → `2` |
| `round(strategy, val, step)` | Snap to nearest step | `round(nearest, 1.3rem, 0.25rem)` → `1.25rem` |
| `abs(val)` | Absolute value | `abs(-1em)` → `1em` |
| `sign(val)` | Returns `−1`, `0`, or `1` | Used with `calc()` for direction logic |
| `min()` / `max()` / `clamp()` | Constrain a value | `clamp(1rem, 2.5vw, 1.5rem)` for fluid type |

Prefer `clamp()` for fluid typography and spacing; use `round()` to snap spacing tokens to the base-4 grid.

#### Color Functions
All color tokens must be defined in `oklch()`. `oklch` is perceptually uniform, making palette generation (lightness steps, alpha variants) predictable.

```css
--color-primary: oklch(55% 0.22 260);              /* base */
--color-primary-light: oklch(75% 0.18 260);        /* tint */
--color-primary-dark: oklch(35% 0.24 260);         /* shade */
```

Use `color-mix()` for derived tokens rather than hard-coded hex values:

```css
--color-primary-alpha-20: color-mix(in oklch, var(--color-primary) 20%, transparent);
--surface-color: color-mix(in oklch, var(--background-color) 95%, var(--color-primary));
```

Use `light-dark()` as a shorthand where only two token values differ between themes:

```css
color: light-dark(var(--text-color-light), var(--text-color-dark));
```

#### Cascade Layers (`@layer`)
Declare a layer order at the top of `styles.css` so third-party overrides never win by accident:

```css
@layer reset, tokens, base, layout, blocks, utilities, overrides;
```

- `reset` — minimal box-sizing / margin reset
- `tokens` — all `--*` custom properties
- `base` — element defaults (body, headings, links)
- `layout` — header, footer, section grid
- `blocks` — each block's CSS auto-assigned to this layer via `@import`
- `utilities` — helper classes from `lazy-styles.css`
- `overrides` — author/page-level one-off rules

#### Typed Custom Properties (`@property`)
Use `@property` for any token that needs animation or type coercion:

```css
@property --progress {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@property --hue {
  syntax: '<angle>';
  inherits: true;
  initial-value: 260deg;
}
```

Required for animating gradients, progress indicators, and the theme-toggle colour transition.

#### CSS Nesting
Native nesting is fully supported. Use it in all block CSS files to keep selectors scoped without repetition:

```css
.accordion {
  border: 1px solid var(--border-color);

  & summary {
    cursor: pointer;
    padding: var(--spacing-2);
  }

  &[open] summary {
    font-weight: 700;
  }

  @media (width >= 992px) {
    padding: var(--spacing-3);
  }
}
```

Do **not** nest beyond three levels — keep specificity low and selectors readable.

#### Container Queries (`@container`)
Declare a containment context on the block wrapper so inner elements respond to the block's own width, not the viewport:

```css
.card {
  container-type: inline-size;
  container-name: card;
}

@container card (width >= 480px) {
  .card .card-body { flex-direction: row; }
}
```

Use container queries instead of viewport media queries for all layout decisions inside blocks.

#### `:has()` Pseudo-class
Use `:has()` to apply parent/sibling styles that previously required JavaScript:

```css
/* Highlight a form row that contains an invalid input */
.form-row:has(input:invalid) label { color: var(--color-danger); }

/* Remove bottom margin from last accordion item */
.accordion:not(:has(+ .accordion)) { margin-bottom: 0; }
```

#### CSS Subgrid
Where a block participates in a parent grid, opt-in to subgrid so columns align across rows:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* heading, body, CTA always align */
}
```

#### Viewport Units (`svh` / `dvh` / `lvh`)
Use dynamic viewport units for full-bleed hero sections and modals to avoid the mobile browser chrome problem:

```css
.hero { min-height: 100dvh; }   /* shrinks/grows with browser UI */
.modal { max-height: 90svh; }   /* safe area respecting */
```

Never use `100vh` for interactive full-bleed layouts.

#### Logical Properties
All margin, padding, border, and inset declarations must use logical properties:

```css
/* instead of: margin-left / margin-right */
margin-inline: auto;
padding-block: var(--spacing-3);
border-inline-start: 4px solid var(--color-primary);
inset-inline-start: 0;
```

#### Text Wrapping
Apply to all headings and callout text to eliminate orphaned words:

```css
h1, h2, h3, .callouts { text-wrap: balance; }
p, li       { text-wrap: pretty; }
```

#### Scroll-Driven Animations
Use `animation-timeline: scroll()` and `animation-timeline: view()` for progress indicators and reveal effects — no `IntersectionObserver` needed for purely cosmetic entrance animations:

```css
@keyframes reveal {
  from { opacity: 0; translate: 0 1rem; }
  to   { opacity: 1; translate: 0 0; }
}

.card {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

Reserve `IntersectionObserver` for logic-driven changes (lazy loading, active TOC highlighting).

#### `@starting-style` (Enter Transitions)
Animate elements from their initial state when they are first inserted into the DOM without JavaScript:

```css
.alert {
  transition: opacity 200ms, translate 200ms;
}

@starting-style {
  .alert { opacity: 0; translate: 0 -0.5rem; }
}
```

#### `interpolate-size` for `height: auto` Animation
Enable smooth height transitions for accordions and disclosures:

```css
:root {
  interpolate-size: allow-keywords;
}

details { transition: height 250ms ease; }
details[open] { height: auto; }
```

---

### JavaScript / ES Modern Features

#### Nullish Coalescing and Optional Chaining
Prefer over `||` and manual null checks wherever sentinel `0` or `''` values are valid:

```js
const label = block.querySelector('h2')?.textContent ?? 'Untitled';
const delay = config.delay ?? 300;
```

#### Nullish / Logical Assignment Operators
Use for concise default-setting:

```js
config.speed ??= 200;       // set only if null/undefined
el.dataset.theme ||= 'auto'; // set only if falsy
```

#### `structuredClone()`
Deep-clone plain objects and arrays without `JSON.parse(JSON.stringify())`:

```js
const defaults = structuredClone(CONFIG_DEFAULTS);
```

#### `Object.hasOwn()`
Prefer over `Object.prototype.hasOwnProperty.call()`:

```js
if (Object.hasOwn(options, 'variant')) { /* … */ }
```

#### `Object.groupBy()` / `Map.groupBy()`
Group arrays without `reduce`:

```js
const byVariant = Object.groupBy(buttons, (b) => b.dataset.variant);
```

#### `Array.at()` and `Array.toSorted()` / `Array.toReversed()`
Non-mutating alternatives to `sort()` and `reverse()`; safe on block-scoped data arrays:

```js
const last = items.at(-1);
const sorted = items.toSorted((a, b) => a.label.localeCompare(b.label));
```

#### `Promise.withResolvers()`
Exposes `{ promise, resolve, reject }` — cleaner than wrapping `new Promise`:

```js
const { promise, resolve } = Promise.withResolvers();
img.addEventListener('load', resolve, { once: true });
await promise;
```

#### `Promise.allSettled()`
Use when fetching multiple independent fragments where partial failure is acceptable:

```js
const results = await Promise.allSettled(urls.map(fetch));
const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
```

#### Private Class Fields and Static Blocks
Encapsulate block state in class instances where statefulness justifies a class:

```js
class ThemeManager {
  #current = null;

  static #instance;

  static {
    ThemeManager.#instance = new ThemeManager();
  }

  static getInstance() { return ThemeManager.#instance; }
}
```

Prefer plain module-scoped closures for simple blocks; use classes only when multiple instances share coordinated state.

#### `Set` Methods (`union`, `intersection`, `difference`, `isSubsetOf`)
Useful for managing sets of active panels, selected items, or open modals:

```js
const active = new Set(['tab-1', 'tab-3']);
const all = new Set(['tab-1', 'tab-2', 'tab-3']);
const inactive = all.difference(active);
```

#### `AbortController` / `AbortSignal.timeout()`
Cancel fetch requests and event listeners together; required pattern for blocks that load remote content:

```js
const controller = new AbortController();
const { signal } = controller;

const res = await fetch(url, { signal });
el.addEventListener('click', handler, { signal });

// Later: controller.abort() removes the listener and cancels the fetch atomically.
```

Use `AbortSignal.timeout(5000)` for simple one-off fetches:

```js
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

#### `WeakRef` and `FinalizationRegistry`
Use `WeakRef` to hold references to DOM nodes in caches or cross-block communication channels without preventing garbage collection:

```js
const cache = new Map(); // key → WeakRef<Element>
cache.set(id, new WeakRef(el));
const el = cache.get(id)?.deref(); // undefined if GC'd
```

#### `import.meta.url` for Relative Asset Paths
Load block-local assets (SVGs, workers) relative to the module file, not the page:

```js
const iconUrl = new URL('../icons/chevron.svg', import.meta.url).href;
```

#### `using` / `await using` (Explicit Resource Management)
Automatically dispose of resources (timers, observers, event listeners) when a block is torn down. Supported in Chrome 124+, Firefox 127+, Safari 18.2+:

```js
function makeObserver(el, cb) {
  const io = new IntersectionObserver(cb);
  io.observe(el);
  return { [Symbol.dispose]: () => io.disconnect() };
}

// In decorate():
using obs = makeObserver(block, onIntersect);
// obs.disconnect() is called automatically when decorate()'s scope exits
```

---

### Browser Compatibility Notes

| Feature | Chrome | Firefox | Safari | Notes |
|---|---|---|---|---|
| `rem()` / `mod()` / `round()` | 125 | 118 | 15.4 | All current stable |
| `oklch()` / `color-mix()` | 111 | 113 | 15.4 | Baseline 2023 |
| `light-dark()` | 123 | 120 | 17.5 | Baseline 2024 |
| `@layer` | 99 | 97 | 15.4 | Baseline 2022 |
| `@property` | 85 | 128 | 16.4 | Baseline 2024 |
| CSS Nesting | 120 | 117 | 17.2 | Baseline 2024 |
| Container queries | 105 | 110 | 16 | Baseline 2023 |
| `:has()` | 105 | 121 | 15.4 | Baseline 2023 |
| Subgrid | 117 | 71 | 16 | Baseline 2023 |
| `svh` / `dvh` / `lvh` | 108 | 101 | 15.4 | Baseline 2023 |
| Logical properties | 89 | 66 | 15 | Baseline 2023 |
| `text-wrap: balance` | 114 | 121 | 17.4 | Baseline 2024 |
| `text-wrap: pretty` | 117 | 128 | 18 | Baseline 2024 |
| Scroll-driven animations | 115 | 110 | 18 | Baseline 2024 |
| `@starting-style` | 117 | 129 | 17.5 | Baseline 2024 |
| `interpolate-size` | 129 | 131 | 18.2 | Baseline 2025 |
| Optional chaining / `??` | 80 | 74 | 13.1 | Baseline 2020 |
| `structuredClone()` | 98 | 94 | 15.4 | Baseline 2022 |
| `Object.hasOwn()` | 93 | 92 | 15.4 | Baseline 2022 |
| `Object.groupBy()` | 117 | 119 | 17.4 | Baseline 2024 |
| `Array.at()` / `toSorted()` | 110 | 115 | 16 | Baseline 2023 |
| `Promise.withResolvers()` | 119 | 121 | 17.4 | Baseline 2024 |
| Private class fields | 84 | 90 | 14.1 | Baseline 2021 |
| `Set` methods (union etc.) | 122 | 127 | 17.4 | Baseline 2024 |
| `AbortSignal.timeout()` | 103 | 100 | 15.4 | Baseline 2022 |
| `WeakRef` | 84 | 79 | 14.1 | Baseline 2021 |
| `using` / `await using` | 124 | 127 | 18.2 | Baseline 2025 |
| `import.meta.url` | 64 | 62 | 11.1 | Baseline 2018 |

All features target **Baseline 2025** or earlier. Nothing in this list requires a polyfill on current Chrome, Firefox, or Safari stable. Do **not** add transpilation (Babel, esbuild target) — EDS ships source directly.

---

## Fragment Loading Strategy

### Problem

Every call to `loadFragment(path)` today issues a fresh `fetch`, runs the full `decorateMain` + `loadSections` pipeline, and resolves independently. With header, footer, and any inline `/fragments/*` links all loading concurrently during the lazy phase, the client accumulates:

- **Duplicate network requests** — the same path can be fetched more than once if referenced in multiple places on the same page.
- **Uncoordinated promises** — `scripts.js` auto-blocking uses `forEach(async …)`, which fires promises in parallel but does not await them together; errors are silently swallowed and no back-pressure is applied.
- **Serial header + footer waterfalls** — `header.js` and `footer.js` each independently `await loadFragment()`. They are called during `loadLazy` but nothing pre-warms their fetches while earlier work is still running.
- **Unbounded growth** — every new block that loads a fragment (carousel slides, tabs panels, offcanvas content, etc.) multiplies the problem linearly.

### Planned Improvements

#### 1. Module-level deduplication cache (`fragment.js`)

Add a `Map<string, Promise<HTMLElement>>` at module scope. Before issuing a `fetch`, check whether an in-flight or completed promise already exists for that path. If so, return the cached promise directly. This collapses duplicate requests to a single network round-trip regardless of how many blocks or auto-block invocations request the same URL.

```js
/** @type {Map<string, Promise<HTMLElement|null>>} */
const fragmentCache = new Map();

export async function loadFragment(path) {
  if (!path?.startsWith('/') || path.startsWith('//')) return null;
  if (!fragmentCache.has(path)) {
    fragmentCache.set(path, (async () => {
      const resp = await fetch(`${path}.plain.html`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      resetMediaBase(main, path);
      decorateMain(main);
      await loadSections(main);
      return main;
    })());
  }
  return fragmentCache.get(path);
}
```

> **Note:** The cache stores the `Promise`, not the resolved element. Any second caller that arrives while the first fetch is still in-flight awaits the same promise — zero duplicate requests even under parallel load.

#### 2. Pre-warm fetches during eager/lazy phase handoff (`scripts.js`)

`loadLazy` knows it will shortly load the header and footer fragments. Kick off their `fetch` calls (via `loadFragment`) *before* the `loadHeader` / `loadFooter` blocks are decorated, so the network requests are already in-flight (or complete) when the blocks call `loadFragment` again. The cache means the second call costs nothing.

```js
async function loadLazy(doc) {
  // Pre-warm known fragments so fetches are in-flight during block decoration
  const navMeta = getMetadata('nav');
  const footerMeta = getMetadata('footer');
  loadFragment(navMeta ? new URL(navMeta, window.location).pathname : '/nav');
  loadFragment(footerMeta ? new URL(footerMeta, window.location).pathname : '/footer');

  // … rest of existing loadLazy logic …
}
```

No `await` here — fire and forget into the cache. The blocks pick up the resolved value when they need it.

#### 3. Replace `forEach(async)` with `Promise.allSettled` in auto-blocking (`scripts.js`)

The current auto-block loop silently swallows errors and provides no back-pressure. Replace with `Promise.allSettled` so all fragment fetches are issued in parallel, errors are surfaced, and the block waits for all of them before continuing.

```js
const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')]
  .filter((f) => !f.closest('.fragment'));

if (fragments.length > 0) {
  const { loadFragment } = await import('../blocks/fragment/fragment.js');
  await Promise.allSettled(
    fragments.map(async (link) => {
      const { pathname } = new URL(link.href);
      const frag = await loadFragment(pathname);
      if (frag) link.parentElement.replaceWith(...frag.children);
    }),
  );
}
```

#### 4. `AbortSignal.timeout` on all fragment fetches

Already planned in the Modern Platform Features section. Every `fetch` inside `loadFragment` must pass `{ signal: AbortSignal.timeout(8000) }` so a slow or hanging CMS response cannot stall block decoration indefinitely.

#### 5. Future: per-block fragment pre-loading hint (optional, deferred)

Blocks that are known to load fragments (e.g. `tabs`, `offcanvas`, `carousel`) can call `loadFragment(path)` during their *discovery* step (before the decoration `await`) so the fetch runs while the block's other setup work completes. This is a block-author convention, not a framework change, and is deferred until multiple fragment-heavy blocks exist.

### LCP and Lighthouse Impact

#### Metric breakdown

| Lighthouse metric | How fragment loading harms it today | Target fix |
|---|---|---|
| **LCP** | `buildAutoBlocks` fires fragment `fetch` calls during `loadEager` — inline-fragment requests compete with the LCP hero image for bandwidth on a single HTTP/2 connection. | Move inline-fragment loading entirely to `loadLazy`; add `<link rel="preload">` for nav only. |
| **TBT** | `decorateMain` + `loadSections` inside each `loadFragment` call runs synchronously on the main thread. Multiple concurrent fragment decorations stack up and block long tasks. | Yield between fragment decoration tasks with `scheduler.yield()` (or `setTimeout(0)` fallback); batch inline-fragment work outside the LCP section. |
| **CLS** | Header and footer fragments are inserted into the DOM after initial paint with no reserved space. The sudden height change of nav and footer shifts all page content. | Reserve header/footer height via CSS `min-height` on the `<header>` and `<footer>` shell elements before fragments load. Use `content-visibility: auto` on below-fold fragments. |
| **INP** | Long decoration tasks on the main thread delay response to user interaction (click, keyboard). | Same `scheduler.yield()` fix as TBT; keep individual decoration tasks under 50 ms. |
| **FCP / TTFB** | Not directly affected by fragment strategy, but extra fetches during eager phase add to connection contention on slower networks. | `fetchpriority: 'low'` on footer fetch; no inline-fragment fetches before LCP. |

#### Fix 1 — Isolate fragment loading from the LCP critical path (`scripts.js`)

`buildAutoBlocks` runs inside `decorateMain`, which is called in `loadEager`. Inline `/fragments/*` auto-blocks must not start fetching during this phase. Collect the URLs during `buildAutoBlocks` but defer the actual `loadFragment` calls to `loadLazy`:

```js
// buildAutoBlocks — discover only, no fetch
function buildAutoBlocks(main) {
  try {
    // Mark inline fragment links for deferred loading; do NOT fetch here
    main.querySelectorAll('a[href*="/fragments/"]')
      .forEach((link) => {
        if (!link.closest('.fragment')) link.dataset.deferFragment = link.href;
      });
    buildHeroBlock(main);
  } catch (e) { /* … */ }
}

// loadLazy — load inline fragments after LCP is complete
async function loadLazy(doc) {
  const main = doc.querySelector('main');

  // Pre-warm nav + footer fetches before block decoration starts
  const navPath = /* getMetadata('nav') logic */ '/nav';
  const footerPath = /* getMetadata('footer') logic */ '/footer';
  loadFragment(navPath);   // fires into cache, no await
  loadFragment(footerPath); // fires into cache, no await

  loadHeader(doc.querySelector('header'));
  await loadSections(main);

  // Now load inline fragments — LCP is already done
  const inlineFragments = [...main.querySelectorAll('[data-defer-fragment]')];
  if (inlineFragments.length > 0) {
    const { loadFragment: lf } = await import('../blocks/fragment/fragment.js');
    await Promise.allSettled(inlineFragments.map(async (link) => {
      const { pathname } = new URL(link.dataset.deferFragment);
      const frag = await lf(pathname);
      if (frag) link.parentElement.replaceWith(...frag.children);
    }));
  }

  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}
```

#### Fix 2 — Browser-level preload hint for the nav fragment (`scripts.js`)

Inject a `<link rel="preload" as="fetch" crossorigin>` for the nav path during `loadEager`, before any JS fetch is made. The browser's preload scanner picks this up immediately and the request starts while the LCP image is also downloading — no JS roundtrip delay.

```js
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // Inject nav preload hint as early as possible so the browser starts fetching
  // the nav fragment.plain.html while the LCP hero image loads in parallel.
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'fetch';
  preload.href = `${navPath}.plain.html`;
  preload.crossOrigin = 'anonymous';
  document.head.append(preload);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
  // …
}
```

Do **not** add a preload hint for the footer — it is below the fold and preloading it would compete with LCP resources.

#### Fix 3 — `fetchpriority` on fragment requests (`fragment.js`)

Pass `fetchpriority` via fetch options. Expose an optional `priority` parameter on `loadFragment`:

```js
export async function loadFragment(path, { priority = 'auto' } = {}) {
  if (!path?.startsWith('/') || path.startsWith('//')) return null;
  if (!fragmentCache.has(path)) {
    fragmentCache.set(path, (async () => {
      const resp = await fetch(`${path}.plain.html`, {
        priority,
        signal: AbortSignal.timeout(8000),
      });
      // …
    })());
  }
  return fragmentCache.get(path);
}
```

Call sites:
- Nav: `loadFragment(navPath, { priority: 'high' })` — user sees it immediately
- Footer: `loadFragment(footerPath, { priority: 'low' })` — below the fold
- Inline auto-blocks: `loadFragment(path)` — default `'auto'`

#### Fix 4 — Reserve header and footer height to prevent CLS (`styles/config/globals.css`)

Before a fragment loads, the `<header>` and `<footer>` shell elements have zero height. When the fragment inserts content, the entire page shifts down. Reserve space with a `min-height` that matches the expected rendered height. Use a CSS custom property so the value is easy to tune per project:

```css
:root {
  --header-min-height: 64px;   /* tune to match designed nav height */
  --footer-min-height: 160px;  /* tune to match designed footer height */
}

header { min-height: var(--header-min-height); }
footer { min-height: var(--footer-min-height); }
```

Pair with `content-visibility: auto` on the footer to skip rendering cost until it enters the viewport:

```css
footer { content-visibility: auto; contain-intrinsic-size: 0 var(--footer-min-height); }
```

#### Fix 5 — Yield between fragment decoration tasks to reduce TBT (`fragment.js`)

Each `loadSections` call inside `loadFragment` is a long synchronous task. For pages with multiple inline fragments, chain them through a microtask yield so the browser can process input events between tasks:

```js
// After decorateMain(main) and before loadSections(main) inside loadFragment:
await new Promise((r) => { setTimeout(r, 0); }); // yield to browser
await loadSections(main);
```

Use `scheduler.yield()` when available (Chrome 129+) with a `setTimeout` fallback:

```js
const yieldToMain = () => ('scheduler' in globalThis && 'yield' in scheduler)
  ? scheduler.yield()
  : new Promise((r) => { setTimeout(r, 0); });
```

### Implementation Order

1. **Fix 1 — Defer inline fragments out of eager phase** (`scripts.js`) — directly protects LCP; highest priority.
2. **Fix 4 — Reserve header/footer height** (`globals.css`) — eliminates CLS; CSS-only, zero risk.
3. **Cache + `AbortSignal.timeout`** (`fragment.js`) — deduplication and resilience; self-contained.
4. **Fix 2 — Nav preload hint** (`scripts.js`) — browser-level optimisation; add alongside Fix 1.
5. **Fix 3 — `fetchpriority`** (`fragment.js`) — fine-tuning; add when touching `fragment.js`.
6. **Fix 5 — `scheduler.yield()`** (`fragment.js`) — TBT reduction; add last, measure before/after with Lighthouse.
7. **`Promise.allSettled` fix** (`scripts.js`) — correctness; bundle with Fix 1.
8. **Per-block hints** — deferred; revisit after `tabs` and `offcanvas` are built.

### Measuring Progress

Run Lighthouse against the feature preview URL after each implementation step:

```
https://{branch}--{repo}--{owner}.aem.page/
```

Target scores: **LCP ≤ 2.5 s**, **TBT ≤ 50 ms**, **CLS ≤ 0.05**, overall **Performance 100**.  
Use the `performance.mark()` / `performance.measure()` API to bracket `loadFragment` calls during local development to identify which fragment contributes most to TBT.

---

## Open Items

- [ ] Confirm font stack (user to provide).
- [ ] Confirm colour palette (user to provide).
- [ ] Decide navigation structure: flat top-nav vs. sidebar-nav on doc pages.
- [ ] Decide whether forms page is a static demo or integrates with a form handler (e.g. AEM Forms / Helix Forms).
- [ ] Confirm whether `modal` and `offcanvas` should share a single trigger mechanism or remain independent blocks.
