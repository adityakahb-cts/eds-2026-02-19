// The header block builds its DOM programmatically from a nav fragment.
// This file documents the final rendered structure for reference.

export const HEADER_MARKUP = /* html */`
<div class="nav-wrapper">
  <nav id="nav" aria-expanded="false">
    <div class="nav-hamburger">
      <button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>
    </div>
    <div class="nav-brand">{brand}</div>
    <div class="nav-sections">{sections}</div>
    <div class="nav-tools">{tools}</div>
  </nav>
</div>
`;

export default HEADER_MARKUP;
