var OneColor = OneColor || {};

OneColor.Saliency = (function() {
  'use strict';

  function isReady() {
    return window.OPENCV_READY && cv && cv.saliency && cv.saliency.StaticSaliencySpectralResidual;
  }

  function detect(ctx, maxDim) {
    if (!isReady()) return null;

    var src = ctx.canvas;
    var w = src.width;
    var h = src.height;

    var scale = 1;
    if (maxDim && Math.max(w, h) > maxDim) {
      scale = maxDim / Math.max(w, h);
    }

    var processW = Math.round(w * scale);
    var processH = Math.round(h * scale);

    try {
      var matSrc = cv.imread(src);

      var matSmall = new cv.Mat();
      if (scale < 1) {
        cv.resize(matSrc, matSmall, new cv.Size(processW, processH));
      } else {
        matSmall = matSrc.clone();
      }

      var saliency = new cv.saliency.StaticSaliencySpectralResidual();
      var saliencyMap = new cv.Mat();
      var binaryMap = new cv.Mat();

      saliency.computeSaliency(matSmall, saliencyMap);

      cv.threshold(saliencyMap, binaryMap, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

      var kernel = cv.Mat.ones(5, 5, cv.CV_8U);
      cv.dilate(binaryMap, binaryMap, kernel);

      var ksize = Math.max(3, Math.round(Math.min(processW, processH) * 0.03)) * 2 + 1;
      cv.GaussianBlur(binaryMap, binaryMap, new cv.Size(ksize, ksize), 0, 0);

      var maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      cv.resize(binaryMap, binaryMap, new cv.Size(w, h));
      cv.imshow(maskCanvas, binaryMap);

      matSrc.delete();
      matSmall.delete();
      saliencyMap.delete();
      binaryMap.delete();
      kernel.delete();
      saliency.delete();

      return maskCanvas;
    } catch (e) {
      console.warn('Saliency detection failed:', e.message);
      return null;
    }
  }

  function fallbackMask(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    var cx = w / 2, cy = h / 2;
    var maxDist = Math.sqrt(cx * cx + cy * cy);

    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    return canvas;
  }

  return {
    isReady: isReady,
    detect: detect,
    fallbackMask: fallbackMask
  };
})();
