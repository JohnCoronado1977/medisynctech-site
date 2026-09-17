(() => {
  const canvas = document.getElementById("mst-particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let trails = [];

  let scrollY = window.scrollY;
  let lastScrollY = scrollY;
  let velocity = 0;
  let time = 0;
  let lastFrame = 0;

  const FRAME_MS = 1000 / 45;
  const rand = (a, b) => a + Math.random() * (b - a);

  function buildScene() {
    w = innerWidth;
    h = innerHeight;

    // A 1x canvas is plenty for this soft particle treatment and much cheaper on Retina displays.
    dpr = 1;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particleCount = Math.min(
      62,
      Math.max(38, Math.floor((w * h) / 24000))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(.55, 1.55),
      a: rand(.20, .70),
      vx: rand(-.045, .075),
      vy: rand(-.02, .03),
      phase: rand(0, Math.PI * 2),
      depth: rand(.25, 1),
      purple: Math.random() > .68
    }));

    trails = Array.from({ length: 10 }, (_, i) => ({
      y: h * rand(.50, .86),
      amp: rand(16, 54),
      lw: rand(.45, 1.1),
      a: rand(.08, .26),
      phase: rand(0, Math.PI * 2),
      speed: rand(.035, .085),
      bend: rand(.45, 1.05),
      depth: rand(.3, 1),
      purple: i % 4 === 0
    }));
  }

  function trailY(x, t) {
    const u = x / w;
    return (
      t.y
      - h * .30 * u
      + Math.sin(u * 4.3 + t.phase + time * t.speed + scrollY * .00035 * t.depth)
        * t.amp * (.26 + .74 * u)
      + u * u * h * .045 * t.bend
      - velocity * .012 * t.depth
    );
  }

  function drawTraveler(x, y, purple) {
    // Two simple circles approximate a glow without gradient/shadowBlur cost.
    ctx.fillStyle = purple ? "rgba(166,72,255,.11)" : "rgba(0,158,255,.12)";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = purple ? "rgba(202,128,255,.92)" : "rgba(135,238,255,.95)";
    ctx.beginPath();
    ctx.arc(x, y, 1.65, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(now) {
    requestAnimationFrame(frame);

    if (document.hidden) return;
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    time += .010;
    velocity *= .78;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    // Trails
    for (const t of trails) {
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 42) {
        const y = trailY(x, t);
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineWidth = t.lw;
      ctx.strokeStyle = t.purple
        ? `rgba(137,48,255,${t.a})`
        : `rgba(0,128,255,${t.a})`;
      ctx.stroke();
    }

    // Traveling energy points
    const offsets = [.08, .27, .46, .66, .85];
    offsets.forEach((off, i) => {
      const u = (off + time * .012 * (i + 1) + scrollY * .000008) % 1.10 - .03;
      const x = u * w;
      if (x < 0 || x > w) return;

      const t = trails[(i * 2 + 1) % trails.length];
      drawTraveler(x, trailY(x, t), t.purple);
    });

    // Floating particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy - velocity * .00045 * p.depth;
      p.phase += .015;

      if (p.x < -3) p.x = w + 3;
      if (p.x > w + 3) p.x = -3;
      if (p.y < -3) p.y = h + 3;
      if (p.y > h + 3) p.y = -3;

      const a = p.a * (.76 + .24 * Math.sin(p.phase));
      ctx.fillStyle = p.purple
        ? `rgba(145,58,255,${a})`
        : `rgba(0,145,255,${a})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  addEventListener("scroll", () => {
    const now = window.scrollY;
    velocity += now - lastScrollY;
    scrollY = now;
    lastScrollY = now;
  }, { passive: true });

  addEventListener("resize", buildScene, { passive: true });

  buildScene();
  requestAnimationFrame(frame);
})();

document.getElementById("year").textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .08 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll(".topbar nav a")];
const sections = [...document.querySelectorAll("main section[id]")];

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
    });
  });
}, { rootMargin: "-35% 0px -55%" });

sections.forEach(section => navObserver.observe(section));
