import { MARKUP } from './markup.js';

/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const content = [...block.children].map((row) => row.innerHTML).join('');
  block.innerHTML = MARKUP.replace('{content}', content);
}
