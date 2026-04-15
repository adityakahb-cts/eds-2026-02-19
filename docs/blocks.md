# Block Coding Standards

Standards and patterns for building blocks in this AEM Edge Delivery Services project.

## Directory Structure

Every block lives in its own directory under `blocks/`. Each directory must contain five files named after the block:

```
blocks/
└── my-block/
    ├── block.md         # content model documentation (required)
    ├── my-block.js      # decoration logic
    ├── my-block.css     # scoped styles
    ├── markup.js        # block HTML template with interpolation
    └── my-block.test.js # Jest unit tests  (or my-block.spec.js for Playwright)
```

Block names must be lowercase and hyphenated (e.g. `card-list`, not `cardList` or `card_list`).

## block.md — Content Model Documentation

Every block directory must contain a `block.md` file that documents the block's content model and all supported variations. This file is the contract between content authors and developers — it defines what authors put into the block and what the code expects to receive.

### Format

Document the content model as a da.live-style block table: a markdown table whose first row contains only the block name and whose subsequent rows describe each authored row and its cells. Mark each field as required or optional.

```markdown
| Block Name              |                       |
|-------------------------|-----------------------|
| Field A *(required)*    | Field B *(required)*  |
| description of cell A   | description of cell B |
| Field C *(optional)*    |                       |
| description of cell C   |                       |
```

Rules:
- The first row contains only the block name, matching the CSS class name exactly (e.g. `My Block` for `.my-block`).
- Each subsequent row pair maps to one authored row: the first line is the field label with a required/optional marker, the second line is a short description of the expected content.
- Each column in a row maps to one authored cell.
- Use `*(required)*` for fields that the block cannot render without, and `*(optional)*` for fields that may be omitted.
- A cell with no content in an optional row may be left blank in the table.

### Variations

Document each variation as a separate table. The block name row uses the variation syntax — `Block Name (variation-name)` — matching exactly how it is authored in the CMS:

```markdown
| Block Name (variation-name) |                       |
|-----------------------------|-----------------------|
| Field A *(required)*        | Field B *(optional)*  |
| description of cell A       | description of cell B |
```

List every supported variation. If a variation changes which fields are required or optional, or adds new fields, show those differences in the table.

### Example — cards

```markdown
# Cards

Displays a list of image-and-body card pairs.

## Default

| Cards                   |                                           |
|-------------------------|-------------------------------------------|
| Image *(required)*      | Body *(required)*                         |
| `<picture>` element     | Heading, description paragraph, CTA link  |

## Variations

### Featured

| Cards (featured)        |                                           |
|-------------------------|-------------------------------------------|
| Image *(required)*      | Body *(required)*                         |
| `<picture>` element     | Heading, description paragraph, CTA link  |

Featured cards render with a larger image and a bold heading style.
```

---

## markup.js — Block HTML Template

Every block must have a `markup.js` file that exports a single named const containing the full rendered HTML of the block as a template string. This const is the single source of truth for the block's final DOM structure.

### Why

Separating the HTML template from the decoration logic makes the final markup easy to read, review, and maintain independently of the data-extraction code.

### Structure

```js
// blocks/my-block/markup.js

export const MARKUP = /* html */`
<ul class="my-block-list">
  {items}
</ul>
`;

export const ITEM_MARKUP = /* html */`
<li class="my-block-item">
  <div class="my-block-image">{image}</div>
  <div class="my-block-body">
    <h3>{title}</h3>
    <p>{description}</p>
    <a class="button" href="{link}">{cta}</a>
  </div>
</li>
`;
```

Rules for `markup.js`:
- Export at least one named const (conventionally `MARKUP` for the block root).
- Export additional named consts for repeating child templates (e.g. `ITEM_MARKUP`).
- Always add a default export equal to the primary (root) markup const — `export default MARKUP;`.
- Use `{placeholder}` tokens for every value that comes from authored content.
- The `/* html */` comment before the template string enables syntax highlighting in editors that support it — always include it.
- Do **not** import anything in `markup.js`. It must be a pure data file with no side effects.

### Using the Template in the Block JS

Import the template consts, extract data from the authored block, perform interpolation, and replace the block's content:

