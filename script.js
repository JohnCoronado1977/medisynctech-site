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
