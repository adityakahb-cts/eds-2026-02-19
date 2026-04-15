# Global Scripts and Styles Guide

Reference for extending `scripts/scripts.js`, `styles/styles.css`, `styles/lazy-styles.css`, `styles/fonts.css`, and `scripts/delayed.js`.

## The Golden Rule: Never Touch aem.js

`scripts/aem.js` is an upstream library managed by Adobe. **Do not modify it.** All project customization goes in `scripts/scripts.js`. When `aem.js` exports a function you need, import it — do not copy or re-implement it.

---

## scripts/scripts.js

This is the main entry point for all page decoration. It imports utilities from `aem.js`, defines project-specific decoration logic, and orchestrates the three-phase load sequence.

### Extension Points

#### `buildAutoBlocks(main)`

Add new auto-blocking patterns here. Auto-blocking converts implicit content patterns into explicit blocks without requiring authors to use the block table syntax.

The existing patterns are:
1. **Fragment links** — any `<a href*="/fragments/">` not already inside a `.fragment` block is loaded as a fragment.
2. **Hero block** — an `<h1>` preceded by a `<picture>` at the top of the page is wrapped into a `hero` block.

To add a new auto-block pattern:

```js
function buildAutoBlocks(main) {
  try {
    // existing patterns ...

    // new pattern: wrap every standalone <video> in a video block
    main.querySelectorAll('p > video:only-child').forEach((video) => {
      const section = video.closest('div');
      section.replaceWith(buildBlock('video', { elems: [video] }));
    });

    buildHeroBlock(main);
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}
```

Always wrap new patterns in the existing try/catch — a broken auto-block must not crash the whole page.

#### `decorateMain(main)`

Called once per page load (and once per fragment load). Runs the full decoration pass in order:

```js
export function decorateMain(main) {
  decorateButtons(main);  // wraps lonely links as .button
  decorateIcons(main);    // converts :icon-name: spans to <img>
  buildAutoBlocks(main);  // builds synthetic blocks
  decorateSections(main); // wraps content in .section divs
  decorateBlocks(main);   // sets block class names and data-attrs
}
```

To add a new global decoration pass, insert a function call here. Functions added before `decorateSections` operate on the raw authored DOM; functions after `decorateBlocks` operate on the fully wrapped structure.

### Three-Phase Load Order

The load sequence is optimized for Core Web Vitals. Placing code in the wrong phase will hurt performance scores.

#### Phase 1 — `loadEager(doc)`

**Goal:** reach Largest Contentful Paint (LCP) as fast as possible.

What runs here:
- `decorateTemplateAndTheme()` — applies template/theme body classes from metadata
- `decorateMain(main)` — full decoration pass
- `loadSection(firstSection, waitForFirstImage)` — loads only the first section (LCP content)
- Font pre-loading on desktop (fast connection proxy)

**Only add code here if it is required to render the above-the-fold content.** Every millisecond in this phase delays LCP.

#### Phase 2 — `loadLazy(doc)`

**Goal:** load everything else without blocking the initial render.

What runs here:
- `loadHeader` and `loadFooter` — nav and footer fragments
- `loadSections(main)` — all remaining sections and their blocks
- Deep-link scroll (`window.location.hash`)
- `lazy-styles.css` — post-LCP global styles
- Font loading (for mobile, which skipped eager fonts)

Add non-critical features, supplementary blocks, and post-LCP CSS here.

#### Phase 3 — `loadDelayed()`

**Goal:** load martech, analytics, and anything that would hurt performance if loaded earlier.

```js
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
}
```

Runs 3 seconds after `loadLazy` completes. Add third-party scripts, A/B testing, chat widgets, and similar to `scripts/delayed.js`.

### `loadFonts()`

Loads `styles/fonts.css` and sets a `fonts-loaded` flag in `sessionStorage` so subsequent page views on the same session can load fonts eagerly without a layout shift:

```js
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) { /* storage unavailable */ }
}
```

Do not load fonts anywhere else. The `localhost` guard prevents sessionStorage from masking flash-of-unstyled-text during development.

---

## styles/styles.css

Loaded in the `<head>` — part of the critical path. Keep it minimal. Only styles required before LCP belong here.

### CSS Custom Properties

All design tokens are defined as custom properties on `:root`. The values change at the 900px desktop breakpoint.

#### Colors

| Property | Value |
|----------|-------|
| `--background-color` | `white` |
| `--light-color` | `#f8f8f8` |
| `--dark-color` | `#505050` |
| `--text-color` | `#131313` |
| `--link-color` | `#3b63fb` |
| `--link-hover-color` | `#1d3ecf` |

#### Typography — Families

| Property | Value |
|----------|-------|
| `--body-font-family` | `roboto, roboto-fallback, sans-serif` |
| `--heading-font-family` | `roboto-condensed, roboto-condensed-fallback, sans-serif` |

#### Typography — Body Sizes

| Property | Mobile | Desktop (≥ 900px) |
|----------|--------|-------------------|
| `--body-font-size-m` | `22px` | `18px` |
| `--body-font-size-s` | `19px` | `16px` |
| `--body-font-size-xs` | `17px` | `14px` |

#### Typography — Heading Sizes

| Property | Mobile | Desktop (≥ 900px) |
|----------|--------|-------------------|
| `--heading-font-size-xxl` | `55px` | `45px` |
| `--heading-font-size-xl` | `44px` | `36px` |
| `--heading-font-size-l` | `34px` | `28px` |
| `--heading-font-size-m` | `27px` | `22px` |
| `--heading-font-size-s` | `24px` | `20px` |
| `--heading-font-size-xs` | `22px` | `18px` |

