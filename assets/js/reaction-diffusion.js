// Gray-Scott reaction-diffusion page titles.
//
// Seeds the simulation from a raster of the title's own text (so it starts as
// legible text and degrades from there), with a spatially-varying feed/kill
// map — different values inside the text shape vs. outside it — so the two
// regions can grow into different pattern families (e.g. spots vs stripes).
// Runs at a small internal resolution regardless of on-screen size (upscaled
// by the browser) since the two-tone threshold hides the low resolution
// anyway; this is what keeps it cheap on weak devices without needing WebGL.
(function () {
  var RUNTIME_MS = 30000;
  var SUBSTEPS_PER_FRAME = 14;
  var SIM_LONG_EDGE = 320;
  var THRESHOLD = 0.28;
  var NOISE_AMOUNT = 0.03;
  var NOISE_FRACTION = 0.004; // fraction of cells perturbed per substep
  var DU = 1.0;
  var DV = 0.5;

  // Approximate, well-known Gray-Scott (feed, kill) pairs from the Pearson
  // parameter space. Starting points for the named presets authors can pick
  // in front matter — tune here if a pattern doesn't read as intended.
  var PRESETS = {
    spots: { feed: 0.0367, kill: 0.0649 },
    stripes: { feed: 0.0300, kill: 0.0570 },
    worms: { feed: 0.0780, kill: 0.0610 },
    coral: { feed: 0.0545, kill: 0.0620 },
    maze: { feed: 0.0290, kill: 0.0570 },
    holes: { feed: 0.0390, kill: 0.0580 },
    waves: { feed: 0.0140, kill: 0.0410 },
  };

  function resolvePreset(name) {
    return PRESETS[name] || PRESETS.spots;
  }

  function hexToRgb(hex) {
    hex = hex.trim().replace("#", "");
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function clampIndex(v, max) {
    return v < 0 ? 0 : v > max ? max : v;
  }

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function setupOne(el) {
    var h1 = el.querySelector(".title-hero-text");
    var canvas = el.querySelector("canvas");
    if (!h1 || !canvas) return;

    var text = h1.textContent.trim();
    if (!text) return;

    var textPreset = resolvePreset(el.dataset.textPattern);
    var bgPreset = resolvePreset(el.dataset.bgPattern);
    var feedIn = parseFloat(el.dataset.feedIn) || textPreset.feed;
    var killIn = parseFloat(el.dataset.killIn) || textPreset.kill;
    var feedOut = parseFloat(el.dataset.feedOut) || bgPreset.feed;
    var killOut = parseFloat(el.dataset.killOut) || bgPreset.kill;

    var rect = h1.getBoundingClientRect();
    var displayW = Math.max(1, rect.width);
    var displayH = Math.max(1, rect.height);

    // A single fillText() can't reproduce a wrapped multi-line title (long
    // text on a narrow screen) — bail out to the plain static heading rather
    // than draw a broken mask.
    var styleForWrapCheck = getComputedStyle(h1);
    var estimatedLineHeight =
      parseFloat(styleForWrapCheck.lineHeight) || parseFloat(styleForWrapCheck.fontSize) * 1.3;
    if (displayH > estimatedLineHeight * 1.4) return;

    var scale = SIM_LONG_EDGE / Math.max(displayW, displayH);
    var w = Math.max(40, Math.round(displayW * scale));
    var h = Math.max(20, Math.round(displayH * scale));

    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");

    // Render the title's actual text (matching its live computed font) to an
    // offscreen mask at simulation resolution — this is both the seed pattern
    // and, thresholded at t=0, the initial "coherent text" frame.
    var style = getComputedStyle(h1);
    var fontSizePx = parseFloat(style.fontSize) * scale;
    var mask = document.createElement("canvas");
    mask.width = w;
    mask.height = h;
    var mctx = mask.getContext("2d");
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, w, h);
    mctx.fillStyle = "#fff";
    mctx.font = style.fontWeight + " " + fontSizePx + "px " + style.fontFamily;
    mctx.textAlign = "center";
    mctx.textBaseline = "middle";
    mctx.fillText(text, w / 2, h / 2);
    var maskData = mctx.getImageData(0, 0, w, h).data;

    var size = w * h;
    var u0 = new Float32Array(size).fill(1);
    var v0 = new Float32Array(size).fill(0);
    var u1 = new Float32Array(size);
    var v1 = new Float32Array(size);
    var feed = new Float32Array(size);
    var kill = new Float32Array(size);

    for (var i = 0; i < size; i++) {
      var inText = maskData[i * 4] > 128;
      feed[i] = inText ? feedIn : feedOut;
      kill[i] = inText ? killIn : killOut;
      if (inText) {
        // Standard Gray-Scott seed: lower u alongside raising v. Leaving u at
        // the background's 1.0 while pushing v to ~1 makes the reaction term
        // u*v*v ~1 — far bigger than the feed/kill rates it's meant to
        // balance against — which blows the fields out of range within the
        // first frame's substeps.
        u0[i] = 0.5 + (Math.random() - 0.5) * 0.04;
        v0[i] = 0.25 + (Math.random() - 0.5) * 0.04;
      }
    }

    var rootStyle = getComputedStyle(document.documentElement);
    var darkRgb = hexToRgb(rootStyle.getPropertyValue("--accent-green-dark") || "#1f3d0c");
    var lightRgb = hexToRgb(rootStyle.getPropertyValue("--accent-green") || "#b9f855");
    var pixels = new Uint8ClampedArray(size * 4);

    function laplacian(field, x, y) {
      var xm = clampIndex(x - 1, w - 1);
      var xp = clampIndex(x + 1, w - 1);
      var ym = clampIndex(y - 1, h - 1);
      var yp = clampIndex(y + 1, h - 1);
      var c = field[y * w + x];
      var sum =
        field[y * w + xm] * 0.2 +
        field[y * w + xp] * 0.2 +
        field[ym * w + x] * 0.2 +
        field[yp * w + x] * 0.2 +
        field[ym * w + xm] * 0.05 +
        field[ym * w + xp] * 0.05 +
        field[yp * w + xm] * 0.05 +
        field[yp * w + xp] * 0.05;
      return sum - c;
    }

    function step() {
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var i = y * w + x;
          var u = u0[i];
          var v = v0[i];
          var uvv = u * v * v;
          var lu = laplacian(u0, x, y);
          var lv = laplacian(v0, x, y);
          // Clamped as a safety net — the seed above is chosen to already keep
          // the reaction term well-behaved, but this guarantees a stray
          // parameter combination can never diverge into NaN/out-of-range
          // territory and silently blank the whole render.
          u1[i] = clamp01(u + DU * lu - uvv + feed[i] * (1 - u));
          v1[i] = clamp01(v + DV * lv + uvv - (feed[i] + kill[i]) * v);
        }
      }
      var kicks = Math.floor(size * NOISE_FRACTION);
      for (var n = 0; n < kicks; n++) {
        var idx = (Math.random() * size) | 0;
        v1[idx] += (Math.random() - 0.5) * NOISE_AMOUNT;
        if (v1[idx] < 0) v1[idx] = 0;
        if (v1[idx] > 1) v1[idx] = 1;
      }
      u0.set(u1);
      v0.set(v1);
    }

    function render() {
      for (var i = 0; i < size; i++) {
        var on = v0[i] > THRESHOLD;
        var rgb = on ? darkRgb : lightRgb;
        var p = i * 4;
        pixels[p] = rgb[0];
        pixels[p + 1] = rgb[1];
        pixels[p + 2] = rgb[2];
        pixels[p + 3] = 255;
      }
      ctx.putImageData(new ImageData(pixels, w, h), 0, 0);
    }

    // First frame reproduces the text mask before any diffusion has happened.
    render();
    h1.style.color = "transparent";

    var rafId = null;
    var finished = false;
    var lastFrameTime = null;
    var activeMs = 0;

    function frame(timestamp) {
      if (lastFrameTime !== null) activeMs += timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      if (activeMs >= RUNTIME_MS) {
        finished = true;
        return;
      }
      for (var s = 0; s < SUBSTEPS_PER_FRAME; s++) step();
      render();
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", function () {
      if (finished) return;
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        lastFrameTime = null; // don't count the paused gap as active time
        rafId = requestAnimationFrame(frame);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var elements = document.querySelectorAll("[data-reaction]");
    if (!elements.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // leave the plain <h1> visible, no canvas/simulation at all
    }
    elements.forEach(setupOne);
  });
})();
