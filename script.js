document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Initialize AOS Animation Library with "Insane" Settings
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
  window.addEventListener('resize', calculateOffsets, { passive: true });

  // 2. Optimized Scroll Engine (Passive & Throttled)
  let isScrolling = false;
  window.addEventListener("scroll", () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        handleScroll();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  const handleScroll = () => {
    const scrollPos = window.scrollY;

    // Sticky Header Logic
    if (scrollPos > 50) {
      header.classList.add("sticky");
    } else {
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

  // Initial call
  handleScroll();

  // 3. Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");
  if(mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
    });
    // Close menu when a link is clicked
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        mainNav.classList.remove("active");
      });
    });
  }

  // 4. Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

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
    const currentFrame = index => `assets/hero-seq/frame_${index.toString().padStart(3, '0')}_delay-0.041s.jpg`;
    const images = [];
    
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        if (i === 0) {
          img.onload = () => {
            // Dynamically set canvas exact dimensions so 'object-fit: cover' works properly without stretching
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
            lastTime = currentTime - (delta % frameInterval);
            
            const img = images[frameIndex];
            if (img && img.complete && img.naturalWidth > 0) {
                // Failsafe resize just in case first onload was skipped by cache fast-load
                if (heroCanvas.width !== img.naturalWidth) {
                    heroCanvas.width = img.naturalWidth;
                    heroCanvas.height = img.naturalHeight;
                }
                ctx.drawImage(img, 0, 0, heroCanvas.width, heroCanvas.height);
            }
            
            if (frameIndex < frameCount - 1) {
                frameIndex++;
            } else {
                // Reached the last frame, halt CPU cycle and freeze
                isPlaying = false;
                cancelAnimationFrame(animationId);
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
                    // If it scrolled into view and was previously frozen at the end, restart it
                    if (!isPlaying && frameIndex === frameCount - 1) {
                        frameIndex = 0;
                        lastTime = 0;
                        isPlaying = true;
                        animationId = requestAnimationFrame(animateHeroSeq);
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
  const infoTitle = document.getElementById('info-title');
  const infoText = document.getElementById('info-text');

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
          priceDisplay.innerHTML = '£' + Math.ceil(this.targets()[0].innerHTML);
        }
      });
    }

    // Update Meta Summary
    if (summaryDisplay) {
      summaryDisplay.textContent = `${service.title} — ${size.label} vehicle`;
    }

    // Update Info Box with Fade Effect
    if (infoTitle && infoText) {
      gsap.to('#estimator-info', {
        opacity: 0,
        y: 10,
        duration: 0.15,
        onComplete: () => {
          infoTitle.textContent = `WHAT IS ${service.title.toUpperCase()}?`;
          infoText.textContent = service.desc;
          gsap.to('#estimator-info', { opacity: 1, y: 0, duration: 0.3 });
        }
      });
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
});
