/**
 * scroll.js - Gestion du défilement
 */

function initScrollUtils() {
  // Back to top button
  const backToTopBtn = document.createElement("button");
  backToTopBtn.className = "back-to-top";
  backToTopBtn.innerHTML = '<i class="ri-arrow-up-line"></i>';
  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  function toggleBackToTopButton() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  }

  // Scroll to top on click
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Update on scroll
  window.addEventListener("scroll", toggleBackToTopButton);

  // Initial check
  toggleBackToTopButton();

  // Parallax scroll effect
  const parallaxElements = document.querySelectorAll(".parallax");

  function updateParallax() {
    parallaxElements.forEach((element) => {
      const speed = element.getAttribute("data-parallax-speed") || 0.5;
      const windowTop = window.scrollY;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;

      // Check if element is in viewport
      if (
        windowTop > elementTop - window.innerHeight &&
        windowTop < elementTop + elementHeight
      ) {
        const distance = windowTop - elementTop;
        const parallaxOffset = distance * speed;

        element.style.transform = `translateY(${parallaxOffset}px)`;
      }
    });
  }

  // Update on scroll
  window.addEventListener("scroll", updateParallax);

  // Scroll animations with IntersectionObserver
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.getAttribute("data-animation") || "fade-in";
          const delay = element.getAttribute("data-delay") || 0;

          setTimeout(() => {
            element.classList.add("animated", animation);
          }, delay);

          // Unobserve after animation
          animationObserver.unobserve(element);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  // Observe all animated elements
  animatedElements.forEach((element) => {
    animationObserver.observe(element);
  });

  // Smooth scrolling for all anchor links
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Update URL
          history.pushState(null, null, targetId);
        }
      });
    });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initScrollUtils);
