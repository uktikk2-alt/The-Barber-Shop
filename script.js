document.addEventListener("DOMContentLoaded", () => {
  
  /**
   * 0. Content Manager: The Template Brain
   * Injects data from SITE_CONFIG into the DOM.
   */
  class ContentManager {
    constructor() {
      // SAFE INIT: Poll for config if not immediately ready (Sync Issue Fix)
      const tryInit = () => {
        this.config = window.SITE_CONFIG;
        if (this.config) {
          this.init();
        } else {
          console.warn("SITE_CONFIG not ready, polling...");
          setTimeout(tryInit, 50);
        }
      };
      tryInit();
    }

    init() {
      this.injectBranding();
      this.injectHero();
      this.injectServices();
      this.injectExtraServices();
      this.injectGallery();
      this.injectTeam();
      this.injectReviews();
      this.injectIntegrations();
      this.updateDynamicStyles();
      
      // Zero-Shift Refresh: Fix AOS tracking after injection
      if (window.AOS) {
        setTimeout(() => AOS.refresh(), 100);
      }

      // Cinematic Reveal: Fire GSAP after content is locked
      if (typeof initiateReveal === 'function') initiateReveal();
      
      // Initialize Gallery Interactions
      this.initGalleryInteractions();
    }

    injectBranding() {
      // Business Name & Title
      document.title = `${this.config.branding.businessName} - ${this.config.branding.tagline}`;
      const businessNameEls = document.querySelectorAll('.js-config-business-name');
      businessNameEls.forEach(el => el.textContent = this.config.branding.businessName);

      // Logos
      const whiteLogos = document.querySelectorAll('.js-config-logo-white');
      whiteLogos.forEach(el => el.src = this.config.branding.logoWhite);
      const colorLogos = document.querySelectorAll('.js-config-logo-color');
      colorLogos.forEach(el => el.src = this.config.branding.logoColor);

      // Contact Info
      const phoneEls = document.querySelectorAll('.js-config-phone');
      phoneEls.forEach(el => el.textContent = this.config.contact.phone);
      
      const phoneLinks = document.querySelectorAll('.js-config-phone-link');
      phoneLinks.forEach(el => el.href = `tel:${this.config.contact.phoneNumeric}`);

      const emailEls = document.querySelectorAll('.js-config-email');
      emailEls.forEach(el => el.textContent = this.config.contact.email || "info@example.com");

      const emailLinks = document.querySelectorAll('.js-config-email-link');
      emailLinks.forEach(el => el.href = `mailto:${this.config.contact.email || "info@example.com"}`);

      const locationEls = document.querySelectorAll('.js-config-location');
      locationEls.forEach(el => el.textContent = this.config.contact.location);

      const mapsLinks = document.querySelectorAll('.js-config-maps-link');
      mapsLinks.forEach(el => el.href = this.config.contact.googleMapsUrl);

      // Footer
      const footerDesc = document.querySelector('.js-config-footer-desc');
      if (footerDesc) footerDesc.textContent = this.config.branding.tagline + ". Professional care for your vehicle.";
      
      const yearEls = document.querySelectorAll('.js-config-year');
      yearEls.forEach(el => el.textContent = new Date().getFullYear());
    }

    injectHero() {
      // Badge
      const badge = document.querySelector('.js-config-hero-badge');
      if (badge) badge.textContent = this.config.hero.badge;

      // Subtitle
      const subtitle = document.querySelector('.js-config-hero-subtitle');
      if (subtitle) subtitle.textContent = this.config.hero.subtitle;

      // Title Characters (Stagger Animation)
      const titleContainer = document.querySelector('.js-config-hero-title');
      if (titleContainer) {
        let charIndex = 1;
        titleContainer.innerHTML = ''; // Clear placeholders
        
        this.config.hero.titleWords.forEach(word => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word';
          // Final Flicker-Kill Logic: Unique anchor for delayed reveal
          const isHighlight = word.toUpperCase().includes(this.config.hero.highlightWord.toUpperCase());
          if (isHighlight) {
            wordSpan.classList.add('accent-anchor-active');
          }
          
          word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.style.setProperty('--i', charIndex++);
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
          });

          // Definitive Fix: Inject REAL element for the underline to prevent flicker/hiding
          if (isHighlight) {
            const underline = document.createElement('span');
            underline.className = 'accent-line-svg';
            wordSpan.appendChild(underline);
          }
          
          titleContainer.appendChild(wordSpan);
          titleContainer.appendChild(document.createTextNode(' '));
        });

        // 3.0s Delay: Fade in the red underline after UI stabilizes
        setTimeout(() => {
          const underlines = document.querySelectorAll('.accent-line-svg');
          underlines.forEach(u => {
            u.style.display = 'block'; // Force layout first
            setTimeout(() => u.classList.add('active'), 10); // Trigger transition next frame
          });
        }, 3000);
      }
    }

    injectServices() {
      const grid = document.getElementById('main-services-grid');
      if (!grid) return;

      grid.innerHTML = this.config.services.map((service, index) => `
        <div class="service-card" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="service-card-img">
            <img src="${service.image}" alt="${service.title}" loading="lazy" decoding="async">
          </div>
          <div class="service-card-content">
            <span class="sc-number">${(index + 1).toString().padStart(2, '0')}</span>
            <h3 class="sc-title">${service.title}</h3>
            <p class="sc-desc">${service.description}</p>
            <a href="${this.config.contact.bookingUrl}" class="sc-btn">BOOK NOW</a>
          </div>
        </div>
      `).join('');

      // Handle Toggle Visibility
      if (this.config.options.showServicesToggle) {
        grid.classList.add('collapsed');
      } else {
        grid.classList.remove('collapsed');
        const toggleWrap = grid.parentElement.querySelector('.services-toggle-wrap');
        if (toggleWrap) toggleWrap.style.display = 'none';
      }
    }

    injectExtraServices() {
      const grid = document.getElementById('extra-services-grid');
      if (!grid || !this.config.extraServices) return;

      grid.innerHTML = this.config.extraServices.map((service, index) => `
        <div class="service-card ${index === 1 ? 'featured' : ''}" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="service-card-img">
            <img src="${service.image}" alt="${service.title}" loading="lazy" decoding="async">
          </div>
          <div class="service-card-content">
            <span class="sc-number">${(index + 1).toString().padStart(2, '0')}</span>
            <h3 class="sc-title">${service.title}</h3>
            <p class="sc-desc">${service.description}</p>
            <a href="${this.config.contact.bookingUrl}" class="sc-btn">BOOK NOW</a>
          </div>
        </div>
      `).join('');
    }

    injectGallery() {
      const gallery = document.getElementById('gallery-container');
      if (!gallery || !this.config.gallery) return;

      gallery.innerHTML = this.config.gallery.map((item, index) => `
        <div class="gallery-item" data-category="${item.category}" data-aos="fade-up" data-aos-delay="${index * 100}">
          <img src="${item.image}" loading="lazy" alt="Scuderia Detail" decoding="async" class="gallery-image">
        </div>
      `).join('');
      
      // Re-trigger AOS to pick up new elements
      if (window.AOS) AOS.refresh();
    }

    initGalleryInteractions() {
      const slider = document.getElementById('gallery-container');
      if (!slider) return;

      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
      });

      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
      });

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
      });
    }

    injectReviews() {
      const track = document.querySelector('.track-1');
      if (!track) return;

      const reviewHtml = this.config.reviews.map(review => `
        <div class="review-card-clean">
          <i class="fa-solid fa-quote-left quote-icon"></i>
          <p>"${review.quote}"</p>
          <div class="reviewer-meta">
            <img src="${review.avatar}" alt="${review.name}">
            <div class="meta-text">
              <h5>${review.name}</h5>
              <span>${review.role}</span>
            </div>
          </div>
        </div>
      `).join('');

      // Duplicate for seamless loop
      track.innerHTML = reviewHtml + reviewHtml;
    }

    injectTeam() {
      const grid = document.querySelector('.team-grid');
      if (!grid || !this.config.team) return;

      // Skip injection if manually hardcoded to prevent layout shift
      if (grid.children.length > 0) return;

      grid.innerHTML = this.config.team.map((member, index) => `
        <div class="team-card" data-aos="fade-up" data-aos-delay="${100 + (index * 120)}">
          <div class="team-card-img-wrap">
            <img src="${member.image}" alt="${member.name}" loading="lazy" decoding="async">
            <div class="team-phone-badge">
              <i class="fa-solid fa-phone"></i>
              <span>${member.phone}</span>
            </div>
          </div>
          <div class="team-card-info">
            <h3 class="team-name">${member.name}</h3>
            <span class="team-role">${member.role}</span>
          </div>
        </div>
      `).join('');
    }

    injectIntegrations() {
      const leadForm = document.getElementById('lead-form');
      if (leadForm) {
        const select = leadForm.querySelector('select');
        if (select) {
          select.innerHTML = '<option value="" disabled selected>--- Select Choice ---</option>' + 
            this.config.services.map(s => `<option value="${s.id}">${s.title}</option>`).join('');
        }
      }
    }

    updateDynamicStyles() {
      // Set the CSS Primary color globally
      document.documentElement.style.setProperty('--primary', this.config.branding.colors.primary);
    }
  }

  // Initialize Template Engine immediately
  const contentManager = new ContentManager();

  /**
   * 1. Progressive Script Injector
   */
  let scriptsLoaded = false;
  const loadDeferredScripts = () => {
    if (scriptsLoaded) return;
    scriptsLoaded = true;

    // Load integration scripts using config IDs if available
    const ghlId = window.SITE_CONFIG?.integrations?.ghlChatWidgetId;
    if (ghlId) {
      const ghlScript = document.createElement("script");
      ghlScript.src = "https://widgets.leadconnectorhq.com/loader.js";
      ghlScript.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
      ghlScript.dataset.widgetId = ghlId;
      ghlScript.dataset.hideLauncher = "true";
      ghlScript.defer = true;
      document.body.appendChild(ghlScript);
    }

    // Load AI Agent Brain & Styling
    const aiStyles = document.createElement("link");
    aiStyles.rel = "stylesheet";
    aiStyles.href = "ai-agent.css";
    document.head.appendChild(aiStyles);

    const kbScript = document.createElement("script");
    kbScript.src = "knowledge-base.js";
    kbScript.defer = true;
    document.body.appendChild(kbScript);

    const aiScript = document.createElement("script");
    aiScript.src = "ai-agent.js";
    aiScript.defer = true;
    document.body.appendChild(aiScript);

    // Clean up listeners
    ["mousemove", "scroll", "touchstart", "keydown"].forEach(evt => {
      window.removeEventListener(evt, triggerDeferredLoading);
    });
  };

  const triggerDeferredLoading = () => requestIdleCallback(() => loadDeferredScripts());

  ["mousemove", "scroll", "touchstart", "keydown"].forEach(evt => {
    window.addEventListener(evt, triggerDeferredLoading, { passive: true, once: true });
  });
  setTimeout(loadDeferredScripts, 5000);

  // 1. Initialize AOS (Refresh after dynamic injection)
  AOS.init({ once: true, offset: 50, duration: 600, easing: 'ease-out-cubic' });

  // 2. Navigation & Sticky Logic
  const sections = document.querySelectorAll("section[id], body[id]");
  const navLinks = document.querySelectorAll(".nav ul li a");
  const header = document.querySelector(".header");
  let sectionOffsets = [];

  const calculateOffsets = () => {
    sectionOffsets = Array.from(sections).map(section => ({
      id: section.getAttribute("id"),
      offset: section.offsetTop - 250
    }));
  };
  calculateOffsets();
  window.addEventListener('resize', calculateOffsets, { passive: true });

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    if (scrollPos > 120) header.classList.add("sticky");
    else if (scrollPos < 60) header.classList.remove("sticky");

    let current = "";
    for (const sec of sectionOffsets) if (scrollPos >= sec.offset) current = sec.id;
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
    });
  }, { passive: true });

  // 3. Mobile Menu
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
      header.classList.toggle("menu-open");
    });
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        mainNav.classList.remove("active");
        header.classList.remove("menu-open");
      });
    });
  }

  // 4. Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth"
        });
      }
    });
  });

  /**
   * 10. Accelerated Hero Canvas Engine
   * Fixes the 4-5s delay by using a "Critical Buffer" approach.
   */
  class HeroCanvasManager {
    constructor() {
      this.canvas = document.getElementById("hero-canvas");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
      this.frames = [];
      this.isDestroyed = false;
      this.frameIndex = 0;
      this.lastTime = 0;
      this.isPlaying = false;
      this.mediaQuery = window.matchMedia('(max-width: 768px)');
      this.init();
    }

    async init() {
      const isMobile = this.mediaQuery.matches;
      this.config = isMobile ? {
        folder: 'hero-mobile-seq', frameCount: 153, suffix: 'delay-0.033s', fps: 33, ext: 'jpg'
      } : {
        folder: 'hero-desktop-seq', frameCount: 215, suffix: 'delay-0.033s', fps: 33, loop: true, ext: 'webp'
      };
      
      this.mediaQuery.addEventListener('change', () => { this.destroy(); new HeroCanvasManager(); }, { once: true });
      
      // Accelerated Load: Wait only for first 10 frames
      await this.loadBuffer(10);
      
      // Delay Start: Allow UI elements to settle (Fixes mobile choppiness)
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.canvas.style.opacity = '1';
        this.setupObserver();
        this.loadRemaining(10);
      }, 2000);
    }

    async loadBuffer(count) {
      const batch = [];
      for (let i = 0; i < Math.min(count, this.config.frameCount); i++) {
        batch.push(this.loadFrame(i));
      }
      await Promise.all(batch);
      
      // Load remaining in background
      setTimeout(() => this.loadRemaining(count), 100);
    }

    async loadFrame(index) {
      const img = new Image();
      img.src = `assets/${this.config.folder}/frame_${index.toString().padStart(3, '0')}_${this.config.suffix}.${this.config.ext}`;
      try {
        await img.decode();
        if (index === 0) {
          this.canvas.width = img.naturalWidth;
          this.canvas.height = img.naturalHeight;
        }
        this.frames[index] = img;
      } catch (e) { /* skip */ }
    }

    async loadRemaining(start) {
      const batchSize = 10;
      for (let i = start; i < this.config.frameCount; i += batchSize) {
        if (this.isDestroyed) break;
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, this.config.frameCount); j++) {
          batch.push(this.loadFrame(j));
        }
        await Promise.all(batch);
      }
    }

    render = (time) => {
      if (!this.isPlaying || this.isDestroyed) return;
      requestAnimationFrame(this.render);
      if (!this.lastTime) this.lastTime = time;
      if (time - this.lastTime >= this.config.fps) {
        const img = this.frames[this.frameIndex];
        if (img) {
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
          this.frameIndex = (this.frameIndex + 1) % this.config.frameCount;
          if (this.frameIndex === 0 && !this.config.loop) this.isPlaying = false;
        }
        this.lastTime = time;
      }
    }

    setupObserver() {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          this.isPlaying = e.isIntersecting;
          if (this.isPlaying) requestAnimationFrame(this.render);
        });
      }, { threshold: 0.1 });
      obs.observe(document.querySelector('.hero'));
      this.observer = obs;
    }

    destroy() {
      this.isDestroyed = true;
      if (this.observer) this.observer.disconnect();
      this.frames = [];
    }
  }

  new HeroCanvasManager();

  // 11. Estimator Logic
  const updateEstimator = () => {
    const serviceKey = document.querySelector('#service-choices .active')?.dataset.service;
    const sizeKey = document.querySelector('#size-choices .active')?.dataset.size;
    const service = window.SITE_CONFIG.services.find(s => s.id === (serviceKey || 'exterior-wash')) || window.SITE_CONFIG.services[0];
    const prices = { small: 1, medium: 1.15, large: 1.42, commercial: 1.7 };
    const base = parseInt(service.price.replace(/\D/g, ''));
    const total = Math.round(base * (prices[sizeKey] || 1));
    
    gsap.to('#total-price', {
      innerHTML: total, duration: 0.6, snap: { innerHTML: 1 },
      onUpdate: function() { 
        document.getElementById('total-price').innerHTML = (window.SITE_CONFIG.options.currencySymbol || '£') + Math.ceil(this.targets()[0].innerHTML); 
      }
    });
    document.getElementById('price-summary').textContent = `${service.title} - ${sizeKey || 'Small'} vehicle`;
  };

  document.querySelectorAll('.choice-item').forEach(item => {
    item.addEventListener('click', () => {
      item.parentElement.querySelectorAll('.choice-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      updateEstimator();
    });
  });

  // GSAP Reveal (Moved up for scope visibility if needed)
  function initiateReveal() {
    gsap.utils.toArray('.reveal-wrapper').forEach(wrapper => {
      const inner = wrapper.querySelector('.reveal-inner');
      if (inner) {
        gsap.fromTo(inner, { y: "150%" }, {
          y: "0%", duration: 1.0, ease: "power3.out",
          scrollTrigger: { trigger: wrapper, start: "top 90%" }
        });
      }
    });

    const heroTl = gsap.timeline();
    const targets = ['.js-config-hero-badge', '.hero-title .char', '.hero-reviews-badge', '.hero-desc', '.hero-btns'];
    gsap.set(targets, { visibility: 'visible', opacity: 0 });
    heroTl.fromTo('.hero-title .char', 
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.03, ease: "power3.out" }
    ).fromTo(['.js-config-hero-badge', '.hero-reviews-badge', '.hero-desc', '.hero-btns'], 
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2 }, "-=0.6"
    );
  }

  // 14. Services Toggle
  document.querySelectorAll('.btn-toggle-services').forEach(btn => {
    btn.addEventListener('click', () => {
      const grid = document.getElementById(btn.dataset.target);
      const isCollapsed = grid.classList.toggle('collapsed');
      btn.innerHTML = isCollapsed ? 'See all services <i class="fa-solid fa-chevron-down"></i>' : 'Show less <i class="fa-solid fa-chevron-up"></i>';
      AOS.refresh();
      if (isCollapsed) window.scrollTo({ top: grid.parentElement.offsetTop - 100, behavior: 'smooth' });
    });
  });

  // 15. Magnetic Buttons
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const pos = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - pos.left - pos.width / 2) * 0.3, y: (e.clientY - pos.top - pos.height / 2) * 0.3, duration: 0.5 });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 1.0, ease: "elastic.out(1, 0.3)" }));
  });
});
