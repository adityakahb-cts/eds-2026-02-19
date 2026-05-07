export const TABS_MARKUP = /* html */`
<div class="tabs-nav" role="tablist" aria-label="Tabs">
  {tabButtons}
</div>
<div class="tabs-panels">
  {tabPanels}
</div>
`;

export const TAB_BUTTON_MARKUP = /* html */`
<button
  class="tabs-tab"
  role="tab"
  id="tab-{id}"
  aria-controls="panel-{id}"
  aria-selected="{selected}"
  tabindex="{tabindex}"
>
  {label}
</button>
`;

export const TAB_PANEL_MARKUP = /* html */`
<div
  class="tabs-panel"
  role="tabpanel"
  id="panel-{id}"
  aria-labelledby="tab-{id}"
  hidden="{hidden}"
>
  {content}
</div>
`;

export default TABS_MARKUP;
