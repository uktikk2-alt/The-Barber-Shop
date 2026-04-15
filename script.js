document.addEventListener("DOMContentLoaded", () => {
  

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
  
  // 10. 5 Second Smooth Hero Canvas Sequence
  const heroCanvas = document.getElementById("hero-canvas");
  if (heroCanvas) {

        const ctx = heroCanvas.getContext("2d", { alpha: false });
        
        const frameCount = 123;
        const currentFrame = index => `assets/hero-seq/frame_${index.toString().padStart(3, '0')}_delay-0.041s.webp`;
        const images = [];
        
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            if (i === 0) {
              img.onload = () => {
                heroCanvas.width = img.naturalWidth;
                heroCanvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0, heroCanvas.width, heroCanvas.height);
              }
            }
            images.push(img);
        }
        
        let frameIndex = 0;
        let lastTime = 0;
        let isPlaying = true;
        let animationId = null;
        
        const durationMs = 5000; // 5 seconds perfectly
        const frameInterval = durationMs / frameCount;
        
        const animateHeroSeq = (currentTime) => {
            if (!isPlaying) return;
            animationId = requestAnimationFrame(animateHeroSeq);
            
            if (!lastTime) lastTime = currentTime;
            const delta = currentTime - lastTime;
            
            if (delta >= frameInterval) {
                const img = images[frameIndex];
                
                // CRUCIAL: Only advance frame if the image is actually fully loaded, eliminating jitter/skipping!
                if (img && img.complete && img.naturalWidth > 0) {
                    if (heroCanvas.width !== img.naturalWidth) {
                        heroCanvas.width = img.naturalWidth;
                        heroCanvas.height = img.naturalHeight;
                    }
                    ctx.drawImage(img, 0, 0, heroCanvas.width, heroCanvas.height);
                    
                    lastTime = currentTime - (delta % frameInterval);
                    
                    if (frameIndex < frameCount - 1) {
                        frameIndex++;
                    } else {
                        isPlaying = false;
                        cancelAnimationFrame(animationId);
                    }
                } else {
                    // Buffer condition: image isn't loaded yet on slow mobile networks. Reset lastTime so we don't accidentally skip frames!
                    lastTime = currentTime;
                }
            }
        };
        
        // Start initial animation
        animationId = requestAnimationFrame(animateHeroSeq);
        
        // Observe hero section to restart animation upon scrolling back up
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!isPlaying && frameIndex === frameCount - 1) {
                            frameIndex = 0;
                            lastTime = 0;
                            isPlaying = true;
                            animationId = requestAnimationFrame(animateHeroSeq);
                        }
                    } else {
                        if (isPlaying) {
                            isPlaying = false;
                            if (animationId) cancelAnimationFrame(animationId);
                        }
                    }
                });
            }, { threshold: 0.15 });
            observer.observe(heroSection);
        }

  }

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

  // Cinematic Reveal: Add 'page-ready' class to body to fade the website in smoothly
  // We wait 150ms to ensure AOS and Browser Layout have settled positions
  setTimeout(() => {
    document.body.classList.add("page-ready");
  }, 150);

  // Execution Delay: Start Hero animations as the page fades in
  setTimeout(initHeroDeferred, 350);

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
