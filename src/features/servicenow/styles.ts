export const btnPrimary =
  "rounded-xl border-2 border-[var(--primary-dark)] bg-transparent font-medium text-[var(--primary-dark)] transition-all duration-200 hover:border-[var(--primary-light)] hover:bg-[var(--primary-light)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-default)] disabled:opacity-50";

export const btnSecondary =
  "rounded-xl border-2 font-medium transition-all duration-200 hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bina-btn-secondary";

export const SANDBOX_STYLES = `
.servicenow-sandbox .bina-bg-default { background-color: var(--bg-default); }
.servicenow-sandbox .bina-text-default { color: var(--text-default); }
.servicenow-sandbox .bina-text-muted { color: var(--text-muted); }
.servicenow-sandbox .bina-bg-secondary-dark { background-color: var(--secondary-dark); }
.servicenow-sandbox .bina-border-primary { border-color: var(--primary); }
.servicenow-sandbox .bina-border-grey-dark { border-color: var(--grey-dark); }
.servicenow-sandbox .bina-bg-primary-light-20 { background-color: color-mix(in srgb, var(--primary-light) 20%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-30 { background-color: color-mix(in srgb, var(--primary-light) 30%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-40 { background-color: color-mix(in srgb, var(--primary-light) 40%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-50 { background-color: color-mix(in srgb, var(--primary-light) 50%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-60 { background-color: color-mix(in srgb, var(--primary-light) 60%, transparent); }
.servicenow-sandbox .bina-bg-primary-20 { background-color: color-mix(in srgb, var(--primary) 20%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-30 { background-color: color-mix(in srgb, var(--secondary-dark) 30%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-50 { background-color: color-mix(in srgb, var(--secondary-dark) 50%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-20 { background-color: color-mix(in srgb, var(--secondary-dark) 20%, transparent); }
.servicenow-sandbox .bina-bg-grey-dark-10 { background-color: color-mix(in srgb, var(--grey-dark) 10%, transparent); }
.servicenow-sandbox .bina-bg-grey-dark-20 { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-20 { border-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-30 { border-color: color-mix(in srgb, var(--grey-dark) 30%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-40 { border-color: color-mix(in srgb, var(--grey-dark) 40%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-50 { border-color: color-mix(in srgb, var(--grey-dark) 50%, transparent); }
.servicenow-sandbox .bina-hover-bg-grey-dark-20:hover { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-hover-text-default:hover { color: var(--text-default); }
.servicenow-sandbox .bina-btn-secondary { border-color: var(--grey-dark); background-color: var(--bg-default); color: var(--text-default); }
.servicenow-sandbox .bina-btn-secondary:hover { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox th.bina-th-hover:hover { background-color: color-mix(in srgb, var(--primary) 20%, transparent); }
.servicenow-sandbox tr.bina-row-hover:hover { background-color: color-mix(in srgb, var(--primary-light) 40%, transparent); }
/* Start Exercise button: brighter in dark theme (--primary is semi-transparent there) */
[data-theme="dark"] .servicenow-sandbox .btn-start-exercise {
  background: var(--button-primary);
  color: var(--secondary-dark);
  border-color: var(--primary-dark);
}
[data-theme="dark"] .servicenow-sandbox .btn-start-exercise:hover {
  opacity: 0.95;
  filter: brightness(1.05);
}
`;

