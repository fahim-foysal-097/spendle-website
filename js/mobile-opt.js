/* mobile-opt.js
   Mobile-focused performance overrides.
   Applies only for small viewports or when .mobile-optimized is present.
*/
(() => {
  const MOBILE_QUERY = "(max-width: 640px), (pointer: coarse)";
  const mq = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;

  function applyMobileOptimizations() {
    if (!document.body) return;

    // Mark body for CSS helpers
    document.body.classList.add("mobile-optimized");

    // Lazy-load hero and gallery images
    try {
      // hero
      const hero = document.getElementById("heroImage");
      if (hero && !hero.getAttribute("loading"))
        hero.setAttribute("loading", "lazy");

      // gallery
      const galleryImgs = Array.from(
        document.querySelectorAll(".gallery-card img")
      );
      galleryImgs.forEach((img) => {
        if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
        // reduce forced size changes
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      });
    } catch (e) {
      // ignore
    }

    // Reduce paint/will-change hints but keep transitions so scroll fade-in still works
    try {
      const revealTargets = document.querySelectorAll(
        "section, .hero, .container"
      );
      revealTargets.forEach((t) => {
        t.style.willChange = "opacity, transform";
      });
    } catch (e) {
      /* ignore */
    }

    // Shorten modal image transitions
    try {
      const modalImg = document.getElementById("modalImage");
      if (modalImg) {
        modalImg.style.transition = "opacity 140ms linear";
        modalImg.style.cursor = "default";
      }
    } catch (e) {
      /* ignore */
    }

    // Reduce heavy shadows to subtle borders for less paint cost
    try {
      const shadowTargets = document.querySelectorAll(
        ".device-card, .section-inner, .card, .feature-card, .download-card, .about-card"
      );
      shadowTargets.forEach((el) => {
        el.style.boxShadow = "none";
        el.style.border = "1px solid rgba(255,255,255,0.02)";
      });
    } catch (e) {
      /* ignore */
    }

    // Stop heavy CSS animations if present (best-effort)
    try {
      const animatedEls = document.querySelectorAll(".blob, .blob *");
      animatedEls.forEach((el) => {
        el.style.animation = "none";
        el.style.transition = "none";
        el.style.display = "none";
      });
    } catch (e) {
      /* ignore */
    }

    // Accessibility: respect prefers-reduced-motion
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  function removeMobileOptimizations() {
    document.body.classList.remove("mobile-optimized");
    // Intentionally do not revert inline styles fully; desktop uses original CSS
  }

  function handleMatchChange(e) {
    if (e && e.matches) applyMobileOptimizations();
    else removeMobileOptimizations();
  }

  // Init based on current match and set up change listener without using addListener
  if (mq) {
    // Initial
    if (mq.matches) applyMobileOptimizations();

    try {
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handleMatchChange);
      } else {
        // Fallback
        mq.onchange = handleMatchChange;
      }
    } catch (e) {
      // As a last resort, attach a resize-based fallback
      // (not ideal but avoids using deprecated addListener)
      const fallback = () => {
        if (
          window.innerWidth <= 640 ||
          ("ontouchstart" in window && window.innerWidth <= 780)
        )
          applyMobileOptimizations();
        else removeMobileOptimizations();
      };
      window.addEventListener("resize", fallback);
    }
  } else {
    // No matchMedia support: fallback to width check
    if (
      window.innerWidth <= 640 ||
      ("ontouchstart" in window && window.innerWidth <= 780)
    )
      applyMobileOptimizations();
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 640) applyMobileOptimizations();
      else removeMobileOptimizations();
    });
  }

  // Run early but after DOM is available
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {});
  }
})();
