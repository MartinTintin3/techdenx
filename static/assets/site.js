/**
 * Site JavaScript
 * Handles: content loading, navigation, FAQ accordion, confirmation page
 * No external dependencies
 */

(function () {
  'use strict';

  // Cache for site copy data
  let siteData = null;

  /**
   * Fetch and parse site copy JSON
   */
  async function loadSiteData() {
    try {
      const response = await fetch('/content/site_copy.json');
      if (!response.ok) throw new Error('Failed to load content');
      siteData = await response.json();
      return siteData;
    } catch (error) {
      console.error('Error loading site data:', error);
      return null;
    }
  }

  /**
   * Replace placeholder tokens in text
   */
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

  /**
   * Process all placeholders in an object recursively
   */
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

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Create HTML for a bullet list
   */
  function createBulletList(items) {
    if (!items || !items.length) return '';
    return '<ul>' + items.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
  }

  /**
   * Get URL query parameters
   */
  function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  }

  /**
   * Render navigation
   */
  function renderNav(nav, brandName) {
    const currentPath = window.location.pathname
      .toLowerCase()
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '/')
      .replace(/\/$/, '') || '/';
    
    const brandEl = document.querySelector('.brand');
    if (brandEl) {
      brandEl.textContent = brandName;
    }

    const navList = document.querySelector('.nav-list');
    if (navList && nav) {
      navList.innerHTML = nav.map(item => {
        const href = item.href === '/' ? '/' : item.href + '/';
        const normalizedHref = item.href.replace(/\/$/, '') || '/';
        const normalizedCurrent = currentPath === '/' ? '/' : currentPath;
        const isCurrent = normalizedCurrent === normalizedHref;
        return `<li><a href="${escapeHtml(href)}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`;
      }).join('');
    }
  }

  /**
   * Render footer
   */
  function renderFooter(meta) {
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand) {
      footerBrand.innerHTML = `
        <h3>${escapeHtml(meta.brand_name)}</h3>
        <p>Located in ${escapeHtml(meta.location || 'Boston, MA')}</p>
        <p><a href="mailto:${escapeHtml(meta.contact_email)}">${escapeHtml(meta.contact_email)}</a></p>
      `;
    }

    const footerNotice = document.querySelector('.footer-notice');
    if (footerNotice) {
      footerNotice.innerHTML = '<strong>Notice:</strong> We do not support spam or illicit email practices. We only work with legitimate senders.';
    }

    const footerCopy = document.querySelector('.footer-copyright');
    if (footerCopy) {
      const year = new Date().getFullYear();
      footerCopy.textContent = `© ${year} ${meta.brand_name}. All rights reserved.`;
    }
  }

  /**
   * Set page title
   */
  function setPageTitle(pageTitle, titleSuffix) {
    document.title = pageTitle ? `${pageTitle} | ${titleSuffix}` : titleSuffix;
  }

  /**
   * Set meta description
   */
  function setMetaDescription(description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }

  /**
   * Render home page
   */
  function renderHomePage(data) {
    const home = data.home;
    const meta = data.meta;

    setPageTitle('', meta.title_suffix);
    setMetaDescription(meta.seo_description);

    const heroHeadline = document.querySelector('.hero h1');
    if (heroHeadline) heroHeadline.textContent = home.hero_headline;

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = home.hero_subheadline;

    // Update all primary CTAs
    document.querySelectorAll('.cta-primary').forEach(el => {
      el.textContent = home.primary_cta_label;
      el.href = home.primary_cta_href;
    });

    const sectionsContainer = document.querySelector('.home-sections');
    if (sectionsContainer && home.sections) {
      sectionsContainer.innerHTML = home.sections.map(section => `
        <div class="content-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${createBulletList(section.bullets)}
        </div>
      `).join('');
    }

    const homeFaqList = document.querySelector('.home-faq-list');
    if (homeFaqList && data.faq && data.faq.items) {
      homeFaqList.innerHTML = data.faq.items.map((item, index) => `
        <details class="faq-item" id="home-faq-${index}">
          <summary class="faq-question">
            <span>${escapeHtml(item.q)}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-answer">
            <p>${escapeHtml(item.a)}</p>
          </div>
        </details>
      `).join('');
    }
  }

  /**
   * Render services page
   */
  function renderServicesPage(data) {
    const services = data.services;
    const meta = data.meta;

    setPageTitle('Services', meta.title_suffix);
    setMetaDescription('48-hour email authentication setup: SPF, DKIM, DMARC configuration with objective verification.');

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = services.headline;

    const sectionsContainer = document.querySelector('.services-sections');
    if (sectionsContainer && services.sections) {
      sectionsContainer.innerHTML = services.sections.map(section => `
        <div class="content-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs ? section.paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('') : ''}
          ${createBulletList(section.bullets)}
        </div>
      `).join('');
    }
  }

  /**
   * Render pricing page
   */
  function renderPricingPage(data) {
    const pricing = data.pricing;
    const meta = data.meta;

    setPageTitle('Pricing', meta.title_suffix);
    setMetaDescription('Simple flat pricing: $199 one-time for complete email authentication setup.');

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = pricing.headline;

    const tiersContainer = document.querySelector('.pricing-tiers');
    if (tiersContainer && pricing.tiers) {
      tiersContainer.innerHTML = pricing.tiers.map(tier => `
        <div class="pricing-card">
          <h3>${escapeHtml(tier.name)}</h3>
          <div class="pricing-price">${escapeHtml(tier.price)}</div>
          <p class="pricing-who">${escapeHtml(tier.who_its_for)}</p>
          <ul class="pricing-features">
            ${tier.includes.map(item => '<li>' + escapeHtml(item) + '</li>').join('')}
          </ul>
          <div class="pricing-cta">
            <a href="${escapeHtml(tier.cta_href)}" class="btn btn-primary btn-lg">${escapeHtml(tier.cta_label)}</a>
            <p class="stripe-note text-muted">Charged securely via Stripe. Your card details never touch this site.</p>
          </div>
        </div>
      `).join('');
    }

    const finePrint = document.querySelector('.fine-print');
    if (finePrint && pricing.fine_print) {
      finePrint.innerHTML = '<ul>' + pricing.fine_print.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
    }
  }

  /**
   * Render FAQ page with accordion
   */
  function renderFaqPage(data) {
    const faq = data.faq;
    const meta = data.meta;

    setPageTitle('FAQ', meta.title_suffix);
    setMetaDescription('Frequently asked questions about email authentication setup and bulk-sender compliance.');

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = faq.headline;

    const faqList = document.querySelector('.faq-list');
    if (faqList && faq.items) {
      faqList.innerHTML = faq.items.map((item, index) => `
        <details class="faq-item" id="faq-${index}">
          <summary class="faq-question">
            <span>${escapeHtml(item.q)}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-answer">
            <p>${escapeHtml(item.a)}</p>
          </div>
        </details>
      `).join('');
    }
  }

  /**
   * Render about page
   */
  function renderAboutPage(data) {
    const about = data.about;
    const meta = data.meta;

    setPageTitle('About', meta.title_suffix);
    setMetaDescription('Learn about our focused, proof-based email authentication setup service.');

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = about.headline;

    const content = document.querySelector('.about-content');
    if (content) {
      content.innerHTML = `
        ${about.paragraphs ? about.paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('') : ''}
        ${createBulletList(about.bullets)}
      `;
    }
  }

  /**
   * Render contact page
   */
  function renderContactPage(data) {
    const contact = data.contact;
    const meta = data.meta;

    setPageTitle('Contact', meta.title_suffix);
    setMetaDescription('Contact us for email authentication setup questions or support.');

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = contact.headline;

    const intro = document.querySelector('.contact-intro');
    if (intro && contact.paragraphs) {
      intro.innerHTML = contact.paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('');
    }

    // Update CTAs
    document.querySelectorAll('.cta-primary').forEach(el => {
      el.href = meta.stripe_payment_link_url;
    });

    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo && contact.contact_blocks) {
      contactInfo.innerHTML = contact.contact_blocks.map(block => {
        let valueHtml = escapeHtml(block.value);
        
        // Make email a mailto link
        if (block.label.toLowerCase() === 'email' && block.value.includes('@')) {
          valueHtml = `<a href="mailto:${escapeHtml(block.value)}">${escapeHtml(block.value)}</a>`;
        }

        // Skip if placeholder
        if (block.value.startsWith('{{') && block.value.endsWith('}}')) {
          valueHtml = '<em>Not provided</em>';
        }

        return `
          <div class="contact-block">
            <span class="contact-block-label">${escapeHtml(block.label)}</span>
            <span class="contact-block-value">${valueHtml}</span>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Render legal page (privacy, terms, refund)
   */
  function renderLegalPage(data, pageKey) {
    const pageData = data[pageKey];
    const meta = data.meta;

    const pageTitles = {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      refund: 'Refund Policy'
    };

    setPageTitle(pageTitles[pageKey] || pageData.headline, meta.title_suffix);
    setMetaDescription(`${pageTitles[pageKey] || pageData.headline} for ${meta.brand_name}.`);

    const headline = document.querySelector('.page-headline');
    if (headline) headline.textContent = pageData.headline;

    const content = document.querySelector('.legal-content');
    if (content && pageData.sections) {
      content.innerHTML = pageData.sections.map(section => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs ? section.paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('') : ''}
        </section>
      `).join('');
    }
  }

  /**
   * Render confirmation page
   */
  function renderConfirmationPage(data) {
    const meta = data.meta;

    setPageTitle('Payment Received — Next Steps', meta.title_suffix);
    setMetaDescription('Payment confirmed. Next steps for your 48-hour email authentication setup.');

    // Update intake form CTAs
    const intakeFormUrl = meta.intake_form_url;
    const intakeCtaTop = document.getElementById('intake-form-cta');
    const intakeCtaBottom = document.getElementById('intake-form-cta-bottom');
    
    if (intakeCtaTop) intakeCtaTop.href = intakeFormUrl;
    if (intakeCtaBottom) intakeCtaBottom.href = intakeFormUrl;

    // Update support email link
    const supportEmailLink = document.getElementById('support-email-link');
    if (supportEmailLink) {
      supportEmailLink.href = `mailto:${meta.contact_email}`;
      supportEmailLink.textContent = meta.contact_email;
    }

    // Handle URL query parameters (sanitized display only)
    const params = getQueryParams();
    const referenceInfo = document.getElementById('reference-info');
    const referenceText = document.getElementById('reference-text');

    if (referenceInfo && referenceText) {
      const parts = [];

      // Check for session_id or reference
      const reference = params.session_id || params.reference || params.checkout_session_id;
      if (reference) {
        // Sanitize and truncate for display
        const safeRef = reference.substring(0, 64).replace(/[^a-zA-Z0-9_-]/g, '');
        if (safeRef) {
          parts.push(`Reference: ${safeRef}`);
        }
      }

      // Check for client_email (purely informational)
      if (params.client_email) {
        // Basic email validation
        const email = params.client_email;
        if (email.includes('@') && email.length < 100) {
          const clientEmailNotice = document.getElementById('client-email-notice');
          if (clientEmailNotice) {
            clientEmailNotice.style.display = 'block';
            clientEmailNotice.textContent = `We'll send updates to: ${email}`;
          }
        }
      }

      if (parts.length > 0) {
        referenceInfo.style.display = 'block';
        referenceText.textContent = parts.join(' • ');
      }
    }
  }

  /**
   * Initialize mobile navigation toggle
   */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
      });

      // Close nav when clicking outside
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /**
   * Detect current page and render appropriate content
   */
  function detectAndRenderPage(data) {
    const path = window.location.pathname
      .toLowerCase()
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '/');
    
    // Extract page name from path
    const segments = path.split('/').filter(s => s);
    const page = segments[0] || 'index';

    // Render nav and footer on all pages
    renderNav(data.nav, data.meta.brand_name);
    renderFooter(data.meta);

    // Render page-specific content
    switch (page) {
      case 'index':
        renderHomePage(data);
        break;
      case 'services':
        renderServicesPage(data);
        break;
      case 'pricing':
        renderPricingPage(data);
        break;
      case 'faq':
        renderFaqPage(data);
        break;
      case 'about':
        renderAboutPage(data);
        break;
      case 'contact':
        renderContactPage(data);
        break;
      case 'privacy':
        renderLegalPage(data, 'privacy');
        break;
      case 'terms':
        renderLegalPage(data, 'terms');
        break;
      case 'refund':
        renderLegalPage(data, 'refund');
        break;
      case 'confirmation':
        renderConfirmationPage(data);
        break;
    }
  }

  /**
   * Initialize site
   */
  async function init() {
    initMobileNav();

    const data = await loadSiteData();
    if (data) {
      // Process all placeholders
      const processedData = processPlaceholders(data, data.meta);
      detectAndRenderPage(processedData);
      document.body.classList.remove('loading');
    } else {
      // Fallback: show static content
      document.body.classList.remove('loading');
      console.warn('Using fallback content');
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
