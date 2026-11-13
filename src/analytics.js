import { HOME_SECTIONS, ORIGIN, resolvePage, canonicalLocation, safeReferrer } from './analyticsRoutes.js';

export const MEASUREMENT_ID = 'G-6FCH1QPWBP';
export const MEASUREMENT_IDS = [MEASUREMENT_ID, 'G-FWV4F4RMGN'];
let current = null;
let disposeVisit = () => {};
let initialized = false;
let serial = 0;
let debug = false;
const actionTimes = new Map();
const PROD_HOSTS = ['alexanderchenworks.com', 'www.alexanderchenworks.com'];
export function isProductionHost(host) { return PROD_HOSTS.includes(host); }
export function isNewVisit(previous, next) { return !previous || previous.page_path !== next.page_path; }
function enabled() { return isProductionHost(window.location.hostname) && window.navigator.doNotTrack !== '1' && window['ga-disable-' + MEASUREMENT_ID] !== true; }
function send(name, parameters = {}) {
  if (!enabled() || typeof window.gtag !== 'function') return;
  const context = current ? { page_title: current.page_title, page_location: canonicalLocation(current), page_path: current.page_path, page_name: current.page_name, page_type: current.page_type, ...(current.project_id ? { project_id: current.project_id, project_name: current.project_name } : {}), ...(current.album_id ? { album_id: current.album_id } : {}) } : {};
  const payload = { ...context, ...parameters, send_to: MEASUREMENT_IDS.filter(id => window['ga-disable-' + id] !== true), ...(debug ? { debug_mode: true, traffic_type: 'developer' } : {}) };
  window.gtag('event', name, payload);
  if (debug) {
    let trace = document.getElementById('portfolio-ga4-debug');
    if (!trace) { trace = document.createElement('script'); trace.type = 'application/json'; trace.id = 'portfolio-ga4-debug'; document.head.appendChild(trace); }
    const log = JSON.parse(trace.textContent || '[]');
    log.push({ event: name, parameters: payload });
    trace.textContent = JSON.stringify(log.slice(-200));
  }
}
export function trackInteraction(name, params = {}) { send(name, params); }
export function trackPlayground(action, scene = '') {
  const key = `${current?.page_path}:${action}:${scene}`;
  const now = Date.now();
  if (now - (actionTimes.get(key) || 0) < 2000) return;
  actionTimes.set(key, now);
  send('playground_interaction', { action, scene_id: String(scene).replace(/[^a-z0-9_-]/gi, '').slice(0, 60) });
}
export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  // No cookies or consent grants are set here. Existing Consent Mode commands remain in force.
  if (!enabled()) return;
  debug = new URLSearchParams(window.location.search).get('analytics_debug') === '1';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // The existing Google tag has two connected destinations. Suppress auto views
  // globally as well as per destination, including server-managed tag initialization.
  window.gtag('set', { send_page_view: false, ...(debug ? { debug_mode: true } : {}) });
  window.gtag('js', new Date());
  MEASUREMENT_IDS.forEach(id => window.gtag('config', id, { send_page_view: false, ...(debug ? { debug_mode: true } : {}) }));
  if (!document.querySelector('script[data-portfolio-ga4]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.portfolioGa4 = 'true';
    document.head.appendChild(script);
  }
  document.addEventListener('click', handleClick, true);
}
export function commitPage(route) {
  const next = resolvePage(route);
  document.title = next.page_title;
  if (!isNewVisit(current, next)) return false;
  const previous = current;
  const referrer = previous ? canonicalLocation(previous) : safeReferrer(document.referrer);
  disposeVisit();
  current = next;
  serial += 1;
  // Keep automatic engagement events on the same sanitized virtual page context.
  if (enabled() && window.gtag) window.gtag('set', { page_title: next.page_title, page_location: canonicalLocation(next), page_referrer: referrer });
  send('page_view', { page_referrer: referrer });
  if (next.project_id && ['case_study', 'project_detail'].includes(next.page_type)) {
    send('project_open', { view_type: 'route', ...(next.detail_id ? { detail_id: next.detail_id, detail_name: next.detail_name } : {}) });
  }
  if (previous?.project_id && next.page_path !== previous.page_path) send('project_navigation', { from_project_id: previous.project_id, to_page_path: next.page_path, ...(next.project_id ? { to_project_id: next.project_id } : {}) });
  disposeVisit = observeVisit(next, serial);
  return true;
}
function visibleFraction(el) {
  if (document.visibilityState !== 'visible') return 0;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return 0;
  return Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(0, r.top)) * Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(0, r.left)) / (r.width * r.height);
}
export function qualifiesSection(ratio, elapsed, visible = true) { return visible && ratio >= .5 && elapsed >= 1000; }
function observeVisit(page, visit) {
  const seen = new Set();
  const timers = new Map();
  const sections = new Map();
  const dialogs = new WeakSet();
  let frame = 0;
  const clear = el => { clearTimeout(timers.get(el)); timers.delete(el); };
  const check = el => {
    if (seen.has(sections.get(el)?.[0]) || visit !== serial) return;
    if (visibleFraction(el) < .5) { clear(el); return; }
    if (!timers.has(el)) timers.set(el, setTimeout(() => {
      timers.delete(el);
      if (visit !== serial || visibleFraction(el) < .5 || seen.has(sections.get(el)?.[0])) return;
      const [section_id, section_name] = sections.get(el);
      seen.add(section_id);
      send('section_view', { section_id, section_name, visible_percent: 50, visibility_ms: 1000 });
    }, 1000));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => check(entry.target)), { threshold: [0, .5, 1] });
  const scan = () => {
    if (visit !== serial) return;
    if (page.page_type === 'home') {
      const list = [...HOME_SECTIONS];
      document.querySelectorAll('[id^="experience-role-"]').forEach(el => list.push([`#${el.id}`, el.id, el.querySelector('h3')?.textContent.trim() || 'Experience role']));
      for (const [selector, id, name] of list) {
        const el = document.querySelector(selector);
        if (el && !sections.has(el)) { sections.set(el, [id, name]); observer.observe(el); check(el); }
      }
    }
    document.querySelectorAll('[role="dialog"]').forEach(el => {
      if (dialogs.has(el)) return;
      const modal = modalType(el);
      if (!modal) return;
      dialogs.add(el);
      send('modal_view', { modal_type: modal, view_type: 'modal' });
      if (page.project_id) send('project_open', { view_type: 'modal', modal_type: modal });
    });
  };
  const mutation = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; scan(); }); });
  const visibility = () => sections.forEach((_, el) => check(el));
  document.addEventListener('visibilitychange', visibility);
  mutation.observe(document.body, { childList: true, subtree: true });
  scan();
  return () => { observer.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame); timers.forEach(clearTimeout); document.removeEventListener('visibilitychange', visibility); };
}
function modalType(el) {
  for (const [cls, type] of [['media-lightbox', 'project_image'], ['photography-lightbox', 'photo_album'], ['icff-lightbox', 'icff_photo'], ['gta-lightbox', 'email_preview']]) if (el.classList.contains(cls)) return type;
  return null;
}
function handleClick(event) {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (!target) return;
  const link = target.closest('a[href]');
  if (link) {
    const raw = link.getAttribute('href') || '';
    if (/^(mailto:|tel:)/i.test(raw)) {
      send('contact_click', { contact_method: /^mailto:/i.test(raw) ? 'email' : 'phone', link_placement: link.closest('header,aside') ? 'header' : 'content' });
      return; // Never send email addresses, phone numbers, subjects, or bodies.
    }
    let url;
    try { url = new URL(raw, window.location.href); } catch { return; }
    if (/\/resume\.pdf$/i.test(url.pathname)) { send('resume_download', { file_name: 'resume.pdf', file_extension: 'pdf', link_placement: link.closest('header,aside') ? 'header' : 'content' }); return; }
    if (url.hostname === 'www.linkedin.com' || url.hostname === 'linkedin.com') send('contact_click', { contact_method: 'linkedin', link_placement: link.closest('header,aside') ? 'header' : 'content' });
    if (/^https?:$/.test(url.protocol) && !PROD_HOSTS.includes(url.hostname) && url.origin !== window.location.origin) {
      send('outbound_click', { link_domain: url.hostname, link_url: url.origin + '/', outbound: true });
    }
    if (url.origin === window.location.origin && url.hash && resolvePage(url.hash).page_path === current?.page_path) send('section_navigation', { navigation_type: 'anchor' });
    return;
  }
  const button = target.closest('button');
  if (!button) return;
  if (button.closest('.work-filters')) {
    const filter = button.textContent.trim().replace(/\d+$/, '').trim();
    if (['All', 'All records', 'Ongoing', 'Completed'].includes(filter)) send('portfolio_filter', { filter_name: 'status', filter_value: filter });
  }
  const dialog = button.closest('[role="dialog"]');
  if (dialog && modalType(dialog)) send('modal_interaction', { modal_type: modalType(dialog), action: /close/i.test(button.getAttribute('aria-label') || button.textContent) ? 'close' : 'navigate' });
  if (button.matches('.skills-selector [role="tab"], .draft-skill-tabs [role="tab"]')) send('toolkit_select', { toolkit_id: button.id.replace(/^(skills|draft)-tab-/, ''), toolkit_name: button.textContent.trim().slice(0, 80) });
  if (button.closest('.home-toolkit-list')) send('toolkit_expand', { toolkit_name: button.textContent.replace(/[+−]/g, '').trim().slice(0, 80), expanded: button.getAttribute('aria-expanded') !== 'true' });
  if (button.matches('.home-hero-avatar, .draft-camera')) send('hero_interaction', { action: 'camera_pose' });
}
