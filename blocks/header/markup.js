// The header block builds its DOM from a nav fragment.
// CONTENT_MODEL_SPEC describes the authored fields the nav fragment must supply.
// The MARKUP constants below define the final rendered structure.

/**
 * Describes every authored field the nav fragment is expected to supply to the header block.
 * Each top-level key maps to a block (or logical group) on the /nav page.
 *
 * Shape:
 *   type        – JS type of the authored value ('url' | 'icon' | 'string' | 'picture' | 'link' | 'array' | 'object')
 *   required    – whether the block cannot render without this field
 *   description – where the value comes from and how it is used
 *   itemShape   – (array only) shape descriptor for each element
 *   shape       – (object only) shape descriptor for nested properties
 */
export const CONTENT_MODEL_SPEC = {
  /** logo block – row 1, cell 1 */
  logoLight: {
    type: 'url',
    required: true,
    description: 'URL for the logo image displayed in light mode (logo block, row 1, cell 1).',
  },

  /** logo block – row 1, cell 2 */
  logoDark: {
    type: 'url',
    required: true,
    description: 'URL for the logo image displayed in dark mode (logo block, row 1, cell 2).',
  },

  /**
   * navigation block – one authored row per megamenu item.
   * Each row has three cells: main link | megamenu image | megamenu content.
   */
  navItems: {
    type: 'array',
    required: true,
    description: 'Megamenu navigation items. One navigation-block row per item.',
    itemShape: {
      /** Cell 1 – heading element containing the top-level nav anchor. */
      mainLink: {
        type: 'link',
        required: true,
        description: 'Top-level nav link. Authored as a heading (h2/h3) wrapping an anchor in cell 1.',
      },

      /** Cell 2 + Cell 3 together form the megamenu panel. */
      megamenu: {
        type: 'object',
        required: false,
        description: 'Megamenu subnav panel shown on hover/focus. Omit both cells to render a plain link.',
        shape: {
          /** Cell 2 – picture element used as a decorative/related image in the panel. */
          image: {
            type: 'picture',
            required: false,
            description: 'Related representation image shown inside the megamenu panel (cell 2).',
          },

          /** Cell 3, first heading anchor – primary landing-page link for this section. */
          landingLink: {
            type: 'link',
            required: true,
            description: 'Primary landing-page link for the section; bold heading anchor at the top of cell 3.',
          },

          /**
           * Cell 3, ul elements – up to two sub-navigation link lists.
           * Each list is a <ul> whose <li> elements contain anchors.
           */
          subnavs: {
            type: 'array',
            required: false,
            maxItems: 2,
            description: 'Up to 2 sub-navigation link groups (ul > li > a) within cell 3.',
            itemShape: {
              type: 'link',
              description: 'Individual sub-navigation anchor inside a list item.',
            },
          },
        },
      },
    },
  },

  /**
   * search block – single row with four cells:
   *   icon | label | placeholder | submit button text
   */
  search: {
    type: 'object',
    required: false,
    description: 'Search configuration authored in the search block on the /nav page.',
    shape: {
      /** Cell 1 – icon name or SVG src used for the search toggle button. */
      icon: {
        type: 'icon',
        required: true,
        description: 'Icon name / SVG src for the search toggle button (search block, row 1, cell 1).',
      },

      /** Cell 2 – accessible aria-label for the search toggle button and the search input. */
      label: {
        type: 'string',
        required: true,
        description: 'Accessible aria-label for the search toggle button and the search input (cell 2).',
      },

      /** Cell 3 – placeholder text shown inside the search input field. */
      placeholder: {
        type: 'string',
        required: true,
        description: 'Placeholder text for the search input field (search block, row 1, cell 3).',
      },

      /** Cell 4 – visible label / accessible text for the search form submit button. */
      submitText: {
        type: 'string',
        required: true,
        description: 'Label for the search form submit button (search block, row 1, cell 4).',
      },
    },
  },

  /**
   * hamburger block – single row with two cells:
   *   icon | label
   */
  hamburger: {
    type: 'object',
    required: true,
    description: 'Hamburger menu button configuration authored in the hamburger block on the /nav page.',
    shape: {
      /** Cell 1 – icon name or SVG src used for the hamburger toggle button. */
      icon: {
        type: 'icon',
        required: true,
        description: 'Icon name / SVG src for the hamburger toggle button (hamburger block, row 1, cell 1).',
      },

      /** Cell 2 – accessible aria-label for the hamburger toggle button. */
      label: {
        type: 'string',
        required: true,
        description: 'Accessible aria-label for the hamburger toggle button (hamburger block, row 1, cell 2).',
      },
    },
  },
};

// ─── Markup templates ────────────────────────────────────────────────────────

