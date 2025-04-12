/**
 * animations.js - Utilitaires d'animation
 */

// Animation des nouveaux éléments de compétence
function animateSkillItems() {
  const skillItems = document.querySelectorAll(".skill-item-new");

  if (!skillItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Animer avec un délai progressif
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 100);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  skillItems.forEach((item) => {
    observer.observe(item);
  });
}

// Fonction pour animer l'entrée des éléments
function animateOnScroll() {
  const elements = document.querySelectorAll(".reveal");

  if (!elements.length) return;

  // Animation function
  const reveal = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  };

  // Create observer
  const observer = new IntersectionObserver(reveal, {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  });

  // Observe all elements
  elements.forEach((element) => {
    observer.observe(element);
  });
}

// Fonction pour créer une transition de texte
function textTransition(element, texts, options = {}) {
  const defaults = {
    duration: 3000,
    delay: 200,
    fade: 400,
  };

  const settings = { ...defaults, ...options };

  if (!element) return;

  let index = 0;

  function changeText() {
    // Fade out
    element.style.opacity = "0";

    // Change text after fade out
    setTimeout(() => {
      element.textContent = texts[index];

      // Fade in
      element.style.opacity = "1";

      // Increment index
      index = (index + 1) % texts.length;
    }, settings.fade);

    // Schedule next change
    setTimeout(changeText, settings.duration);
  }

  // Initial delay
  setTimeout(changeText, settings.delay);
}

// Remplacer l'ancienne fonction animateSkillBars dans l'initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded - initializing animations");
  animateOnScroll();
  animateSkillItems();
});
