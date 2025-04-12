/**
 * project-filter.js - Filtrage des projets
 */

function initProjectFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-card");

  if (!filterButtons.length || !projectItems.length) return;

  // Show all projects initially
  projectItems.forEach((item) => {
    item.classList.add("visible");
  });

  // Filter projects on button click
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get filter value
      const filter = button.getAttribute("data-filter");

      // Toggle active state
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter projects
      filterProjects(filter);
    });
  });

  function filterProjects(filter) {
    // GSAP animation if available
    if (window.gsap) {
      // Hide all projects first
      gsap.to(projectItems, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.3,
        onComplete: () => {
          // Apply filter
          projectItems.forEach((item) => {
            if (filter === "all" || item.classList.contains(filter)) {
              item.style.display = "block";
            } else {
              item.style.display = "none";
            }
          });

          // Show filtered projects
          gsap.to(projectItems, {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.3,
            delay: 0.1,
          });
        },
      });
    } else {
      // Regular CSS transitions
      projectItems.forEach((item) => {
        item.classList.remove("visible");

        if (filter === "all" || item.classList.contains(filter)) {
          setTimeout(() => {
            item.style.display = "block";

            setTimeout(() => {
              item.classList.add("visible");
            }, 10);
          }, 300);
        } else {
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    }
  }
}
