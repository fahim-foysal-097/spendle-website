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
      const galleryImgs = document.querySelectorAll(".gallery-card img");
      galleryImgs.forEach((img) => {
        if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
        // reduce forced size changes
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      });
    } catch (e) {
      // ignore
    }

    // Reduce shadows
    try {
      const shadowTargets = document.querySelectorAll(
        " .section-inner, .card, .feature-card, .download-card, .about-card"
      );
      shadowTargets.forEach((el) => {
        el.style.boxShadow = "none";
        el.style.border = "1px solid rgba(255,255,255,0.02)";
      });
    } catch (e) {
      /* ignore */
    }

    // Short modal image transition
    try {
      const modalImg = document.getElementById("modalImage");
      if (modalImg) {
        modalImg.style.transition = "opacity 120ms linear";
        modalImg.style.cursor = "default";
      }
    } catch (e) {}

    // Accessibility: reduced motion
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
})();
