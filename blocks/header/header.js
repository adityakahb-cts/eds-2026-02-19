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
 * Renders one or more SUBNAV_MARKUP blocks from an array of <ul> elements.
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
 * Each block row maps to one nav item; rows with content in cells 2 or 3
 * get a megamenu panel, otherwise a plain link is rendered.
 * @param {Element|null} navBlock The navigation block element
 * @returns {string} Rendered nav items HTML
 */
function renderNavItems(navBlock) {
  if (!navBlock) return '';
  return [...navBlock.children].map((row) => {
    const [cell1, cell2, cell3] = row.children;

    const heading = cell1 ? cell1.querySelector('h2, h3') : null;
    let mainLink = '';
    if (heading) mainLink = heading.outerHTML;
    else if (cell1) mainLink = cell1.innerHTML;

    const hasMegamenu = (cell2 && cell2.innerHTML.trim()) || (cell3 && cell3.innerHTML.trim());
    let megamenu = '';
    let dropClass = '';

    if (hasMegamenu) {
      const image = cell2 ? cell2.innerHTML.trim() : '';
      const landingEl = cell3 ? cell3.querySelector('h2, h3') : null;
      const landingLink = landingEl ? landingEl.outerHTML : '';
      const subnavs = renderSubnavs(cell3 ? [...cell3.querySelectorAll(':scope > ul')] : []);

      megamenu = MEGAMENU_MARKUP
        .replace('{image}', image)
        .replace('{landingLink}', landingLink)
        .replace('{subnavs}', subnavs);
      dropClass = 'nav-drop';
    }

    return NAV_ITEM_MARKUP
      .replace('{mainLink}', mainLink)
      .replace('{megamenu}', megamenu)
      .replace('{dropClass}', dropClass);
  }).join('');
}

/**
 * Loads and decorates the header, mainly the nav.
 * Fetches the nav fragment, extracts content from the logo, navigation,
 * search, and hamburger sub-blocks, then interpolates everything into
 * the HEADER_MARKUP template from markup.js.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // locate sub-blocks within the fragment
  const logoBlock = fragment ? fragment.querySelector('[data-block-name="logo"]') : null;
  const navBlock = fragment ? fragment.querySelector('[data-block-name="navigation"]') : null;
  const searchBlock = fragment ? fragment.querySelector('[data-block-name="search"]') : null;
  const hamburgerBlock = fragment ? fragment.querySelector('[data-block-name="hamburger"]') : null;

  // logo – row 1: cell 1 = light src, cell 2 = dark src
  const logoRow = logoBlock ? logoBlock.children[0] : null;
  const logoLight = getText(logoRow ? logoRow.children[0] : null);
  const logoDark = getText(logoRow ? logoRow.children[1] : null);

  // hamburger – row 1: cell 1 = icon, cell 2 = aria-label
  const hamburgerRow = hamburgerBlock ? hamburgerBlock.children[0] : null;
  const hamburgerIcon = getIconHtml(hamburgerRow ? hamburgerRow.children[0] : null);
  const hamburgerLabel = getText(hamburgerRow ? hamburgerRow.children[1] : null) || 'Open navigation';

  // search – row 1: cell 1 = icon, cell 2 = label, cell 3 = placeholder, cell 4 = submit text
  const searchRow = searchBlock ? searchBlock.children[0] : null;
  const searchIcon = getIconHtml(searchRow ? searchRow.children[0] : null);
  const searchLabel = getText(searchRow ? searchRow.children[1] : null) || 'Search';
  const searchPlaceholder = getText(searchRow ? searchRow.children[2] : null) || 'Search...';
  const searchSubmitText = getText(searchRow ? searchRow.children[3] : null) || 'Search';

  // nav items – one row per megamenu entry
  const navItems = renderNavItems(navBlock);

  // interpolate all tokens into the header markup template
  block.innerHTML = HEADER_MARKUP
    .replaceAll('{logoLight}', encodeHtml(logoLight))
    .replaceAll('{logoDark}', encodeHtml(logoDark))
    .replaceAll('{hamburgerIcon}', hamburgerIcon)
    .replaceAll('{hamburgerLabel}', encodeHtml(hamburgerLabel))
    .replaceAll('{navItems}', navItems)
    .replaceAll('{searchIcon}', searchIcon)
    .replaceAll('{searchLabel}', encodeHtml(searchLabel))
    .replaceAll('{searchPlaceholder}', encodeHtml(searchPlaceholder))
    .replaceAll('{searchSubmitText}', encodeHtml(searchSubmitText));

  // hamburger toggle: flip aria-expanded on the nav and the button
  const nav = block.querySelector('#nav');
  const hamburgerBtn = block.querySelector('.nav-hamburger-btn');
  if (nav && hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      nav.setAttribute('aria-expanded', String(!expanded));
      hamburgerBtn.setAttribute('aria-expanded', String(!expanded));
    });
  }
}
