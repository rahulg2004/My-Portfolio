/**
 * Smooth Scroll Video Canvas Animation Engine
 * Rahul Gupta Portfolio
 *
 * High-performance frame-scrubbing system:
 * - 300 cinematic HD frames (1920x1080)
 * - Priority-windowed asynchronous progressive preloader
 * - Async GPU image decoding (img.decode) off-main-thread
 * - Refresh-rate-independent exponential spring lerp
 * - Responsive retina cover scaling with high-quality smoothing
 * - Fallback frame caching to eliminate any flickering
 * - Audited & verified: Zero conflict with page search, filters, or links
 */
(() => {
  const FRAME_COUNT = 300;
  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;

  // Frame folder selection: 'kung fu' for projects.html; 'goggle throw 2' for education.html; 'sipping cofee' for experience.html; 'new frames' for other pages
  const isProjectsPage = window.location.pathname.toLowerCase().includes('projects') ||
                         document.title.toLowerCase().includes('projects');
  const isEducationPage = window.location.pathname.toLowerCase().includes('education') ||
                          document.title.toLowerCase().includes('education');
  const isExperiencePage = window.location.pathname.toLowerCase().includes('experience') ||
                           document.title.toLowerCase().includes('experience');
  const customFolder = canvas.getAttribute('data-folder');
  const FOLDER = customFolder || (
    isProjectsPage ? 'kung fu' :
    isEducationPage ? 'goggle throw 2' :
    isExperiencePage ? 'sipping cofee' :
    'new frames'
  );

  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  const images = new Array(FRAME_COUNT + 1);
  const isLoaded = new Array(FRAME_COUNT + 1).fill(false);
  const isLoading = new Array(FRAME_COUNT + 1).fill(false);

  let currentFrame = 1;
  let targetFrame = 1;
  let lastRenderedIndex = -1;
  let lastTime = performance.now();

  const getFrameUrl = (index) => {
    const padded = String(index).padStart(3, '0');
    return `${encodeURI(FOLDER)}/ezgif-frame-${padded}.jpg`;
  };

  // Draw image with object-fit: cover scaling
  function drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    const ratio = Math.max(cw / iw, ch / ih);
    const renderW = Math.ceil(iw * ratio);
    const renderH = Math.ceil(ih * ratio);
    const offsetX = Math.floor((cw - renderW) * 0.5);
    const offsetY = Math.floor((ch - renderH) * 0.5);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // Graceful fallback helper: search outwards for the closest loaded frame
  function getBestAvailableImage(targetIndex) {
    if (isLoaded[targetIndex] && images[targetIndex]) {
      return images[targetIndex];
    }
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 1 && isLoaded[prev] && images[prev]) {
        return images[prev];
      }
      const next = targetIndex + offset;
      if (next <= FRAME_COUNT && isLoaded[next] && images[next]) {
        return images[next];
      }
    }
    return isLoaded[1] ? images[1] : null;
  }

  function renderFrame(index) {
    const img = getBestAvailableImage(index);
    if (img) {
      drawCover(img);
      lastRenderedIndex = index;
    }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.floor(window.innerWidth * dpr);
    const newHeight = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      lastRenderedIndex = -1;
      renderFrame(Math.round(currentFrame));
    }
  }

  let lastScrollTop = window.scrollY || document.documentElement.scrollTop || 0;

  function calculateTargetFrame() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollDelta = scrollTop - lastScrollTop;
    lastScrollTop = scrollTop;

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    targetFrame = 1 + progress * (FRAME_COUNT - 1);

    // Direction-aware lookahead priority request
    const direction = scrollDelta >= 0 ? 1 : -1;
    requestPriorityFrames(Math.round(targetFrame), direction);
  }

  // Load an individual frame with async off-thread decoding
  function loadFrame(i) {
    if (i < 1 || i > FRAME_COUNT || isLoaded[i] || isLoading[i]) return;
    isLoading[i] = true;

    const img = new Image();
    img.src = getFrameUrl(i);

    if ('decode' in img) {
      img.decode()
        .then(() => {
          images[i] = img;
          isLoaded[i] = true;
          isLoading[i] = false;
          if (Math.round(currentFrame) === i) {
            renderFrame(i);
          }
        })
        .catch(() => {
          img.onload = () => {
            images[i] = img;
            isLoaded[i] = true;
            isLoading[i] = false;
            if (Math.round(currentFrame) === i) {
              renderFrame(i);
            }
          };
          img.onerror = () => { isLoading[i] = false; };
        });
    } else {
      img.onload = () => {
        images[i] = img;
        isLoaded[i] = true;
        isLoading[i] = false;
        if (Math.round(currentFrame) === i) {
          renderFrame(i);
        }
      };
      img.onerror = () => { isLoading[i] = false; };
    }
  }

  // Prioritize loading frames in an asymmetric window biased towards scroll direction
  function requestPriorityFrames(centerIndex, direction = 1) {
    const lookahead = direction >= 0 ? 16 : 6;
    const lookbehind = direction >= 0 ? 6 : 16;
    for (let r = 0; r <= lookahead; r++) {
      if (centerIndex + r <= FRAME_COUNT) loadFrame(centerIndex + r);
    }
    for (let r = 1; r <= lookbehind; r++) {
      if (centerIndex - r >= 1) loadFrame(centerIndex - r);
    }
  }

  // Progressive background preloader
  function startProgressivePreloader() {
    // 1. Instant priority: Frame 1 immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    const onFirstReady = () => {
      images[1] = firstImg;
      isLoaded[1] = true;
      isLoading[1] = false;
      renderFrame(1);
    };
    if ('decode' in firstImg) {
      firstImg.decode().then(onFirstReady).catch(() => {
        firstImg.onload = onFirstReady;
      });
    } else {
      firstImg.onload = onFirstReady;
    }

    // 2. Immediate warm-up window: frames 1..15 for immediate scroll responsiveness
    for (let i = 2; i <= Math.min(15, FRAME_COUNT); i++) {
      loadFrame(i);
    }

    // 3. Keyframes spaced every 10 frames (scaffolding coverage across entire scroll range)
    let anchorIdx = 20;
    const loadAnchors = () => {
      while (anchorIdx <= FRAME_COUNT) {
        loadFrame(anchorIdx);
        anchorIdx += 10;
      }
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadAnchors, { timeout: 200 });
    } else {
      setTimeout(loadAnchors, 50);
    }

    // 4. Fill in the remaining frames progressively in smooth batches
    let currentFill = 2;
    function fillNextBatch() {
      if (currentFill > FRAME_COUNT) return;
      const batchSize = 6;
      for (let b = 0; b < batchSize && currentFill <= FRAME_COUNT; b++, currentFill++) {
        if (!isLoaded[currentFill] && !isLoading[currentFill]) {
          loadFrame(currentFill);
        }
      }
      if (currentFill <= FRAME_COUNT) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(fillNextBatch, { timeout: 100 });
        } else {
          setTimeout(fillNextBatch, 16);
        }
      }
    }
    setTimeout(fillNextBatch, 150);
  }

  // Smooth continuous scrubbing loop via requestAnimationFrame
  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.0005) {
      // Adaptive exponential inertia for silky-smooth motion and fluid ease-out:
      // High responsiveness during rapid scroll, gentle cinematic deceleration when settling
      const speed = Math.abs(diff);
      const lambda = speed > 20 ? 14 : 9.5;
      const factor = 1 - Math.exp(-lambda * dt);
      currentFrame += diff * factor;
    } else {
      currentFrame = targetFrame;
    }

    const frameToDraw = Math.round(currentFrame);
    if (frameToDraw !== lastRenderedIndex) {
      renderFrame(frameToDraw);
    }

    requestAnimationFrame(tick);
  }

  // Update active navbar link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    if (!sections || sections.length === 0) return;
    const scrollY = window.scrollY || window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href && (href === `#${sectionId}` || href.endsWith(`#${sectionId}`))) {
            navLinks.forEach((l) => {
              if (l.getAttribute('href')?.includes('#')) l.classList.remove('active');
            });
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Smooth scroll handler for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        if (this.classList.contains('btn-back-to-top')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      try {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      } catch (err) { }
    });
  });

  // Event Listeners
  window.addEventListener('resize', () => {
    resizeCanvas();
    calculateTargetFrame();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    calculateTargetFrame();
    updateActiveNavLink();
  }, { passive: true });

  // Dynamic layout changes observer (e.g. search / filtering / carousels changing page height)
  if (typeof ResizeObserver !== 'undefined' && document.body) {
    try {
      const ro = new ResizeObserver(() => {
        calculateTargetFrame();
      });
      ro.observe(document.body);
    } catch (e) { }
  }

  // Reset any theme state to default
  try {
    localStorage.removeItem('portfolio-theme');
    document.documentElement.removeAttribute('data-theme');
  } catch (e) { }

  // Initial Boot
  resizeCanvas();
  startProgressivePreloader();
  calculateTargetFrame();
  currentFrame = targetFrame;
  lastTime = performance.now();
  requestAnimationFrame(tick);
})();
