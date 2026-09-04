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

// Mobile Nexus-style flyout menu.
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuButton && mobileMenu) {
  const setMobileMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    mobileMenuButton.setAttribute('aria-expanded', String(open));
    mobileMenuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  mobileMenuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileMenu(!mobileMenu.classList.contains('open'));
  });

  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMobileMenu(false);
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.classList.contains('open')) return;
    if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
      setMobileMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMobileMenu(false);
  });
}
