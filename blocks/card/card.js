import { createOptimizedPicture } from '../../scripts/aem.js';
import { MARKUP } from './markup.js';

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const [imageRow, headingRow, ctaRow] = rows;

  const img = imageRow?.querySelector('picture > img');
  const picture = img
    ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    : null;

  const headingEl = headingRow?.querySelector('h1, h2, h3, h4, h5, h6')
    ?? headingRow?.querySelector('p')
    ?? headingRow;
  const heading = headingEl?.textContent?.trim() ?? '';

  const link = ctaRow?.querySelector('a');
  const cta = link?.textContent?.trim() ?? '';
  const href = link?.getAttribute('href') ?? '#';

  block.innerHTML = MARKUP
    .replace('{image}', picture?.outerHTML ?? '')
    .replace('{heading}', heading)
    .replace('{cta}', cta)
    .replace('{href}', href);
}
