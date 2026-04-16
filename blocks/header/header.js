import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { encodeHtml } from '../../scripts/scripts.js';
import {
  HEADER_MARKUP,
  NAV_ITEM_MARKUP,
  MEGAMENU_MARKUP,
  SUBNAV_MARKUP,
  SUBNAV_ITEM_MARKUP,
} from './markup.js';

/** Counter used to generate unique megamenu panel IDs within a single decorate call. */
let megamenuCounter = 0;

/**
 * Returns the trimmed text content of an element, or '' if the element is falsy.
 * @param {Element|null} el The element to read
 * @returns {string} Trimmed text content
 */
function getText(el) {
  return el ? el.textContent.trim() : '';
}

/**
 * Returns the inner HTML of the first icon span found in an element,
 * or the full innerHTML if no icon span exists, or '' if the element is falsy.
 * @param {Element|null} el The cell element to inspect
 * @returns {string} Icon HTML string
 */
function getIconHtml(el) {
  if (!el) return '';
  const span = el.querySelector('span.icon');
  return span ? span.outerHTML : el.innerHTML.trim();
}

/**
 * Renders SUBNAV_MARKUP instances from an array of <ul> elements.
 * @param {Element[]} lists Array of <ul> elements from the megamenu content cell
 * @returns {string} Rendered subnav HTML
 */
function renderSubnavs(lists) {
  return lists.map((ul) => {
    const items = [...ul.children].map((li) => {
      const link = li.querySelector('a');
      return SUBNAV_ITEM_MARKUP.replace('{link}', link ? link.outerHTML : li.innerHTML);
    }).join('');
    return SUBNAV_MARKUP.replace('{items}', items);
  }).join('');
}

/**
 * Renders all top-level NAV_ITEM_MARKUP entries from the navigation block.
 * Rows with content in cell 2 or cell 3 get a MEGAMENU_MARKUP panel;
 * all other rows render as plain links.
 * @param {Element|null} navBlock The navigation block element
 * @returns {string} Rendered nav items HTML
 */
function renderNavItems(navBlock) {
  if (!navBlock) return '';
  return [...navBlock.children].map((row) => {
    const [cell1, cell2, cell3] = row.children;

    // Main link text from cell 1 heading; href from cell 3's first anchor
    const heading = cell1 ? cell1.querySelector('h2, h3') : null;
    const mainLinkText = getText(heading || cell1);
    const landingAnchor = cell3 ? cell3.querySelector('a') : null;
    const mainLinkHref = landingAnchor ? landingAnchor.getAttribute('href') : '#';

    const hasMegamenu = (cell2 && cell2.innerHTML.trim()) || (cell3 && cell3.innerHTML.trim());
    let megamenu = '';
    let megamenuAttrs = '';
    let dropIcon = '';

    if (hasMegamenu) {
      megamenuCounter += 1;
      const megamenuId = `siteheader-megamenu-${megamenuCounter}`;

      // Image: prefer authored <img> from cell 2; picture tags are not forwarded
      const imageEl = cell2 ? cell2.querySelector('img') : null;
      const image = imageEl ? imageEl.outerHTML : '';

      // Landing content: heading + any description paragraphs from cell 3
      const landingEl = cell3 ? cell3.querySelector('h2, h3') : null;
      const landingLink = landingEl ? landingEl.outerHTML : '';
      const descHtml = cell3
        ? [...cell3.querySelectorAll('p')].map((p) => p.outerHTML).join('')
        : '';
      const landingContent = landingLink + descHtml;

      // Subnavs from direct <ul> children of cell 3
      const subnavs = renderSubnavs(cell3 ? [...cell3.querySelectorAll(':scope > ul')] : []);

      megamenu = MEGAMENU_MARKUP
        .replaceAll('{megamenuId}', megamenuId)
        .replaceAll('{megamenuLabel}', encodeHtml(mainLinkText))
        .replaceAll('{image}', image)
        .replaceAll('{landingContent}', landingContent)
        .replaceAll('{subnavs}', subnavs);

      megamenuAttrs = `aria-haspopup="true" aria-expanded="false" aria-controls="${megamenuId}"`;
      dropIcon = '';
    }

    return NAV_ITEM_MARKUP
      .replaceAll('{mainLinkHref}', encodeHtml(mainLinkHref))
      .replaceAll('{mainLinkText}', mainLinkText)
      .replaceAll('{megamenuAttrs}', megamenuAttrs)
      .replaceAll('{dropIcon}', dropIcon)
      .replaceAll('{megamenu}', megamenu);
  }).join('');
}

/**
 * Loads and decorates the header, mainly the nav.
 * Fetches the nav fragment, extracts content from the logo, navigation,
 * and hamburger sub-blocks, then interpolates everything into the
 * HEADER_MARKUP template from markup.js.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  megamenuCounter = 0;

  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // locate sub-blocks within the fragment
  const logoBlock = fragment ? fragment.querySelector('[data-block-name="logo"]') : null;
  const navBlock = fragment ? fragment.querySelector('[data-block-name="navigation"]') : null;
  const hamburgerBlock = fragment ? fragment.querySelector('[data-block-name="hamburger"]') : null;

  // logo – row 1: cell 1 = light src, cell 2 = dark src
  const logoRow = logoBlock ? logoBlock.children[0] : null;
  const logoLight = getText(logoRow ? logoRow.children[0] : null);
  const logoDark = getText(logoRow ? logoRow.children[1] : null);

  // hamburger – row 1: cell 1 = icon, cell 2 = aria-label
  const hamburgerRow = hamburgerBlock ? hamburgerBlock.children[0] : null;
  const hamburgerIcon = getIconHtml(hamburgerRow ? hamburgerRow.children[0] : null);
  const hamburgerLabel = getText(hamburgerRow ? hamburgerRow.children[1] : null) || 'Open navigation';

  // nav items – one row per megamenu entry
  const navItems = renderNavItems(navBlock);

  // interpolate all tokens into the header markup template
  block.innerHTML = HEADER_MARKUP
    .replaceAll('{logoLight}', encodeHtml(logoLight))
    .replaceAll('{logoDark}', encodeHtml(logoDark))
    .replaceAll('{navItems}', navItems)
    .replaceAll('{hamburgerIcon}', hamburgerIcon)
    .replaceAll('{hamburgerLabel}', encodeHtml(hamburgerLabel));
}
