# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @AGENTS.md for the full project instructions, coding standards, and workflow.

## Quick Reference

### Commands
- `npm install` — install dependencies
- `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` — start dev server at http://localhost:3000 (run in background)
- `npm run lint` — run ESLint + Stylelint
- `npm run lint:fix` — auto-fix linting issues

### Codebase Notes

`scripts/aem.js` is the upstream AEM library — **never modify it**. All project customization goes in `scripts/scripts.js`.

The three-phase load order matters for performance:
1. **Eager** (`loadEager`): decorates DOM, loads first section for LCP
2. **Lazy** (`loadLazy`): loads header, footer, remaining sections, lazy-styles.css
3. **Delayed** (`loadDelayed`): imports `delayed.js` after 3 seconds for martech/analytics

Auto-blocking runs in `buildAutoBlocks` in `scripts/scripts.js`. Currently it auto-loads fragment links (`/fragments/` path pattern) and builds a hero block from any `<h1>` + `<picture>` pair where the picture precedes the heading.

Each block in `blocks/{name}/` must export a default `decorate(block)` function. The block receives its authored DOM rows as `block.children`. Use `curl http://localhost:3000/path.plain.html` to inspect the raw authored markup before writing decoration logic.

For draft/test content with no CMS page, create files in `drafts/` and start the server with `--html-folder drafts`.

### Project Rules

Always check the `docs/` folder for coding standards and rules before writing or modifying any code:
- `docs/blocks.md` — standards for all block development (directory structure, markup.js pattern, decoration, CSS, accessibility, comments and JSDoc, testing)
- `docs/global.md` — guide for modifying global scripts and styles

Before modifying any block's `.js` or `.css`, read that block's own `block.md` file first. It defines the authored content model and is the contract between authors and code — changes to block structure must keep `block.md` and the test file in sync.
