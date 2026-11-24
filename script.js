/* =========================
   MOBILE NAVIGATION
========================= */

function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");

    const isOpen = menu.classList.toggle("open");
    icon.setAttribute("aria-expanded", String(isOpen));
    icon.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

// Close the mobile menu with Escape
document.addEventListener("keydown", event => {
    const menu = document.querySelector(".menu-links");

    if (event.key === "Escape" && menu && menu.classList.contains("open")) {
        toggleMenu();
        document.querySelector(".hamburger-icon").focus();
    }
});


/* =========================
   AUTOMATIC COPYRIGHT YEAR
========================= */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* =========================
   THEME TOGGLE
========================= */

const themeButtons = [
    document.getElementById("theme-toggle"),
    document.getElementById("theme-toggle-mobile")
].filter(Boolean);

const themeIcons = [
    document.getElementById("theme-icon"),
    document.getElementById("theme-icon-mobile")
].filter(Boolean);

function updateThemeIcons() {
    const isDark = document.body.classList.contains("dark-theme");

    themeIcons.forEach(icon => {
        icon.textContent = isDark ? "🌙" : "☀️";
    });

    themeButtons.forEach(btn => btn.setAttribute("aria-checked", String(isDark)));
}

function setTheme(isDark, save = true) {
    document.body.classList.toggle("dark-theme", isDark);

    if (save) {
        try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
    }

    updateThemeIcons();
    startHeroNetwork();
}

// Restore the saved theme; otherwise follow the visitor's system setting
function getInitialTheme() {
    try {
        const saved = localStorage.getItem("theme");
        if (saved !== null) return saved === "dark";
    } catch (e) {}

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

themeButtons.forEach(button => {
    button.addEventListener("click", () => {
        setTheme(!document.body.classList.contains("dark-theme"));
    });
});


/* =========================
   INTERACTIVE HERO BACKGROUND
========================= */

let heroNetwork = null;

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startHeroNetwork(tries = 0) {
    // Skip the animation for visitors who prefer reduced motion
    if (prefersReducedMotion) return;

    // Wait for the CDN libraries (retry for about 5 seconds)
    if (!window.VANTA || !window.THREE) {
        if (tries < 20) setTimeout(() => startHeroNetwork(tries + 1), 250);
        return;
    }

    // Remove the old animation so canvases don't stack
    if (heroNetwork) heroNetwork.destroy();

    const isDark = document.body.classList.contains("dark-theme");

    heroNetwork = window.VANTA.NET({
        el: "#profile",
        THREE: window.THREE,

        mouseControls: true,
        touchControls: true,
        gyroControls: false,

        scale: 1,
        scaleMobile: 0.8,

        color: 0xE87532,
        backgroundColor: isDark ? 0x171717 : 0xF5F1EA,

        points: 5,
        maxDistance: 22,
        spacing: 20,
        showDots: false
    });
}

// Re-measure after images finish loading
window.addEventListener("load", () => {
    if (heroNetwork) heroNetwork.resize();
});

// Apply the starting theme (this also starts the hero animation)
setTheme(getInitialTheme(), false);


/* =========================
   SCROLL REVEAL ANIMATION
========================= */

const revealElements = document.querySelectorAll(
    "#about, #skills, #projects, #contact, .project-card"
);

if ("IntersectionObserver" in window) {
    revealElements.forEach(element => element.classList.add("reveal"));

    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach(element => revealObserver.observe(element));
}


/* =========================
   FLOATING NAVBAR + ACTIVE LINK
========================= */

const navbars = [
    document.getElementById("desktop-nav"),
    document.getElementById("hamburger-nav")
].filter(Boolean);

function updateNavbar() {
    navbars.forEach(navbar => {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    });
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

// Highlight the nav link of the section currently in view
const navLinks = document.querySelectorAll(
    ".nav-links a[href^='#'], .menu-links a[href^='#']"
);

const spySections = ["about", "skills", "projects", "contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

if ("IntersectionObserver" in window) {
    const spyObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                navLinks.forEach(link => {
                    const active = link.getAttribute("href") === "#" + entry.target.id;
                    link.classList.toggle("active", active);

                    if (active) link.setAttribute("aria-current", "true");
                    else link.removeAttribute("aria-current");
                });
            });
        },
        // A section counts as "current" while it crosses the middle of the screen
        { rootMargin: "-45% 0px -50% 0px" }
    );

    spySections.forEach(section => spyObserver.observe(section));
}


/* =========================
   PROJECT CAROUSEL
========================= */

const track = document.querySelector(".projects-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (track && prevBtn && nextBtn) {

    function scrollProjects(direction) {
        const card = track.querySelector(".project-card");
        const gap = parseFloat(getComputedStyle(track).columnGap) || 25;

        track.scrollBy({
            left: direction * (card.offsetWidth + gap),
            behavior: "smooth"
        });
    }

    function updateCarouselButtons() {
        const maxScroll = track.scrollWidth - track.clientWidth;

        prevBtn.disabled = track.scrollLeft <= 5;
        nextBtn.disabled = track.scrollLeft >= maxScroll - 5;
    }

    prevBtn.addEventListener("click", () => scrollProjects(-1));
    nextBtn.addEventListener("click", () => scrollProjects(1));
    track.addEventListener("scroll", updateCarouselButtons, { passive: true });
    window.addEventListener("resize", updateCarouselButtons);

    // Arrow keys move the carousel when it has focus
    track.setAttribute("tabindex", "0");
    track.setAttribute("aria-label", "Projects");
    track.addEventListener("keydown", event => {
        if (event.key === "ArrowRight") { event.preventDefault(); scrollProjects(1); }
        if (event.key === "ArrowLeft")  { event.preventDefault(); scrollProjects(-1); }
    });

    updateCarouselButtons();
}
