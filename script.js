document.addEventListener("DOMContentLoaded", () => {
  
  /**
   * 0. Progressive Script Injector (FCP 90+ Score Optimization)
   * Defer non-critical third-party widgets until first interaction.
   */
  let scriptsLoaded = false;
  const loadDeferredScripts = () => {
    if (scriptsLoaded) return;
    scriptsLoaded = true;

    // 1. LeadConnector / GHL Launcher
    const ghlScript = document.createElement("script");
    ghlScript.src = "https://widgets.leadconnectorhq.com/loader.js";
    ghlScript.dataset.resourcesUrl = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";
    ghlScript.dataset.widgetId = "69de59fb2676eaf85eb99f86";
    ghlScript.dataset.hideLauncher = "true";
    ghlScript.defer = true;
    document.body.appendChild(ghlScript);

    // 2. AI Agent Knowledge Base
    const kbScript = document.createElement("script");
    kbScript.src = "knowledge-base.js";
    kbScript.defer = true;
    document.body.appendChild(kbScript);

    // 3. AI Agent Core
    const aiScript = document.createElement("script");
    aiScript.src = "ai-agent.js";
    aiScript.defer = true;
    document.body.appendChild(aiScript);

    // Clean up listeners
    ["mousemove", "scroll", "touchstart", "keydown"].forEach(evt => {
      window.removeEventListener(evt, triggerDeferredLoading);
    });
    console.log("Deferred scripts initialized on interaction.");
  };

  const triggerDeferredLoading = () => {
    // Small delay to ensure interaction is settled
    requestIdleCallback(() => loadDeferredScripts());
  };

  // Add listeners for any user interaction
  ["mousemove", "scroll", "touchstart", "keydown"].forEach(evt => {
    window.addEventListener(evt, triggerDeferredLoading, { passive: true, once: true });
  });

  // Fallback: Load anyway after 5 seconds of total inactivity
  setTimeout(loadDeferredScripts, 5000);


  // 1. Initialize AOS Animation Library
  AOS.init({
    once: true, 
    offset: 50,
    duration: 600,
    easing: 'ease-out-cubic',
    disable: false 
  });

  // Global Scroll State & Offsets to prevent Layout Thrashing
  let sectionOffsets = [];
  const sections = document.querySelectorAll("section[id], body[id]");
  const navLinks = document.querySelectorAll(".nav ul li a");
  const header = document.querySelector(".header");

  const calculateOffsets = () => {
    sectionOffsets = Array.from(sections).map(section => ({
      id: section.getAttribute("id"),
      offset: section.offsetTop - 250
    }));
  };
  calculateOffsets();
  window.addEventListener('resize', () => {
    calculateOffsets();
    ScrollTrigger.refresh();
  }, { passive: true });

  // 2. Standard Native Scroll Engine
  window.addEventListener('scroll', () => {
    handleScroll(window.scrollY);
  }, { passive: true });

  const handleScroll = (scrollPos) => {
    // Sticky Header Logic with Hysteresis (Buffer Zone)
    const stickyEnter = 120;
    const stickyLeave = 60;
    
    if (!header.classList.contains("sticky") && scrollPos > stickyEnter) {
      header.classList.add("sticky");
    } else if (header.classList.contains("sticky") && scrollPos < stickyLeave) {
      header.classList.remove("sticky");
    }

    // Active Navigation Highlight Logic
    let current = "";
    for (const sec of sectionOffsets) {
      if (scrollPos >= sec.offset) {
        current = sec.id;
      }
    }

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  };

  // Immediate execution of scroll handler to prevent header jumps on load
  handleScroll(window.scrollY);

  // 3. Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");
  if(mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
      header.classList.toggle("menu-open");
    });
    // Close menu when a link is clicked
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        mainNav.classList.remove("active");
        header.classList.remove("menu-open");
      });
    });
  }

  // 4. Smooth scrolling for anchor links using Native Browser Spec
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
      }
    });
  });

  // 5. GALLERY: Staggered Intersection Observer Bottom Reveal
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (galleryItems.length > 0) {
    const galleryObserver = new IntersectionObserver((entries, observer) => {
      // Only trigger when the gallery section first enters view
      const visibleEntries = entries.filter(e => e.isIntersecting);
      if (visibleEntries.length === 0) return;

      // Stagger: each image animates 250ms after the last
      galleryItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 250);
      });

      // Only trigger once — unobserve the gallery section after firing
      observer.disconnect();
    }, {
      rootMargin: '0px 0px -100px 0px', // Fire 100px before gallery comes into view
      threshold: 0
    });

    // Observe the gallery section, not individual images
    const gallerySection = document.getElementById('gallery-container');
    if (gallerySection) galleryObserver.observe(gallerySection);
  }

  // 6. Services Grid Visual Enhancements (Currently handled via CSS)
  // No JS required for the Color Reveal effect as it is pure CSS.
  // Add mobile touch support
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('touchstart', function() {
      serviceCards.forEach(c => c.classList.remove('touch-active'));
      this.classList.add('touch-active');
    }, {passive: true});
  });


  // 8. GSAP Insane Counter Animation
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const targetValue = parseInt(counter.getAttribute('data-target'));
    
    // Animate the object from {val: 0} to {val: targetValue}
    gsap.to(counter, {
      scrollTrigger: {
        trigger: counter,
        start: "top 85%", // Animation starts when top of counter hits 85% of viewport height
        toggleActions: "restart none none reverse" // Replay animation when scrolling back
      },
      innerHTML: targetValue,
      duration: 2.5,
      ease: "power4.out", // Very fast start, slow down heavily at end for premium feel
      snap: { innerHTML: 1 }, // Round completely without decimals
      onUpdate: function() {
        // Manually format if needed, though snap does the basic rounding
        counter.innerHTML = Math.ceil(this.targets()[0].innerHTML);
      }
    });

    // Add extra bounce/scaling effect to the container 
    gsap.from(counter.parentElement, {
      scrollTrigger: {
        trigger: counter,
        start: "top 85%",
        toggleActions: "restart none none reverse"
      },
      y: 50,
      opacity: 0,
      scale: 0.5,
      duration: 1,
      ease: "back.out(1.7)"
    });
  });
  // 9. Individual Feature Card Color Flip on Scroll
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach(card => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 60%", // Toggles when the individual card enters the view center
      onEnter: () => card.classList.add("is-black"),
      onLeaveBack: () => card.classList.remove("is-black")
    });
  });
    /**
   * 10. Robust Hero Canvas Engine (High Performance / Memory Safe)
   * Implements strict matchMedia context selection, Image.decode() pixel pre-warming,
   * and proactive memory-flushing upon device breakpoint change.
   */
  class HeroCanvasManager {
    constructor() {
      this.canvas = document.getElementById("hero-canvas");
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
      this.frames = [];
      this.frameCount = 0;
      this.frameIndex = 0;
      this.lastTime = 0;
      this.isPlaying = false;
      this.animationId = null;
      this.isDestroyed = false;
      this.isMobile = false;
      this.config = null;
      
      // Strict Breakpoint Listener
      this.mediaQuery = window.matchMedia('(max-width: 768px)');
      this.setupMobileCheck = (e) => this.handleBreakpointChange(e.matches);
      
      this.init();
    }

    async init() {
      this.isMobile = this.mediaQuery.matches;
      this.config = this.isMobile ? {
        folder: 'hero-mobile-seq',
        frameCount: 123,
        suffix: 'delay-0.041s',
        loop: false,
        fps: 41
      } : {
        folder: 'hero-desktop-seq',
        frameCount: 215,
        suffix: 'delay-0.033s',
        loop: true,
        fps: 33
      };
      
      this.frameCount = this.config.frameCount;
      this.mediaQuery.addEventListener('change', this.setupMobileCheck);
      
      // Start loading background frames
      await this.loadSequence();
      
      // Observer logic integrated into the manager
      this.setupObserver();
    }

    async loadSequence() {
      const folder = this.config.folder;
      const suffix = this.config.suffix;
      
      // Instant first frame draw if not already painted by HTML/CSS
      const firstFrameUrl = `assets/${folder}/frame_000_${suffix}.webp`;
      const firstImg = new Image();
      firstImg.src = firstFrameUrl;
      
      try {
        await firstImg.decode();
        if (this.isDestroyed) return;
        this.scaleCanvas(firstImg);
        this.ctx.drawImage(firstImg, 0, 0, this.canvas.width, this.canvas.height);
      } catch (e) { console.warn("Initial frame decode failed", e); }

      // Parallel batch loading with decode throttling to prevent main thread lock
      const batchSize = 10;
      for (let i = 0; i < this.frameCount; i += batchSize) {
        if (this.isDestroyed) break;
        
        const loadBatch = [];
        for (let j = i; j < Math.min(i + batchSize, this.frameCount); j++) {
          const img = new Image();
          img.src = `assets/${folder}/frame_${j.toString().padStart(3, '0')}_${suffix}.webp`;
          loadBatch.push((async () => {
            try {
              await img.decode();
              this.frames[j] = img;
            } catch (err) { /* Silent skip */ }
          })());
        }
        await Promise.all(loadBatch);
      }
    }

    scaleCanvas(img) {
      if (this.canvas.width !== img.naturalWidth) {
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
      }
    }

    render = (currentTime) => {
      if (!this.isPlaying || this.isDestroyed) return;
      this.animationId = requestAnimationFrame(this.render);

      if (!this.lastTime) this.lastTime = currentTime;
      const delta = currentTime - this.lastTime;

      if (delta >= this.config.fps) {
        const img = this.frames[this.frameIndex];
        
        if (img && img.complete) {
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
          this.lastTime = currentTime - (delta % this.config.fps);
          
          if (this.frameIndex < this.frameCount - 1) {
            this.frameIndex++;
          } else if (this.config.loop) {
            this.frameIndex = 0;
          } else {
            this.isPlaying = false;
          }
        } else {
          // Sync protection: reset timing if asset isn't ready
          this.lastTime = currentTime;
        }
      }
    }

    handleBreakpointChange(isMobile) {
      if (isMobile !== this.isMobile) {
        console.log("Memory Reset: Breaking sequence and clearing GPU buffer.");
        this.destroy();
        new HeroCanvasManager(); // Re-init fresh
      }
    }

    setupObserver() {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!this.isPlaying) {
              this.isPlaying = true;
              this.animationId = requestAnimationFrame(this.render);
            }
          } else {
            this.isPlaying = false;
            if (this.animationId) cancelAnimationFrame(this.animationId);
          }
        });
      }, { threshold: 0.1 });
      
      this.observer.observe(hero);
    }

    destroy() {
      this.isDestroyed = true;
      this.isPlaying = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);
      if (this.observer) this.observer.disconnect();
      this.mediaQuery.removeEventListener('change', this.setupMobileCheck);
      
      // CRITICAL Memory Cleanup: Empty the frame array and clear canvas pointers
      this.frames.length = 0;
      this.frames = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Initialize the engine
  const heroManager = new HeroCanvasManager();

  // 11. Interactive Price Estimator Logic
  const priceData = {
    services: {
      'deep-clean': { 
        base: 120, 
        title: 'Deep Clean', 
        desc: 'Thorough exterior hand wash, wheel cleaning, and interior vacuuming with surface wipe down. Ideal for regular maintenance of vehicles in relatively good condition.' 
      },
      'signature-deep-clean': { 
        base: 175, 
        title: 'Signature Deep Clean', 
        desc: 'Our definitive deep cleaning process including full decontamination, steam cleaning of carpets, and a high-grade sealant application for lasting protection.' 
      },
      'enhancement-polish': { 
        base: 180, 
        title: 'Enhancement Polish', 
        desc: 'A single-stage machine polish designed to drastically increase gloss and remove minor swirl marks, revitalizing tired paintwork in a single session.' 
      },
      'paint-correction': { 
        base: 300, 
        title: 'Paint Correction', 
        desc: 'Multi-stage machine polishing to remove deeper defects — heavy swirl marks, scratches, water spots and oxidation. Restores paint to a true mirror finish.' 
      },
      'ceramic-coating': { 
        base: 250, 
        title: 'Ceramic Coating', 
        desc: 'Ultra-durable nanotech protection that creates a permanent chemical bond with your paint. Provides extreme hydrophobicity and high-gloss armor.' 
      }
    },
    sizes: {
      'small': { multiplier: 1, label: 'Small' },
      'medium': { multiplier: 1.15, label: 'Medium' },
      'large': { multiplier: 1.42, label: 'Large' },
      'commercial': { multiplier: 1.7, label: 'Commercial / Van' }
    }
  };

  const serviceItems = document.querySelectorAll('#service-choices .choice-item');
  const sizeItems = document.querySelectorAll('#size-choices .choice-item');
  const priceDisplay = document.getElementById('total-price');
  const summaryDisplay = document.getElementById('price-summary');

  let currentService = 'deep-clean';
  let currentSize = 'small';

  function updateEstimator() {
    const service = priceData.services[currentService];
    const size = priceData.sizes[currentSize];
    
    // Calculate price based on multiplier
    const total = Math.round(service.base * size.multiplier);
    
    // Update Price with GSAP for smooth number ticking
    if (priceDisplay) {
      gsap.to(priceDisplay, {
        innerHTML: total,
        duration: 0.6,
        snap: { innerHTML: 1 },
        ease: "power2.out",
        onUpdate: function() {
          priceDisplay.innerHTML = '$' + Math.ceil(this.targets()[0].innerHTML);
        }
      });
    }

    // Update Meta Summary
    if (summaryDisplay) {
      summaryDisplay.textContent = `${service.title} - ${size.label} vehicle`;
    }

  }

  // Event Listeners
  serviceItems.forEach(item => {
    item.addEventListener('click', () => {
      serviceItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentService = item.getAttribute('data-service');
      updateEstimator();
    });
  });

  sizeItems.forEach(item => {
    item.addEventListener('click', () => {
      sizeItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentSize = item.getAttribute('data-size');
      updateEstimator();
    });
  });

  // 13. Portfolio Drag-to-Scroll (Cinematic Reference Style)
  const gallery = document.getElementById('gallery-container');

  if (gallery) {
    let isDown = false;
    let startX;
    let scrollLeft;

    gallery.addEventListener('mousedown', (e) => {
      isDown = true;
      gallery.classList.add('grabbing');
      startX = e.pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
      gallery.style.scrollBehavior = 'auto'; // Disable smooth for drag
    });

    gallery.addEventListener('mouseleave', () => {
      isDown = false;
      gallery.classList.remove('grabbing');
    });

    gallery.addEventListener('mouseup', () => {
      isDown = false;
      gallery.classList.remove('grabbing');
      gallery.style.scrollBehavior = 'smooth';
    });

    gallery.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 2;
      gallery.scrollLeft = scrollLeft - walk;
    });
  }

  // 14. Services Toggle Logic
  const toggleBtns = document.querySelectorAll('.btn-toggle-services');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const grid = document.getElementById(targetId);
      if (grid) {
        const isCollapsed = grid.classList.toggle('collapsed');
        btn.innerHTML = isCollapsed 
          ? 'See all services <i class="fa-solid fa-chevron-down"></i>' 
          : 'Show less <i class="fa-solid fa-chevron-up"></i>';
        
        // Trigger AOS refresh to handle newly visible items
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
        
        // Smooth scroll to top of section if closing
        if (isCollapsed) {
          window.scrollTo({
            top: grid.parentElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }
    });
  });


  // 15. GoHighLevel Lead Capture Integration
  // We use a robust check to ensure the form exists before attaching
  const attachGHLHandler = () => {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;

    // Remove any existing listeners if this runs twice
    leadForm.onsubmit = null; 

    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stop other scripts from interfering
      
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      console.log("GHL Sync: Form submission detected.");

      // Get form data with fallback values
      const formData = {
        name: leadForm.querySelector('input[placeholder="Full Name"]')?.value || 'New Lead',
        phone: leadForm.querySelector('input[type="tel"]')?.value || '',
        email: leadForm.querySelector('input[type="email"]')?.value || '',
        address: leadForm.querySelector('input[placeholder*="vehicle located"]')?.value || 'N/A',
        vehicle: leadForm.querySelector('input[placeholder*="e.g. BMW"]')?.value || 'N/A',
        service: leadForm.querySelector('select')?.value || 'Inquiry',
        message: leadForm.querySelector('textarea')?.value || ''
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SYNCING...';

        const response = await fetch('/api/ghl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          submitBtn.style.backgroundColor = '#28a745';
          submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> REQUEST SECURED!';
          leadForm.reset();
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
            submitBtn.innerHTML = originalBtnText;
            alert('Lead captured in GHL! James will be in touch.');
          }, 3000);
        } else {
          throw new Error(result.error || 'Server Error');
        }

      } catch (error) {
        console.error('GHL Submission Error:', error);
        submitBtn.style.backgroundColor = '#dc3545';
        submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> SYNC FAILED';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = '';
          submitBtn.innerHTML = originalBtnText;
        }, 3000);
      }
    });
  };

  // Run immediately and on DOM load
  attachGHLHandler();

  // --- PREMIUM GSAP CHOREOGRAPHY ---

  // --- 1. Masked Typography Reveals (Section Titles) ---
  setTimeout(() => {
    gsap.utils.toArray('.reveal-wrapper').forEach(wrapper => {
      const inner = wrapper.querySelector('.reveal-inner');
      if (inner) {
        gsap.fromTo(inner, 
          { y: "150%" }, 
          {
            y: "0%",
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapper,
              start: "top 90%",
              toggleActions: "play none none none" 
            }
          }
        );
      }
    });
  }, 50);

  // --- 1.5 Deferred Hero Performance Sequence ---
  const initHeroDeferred = () => {
    const heroTitleChars = document.querySelectorAll('.hero-title .char');
    const heroHighlights = document.querySelectorAll('.hero-title .highlight');
    const heroDesc = document.querySelector('.hero-desc');
    const heroBtns = document.querySelector('.hero-btns');

    if (!heroTitleChars.length) return;

    // Set visibility to visible before starting the timeline
    gsap.set([heroTitleChars, heroHighlights, heroDesc, heroBtns], { visibility: 'visible' });

    const heroTl = gsap.timeline();

    // 1. Reveal Heading characters (Highlights fade in with their characters)
    heroTl.fromTo(heroTitleChars, 
      { opacity: 0, y: 30, filter: 'blur(8px)', scale: 1.1 },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)', 
        scale: 1,
        duration: 0.8, 
        stagger: 0.03, 
        ease: "power3.out" 
      }
    );

    // Fade in the green boxes (highlights) alongside the characters
    if (heroHighlights.length) {
      heroTl.fromTo(heroHighlights,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "none" },
        "<" // Starts at the same time as the character animation starts
      );
    }

    // 2. Reveal Description (150ms delay after title starts)
    if (heroDesc) {
      heroTl.fromTo(heroDesc,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.6" // Starts earlier to overlap with title reveal
      );
    }

    // 3. Reveal Buttons
    if (heroBtns) {
      heroTl.fromTo(heroBtns,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }
  };

  // Cinematic Reveal: Fade out the black shield overlay once layout has settled
  // We use requestAnimationFrame to ensure we aren't blocking a paint frame
  const dismissLoader = () => {
    const shield = document.getElementById("load-shield");
    if (shield) {
      shield.classList.add("fade-out");
      // Delayed cleanup to remove from DOM after transition
      setTimeout(() => shield.remove(), 800);
    }
    initHeroDeferred();
  };

  // Immediate dismissal trigger: 
  // We wait slightly to ensure CSS-OM is hydrated for the critical block
  if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 100);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 100));
  }

  // 2. Magnetic Buttons
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      
      // Pull button towards cursor
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      // Elastic snap back
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 1.0,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });

});
