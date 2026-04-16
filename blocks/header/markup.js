// The header block builds its DOM programmatically from a nav fragment.
// This file documents the final rendered structure for reference.

export const HEADER_MARKUP = /* html */ `
<div class="position-fixed top-0 left-0 w-100 z-1000">
  <header
    class="max-wrap-lg d-flex justify-content-between align-items-center position-relative"
  >
    <div class="siteheader w-100">
      <div class="max-wrap">
        <div class="container-fluid">
          <div class="row">
            <div class="col d-flex justify-content-between align-items-center">
              <div class="siteheader-logo py-2">
                <a href="/" class="">
                  <picture class="">
                    <img
                      class="siteheader-logo-light"
                      src="{{logoLight}}"
                      alt="Go to home"
                      loading="eager"
                      decoding="async"
                    />
                  </picture>
                  <picture class="">
                    <img
                      class="siteheader-logo-dark"
                      src="{{logoDark}}"
                      alt="Go to home"
                      loading="eager"
                      decoding="async"
                    />
                  </picture>
                </a>
              </div>
              <nav class="d-none d-xl-block siteheader-nav">
                <ul class="d-flex m-0 p-0 list-unstyled gap-2">
                  {{navSections}}
                </ul>
              </nav>
              <div class="siteheader-right d-flex justify-content-end">
                <a
                  href="/contact"
                  class="btn btn-secondary rounded-pill ms-2 ms-xl-4 p-2 order-1 order-xl-1 px-xl-3 d-none d-md-inline-flex"
                >
                  <span class="icon-gm m-0 me-md-2 lh-1"> phone_in_talk </span>
                  <span class="lh-1">Contact Us</span>
                </a>
                <button
                  class="btn btn-primary rounded-pill p-2 d-xl-none ms-2 order-2"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#mobilenav"
                  aria-controls="mobilenav"
                >
                  <span class="icon-gm m-0 lh-1"> menu </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</div>

`;

export default HEADER_MARKUP;