#### Layout

| Property | Value |
|----------|-------|
| `--nav-height` | `64px` |

### Adding New Custom Properties

Add new tokens to the `:root` block at the top of `styles.css`. If the value changes at the desktop breakpoint, add it to the `@media (width >= 900px)` `:root` override block directly below.

Use the established naming convention: `--{category}-{qualifier}` (e.g. `--spacing-xl`, `--border-radius-m`).

### Section System

The framework wraps each section of authored content in nested divs:

```html
<main>
  <div class="section">          <!-- section wrapper -->
    <div>                        <!-- content wrapper (max-width container) -->
      <!-- authored content, blocks -->
    </div>
  </div>
</main>
```

The content wrapper (`main > .section > div`) has a maximum width of `1200px`, is horizontally centered, and has horizontal padding (24px mobile, 32px desktop). Do not override these rules inside blocks — blocks that need full-bleed layouts should use negative margins or the section wrapper instead.

### Section Metadata Styles

Authors can apply visual variants to sections by adding a section metadata table at the bottom of the section. The framework adds the metadata value as a class on the `.section` element.

Built-in section variants:

| Class | Effect |
|-------|--------|
| `.light` | `background-color: var(--light-color)`, removes vertical margin, adds 40px padding |
| `.highlight` | Same as `.light` — alias for the same treatment |

To add a new section variant, add a rule in `styles.css`:

```css
main .section.dark {
  background-color: var(--dark-color);
  color: var(--background-color);
  margin: 0;
  padding: 40px 0;
}
```

---

## styles/lazy-styles.css

Loaded during `loadLazy` — after the page is visually complete. Safe for:

- Below-the-fold layout styles
- Animation and transition definitions
- Non-critical typographic refinements
- Print styles

Do **not** put anything here that affects above-the-fold content. A style added here that shifts the layout after LCP will hurt Cumulative Layout Shift (CLS).

---

## styles/fonts.css

Loaded by `loadFonts()` — at most once per session after the session flag is set. Defines `@font-face` rules and fallback metrics.

### Adding a New Font

1. Place the font file (woff2 preferred) in the `fonts/` directory.
2. Add an `@font-face` rule in `fonts.css`:

```css
@font-face {
  font-family: my-font;
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('../fonts/my-font-400.woff2') format('woff2');
}
```

3. Add a fallback `@font-face` with `size-adjust` to minimize layout shift during font swap:

```css
@font-face {
  font-family: my-font-fallback;
  size-adjust: 100%; /* tune until layout shift is minimal */
  src: local('Arial');
}
```

4. Register the font family in `styles/styles.css`:

```css
:root {
  --body-font-family: my-font, my-font-fallback, sans-serif;
}
```

The `size-adjust` value should be calibrated so the fallback font occupies the same line widths as the web font, eliminating reflow when the font loads. Tune it by comparing the layout with and without the web font loaded.

---

## scripts/delayed.js

Runs 3 seconds after the page loads. Import and initialize third-party scripts here:

```js
// scripts/delayed.js

// analytics
import('./vendor/analytics.js').then(({ default: init }) => init());

// cookie consent
if (!document.cookie.includes('consent=accepted')) {
  import('./vendor/consent.js');
}
```

Keep this file focused. Do not load anything here that is required for the page to function correctly — it may never run if the user navigates away within 3 seconds.

---

## aem.js API Reference

These are the utilities exported from `scripts/aem.js` available for use in `scripts/scripts.js` and blocks:

| Function | Signature | Description |
|----------|-----------|-------------|
| `buildBlock` | `(blockName, content)` | Creates a block DOM element from string/array/object content |
| `createOptimizedPicture` | `(src, alt, eager, breakpoints)` | Creates a `<picture>` with webp sources |
| `decorateBlock` | `(block)` | Sets block classes and `data-block-name` / `data-block-status` |
| `decorateBlocks` | `(main)` | Runs `decorateBlock` on all blocks in the container |
| `decorateButtons` | `(element)` | Upgrades lone anchor tags in paragraphs to `.button` links |
| `decorateIcons` | `(element, prefix?)` | Replaces `:icon-name:` spans with `<img>` tags from `icons/` |
| `decorateSections` | `(main)` | Wraps authored content in `.section` divs, processes section metadata |
| `decorateTemplateAndTheme` | `()` | Applies template/theme metadata values as body classes |
| `getMetadata` | `(name, doc?)` | Returns the content of a `<meta name="...">` or `<meta property="...">` tag |
| `loadBlock` | `(block)` | Loads and executes a block's JS and CSS |
| `loadCSS` | `(href)` | Dynamically appends a `<link rel="stylesheet">` |
| `loadFooter` | `(footer)` | Builds and loads the footer block |
| `loadHeader` | `(header)` | Builds and loads the header block |
| `loadScript` | `(src, attrs?)` | Dynamically appends a `<script>` tag |
| `loadSection` | `(section, callback?)` | Loads all blocks in a section; resolves after `callback` |
| `loadSections` | `(element)` | Loads all sections in a container |
| `readBlockConfig` | `(block)` | Extracts key/value pairs from a config-style block table |
| `sampleRUM` | `(checkpoint, data?)` | Records a RUM (Real User Monitoring) checkpoint |
| `toCamelCase` | `(name)` | Converts `hyphen-case` or `snake_case` to `camelCase` |
| `toClassName` | `(name)` | Sanitizes a string for use as a CSS class name |
| `waitForFirstImage` | `(section)` | Resolves when the first image in a section has loaded |
| `wrapTextNodes` | `(block)` | Wraps bare inline text nodes in `<p>` tags |
