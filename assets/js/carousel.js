// Lightweight carousel: scroll-snap track + prev/next buttons.
// Also drives the mobile nav toggle and dropdown taps.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    if (!track) return;

    function scrollByCard(direction) {
      var card = track.querySelector(".post-card");
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      track.scrollBy({ left: direction * step, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { scrollByCard(-1); });
    if (next) next.addEventListener("click", function () { scrollByCard(1); });
  });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  // Tap-to-open dropdowns on touch/mobile (hover doesn't apply).
  document.querySelectorAll(".nav-item.has-children > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width: 780px)").matches) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });
});
