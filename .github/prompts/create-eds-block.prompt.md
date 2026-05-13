---
description: "Create a new EDS block with basic folder structure and skeleton code. Generates all 6 required files (block.md, markup.js, {name}.js, {name}.css, {name}.spec.js) and a draft test page following AEM Edge Delivery Services coding standards."
name: "Create EDS Block"
argument-hint: "Block name (e.g. 'promo-banner')"
agent: "agent"
tools: ["create_file", "create_directory", "read_file", "file_search", "grep_search", "run_in_terminal", "get_errors", "vscode_askQuestions"]
---

You are creating a new AEM Edge Delivery Services (EDS) block. This prompt generates a complete folder structure with skeleton code following Adobe's standards.

## Step 1: Extract Block Name

Extract the block name from the slash-command argument. The name must be lowercase, hyphenated (e.g., `promo-banner`). No camelCase, no underscores.

If no name was provided, ask the user for it once, then proceed with defaults.

**Defaults (user can customize later):**
- **Content model**: Single row with two cells — heading (required) and body text (optional)
- **Variations**: None
- **Fragment-loading**: No

---

## Step 2: Generate Folder Structure and Files

Create the following directory and files. Use the specifications below for each file's content.

### Directory: `blocks/{blockname}/`

Create this directory and populate with the following files:

#### `block.md`

Document the content model as a da.live-style block table using default values.

**Default template structure:**
```markdown
# {Display Name}

{Brief one-line description of what this block does}

## Default

| {Display Name} |                            |
|---|---|
| Heading *(required)* | Body Text *(optional)* |
| Main heading text | Supporting body copy or description |
```

**Rules:**
- First row header = block name in title case (e.g., "Promo Banner" for `.promo-banner`)
- Each column = one authored cell
- Each authored row gets one pair of table rows (header + description)
- Mark each field `*(required)*` or `*(optional)*`
- If user provides variations later, add separate tables with `{Display Name} (variation-name)` syntax

Customize the table structure as needed based on the block's purpose, but start with the default above.

#### `markup.js`

Pure data file — NO imports, NO side effects. Default template for heading and body text blocks.

```js
/**
 * Block markup template
 */
export const MARKUP = /* html */`
<div class="{blockname}">
  <h2>{heading}</h2>
  <p>{bodyText}</p>
</div>
`;

export default MARKUP;
```

**Rules:**
- Export `MARKUP` const (block root template) with `export default MARKUP` at the bottom
- All dynamic values use `{placeholder}` tokens (must match config property names)
- Always add `/* html */` comment before template strings for syntax highlighting
- Tokens with no value must resolve to `''` (never `undefined`/`null`)
- For blocks with repeating items, also export `ITEM_MARKUP` const

#### `{blockname}.js`

Main decoration function following the 4-step pattern. Default template extracts heading and body text from authored rows.

```js
/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Load dependencies (if any)
  
  // 2. Extract configuration from authored rows
  const rows = Array.from(block.children);
  const config = {};
  
  // 3. Transform DOM
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 1) {
      config.heading = cells[0]?.textContent?.trim() || '';
    }
    if (cells.length >= 2) {
      config.bodyText = cells[1]?.textContent?.trim() || '';
    }
  });
  
  // 4. Add event listeners
  // Add event listeners as needed
}
```

**Rules:**
- Follow the exact 4-step order
- Include JSDoc for every exported function (`@param`, `@returns`)
- Include JSDoc for every non-trivial helper function
- Event handlers must document the event type (e.g., `@param {ClickEvent} event`)
- Use utilities from `scripts/aem.js`: `createOptimizedPicture`, `readBlockConfig`, `getMetadata`, `loadCSS`, `loadScript`, `toClassName`, `toCamelCase`, `wrapTextNodes`, `buildBlock`
- Guard every optional field: `if (!cell) return;`
- Optimize images: `createOptimizedPicture(src, alt, false, [{ width: '750' }])`
- For LCP images pass `true` as third argument to disable lazy loading
- If fragment-loading: use `fetchFragmentHtml` from `scripts/config/fragment-loader.js`
- Use `innerHTML` ONLY for controlled template strings or hardcoded literals

