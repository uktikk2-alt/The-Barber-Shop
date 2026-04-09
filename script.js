document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Initialize AOS Animation Library with "Insane" Settings
  AOS.init({
    once: true, 
    offset: 50,
    duration: 600,
    easing: 'ease-out-cubic',
    disable: false // Enabled AOS animations on mobile 
  });

  // 2. Sticky header on scroll
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  });
  if (window.scrollY > 50) {
    header.classList.add("sticky");
  }

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

  // 5. Active navigation highlight
  const sections = document.querySelectorAll("section[id], body[id]");
  const navLinks = document.querySelectorAll(".nav ul li a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 250)) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
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

  // 7. Gallery Filter interactions
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filterValue = btn.getAttribute('data-filter');
      
      galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        setTimeout(() => {
          if (filterValue === 'all' || item.getAttribute('data-category').includes(filterValue)) {
            item.classList.remove('hide');
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.classList.add('hide');
          }
          setTimeout(() => { AOS.refresh(); }, 100);
        }, 300);
      });
    });
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

});
