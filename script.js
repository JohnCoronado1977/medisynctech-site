(() => {
  const canvas = document.getElementById("mst-particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;
  let dpr = 1;
  let time = 0;
  let particles = [];
  let trails = [];

  let scrollTarget = window.scrollY;
  let scrollSmooth = window.scrollY;
  let previousScroll = window.scrollY;
  let scrollVelocity = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  function buildScene() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particleCount = Math.min(
      185,
      Math.max(95, Math.floor((w * h) / 8000))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      radius: rand(.45, 2.3),
      alpha: rand(.12, .8),
      vx: rand(-.05, .12),
      vy: rand(-.035, .045),
      depth: rand(.25, 1),
      pulse: rand(0, Math.PI * 2)
    }));

    trails = Array.from({ length: 38 }, (_, index) => ({
      y: h * rand(.45, .90),
      amplitude: rand(20, 95),
      width: rand(.4, 1.7),
      alpha: rand(.07, .44),
      phase: rand(0, Math.PI * 2),
      speed: rand(.05, .16),
      depth: rand(.2, 1),
      bend: rand(.5, 1.5),
      index
    }));
  }

  function glow(x, y, radius, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 7);
    gradient.addColorStop(0, `rgba(110,240,255,${alpha})`);
    gradient.addColorStop(.14, `rgba(0,155,255,${alpha * .75})`);
    gradient.addColorStop(1, "rgba(0,70,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 7, 0, Math.PI * 2);
    ctx.fill();
  }

  function trailY(x, trail) {
    const u = x / w;
    const scrollPhase = scrollSmooth * .0012 * trail.depth;

    return (
      trail.y
      - h * .36 * u
      + Math.sin(
          u * 5.2 +
          trail.phase +
          time * trail.speed +
          scrollPhase
        )
        * trail.amplitude
        * (.20 + .80 * u)
      + Math.pow(u, 2) * h * .075 * trail.bend
      - scrollVelocity * .08 * trail.depth
    );
  }

  function drawBackground() {
    ctx.fillStyle = "#000207";
    ctx.fillRect(0, 0, w, h);

    const atmosphere = ctx.createRadialGradient(
      w * .17,
      h * .62,
      0,
      w * .17,
      h * .62,
      Math.max(w, h) * .72
    );

    atmosphere.addColorStop(0, "rgba(0,92,225,.15)");
    atmosphere.addColorStop(.42, "rgba(0,30,105,.06)");
    atmosphere.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = atmosphere;
    ctx.fillRect(0, 0, w, h);
  }

  function drawTrails() {
    ctx.globalCompositeOperation = "lighter";

    trails.forEach(trail => {
      ctx.beginPath();

      for (let x = -30; x <= w + 30; x += 16) {
        const y = trailY(x, trail);
        x === -30 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.lineWidth = trail.width;
      ctx.strokeStyle = `rgba(0,120,255,${trail.alpha})`;
      ctx.stroke();

      if (trail.index % 5 === 0) {
        ctx.lineWidth = trail.width * .35;
        ctx.strokeStyle = `rgba(0,215,255,${trail.alpha * .75})`;
        ctx.stroke();
      }
    });
  }

  function drawTravelers() {
    const offsets = [.05, .20, .35, .50, .65, .80, .95];

    offsets.forEach((offset, index) => {
      const progress =
        (
          offset +
          time * .022 * (index + 1) +
          scrollSmooth * .000015 * (index + 1)
        ) % 1.15 - .05;

      const x = progress * w;
      const trail = trails[(index * 5 + 3) % trails.length];
      const y = trailY(x, trail);

      if (x > 0 && x < w) {
        glow(x, y, 4.5 + index * .35, .92);

        ctx.fillStyle = "rgba(160,245,255,.98)";
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawParticles() {
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.y -= scrollVelocity * .003 * particle.depth;
      particle.pulse += .018;

      if (particle.x < -5) particle.x = w + 5;
      if (particle.x > w + 5) particle.x = -5;
      if (particle.y < -5) particle.y = h + 5;
      if (particle.y > h + 5) particle.y = -5;

      const alpha =
        particle.alpha *
        (.72 + .28 * Math.sin(particle.pulse));

      if (particle.radius > 1.5) {
        glow(
          particle.x,
          particle.y,
          particle.radius,
          alpha * .25
        );
      }

      ctx.fillStyle = `rgba(0,145,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }

  function animate() {
    time += .008;

    scrollTarget = window.scrollY;

    const delta = scrollTarget - previousScroll;
    scrollVelocity += delta * .15;
    scrollVelocity *= .80;
    previousScroll = scrollTarget;

    scrollSmooth += (scrollTarget - scrollSmooth) * .16;

    drawBackground();
    drawTrails();
    drawTravelers();
    drawParticles();

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", buildScene, { passive: true });

  buildScene();
  animate();
})();
