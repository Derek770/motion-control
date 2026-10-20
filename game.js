// Cyber Dodge: Neon Rush - Interactive Arcade Mini-Game
(function () {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start-game-btn');
  const restartBtn = document.getElementById('restart-game-btn');
  const pauseBtn = document.getElementById('pause-game-btn');
  const scoreDisplay = document.getElementById('game-score');
  const highScoreDisplay = document.getElementById('game-high-score');
  const gameOverlay = document.getElementById('game-overlay');
  const overlayTitle = document.getElementById('game-overlay-title');
  const overlaySubtitle = document.getElementById('game-overlay-subtitle');

  // Mobile Touch Controls
  const btnLeft = document.getElementById('game-btn-left');
  const btnRight = document.getElementById('game-btn-right');

  // Web Audio Synthesizer (Zero external dependencies)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playCollectSound() {
    playTone(587.33, 'triangle', 0.08, 0.2); // D5
    setTimeout(() => playTone(880, 'sine', 0.15, 0.2), 60); // A5
  }

  function playCrashSound() {
    playTone(150, 'sawtooth', 0.25, 0.3);
    setTimeout(() => playTone(80, 'sawtooth', 0.35, 0.3), 100);
  }

  // Game Dimensions & Scaling
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // Game State
  let isRunning = false;
  let isPaused = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('cyber_dodge_high_score') || '0', 10);
  if (highScoreDisplay) highScoreDisplay.textContent = highScore;

  let animationId = null;
  let lastTime = 0;
  let spawnTimer = 0;
  let powerupTimer = 0;
  let speedMultiplier = 1;

  // Player Ship
  const player = {
    x: 0,
    y: 0,
    width: 32,
    height: 38,
    speed: 400,
    moveLeft: false,
    moveRight: false,
    trail: [],
  };

  const obstacles = [];
  const powerups = [];
  const sparks = [];

  function resizeGame() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    player.y = height - player.height - 18;
    if (player.x === 0) player.x = width / 2;
  }

  // Spark / Explosion Effect
  function createSparks(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        life: Math.random() * 0.4 + 0.3,
      });
    }
  }

  // Obstacle Class
  function spawnObstacle() {
    const size = Math.random() * 22 + 20;
    const x = Math.random() * (width - size);
    const speed = (Math.random() * 120 + 180) * speedMultiplier;
    obstacles.push({
      x,
      y: -size,
      width: size,
      height: size,
      speed,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 4,
      color: Math.random() > 0.4 ? '#ef4444' : '#f97316', // Neon Red / Orange
    });
  }

  // Powerup (Energy Core)
  function spawnPowerup() {
    const radius = 10;
    const x = Math.random() * (width - radius * 2) + radius;
    const speed = (Math.random() * 60 + 140) * speedMultiplier;
    powerups.push({
      x,
      y: -radius * 2,
      radius,
      speed,
      pulse: 0,
      color: '#10b981', // Emerald
    });
  }

  function resetGame() {
    score = 0;
    speedMultiplier = 1;
    spawnTimer = 0;
    powerupTimer = 0;
    obstacles.length = 0;
    powerups.length = 0;
    sparks.length = 0;
    player.x = width / 2;
    player.trail.length = 0;
    if (scoreDisplay) scoreDisplay.textContent = '0';
  }

  function startGame() {
    initAudio();
    resetGame();
    isRunning = true;
    isPaused = false;
    gameOverlay.classList.add('hidden');
    if (pauseBtn) pauseBtn.disabled = false;
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    isRunning = false;
    playCrashSound();
    createSparks(player.x, player.y + player.height / 2, '#ef4444', 30);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('cyber_dodge_high_score', highScore.toString());
      if (highScoreDisplay) highScoreDisplay.textContent = highScore;
    }

    if (overlayTitle) overlayTitle.textContent = 'SYSTEM OVERLOAD!';
    if (overlaySubtitle) overlaySubtitle.textContent = `You scored ${score} pts. Best: ${highScore} pts.`;
    if (startBtn) startBtn.textContent = 'Play Again';
    gameOverlay.classList.remove('hidden');
    if (pauseBtn) pauseBtn.disabled = true;
  }

  function togglePause() {
    if (!isRunning) return;
    isPaused = !isPaused;
    if (isPaused) {
      if (pauseBtn) pauseBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i><span>Resume</span>';
      if (overlayTitle) overlayTitle.textContent = 'MISSION PAUSED';
      if (overlaySubtitle) overlaySubtitle.textContent = 'Press resume or spacebar to continue dodging.';
      gameOverlay.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    } else {
      if (pauseBtn) pauseBtn.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i><span>Pause</span>';
      gameOverlay.classList.add('hidden');
      lastTime = performance.now();
      animationId = requestAnimationFrame(gameLoop);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Main Loop
  function gameLoop(timestamp) {
    if (!isRunning || isPaused) return;

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    render();

    animationId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    // Increase difficulty gradually
    score += Math.floor(dt * 15);
    if (scoreDisplay) scoreDisplay.textContent = score;
    speedMultiplier = 1 + Math.min(score / 800, 1.8);

    // Player movement
    if (player.moveLeft) {
      player.x -= player.speed * dt;
    }
    if (player.moveRight) {
      player.x += player.speed * dt;
    }

    // Boundary constraints
    const halfW = player.width / 2;
    if (player.x - halfW < 0) player.x = halfW;
    if (player.x + halfW > width) player.x = width - halfW;

    // Player engine trail
    player.trail.push({ x: player.x, y: player.y + player.height, alpha: 0.8 });
    for (let i = player.trail.length - 1; i >= 0; i--) {
      player.trail[i].alpha -= dt * 3.5;
      player.trail[i].y += dt * 40;
      if (player.trail[i].alpha <= 0) player.trail.splice(i, 1);
    }

    // Spawn obstacles
    spawnTimer += dt;
    const obstacleInterval = Math.max(0.35, 0.9 - score / 1500);
    if (spawnTimer >= obstacleInterval) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // Spawn powerups
    powerupTimer += dt;
    if (powerupTimer >= 3.5) {
      powerupTimer = 0;
      if (Math.random() > 0.3) spawnPowerup();
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += obs.speed * dt;
      obs.rotation += obs.rotSpeed * dt;

      // Collision check with player
      if (
        player.x - halfW < obs.x + obs.width &&
        player.x + halfW > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        gameOver();
        return;
      }

      // Offscreen cleanup
      if (obs.y > height + 50) {
        obstacles.splice(i, 1);
      }
    }

    // Update powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const pup = powerups[i];
      pup.y += pup.speed * dt;
      pup.pulse += dt * 6;

      // Collision with player
      const dx = player.x - pup.x;
      const dy = player.y + player.height / 2 - pup.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pup.radius + halfW) {
        score += 75;
        playCollectSound();
        createSparks(pup.x, pup.y, '#10b981', 15);
        powerups.splice(i, 1);
        continue;
      }

      if (pup.y > height + 30) {
        powerups.splice(i, 1);
      }
    }

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.alpha -= dt / s.life;
      if (s.alpha <= 0) sparks.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Subtle Grid Background
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Engine Trail
    player.trail.forEach((t) => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${t.alpha})`;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Draw Player Ship (Stylized Neon Arrowhead)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.beginPath();
    ctx.moveTo(0, 0); // Tip
    ctx.lineTo(player.width / 2, player.height); // Bottom right
    ctx.lineTo(0, player.height - 10); // Center notch
    ctx.lineTo(-player.width / 2, player.height); // Bottom left
    ctx.closePath();

    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Draw Obstacles (Rotating Neon Hazard Cubes)
    obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
      ctx.rotate(obs.rotation);
      ctx.fillStyle = obs.color;
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
      ctx.restore();
    });

    // Draw Powerups (Glowing Energy Cores)
    powerups.forEach((pup) => {
      ctx.save();
      const pulseSize = pup.radius + Math.sin(pup.pulse) * 2.5;
      ctx.beginPath();
      ctx.arc(pup.x, pup.y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = pup.color;
      ctx.shadowColor = pup.color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // Draw Sparks
    sparks.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  // Keyboard Controls
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
      player.moveLeft = true;
    }
    if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
      player.moveRight = true;
    }
    if (e.code === 'Space') {
      if (!isRunning) {
        startGame();
      } else {
        togglePause();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code || e.key)) {
      player.moveLeft = false;
    }
    if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code || e.key)) {
      player.moveRight = false;
    }
  });

  // Touch / Mobile Controls
  if (btnLeft) {
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveLeft = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.moveLeft = false; });
    btnLeft.addEventListener('mousedown', () => { player.moveLeft = true; });
    btnLeft.addEventListener('mouseup', () => { player.moveLeft = false; });
  }

  if (btnRight) {
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveRight = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); player.moveRight = false; });
    btnRight.addEventListener('mousedown', () => { player.moveRight = true; });
    btnRight.addEventListener('mouseup', () => { player.moveRight = false; });
  }

  // Mouse / Touch Drag on Canvas
  let isDragging = false;
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging && isRunning && !isPaused) {
      const rect = canvas.getBoundingClientRect();
      player.x = e.clientX - rect.left;
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (isRunning && !isPaused && e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      player.x = e.touches[0].clientX - rect.left;
    }
  }, { passive: true });

  // Buttons
  if (startBtn) startBtn.addEventListener('click', startGame);
  if (restartBtn) restartBtn.addEventListener('click', startGame);
  if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

  // Resize Listener
  window.addEventListener('resize', resizeGame);
  resizeGame();
})();
