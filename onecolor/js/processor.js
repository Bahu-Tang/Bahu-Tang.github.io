var OneColor = OneColor || {};

OneColor.Processor = (function() {
  'use strict';

  function grayscaleChannel(imageData, channel) {
    var data = imageData.data;
    var len = data.length;
    var out = new ImageData(imageData.width, imageData.height);
    var od = out.data;

    for (var i = 0; i < len; i += 4) {
      var v = data[i + channel];
      od[i]     = v;
      od[i + 1] = v;
      od[i + 2] = v;
      od[i + 3] = 255;
    }
    return out;
  }

  function tintChannel(imageData, channel, tintR, tintG, tintB) {
    var data = imageData.data;
    var len = data.length;
    var out = new ImageData(imageData.width, imageData.height);
    var od = out.data;

    for (var i = 0; i < len; i += 4) {
      var v = data[i + channel];
      var t = v / 255;
      od[i]     = Math.round(tintR * t);
      od[i + 1] = Math.round(tintG * t);
      od[i + 2] = Math.round(tintB * t);
      od[i + 3] = 255;
    }
    return out;
  }

  function selectiveColor(imageData, hue, tolerance) {
    var data = imageData.data;
    var len = data.length;
    var out = new ImageData(imageData.width, imageData.height);
    var od = out.data;

    var halfTol = tolerance / 2;

    for (var i = 0; i < len; i += 4) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];

      var hsl = rgbToHsl(r, g, b);
      var h = hsl.h;
      var s = hsl.s;
      var l = hsl.l;

      var keep = hueInRange(h, hue, halfTol);

      if (keep) {
        od[i]     = r;
        od[i + 1] = g;
        od[i + 2] = b;
      } else {
        var gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        od[i]     = gray;
        od[i + 1] = gray;
        od[i + 2] = gray;
      }
      od[i + 3] = 255;
    }
    return out;
  }

  function hueInRange(h, target, halfTol) {
    var diff = Math.abs(h - target);
    if (diff <= halfTol) return true;
    if (diff >= 360 - halfTol) return true;
    return false;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0, s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    };
  }

  function process(ctx, imageData, mode, channel, tintColor, hue, tolerance) {
    var result;
    switch (mode) {
      case 'channel-gray':
        result = grayscaleChannel(imageData, channel);
        break;
      case 'channel-tint':
        var rgb = hexToRgb(tintColor);
        result = tintChannel(imageData, channel, rgb.r, rgb.g, rgb.b);
        break;
      case 'selective-color':
        result = selectiveColor(imageData, hue, tolerance);
        break;
      default:
        result = new ImageData(imageData.width, imageData.height);
        result.data.set(imageData.data);
    }
    return result;
  }

  return {
    grayscaleChannel: grayscaleChannel,
    tintChannel: tintChannel,
    selectiveColor: selectiveColor,
    hexToRgb: hexToRgb,
    process: process
  };
})();
