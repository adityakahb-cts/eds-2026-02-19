import { TABS_MARKUP, TAB_BUTTON_MARKUP, TAB_PANEL_MARKUP } from './markup.js';

/**
 * Activates a tab and shows its associated panel.
 * @param {HTMLElement} tabList The tablist container element
 * @param {string} id The id suffix of the tab to activate
 */
function activateTab(tabList, id) {
  tabList.querySelectorAll('[role="tab"]').forEach((btn) => {
    const isActive = btn.id === `tab-${id}`;
    btn.setAttribute('aria-selected', String(isActive));
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  tabList.closest('.tabs').querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    const isActive = panel.id === `panel-${id}`;
    if (isActive) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
  });
}

/**
 * Handles keyboard navigation within the tablist (arrow keys, Home, End).
 * @param {KeyboardEvent} e The keydown event
 * @param {HTMLElement} tabList The tablist container element
 */
function handleKeydown(e, tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const current = tabs.indexOf(document.activeElement);
  if (current === -1) return;

  let next = -1;
  if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;

  e.preventDefault();
  tabs[next].focus();
  const newId = tabs[next].id.replace('tab-', '');
  activateTab(tabList, newId);
}

/**
 * Loads and decorates the tabs block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const tabButtons = rows.map((row, i) => {
    const label = row.children[0]?.textContent?.trim() ?? `Tab ${i + 1}`;
    const id = `${block.closest('[id]')?.id ?? 'tabs'}-${i}`;
    return TAB_BUTTON_MARKUP
      .replace(/{id}/g, id)
      .replace('{label}', label)
      .replace('{selected}', String(i === 0))
      .replace('{tabindex}', i === 0 ? '0' : '-1');
  }).join('');

  const tabPanels = rows.map((row, i) => {
    const content = row.children[1]?.innerHTML ?? '';
    const id = `${block.closest('[id]')?.id ?? 'tabs'}-${i}`;
    return TAB_PANEL_MARKUP
      .replace(/{id}/g, id)
      .replace('{content}', content)
      .replace('{hidden}', i === 0 ? 'false' : '');
  }).join('');

  block.innerHTML = TABS_MARKUP
    .replace('{tabButtons}', tabButtons)
    .replace('{tabPanels}', tabPanels);

  // Remove the boolean false attribute on the first panel (hidden="false" would hide it)
  block.querySelector('[role="tabpanel"]')?.removeAttribute('hidden');

  const tabList = block.querySelector('[role="tablist"]');

  tabList.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    activateTab(tabList, tab.id.replace('tab-', ''));
  });

  tabList.addEventListener('keydown', (e) => handleKeydown(e, tabList));
}
