import SITE_CONFIG from "./config.js";

function navLink(href, label, activePage) {
  const activeClass = activePage === href ? "is-active" : "";
  return `<li><a class="${activeClass}" href="${href}">${label}</a></li>`;
}

function scrollLink(targetId, label, activePage) {
  // For scroll links (like About, Experience, and Contact on homepage)
  return `<li><a href="#${targetId}" data-scroll="${targetId}">${label}</a></li>`;
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateValue));
}

export function setStatus(element, message, variant = "") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.style.display = "block";  // ← Make sure it's visible
  element.classList.remove("status-success", "status-error");
  element.classList.remove("is-hidden");
  
  if (variant === "success") {
    element.classList.add("status-success");
  }
  if (variant === "error") {
    element.classList.add("status-error");
  }
}

export function hideStatus(element) {
  if (element) {
    element.classList.add("is-hidden");
  }
}

export function bindProfileContent() {
  document.querySelectorAll("[data-profile-name]").forEach((node) => {
    node.textContent = SITE_CONFIG.profile.name;
  });
  document.querySelectorAll("[data-profile-role]").forEach((node) => {
    node.textContent = SITE_CONFIG.profile.role;
  });
  document.querySelectorAll("[data-profile-summary]").forEach((node) => {
    node.textContent = SITE_CONFIG.profile.summary;
  });
}

function initMobileMenu() {
  const menuIcon = document.getElementById("menu-icon");
  const navLinks = document.querySelector(".nav-links");
  
  if (menuIcon && navLinks) {
    menuIcon.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
    
    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }
}

function initScrollLinks() {
  // Handle scroll links (About, Experience, Contact) on homepage
  const scrollLinks = document.querySelectorAll('[data-scroll]');
  scrollLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-scroll");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

export function initSite(activePage) {
  document.title = activePage === "index.html" ? SITE_CONFIG.site.title : `${document.title}`;

  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  if (header) {
    header.className = "header";
    
    // Different nav structure based on current page
    let navLinksHtml = "";
    
    if (activePage === "index.html") {
      // On homepage: About, Experience, and Contact scroll to sections
      navLinksHtml = `
        <li><a href="#about" data-scroll="about">About</a></li>
        <li><a href="#experience" data-scroll="experience">Experience</a></li>
        <li><a href="#articles" data-scroll="articles">Articles</a></li>
        <li><a href="videos.html">Videos</a></li>
        <li><a href="#contact" data-scroll="contact">Contact</a></li>
      `;
    } else {
      // On other pages: all links go to pages
      navLinksHtml = `
        <li><a href="index.html">About</a></li>
        <li><a href="index.html#experience">Experience</a></li>
        <li><a href="index.html#articles">Articles</a></li>
        <li><a href="videos.html">Videos</a></li>
        <li><a href="index.html#contact">Contact</a></li>
      `;
    }
    
    header.innerHTML = `
      <a class="logo" href="index.html">Melissa Christensen</a>
      <ul class="nav-links">
        ${navLinksHtml}
      </ul>
      <a class="visit-btn" href="resume.pdf" download>Resume</a>
      <i class="fa-solid fa-bars" id="menu-icon"></i>
    `;
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize scroll links (only works on homepage)
    if (activePage === "index.html") {
      initScrollLinks();
    }
  }

  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <p>Melissa Christensen</p>
      <p><a class="footer-link" href="resume.pdf" download>Resume PDF</a></p>
    `;
  }

  bindProfileContent();
}