```js
import { MARKUP, ITEM_MARKUP } from './markup.js';

export default function decorate(block) {
  // 1. Extract data from authored rows
  const items = [...block.children].map((row) => {
    const [imageCell, bodyCell] = row.children;
    const image = imageCell?.querySelector('picture')?.outerHTML ?? '';
    const title = bodyCell?.querySelector('h3, h2')?.outerHTML ?? '';
    const description = bodyCell?.querySelector('p')?.outerHTML ?? '';
    const link = bodyCell?.querySelector('a');
    return { image, title, description, link: link?.href ?? '#', cta: link?.textContent ?? '' };
  });

  // 2. Build child HTML via interpolation
  const itemsHtml = items.map(({ image, title, description, link, cta }) =>
    ITEM_MARKUP
      .replace('{image}', image)
      .replace('{title}', title)
      .replace('{description}', description)
      .replace('{link}', link)
      .replace('{cta}', cta),
  ).join('');

  // 3. Interpolate into root template and replace block content
  block.innerHTML = MARKUP.replace('{items}', itemsHtml);
}
```

### Interpolation Rules

- Use `.replace('{token}', value)` for single-occurrence tokens.
- Use `.replaceAll('{token}', value)` if the same token appears more than once in a template.
- When inserting raw HTML from authored content (images, rich text), use `element.outerHTML`.
- When inserting plain text (titles, labels), use `element.textContent` and encode it with `encodeHtml` if embedding in an attribute value.
- Preserve the authored element's HTML (headings, links, formatted text) — do not reduce it to a string unless the template calls for plain text only.
- Tokens that have no value should resolve to an empty string `''`, not `'undefined'` or `'null'`.

### Setting innerHTML vs replaceChildren

Every `innerHTML` assignment in a block JS file must be safe. There are exactly two safe forms:

**1. Controlled template strings** — the HTML comes entirely from a hardcoded template (e.g. `markup.js`). Authored content fragments (images, headings) are inserted via `.outerHTML` of already-parsed DOM nodes, not raw user strings.

```js
// safe — value is outerHTML of a parsed DOM node, not a raw string
block.innerHTML = MARKUP.replace('{image}', picture.outerHTML);
```

**2. Hardcoded literals** — the string contains no variable interpolation at all.

```js
// safe — no variables, no external data
el.innerHTML = `<button type="button"><span class="icon"></span></button>`;
```

Do **not** use `innerHTML` to insert unsanitized external data (API responses, URL parameters, user-typed values). When inserting plain text into an attribute value inside a template, encode it first with `encodeHtml` from `scripts/scripts.js`:

```js
import { encodeHtml } from '../../scripts/scripts.js';

// safe — plain text encoded before embedding in an attribute
el.innerHTML = `<input aria-label="${encodeHtml(labelText)}">`;
```

Any other use of `innerHTML` — including string concatenation with unvalidated values — is not permitted.

---

## The `decorate` Function

Every block JS file must export a single default `decorate(block)` function. This is the only required export. The function may be synchronous or async.

```js
/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Load dependencies
  // 2. Extract configuration
  // 3. Transform DOM
  // 4. Add event listeners
}
```

Follow this four-step order inside every `decorate` function. Steps that don't apply can be omitted, but never reorder them — event listeners must not be attached before the DOM exists.

## Following block.md When Modifying a Block

Before changing any block's `.js` or `.css` file, **read that block's `block.md` first**. The `block.md` is the authoritative contract for what the block receives from the CMS. Modifying code without reading it risks breaking pages that are already authored against the documented structure.

Rules:
- Read `blocks/{name}/block.md` before touching `{name}.js` or `{name}.css`.
- Do not change the expected authored structure (rows, cells, field order) without also updating `block.md` and the test file to match.
- If a field is added, removed, or made required/optional, update `block.md` first, then update the JS and tests together.
- CSS changes that rename or remove class names used in authored content or other blocks must also be reflected in `block.md` if those classes are part of the documented output.

## Inspecting Authored Markup

Before writing decoration logic, always inspect what the AEM backend delivers. Run the dev server (`npx -y @adobe/aem-cli up`) and fetch the plain HTML for any page containing the block:

```sh
curl http://localhost:3000/path/to/page.plain.html
```

The initial HTML is what your `decorate` function receives. The block element (`block`) is the inner `div.blockname` — not the wrapper or container created by the section system.

