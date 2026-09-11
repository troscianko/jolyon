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

  // Click-to-open dropdowns (works for touch/trackpad, not just mouse hover).
  // Always prevent default so the "#" link never grabs focus permanently —
  // that was leaving :focus-within stuck true and the dropdown stuck open.
  var dropdownItems = document.querySelectorAll(".nav-item.has-children");
  dropdownItems.forEach(function (item) {
    var link = item.querySelector(":scope > a");
    if (!link) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = item.classList.contains("open");
      dropdownItems.forEach(function (other) { other.classList.remove("open"); });
      item.classList.toggle("open", !isOpen);
      link.blur();
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item.has-children")) {
      dropdownItems.forEach(function (item) { item.classList.remove("open"); });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdownItems.forEach(function (item) { item.classList.remove("open"); });
    }
  });
});
