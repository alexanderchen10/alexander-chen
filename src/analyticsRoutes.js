import { workProjects } from './data.js';

export const ORIGIN = 'https://alexanderchenworks.com';
export const HOME_SECTIONS = [
  ['.home-hero, .draft-hero', 'hero', 'Introduction'],
  ['#home-collaborators', 'collaborators', 'Collaborators'],
  ['.home-main #work, .draft-work', 'projects', 'Featured projects'],
  ['#home-ao-studio', 'ao_studio', 'AO Studio'],
  ['#experience', 'experience', 'Professional experience'],
  ['#home-education', 'education', 'Education'],
  ['.home-main #toolkits, .draft-capabilities', 'toolkits', 'Skills and toolkits'],
  ['#home-playground', 'playground', 'Playground'],
];
export const routes = [];
const add = (route, name, type, extra = {}) => routes.push({ route, page_path: route ? `/${route}` : '/', page_name: name, page_title: `${name} | Alexander Chen`, page_type: type, ...extra });
add('', 'Home', 'home');
add('work', 'Projects', 'catalogue');
add('project-log', 'Project & Documentation Log', 'project_log');
add('about', 'About', 'about');
add('education', 'Education', 'education');
add('ao-studio', 'AO Studio', 'studio');
add('playground', 'Playground', 'playground');
add('playground/photography', 'My Art — Photography', 'photography');
add('playground/design', 'My Design', 'design');
add('playground/fa-adventure', 'Flight Attendant Adventure', 'travel');
add('playground/alexs-life', "Alex’s Life — Game V1", 'game');
add('playground/alexs-life-hifi', "Alex’s Life — Game V2", 'game');
for (const project of workProjects) {
  for (const item of [project, ...(project.subprojects || [])]) {
    add(`project/${item.slug}`, `${item.title} — Case Study`, 'case_study', { project_id: item.slug, project_name: item.title, parent_project_id: project.slug });
  }
  // The public log indexes top-level projects only.
  if (!project.parentSlug) add(`project-log/${project.slug}`, `${project.title} — Project Record`, 'project_record', { project_id: project.slug, project_name: project.title });
  for (const chapter of project.chapters || []) chapter.projects.forEach((entry, i) => {
    add(`project/${project.slug}/${chapter.id}/${i + 1}`, `${entry.title} — ${project.title} — Project Detail`, 'project_detail', { project_id: project.slug, project_name: project.title, detail_id: `${chapter.id}/${i + 1}`, detail_name: entry.title });
  });
}
for (const [id, title] of [
  ['icff-lavazza-inclucity', 'ICFF Lavazza IncluCity Festival'],
  ['icff-isabella-rossellini', 'A Night with Isabella Rossellini'],
  ['icff-susan-sarandon', 'A Night with Susan Sarandon'],
  ['icff-giancarlo-esposito', 'Giancarlo Esposito'],
]) add(`playground/photography/${id}`, `${title} — Photo Album`, 'photo_album', { album_id: id });

export function normalizeRoute(value = '') {
  let route = String(value).replace(/^#\/?/, '').split(/[?#]/)[0].replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  try { route = decodeURIComponent(route); } catch { return ''; }
  return route.toLowerCase();
}
export function resolvePage(value = '') {
  const route = normalizeRoute(value);
  const known = routes.find(item => item.route === route);
  if (known) return known;
  // These are scroll anchors on the home document, never separate pages.
  if (!route || ['projects', 'experience', 'home-about', 'home-education', 'home-playground', 'toolkits', 'home-collaborators', 'home-ao-studio'].includes(route)) return routes[0];
  if (route.startsWith('project-log/')) return { route: 'project-log/not-found', page_path: '/project-log/not-found', page_name: 'Project Record Not Found', page_title: 'Project Record Not Found | Alexander Chen', page_type: 'not_found' };
  // The router renders Home for unrecognized hashes; do not transmit arbitrary user input.
  return routes[0];
}
export function canonicalLocation(page) { return ORIGIN + page.page_path; }
export function safeReferrer(value = '') {
  if (!value) return '';
  try {
    const url = new URL(value, ORIGIN);
    if (['alexanderchenworks.com', 'www.alexanderchenworks.com'].includes(url.hostname)) return canonicalLocation(resolvePage(url.hash));
    // External origin only: avoid identifiers, search terms, emails, and query values.
    return /^https?:$/.test(url.protocol) ? url.origin + '/' : '';
  } catch { return ''; }
}
