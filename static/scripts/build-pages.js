const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const root = path.join(__dirname, '..');
const viewsDir = path.join(root, 'views');
const distDir = path.join(root, 'dist');

function readSiteData() {
  const raw = fs.readFileSync(path.join(root, 'content', 'site_copy.json'), 'utf-8');
  return JSON.parse(raw);
}

function replacePlaceholders(text, meta) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\{\{BRAND_NAME\}\}/g, meta.brand_name || 'Our Company')
    .replace(/\{\{DOMAIN\}\}/g, meta.domain || '')
    .replace(/\{\{CONTACT_EMAIL\}\}/g, meta.contact_email || 'contact@example.com')
    .replace(/\{\{LOCATION\}\}/g, meta.location || 'Boston, MA')
    .replace(/\{\{STRIPE_PAYMENT_LINK_URL\}\}/g, meta.stripe_payment_link_url || '#')
    .replace(/\{\{INTAKE_FORM_URL\}\}/g, meta.intake_form_url || '#');
}

function processPlaceholders(obj, meta) {
  if (typeof obj === 'string') {
    return replacePlaceholders(obj, meta);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => processPlaceholders(item, meta));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = processPlaceholders(obj[key], meta);
    }
    return result;
  }
  return obj;
}

function normalizePath(pathname) {
  if (pathname === '/') return '/';
  return pathname.replace(/\/$/, '');
}

function buildNav(data, pathname) {
  const current = normalizePath(pathname);
  return data.nav.map(item => {
    const href = item.href === '/' ? '/' : `${item.href.replace(/\/$/, '')}/`;
    const isCurrent = normalizePath(item.href) === current;
    return { ...item, href, isCurrent };
  });
}

function buildTitle(pageTitle, suffix) {
  if (!pageTitle) return suffix;
  return `${pageTitle} | ${suffix}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyAssets() {
  const sourceDir = path.join(root, 'assets');
  const targetDir = path.join(distDir, 'assets');
  ensureDir(targetDir);
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

async function renderPage(template, locals, outputPath) {
  const templatePath = path.join(viewsDir, `${template}.ejs`);
  const html = await ejs.renderFile(templatePath, locals, { async: true });
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html);
}

async function build() {
  const data = processPlaceholders(readSiteData(), readSiteData().meta);

  copyAssets();

  await renderPage('index', {
    fullTitle: buildTitle('', data.meta.title_suffix),
    metaDescription: data.meta.seo_description,
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/'),
    home: data.home,
    faq: data.faq
  }, path.join(distDir, 'index.html'));

  await renderPage('services', {
    fullTitle: buildTitle('Services', data.meta.title_suffix),
    metaDescription: '48-hour email authentication setup: SPF, DKIM, DMARC configuration with objective verification.',
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/services'),
    services: data.services
  }, path.join(distDir, 'services', 'index.html'));

  await renderPage('pricing', {
    fullTitle: buildTitle('Pricing', data.meta.title_suffix),
    metaDescription: 'Simple flat pricing: $199 one-time for complete email authentication setup.',
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/pricing'),
    pricing: data.pricing
  }, path.join(distDir, 'pricing', 'index.html'));

  await renderPage('faq', {
    fullTitle: buildTitle('FAQ', data.meta.title_suffix),
    metaDescription: 'Frequently asked questions about email authentication setup and bulk-sender compliance.',
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/faq'),
    faq: data.faq
  }, path.join(distDir, 'faq', 'index.html'));

  await renderPage('about', {
    fullTitle: buildTitle('About', data.meta.title_suffix),
    metaDescription: 'Learn about our focused, proof-based email authentication setup service.',
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/about'),
    about: data.about
  }, path.join(distDir, 'about', 'index.html'));

  await renderPage('contact', {
    fullTitle: buildTitle('Contact', data.meta.title_suffix),
    metaDescription: 'Contact us for email authentication setup questions or support.',
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/contact'),
    contact: data.contact
  }, path.join(distDir, 'contact', 'index.html'));

  await renderPage('legal', {
    fullTitle: buildTitle('Privacy Policy', data.meta.title_suffix),
    metaDescription: `Privacy Policy for ${data.meta.brand_name}.`,
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/privacy'),
    page: data.privacy
  }, path.join(distDir, 'privacy', 'index.html'));

  await renderPage('legal', {
    fullTitle: buildTitle('Terms of Service', data.meta.title_suffix),
    metaDescription: `Terms of Service for ${data.meta.brand_name}.`,
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/terms'),
    page: data.terms
  }, path.join(distDir, 'terms', 'index.html'));

  await renderPage('legal', {
    fullTitle: buildTitle('Refund Policy', data.meta.title_suffix),
    metaDescription: `Refund Policy for ${data.meta.brand_name}.`,
    robots: 'index, follow',
    meta: data.meta,
    nav: buildNav(data, '/refund'),
    page: data.refund
  }, path.join(distDir, 'refund', 'index.html'));

  await renderPage('confirmation', {
    fullTitle: buildTitle('Payment Received — Next Steps', data.meta.title_suffix),
    metaDescription: 'Payment confirmed. Next steps for your 48-hour email authentication setup.',
    robots: 'noindex, nofollow',
    meta: data.meta,
    nav: buildNav(data, '/confirmation')
  }, path.join(distDir, 'confirmation', 'index.html'));
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
