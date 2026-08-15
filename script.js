(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     HEADER: compact state on scroll
  --------------------------------------------------------- */
  var header = document.getElementById("site-header");

  function onScrollHeader() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function setMenuState(open) {
    if (!menuToggle || !mobileNav) return;

    mobileNav.classList.toggle("is-open", open);
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    header.classList.toggle("menu-active", open);
  }

  function closeMobileNav() {
    setMenuState(false);
  }

  function openMobileNav() {
    setMenuState(true);
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      setMenuState(!mobileNav.classList.contains("is-open"));
    });

    var mobileLinks = mobileNav.querySelectorAll("a");
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeMobileNav();
        menuToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    // stagger index for hero elements
    var heroReveals = document.querySelectorAll(".hero [data-reveal]");
    heroReveals.forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Hero elements reveal immediately on load
    heroReveals.forEach(function (el) {
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    });
  }

  /* ---------------------------------------------------------
     LIGHT PARALLAX (desktop only, respects reduced motion)
  --------------------------------------------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var enableParallax = !reduceMotion && window.innerWidth > 900 && parallaxEls.length;
  var ticking = false;

  function updateParallax() {
    var viewportH = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var centerOffset = rect.top + rect.height / 2 - viewportH / 2;
      var shift = Math.max(-16, Math.min(16, centerOffset * -0.02));
      var img = el.querySelector("img");
      if (img) {
        img.style.transform = "translateY(" + shift + "px) scale(1.06)";
      }
    });
    ticking = false;
  }

  function requestParallaxUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  if (enableParallax) {
    parallaxEls.forEach(function (el) {
      var img = el.querySelector("img");
      if (img) img.style.willChange = "transform";
    });
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    updateParallax();
  }

  /* ---------------------------------------------------------
     "¿QUÉ NECESITAS HOY?" — interactive tabs
  --------------------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".moment-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".moment-panel"));

  function activateTab(tab) {
    var target = tab.getAttribute("data-target");

    tabs.forEach(function (t) {
      var isActive = t === tab;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach(function (p) {
      if (p.getAttribute("data-panel") === target) {
        p.hidden = false;
        p.classList.add("is-active");
        // restart animation
        p.style.animation = "none";
        // eslint-disable-next-line no-unused-expressions
        p.offsetHeight;
        p.style.animation = "";
      } else {
        p.hidden = true;
        p.classList.remove("is-active");
      }
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });

    tab.addEventListener("keydown", function (e) {
      var newIndex = null;
      if (e.key === "ArrowRight") newIndex = (index + 1) % tabs.length;
      if (e.key === "ArrowLeft") newIndex = (index - 1 + tabs.length) % tabs.length;
      if (newIndex !== null) {
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(tabs[newIndex]);
      }
    });
  });

  /* ---------------------------------------------------------
     Keep mobile navigation state in sync with viewport
  --------------------------------------------------------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && mobileNav && mobileNav.classList.contains("is-open")) {
      closeMobileNav();
    }
  });
})();
