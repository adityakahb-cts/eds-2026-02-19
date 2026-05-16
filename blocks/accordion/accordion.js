import { MARKUP, ITEM_MARKUP } from './markup.js';

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const itemsHtml = [...block.children].map((row) => {
    const content = row.innerHTML ?? '';
    return ITEM_MARKUP.replace('{content}', content);
  }).join('');

  block.innerHTML = MARKUP.replace('{items}', itemsHtml);
}