#### `{blockname}.css`

Styles scoped to `.{blockname}` only.

```css
.{blockname} {
  /* Base styles */
}

.{blockname}-item {
  /* Item/child styles if needed */
}

/* Responsive breakpoints using min-width (mobile-first) */
@media (width >= 632px) {
  .{blockname} {
    /* Tablet and up */
  }
}

@media (width >= 992px) {
  .{blockname} {
    /* Desktop and up */
  }
}

/* Focus styles for accessibility */
.{blockname} a:focus-visible,
.{blockname} button:focus-visible {
  outline: 3px solid var(--color-primary-focus);
  outline-offset: 2px;
}
```

**Rules:**
- Mobile-first: base styles target smallest viewport
- Use ONLY `min-width` media queries at: 632px (sm) · 760px (md) · 992px (lg) · 1272px (xl) · 1432px (xxl)
- Every selector scoped to `.{blockname}` — no bare elements or unscoped classes
- NO `.{blockname}-container` or `.{blockname}-wrapper` (reserved)
- Use semantic color tokens: `--color-{state}`, `--color-{state}-hover`, `--color-{state}-active`, `--color-{state}-focus`
- Use spacing tokens: `--spacing-1` through `--spacing-5`
- Use typography tokens: `--font-size-h1` through `--font-size-small`
- Every interactive element must have `:focus-visible` ring (3px solid focus color, 2px offset)
- Project-wide overrides go in `styles/config/overrides.css`
- Block-level token overrides must be scoped to `.{blockname}`

#### `{blockname}.spec.js`

Playwright end-to-end tests.

```js
import { test, expect } from '@playwright/test';

test.describe('{blockname}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/{blockname}-test.html');
  });

  test('renders expected DOM structure', async ({ page }) => {
    const block = page.locator('.{blockname}');
    await expect(block).toBeVisible();
    // Add assertions based on content model
  });

  test('empty block does not throw', async ({ page }) => {
    // Verify no console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    // Block should render without throwing
    await expect(page.locator('.{blockname}')).toHaveCount(1);
    expect(errors).toHaveLength(0);
  });

  test('missing optional fields does not throw', async ({ page }) => {
    // Verify structure is still valid when optional cells are missing
    const block = page.locator('.{blockname}');
    await expect(block).toBeVisible();
  });
});
```

**Required test coverage:**
1. Happy path — standard authored content renders expected DOM
2. Empty block — does not throw, produces valid HTML
3. Missing optional fields — does not throw
4. Item count — multiple rows produce correct number of child elements

### Directory: `tests/`

#### `{blockname}-test.html`

Full-page HTML with the block in its default authored form for testing.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="nav" content="/tests/fragments/nav">
  <meta name="footer" content="/tests/fragments/footer">
  <title>{Display Name} Block Test</title>
</head>
<body>
  <main>
    <div class="{blockname}">
      <div><div>Sample Heading</div><div>Sample body text goes here.</div></div>
    </div>
  </main>
</body>
</html>
```

**Rules:**
- Override nav and footer meta tags to test independently
- Use AEM authored markup: `.{blockname}` wrapper containing rows of `<div><div>cell</div></div>`
- Include at least one full-content instance for testing
- Customize cells to match the block's content model

---

## Step 3: Execute Generation

Using the default content model (heading + body text):
1. Create the `blocks/{blockname}/` directory
2. Create all 5 block files with skeleton content customized to the block name
3. Create the `tests/{blockname}-test.html` file with default-model test markup
4. Run `npm run lint` and auto-fix any linting issues with `npm run lint:fix`
5. Confirm all files were created and lint passes

Report completion with a summary of generated files and a note that the user can customize the content model by updating `block.md`, `.js`, `.css`, and test files as needed.
