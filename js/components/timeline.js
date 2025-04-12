/**
 * timeline.js - Fonctionnalités de la chronologie
 */

function initTimeline() {
  // Animation des éléments de la timeline au scroll
  const timelineItems = document.querySelectorAll(".timeline-item");

  function animateTimelineItems() {
    const windowHeight = window.innerHeight;

    timelineItems.forEach((item, index) => {
      const itemTop = item.getBoundingClientRect().top;

      if (itemTop < windowHeight - 150) {
        // Add animation with staggered delay
        setTimeout(() => {
          item.classList.add("animated", "slide-left");
        }, index * 150);
      }
    });
  }

  // Initial check
  animateTimelineItems();

  // Listen for scroll
  window.addEventListener("scroll", animateTimelineItems);

  // Interactive timeline badges
  timelineItems.forEach((item) => {
    const badge = item.querySelector(".timeline-badge");

    if (badge) {
      badge.addEventListener("mouseenter", () => {
        item.classList.add("active");
      });

      badge.addEventListener("mouseleave", () => {
        item.classList.remove("active");
      });
    }
  });

  // Horizontal timeline functionality (if present)
  const timelineHorizontal = document.querySelector(".timeline-horizontal");

  if (timelineHorizontal) {
    const timelinePoints =
      timelineHorizontal.querySelectorAll(".timeline-point");

    timelinePoints.forEach((point) => {
      point.addEventListener("click", () => {
        // Remove active class from all points
        timelinePoints.forEach((p) => p.classList.remove("active"));

        // Add active class to clicked point
        point.classList.add("active");

        // Get associated content id
        const contentId = point.getAttribute("data-content");

        if (contentId) {
          // Hide all content
          document
            .querySelectorAll(".timeline-content-item")
            .forEach((content) => {
              content.classList.remove("active");
            });

          // Show selected content
          const selectedContent = document.getElementById(contentId);
          if (selectedContent) {
            selectedContent.classList.add("active");

            // Smooth scroll to content if needed
            selectedContent.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    });

    // Drag functionality for horizontal timeline
    let isDragging = false;
    let startX;
    let scrollLeft;

    timelineHorizontal.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX - timelineHorizontal.offsetLeft;
      scrollLeft = timelineHorizontal.scrollLeft;
      timelineHorizontal.style.cursor = "grabbing";
    });

    timelineHorizontal.addEventListener("mouseleave", () => {
      isDragging = false;
      timelineHorizontal.style.cursor = "grab";
    });

    timelineHorizontal.addEventListener("mouseup", () => {
      isDragging = false;
      timelineHorizontal.style.cursor = "grab";
    });

    timelineHorizontal.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const x = e.pageX - timelineHorizontal.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      timelineHorizontal.scrollLeft = scrollLeft - walk;
    });

    // Mobile touch events
    timelineHorizontal.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].pageX - timelineHorizontal.offsetLeft;
      scrollLeft = timelineHorizontal.scrollLeft;
    });

    timelineHorizontal.addEventListener("touchend", () => {
      isDragging = false;
    });

    timelineHorizontal.addEventListener("touchmove", (e) => {
      if (!isDragging) return;

      const x = e.touches[0].pageX - timelineHorizontal.offsetLeft;
      const walk = (x - startX) * 2;
      timelineHorizontal.scrollLeft = scrollLeft - walk;
    });
  }
}
