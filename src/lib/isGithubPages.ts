/** GitHub Pages 백업 (logrinssam.github.io/bakery-public) */
export function isGithubPagesPublic(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname === 'logrinssam.github.io') return true;
  const base = import.meta.env.BASE_URL || '/';
  return base.includes('bakery-public');
}
