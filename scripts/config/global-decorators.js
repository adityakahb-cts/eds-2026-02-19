/**
 * Global markup decorators.
 * Each exported function receives the `main` element and performs a
 * single, focused DOM transformation. Add new decorators here and call
 * them from `decorateMain` in scripts.js.
 */

/**
 * Replaces a single `<span class="icon icon-{name}">` with
 * `<i class="lni lni-{name}" aria-hidden="true"></i>`.
 * @param {Element} span The icon span element to replace
 */
function decorateIconSpan(span) {
  const iconClass = Array.from(span.classList).find((c) => c.startsWith('icon-'));
  if (!iconClass) return;
  const iconName = iconClass.slice('icon-'.length);
  const i = document.createElement('i');
  i.classList.add('lni', `lni-${iconName}`);
  i.setAttribute('aria-hidden', 'true');
  span.replaceWith(i);
}

/**
 * Replaces all `<span class="icon icon-{name}">` elements inside `main`
 * with `<i class="lni lni-{name}" aria-hidden="true"></i>` elements.
 * @param {Element} main The main element to search for icon spans
 */
export function decorateIcons(main) {
  main.querySelectorAll('span.icon[class*="icon-"]').forEach(decorateIconSpan);
}
