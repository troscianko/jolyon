// Photo overlay + lightbox. Handles two kinds of images:
//   1. Anything rendered via _includes/photo.html or gallery.html — already carries
//      data-photo plus data-title/excerpt/caption/full attributes.
//   2. Plain <img> tags inside post/page content areas (hero image, inline body images) —
//      matched against the site's photo metadata by path so they get the same overlay and
//      lightbox treatment without needing to go through an include.
// Post-card thumbnails are deliberately not touched here: they already link to their post,
// and stealing their click for a lightbox would break that navigation.
document.addEventListener("DOMContentLoaded", function () {
  var photoMeta = {};
  try {
    var metaEl = document.getElementById("photo-metadata");
    if (metaEl && metaEl.textContent.trim()) photoMeta = JSON.parse(metaEl.textContent);
  } catch (e) {
    photoMeta = {};
  }
  var baseurl = window.SITE_BASEURL || "";

  function stripBaseurl(src) {
    if (baseurl && src.indexOf(baseurl) === 0) return src.slice(baseurl.length);
    return src;
  }

  function displaySrcFor(rawSrc) {
    var path = stripBaseurl(rawSrc);
    if (path.indexOf("/assets/images/derived/") === 0) return rawSrc;
    return rawSrc.replace("/assets/images/", "/assets/images/derived/display/");
  }

  // photoMeta is keyed by each image's original (non-derived) path — plain
  // content images default to their derived/display/ copy now, so map back
  // to the original path before looking up metadata.
  function originalPathFor(strippedSrc) {
    return strippedSrc.replace(/^\/assets\/images\/derived\/(thumb|display)\//, "/assets/images/");
  }

  var photos = Array.prototype.slice.call(document.querySelectorAll("[data-photo]"));

  var plainImgs = Array.prototype.slice
    .call(document.querySelectorAll(".post-hero img, .content img, .blurb img, .pub-media img"))
    .filter(function (img) {
      return !img.closest("[data-photo]");
    });

  plainImgs.forEach(function (img) {
    var rawSrc = img.getAttribute("src");
    var key = originalPathFor(stripBaseurl(rawSrc));
    // Publication thumbnails keep the click-to-enlarge lightbox but never show a
    // caption — a title/excerpt overlay doesn't make sense for a paper figure.
    var meta = img.closest(".pub-media") ? null : photoMeta[key];

    var figure = document.createElement("figure");
    figure.className = "photo photo-plain";
    figure.setAttribute("data-photo", "");
    figure.setAttribute("data-gallery", "page");
    figure.setAttribute("data-full", displaySrcFor(rawSrc));

    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);

    if (meta) {
      figure.setAttribute("data-title", meta.title || "");
      figure.setAttribute("data-excerpt", meta.excerpt || "");
      if (meta.caption_html) figure.setAttribute("data-caption", meta.caption_html);

      if (meta.title || meta.excerpt) {
        var overlay = document.createElement("div");
        overlay.className = "photo-overlay";
        var strong = document.createElement("strong");
        strong.textContent = meta.title || "";
        overlay.appendChild(strong);
        if (meta.excerpt) {
          var span = document.createElement("span");
          span.textContent = meta.excerpt;
          overlay.appendChild(span);
        }
        figure.appendChild(overlay);
      }
    }

    photos.push(figure);
  });

  if (photos.length === 0) return;

  var groups = {};
  photos.forEach(function (fig) {
    var g = fig.getAttribute("data-gallery") || "page";
    (groups[g] = groups[g] || []).push(fig);
  });

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  var imgEl = lightbox.querySelector(".lightbox-image");
  var titleEl = lightbox.querySelector(".lightbox-title");
  var excerptEl = lightbox.querySelector(".lightbox-excerpt");
  var captionEl = lightbox.querySelector(".lightbox-caption");
  var closeBtn = lightbox.querySelector(".lightbox-close");
  var prevBtn = lightbox.querySelector(".lightbox-prev");
  var nextBtn = lightbox.querySelector(".lightbox-next");

  var currentGroup = null;
  var currentIndex = 0;

  function show(group, index) {
    currentGroup = group;
    currentIndex = (index + group.length) % group.length;
    var fig = group[currentIndex];
    var title = fig.getAttribute("data-title");
    var excerpt = fig.getAttribute("data-excerpt");
    var caption = fig.getAttribute("data-caption");

    imgEl.src = fig.getAttribute("data-full");
    imgEl.alt = title || "";
    titleEl.textContent = title || "";
    titleEl.hidden = !title;
    excerptEl.textContent = excerpt || "";
    excerptEl.hidden = !excerpt;
    if (caption) {
      captionEl.innerHTML = caption;
      captionEl.hidden = false;
    } else {
      captionEl.innerHTML = "";
      captionEl.hidden = true;
    }

    var multi = group.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.hidden = true;
    imgEl.src = "";
    document.body.style.overflow = "";
  }

  function step(delta) {
    if (!currentGroup) return;
    show(currentGroup, currentIndex + delta);
  }

  photos.forEach(function (fig) {
    fig.addEventListener("click", function () {
      var g = groups[fig.getAttribute("data-gallery") || "page"];
      show(g, g.indexOf(fig));
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () {
    step(-1);
  });
  nextBtn.addEventListener("click", function () {
    step(1);
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
});
