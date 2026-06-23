var OneColor = OneColor || {};

OneColor.Effects = (function() {
  'use strict';

  function applyVignette(imageData, intensity, cx, cy) {
    if (intensity <= 0) return imageData;

    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var len = data.length;

    if (cx == null) cx = w / 2;
    if (cy == null) cy = h / 2;

    var maxDist = Math.sqrt(cx * cx + cy * cy);
    if (maxDist < Math.sqrt((w - cx) * (w - cx) + (h - cy) * (h - cy))) {
      maxDist = Math.sqrt((w - cx) * (w - cx) + (h - cy) * (h - cy));
    }

    var strength = intensity / 100;
    var startVignette = 0.35;
    var invRange = 1 / (1 - startVignette);

    for (var i = 0; i < len; i += 4) {
      var px = (i / 4) % w;
      var py = Math.floor((i / 4) / w);
      var dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) / maxDist;

      var mask = 1;
      if (dist > startVignette) {
        var t = (dist - startVignette) * invRange;
        mask = 1 - strength * t * t;
      }
      mask = Math.max(0, Math.min(1, mask));

      data[i]     = Math.round(data[i] * mask);
      data[i + 1] = Math.round(data[i + 1] * mask);
      data[i + 2] = Math.round(data[i + 2] * mask);
    }
    return imageData;
  }

  function applyBrightness(imageData, intensity, cx, cy) {
    if (intensity <= 0) return imageData;

    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var len = data.length;

    if (cx == null) cx = w / 2;
    if (cy == null) cy = h / 2;

    var maxDist = Math.sqrt(Math.max(
      cx * cx + cy * cy,
      (w - cx) * (w - cx) + (h - cy) * (h - cy),
      cx * cx + (h - cy) * (h - cy),
      (w - cx) * (w - cx) + cy * cy
    ));

    var boost = 1 + (intensity / 100) * 0.5;

    for (var i = 0; i < len; i += 4) {
      var px = (i / 4) % w;
      var py = Math.floor((i / 4) / w);
      var dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) / maxDist;
      var factor = boost - (boost - 1) * dist;

      data[i]     = Math.min(255, Math.round(data[i] * factor));
      data[i + 1] = Math.min(255, Math.round(data[i + 1] * factor));
      data[i + 2] = Math.min(255, Math.round(data[i + 2] * factor));
    }
    return imageData;
  }

  function computeBlurred(ctx, canvas, radius) {
    if (!window.OPENCV_READY || !cv || !cv.imread || !cv.GaussianBlur) {
      return canvasFallbackBlur(ctx, radius);
    }

    try {
      var src = cv.imread(canvas);
      var dst = new cv.Mat();
      var ksize = Math.max(1, Math.round(radius)) * 2 + 1;
      cv.GaussianBlur(src, dst, new cv.Size(ksize, ksize), 0, 0);

      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = canvas.height;
      cv.imshow(tmpCanvas, dst);

      src.delete();
      dst.delete();

      return tmpCanvas;
    } catch (e) {
      return canvasFallbackBlur(ctx, radius);
    }
  }

  function canvasFallbackBlur(ctx, radius) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    var hw = Math.ceil(w / 4);
    var hh = Math.ceil(h / 4);
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    var tctx = tmpCanvas.getContext('2d');

    tctx.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, hw, hh);
    tctx.drawImage(tmpCanvas, 0, 0, hw, hh, 0, 0, w, h);
    return tmpCanvas;
  }

  function applyBlur(ctx, imageData, intensity, maskCanvas) {
    if (intensity <= 0) return imageData;

    var w = imageData.width;
    var h = imageData.height;
    var radius = (intensity / 100) * 25;
    var blendStrength = intensity / 100;

    var blinkSrc = ctx.canvas;
    var blurredCanvas = computeBlurred(ctx, blinkSrc, radius);

    var original = imageData.data;
    var bctx = blurredCanvas.getContext('2d');
    var blurred = bctx.getImageData(0, 0, w, h).data;

    var out = new ImageData(w, h);
    var od = out.data;

    var maskData = null;
    if (maskCanvas) {
      var mctx = maskCanvas.getContext('2d');
      maskData = mctx.getImageData(0, 0, w, h).data;
    }

    for (var i = 0; i < original.length; i += 4) {
      var alpha = blendStrength;

      if (maskData) {
        var mIdx = i;
        var mv = maskData[mIdx] / 255;
        alpha = blendStrength * (1 - mv);
      } else {
        var px = (i / 4) % w;
        var py = Math.floor((i / 4) / w);
        var cx = w / 2, cy = h / 2;
        var maxDist = Math.sqrt(cx * cx + cy * cy);
        var dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)) / maxDist;
        alpha = blendStrength * dist;
      }

      alpha = Math.max(0, Math.min(1, alpha));
      od[i]     = Math.round(original[i] * (1 - alpha) + blurred[i] * alpha);
      od[i + 1] = Math.round(original[i + 1] * (1 - alpha) + blurred[i + 1] * alpha);
      od[i + 2] = Math.round(original[i + 2] * (1 - alpha) + blurred[i + 2] * alpha);
      od[i + 3] = 255;
    }

    return out;
  }

  function applyAll(ctx, imageData, vignetteVal, blurVal, brightnessVal, maskCanvas) {
    var cx = imageData.width / 2;
    var cy = imageData.height / 2;

    if (maskCanvas) {
      var mctx = maskCanvas.getContext('2d');
      var md = mctx.getImageData(0, 0, imageData.width, imageData.height).data;
      var sumX = 0, sumY = 0, total = 0;
      for (var i = 0; i < md.length; i += 4) {
        var v = md[i] / 255;
        if (v > 0.3) {
          var px = (i / 4) % imageData.width;
          var py = Math.floor((i / 4) / imageData.width);
          sumX += px * v;
          sumY += py * v;
          total += v;
        }
      }
      if (total > 0) {
        cx = sumX / total;
        cy = sumY / total;
      }
    }

    applyVignette(imageData, vignetteVal, cx, cy);
    ctx.putImageData(imageData, 0, 0);

    if (blurVal > 0) {
      imageData = applyBlur(ctx, imageData, blurVal, maskCanvas);
    }

    applyBrightness(imageData, brightnessVal, cx, cy);

    return imageData;
  }

  return {
    applyVignette: applyVignette,
    applyBrightness: applyBrightness,
    applyBlur: applyBlur,
    applyAll: applyAll
  };
})();
