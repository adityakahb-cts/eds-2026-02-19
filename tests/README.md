# tests/

Static HTML files served by the AEM dev server for Playwright end-to-end testing. Files here are never published to the CMS and are blocked from the AEM preview/live environments via `.hlxignore`.

## Structure

```
tests/
├── fragments/                      # Plain-HTML fragment fixtures (.plain.html)
│   ├── nav.plain.html              # Navigation fragment (loaded by all test pages)
│   ├── footer.plain.html           # Footer fragment (loaded by all test pages)
│   └── fragment-content.plain.html # Sample content for fragment block tests
│
├── fragment-test.html              # Test page for blocks/fragment/fragment.spec.js
├── header-test.html                # Test page for blocks/header/header.spec.js
└── footer-test.html                # Test page for blocks/footer/footer.spec.js
```

## Conventions

| Type | Location | Extension | Naming |
|---|---|---|---|
| Full test pages | `tests/` | `.html` | `{blockname}-test.html` |
| Fragment fixtures | `tests/fragments/` | `.plain.html` | descriptive name |

## How test pages work

Every test page includes these meta tags so the header and footer blocks load local
fragment fixtures instead of making live CMS requests:

```html
<meta name="nav"    content="/tests/fragments/nav">
<meta name="footer" content="/tests/fragments/footer">
```

## Adding a new block test

1. Create `tests/{blockname}-test.html` with the block's authored markup.
2. If the block fetches fragments, add the corresponding `.plain.html` files under `tests/fragments/`.
3. Reference the test page in `blocks/{blockname}/{blockname}.spec.js`.
4. Document the test file in `blocks/{blockname}/block.md`.
