(() => {
  const canvas = document.getElementById("mst-particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = 1, time = 0;
  let particles = [], trails = [];
  let scrollY = window.scrollY;
  let lastScrollY = scrollY;
  let velocity = 0;

  const rand = (a,b) => a + Math.random() * (b-a);

  function buildScene() {
    w = innerWidth;
    h = innerHeight;

    // Lower DPR is much easier on laptops and keeps scrolling buttery smooth.
    dpr = Math.min(devicePixelRatio || 1, 1.35);

    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
    canvas.style.width = w+"px";
    canvas.style.height = h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const pCount = Math.min(95, Math.max(55, Math.floor((w*h)/15000)));

    particles = Array.from({length:pCount}, () => ({
      x:rand(0,w), y:rand(0,h), r:rand(.45,1.7),
      a:rand(.18,.75), vx:rand(-.05,.09), vy:rand(-.025,.035),
      phase:rand(0,Math.PI*2), depth:rand(.2,1)
    }));

    trails = Array.from({length:18}, (_,i) => ({
      y:h*rand(.48,.88), amp:rand(18,70), lw:rand(.45,1.35),
      a:rand(.08,.34), phase:rand(0,Math.PI*2),
      speed:rand(.045,.12), bend:rand(.5,1.25), depth:rand(.25,1), i
    }));
  }

  function trailY(x,t) {
    const u=x/w;
    return t.y - h*.34*u
      + Math.sin(u*4.7+t.phase+time*t.speed+scrollY*.00045*t.depth)
        * t.amp * (.22+.78*u)
      + u*u*h*.06*t.bend
      - velocity*.025*t.depth;
  }

  function draw() {
    time += .008;
    velocity *= .82;

    ctx.clearRect(0,0,w,h);

    // Atmospheric glows: only two gradients per frame.
    let g=ctx.createRadialGradient(w*.14,h*.58,0,w*.14,h*.58,Math.max(w,h)*.62);
    g.addColorStop(0,"rgba(0,91,215,.12)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    let gp=ctx.createRadialGradient(w*.86,h*.56,0,w*.86,h*.56,Math.max(w,h)*.48);
    gp.addColorStop(0,"rgba(135,28,255,.08)");
    gp.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=gp; ctx.fillRect(0,0,w,h);

    ctx.globalCompositeOperation="lighter";

    for(const t of trails){
      ctx.beginPath();
      for(let x=-20;x<=w+20;x+=30){
        const y=trailY(x,t);
        x===-20?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.lineWidth=t.lw;
      ctx.strokeStyle=`rgba(${t.i%4===0?"90,45,255":"0,125,255"},${t.a})`;
      ctx.stroke();
    }

    // Six moving energy points; glow drawn with simple circles, not expensive gradients.
    const offsets=[.06,.22,.39,.55,.72,.89];
    offsets.forEach((off,i)=>{
      const u=(off+time*.018*(i+1)+scrollY*.00001)%1.12-.04;
      const x=u*w;
      if(x<0||x>w) return;
      const t=trails[(i*3+2)%trails.length];
      const y=trailY(x,t);
      ctx.fillStyle=i%3===2?"rgba(150,65,255,.13)":"rgba(0,155,255,.14)";
      ctx.beginPath(); ctx.arc(x,y,15+i*.7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=i%3===2?"rgba(190,110,255,.92)":"rgba(125,235,255,.95)";
      ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill();
    });

    for(const p of particles){
      p.x+=p.vx;
      p.y+=p.vy-velocity*.0009*p.depth;
      p.phase+=.016;
      if(p.x<-3)p.x=w+3; if(p.x>w+3)p.x=-3;
      if(p.y<-3)p.y=h+3; if(p.y>h+3)p.y=-3;

      const a=p.a*(.74+.26*Math.sin(p.phase));
      ctx.fillStyle=`rgba(${p.x>w*.6?"95,50,255":"0,145,255"},${a})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }

    ctx.globalCompositeOperation="source-over";
    requestAnimationFrame(draw);
  }

  addEventListener("scroll", () => {
    const now=window.scrollY;
    velocity += now-lastScrollY;
    scrollY=now;
    lastScrollY=now;
  }, {passive:true});

  addEventListener("resize", buildScene, {passive:true});

  buildScene();
  requestAnimationFrame(draw);
})();

document.getElementById("year").textContent=new Date().getFullYear();

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); });
},{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));

const navLinks=[...document.querySelectorAll(".topbar nav a")];
const sections=[...document.querySelectorAll("main section[id]")];
const navObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id));
    }
  });
},{rootMargin:"-35% 0px -55%"});
sections.forEach(s=>navObserver.observe(s));
