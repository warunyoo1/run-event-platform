export function shouldGuardLink(current: string, target: string, options: { download?: boolean; target?: string; modified?: boolean } = {}) {
  if (options.download || options.modified || (options.target && options.target !== "_self")) return false;
  const from = new URL(current);
  const to = new URL(target, from);
  if (!["http:", "https:"].includes(to.protocol)) return false;
  return from.origin !== to.origin || from.pathname !== to.pathname || from.search !== to.search;
}