## How Authored Content Arrives

The CMS generates a table-like structure for each block. By the time `decorate` runs, it looks like:

```html
<div class="my-block">
  <div>          <!-- row -->
    <div>...</div>  <!-- cell -->
    <div>...</div>  <!-- cell -->
  </div>
  <div>          <!-- row -->
    <div>...</div>
  </div>
</div>
```

Access rows and cells via:

```js
const rows = [...block.children];          // all rows
const [firstCell, secondCell] = row.children; // cells in a row
```

Authors may omit optional fields, so always guard against missing cells:

```js
const imageCell = row.children[0];
const textCell = row.children[1];
if (!textCell) return; // handle gracefully
```

## DOM Transformation

The preferred transformation approach is template-based using `markup.js`: extract data from the authored rows, interpolate into the template string, and assign to `block.innerHTML` in a single operation. See the [markup.js section](#markupjs--block-html-template) above.

For blocks with very simple structure where a template would be overkill, DOM APIs (`document.createElement`, `append`, `replaceChildren`) are acceptable. When using DOM APIs, replace the entire content in a single operation rather than making incremental mutations:

```js
const ul = document.createElement('ul');
[...block.children].forEach((row) => {
  const li = document.createElement('li');
  while (row.firstElementChild) li.append(row.firstElementChild);
  ul.append(li);
});
block.replaceChildren(ul);
```

Use semantic HTML elements (`ul`/`li`, `article`, `figure`, `nav`, etc.) wherever appropriate.

## CSS Scoping

All CSS selectors must be scoped to the block's root class. Never write bare element selectors or utility classes that could leak outside the block.

```css
/* bad — leaks to the whole page */
.card-image { ... }
img { ... }

/* good — scoped to the block */
.my-block .card-image { ... }
.my-block img { ... }
```

Do **not** use the classes `{blockname}-container` or `{blockname}-wrapper` in your CSS — those are applied to the section and block wrapper elements by the framework and styling them will produce conflicts.

## Responsive Design

Write styles mobile-first. Use `min-width` media queries at the project's standard breakpoints:

| Breakpoint | Width     | Target   |
|------------|-----------|----------|
| default    | < 600px   | mobile   |
| tablet     | ≥ 600px   | tablet   |
| desktop    | ≥ 900px   | desktop  |
| wide       | ≥ 1200px  | wide     |

```css
/* mobile (default) */
.my-block .items {
  display: flex;
  flex-direction: column;
}

/* desktop */
@media (width >= 900px) {
  .my-block .items {
    flex-direction: row;
    gap: 24px;
  }
}
```

## Reusing aem.js Utilities

Import utilities from `../../scripts/aem.js`. Never copy-paste their implementations. Commonly needed utilities:

| Utility | Purpose |
|---------|---------|
| `createOptimizedPicture(src, alt, eager, breakpoints)` | Creates a `<picture>` with webp sources and fallbacks |
| `readBlockConfig(block)` | Extracts key-value pairs from a config-style block |
| `getMetadata(name)` | Reads a `<meta>` tag value from the page |
| `loadCSS(href)` | Dynamically loads a CSS file |
| `loadScript(src, attrs)` | Dynamically loads a JS file |
| `toClassName(name)` | Sanitizes a string for use as a CSS class |
| `toCamelCase(name)` | Converts a string to camelCase |
| `wrapTextNodes(block)` | Wraps bare text nodes in `<p>` tags |

## Image Optimization

Replace every authored `<img>` with an optimized picture element. Call `createOptimizedPicture` on any image that comes from authored content:

```js
import { createOptimizedPicture } from '../../scripts/aem.js';

block.querySelectorAll('picture > img').forEach((img) => {
  img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
  );
});
```

For above-the-fold images (LCP candidates), pass `true` as the third argument to disable lazy loading.

## Configuration Blocks

Use `readBlockConfig` when a block accepts author-controlled key-value settings:

```js
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  // config is a plain object: { limit: '6', 'show-tags': 'true', ... }
  block.textContent = '';
  // render using config values
}
```

`readBlockConfig` reads the first column of each row as a key and the second as a value, then empties itself. Always clear the block after reading config before rendering.

## Accessibility

- Use semantic HTML so assistive technologies can navigate the block without custom ARIA.
- Add `aria-label` to icon-only buttons and controls.
- Manage `aria-expanded` for any toggle or accordion pattern.
- Ensure keyboard navigation works for all interactive elements (`tabindex`, `keydown` handlers for `Enter`/`Space`/`Escape`).
- Do not remove focus outlines without providing an equivalent visual indicator.
- Maintain a logical heading hierarchy — blocks should not introduce an `h1` or skip levels.

## Graceful Degradation

Blocks must not crash if an author omits optional content. Guard every assumption about structure:

```js
const image = block.querySelector('picture');
if (image) {
  // only process if present
}

const rows = [...block.children];
const [headerRow, ...bodyRows] = rows;
// bodyRows may be empty — that is fine
```

Wrap the entire decoration in a try/catch if the block has complex logic, and log errors with `console.error` so they appear in the browser console without breaking the page.

## Code Style

- JavaScript: ES6+ (arrow functions, destructuring, template literals, optional chaining).
- Follow the Airbnb ESLint ruleset (configured in `eslint.config.mjs`).
- Always include `.js` extensions in import paths.
- Use Unix line endings (LF).
- CSS: follow the Stylelint standard configuration.
- Run `npm run lint` before committing. Run `npm run lint:fix` to auto-fix common issues.

## Self-Containment

Each block owns its own CSS and JS. Blocks must not:

- Import from other blocks (except `fragment/fragment.js` for loading fragments).
- Rely on global state or global CSS classes defined outside `styles/styles.css`.
- Modify the DOM outside their own block element.

Dependencies shared across multiple blocks belong in `scripts/scripts.js` or `scripts/aem.js`, not inside a block.

## Testing

Every block must ship with a test file co-located in its directory. Choose **Jest** for unit-testing decoration logic in isolation, or **Playwright** for integration tests that run against the live dev server. Both are acceptable; use the one that fits the block's complexity.

| Framework | File name | Best for |
|-----------|-----------|----------|
| Jest | `my-block.test.js` | DOM transformation logic, markup interpolation, pure functions |
| Playwright | `my-block.spec.js` | Full render in a real browser, visual output, user interactions |

### Setup — Jest

Install Jest with the jsdom environment and Babel for ES module support:

```sh
npm install --save-dev jest jest-environment-jsdom @babel/core @babel/preset-env babel-jest
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "moduleNameMapper": {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    }
  }
}
```

Add `babel.config.json`:

```json
{
  "presets": [["@babel/preset-env", { "targets": { "node": "current" } }]]
}
```

### Writing a Jest Test

Mock `aem.js` utilities and any browser globals the block relies on, then call `decorate(block)` directly:

```js
// blocks/my-block/my-block.test.js
import decorate from './my-block.js';

// mock aem.js so tests don't need the full library
jest.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: (src, alt) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    return img;
  },
}));

function buildBlock(rows) {
  const block = document.createElement('div');
  rows.forEach((cells) => {
    const row = document.createElement('div');
    cells.forEach((html) => {
      const cell = document.createElement('div');
      cell.innerHTML = html;
      row.append(cell);
    });
    block.append(row);
  });
  return block;
}

describe('my-block', () => {
  test('renders one item per authored row', () => {
    const block = buildBlock([
      ['<picture><img src="a.jpg" alt="A"></picture>', '<h3>Title A</h3><p>Body</p>'],
      ['<picture><img src="b.jpg" alt="B"></picture>', '<h3>Title B</h3><p>Body</p>'],
    ]);

    decorate(block);

    expect(block.querySelectorAll('.my-block-item')).toHaveLength(2);
  });

  test('renders no items when block is empty', () => {
    const block = buildBlock([]);
    decorate(block);
    expect(block.querySelectorAll('.my-block-item')).toHaveLength(0);
  });

  test('handles missing optional cell gracefully', () => {
    const block = buildBlock([['<picture><img src="a.jpg" alt="A"></picture>']]);
    expect(() => decorate(block)).not.toThrow();
  });
});
```

### Setup — Playwright

Install Playwright:

```sh
npm install --save-dev @playwright/test
npx playwright install
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:watch": "playwright test --ui"
  }
}
```

Add `playwright.config.js` at the project root:

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'blocks/**/*.spec.js',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npx -y @adobe/aem-cli up --no-open --forward-browser-logs',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

### Writing a Playwright Test

Playwright tests navigate to a real page (or a draft HTML file) and assert on the rendered output:

```js
// blocks/my-block/my-block.spec.js
import { test, expect } from '@playwright/test';

test.describe('my-block', () => {
  test('renders all items', async ({ page }) => {
    // point at a draft page or a real preview page that contains the block
    await page.goto('/drafts/my-block-test.html');

    const items = page.locator('.my-block-item');
    await expect(items).toHaveCount(2);
  });

  test('image is present in each item', async ({ page }) => {
    await page.goto('/drafts/my-block-test.html');
    const images = page.locator('.my-block-item .my-block-image img');
    await expect(images.first()).toBeVisible();
  });
});
```

For Playwright tests, create a corresponding draft HTML file in `drafts/` that contains the block in its authored form.

### What to Test

Regardless of framework, every block test must cover:

1. **Happy path** — standard authored content renders the expected DOM structure.
2. **Empty block** — block with no rows does not throw and renders valid (possibly empty) HTML.
3. **Missing optional fields** — omitting optional cells or elements does not throw.
4. **Repeating items** — multiple rows each produce the correct number of child elements.

### Keeping Tests in Sync

**Every time block code changes, the test file must be updated.** This is a hard requirement:

- If the DOM structure produced by `decorate` changes, update the selectors and assertions in the test.
- If a new authored field is added or removed, add or remove the corresponding test case.
- If `markup.js` tokens change, update any tests that assert on rendered HTML.
- If a new edge case or bug fix is introduced, add a regression test for it.

A test file that no longer reflects the current block behaviour is treated as broken and must be fixed before committing.

---

## Examples

### cards — markup.js template pattern

**`blocks/cards/markup.js`**

```js
export const CARDS_MARKUP = /* html */`
<ul class="cards-list">
  {items}
</ul>
`;

export const CARD_ITEM_MARKUP = /* html */`
<li class="cards-item">
  <div class="cards-card-image">{image}</div>
  <div class="cards-card-body">{body}</div>
</li>
`;
```

**`blocks/cards/cards.js`**

```js
import { createOptimizedPicture } from '../../scripts/aem.js';
import { CARDS_MARKUP, CARD_ITEM_MARKUP } from './markup.js';

export default function decorate(block) {
  // 1. Extract data from authored rows
  const items = [...block.children].map((row) => {
    const [imageCell, bodyCell] = row.children;
    const img = imageCell?.querySelector('picture > img');
    const picture = img
      ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
      : null;
    return {
      image: picture?.outerHTML ?? '',
      body: bodyCell?.innerHTML ?? '',
    };
  });

  // 2. Build item HTML via interpolation
  const itemsHtml = items.map(({ image, body }) =>
    CARD_ITEM_MARKUP
      .replace('{image}', image)
      .replace('{body}', body),
  ).join('');

  // 3. Replace block content
  block.innerHTML = CARDS_MARKUP.replace('{items}', itemsHtml);
}
```

### columns — lightweight class-based variant

`blocks/columns/columns.js` only adds modifier classes and does not restructure the DOM, so it is an acceptable case for skipping a full template. A `markup.js` with a simple passthrough template is still required:

**`blocks/columns/markup.js`**

```js
// Columns retains the authored structure; markup.js documents the expected final shape.
export const COLUMNS_MARKUP = /* html */`
<div class="columns-row">
  {columns}
</div>
`;
```

The JS adds `columns-{n}-cols` and `columns-img-col` classes directly on the existing divs.

### fragment — async loading with `loadFragment`

`blocks/fragment/fragment.js` fetches another page's `.plain.html`, decorates it, and injects it into the block. See `fragment.js` directly — this pattern is available as a utility (`loadFragment`) for use in header and footer blocks.

### hero — CSS-only block

`blocks/hero/` has an empty `hero.js` and relies entirely on CSS. The hero block is auto-built by `buildHeroBlock` in `scripts/scripts.js` — it is never authored explicitly. Its `markup.js` documents the expected structure even though the JS does not use it for interpolation:

```js
// blocks/hero/markup.js
export const HERO_MARKUP = /* html */`
<div class="hero-content">
  {picture}
  {heading}
</div>
`;
```
