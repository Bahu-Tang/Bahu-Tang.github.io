var OneColor = OneColor || {};

OneColor.App = (function() {
  'use strict';

  var sourceCanvas, sourceCtx, outputCanvas, outputCtx, dropZone, loading;
  var originalImageData = null;
  var reprocessTimer = null;

  var state = {
    mode: 'channel-gray',
    channel: 0,
    tintColor: '#00bcd4',
    hue: 0,
    tolerance: 30,
    vignette: 0,
    blur: 0,
    brightness: 0,
    autoMode: false,
    hasImage: false
  };

  function init() {
    sourceCanvas = document.getElementById('source-canvas');
    sourceCtx = sourceCanvas.getContext('2d');
    outputCanvas = document.getElementById('output-canvas');
    outputCtx = outputCanvas.getContext('2d');
    dropZone = document.getElementById('drop-zone');
    loading = document.getElementById('loading-overlay');

    setupOpenCVCallbacks();
    setupDragDrop();
    setupModeButtons();
    setupChannelButtons();
    setupHueControls();
    setupTintControls();
    setupEffectSliders();
    setupAutoToggle();
    setupExportReset();

    document.getElementById('file-input').addEventListener('change', handleFileSelect);
  }

  function setupOpenCVCallbacks() {
    var badge = document.getElementById('opencv-status');

    window._onCvReady = function() {
      badge.textContent = '就绪';
      badge.className = 'status-badge ready';
      if (state.hasImage && state.autoMode) {
        reprocess();
      }
    };

    window._onCvError = function() {
      badge.textContent = '离线模式';
      badge.className = 'status-badge error';
    };

    if (!window.OPENCV_LOADING && window.OPENCV_READY) {
      badge.textContent = '就绪';
      badge.className = 'status-badge ready';
    }

    setTimeout(function() {
      if (window.OPENCV_LOADING && badge.textContent === '加载中') {
        badge.textContent = '加载中...';
      }
    }, 3000);
  }

  function setupDragDrop() {
    var wrapper = document.getElementById('image-wrapper');

    wrapper.addEventListener('click', function(e) {
      if (e.target === outputCanvas || e.target === wrapper || dropZone.contains(e.target)) {
        document.getElementById('file-input').click();
      }
    });

    wrapper.addEventListener('dragover', function(e) {
      e.preventDefault();
      wrapper.style.borderColor = 'var(--accent)';
    });

    wrapper.addEventListener('dragleave', function() {
      wrapper.style.borderColor = '';
    });

    wrapper.addEventListener('drop', function(e) {
      e.preventDefault();
      wrapper.style.borderColor = '';
      var file = e.dataTransfer.files[0];
      if (file) loadImage(file);
    });
  }

  function handleFileSelect(e) {
    var file = e.target.files[0];
    if (file) loadImage(file);
    e.target.value = '';
  }

  function loadImage(file) {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) return;

    showLoading(true);
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var w = img.naturalWidth;
        var h = img.naturalHeight;

        sourceCanvas.width = w;
        sourceCanvas.height = h;
        sourceCtx.drawImage(img, 0, 0, w, h);

        outputCanvas.width = w;
        outputCanvas.height = h;

        originalImageData = sourceCtx.getImageData(0, 0, w, h);
        state.hasImage = true;
        dropZone.classList.add('hidden');

        reprocess();
      };
      img.onerror = function() {
        showLoading(false);
      };
      img.src = e.target.result;
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
  }

  function reprocess() {
    if (!state.hasImage || !originalImageData) return;

    showLoading(true);

    if (reprocessTimer) cancelAnimationFrame(reprocessTimer);
    reprocessTimer = requestAnimationFrame(function() {
      var proc = OneColor.Processor;
      var eff = OneColor.Effects;
      var sal = OneColor.Saliency;

      var srcCopy = new ImageData(originalImageData.width, originalImageData.height);
      srcCopy.data.set(originalImageData.data);

      var processed = proc.process(
        outputCtx, srcCopy,
        state.mode, state.channel,
        state.tintColor, state.hue, state.tolerance
      );

      outputCtx.putImageData(processed, 0, 0);

      var maskCanvas = null;
      if (state.autoMode) {
        if (sal.isReady()) {
          maskCanvas = sal.detect(sourceCtx, 800);
        }
        if (!maskCanvas) {
          maskCanvas = sal.fallbackMask(sourceCanvas.width, sourceCanvas.height);
        }
      }

      var finalData = eff.applyAll(
        outputCtx, processed,
        state.vignette, state.blur, state.brightness,
        maskCanvas
      );

      outputCtx.putImageData(finalData, 0, 0);
      showLoading(false);
    });
  }

  function setupModeButtons() {
    var btns = document.querySelectorAll('#mode-btns .btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.mode = btn.dataset.mode;

        document.getElementById('channel-group').style.display =
          (state.mode === 'channel-gray' || state.mode === 'channel-tint') ? '' : 'none';
        document.getElementById('tint-group').style.display =
          state.mode === 'channel-tint' ? '' : 'none';
        document.getElementById('hue-group').style.display =
          state.mode === 'selective-color' ? '' : 'none';

        reprocess();
      });
    });
  }

  function setupChannelButtons() {
    var btns = document.querySelectorAll('#channel-btns .btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.channel = parseInt(btn.dataset.channel);
        reprocess();
      });
    });
  }

  function setupHueControls() {
    var slider = document.getElementById('hue-slider');
    var valSpan = document.getElementById('hue-val');
    var tolSlider = document.getElementById('tolerance-slider');
    var tolSpan = document.getElementById('tol-val');

    slider.addEventListener('input', function() {
      state.hue = parseInt(slider.value);
      valSpan.textContent = state.hue + '\u00B0';
      reprocess();
    });

    tolSlider.addEventListener('input', function() {
      state.tolerance = parseInt(tolSlider.value);
      tolSpan.textContent = state.tolerance + '\u00B0';
      reprocess();
    });
  }

  function setupTintControls() {
    var picker = document.getElementById('tint-color');
    picker.addEventListener('input', function() {
      state.tintColor = picker.value;
      updatePresetActive(state.tintColor);
      reprocess();
    });

    var presets = document.querySelectorAll('.preset-swatch');
    presets.forEach(function(sw) {
      sw.addEventListener('click', function() {
        var color = sw.dataset.color;
        state.tintColor = color;
        picker.value = color;
        updatePresetActive(color);
        reprocess();
      });
    });
  }

  function updatePresetActive(color) {
    var presets = document.querySelectorAll('.preset-swatch');
    presets.forEach(function(sw) {
      sw.classList.toggle('active', sw.dataset.color.toLowerCase() === color.toLowerCase());
    });
  }

  function setupEffectSliders() {
    bindSlider('vignette-slider', 'vignette-val', 'vignette');
    bindSlider('blur-slider', 'blur-val', 'blur');
    bindSlider('brightness-slider', 'brightness-val', 'brightness');
  }

  function bindSlider(sliderId, valId, stateKey) {
    var slider = document.getElementById(sliderId);
    var valSpan = document.getElementById(valId);
    slider.addEventListener('input', function() {
      state[stateKey] = parseInt(slider.value);
      valSpan.textContent = state[stateKey];
      reprocess();
    });
  }

  function setupAutoToggle() {
    var toggle = document.getElementById('auto-toggle');
    toggle.addEventListener('change', function() {
      state.autoMode = toggle.checked;
      reprocess();
    });
  }

  function setupExportReset() {
    document.getElementById('export-btn').addEventListener('click', function() {
      if (!state.hasImage) return;

      var link = document.createElement('a');
      link.download = 'onecolor_' + state.mode + '.png';
      link.href = outputCanvas.toDataURL('image/png');
      link.click();
    });

    document.getElementById('reset-btn').addEventListener('click', function() {
      state.mode = 'channel-gray';
      state.channel = 0;
      state.tintColor = '#00bcd4';
      state.hue = 0;
      state.tolerance = 30;
      state.vignette = 0;
      state.blur = 0;
      state.brightness = 0;
      state.autoMode = false;

      document.querySelector('#mode-btns .btn[data-mode="channel-gray"]').classList.add('active');
      document.querySelectorAll('#mode-btns .btn').forEach(function(b) {
        if (b.dataset.mode !== 'channel-gray') b.classList.remove('active');
      });
      document.querySelector('#channel-btns .btn[data-channel="0"]').classList.add('active');
      document.querySelectorAll('#channel-btns .btn').forEach(function(b) {
        if (b.dataset.channel !== '0') b.classList.remove('active');
      });

      document.getElementById('channel-group').style.display = '';
      document.getElementById('tint-group').style.display = 'none';
      document.getElementById('hue-group').style.display = 'none';

      document.getElementById('hue-slider').value = 0;
      document.getElementById('hue-val').textContent = '0\u00B0';
      document.getElementById('tolerance-slider').value = 30;
      document.getElementById('tol-val').textContent = '30\u00B0';
      document.getElementById('tint-color').value = '#00bcd4';
      updatePresetActive('#00bcd4');

      document.getElementById('vignette-slider').value = 0;
      document.getElementById('vignette-val').textContent = '0';
      document.getElementById('blur-slider').value = 0;
      document.getElementById('blur-val').textContent = '0';
      document.getElementById('brightness-slider').value = 0;
      document.getElementById('brightness-val').textContent = '0';

      document.getElementById('auto-toggle').checked = false;

      reprocess();
    });
  }

  return {
    init: init
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  OneColor.App.init();
});
