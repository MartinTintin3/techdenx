const path = require('path');
const fs = require('fs');
const express = require('express');
const { createServer: createViteServer } = require('vite');

const isProd = process.env.NODE_ENV === 'production';
const root = __dirname;

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

function getPageData() {
  const data = readSiteData();
  return processPlaceholders(data, data.meta);
}

async function createApp() {
  const app = express();
  app.set('views', path.join(root, 'views'));
  app.set('view engine', 'ejs');

  if (!isProd) {
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  }

  if (isProd) {
    app.use('/assets', express.static(path.join(root, 'dist', 'assets')));
  } else {
    app.use('/assets', express.static(path.join(root, 'assets')));
  }

  app.get('/', (req, res) => {
    const data = getPageData();
    res.render('index', {
      fullTitle: buildTitle('', data.meta.title_suffix),
      metaDescription: data.meta.seo_description,
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      home: data.home,
      faq: data.faq
    });
  });

  app.get(['/services', '/services/'], (req, res) => {
    const data = getPageData();
    res.render('services', {
      fullTitle: buildTitle('Services', data.meta.title_suffix),
      metaDescription: '48-hour email authentication setup: SPF, DKIM, DMARC configuration with objective verification.',
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      services: data.services
    });
  });

  app.get(['/pricing', '/pricing/'], (req, res) => {
    const data = getPageData();
    res.render('pricing', {
      fullTitle: buildTitle('Pricing', data.meta.title_suffix),
      metaDescription: 'Simple flat pricing: $199 one-time for complete email authentication setup.',
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      pricing: data.pricing
    });
  });

  app.get(['/faq', '/faq/'], (req, res) => {
    const data = getPageData();
    res.render('faq', {
      fullTitle: buildTitle('FAQ', data.meta.title_suffix),
      metaDescription: 'Frequently asked questions about email authentication setup and bulk-sender compliance.',
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      faq: data.faq
    });
  });

  app.get(['/about', '/about/'], (req, res) => {
    const data = getPageData();
    res.render('about', {
      fullTitle: buildTitle('About', data.meta.title_suffix),
      metaDescription: 'Learn about our focused, proof-based email authentication setup service.',
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      about: data.about
    });
  });

  app.get(['/contact', '/contact/'], (req, res) => {
    const data = getPageData();
    res.render('contact', {
      fullTitle: buildTitle('Contact', data.meta.title_suffix),
      metaDescription: 'Contact us for email authentication setup questions or support.',
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      contact: data.contact
    });
  });

  app.get(['/privacy', '/privacy/'], (req, res) => {
    const data = getPageData();
    res.render('legal', {
      fullTitle: buildTitle('Privacy Policy', data.meta.title_suffix),
      metaDescription: `Privacy Policy for ${data.meta.brand_name}.`,
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      page: data.privacy
    });
  });

  app.get(['/terms', '/terms/'], (req, res) => {
    const data = getPageData();
    res.render('legal', {
      fullTitle: buildTitle('Terms of Service', data.meta.title_suffix),
      metaDescription: `Terms of Service for ${data.meta.brand_name}.`,
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      page: data.terms
    });
  });

  app.get(['/refund', '/refund/'], (req, res) => {
    const data = getPageData();
    res.render('legal', {
      fullTitle: buildTitle('Refund Policy', data.meta.title_suffix),
      metaDescription: `Refund Policy for ${data.meta.brand_name}.`,
      robots: 'index, follow',
      meta: data.meta,
      nav: buildNav(data, req.path),
      page: data.refund
    });
  });

  app.get(['/confirmation', '/confirmation/'], (req, res) => {
    const data = getPageData();
    res.render('confirmation', {
      fullTitle: buildTitle('Payment Received — Next Steps', data.meta.title_suffix),
      metaDescription: 'Payment confirmed. Next steps for your 48-hour email authentication setup.',
      robots: 'noindex, nofollow',
      meta: data.meta,
      nav: buildNav(data, req.path)
    });
  });

  app.use((req, res) => {
    res.status(404).send('Not Found');
  });

  return app;
}

createApp().then(app => {
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
