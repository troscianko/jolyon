// Gray-Scott reaction-diffusion page titles.
//
// Seeds the simulation from a raster of the title's own text (so it starts as
// legible text and degrades from there), with a spatially-varying feed/kill
// map — different values inside the text shape vs. outside it — so the two
// regions can grow into different pattern families (e.g. spots vs stripes).
// The Gray-Scott solver itself runs on a small, cheap grid regardless of
// on-screen size — what keeps this lightweight on weak devices without
// needing WebGL. Only the once-per-frame render step (upscale + light blur +
// threshold) runs at a higher resolution, which is what actually determines
// how smooth/legible the on-screen result looks.
(function () {
  var RUNTIME_MS = 30000;
  var SUBSTEPS_PER_FRAME = 2; // default 5, was 14 — slower per-frame evolution, and leaves
                              // compute headroom for the render upscale below
  var SIM_LONG_EDGE = 320;
  var RENDER_SCALE = 2; // simulation stays cheap at SIM_LONG_EDGE; only the
                        // once-per-frame render pass runs at SIM_LONG_EDGE * this
  var BLUR_SIGMA_PX = 1.2; // default 0.9
  var THRESHOLD = 0.28;
  var NOISE_AMOUNT = 0.1; // default 0.03
  var NOISE_FRACTION = 0.004; // fraction of cells perturbed per substep
  var DU = 1.0;
  var DV = 0.5;
  var EDGE_BUFFER = 3; // sim-grid cells kept high-kill so the pattern can't
                       // cling to the canvas edge (the clamped-edge Laplacian
                       // has nowhere to diffuse concentration away to there)
  var EDGE_KILL_RATE = 0.15; // comfortably above every preset's kill rate

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

  function numAttr(el, name, def) {
    var v = parseFloat(el.dataset[name]);
    return isNaN(v) ? def : v;
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

    // textAlpha/patternAlpha: opacity of the static original text vs. the
    // evolving pattern, composited text-under-pattern each frame. At the
    // defaults (0/1) only the pattern shows — patternAlpha < 1 is what lets
    // textAlpha > 0 actually become visible underneath it.
    var textAlpha = clamp01(numAttr(el, "textAlpha", 0));
    var patternAlpha = clamp01(numAttr(el, "patternAlpha", 1));
    // decay: exponential temporal smoothing between consecutive rendered
    // frames (0 = none, e.g. 0.9 = 90% previous frame / 10% new -> smooth
    // fading trails). Costs one extra full-frame blend pass when > 0.
    var decay = clamp01(numAttr(el, "decay", 0));
    // attraction: how strongly the text region is pulled back toward
    // reproducing the letter shape as it evolves, by boosting the feed rate
    // wherever concentration there has dropped below its seed value —
    // otherwise the pattern's own preferred spacing eventually dominates and
    // it drifts into a regular grid, forgetting the original text. 0 = no
    // pull (can fully drift); try 0.5-2 for a visible effect.
    var attraction = Math.max(0, numAttr(el, "attraction", 0));

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
    var renderW = w * RENDER_SCALE;
    var renderH = h * RENDER_SCALE;

    // The visible canvas renders at RENDER_SCALE x the simulation grid — that
    // upscale (plus a light blur, both applied in render() below) is what
    // turns the simulation's blocky cells into smooth-edged shapes without
    // having to run the actual Gray-Scott solver at a higher, much more
    // expensive resolution.
    canvas.width = renderW;
    canvas.height = renderH;
    var ctx = canvas.getContext("2d");

    // Small offscreen canvas the simulation writes its raw (pre-blur,
    // pre-threshold) grayscale concentration into each frame, before it gets
    // scaled up onto the visible canvas.
    var simCanvas = document.createElement("canvas");
    simCanvas.width = w;
    simCanvas.height = h;
    var simCtx = simCanvas.getContext("2d");
    var simImageData = simCtx.createImageData(w, h);
    var simPixels = simImageData.data;

    // The pattern is rendered into its own offscreen canvas each frame (at
    // render resolution) so it can be composited onto the visible canvas at
    // patternAlpha, over the static text layer, rather than drawn directly.
    var patternCanvas = document.createElement("canvas");
    patternCanvas.width = renderW;
    patternCanvas.height = renderH;
    var patternCtx = patternCanvas.getContext("2d");

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
    var isEdge = new Uint8Array(size);
    // The seed V value for text cells — also doubles as the "attraction"
    // target: step() nudges feed upward wherever a text cell's current V has
    // fallen below this, encouraging it to regrow there. Zero everywhere else,
    // which also means attraction has no effect outside the text region (the
    // deficit -- target minus v -- can never be positive there).
    var targetV = new Float32Array(size);

    for (var i = 0; i < size; i++) {
      var x = i % w;
      var y = (i / w) | 0;
      var nearEdge = x < EDGE_BUFFER || x >= w - EDGE_BUFFER || y < EDGE_BUFFER || y >= h - EDGE_BUFFER;
      var inText = !nearEdge && maskData[i * 4] > 128;
      feed[i] = inText ? feedIn : feedOut;
      kill[i] = inText ? killIn : killOut;
      if (nearEdge) {
        isEdge[i] = 1;
        kill[i] = EDGE_KILL_RATE;
      } else if (inText) {
        targetV[i] = 0.25;
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
    var lightCss = "rgb(" + lightRgb[0] + "," + lightRgb[1] + "," + lightRgb[2] + ")";

    // Static colored text layer, built once (the text never changes) at
    // simulation resolution then upscaled — composited under the pattern
    // each frame at textAlpha, only visible where patternAlpha < 1.
    var textLayerCanvas = document.createElement("canvas");
    textLayerCanvas.width = renderW;
    textLayerCanvas.height = renderH;
    if (textAlpha > 0) {
      var textSmall = document.createElement("canvas");
      textSmall.width = w;
      textSmall.height = h;
      var textSmallCtx = textSmall.getContext("2d");
      var textImageData = textSmallCtx.createImageData(w, h);
      var textPixels = textImageData.data;
      for (var ti = 0; ti < size; ti++) {
        var tOn = maskData[ti * 4] > 128;
        var tRgb = tOn ? darkRgb : lightRgb;
        var tp = ti * 4;
        textPixels[tp] = tRgb[0];
        textPixels[tp + 1] = tRgb[1];
        textPixels[tp + 2] = tRgb[2];
        textPixels[tp + 3] = 255;
      }
      textSmallCtx.putImageData(textImageData, 0, 0);
      var textLayerCtx = textLayerCanvas.getContext("2d");
      textLayerCtx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in textLayerCtx) textLayerCtx.imageSmoothingQuality = "high";
      textLayerCtx.drawImage(textSmall, 0, 0, w, h, 0, 0, renderW, renderH);
    }

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
          // Pull text cells back toward their seed concentration as they fade,
          // via the feed rate (rather than forcing v directly) — targetV is 0
          // outside the text region, so this deficit can never be positive
          // there and background cells are always unaffected.
          var effFeed = feed[i];
          if (attraction > 0) {
            var deficit = targetV[i] - v;
            if (deficit > 0) effFeed += attraction * deficit;
          }
          // Clamped as a safety net — the seed above is chosen to already keep
          // the reaction term well-behaved, but this guarantees a stray
          // parameter combination can never diverge into NaN/out-of-range
          // territory and silently blank the whole render.
          u1[i] = clamp01(u + DU * lu - uvv + effFeed * (1 - u));
          v1[i] = clamp01(v + DV * lv + uvv - (effFeed + kill[i]) * v);
        }
      }
      var kicks = Math.floor(size * NOISE_FRACTION);
      for (var n = 0; n < kicks; n++) {
        var idx = (Math.random() * size) | 0;
        if (isEdge[idx]) continue; // keep the border buffer noise-free too
        v1[idx] += (Math.random() - 0.5) * NOISE_AMOUNT;
        if (v1[idx] < 0) v1[idx] = 0;
        if (v1[idx] > 1) v1[idx] = 1;
      }
      u0.set(u1);
      v0.set(v1);
    }

    var prevFrame = null; // for decay: previous frame's rendered RGBA

    function render() {
      // 1. Raw simulation concentration -> small grayscale image.
      for (var i = 0; i < size; i++) {
        var g = Math.round(v0[i] * 255);
        var p = i * 4;
        simPixels[p] = g;
        simPixels[p + 1] = g;
        simPixels[p + 2] = g;
        simPixels[p + 3] = 255;
      }
      simCtx.putImageData(simImageData, 0, 0);

      // 2. Upscale onto the pattern canvas (native high-quality smoothing —
      //    the "bicubic-ish" resize) with a light Gaussian blur applied in the
      //    same draw, softening both the upscale and the simulation's own
      //    blocky cell edges before we threshold.
      patternCtx.filter = "blur(" + BLUR_SIGMA_PX + "px)";
      patternCtx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in patternCtx) patternCtx.imageSmoothingQuality = "high";
      patternCtx.drawImage(simCanvas, 0, 0, w, h, 0, 0, renderW, renderH);
      patternCtx.filter = "none";

      // 3. Threshold the blurred, upscaled grayscale to two-tone in place.
      var out = patternCtx.getImageData(0, 0, renderW, renderH);
      var data = out.data;
      for (var j = 0; j < data.length; j += 4) {
        var on = data[j] > THRESHOLD * 255;
        var rgb = on ? darkRgb : lightRgb;
        data[j] = rgb[0];
        data[j + 1] = rgb[1];
        data[j + 2] = rgb[2];
        data[j + 3] = 255;
      }
      patternCtx.putImageData(out, 0, 0);

      // 4. Composite onto the visible canvas: opaque background, the static
      //    text layer at textAlpha, then the pattern at patternAlpha on top.
      //    At the defaults (0/1) this reduces to just the pattern, unchanged
      //    from before.
      ctx.globalAlpha = 1;
      ctx.fillStyle = lightCss;
      ctx.fillRect(0, 0, renderW, renderH);
      if (textAlpha > 0) {
        ctx.globalAlpha = textAlpha;
        ctx.drawImage(textLayerCanvas, 0, 0);
      }
      ctx.globalAlpha = patternAlpha;
      ctx.drawImage(patternCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // 5. Optional exponential temporal smoothing across frames, for a
      //    trailing/ghosting look. Skipped entirely (no extra cost) when
      //    decay is 0, the default.
      if (decay > 0) {
        var composited = ctx.getImageData(0, 0, renderW, renderH);
        var cd = composited.data;
        if (!prevFrame) {
          prevFrame = new Uint8ClampedArray(cd);
        } else {
          for (var k = 0; k < cd.length; k++) {
            cd[k] = decay * prevFrame[k] + (1 - decay) * cd[k];
          }
          prevFrame.set(cd);
          ctx.putImageData(composited, 0, 0);
        }
      }
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
