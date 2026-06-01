/**
 * W.A. WANG - Client Logic (No-Scroll Viewport Edition)
 * Features: Viewport Tab Routing, Mobile Smooth Scroll Redirection, Cinematic Loader, LERP Physics, Magnetic Links
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ----------------------------------------------------
  // 1. INTRO LOADER SEQUENCE
  // ----------------------------------------------------
  const loader = document.getElementById('intro-loader');
  const loaderStartTime = Date.now();
  const MIN_LOADER_DURATION = 2500; // Enforces a 2.5s minimum visual pause to let the logo expand

  window.addEventListener('load', () => {
    scheduleFadeOut();
  });

  // Fallback in case window load hangs
  const fallbackTimeout = setTimeout(() => {
    fadeOutLoader();
  }, 3500);

  function scheduleFadeOut() {
    const elapsed = Date.now() - loaderStartTime;
    const remaining = Math.max(0, MIN_LOADER_DURATION - elapsed);
    
    setTimeout(() => {
      fadeOutLoader();
    }, remaining);
  }

  function fadeOutLoader() {
    if (loader && !loader.classList.contains('faded')) {
      clearTimeout(fallbackTimeout);
      loader.classList.add('faded');
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      
      document.body.classList.add('loaded');
      startSVGFilterOscillation();
    }
  }

  // ----------------------------------------------------
  // 2. VIEWPORT SLIDE NAVIGATION / ROUTING (RESPONSIVE)
  // ----------------------------------------------------
  const tabLinks = document.querySelectorAll('.nav-tab-link');
  const slides = document.querySelectorAll('.viewport-slide');
  const brandLogo = document.getElementById('brand-logo');

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      const targetSlide = document.getElementById(`slide-${targetId}`);
      
      if (!targetSlide) return;

      if (window.innerWidth >= 768) {
        // Desktop Viewport Crossfade Transition
        slides.forEach(slide => {
          slide.classList.remove('active-slide');
        });
        targetSlide.classList.add('active-slide');

        // Update active tab styling in sidebar navigation
        tabLinks.forEach(otherLink => {
          otherLink.classList.remove('active-link');
        });
        
        // Highlight corresponding sidebar link (handles links clicked outside navigation too, e.g. discover link)
        const correspondingNavTab = document.querySelector(`.sidebar-nav .nav-tab-link[data-target="${targetId}"]`);
        if (correspondingNavTab) {
          correspondingNavTab.classList.add('active-link');
        }
      } else {
        // Mobile Stack Scroll Redirection
        targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Logo returns to home screen on desktop, scrolls to top on mobile
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth >= 768) {
        slides.forEach(slide => {
          slide.classList.remove('active-slide');
        });
        const homeSlide = document.getElementById('slide-home');
        if (homeSlide) homeSlide.classList.add('active-slide');

        tabLinks.forEach(link => {
          link.classList.remove('active-link');
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ----------------------------------------------------
  // 3. MOBILE SCROLL REVEALS (Intersection Observer)
  // ----------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // Only execute scroll reveal if in mobile layout
      if (entry.isIntersecting && window.innerWidth < 768) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ----------------------------------------------------
  // 4. EXPANDABLE PROJECT CARDS
  // ----------------------------------------------------
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      toggleCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });

  function toggleCard(card) {
    const isExpanded = card.getAttribute('aria-expanded') === 'true';
    
    projectCards.forEach(otherCard => {
      if (otherCard !== card && otherCard.getAttribute('aria-expanded') === 'true') {
        otherCard.setAttribute('aria-expanded', 'false');
        otherCard.classList.remove('active');
      }
    });

    card.setAttribute('aria-expanded', !isExpanded);
    card.classList.toggle('active');
  }

  // ----------------------------------------------------
  // 5. MOUSE PARALLAX & LERP PHYSICS (Visual Excellence)
  // ----------------------------------------------------
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) - 0.5; // [-0.5, 0.5]
    mouse.targetY = (e.clientY / window.innerHeight) - 0.5; // [-0.5, 0.5]
  });

  // LERP: Title drift (Cursor-aware)
  const heroTitle = document.getElementById('interactive-hero-title');
  const heroLerp = { currentX: 0, currentY: 0, targetX: 0, targetY: 0, speed: 0.06 };

  // LERP: Circular Portrait Frame mouse reaction
  const portraitFrame = document.getElementById('portrait-frame');
  const portraitPhoto = document.getElementById('portrait-photo');
  const portraitLerp = { currentX: 0, currentY: 0, targetX: 0, targetY: 0, speed: 0.05 };

  if (portraitFrame && portraitPhoto) {
    portraitFrame.addEventListener('mousemove', (e) => {
      const rect = portraitFrame.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5;  // [-0.5, 0.5]
      const relativeY = (e.clientY - rect.top) / rect.height - 0.5;  // [-0.5, 0.5]
      
      portraitLerp.targetX = relativeX * -20; // opposite direction for depth
      portraitLerp.targetY = relativeY * -20;
    });

    portraitFrame.addEventListener('mouseleave', () => {
      portraitLerp.targetX = 0;
      portraitLerp.targetY = 0;
    });
  }

  // ----------------------------------------------------
  // 6. MAGNETIC ITEMS
  // ----------------------------------------------------
  const magneticItems = document.querySelectorAll('.magnetic-item');

  magneticItems.forEach(item => {
    const itemLerp = { currentX: 0, currentY: 0, targetX: 0, targetY: 0, speed: 0.15 };
    let isHovered = false;

    item.addEventListener('mousemove', (e) => {
      isHovered = true;
      const rect = item.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const pullX = (e.clientX - centerX) * 0.35;
      const pullY = (e.clientY - centerY) * 0.35;

      itemLerp.targetX = Math.max(-12, Math.min(12, pullX));
      itemLerp.targetY = Math.max(-8, Math.min(8, pullY));
    });

    item.addEventListener('mouseleave', () => {
      isHovered = false;
      itemLerp.targetX = 0;
      itemLerp.targetY = 0;
    });

    function updateMagnetic() {
      itemLerp.currentX += (itemLerp.targetX - itemLerp.currentX) * itemLerp.speed;
      itemLerp.currentY += (itemLerp.targetY - itemLerp.currentY) * itemLerp.speed;

      if (Math.abs(itemLerp.currentX) > 0.05 || Math.abs(itemLerp.currentY) > 0.05 || isHovered) {
        item.style.transform = `translate3d(${itemLerp.currentX}px, ${itemLerp.currentY}px, 0)`;
      } else {
        item.style.transform = 'translate3d(0, 0, 0)';
      }
      requestAnimationFrame(updateMagnetic);
    }
    requestAnimationFrame(updateMagnetic);
  });

  // ----------------------------------------------------
  // 7. ANIMATION TICK LOOP (60fps)
  // ----------------------------------------------------
  function animationTick() {
    // Only process global mouse LERPs on screens above mobile width to maximize efficiency
    if (window.innerWidth >= 768) {
      // 7a. Animate Hero Title drift
      if (heroTitle) {
        heroLerp.targetX = mouse.targetX * 22;
        heroLerp.targetY = mouse.targetY * 12;

        heroLerp.currentX += (heroLerp.targetX - heroLerp.currentX) * heroLerp.speed;
        heroLerp.currentY += (heroLerp.targetY - heroLerp.currentY) * heroLerp.speed;

        const rotateY = heroLerp.currentX * 0.25; 
        const rotateX = heroLerp.currentY * -0.25; 

        heroTitle.style.transform = `translate3d(${heroLerp.currentX}px, ${heroLerp.currentY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    }

    // 7b. Animate Portrait Parallax (circular depth)
    if (portraitFrame && portraitPhoto) {
      portraitLerp.currentX += (portraitLerp.targetX - portraitLerp.currentX) * portraitLerp.speed;
      portraitLerp.currentY += (portraitLerp.targetY - portraitLerp.currentY) * portraitLerp.speed;

      portraitPhoto.style.transform = `scale(1.12) translate3d(${portraitLerp.currentX}px, ${portraitLerp.currentY}px, 0)`;
      
      const skewX = portraitLerp.currentX * -0.05;
      const skewY = portraitLerp.currentY * -0.05;
      portraitFrame.style.transform = `skew(${skewX}deg, ${skewY}deg)`;
    }

    requestAnimationFrame(animationTick);
  }

  requestAnimationFrame(animationTick);

  // ----------------------------------------------------
  // 8. CINEMATIC SVG DISPLACEMENT OSCILLATION
  // ----------------------------------------------------
  let baseFreqX = 0.01;
  let baseFreqY = 0.005;
  let time = 0;
  
  function startSVGFilterOscillation() {
    const filterTurbulence = document.querySelector('#cinematic-morph-static feTurbulence');
    
    if (!filterTurbulence) return;

    function breathe() {
      time += 0.0025;
      
      const oscX = baseFreqX + Math.sin(time) * 0.0012;
      const oscY = baseFreqY + Math.cos(time * 0.8) * 0.0008;

      filterTurbulence.setAttribute('baseFrequency', `${oscX.toFixed(6)} ${oscY.toFixed(6)}`);
      
      requestAnimationFrame(breathe);
    }
    requestAnimationFrame(breathe);
  }
});
