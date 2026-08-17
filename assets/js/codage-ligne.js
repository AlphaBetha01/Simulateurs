/* ================================================================
/* ================================================================
   SIMULATEUR CODAGE DE LIGNE
   Codes : NRZ-L, NRZ-M, NRZ-I, RZ, Manchester, Manchester Diff.,
           AMI, HDB3, B8ZS
   ================================================================ */
LabCommon.initHeader({ bodySection: 'numerisation-codage-ligne', pageId: 'numerisation-codage-ligne' });

(function () {
  'use strict';

  const CODES = {
    'NRZ-L': { label: 'NRZ-L', color: '#16a34a', desc: 'NRZ niveau' },
    'NRZ-M': { label: 'NRZ-M', color: '#15803d', desc: 'Transition sur 1' },
    'NRZ-S': { label: 'NRZ-S', color: '#22c55e', desc: 'Transition sur 0 (espace)' },
    'RZ': { label: 'RZ', color: '#ca8a04', desc: 'Retour a zero' },
    'MANCHESTER': { label: 'Manchester', color: '#1d4ed8', desc: 'Transition au milieu du bit' },
    'DIFF-MAN': { label: 'Manchester diff.', color: '#7c3aed', desc: 'Differentiel' },
    'AMI': { label: 'AMI', color: '#dc2626', desc: 'Alternating Mark Inversion' },
    'HDB3': { label: 'HDB3', color: '#b45309', desc: 'Substitution des 4 zeros' },
    'B8ZS': { label: 'B8ZS', color: '#0891b2', desc: 'Substitution des 8 zeros' }
  };

  const LEVELS = { HIGH: 1, ZERO: 0, LOW: -1 };
  const DEFAULT_BITS = '10110001000010111';
  const PRESETS = [
    { label: 'Serie de 1', bits: '11111111' },
    { label: 'Serie de 0', bits: '00000000' },
    { label: 'Alternance', bits: '10101010' },
    { label: 'HDB3 test', bits: '10000011000010' },
    { label: 'B8ZS test', bits: '1000000001000000001' },
    { label: 'Aleatoire', bits: 'random' }
  ];

  const state = {
    bits: [],
    selectedCodes: ['NRZ-L', 'MANCHESTER', 'AMI', 'HDB3'],
    encoded: {},
    animFrame: null,
    animPos: 0,
    animSpeed: 2,
    isAnimating: false,
    tooltipEl: null,
    layoutKey: ''
  };
  var initialized = false;
  var STORAGE_KEY = 'codageLigneStateV1';

  function parseBits(str) {
    return String(str || '')
      .replace(/\s/g, '')
      .split('')
      .filter(function (c) { return c === '0' || c === '1'; })
      .map(function (c) { return Number(c); });
  }

  function toggleLevel(level) {
    return level === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
  }

  function readStoredState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStoredState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        bits: state.bits,
        selectedCodes: state.selectedCodes,
        animSpeed: state.animSpeed
      }));
    } catch (error) {
      // Stockage indisponible : on ignore silencieusement.
    }
  }

  function parseCodesParam(str) {
    var valid = Object.keys(CODES);
    return String(str || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (codeKey) { return valid.indexOf(codeKey) >= 0; });
  }

  function resolveInitialState() {
    // Priorité de restauration : URL > localStorage > valeurs par défaut (déjà dans state).
    var params = (window.LabCommon && typeof window.LabCommon.getParams === 'function')
      ? window.LabCommon.getParams()
      : new URLSearchParams(window.location.search);
    var bitsParam = params.get('bits');
    var codesParam = params.get('codes');
    var restoredFromUrl = false;

    if (bitsParam !== null || codesParam !== null) {
      var urlBits = bitsParam !== null ? parseBits(bitsParam) : [];
      var urlCodes = parseCodesParam(codesParam);
      if (urlBits.length >= 2 && urlBits.length <= 64) {
        state.bits = urlBits;
        restoredFromUrl = true;
      }
      if (urlCodes.length) state.selectedCodes = urlCodes;
    }

    if (!restoredFromUrl) {
      var stored = readStoredState();
      if (stored && Array.isArray(stored.bits) && stored.bits.length >= 2 && stored.bits.length <= 64) {
        state.bits = stored.bits.filter(function (b) { return b === 0 || b === 1; });
        if (!state.bits.length) state.bits = parseBits(DEFAULT_BITS);
      }
      if (stored && Array.isArray(stored.selectedCodes)) {
        var validCodes = parseCodesParam(stored.selectedCodes.join(','));
        if (validCodes.length) state.selectedCodes = validCodes;
      }
      if (stored && typeof stored.animSpeed === 'number' && isFinite(stored.animSpeed)) {
        state.animSpeed = Math.max(0.5, Math.min(8, stored.animSpeed));
      }
    }
  }

  function encodeNRZ_L(bits) {
    return bits.map(function (b) { return { level: b === 1 ? LEVELS.HIGH : LEVELS.LOW }; });
  }

  function encodeNRZ_M(bits) {
    var cur = LEVELS.LOW;
    return bits.map(function (b) {
      if (b === 1) cur = toggleLevel(cur);
      return { level: cur };
    });
  }

  function encodeNRZ_S(bits) {
    var cur = LEVELS.HIGH;
    return bits.map(function (b) {
      if (b === 0) cur = toggleLevel(cur);
      return { level: cur };
    });
  }

  function encodeRZ(bits) {
    var segs = [];
    bits.forEach(function (b) {
      // RZ unipolaire : seul le bit 1 produit une impulsion (+V), le bit 0 reste à 0 V
      segs.push({ level: b === 1 ? LEVELS.HIGH : LEVELS.ZERO, half: true });
      segs.push({ level: LEVELS.ZERO, half: true });
    });
    return segs;
  }

  function encodeManchester(bits) {
    var segs = [];
    bits.forEach(function (b) {
      // Convention IEEE 802.3 : 1 = transition descendante (haut→bas), 0 = montante (bas→haut)
      if (b === 1) {
        segs.push({ level: LEVELS.HIGH, half: true });
        segs.push({ level: LEVELS.LOW, half: true });
      } else {
        segs.push({ level: LEVELS.LOW, half: true });
        segs.push({ level: LEVELS.HIGH, half: true });
      }
    });
    return segs;
  }

  function encodeDiffManchester(bits) {
    var segs = [];
    var cur = LEVELS.LOW;
    bits.forEach(function (b) {
      if (b === 0) cur = toggleLevel(cur);
      segs.push({ level: cur, half: true });
      cur = toggleLevel(cur);
      segs.push({ level: cur, half: true });
    });
    return segs;
  }

  function encodeAMI(bits) {
    var segs = [];
    var lastMark = LEVELS.HIGH;
    bits.forEach(function (b) {
      if (b === 0) {
        segs.push({ level: LEVELS.ZERO });
      } else {
        lastMark = toggleLevel(lastMark);
        segs.push({ level: lastMark, mark: true });
      }
    });
    return segs;
  }

  function encodeHDB3(bits) {
    var segs = bits.map(function () { return { level: LEVELS.ZERO }; });
    var lastMark = LEVELS.HIGH;
    var onesCount = 0;
    var i = 0;

    while (i < bits.length) {
      if (bits[i] === 1) {
        lastMark = toggleLevel(lastMark);
        segs[i] = { level: lastMark, mark: true };
        onesCount++;
        i++;
        continue;
      }

      var zStart = i;
      while (i < bits.length && bits[i] === 0) i++;
      var zCount = i - zStart;
      var j = zStart;

      while (j < zStart + zCount) {
        var remaining = zStart + zCount - j;
        if (remaining >= 4) {
          var useB = onesCount % 2 === 0;
          if (useB) {
            var bPol = toggleLevel(lastMark);
            segs[j] = { level: bPol, b: true };
            segs[j + 1] = { level: LEVELS.ZERO };
            segs[j + 2] = { level: LEVELS.ZERO };
            segs[j + 3] = { level: bPol, v: true };
            lastMark = bPol;
          } else {
            // 000V : le pulse V a la MÊME polarité que la marque précédente (violation AMI)
            var vPol = lastMark;
            segs[j] = { level: LEVELS.ZERO };
            segs[j + 1] = { level: LEVELS.ZERO };
            segs[j + 2] = { level: LEVELS.ZERO };
            segs[j + 3] = { level: vPol, v: true };
            lastMark = vPol;
          }
          onesCount = 0;
          j += 4;
        } else {
          segs[j] = { level: LEVELS.ZERO };
          j++;
        }
      }
    }

    return segs;
  }

  function encodeB8ZS(bits) {
    var segs = bits.map(function () { return { level: LEVELS.ZERO }; });
    var lastMark = LEVELS.HIGH;
    var i = 0;

    while (i < bits.length) {
      if (bits[i] === 1) {
        lastMark = toggleLevel(lastMark);
        segs[i] = { level: lastMark, mark: true };
        i++;
        continue;
      }

      var zStart = i;
      while (i < bits.length && bits[i] === 0) i++;
      var zCount = i - zStart;
      var j = zStart;

      while (j < zStart + zCount) {
        var remaining = zStart + zCount - j;
        if (remaining >= 8) {
          // 000VB0VB : V = même polarité que le pulse précédent (violation), B = opposée (équilibrage)
          var v1 = lastMark;          // premier V (violation)
          var b1 = toggleLevel(v1);   // premier B (équilibrage)
          var v2 = toggleLevel(v1);   // second V (même polarité que B1)
          var b2 = toggleLevel(v2);   // second B
          var pattern = [
            { level: LEVELS.ZERO },
            { level: LEVELS.ZERO },
            { level: LEVELS.ZERO },
            { level: v1, v: true },
            { level: b1, b: true },
            { level: LEVELS.ZERO },
            { level: v2, v: true },
            { level: b2, b: true }
          ];
          pattern.forEach(function (p, k) { segs[j + k] = p; });
          lastMark = b2;
          j += 8;
        } else {
          segs[j] = { level: LEVELS.ZERO };
          j++;
        }
      }
    }

    return segs;
  }

  function encode(codeId, bits) {
    switch (codeId) {
      case 'NRZ-L': return encodeNRZ_L(bits);
      case 'NRZ-M': return encodeNRZ_M(bits);
      case 'NRZ-S': return encodeNRZ_S(bits);
      case 'RZ': return encodeRZ(bits);
      case 'MANCHESTER': return encodeManchester(bits);
      case 'DIFF-MAN': return encodeDiffManchester(bits);
      case 'AMI': return encodeAMI(bits);
      case 'HDB3': return encodeHDB3(bits);
      case 'B8ZS': return encodeB8ZS(bits);
      default: return [];
    }
  }

  function estimateBandwidth(segs) {
    var transitions = 0;
    for (var i = 1; i < segs.length; i++) {
      if (segs[i].level !== segs[i - 1].level) transitions++;
    }
    var ratio = transitions / Math.max(2 * segs.length, 1);
    if (ratio <= 0.5) return '0.5 × Tb⁻¹';
    if (ratio <= 1) return '1 × Tb⁻¹';
    return '2 × Tb⁻¹';
  }

  function drawActiveHighlight(ctx, axis, bitIndex, bitCount) {
    if (bitIndex < 0) return;
    var bitW = axis.drawW / Math.max(bitCount, 1);
    var x = axis.pad.left + bitIndex * bitW;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.24)';
    ctx.fillRect(x, axis.pad.top, bitW, axis.drawH);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, axis.pad.top + 1, Math.max(bitW - 2, 0), Math.max(axis.drawH - 2, 0));
  }

  function computeStats(segs) {
    var transitions = 0;
    var dcBias = 0;
    var highs = 0;
    var lows = 0;

    for (var i = 0; i < segs.length; i++) {
      var level = segs[i].level;
      dcBias += level;
      if (level === LEVELS.HIGH) highs++;
      if (level === LEVELS.LOW) lows++;
      if (i > 0 && level !== segs[i - 1].level) transitions++;
    }

    return {
      transitions: transitions,
      dcBias: (dcBias / Math.max(segs.length, 1)).toFixed(3),
      density: ((transitions / Math.max(segs.length, 1)) * 100).toFixed(1),
      balance: (((highs - lows) / Math.max(highs + lows, 1)) * 100).toFixed(1),
      bandwidth: estimateBandwidth(segs)
    };
  }

  function ensureTooltip() {
    if (state.tooltipEl) return state.tooltipEl;
    var el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.padding = '8px 10px';
    el.style.borderRadius = '10px';
    el.style.background = 'rgba(15, 23, 42, 0.94)';
    el.style.color = '#f8fafc';
    el.style.font = '12px/1.4 Segoe UI, sans-serif';
    el.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.22)';
    el.style.display = 'none';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  function showTooltip(html, x, y) {
    var el = ensureTooltip();
    el.innerHTML = html;
    el.style.left = x + 14 + 'px';
    el.style.top = y + 14 + 'px';
    el.style.display = 'block';
  }

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.style.display = 'none';
  }

  function downloadCanvasPNG(canvas, filename) {
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = filename || 'chronogramme.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function resizeCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
      ctx: ctx,
      width: canvas.clientWidth,
      height: canvas.clientHeight
    };
  }

  function drawAxes(ctx, width, height, bitCount, dark) {
    var pad = { top: 12, right: 12, bottom: 32, left: 56 };
    var drawW = width - pad.left - pad.right;
    var drawH = height - pad.top - pad.bottom;
    var midY = pad.top + drawH / 2;
    var ampY = drawH * 0.38;
    var gridColor = dark ? 'rgba(255,255,255,0.10)' : '#e2e8f0';
    var axisColor = dark ? 'rgba(255,255,255,0.75)' : '#94a3b8';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [midY - ampY, midY, midY + ampY].forEach(function (y) {
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    });

    for (var i = 0; i <= 4; i++) {
      var x = pad.left + (i / 4) * drawW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, height - pad.bottom);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, height - pad.bottom);
    ctx.moveTo(pad.left, midY);
    ctx.lineTo(width - pad.right, midY);
    ctx.stroke();

    ctx.fillStyle = axisColor;
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+1 V', pad.left - 6, midY - ampY + 3);
    ctx.fillText('0 V', pad.left - 6, midY + 3);
    ctx.fillText('-1 V', pad.left - 6, midY + ampY + 3);

    ctx.textAlign = 'center';
    for (var t = 0; t <= 4; t++) {
      var tickX = pad.left + (t / 4) * drawW;
      var tb = ((t / 4) * Math.max(bitCount, 1)).toFixed(1).replace('.0', '');
      ctx.fillText(tb, tickX, height - 6);
    }
    ctx.fillText('Temps (Tb)', pad.left + drawW / 2, height - 18);
    ctx.save();
    ctx.translate(14, pad.top + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude (V)', 0, 0);
    ctx.restore();

    return { pad: pad, drawW: drawW, drawH: drawH, midY: midY, ampY: ampY };
  }

  function drawOriginalBits(canvas, bits, animPos) {
    var sized = resizeCanvas(canvas);
    var ctx = sized.ctx;
    var width = sized.width;
    var height = sized.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, width, height);
    if (!bits.length) return;

    var axis = drawAxes(ctx, width, height, bits.length, false);
    var segW = axis.drawW / bits.length;

    if (animPos >= 0) {
      var bitW = axis.drawW / Math.max(bits.length, 1);
      drawActiveHighlight(ctx, axis, Math.floor(animPos), bits.length);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    var x = axis.pad.left;
    for (var i = 0; i < bits.length; i++) {
      var y = axis.midY - (bits[i] === 1 ? axis.ampY * 0.9 : -axis.ampY * 0.9);
      var xEnd = axis.pad.left + (i + 1) * segW;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        var prevY = axis.midY - (bits[i - 1] === 1 ? axis.ampY * 0.9 : -axis.ampY * 0.9);
        if (prevY !== y) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(xEnd, y);
      x = xEnd;
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    for (var j = 0; j < bits.length; j++) {
      var xCenter = axis.pad.left + (j + 0.5) * segW;
      ctx.fillStyle = Math.floor(animPos) === j ? '#16a34a' : '#64748b';
      ctx.font = Math.floor(animPos) === j ? 'bold 11px Consolas, monospace' : '10px Consolas, monospace';
      ctx.fillText(String(bits[j]), xCenter, axis.midY + 3);
    }
  }

  function drawWaveform(canvas, segs, color, animPos) {
    var sized = resizeCanvas(canvas);
    var ctx = sized.ctx;
    var width = sized.width;
    var height = sized.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, width, height);
    if (!segs.length) return;

    var axis = drawAxes(ctx, width, height, state.bits.length, false);
    var segW = axis.drawW / segs.length;
    var bitW = axis.drawW / Math.max(state.bits.length, 1);

    if (animPos >= 0) {
      drawActiveHighlight(ctx, axis, Math.floor(animPos), state.bits.length);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    var x = axis.pad.left;
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      var y = axis.midY - seg.level * axis.ampY;
      var xEnd = axis.pad.left + (i + 1) * segW;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        var prevY = axis.midY - segs[i - 1].level * axis.ampY;
        if (prevY !== y) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(xEnd, y);
      x = xEnd;
    }
    ctx.stroke();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (var k = 1; k < segs.length; k++) {
      var xMark = axis.pad.left + k * segW;
      ctx.beginPath();
      ctx.moveTo(xMark, axis.pad.top);
      ctx.lineTo(xMark, axis.pad.top + axis.drawH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.font = 'bold 8px Consolas, monospace';
    ctx.textAlign = 'center';
    for (var m = 0; m < segs.length; m++) {
      var xCenter = axis.pad.left + (m + 0.5) * segW;
      if (segs[m].v) {
        ctx.fillStyle = '#dc2626';
        ctx.fillText('V', xCenter, axis.pad.top + 10);
      } else if (segs[m].b) {
        ctx.fillStyle = '#b45309';
        ctx.fillText('B', xCenter, axis.pad.top + 10);
      }
    }
  }

  function drawSpectrum(canvas, encoded) {
    var sized = resizeCanvas(canvas);
    var ctx = sized.ctx;
    var width = sized.width;
    var height = sized.height;
    var pad = { top: 16, right: 16, bottom: 36, left: 58 };
    var drawW = width - pad.left - pad.right;
    var drawH = height - pad.top - pad.bottom;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = pad.top + (i / 4) * drawH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }
    for (var j = 0; j <= 4; j++) {
      var x = pad.left + (j / 4) * drawW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, height - pad.bottom);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', pad.left, height - 4);
    ctx.fillText('0.25/Tb', pad.left + drawW * 0.25, height - 4);
    ctx.fillText('0.5/Tb', pad.left + drawW * 0.5, height - 4);
    ctx.fillText('0.75/Tb', pad.left + drawW * 0.75, height - 4);
    ctx.fillText('1/Tb', pad.left + drawW, height - 4);
    ctx.fillText('Fréquence normalisée (Tb⁻¹)', pad.left + drawW / 2, height - 18);
    ctx.textAlign = 'left';
    ctx.fillText('Amplitude normalisee', 4, pad.top + 8);

    Object.keys(encoded).forEach(function (codeId) {
      var segs = encoded[codeId];
      if (!segs || !segs.length) return;

      var levels = segs.map(function (s) { return s.level; });
      var n = levels.length;
      var bins = 64;
      var mag = new Float32Array(bins);
      for (var k = 0; k < bins; k++) {
        var re = 0;
        var im = 0;
        for (var nIdx = 0; nIdx < Math.min(n, 128); nIdx++) {
          var phi = (2 * Math.PI * k * nIdx) / Math.min(n, 128);
          re += levels[nIdx % n] * Math.cos(phi);
          im -= levels[nIdx % n] * Math.sin(phi);
        }
        mag[k] = Math.sqrt(re * re + im * im) / Math.max(Math.min(n, 128), 1);
      }

      var maxMag = 0.001;
      for (var m = 0; m < mag.length; m++) maxMag = Math.max(maxMag, mag[m]);

      ctx.strokeStyle = CODES[codeId].color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var p = 0; p < bins; p++) {
        var px = pad.left + (p / (bins - 1)) * drawW;
        var py = pad.top + drawH - (mag[p] / maxMag) * drawH * 0.88;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });
  }

  function bindMeasurement(canvas, type, codeId) {
    canvas.onmousemove = function (event) {
      var rect = canvas.getBoundingClientRect();
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var pad = type === 'spectrum' ? { top: 16, right: 16, bottom: 36, left: 58 } : { top: 12, right: 12, bottom: 32, left: 56 };
      var drawW = width - pad.left - pad.right;
      var drawH = height - pad.top - pad.bottom;
      var x = Math.max(pad.left, Math.min(width - pad.right, event.clientX - rect.left));
      var y = Math.max(pad.top, Math.min(height - pad.bottom, event.clientY - rect.top));

      if (type === 'spectrum') {
        var freq = ((x - pad.left) / Math.max(drawW, 1)).toFixed(3);
        var amp = (1 - (y - pad.top) / Math.max(drawH, 1)).toFixed(3);
        showTooltip('<strong>Spectre</strong><br>f = ' + freq + ' Tb⁻¹<br>|S(f)| = ' + amp, event.clientX, event.clientY);
        return;
      }

      var tb = ((x - pad.left) / Math.max(drawW, 1)) * Math.max(state.bits.length, 1);
      if (type === 'bits') {
        var index = Math.min(state.bits.length - 1, Math.max(0, Math.floor(tb)));
        showTooltip('<strong>Signal binaire</strong><br>t = ' + tb.toFixed(2) + ' Tb<br>bit = ' + state.bits[index], event.clientX, event.clientY);
        return;
      }

      var segs = state.encoded[codeId] || [];
      var segIndex = Math.min(segs.length - 1, Math.max(0, Math.floor((tb / Math.max(state.bits.length, 1)) * segs.length)));
      var level = segs[segIndex] ? segs[segIndex].level : 0;
      showTooltip('<strong>' + codeId + '</strong><br>t = ' + tb.toFixed(2) + ' Tb<br>A = ' + level.toFixed(1) + ' V', event.clientX, event.clientY);
    };
    canvas.onmouseleave = hideTooltip;
    canvas.style.cursor = 'crosshair';
  }

  function buildCodeCheckboxes() {
    var grid = document.getElementById('cl-code-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(CODES).forEach(function (id) {
      var def = CODES[id];
      var item = document.createElement('label');
      item.className = 'cl-code-item' + (state.selectedCodes.indexOf(id) >= 0 ? ' checked' : '');
      item.title = def.desc;

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = id;
      cb.checked = state.selectedCodes.indexOf(id) >= 0;

      var span = document.createElement('span');
      span.className = 'cl-code-label';
      span.textContent = def.label;

      var dot = document.createElement('span');
      dot.className = 'cl-code-dot';
      dot.style.background = def.color;

      cb.addEventListener('change', function () {
        if (cb.checked) {
          if (state.selectedCodes.indexOf(id) < 0) state.selectedCodes.push(id);
          item.classList.add('checked');
        } else {
          state.selectedCodes = state.selectedCodes.filter(function (code) { return code !== id; });
          item.classList.remove('checked');
        }
        renderSimulator();
      });

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(dot);
      grid.appendChild(item);
    });
  }

  function buildPresets() {
    var bar = document.getElementById('cl-presets');
    if (!bar) return;
    bar.innerHTML = '';
    PRESETS.forEach(function (preset) {
      var btn = document.createElement('button');
      btn.className = 'cl-btn';
      btn.type = 'button';
      btn.textContent = preset.label;
      btn.addEventListener('click', function () {
        var bits = preset.bits;
        if (bits === 'random') {
          bits = Array.from({ length: 16 }, function () { return Math.round(Math.random()); }).join('');
        }
        var input = document.getElementById('cl-input');
        if (input) input.value = bits;
        handleInput(bits);
      });
      bar.appendChild(btn);
    });
  }

  function getLayoutKey() {
    return state.selectedCodes.join('|');
  }

  function ensureWaveformCards() {
    var stage = document.getElementById('cl-stage');
    if (!stage) return;

    var layoutKey = getLayoutKey();
    if (stage.dataset.layoutKey === layoutKey && document.getElementById('cl-canvas-original')) {
      return;
    }

    stage.innerHTML = '';

    var original = document.createElement('div');
    original.className = 'cl-waveform-card is-original';
    original.innerHTML = '' +
      '<div class="cl-waveform-header">' +
      '  <div class="cl-waveform-title"><span class="cl-dot" style="background:#94a3b8"></span>Signal binaire original</div>' +
      '  <div class="cl-waveform-meta" id="cl-bits-meta"></div>' +
      '  <button type="button" class="cl-btn" style="flex:0 0 auto;margin-left:8px;padding:4px 10px;font-size:11px" data-download-canvas="cl-canvas-original" data-download-name="signal-binaire">Télécharger PNG</button>' +
      '</div>' +
      '<canvas id="cl-canvas-original" class="cl-canvas is-original"></canvas>' +
      '<div class="cl-bits-display" id="cl-bits-display"></div>';
    stage.appendChild(original);

    var stats = document.createElement('div');
    stats.className = 'cl-waveform-card';
    stats.innerHTML = '' +
      '<div class="cl-waveform-header">' +
      '  <div class="cl-waveform-title" style="color:#16a34a">Indicateurs comparatifs</div>' +
      '</div>' +
      '<div class="cl-stats-bar" id="cl-stats-bar"></div>' +
      '<div style="overflow-x:auto;margin-top:14px">' +
      '  <table class="cl-compare-table" id="cl-compare-table">' +
      '    <thead><tr><th>Code</th><th>Transitions</th><th>Biais DC</th><th>Densit\u00e9 trans.</th><th>\u00c9quilibre \u00b1</th><th>Bande min.</th><th>Composante DC</th></tr></thead>' +
      '    <tbody id="cl-compare-tbody"></tbody>' +
      '  </table>' +
      '</div>';
    stage.appendChild(stats);

    state.selectedCodes.forEach(function (codeId) {
      var def = CODES[codeId];
      if (!def) return;
      var card = document.createElement('div');
      card.className = 'cl-waveform-card';
      card.style.borderLeft = '4px solid ' + def.color;
      card.innerHTML = '' +
        '<div class="cl-waveform-header">' +
        '  <div class="cl-waveform-title"><span class="cl-dot" style="background:' + def.color + '"></span>' + def.label + '</div>' +
        '  <div class="cl-waveform-meta"><span style="color:' + def.color + ';font-weight:700">' + def.desc + '</span></div>' +
        '  <button type="button" class="cl-btn" style="flex:0 0 auto;margin-left:8px;padding:4px 10px;font-size:11px" data-download-canvas="cl-canvas-' + codeId + '" data-download-name="' + def.label + '">Télécharger PNG</button>' +
        '</div>' +
        '<canvas id="cl-canvas-' + codeId + '" class="cl-canvas"></canvas>';
      stage.appendChild(card);
    });

    var spec = document.createElement('div');
    spec.className = 'cl-spectrum-card';
    spec.innerHTML = '' +
      '<h3>Densit\u00e9 spectrale de puissance estim\u00e9e (DSP)</h3>' +
      '<button type="button" class="cl-btn" style="margin-left:8px" data-download-canvas="cl-spectrum" data-download-name="spectre-dsp">Télécharger PNG</button>' +
      '<canvas id="cl-spectrum" class="cl-spectrum"></canvas>' +
      '<div class="cl-spectrum-legend" id="cl-spectrum-legend"></div>';
    stage.appendChild(spec);

    stage.dataset.layoutKey = layoutKey;

    var originalCanvas = document.getElementById('cl-canvas-original');
    if (originalCanvas) {
      bindMeasurement(originalCanvas, 'bits');
    }

    state.selectedCodes.forEach(function (codeId) {
      var canvas = document.getElementById('cl-canvas-' + codeId);
      if (canvas) {
        bindMeasurement(canvas, 'code', codeId);
      }
    });

    var spectrumCanvas = document.getElementById('cl-spectrum');
    if (spectrumCanvas) {
      bindMeasurement(spectrumCanvas, 'spectrum');
    }
  }

  function updateBitsDisplay() {
    var container = document.getElementById('cl-bits-display');
    var meta = document.getElementById('cl-bits-meta');
    if (!container) return;
    container.innerHTML = '';

    state.bits.forEach(function (bit, index) {
      var span = document.createElement('span');
      span.className = 'cl-bit ' + (bit === 1 ? 'one' : 'zero');
      if (state.isAnimating && Math.floor(state.animPos) === index) {
        span.className += ' active';
      }
      span.dataset.idx = String(index);
      span.textContent = String(bit);
      container.appendChild(span);
    });

    if (meta) {
      var ones = state.bits.filter(function (bit) { return bit === 1; }).length;
      var zeros = state.bits.length - ones;
      meta.innerHTML = '<span><strong>' + state.bits.length + '</strong> bits</span>' +
        '<span><strong>' + ones + '</strong> uns</span>' +
        '<span><strong>' + zeros + '</strong> z\u00e9ros</span>';
    }
  }

  function renderStatsTable() {
    var tbody = document.getElementById('cl-compare-tbody');
    var statsBar = document.getElementById('cl-stats-bar');
    if (!tbody) return;
    tbody.innerHTML = '';

    var totalTransitions = 0;
    var codeCount = 0;
    state.selectedCodes.forEach(function (codeId) {
      var segs = state.encoded[codeId];
      if (!segs || !segs.length) return;
      var st = computeStats(segs);
      var hasDC = Math.abs(parseFloat(st.dcBias)) > 0.05;
      var row = document.createElement('tr');
      row.innerHTML = '' +
        '<td><span style="color:' + CODES[codeId].color + ';font-weight:800">' + CODES[codeId].label + '</span></td>' +
        '<td><strong>' + st.transitions + '</strong></td>' +
        '<td><code>' + st.dcBias + '</code></td>' +
        '<td>' + st.density + '%</td>' +
        '<td>' + st.balance + '%</td>' +
        '<td>' + st.bandwidth + '</td>' +
        '<td>' + (hasDC ? '<span class="cl-badge red">Composante DC</span>' : '<span class="cl-badge green">Sans DC</span>') + '</td>';
      tbody.appendChild(row);
      totalTransitions += st.transitions;
      codeCount++;
    });

    if (statsBar) {
      var ones = state.bits.filter(function (bit) { return bit === 1; }).length;
      var zeros = state.bits.length - ones;
      var avgTransitions = codeCount ? (totalTransitions / codeCount).toFixed(0) : '0';
      statsBar.innerHTML = '' +
        '<div class="cl-stat"><div class="cl-stat__label">Longueur s\u00e9quence</div><div class="cl-stat__value">' + state.bits.length + '</div><div class="cl-stat__sub">bits</div></div>' +
        '<div class="cl-stat"><div class="cl-stat__label">Uns / z\u00e9ros</div><div class="cl-stat__value">' + ones + ' / ' + zeros + '</div><div class="cl-stat__sub">ratio ' + ((ones / Math.max(state.bits.length, 1)) * 100).toFixed(0) + '%</div></div>' +
        '<div class="cl-stat"><div class="cl-stat__label">Codes actifs</div><div class="cl-stat__value">' + codeCount + '</div><div class="cl-stat__sub">affich\u00e9s</div></div>' +
        '<div class="cl-stat"><div class="cl-stat__label">Moy. transitions</div><div class="cl-stat__value">' + avgTransitions + '</div><div class="cl-stat__sub">par s\u00e9quence</div></div>';
    }
  }

  function renderSpectrumLegend() {
    var legend = document.getElementById('cl-spectrum-legend');
    if (!legend) return;
    legend.innerHTML = '';
    state.selectedCodes.forEach(function (codeId) {
      var def = CODES[codeId];
      if (!def) return;
      var item = document.createElement('div');
      item.className = 'cl-legend-item';
      item.innerHTML = '<span class="cl-legend-dot" style="background:' + def.color + '"></span>' + def.label;
      legend.appendChild(item);
    });
  }

  function computeEncodedSignals() {
    state.encoded = {};
    state.selectedCodes.forEach(function (codeId) {
      state.encoded[codeId] = encode(codeId, state.bits);
    });
  }

  function drawAllCanvases() {
    var originalCanvas = document.getElementById('cl-canvas-original');
    if (originalCanvas) {
      drawOriginalBits(originalCanvas, state.bits, state.isAnimating ? state.animPos : -1);
    }

    state.selectedCodes.forEach(function (codeId) {
      var canvas = document.getElementById('cl-canvas-' + codeId);
      if (canvas && state.encoded[codeId]) {
        drawWaveform(canvas, state.encoded[codeId], CODES[codeId].color, state.isAnimating ? state.animPos : -1);
      }
    });

    var spectrumCanvas = document.getElementById('cl-spectrum');
    if (spectrumCanvas) {
      drawSpectrum(spectrumCanvas, state.encoded);
    }
  }

  function renderSimulator() {
    if (!state.bits.length) return;
    computeEncodedSignals();
    ensureWaveformCards();
    updateBitsDisplay();
    renderStatsTable();
    renderSpectrumLegend();
    requestAnimationFrame(drawAllCanvases);
  }

  function stopAnimation() {
    state.isAnimating = false;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    state.animFrame = null;
    var btn = document.getElementById('cl-btn-anim');
    if (btn) btn.textContent = '? Animer';
    document.querySelectorAll('.cl-bit').forEach(function (el) { el.classList.remove('active'); });
    drawAllCanvases();
  }

  function resetSimulator() {
    var input = document.getElementById('cl-input');
    stopAnimation();
    if (input) input.value = DEFAULT_BITS;
    handleInput(DEFAULT_BITS);
  }

  function startAnimation() {
    if (state.isAnimating) {
      stopAnimation();
      return;
    }

    state.isAnimating = true;
    state.animPos = 0;
    var btn = document.getElementById('cl-btn-anim');
    if (btn) btn.textContent = '? Arr\u00eater';

    var totalBits = Math.max(state.bits.length, 1);
    var msPerBit = 1000 / Math.max(state.animSpeed, 0.1);
    var lastTime = null;
    var elapsed = 0;

    function step(ts) {
      if (!state.isAnimating) return;
      if (lastTime === null) lastTime = ts;
      elapsed += ts - lastTime;
      lastTime = ts;
      state.animPos = (elapsed / msPerBit) % totalBits;

      var activeIndex = Math.floor(state.animPos);
      document.querySelectorAll('.cl-bit').forEach(function (el, index) {
        el.classList.toggle('active', index === activeIndex);
      });

      drawAllCanvases();
      state.animFrame = requestAnimationFrame(step);
    }

    state.animFrame = requestAnimationFrame(step);
  }

  function handleInput(rawStr) {
    var bits = parseBits(rawStr);
    var errorEl = document.getElementById('cl-input-error');
    if (bits.length < 2) {
      if (errorEl) {
        errorEl.textContent = 'Entrez au moins 2 bits (0 et 1).';
        errorEl.classList.add('visible');
      }
      return;
    }
    if (bits.length > 64) {
      if (errorEl) {
        errorEl.textContent = 'Maximum 64 bits pour une lecture confortable.';
        errorEl.classList.add('visible');
      }
      return;
    }
    if (errorEl) errorEl.classList.remove('visible');
    state.bits = bits;
    if (state.isAnimating) stopAnimation();
    renderSimulator();
  }

  function init() {
    if (initialized) return;
    initialized = true;

    buildCodeCheckboxes();
    buildPresets();

    var stage = document.getElementById('cl-stage');
    if (stage) stage.addEventListener('click', function (event) {
      var btn = event.target && event.target.closest ? event.target.closest('[data-download-canvas]') : null;
      if (!btn) return;
      var canvas = document.getElementById(btn.getAttribute('data-download-canvas'));
      var rawName = btn.getAttribute('data-download-name') || 'chronogramme';
      var safeName = rawName.replace(/[^a-z0-9\-_]+/gi, '-').replace(/^-+|-+$/g, '');
      downloadCanvasPNG(canvas, safeName + '.png');
    });

    var input = document.getElementById('cl-input');
    if (input) {
      input.value = DEFAULT_BITS;
      input.addEventListener('input', function () { handleInput(input.value); });
    }

    var animBtn = document.getElementById('cl-btn-anim');
    if (animBtn) {
      animBtn.onclick = startAnimation;
    }

    var resetBtn = document.getElementById('cl-btn-reset');
    if (resetBtn) {
      resetBtn.onclick = resetSimulator;
    }

    var speedSlider = document.getElementById('cl-speed');
    var speedVal = document.getElementById('cl-speed-val');
    if (speedSlider) {
      state.animSpeed = parseFloat(speedSlider.value || '2');
      if (speedVal) speedVal.textContent = state.animSpeed + ' b/s';
      speedSlider.addEventListener('input', function () {
        state.animSpeed = parseFloat(speedSlider.value || '2');
        if (speedVal) speedVal.textContent = state.animSpeed + ' b/s';
      });
    }

    window.addEventListener('resize', drawAllCanvases);
    handleInput(DEFAULT_BITS);
  }

  window.codageLigneAnimate = startAnimation;
  window.codageLigneReset = resetSimulator;

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
