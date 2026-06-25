/* ================================================================
   SIMULATEUR CODAGE DE LIGNE
   Codes : NRZ-L, NRZ-M, NRZ-I, RZ, Manchester, Manchester Diff.,
           AMI, HDB3, B8ZS
   ================================================================ */
(function () {
  'use strict';

  /* ?? Constantes ??????????????????????????????????????????????? */
  const CODES = {
    'NRZ-L':     { label: 'NRZ-L',        color: '#16a34a', desc: 'Non-Retour-à-Zéro Niveau' },
    'NRZ-M':     { label: 'NRZ-M',        color: '#15803d', desc: 'NRZ Mark (transition sur 1)' },
    'NRZ-I':     { label: 'NRZ-I',        color: '#22c55e', desc: 'NRZ Inversé (transition sur 0)' },
    'RZ':        { label: 'RZ',           color: '#ca8a04', desc: 'Retour-à-Zéro' },
    'MANCHESTER':{ label: 'Manchester',   color: '#1d4ed8', desc: 'Transition au milieu de bit' },
    'DIFF-MAN':  { label: 'Manch. Diff.', color: '#7c3aed', desc: 'Manchester Différentiel' },
    'AMI':       { label: 'AMI',          color: '#dc2626', desc: 'Alternating Mark Inversion' },
    'HDB3':      { label: 'HDB3',         color: '#b45309', desc: 'High Density Bipolar 3' },
    'B8ZS':      { label: 'B8ZS',         color: '#0891b2', desc: 'Bipolar with 8-Zero Substitution' }
  };

  const LEVELS = { HIGH: 1, ZERO: 0, LOW: -1 };
  const DEFAULT_BITS = '10110001000010111';
  const ANIM_STEPS = 40; // frames per bit during animation

  /* ?? State ???????????????????????????????????????????????????? */
  let state = {
    bits: [],
    selectedCodes: ['NRZ-L', 'MANCHESTER', 'AMI', 'HDB3'],
    encoded: {},        // { codeId: [ {level, half?} ] }
    animFrame: null,
    animPos: 0,         // animated bit position (float)
    animSpeed: 1,       // bits per second (animation)
    isAnimating: false,
    spectrumCtx: null
  };

  /* ?? Encoders ????????????????????????????????????????????????? */

  function encodeNRZ_L(bits) {
    // 1?+V, 0?-V  (chaque bit = 1 segment)
    return bits.map(b => ({ level: b === 1 ? LEVELS.HIGH : LEVELS.LOW }));
  }

  function encodeNRZ_M(bits) {
    // Transition sur 1, pas de transition sur 0
    let segs = [];
    let cur = LEVELS.LOW;
    bits.forEach(b => {
      if (b === 1) cur = cur === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
      segs.push({ level: cur });
    });
    return segs;
  }

  function encodeNRZ_I(bits) {
    // Transition sur 0, pas de transition sur 1
    let segs = [];
    let cur = LEVELS.HIGH;
    bits.forEach(b => {
      if (b === 0) cur = cur === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
      segs.push({ level: cur });
    });
    return segs;
  }

  function encodeRZ(bits) {
    // Chaque bit = 2 demi-intervalles : premier = signal, second = 0
    let segs = [];
    bits.forEach(b => {
      segs.push({ level: b === 1 ? LEVELS.HIGH : LEVELS.LOW, half: true });
      segs.push({ level: LEVELS.ZERO, half: true });
    });
    return segs;
  }

  function encodeManchester(bits) {
    // 1 ? bas?haut (transition ? au milieu), 0 ? haut?bas (transition ? au milieu)
    let segs = [];
    bits.forEach(b => {
      if (b === 1) {
        segs.push({ level: LEVELS.LOW,  half: true });
        segs.push({ level: LEVELS.HIGH, half: true });
      } else {
        segs.push({ level: LEVELS.HIGH, half: true });
        segs.push({ level: LEVELS.LOW,  half: true });
      }
    });
    return segs;
  }

  function encodeDiffManchester(bits) {
    // Transition au début du bit sur 0, pas de transition sur 1
    // Transition obligatoire au milieu de chaque bit
    let segs = [];
    let cur = LEVELS.LOW; // niveau courant au début
    bits.forEach(b => {
      if (b === 0) {
        // Transition au début : inverser cur
        cur = cur === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
      }
      // 1ère moitié = cur, 2ème moitié = inverse
      segs.push({ level: cur, half: true });
      let mid = cur === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
      segs.push({ level: mid, half: true });
      cur = mid; // état au début du prochain bit = fin du courant
    });
    return segs;
  }

  function encodeAMI(bits) {
    // 0 ? 0V, 1 ? alternance +V/-V
    let segs = [];
    let lastMark = LEVELS.HIGH; // commence par -V au prochain 1
    bits.forEach(b => {
      if (b === 0) {
        segs.push({ level: LEVELS.ZERO });
      } else {
        lastMark = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
        segs.push({ level: lastMark });
      }
    });
    return segs;
  }

  function encodeHDB3(bits) {
    // AMI avec substitution de toute séquence de 4 zéros consécutifs
    // Règle : 000V ou B00V selon parité des 1 depuis dernière violation
    let segs = new Array(bits.length).fill(null).map(() => ({ level: LEVELS.ZERO }));
    let lastMark = LEVELS.HIGH;  // prochain polarité de 1
    let violations = 0;          // nb de violations (V) posées
    let onesCount = 0;           // 1 depuis dernière violation (pour B00V ou 000V)

    let i = 0;
    while (i < bits.length) {
      if (bits[i] === 1) {
        lastMark = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
        segs[i] = { level: lastMark, mark: true };
        onesCount++;
        i++;
      } else {
        // Compter les zéros consécutifs
        let zStart = i;
        while (i < bits.length && bits[i] === 0) i++;
        let zCount = i - zStart;

        let j = zStart;
        while (j < zStart + zCount) {
          let remaining = zStart + zCount - j;
          if (remaining >= 4) {
            // Substitution
            let useB = (onesCount % 2 === 0); // B00V si pair, 000V si impair
            if (useB) {
              // B00V : B est de même polarité que prochaine marque normale
              let Bpol = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
              segs[j]   = { level: Bpol,  b: true };
              segs[j+1] = { level: LEVELS.ZERO };
              segs[j+2] = { level: LEVELS.ZERO };
              segs[j+3] = { level: Bpol,  v: true }; // V = même polarité que B
              lastMark = Bpol; // V est de même polarité ? prochain mark s'inverse
            } else {
              // 000V
              segs[j]   = { level: LEVELS.ZERO };
              segs[j+1] = { level: LEVELS.ZERO };
              segs[j+2] = { level: LEVELS.ZERO };
              let Vpol = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
              segs[j+3] = { level: Vpol, v: true };
              lastMark = Vpol;
            }
            onesCount = 0;
            j += 4;
          } else {
            segs[j] = { level: LEVELS.ZERO };
            j++;
          }
        }
      }
    }
    return segs;
  }

  function encodeB8ZS(bits) {
    // AMI avec substitution de toute séquence de 8 zéros consécutifs
    // Remplacement par 000VB0VB (V = violation, B = bipolar)
    let segs = new Array(bits.length).fill(null).map(() => ({ level: LEVELS.ZERO }));
    let lastMark = LEVELS.HIGH;

    let i = 0;
    while (i < bits.length) {
      if (bits[i] === 1) {
        lastMark = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
        segs[i] = { level: lastMark, mark: true };
        i++;
      } else {
        let zStart = i;
        while (i < bits.length && bits[i] === 0) i++;
        let zCount = i - zStart;

        let j = zStart;
        while (j < zStart + zCount) {
          let remaining = zStart + zCount - j;
          if (remaining >= 8) {
            // 000VB0VB
            let V1 = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH; // violation = same as last mark
            let B  = lastMark; // B = opposite of V1
            let V2 = lastMark === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
            // pattern: 0 0 0 V1 B 0 V2 B
            // V1 = same as lastMark (violation)
            // B after V1 = opposite of V1
            let pattern = [
              { level: LEVELS.ZERO },
              { level: LEVELS.ZERO },
              { level: LEVELS.ZERO },
              { level: V1, v: true },
              { level: V1 === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH, b: true },
              { level: LEVELS.ZERO },
              { level: V1, v: true },
              { level: V1 === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH, b: true }
            ];
            pattern.forEach((p, k) => { segs[j + k] = p; });
            // lastMark stays — B8ZS last pulse is B (opposite of V)
            lastMark = V1 === LEVELS.HIGH ? LEVELS.LOW : LEVELS.HIGH;
            j += 8;
          } else {
            segs[j] = { level: LEVELS.ZERO };
            j++;
          }
        }
      }
    }
    return segs;
  }

  /* ?? Encode dispatcher ???????????????????????????????????????? */
  function encode(codeId, bits) {
    switch (codeId) {
      case 'NRZ-L':    return encodeNRZ_L(bits);
      case 'NRZ-M':    return encodeNRZ_M(bits);
      case 'NRZ-I':    return encodeNRZ_I(bits);
      case 'RZ':       return encodeRZ(bits);
      case 'MANCHESTER': return encodeManchester(bits);
      case 'DIFF-MAN': return encodeDiffManchester(bits);
      case 'AMI':      return encodeAMI(bits);
      case 'HDB3':     return encodeHDB3(bits);
      case 'B8ZS':     return encodeB8ZS(bits);
      default:         return [];
    }
  }

  /* ?? Statistics ??????????????????????????????????????????????? */
  function computeStats(segs) {
    let transitions = 0;
    let dcBias = 0;
    let zeros = 0, highs = 0, lows = 0;
    for (let i = 0; i < segs.length; i++) {
      const lv = segs[i].level;
      dcBias += lv;
      if (lv === LEVELS.ZERO) zeros++;
      else if (lv === LEVELS.HIGH) highs++;
      else lows++;
      if (i > 0 && segs[i].level !== segs[i - 1].level) transitions++;
    }
    const n = segs.length;
    return {
      transitions,
      dcBias: (dcBias / n).toFixed(3),
      density: ((transitions / n) * 100).toFixed(1),
      balance: (((highs - lows) / Math.max(highs + lows, 1)) * 100).toFixed(1),
      bandwidth: estimateBandwidth(segs)
    };
  }

  function estimateBandwidth(segs) {
    // Heuristic: min bandwidth ? transitions / (2 * N) × fs
    let trans = 0;
    for (let i = 1; i < segs.length; i++) {
      if (segs[i].level !== segs[i - 1].level) trans++;
    }
    const n = segs.length;
    const ratio = trans / (2 * n);
    if (ratio <= 0.5)  return '0.5 × Tb?¹';
    if (ratio <= 1.0)  return '1 × Tb?¹';
    return '2 × Tb?¹';
  }

  /* ?? Drawing ?????????????????????????????????????????????????? */
  function drawWaveform(canvas, segs, color, animPos, label) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { t: 6, b: 6, l: 36, r: 10 };
    const drawW = W - PAD.l - PAD.r;
    const drawH = H - PAD.t - PAD.b;
    const midY = PAD.t + drawH / 2;
    const ampY = drawH * 0.38;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, W, H);

    if (!segs || segs.length === 0) return;

    const N = segs.length;
    const segW = drawW / N;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // +V line
    ctx.beginPath();
    ctx.moveTo(PAD.l, midY - ampY);
    ctx.lineTo(W - PAD.r, midY - ampY);
    ctx.stroke();
    // 0V line
    ctx.beginPath();
    ctx.moveTo(PAD.l, midY);
    ctx.lineTo(W - PAD.r, midY);
    ctx.stroke();
    // -V line
    ctx.beginPath();
    ctx.moveTo(PAD.l, midY + ampY);
    ctx.lineTo(W - PAD.r, midY + ampY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+V', PAD.l - 4, midY - ampY + 3);
    ctx.fillText('0',  PAD.l - 4, midY + 3);
    ctx.fillText('?V', PAD.l - 4, midY + ampY + 3);

    // Animated highlight region
    if (animPos > 0 && animPos <= N) {
      const bitIdx = Math.floor(animPos);
      const x = PAD.l + bitIdx * segW;
      const w = segW;
      ctx.fillStyle = 'rgba(22,163,74,0.08)';
      ctx.fillRect(x, PAD.t, w, drawH);
    }

    // Draw signal
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let x = PAD.l;
    for (let i = 0; i < N; i++) {
      const seg = segs[i];
      const y = midY - seg.level * ampY;
      const xEnd = PAD.l + (i + 1) * segW;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevY = midY - segs[i - 1].level * ampY;
        if (prevY !== y) {
          // Vertical transition
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(xEnd, y);
      x = xEnd;
    }
    ctx.stroke();

    // Bit markers (vertical dashed separators)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (let i = 1; i < N; i++) {
      // Only draw if not a half-segment boundary (unless it's a full-bit boundary)
      const xMark = PAD.l + i * segW;
      ctx.beginPath();
      ctx.moveTo(xMark, PAD.t);
      ctx.lineTo(xMark, PAD.t + drawH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Special markers (V, B for HDB3/B8ZS)
    ctx.font = 'bold 8px Consolas, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < N; i++) {
      const seg = segs[i];
      const xCenter = PAD.l + (i + 0.5) * segW;
      if (seg.v) {
        ctx.fillStyle = '#dc2626';
        ctx.fillText('V', xCenter, PAD.t + 10);
      } else if (seg.b) {
        ctx.fillStyle = '#b45309';
        ctx.fillText('B', xCenter, PAD.t + 10);
      }
    }
  }

  function drawOriginalBits(canvas, bits, animPos) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { t: 6, b: 6, l: 36, r: 10 };
    const drawW = W - PAD.l - PAD.r;
    const drawH = H - PAD.t - PAD.b;
    const midY = PAD.t + drawH / 2;
    const ampY = drawH * 0.35;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, W, H);

    if (!bits || bits.length === 0) return;

    const N = bits.length;
    const segW = drawW / N;

    // Draw NRZ-L representation as original data
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let x = PAD.l;
    for (let i = 0; i < N; i++) {
      const y = midY - (bits[i] === 1 ? ampY : -ampY);
      const xEnd = PAD.l + (i + 1) * segW;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevY = midY - (bits[i - 1] === 1 ? ampY : -ampY);
        if (prevY !== y) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(xEnd, y);
      x = xEnd;
    }
    ctx.stroke();

    // Bit labels in center
    for (let i = 0; i < N; i++) {
      const xCenter = PAD.l + (i + 0.5) * segW;
      const isActive = animPos > 0 && Math.floor(animPos) === i;
      ctx.fillStyle = isActive ? '#16a34a' : '#64748b';
      ctx.font = isActive ? 'bold 11px Consolas, monospace' : '10px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(bits[i], xCenter, midY + 3);
    }

    // Axis label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('bit', PAD.l - 4, midY + 3);
  }

  /* ?? Spectrum ????????????????????????????????????????????????? */
  function drawSpectrum(canvas, allSegs) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { t: 14, b: 24, l: 40, r: 14 };
    const drawW = W - PAD.l - PAD.r;
    const drawH = H - PAD.t - PAD.b;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = PAD.t + (i / gridLines) * drawH;
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(W - PAD.r, y);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', PAD.l, H - 4);
    ctx.fillText('0.5/Tb', PAD.l + drawW / 2, H - 4);
    ctx.fillText('1/Tb', W - PAD.r, H - 4);
    ctx.textAlign = 'left';
    ctx.fillText('|S(f)|²', 2, PAD.t + 8);

    if (!allSegs || Object.keys(allSegs).length === 0) return;

    // Compute PSD estimate via DFT magnitude
    Object.entries(allSegs).forEach(([codeId, segs]) => {
      if (!segs || segs.length === 0) return;
      const color = CODES[codeId] ? CODES[codeId].color : '#ffffff';

      const levels = segs.map(s => s.level);
      const N = levels.length;
      const NFFT = Math.min(N, 128);
      const freqBins = 64;

      // Simple DFT magnitude
      const mag = new Float32Array(freqBins);
      for (let k = 0; k < freqBins; k++) {
        let re = 0, im = 0;
        for (let n = 0; n < NFFT; n++) {
          const phi = (2 * Math.PI * k * n) / NFFT;
          re += levels[n % N] * Math.cos(phi);
          im -= levels[n % N] * Math.sin(phi);
        }
        mag[k] = Math.sqrt(re * re + im * im) / NFFT;
      }

      // Normalise
      const maxMag = Math.max(...mag, 0.001);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = 0; k < freqBins; k++) {
        const x = PAD.l + (k / (freqBins - 1)) * drawW;
        const y = PAD.t + drawH - (mag[k] / maxMag) * drawH * 0.88;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  /* ?? UI ??????????????????????????????????????????????????????? */
  function parseBits(str) {
    return str.trim().replace(/\s/g, '').split('').filter(c => c === '0' || c === '1').map(Number);
  }

  function buildCodeCheckboxes() {
    const grid = document.getElementById('cl-code-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(CODES).forEach(([id, def]) => {
      const item = document.createElement('label');
      item.className = 'cl-code-item' + (state.selectedCodes.includes(id) ? ' checked' : '');
      item.title = def.desc;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = id;
      cb.checked = state.selectedCodes.includes(id);

      const span = document.createElement('span');
      span.className = 'cl-code-label';
      span.textContent = def.label;

      const dot = document.createElement('span');
      dot.className = 'cl-code-dot';
      dot.style.background = def.color;

      cb.addEventListener('change', () => {
        if (cb.checked) {
          if (!state.selectedCodes.includes(id)) state.selectedCodes.push(id);
          item.classList.add('checked');
        } else {
          state.selectedCodes = state.selectedCodes.filter(c => c !== id);
          item.classList.remove('checked');
        }
        render();
      });

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(dot);
      grid.appendChild(item);
    });
  }

  function buildWaveformCards() {
    const stage = document.getElementById('cl-stage');
    if (!stage) return;
    stage.innerHTML = '';

    // Original signal card
    const origCard = document.createElement('div');
    origCard.className = 'cl-waveform-card is-original';
    origCard.innerHTML = `
      <div class="cl-waveform-header">
        <div class="cl-waveform-title">
          <span class="cl-dot" style="background:#94a3b8"></span>
          Signal binaire original
        </div>
        <div class="cl-waveform-meta" id="cl-bits-meta"></div>
      </div>
      <canvas id="cl-canvas-original" class="cl-canvas is-original"></canvas>
      <div class="cl-bits-display" id="cl-bits-display"></div>`;
    stage.appendChild(origCard);

    // Stats card
    const statsCard = document.createElement('div');
    statsCard.className = 'cl-waveform-card';
    statsCard.innerHTML = `
      <div class="cl-waveform-header">
        <div class="cl-waveform-title" style="color:#16a34a">?? Indicateurs comparatifs</div>
      </div>
      <div class="cl-stats-bar" id="cl-stats-bar"></div>
      <div style="overflow-x:auto;margin-top:14px">
        <table class="cl-compare-table" id="cl-compare-table">
          <thead><tr>
            <th>Code</th>
            <th>Transitions</th>
            <th>Biais DC</th>
            <th>Densité trans.</th>
            <th>Équilibre ±</th>
            <th>Bande min.</th>
            <th>Composante DC</th>
          </tr></thead>
          <tbody id="cl-compare-tbody"></tbody>
        </table>
      </div>`;
    stage.appendChild(statsCard);

    // One card per selected code
    state.selectedCodes.forEach(codeId => {
      if (!CODES[codeId]) return;
      const def = CODES[codeId];
      const card = document.createElement('div');
      card.className = 'cl-waveform-card';
      card.id = `cl-card-${codeId}`;
      card.style.borderLeft = `4px solid ${def.color}`;
      card.innerHTML = `
        <div class="cl-waveform-header">
          <div class="cl-waveform-title">
            <span class="cl-dot" style="background:${def.color}"></span>
            ${def.label}
          </div>
          <div class="cl-waveform-meta">
            <span title="${def.desc}" style="color:${def.color};font-weight:700">${def.desc}</span>
          </div>
        </div>
        <canvas id="cl-canvas-${codeId}" class="cl-canvas"></canvas>`;
      stage.appendChild(card);
    });

    // Spectrum card
    const specCard = document.createElement('div');
    specCard.className = 'cl-spectrum-card';
    specCard.innerHTML = `
      <h3>Densité spectrale de puissance estimée (DSP)</h3>
      <canvas id="cl-spectrum" class="cl-spectrum"></canvas>
      <div class="cl-spectrum-legend" id="cl-spectrum-legend"></div>`;
    stage.appendChild(specCard);

    // Resize all canvases
    setTimeout(resizeCanvases, 0);
  }

  function resizeCanvases() {
    document.querySelectorAll('canvas.cl-canvas, canvas.cl-spectrum').forEach(c => {
      c.width = c.offsetWidth * window.devicePixelRatio;
      c.height = c.offsetHeight * window.devicePixelRatio;
      const ctx = c.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
  }

  function updateBitsDisplay() {
    const container = document.getElementById('cl-bits-display');
    const meta = document.getElementById('cl-bits-meta');
    if (!container) return;
    container.innerHTML = '';
    state.bits.forEach((b, i) => {
      const span = document.createElement('span');
      span.className = `cl-bit ${b === 1 ? 'one' : 'zero'}`;
      span.dataset.idx = i;
      span.textContent = b;
      container.appendChild(span);
    });
    if (meta) {
      meta.innerHTML = `<span><strong>${state.bits.length}</strong> bits</span>
        <span><strong>${state.bits.filter(b => b === 1).length}</strong> uns</span>
        <span><strong>${state.bits.filter(b => b === 0).length}</strong> zéros</span>`;
    }
  }

  function updateStatsTable() {
    const tbody = document.getElementById('cl-compare-tbody');
    const statsBar = document.getElementById('cl-stats-bar');
    if (!tbody) return;

    tbody.innerHTML = '';
    let totalTransitions = 0;
    let codeCount = 0;

    state.selectedCodes.forEach(codeId => {
      const segs = state.encoded[codeId];
      if (!segs) return;
      const st = computeStats(segs);
      const def = CODES[codeId];
      const hasDC = Math.abs(parseFloat(st.dcBias)) > 0.05;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="color:${def.color};font-weight:800">${def.label}</span></td>
        <td><strong>${st.transitions}</strong></td>
        <td><code>${st.dcBias}</code></td>
        <td>${st.density}%</td>
        <td>${st.balance}%</td>
        <td>${st.bandwidth}</td>
        <td>${hasDC
          ? '<span class="cl-badge red">Composante DC</span>'
          : '<span class="cl-badge green">Sans DC</span>'}</td>`;
      tbody.appendChild(tr);
      totalTransitions += st.transitions;
      codeCount++;
    });

    // Global stats in top bar
    if (statsBar) {
      const avgTrans = codeCount > 0 ? (totalTransitions / codeCount).toFixed(0) : '—';
      const ones = state.bits.filter(b => b === 1).length;
      const zeros = state.bits.filter(b => b === 0).length;
      statsBar.innerHTML = `
        <div class="cl-stat">
          <div class="cl-stat__label">Longueur séquence</div>
          <div class="cl-stat__value">${state.bits.length}</div>
          <div class="cl-stat__sub">bits</div>
        </div>
        <div class="cl-stat">
          <div class="cl-stat__label">Uns / Zéros</div>
          <div class="cl-stat__value">${ones} / ${zeros}</div>
          <div class="cl-stat__sub">ratio ${(ones / Math.max(state.bits.length, 1) * 100).toFixed(0)}%</div>
        </div>
        <div class="cl-stat">
          <div class="cl-stat__label">Codes actifs</div>
          <div class="cl-stat__value">${codeCount}</div>
          <div class="cl-stat__sub">affichés</div>
        </div>
        <div class="cl-stat">
          <div class="cl-stat__label">Moy. transitions</div>
          <div class="cl-stat__value">${avgTrans}</div>
          <div class="cl-stat__sub">par séquence</div>
        </div>`;
    }
  }

  function updateSpectrumLegend() {
    const legend = document.getElementById('cl-spectrum-legend');
    if (!legend) return;
    legend.innerHTML = '';
    state.selectedCodes.forEach(codeId => {
      const def = CODES[codeId];
      if (!def) return;
      const item = document.createElement('div');
      item.className = 'cl-legend-item';
      item.innerHTML = `<span class="cl-legend-dot" style="background:${def.color}"></span>${def.label}`;
      legend.appendChild(item);
    });
  }

  /* ?? Render all waveforms ????????????????????????????????????? */
  function render() {
    if (state.bits.length === 0) return;

    // Encode
    state.encoded = {};
    state.selectedCodes.forEach(codeId => {
      state.encoded[codeId] = encode(codeId, state.bits);
    });

    buildWaveformCards();
    updateBitsDisplay();
    updateStatsTable();
    updateSpectrumLegend();

    // Draw after a tick (canvases need layout)
    requestAnimationFrame(() => {
      // Original
      const origCanvas = document.getElementById('cl-canvas-original');
      if (origCanvas) drawOriginalBits(origCanvas, state.bits, 0);

      // Each code
      state.selectedCodes.forEach(codeId => {
        const canvas = document.getElementById(`cl-canvas-${codeId}`);
        if (canvas && state.encoded[codeId]) {
          drawWaveform(canvas, state.encoded[codeId], CODES[codeId].color, 0, CODES[codeId].label);
        }
      });

      // Spectrum
      const specCanvas = document.getElementById('cl-spectrum');
      if (specCanvas) {
        specCanvas.width = specCanvas.offsetWidth * window.devicePixelRatio;
        specCanvas.height = specCanvas.offsetHeight * window.devicePixelRatio;
        const ctx = specCanvas.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        drawSpectrum(specCanvas, state.encoded);
      }
    });
  }

  /* ?? Animation ???????????????????????????????????????????????? */
  function startAnimation() {
    if (state.isAnimating) { stopAnimation(); return; }
    state.isAnimating = true;
    state.animPos = 0;
    const btn = document.getElementById('cl-btn-anim');
    if (btn) btn.textContent = '? Arrêter';

    const totalBits = state.bits.length;
    const msPerBit = 1000 / state.animSpeed;
    let lastTime = null;
    let elapsed = 0;

    function step(ts) {
      if (!state.isAnimating) return;
      if (lastTime === null) lastTime = ts;
      elapsed += ts - lastTime;
      lastTime = ts;

      state.animPos = (elapsed / msPerBit) % (totalBits + 1);
      const bitIdx = Math.min(Math.floor(state.animPos), totalBits - 1);

      // Highlight current bit
      document.querySelectorAll('.cl-bit').forEach((el, i) => {
        el.classList.toggle('active', i === bitIdx);
      });

      // Redraw all with highlight
      const origCanvas = document.getElementById('cl-canvas-original');
      if (origCanvas) drawOriginalBits(origCanvas, state.bits, state.animPos);

      state.selectedCodes.forEach(codeId => {
        const canvas = document.getElementById(`cl-canvas-${codeId}`);
        if (canvas && state.encoded[codeId]) {
          // For RZ / Manchester, animPos maps to segment pairs
          drawWaveform(canvas, state.encoded[codeId], CODES[codeId].color, state.animPos, codeId);
        }
      });

      if (state.animPos >= totalBits) {
        elapsed = 0; // loop
      }

      state.animFrame = requestAnimationFrame(step);
    }
    state.animFrame = requestAnimationFrame(step);
  }

  function stopAnimation() {
    state.isAnimating = false;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    state.animFrame = null;
    const btn = document.getElementById('cl-btn-anim');
    if (btn) btn.textContent = '? Animer';
    document.querySelectorAll('.cl-bit').forEach(el => el.classList.remove('active'));
  }

  /* ?? Presets ?????????????????????????????????????????????????? */
  const PRESETS = [
    { label: 'Série de 1',      bits: '11111111' },
    { label: 'Série de 0',      bits: '00000000' },
    { label: 'Alternance',      bits: '10101010' },
    { label: 'HDB3 test',       bits: '10000011000010' },
    { label: 'B8ZS test',       bits: '1000000001000000001' },
    { label: 'Aléatoire',       bits: 'random' }
  ];

  function buildPresets() {
    const bar = document.getElementById('cl-presets');
    if (!bar) return;
    PRESETS.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'cl-btn';
      btn.style.flex = '0 0 auto';
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        let bits = p.bits;
        if (bits === 'random') {
          bits = Array.from({ length: 16 }, () => Math.round(Math.random())).join('');
        }
        const inp = document.getElementById('cl-input');
        if (inp) { inp.value = bits; }
        handleInput(bits);
      });
      bar.appendChild(btn);
    });
  }

  function handleInput(rawStr) {
    const bits = parseBits(rawStr || '');
    const errEl = document.getElementById('cl-input-error');
    if (bits.length < 2) {
      if (errEl) { errEl.textContent = 'Entrez au moins 2 bits (0 et 1).'; errEl.classList.add('visible'); }
      return;
    }
    if (bits.length > 64) {
      if (errEl) { errEl.textContent = 'Maximum 64 bits pour une lecture confortable.'; errEl.classList.add('visible'); }
      return;
    }
    if (errEl) errEl.classList.remove('visible');
    state.bits = bits;
    stopAnimation();
    render();
  }

  /* ?? Init ????????????????????????????????????????????????????? */
  function init() {
    buildCodeCheckboxes();
    buildPresets();

    const inp = document.getElementById('cl-input');
    if (inp) {
      inp.value = DEFAULT_BITS;
      inp.addEventListener('input', () => handleInput(inp.value));
    }

    const animBtn = document.getElementById('cl-btn-anim');
    if (animBtn) animBtn.addEventListener('click', startAnimation);

    const resetBtn = document.getElementById('cl-btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      const input = document.getElementById('cl-input');
      if (input) { input.value = DEFAULT_BITS; handleInput(DEFAULT_BITS); }
    });

    const speedSlider = document.getElementById('cl-speed');
    const speedVal = document.getElementById('cl-speed-val');
    if (speedSlider) {
      speedSlider.addEventListener('input', () => {
        state.animSpeed = parseFloat(speedSlider.value);
        if (speedVal) speedVal.textContent = `${state.animSpeed} b/s`;
      });
    }

    window.addEventListener('resize', () => {
      resizeCanvases();
      render();
    });

    // Initial render
    handleInput(DEFAULT_BITS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
