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
 *   {logoLight}        – src for light-mode logo img
 *   {logoDark}         – src for dark-mode logo img
 *   {hamburgerIcon}    – inner HTML for the hamburger button (icon element)
 *   {hamburgerLabel}   – aria-label for the hamburger button
 *   {navItems}         – rendered NAV_ITEM_MARKUP instances joined as a string
 *   {searchIcon}       – inner HTML for the search toggle button (icon element)
 *   {searchLabel}      – aria-label for the search toggle button and input
 *   {searchPlaceholder}– placeholder for the search input
 *   {searchSubmitText} – label for the search submit button
 */
export const HEADER_MARKUP = /* html */`
<div class="nav-wrapper">
  <nav id="nav" aria-expanded="false">
    <div class="nav-hamburger">
      <button
        type="button"
        class="nav-hamburger-btn"
        aria-label="{hamburgerLabel}"
        aria-controls="nav"
        aria-expanded="false"
      >
        {hamburgerIcon}
      </button>
    </div>

    <div class="nav-brand">
      <a href="/" aria-label="Go to home">
        <picture class="nav-logo-light">
          <img
            src="{logoLight}"
            alt=""
            loading="eager"
            decoding="async"
          />
        </picture>
        <picture class="nav-logo-dark">
          <img
            src="{logoDark}"
            alt=""
            loading="eager"
            decoding="async"
          />
        </picture>
      </a>
    </div>

    <div class="nav-sections">
      <ul role="list">
        {navItems}
      </ul>
    </div>

    <div class="nav-tools">
      <button
        type="button"
        class="nav-search-toggle"
        aria-label="{searchLabel}"
        aria-expanded="false"
        aria-controls="nav-search-form"
      >
        {searchIcon}
      </button>
      <form
        class="nav-search-form"
        id="nav-search-form"
        role="search"
        hidden
      >
        <input
          type="search"
          class="nav-search-input"
          placeholder="{searchPlaceholder}"
          aria-label="{searchLabel}"
        />
        <button type="submit" class="nav-search-submit">
          {searchSubmitText}
        </button>
      </form>
    </div>
  </nav>
</div>
`;

/**
 * A single top-level navigation item, with an optional megamenu panel.
 * Tokens:
 *   {mainLink}    – outerHTML of the authored heading/anchor element
 *   {megamenu}    – rendered MEGAMENU_MARKUP, or empty string for plain links
 *   {dropClass}   – 'nav-drop' when a megamenu is present, otherwise ''
 */
export const NAV_ITEM_MARKUP = /* html */`
<li class="nav-item {dropClass}">
  {mainLink}
  {megamenu}
</li>
`;

/**
 * Megamenu panel shown when a nav item is expanded.
 * Tokens:
 *   {image}       – outerHTML of the authored picture element, or empty string
 *   {landingLink} – outerHTML of the primary landing-page heading/anchor
 *   {subnavs}     – rendered SUBNAV_MARKUP instances joined as a string
 */
export const MEGAMENU_MARKUP = /* html */`
<div class="nav-megamenu" hidden>
  <div class="nav-megamenu-image">{image}</div>
  <div class="nav-megamenu-content">
    <div class="nav-megamenu-landing">{landingLink}</div>
    <div class="nav-megamenu-subnavs">{subnavs}</div>
  </div>
</div>
`;

/**
 * One sub-navigation link group inside a megamenu panel.
 * Tokens:
 *   {items} – <li> elements for each sub-nav link
 */
export const SUBNAV_MARKUP = /* html */`
<ul class="nav-subnav" role="list">
  {items}
</ul>
`;

/**
 * One sub-navigation link item.
 * Tokens:
 *   {link} – outerHTML of the authored anchor element
 */
export const SUBNAV_ITEM_MARKUP = /* html */`
<li class="nav-subnav-item">{link}</li>
`;

export default HEADER_MARKUP;
