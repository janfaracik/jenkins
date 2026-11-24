const STORAGE_KEY = "jenkins-command-palette-recent";
const MAX_STORED = 10;

function withTrailingSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}

function read() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/**
 * Remembers the deepest scope of the current page as a recently visited page
 * @param {Array<{label: string, url: string, icon?: string}>} pageScopes
 */
export function recordVisit(pageScopes) {
  const current = pageScopes.at(-1);
  if (!current) {
    return;
  }

  const entry = {
    label: current.label,
    url: withTrailingSlash(current.url),
    icon: current.icon,
    parent: pageScopes.slice(0, -1).map((scope) => scope.label),
  };
  const visits = [
    entry,
    ...read().filter((visit) => visit.url !== entry.url),
  ].slice(0, MAX_STORED);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  } catch {
    // Storage can be full or unavailable, in which case nothing is remembered
  }
}

/**
 * Recently visited pages, most recent first, leaving out the current page
 */
export function getRecentVisits() {
  const current = withTrailingSlash(window.location.pathname);
  return read().filter((visit) => visit.url !== current);
}
