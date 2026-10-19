document.addEventListener('DOMContentLoaded', () => {
  const analyticsReady = typeof window.gtag === 'function';

  function trackEvent(name, params = {}) {
    if (!analyticsReady) return;
    window.gtag('event', name, params);
  }

  if (analyticsReady) {
    const pageLocation = window.location.href;
    const pageTitle = document.title || 'NovaFlow';
    window.gtag('event', 'page_view', {
      page_location: pageLocation,
      page_title: pageTitle,
      page_referrer: document.referrer || '(direct)'
    });
  }

  document.querySelectorAll('[data-ga-event]').forEach((button) => {
    button.addEventListener('click', () => {
      const eventName = button.dataset.gaEvent || 'click_cta';
      const data = {
        button_location: button.dataset.gaLocation || 'site',
        content_name: button.dataset.gaName || button.textContent.trim() || 'cta',
        page_location: window.location.href,
        page_title: document.title
      };
      trackEvent(eventName, data);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('select_content', {
        content_type: 'section',
        content_name: link.getAttribute('href').replace('#', '') || 'section'
      });
    });
  });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  const billingToggleButtons = document.querySelectorAll('[data-billing]');
  billingToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const period = button.dataset.billing;
      billingToggleButtons.forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('[data-price-monthly]').forEach((node) => {
        const monthly = node.dataset.priceMonthly;
        const annual = node.dataset.priceAnnual;
        node.textContent = period === 'annual' ? `$${annual}` : `$${monthly}`;
      });
      document.querySelectorAll('[data-billing-label]').forEach((label) => {
        label.textContent = period === 'annual' ? '/mo billed yearly' : '/mo';
      });
      trackEvent('select_item', {
        item_list_name: 'pricing',
        item_name: 'billing_toggle',
        billing_period: period
      });
    });
  });

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = contactForm.querySelector('.form-status');
      const name = contactForm.querySelector('#name')?.value?.trim();
      const email = contactForm.querySelector('#email')?.value?.trim();
      if (!name || !email) {
        status.textContent = 'Please complete your name and email.';
        status.classList.add('error');
        return;
      }
      status.classList.remove('error');
      status.textContent = 'Thanks — your note has been received. We will reply within 1 business day.';
      contactForm.reset();
      trackEvent('generate_lead', {
        form_type: 'contact',
        page_location: window.location.href,
        content_name: 'contact_form'
      });
    });
  }

  const newsletterForm = document.querySelector('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = newsletterForm.querySelector('.form-status');
      const email = newsletterForm.querySelector('#newsletter-email')?.value?.trim();
      if (!email || !email.includes('@')) {
        status.textContent = 'Enter a valid email to subscribe.';
        status.classList.add('error');
        return;
      }
      status.classList.remove('error');
      status.textContent = 'Subscribed successfully — the next update is on its way.';
      newsletterForm.reset();
      trackEvent('newsletter_signup', {
        form_type: 'newsletter',
        page_location: window.location.href,
        content_name: 'newsletter_form'
      });
    });
  }

  const demoForms = document.querySelectorAll('[data-demo-form]');
  demoForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      const email = form.querySelector('input[type="email"]')?.value?.trim();
      const password = form.querySelector('input[type="password"]')?.value || '';
      if (!email || !password) {
        status.textContent = 'Complete the required fields to continue.';
        status.classList.add('error');
        return;
      }
      status.classList.remove('error');
      status.textContent = 'Demo mode is active. Connect your real auth provider to turn this into a live sign-in flow.';
      trackEvent(form.dataset.demoForm === 'signup' ? 'sign_up' : 'login', {
        form_type: form.dataset.demoForm,
        page_location: window.location.href,
        content_name: form.dataset.demoForm
      });
    });
  });

  const pricingButtons = document.querySelectorAll('[data-plan]');
  pricingButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const plan = button.dataset.plan || 'plan';
      trackEvent('begin_checkout', {
        plan_name: plan,
        page_location: window.location.href,
        button_location: 'pricing'
      });
    });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Service worker registration is optional in local preview mode.
      });
    });
  }
});
