(() => {
  // Hardcoded fallback links (v1.5.0)
  const LINKS = {
    arm64:
      "https://github.com/fahim-foysal-097/Spendle/releases/download/v1.5.0/spendle-v1.5.0-arm64-v8a.apk",
    armeabi:
      "https://github.com/fahim-foysal-097/Spendle/releases/download/v1.5.0/spendle-v1.5.0-armeabi-v7a.apk",
    x86: "https://github.com/fahim-foysal-097/Spendle/releases/download/v1.5.0/spendle-v1.5.0-x86_64.apk",
  };

  document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    initButtons();
    setupGalleryLightbox();
    initSmoothScroll();
    animateSections();
  });

  function setCurrentYear() {
    const el = document.getElementById("curYear");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- BUTTONS / DOWNLOAD ---------- */
  function initButtons() {
    const mapping = [
      { id: "btn-arm64", key: "arm64" },
      { id: "btn-armeabi", key: "armeabi" },
      { id: "btn-x86", key: "x86" },
    ];

    mapping.forEach(({ id, key }) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.target = "_self";
      btn.href = LINKS[key];
      btn.addEventListener(
        "click",
        async (e) => {
          if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button === 1
          )
            return;

          e.preventDefault();
          const url = LINKS[key];
          if (!url) {
            flashButtonError(btn, "Not available");
            return;
          }
          await downloadApk(url, btn);
        },
        { passive: false }
      );
    });
  }

  function flashButtonError(btn, message = "Error") {
    const prev = btn.textContent;
    btn.textContent = message;
    btn.classList.add("disabled");
    setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("disabled");
    }, 2500);
  }

  function setButtonLoading(btn, loadingText = "Downloading…") {
    btn.dataset._prevText = btn.textContent;
    btn.textContent = loadingText;
    btn.classList.add("disabled");
  }
  function resetButton(btn) {
    if (btn.dataset._prevText) {
      btn.textContent = btn.dataset._prevText;
      delete btn.dataset._prevText;
    }
    btn.classList.remove("disabled");
  }

  async function downloadApk(url, btn) {
    setButtonLoading(btn);
    try {
      const resp = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
      });
      if (!resp.ok) return (window.location.href = url);

      const blob = await resp.blob();
      const filename =
        getFilenameFromResponse(resp) ||
        deriveFilenameFromUrl(url) ||
        "spendle.apk";
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl, filename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      btn.textContent = "Done ✓";
      setTimeout(() => resetButton(btn), 1400);
    } catch (err) {
      console.warn("Fetch error:", err);
      window.location.href = url;
    }
  }

  function getFilenameFromResponse(response) {
    try {
      const dispo = response.headers.get("content-disposition");
      if (!dispo) return null;
      const match =
        /filename\*=UTF-8''(.+)$/.exec(dispo) ||
        /filename="?([^"]+)"?/.exec(dispo);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function deriveFilenameFromUrl(url) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/");
      return parts.pop() || parts.pop();
    } catch (e) {
      return null;
    }
  }

  function triggerDownload(objectUrl, filename) {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- GALLERY ---------- */
  function setupGalleryLightbox() {
    const modalEl = document.getElementById("screenshotModal");
    const modalImage = document.getElementById("modalImage");
    if (!modalEl || !modalImage) return;

    let bsModal;
    try {
      bsModal = bootstrap.Modal.getOrCreateInstance(modalEl, {
        backdrop: true,
        keyboard: true,
      });
    } catch (err) {
      return;
    }

    document.querySelectorAll(".gallery-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const full = card.getAttribute("data-full");
        if (!full) return;
        modalImage.src = full;
        bsModal.show();
      });
    });

    modalImage.addEventListener("click", () => {
      try {
        bsModal.hide();
      } catch {}
    });
    modalEl.addEventListener("hidden.bs.modal", () => {
      modalImage.src = "";
    });
  }

  /* ---------- SMOOTH SCROLL & SECTION FADE ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 50,
          behavior: "smooth",
        });
      });
    });
  }

  function animateSections() {
    const sections = document.querySelectorAll("section, .hero, .container");
    sections.forEach((sec) => {
      sec.style.opacity = 0;
      sec.style.transform = "translateY(25px)";
      sec.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
})();

/* ---------- PAGE TRANSITIONS ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Fade in on page load
  document.body.classList.add("fade-in");

  // Attach click handlers to internal links
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    // Only handle same-domain HTML links
    if (
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !href.startsWith("mailto:") &&
      !href.endsWith(".apk")
    ) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = link.href;

        // Add fade-out
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        // Wait for transition to finish before navigating
        setTimeout(() => {
          window.location.href = url;
        }, 400); // match the CSS duration (0.5s)
      });
    }
  });
});
