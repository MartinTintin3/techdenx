# Email Authentication + Bulk-Sender Compliance Setup Website

A static marketing website for a 48-hour email authentication (SPF/DKIM/DMARC) and bulk-sender compliance setup service.

## Project Structure

```
static/
├── index.html                 # Home page
├── services/index.html        # Services overview
├── pricing/index.html         # Pricing with payment CTA
├── faq/index.html             # FAQ accordion
├── about/index.html           # About the service
├── contact/index.html         # Contact information
├── confirmation/index.html    # Post-payment confirmation page
├── privacy/index.html         # Privacy Policy
├── terms/index.html           # Terms of Service
├── refund/index.html          # Refund Policy
├── assets/
│   ├── styles.css             # Main stylesheet
│   └── site.js                # JavaScript (content loading, nav, accordion)
├── content/
│   └── site_copy.json         # All site copy with placeholders
└── README.md                  # This file
```

## Setup Instructions

### 1. Edit Placeholders in `content/site_copy.json`

Replace these placeholder values with your actual information:

| Placeholder | Description |
|-------------|-------------|
| `{{STRIPE_PAYMENT_LINK_URL}}` | Stripe Payment Link URL for $199 payment |
| `{{INTAKE_FORM_URL}}` | URL to your intake form (Google Form, Typeform, etc.) |

The following are already configured but can be changed:
- `brand_name`: TechDenX
- `domain`: techdenx.com
- `contact_email`: support@techdenx.com
- `location`: Boston, MA

### 2. Create Your Stripe Payment Link

1. Go to [Stripe Dashboard → Payment Links](https://dashboard.stripe.com/payment-links)
2. Create a new payment link for $199
3. **Important:** Set the confirmation redirect URL:
   ```
   https://techdenx.com/confirmation/
   ```
4. Copy the Payment Link URL and replace `{{STRIPE_PAYMENT_LINK_URL}}` in `site_copy.json`

### 3. Create Your Intake Form

Create a form (Google Forms, Typeform, Tally, etc.) that collects:
- Client name and email
- Sending domain(s)
- Email platform/ESP used
- DNS provider
- Preferred DNS access method
- Any current authentication issues

Copy the form URL and replace `{{INTAKE_FORM_URL}}` in `site_copy.json`

---

## Stripe Payment Link Configuration

After creating your Stripe Payment Link, you **must** configure the redirect URL:

### Redirect URL to paste in Stripe:
```
https://techdenx.com/confirmation/
```

### Steps in Stripe Dashboard:
1. Go to **Payment Links** in your Stripe Dashboard
2. Click on your $199 payment link
3. Click **Edit**
4. Scroll to **After payment**
5. Select **Redirect customers to your website**
6. Paste: `https://techdenx.com/confirmation/`
7. Save changes

### Optional: Pass customer email to confirmation page
In the redirect URL, you can add query parameters:
```
https://techdenx.com/confirmation/?client_email={CHECKOUT_SESSION_CUSTOMER_EMAIL}
```

The confirmation page will display informational messages from URL parameters:
- `session_id` or `checkout_session_id` — displayed as "Reference: ..."
- `client_email` — displayed as "We'll send updates to: ..."

---

## Deploy to Cloudflare Pages

### Option A: Direct Upload

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click **Create a project** → **Direct Upload**
3. Name your project
4. Drag and drop your entire project folder
5. Click **Deploy**

### Option B: Git Integration

1. Push this repo to GitHub or GitLab
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (root)
6. Click **Deploy**

### Custom Domain (Cloudflare)

1. In your Pages project, go to **Custom domains**
2. Add your domain
3. Follow DNS setup instructions

---

## Deploy to GitHub Pages

### Option A: From Repository Settings

1. Push this repo to GitHub
2. Go to **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**
6. Your site will be at `https://yourusername.github.io/repo-name/`

### Option B: With Custom Domain

1. Complete Option A above
2. In **Settings** → **Pages**, add your custom domain
3. Add a `CNAME` file to your repo root containing your domain:
   ```
   techdenx.com
   ```
4. Configure DNS:
   - For apex domain: Add `A` records pointing to GitHub's IPs
   - For subdomain: Add `CNAME` record pointing to `yourusername.github.io`

See [GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for current IP addresses.

---

## Local Development

To test locally, use any static file server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Features

- **Static HTML/CSS/JS** — No build step required
- **Clean URLs** — Directory-based structure (e.g., `/pricing/` not `/pricing.html`)
- **Runtime content loading** — Fetches `site_copy.json` and renders content dynamically
- **Graceful fallback** — Shows static content if JavaScript is disabled
- **Post-payment confirmation page** — Stripe redirect with next steps
- **Mobile-first responsive design**
- **Accessible** — Semantic HTML, skip links, ARIA labels
- **SEO-ready** — Meta descriptions, proper heading structure
- **FAQ accordion** — Vanilla JS, no dependencies
- **No trackers** — No external scripts or analytics

---

## Customization

### Styling

Edit `assets/styles.css` to customize:
- Colors (CSS variables at top)
- Typography
- Spacing
- Component styles

### Content

All text content is in `content/site_copy.json`. Edit this file to change:
- Headlines and copy
- Service descriptions
- FAQ items
- Legal policy text

---

## Compliance Notes

This site includes:
- ✅ Privacy Policy
- ✅ Terms of Service  
- ✅ Refund Policy
- ✅ "No spam" notice in footer and confirmation page
- ✅ No inbox placement guarantees (legal protection)
- ✅ Legitimate sender acknowledgment on confirmation page

Review all legal pages and customize for your jurisdiction before launching.

---

## License

This project is provided as-is for your business use.
