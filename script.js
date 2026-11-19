// Mobile navigation

function toggleMenu() {
    const menu = document.querySelector(".menu-links");

    menu.classList.toggle("open");
}


// Automatic copyright year

document.getElementById("year").textContent =
    new Date().getFullYear();


// Contact form

form.addEventListener("submit", function(event) {

    event.preventDefault();

    alert("Thanks for your message!");

    form.reset();
});

 // Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const themeIcon = document.getElementById("theme-icon");
const themeIconMobile = document.getElementById("theme-icon-mobile");

const themeButtons = [themeToggle, themeToggleMobile].filter(Boolean);
const themeIcons = [themeIcon, themeIconMobile].filter(Boolean);

function updateThemeIcons() {
    const isDark = document.body.classList.contains("dark-theme");

    themeIcons.forEach(icon => {
        icon.textContent = isDark ? "🌙" : "☀️";
    });
}
function updateThemeIcons() {
    const isDark = document.body.classList.contains("dark-theme");

    themeIcons.forEach(icon => {
       icon.textContent = isDark ? "🌙" : "☀️";
    });

    themeButtons.forEach(btn => btn.setAttribute("aria-checked", isDark));
}

function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeIcons();
}

// Restore the saved theme, if one exists
const savedTheme = localStorage.getItem("theme");

if (savedTheme !== null) {
    document.body.classList.toggle(
        "dark-theme",
        savedTheme === "dark"
    );
}

updateThemeIcons();

// Support desktop and mobile buttons
themeButtons.forEach(button => {
    button.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark-theme");
        setTheme(isDark);
    });
});


// =========================
// SCROLL REVEAL ANIMATION
// =========================

const revealElements = document.querySelectorAll(
    '#about, #skills, #projects, #contact, .project-card'
);

revealElements.forEach(element => {
    element.classList.add('reveal');
});

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach(element => {
    revealObserver.observe(element);
});

/* Floating navbar scroll effect */

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



/* =========================
   INTERACTIVE HERO BACKGROUND
========================= */
let heroNetwork = null;

function startHeroNetwork(tries = 0) {
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

startHeroNetwork();




// Re-measure after the profile image finishes loading
window.addEventListener("load", () => {
    if (heroNetwork) heroNetwork.resize();
});

function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcons();
    startHeroNetwork();
}

// =========================
// PROJECT CAROUSEL
// =========================

const track = document.querySelector(".projects-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function scrollProjects(direction) {
    const card = track.querySelector(".project-card");
    const gap = parseFloat(getComputedStyle(track).gap) || 25;

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
updateCarouselButtons();


const form = document.querySelector(".contact-form");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    alert("Thanks for your message!");
    form.reset();
});


