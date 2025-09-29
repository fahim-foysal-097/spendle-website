// Custom cursor + small ripple. Does not initialize on touch/coarse devices.
(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Quit early on touch / coarse pointers — avoid creating DOM or listeners on mobile.
  const mqCoarse =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const hasTouch =
    "ontouchstart" in window ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (mqCoarse || hasTouch) return;

  // Respect reduced-motion
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Create cursor element (if absent)
  let cursor = document.getElementById("customCursor");
  if (!cursor) {
    cursor = document.createElement("div");
    cursor.id = "customCursor";
    cursor.className = "custom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
  }

  // Quick follow: lerp factor close to 1 => very fast
  const lerpFactor = prefersReducedMotion ? 1.0 : 0.96;

  // Position state
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;
  let rafId = null;

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function loop() {
    if (lerpFactor >= 1) {
      curX = mouseX;
      curY = mouseY;
    } else {
      curX += (mouseX - curX) * lerpFactor;
      curY += (mouseY - curY) * lerpFactor;
    }

    // Use translate3d for GPU compositing
    cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;

    rafId = requestAnimationFrame(loop);
  }

  // Small ripple creation
  function createRipple(x, y) {
    if (prefersReducedMotion) return;
    const r = document.createElement("div");
    r.className = "cursor-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    document.body.appendChild(r);

    r.addEventListener(
      "animationend",
      () => {
        if (r && r.parentNode) r.parentNode.removeChild(r);
      },
      { once: true }
    );

    // safety remove
    setTimeout(() => {
      if (r && r.parentNode) r.parentNode.removeChild(r);
    }, 900);
  }

  // Mouse down/up visuals
  function onMouseDown(e) {
    if (e.button !== 0) return;
    cursor.classList.add("cursor--down");
    createRipple(e.clientX, e.clientY);
  }
  function onMouseUp(e) {
    if (e.button !== 0) return;
    cursor.classList.remove("cursor--down");
  }

  // Hover logic: attach handlers to interactive elements
  const hoverSelector = [
    "a[href]",
    "button",
    ".btn",
    "input",
    "textarea",
    "select",
    '[role="button"]',
    ".gallery-card",
    ".nav-link",
    ".btn-download",
  ].join(",");

  function bindHoverListeners() {
    let nodes;
    try {
      nodes = document.querySelectorAll(hoverSelector);
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((el) => {
      // ensure idempotent listeners
      if (!el.__cursorBound) {
        el.addEventListener(
          "mouseenter",
          () => cursor.classList.add("cursor--hover"),
          { passive: true }
        );
        el.addEventListener(
          "mouseleave",
          () => cursor.classList.remove("cursor--hover"),
          { passive: true }
        );

        // for inputs: hide cursor when typing to keep caret clear
        if (el.matches && el.matches("input, textarea, [contenteditable]")) {
          el.addEventListener("focus", () => (cursor.style.display = "none"), {
            passive: true,
          });
          el.addEventListener("blur", () => (cursor.style.display = ""), {
            passive: true,
          });
          el.addEventListener(
            "mouseenter",
            () => (cursor.style.display = "none"),
            { passive: true }
          );
          el.addEventListener("mouseleave", () => (cursor.style.display = ""), {
            passive: true,
          });
        }
        el.__cursorBound = true;
      }
    });
  }

  // MutationObserver to rebind when new interactive nodes are added
  const observer = new MutationObserver(() => {
    if (observer._t) clearTimeout(observer._t);
    observer._t = setTimeout(bindHoverListeners, 120);
  });

  // Listeners
  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mousedown", onMouseDown, { passive: true });
  document.addEventListener("mouseup", onMouseUp, { passive: true });

  bindHoverListeners();
  observer.observe(document.body, { childList: true, subtree: true });

  // Start RAF loop
  rafId = requestAnimationFrame(loop);

  // Cleanup on unload
  window.addEventListener(
    "beforeunload",
    () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    },
    { passive: true }
  );
})();
