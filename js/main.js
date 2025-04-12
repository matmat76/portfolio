/**
 * main.js - Initialisation et configuration principale
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialisation des modules
  initNavigation();
  initTimeline();
  initProjectFilter();
  initCustomCursor();
  initScrollAnimations();

  // Fonction pour gérer les reveal animations au scroll
  function initScrollAnimations() {
    const revealElements = document.querySelectorAll(".reveal");

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;

      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
          element.classList.add("active");
        }
      });
    };

    // Initial check
    revealOnScroll();

    // Listener for scroll
    window.addEventListener("scroll", revealOnScroll);
  }

  // Fonction pour initialiser le curseur personnalisé
  function initCustomCursor() {
    const cursor = document.querySelector(".custom-cursor");

    if (!cursor) return;

    // Update cursor position
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    // Add hover effect on interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, .project-card, .tech-icon, .filter-btn"
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        cursor.classList.add("hover");
      });

      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover");
      });
    });
  }

  // Function to handle header on scroll
  const header = document.getElementById("main-header");

  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  // Initial check
  updateHeader();

  // Listener for scroll
  window.addEventListener("scroll", updateHeader);

  // Contact form handling
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      // Basic validation
      if (!formData.name || !formData.email || !formData.message) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";

      // Simulate API call
      setTimeout(() => {
        console.log("Form submitted:", formData);

        // Reset form
        contactForm.reset();

        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Show success message
        alert("Votre message a été envoyé avec succès !");
      }, 1500);
    });
  }

  // Create animated particles
  function createParticles() {
    const particlesContainer = document.querySelector(".particles-container");

    if (!particlesContainer) return;

    const particlesCount = 8;

    for (let i = 0; i < particlesCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random size
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;

      // Random animation
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;

      // Random opacity
      particle.style.opacity = (Math.random() * 0.6 + 0.2).toString();

      // Add to container
      particlesContainer.appendChild(particle);
    }
  }

  createParticles();
});
