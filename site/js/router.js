// Hash router: patterns like "/trilha/:id" map to render functions.

const routes = [];
let notFound = () => document.createTextNode('Página não encontrada');
let mountPoint = null;
let afterRender = () => {};

export function registerRoute(pattern, render) {
  const keys = [];
  const source = pattern
    .replace(/\/+$/, '')
    .split('/')
    .map((part) => {
      if (part.startsWith(':')) {
        keys.push(part.slice(1));
        return '([^/]+)';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  routes.push({ regex: new RegExp(`^${source || ''}/?$`), keys, render });
}

export function setNotFound(render) {
  notFound = render;
}

export function matchRoute(path) {
  for (const route of routes) {
    const m = route.regex.exec(path);
    if (m) {
      const params = {};
      route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route, params };
    }
  }
  return null;
}

export function currentPath() {
  const raw = location.hash.replace(/^#/, '') || '/';
  return raw.split('?')[0];
}

export function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

export async function render() {
  if (!mountPoint) return;
  const path = currentPath();
  const found = matchRoute(path);
  let view;
  try {
    view = found ? await found.route.render(found.params) : null;
  } catch (err) {
    console.error(err);
    view = null;
  }
  if (!view) view = notFound(path);
  mountPoint.replaceChildren(view);
  window.scrollTo({ top: 0 });
  afterRender(path);
}

export function startRouter(el, onAfterRender) {
  mountPoint = el;
  if (onAfterRender) afterRender = onAfterRender;
  window.addEventListener('hashchange', render);
  render();
}
