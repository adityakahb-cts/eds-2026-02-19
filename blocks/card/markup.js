export const MARKUP = /* html */`
<article class="card-inner">
  <div class="card-image">{image}</div>
  <div class="card-body">
    <h3 class="card-heading">{heading}</h3>
    <a class="card-cta" href="{href}">
      <span class="card-cta-label">{cta}</span>
      <svg class="card-cta-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 5l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  </div>
</article>
`;

export default MARKUP;