/**
 * Root header shell.
 * Tokens:
 *   {logoLight}      – src for the light-mode logo img
 *   {logoDark}       – src for the dark-mode logo img
 *   {navItems}       – rendered NAV_ITEM_MARKUP instances joined as a string
 *   {hamburgerIcon}  – inner HTML for the hamburger button icon
 *   {hamburgerLabel} – aria-label for the hamburger button
 */
export const HEADER_MARKUP = /* html */`
<div class="position-fixed top-0 left-0 w-100 z-1000">
  <header
    class="max-wrap-lg d-flex justify-content-between align-items-center bg-c-white-translucent position-relative"
  >
    <div class="siteheader dashed-bottom dashed-bottom-white-translucent w-100">
      <div class="max-wrap">
        <div class="container-fluid">
          <div class="row">
            <div class="col d-flex justify-content-between align-items-center">
              <div class="siteheader-logo py-2">
                <a href="/" aria-label="Go to home">
                  <img
                    class="siteheader-logo-light"
                    src="{logoLight}"
                    alt=""
                    loading="eager"
                    decoding="async"
                  />
                  <img
                    class="siteheader-logo-dark"
                    src="{logoDark}"
                    alt=""
                    loading="eager"
                    decoding="async"
                  />
                </a>
              </div>
              <nav class="d-none d-xl-block siteheader-nav" aria-label="Main navigation">
                <ul class="d-flex m-0 p-0 list-unstyled gap-2">
                  {navItems}
                </ul>
              </nav>
              <div class="siteheader-right d-flex justify-content-end">
                <a
                  href="/contact"
                  class="btn btn-secondary rounded-pill ms-2 ms-xl-4 p-2 order-1 order-xl-1 px-xl-3 d-none d-md-inline-flex"
                >
                  <span class="icon-gm m-0 me-md-2 lh-1" aria-hidden="true">phone_in_talk</span>
                  <span class="lh-1">Contact Us</span>
                </a>
                <button
                  class="btn btn-primary rounded-pill p-2 d-xl-none ms-2 order-2"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#mobilenav"
                  aria-controls="mobilenav"
                  aria-label="{hamburgerLabel}"
                >
                  {hamburgerIcon}
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

/**
 * A single top-level navigation item, with an optional megamenu panel.
 * Tokens:
 *   {mainLinkHref}   – href for the top-level nav anchor
 *   {mainLinkText}   – display text for the top-level nav anchor
 *   {megamenuAttrs}  – aria-haspopup/aria-expanded/aria-controls attrs when megamenu is
 *                      present, otherwise empty string
 *   {dropIcon}       – keyboard_arrow_down icon span for megamenu items, otherwise empty string
 *   {megamenu}       – rendered MEGAMENU_MARKUP, or empty string for plain links
 */
export const NAV_ITEM_MARKUP = /* html */`
<li class="">
  <h2 class="h6 m-0 fw-medium fs-body-lg">
    <a
      href="{mainLinkHref}"
      class="siteheader-navlink px-3 py-2 link-offset-2 link-offset-3-hover link-underline
        link-underline-opacity-0 d-flex justify-content-center align-items-center"
      {megamenuAttrs}
    ><span>{mainLinkText}</span>{dropIcon}</a>
  </h2>
  {megamenu}
</li>
`;

/**
 * Megamenu panel shown when a nav item is expanded.
 * Tokens:
 *   {megamenuId}      – id attribute value (matched by aria-controls on the trigger)
 *   {megamenuLabel}   – aria-label for the panel region (= nav item text)
 *   {image}           – img element HTML for the panel image, or empty string
 *   {landingContent}  – landing link heading outerHTML and any description paragraphs
 *   {subnavs}         – rendered SUBNAV_MARKUP instances joined as a string
 */
export const MEGAMENU_MARKUP = /* html */`
<div
  class="max-wrap-lg position-absolute top-100 start-0 w-100 siteheader-subnav z-21"
  id="{megamenuId}"
  role="region"
  aria-label="{megamenuLabel}"
>
  <div class="max-wrap">
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-4 siteheader-megamenu-image">{image}</div>
        <div class="col-4 siteheader-megamenu-landing">{landingContent}</div>
        <div class="col-4 siteheader-megamenu-subnavs">{subnavs}</div>
      </div>
    </div>
  </div>
</div>
`;

/**
 * One sub-navigation link group inside a megamenu panel.
 * Tokens:
 *   {items} – rendered SUBNAV_ITEM_MARKUP instances joined as a string
 */
export const SUBNAV_MARKUP = /* html */`
<ul class="list-unstyled d-block">
  {items}
</ul>
`;

/**
 * One sub-navigation link item.
 * Tokens:
 *   {link} – outerHTML of the authored anchor element
 */
export const SUBNAV_ITEM_MARKUP = /* html */`
<li class="d-flex">{link}</li>
`;

export default HEADER_MARKUP;
