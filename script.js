document.addEventListener('DOMContentLoaded', () => {
  const analyticsReady = typeof window.gtag === 'function';

  const AUTH_KEYS = {
    users: 'novaflow_users',
    session: 'novaflow_session'
  };

  function trackEvent(name, params = {}) {
    if (!analyticsReady) return;
    window.gtag('event', name, params);
  }

  function safeParse(value, fallback) {
    try {
      const parsed = JSON.parse(value ?? 'null');
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getUsers() {
    const users = safeParse(localStorage.getItem(AUTH_KEYS.users), []);
    return Array.isArray(users) ? users : [];
  }

  function saveUsers(users) {
    localStorage.setItem(AUTH_KEYS.users, JSON.stringify(users));
  }

  function getCurrentUser() {
    const user = safeParse(localStorage.getItem(AUTH_KEYS.session), null);
    return user && user.email ? user : null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(AUTH_KEYS.session, JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));
  }

  function clearCurrentUser() {
    localStorage.removeItem(AUTH_KEYS.session);
  }

  function setFormStatus(form, message, type = 'info') {
    const status = form.querySelector('.form-status');
    if (!status) return;
    status.classList.remove('error', 'success');
    if (type === 'error') {
      status.classList.add('error');
    }
    if (type === 'success') {
      status.classList.add('success');
    }
    status.textContent = message;
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

  const signupForm = document.querySelector('[data-demo-form="signup"]');
  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formName = signupForm.querySelector('#signup-name')?.value?.trim();
      const email = signupForm.querySelector('#signup-email')?.value?.trim();
      const password = signupForm.querySelector('#signup-password')?.value || '';

      if (!formName || !email || !password) {
        setFormStatus(signupForm, 'Complete all fields to create your account.', 'error');
        return;
      }

      if (password.length < 6) {
        setFormStatus(signupForm, 'Choose a password with at least 6 characters.', 'error');
        return;
      }

      const normalizedEmail = email.toLowerCase();
      const users = getUsers();
      const userExists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

      if (userExists) {
        setFormStatus(signupForm, 'An account with this email already exists. Please sign in instead.', 'error');
        return;
      }

      const user = {
        id: `user_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        name: formName,
        email: normalizedEmail,
        password
      };

      users.push(user);
      saveUsers(users);
      setCurrentUser(user);
      setFormStatus(signupForm, 'Account created successfully! Redirecting to your dashboard...', 'success');

      trackEvent('sign_up', {
        form_type: 'signup',
        page_location: window.location.href,
        content_name: 'signup_form'
      });

      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 400);
    });
  }

  const loginForm = document.querySelector('[data-demo-form="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = loginForm.querySelector('#login-email')?.value?.trim();
      const password = loginForm.querySelector('#login-password')?.value || '';

      if (!email || !password) {
        setFormStatus(loginForm, 'Enter your email and password to continue.', 'error');
        return;
      }

      const users = getUsers();
      const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        setFormStatus(loginForm, 'Incorrect email or password. Please try again.', 'error');
        return;
      }

      setCurrentUser(user);
      setFormStatus(loginForm, 'Welcome back! Redirecting to your dashboard...', 'success');

      trackEvent('login', {
        form_type: 'login',
        page_location: window.location.href,
        content_name: 'login_form'
      });

      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 400);
    });
  }

  const currentUser = getCurrentUser();
  const authState = document.querySelector('[data-auth-state]');
  if (authState && currentUser) {
    authState.textContent = `Signed in as ${currentUser.name}`;
  }

  const dashboardName = document.querySelector('#dashboard-name');
  if (dashboardName) {
    if (!currentUser) {
      window.location.href = './signin.html';
      return;
    }

    dashboardName.textContent = currentUser.name.split(' ')[0];
  }

  const logoutButton = document.querySelector('[data-action="logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = './signin.html';
    });
  }

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
