// Interactive Background Particle System
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // Particle Array & Configuration
  const particles = [];
  const burstParticles = [];
  const mouse = {
    x: null,
    y: null,
    radius: 140, // Interaction radius around cursor
    isActive: false,
  };

  // Color Palettes
  const darkPalette = [
    { r: 59, g: 130, b: 246 },  // Brand Blue
    { r: 6, g: 182, b: 212 },   // Accent Cyan
    { r: 139, g: 92, b: 246 },  // Accent Purple
    { r: 16, g: 185, b: 129 },  // Emerald
  ];

  const lightPalette = [
    { r: 37, g: 99, b: 235 },   // Deeper Brand Blue
    { r: 14, g: 165, b: 233 },  // Sky
    { r: 124, g: 58, b: 237 },  // Purple
    { r: 13, g: 148, b: 136 },  // Teal
  ];

  function isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  function getPalette() {
    return isDarkMode() ? darkPalette : lightPalette;
  }

  // Particle Class
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.radius = Math.random() * 2 + 1.2;
      
      // Gentle drift velocity
      const speed = Math.random() * 0.6 + 0.2;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.colorIndex = Math.floor(Math.random() * 4);
      this.baseAlpha = Math.random() * 0.4 + 0.35;
      this.currentAlpha = this.baseAlpha;
    }

    update() {
      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null && mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          const angle = Math.atan2(dy, dx);
          // Gently push particle away from cursor
          this.x -= Math.cos(angle) * force * 2.5;
          this.y -= Math.sin(angle) * force * 2.5;
          this.currentAlpha = Math.min(1, this.baseAlpha + 0.4);
        } else {
          this.currentAlpha = this.baseAlpha;
        }
      } else {
        this.currentAlpha = this.baseAlpha;
      }

      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around canvas edges smoothly
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;
    }

    draw() {
      const palette = getPalette();
      const color = palette[this.colorIndex % palette.length];
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.currentAlpha})`;
      ctx.fill();
    }
  }

  // Click Burst Particle
  class BurstParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 2.5 + 1.5;
      const speed = Math.random() * 4 + 1.5;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.015;
      this.colorIndex = Math.floor(Math.random() * 4);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95; // Drag
      this.vy *= 0.95;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      const palette = getPalette();
      const color = palette[this.colorIndex % palette.length];
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.alpha})`;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }
  }

  // Setup & Resize Canvas
  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);

    // Determine particle count based on display size
    const targetCount = width < 768 ? 45 : Math.min(100, Math.floor((width * height) / 14000));
    particles.length = 0;
    for (let i = 0; i < targetCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connecting lines between close particles & cursor
  function drawConnections() {
    const maxDist = width < 768 ? 85 : 115;
    const dark = isDarkMode();
    const lineBaseAlpha = dark ? 0.16 : 0.14;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      // Lines to other particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * lineBaseAlpha;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = dark
            ? `rgba(96, 165, 250, ${alpha})`
            : `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Line to mouse cursor
      if (mouse.x !== null && mouse.y !== null && mouse.isActive) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * (dark ? 0.35 : 0.25);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = dark
            ? `rgba(6, 182, 212, ${alpha})`
            : `rgba(14, 165, 233, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw background particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Draw lines
    drawConnections();

    // Update & draw burst particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.update();
      bp.draw();
      if (bp.alpha <= 0) {
        burstParticles.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Mouse / Touch Event Listeners
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.isActive = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.isActive = false;
  });

  // Click / Tap burst effect
  window.addEventListener('click', (e) => {
    const burstCount = 14;
    for (let i = 0; i < burstCount; i++) {
      burstParticles.push(new BurstParticle(e.clientX, e.clientY));
    }
  });

  // Pause when document is hidden (saves battery/CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  // Window resize handler with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  // Initialize
  resize();
  animate();
})();
