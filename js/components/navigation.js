/**
 * navigation.js - Gestion de la navigation
 */

function initNavigation() {
  // Drawer navigation
  const drawerOpenBtn = document.getElementById("drawer-open-btn");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const drawerNav = document.getElementById("drawer-nav");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  // Open drawer
  if (drawerOpenBtn) {
    drawerOpenBtn.addEventListener("click", () => {
      drawerNav.classList.add("active");
      drawerOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Close drawer
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", closeDrawer);
  }

  // Close drawer on overlay click
  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", closeDrawer);
  }

  // Close drawer on link click
  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  function closeDrawer() {
    drawerNav.classList.remove("active");
    drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Highlight active menu item based on scroll position
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlightNavLink() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        // Remove active class from all links
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });

        // Add active class to corresponding link
        const activeLink = document.querySelector(
          `.nav-link[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }

  // Initial check
  highlightNavLink();

  // Listen for scroll
  window.addEventListener("scroll", highlightNavLink);

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });
}
