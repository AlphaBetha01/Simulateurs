LabCommon.initHeader({ bodySection: 'transmission', pageId: 'transmission-base' });
const state = { time: 0, speed: 0.04, playingAudio: false, isPaused: false };
const stats = { totalBits: 0, errorBits: 0 };

const phys = {
  cuivre: { attBase: 5, attKm: 0.5, cap: 80 }, 
  fibre:  { attBase: 1, attKm: 0.05, cap: 200 }, 
  radio:  { attBase: 15, attKm: 1.2, cap: 40 },
  sat:    { attBase: 30, attKm: 0.01, cap: 45 }
};

const $ = id => document.getElementById(id);
const ui = {
  dist: $('dist'), media: $('mediaType'), fe: $('fe'), lineCode: $('lineCode'),
  fec: $('fec'), filter: $('filter'), btnAudio: $('btnAudio'), btnPlayPause: $('btnPlayPause'),
  txGain: $('txGain'), fc: $('fc'), jitter: $('jitter'), threshold: $('threshold'),
  svgSource: $('svgSource'), svgMod: $('svgMod'), svgChannel: $('svgChannel'), 
  svgDemod: $('svgDemod'), svgOut: $('svgOut'), eyeCanvas: $('eyeCanvas'),
  txBits: $('txBits'), rxBits: $('rxBits'),
  vDist: $('valDist'), vNoise: $('valNoise'), vFe: $('valFe'),
  vRb: $('valRb'), vC: $('valC'), shFill: $('shannonFill'), vBER: $('valBER'),
  kpiSnr: $('linkSnr'), kpiMargin: $('linkMargin'), kpiState: $('linkState'), kpiStateNote: $('linkStateNote')
};

const ctxEye = ui.eyeCanvas.getContext('2d');
let audioCtx, osc, noiseNode, gainMaster, gainNoise;
const linkPresetButtons = document.querySelectorAll('[data-link-preset]');
let transmissionTooltip = null;
const transmissionPlotData = {};

const linkPresets = {
  fibre: { media: 'fibre', dist: 10, fe: 18, jitter: 1, txGain: 1.0, fc: 34, threshold: 0, fec: 0, filter: 1, lineCode: 'nrz' },
  cuivre: { media: 'cuivre', dist: 20, fe: 12, jitter: 4, txGain: 1.0, fc: 30, threshold: 0, fec: 0, filter: 1, lineCode: 'nrz' },
  radio: { media: 'radio', dist: 35, fe: 18, jitter: 16, txGain: 1.5, fc: 28, threshold: 0.15, fec: 1, filter: 1, lineCode: 'manchester' },
  sat: { media: 'sat', dist: 90, fe: 22, jitter: 24, txGain: 1.8, fc: 20, threshold: 0.25, fec: 1, filter: 0, lineCode: 'manchester' }
};

linkPresetButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const preset = linkPresets[button.dataset.linkPreset];
    if (!preset) {
      return;
    }

    ui.media.value = preset.media;
    ui.dist.value = preset.dist;
    ui.fe.value = preset.fe;
    ui.jitter.value = preset.jitter;
    ui.txGain.value = preset.txGain;
    ui.fc.value = preset.fc;
    ui.threshold.value = preset.threshold;
    ui.fec.value = preset.fec;
    ui.filter.value = preset.filter;
    ui.lineCode.value = preset.lineCode;
  });
});

// Pause
ui.btnPlayPause.addEventListener('click', () => {
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
      ui.btnPlayPause.textContent = '▶ Reprendre'; ui.btnPlayPause.classList.add('active-red');
      if (audioCtx) gainMaster.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  } else {
      ui.btnPlayPause.textContent = '⏸ Pause / Mesures'; ui.btnPlayPause.classList.remove('active-red');
  }
});

// Audio
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 440;
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  noiseNode = audioCtx.createBufferSource(); noiseNode.buffer = noiseBuffer; noiseNode.loop = true;
  gainMaster = audioCtx.createGain(); gainNoise = audioCtx.createGain();
  osc.connect(gainMaster); noiseNode.connect(gainNoise); gainNoise.connect(gainMaster);
  gainMaster.connect(audioCtx.destination);
  osc.start(); noiseNode.start(); gainMaster.gain.value = 0;
}

ui.btnAudio.addEventListener('click', () => {
  if (!audioCtx) initAudio();
  state.playingAudio = !state.playingAudio;
  if (state.playingAudio) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    ui.btnAudio.textContent = '🔊 Son activé'; ui.btnAudio.classList.add('active-green');
  } else {
    gainMaster.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    ui.btnAudio.textContent = '🔇 Son'; ui.btnAudio.classList.remove('active-green');
  }
});

function getAnalogVal(t) { return Math.sin(t * 3) * 0.7 + Math.sin(t * 7.5) * 0.2; }

function formatTbTick(value) {
  return value.toFixed(value >= 10 ? 0 : 1);
}

function ensureTransmissionTooltip() {
  if (transmissionTooltip) {
    return transmissionTooltip;
  }

  transmissionTooltip = document.createElement('div');
  transmissionTooltip.style.position = 'fixed';
  transmissionTooltip.style.zIndex = '9999';
  transmissionTooltip.style.pointerEvents = 'none';
  transmissionTooltip.style.padding = '8px 10px';
  transmissionTooltip.style.borderRadius = '10px';
  transmissionTooltip.style.background = 'rgba(15, 23, 42, 0.94)';
  transmissionTooltip.style.color = '#f8fafc';
  transmissionTooltip.style.font = '12px/1.4 Segoe UI, sans-serif';
  transmissionTooltip.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.22)';
  transmissionTooltip.style.display = 'none';
  document.body.appendChild(transmissionTooltip);
  return transmissionTooltip;
}

function showTransmissionTooltip(html, clientX, clientY) {
  const tooltip = ensureTransmissionTooltip();
  tooltip.innerHTML = html;
  tooltip.style.left = clientX + 14 + 'px';
  tooltip.style.top = clientY + 14 + 'px';
  tooltip.style.display = 'block';
}

function hideTransmissionTooltip() {
  if (transmissionTooltip) {
    transmissionTooltip.style.display = 'none';
  }
}

function attachTransmissionHover(svg, key, title, color) {
  if (!svg) {
    return;
  }

  svg.onmousemove = function (event) {
    const series = transmissionPlotData[key];
    if (!series || !series.length) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const index = Math.min(series.length - 1, Math.max(0, Math.round(ratio * (series.length - 1))));
    const point = series[index];
    showTransmissionTooltip(
      '<strong>' + title + '</strong><br>' +
      't = ' + point.tb.toFixed(2) + ' Tb<br>' +
      'A = ' + point.value.toFixed(3) + ' V',
      event.clientX,
      event.clientY
    );
    svg.style.cursor = 'crosshair';
  };

  svg.onmouseleave = function () {
    hideTransmissionTooltip();
  };

  if (color) {
    svg.style.outline = '1px solid transparent';
  }
}

function buildSvgAxes(width, height, options) {
  const axisColor = '#94a3b8';
  const gridColor = options.dark ? 'rgba(148,163,184,0.18)' : '#e2e8f0';
  const top = options.top;
  const bottom = options.bottom;
  const mid = (top + bottom) / 2;
  const amp = (bottom - top) / 2;
  const left = options.left || 34;
  const xMax = Math.max(options.xMax || 1, 1);
  let svg = '';

  [1, 0, -1].forEach(function (level) {
    const y = mid - level * amp;
    const label = (level > 0 ? '+' : '') + level + ' V';
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`;
    svg += `<text x="${left - 4}" y="${y + 3}" fill="${axisColor}" font-size="9" text-anchor="end">${label}</text>`;
  });

  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4;
    const x = ratio * width;
    svg += `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4 4"/>`;
    svg += `<text x="${x}" y="${height - 4}" fill="${axisColor}" font-size="9" text-anchor="middle">${formatTbTick(ratio * xMax)}</text>`;
  }

  svg += `<line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="${axisColor}" stroke-width="1.2"/>`;
  svg += `<line x1="0" y1="${mid}" x2="${width}" y2="${mid}" stroke="${axisColor}" stroke-width="1.2"/>`;
  svg += `<text x="${width / 2}" y="${height - 16}" fill="${axisColor}" font-size="10" text-anchor="middle">Temps (Tb)</text>`;
  svg += `<text x="14" y="${height / 2}" fill="${axisColor}" font-size="10" text-anchor="middle" transform="rotate(-90 14 ${height / 2})">Amplitude (V)</text>`;

  if (options.note) {
    svg += `<text x="${width - 8}" y="12" fill="${axisColor}" font-size="9" text-anchor="end">${options.note}</text>`;
  }

  return svg;
}

function drawEyeAxes(ctx, width, height) {
  const axisColor = 'rgba(148,163,184,0.85)';
  const gridColor = 'rgba(148,163,184,0.18)';
  const left = 36;
  const top = 10;
  const bottom = height - 24;
  const mid = (top + bottom) / 2;
  const amp = 40;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  [mid - amp, mid, mid + amp].forEach(function (y) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });
  [0, 0.5, 1].forEach(function (ratio) {
    const x = ratio * width;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.strokeStyle = axisColor;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.moveTo(0, mid);
  ctx.lineTo(width, mid);
  ctx.stroke();

  ctx.fillStyle = axisColor;
  ctx.font = '10px Segoe UI, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('+1 V', left - 4, mid - amp + 3);
  ctx.fillText('0 V', left - 4, mid + 3);
  ctx.fillText('-1 V', left - 4, mid + amp + 3);
  ctx.textAlign = 'center';
  ctx.fillText('0', 0, height - 6);
  ctx.fillText('1 Tb', width / 2, height - 6);
  ctx.fillText('2 Tb', width, height - 6);
  ctx.fillText('Temps (Tb)', width / 2, height - 18);
  ctx.save();
  ctx.translate(14, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Amplitude (V)', 0, 0);
  ctx.restore();
}

function draw() {
  if (!state.isPaused) state.time += state.speed;
  const tGlobal = state.time;
  
  // Variables Utilisateur
  const dist = +ui.dist.value;
  const fe = +ui.fe.value;
  const media = phys[ui.media.value];
  const useManchester = ui.lineCode.value === 'manchester';
  const useFec = +ui.fec.value === 1;
  const useFilter = +ui.filter.value === 1;
  const txGain = +ui.txGain.value;
  const fPorteuse = +ui.fc.value;
  const jitterVal = +ui.jitter.value;
  const threshVal = +ui.threshold.value;

  const w = 400, h = 100, hEye = 150;
  
  // UI Texts
  $('valGain').textContent = `${txGain.toFixed(1)} V/V`;
  $('valFc').textContent = `${fPorteuse} Hz`;
  $('valJitter').textContent = `${jitterVal}%`;
  $('valThresh').textContent = `${threshVal.toFixed(2)} V`;
  $('valFec').textContent = useFec ? 'ON (+15dB)' : 'OFF';
  $('valFilter').textContent = useFilter ? 'ON' : 'OFF (ZOH)';

  // Mathématiques & SNR
  // Le gain TX augmente la puissance émise, donc compense l'atténuation.
  const gainDB = 10 * Math.log10(txGain * txGain); 
  const attenuation = Math.max(0, media.attBase + (dist * media.attKm) - gainDB);
  const SNR_dB = 45 - attenuation; 
  const SNR_linear = Math.pow(10, SNR_dB / 10);
  
  let capacity = media.cap * Math.log2(1 + SNR_linear) / 10; 
  if (capacity < 0.1) capacity = 0.1;
  const effectiveCapacity = capacity + (useFec ? 15 : 0);
  
  const shannonRatio = fe / effectiveCapacity;
  
  // Calcul du BER mathématique influencé par les nouveaux paramètres
  let BER = 0; 
  if (shannonRatio > 0.8) BER = (shannonRatio - 0.8) * 0.5; 
  // Impact du jitter sur le BER (désynchronisation)
  BER += (jitterVal / 100) * 0.3;
  // Impact du seuil de décision décalé
  BER += Math.abs(threshVal) * 0.4;
  
  if (BER > 0.5) BER = 0.5; // Plafond (pur hasard)

  ui.vDist.textContent = (ui.media.value === 'sat' ? dist * 700 + 35000 : dist) + " km";
  ui.vNoise.textContent = `Atténuation : ${attenuation.toFixed(1)} dB`;
  ui.vFe.textContent = `${fe.toFixed(0)} kb/s`;
  ui.vRb.textContent = `${fe} kbps`;
  ui.vC.textContent = `${effectiveCapacity.toFixed(1)} kbps`;
  
  const fillPct = Math.min(100, (fe / effectiveCapacity) * 100);
  ui.shFill.style.width = fillPct + '%';
  ui.shFill.className = `shannon-fill ${fillPct > 90 ? 'danger' : ''}`;

  const margin = effectiveCapacity - fe;
  let linkState = 'Stable';
  let linkStateNote = 'La chaîne dispose d’une marge correcte pour la décision et la régénération.';

  if (BER > 0.2 || shannonRatio > 1.05) {
    linkState = 'Rupture';
    linkStateNote = 'Le débit demandé dépasse la robustesse du canal : erreurs et fermeture de l’œil dominent.';
  } else if (BER > 0.05 || jitterVal > 18 || Math.abs(threshVal) > 0.45) {
    linkState = 'Tendue';
    linkStateNote = 'Le lien reste démodulable mais la marge temporelle ou décisionnelle devient faible.';
  } else if (jitterVal > 8 || shannonRatio > 0.8) {
    linkState = 'Surveillée';
    linkStateNote = 'Le système fonctionne encore correctement, avec une réserve de performance réduite.';
  }

  ui.kpiSnr.textContent = `${SNR_dB.toFixed(1)} dB`;
  ui.kpiMargin.textContent = `${margin >= 0 ? '+' : ''}${margin.toFixed(1)} kbps`;
  ui.kpiState.textContent = linkState;
  ui.kpiStateNote.textContent = linkStateNote;

  if (state.playingAudio && audioCtx && !state.isPaused) {
    if (BER > 0.4) {
      gainMaster.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    } else {
      gainMaster.gain.setTargetAtTime(0.3 * txGain, audioCtx.currentTime, 0.1);
      let noiseLevel = Math.max(0, (shannonRatio - 0.3)) * 0.2 + (jitterVal/100)*0.1;
      if (useFec) noiseLevel *= 0.1;
      gainNoise.gain.setTargetAtTime(noiseLevel, audioCtx.currentTime, 0.1);
    }
  }

  // --- RENDU ---
  const bitW = w / fe;
  let txBitStr = "", rxBitStr = "";
  let pSrc = `M 0 50`, pDig = `M 0 50`, pMod = `M 0 50`, pCh = `M 0 80`, pDemod = "", pOut = `M 0 50`;
  const sourceSeries = [];
  const modSeries = [];
  const channelSeries = [];
  const demodSeries = [];
  const outSeries = [];
  
  if (!state.isPaused) {
    ctxEye.fillStyle = 'rgba(0, 0, 17, 0.15)';
    ctxEye.fillRect(0, 0, w, hEye);
  }
  drawEyeAxes(ctxEye, w, hEye);
  
  // Tracé du seuil de décision sur l'œil
  ctxEye.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctxEye.lineWidth = 1;
  ctxEye.beginPath();
  const eyeThreshY = (hEye/2) - (threshVal * 40);
  ctxEye.moveTo(0, eyeThreshY); ctxEye.lineTo(w, eyeThreshY);
  ctxEye.stroke();

  ctxEye.lineWidth = 1.5;
  
  let prevDemodY = null;
  const bitArray = [];

  for(let i=0; i<fe; i++) {
    const tBit = ((i + 0.5) * bitW / w) * 4 + tGlobal;
    const bitVal = getAnalogVal(tBit) > 0 ? 1 : 0;
    txBitStr += bitVal;
    
    let rxBitVal = bitVal;
    let isError = false, isFecFixed = false;
    
    if (BER > 0 && Math.random() < BER) {
      if (useFec && shannonRatio <= 1.0 && jitterVal < 20 && Math.abs(threshVal) < 0.5) {
         isFecFixed = true; // FEC répare si les conditions ne sont pas cataclysmiques
      } else {
         rxBitVal = rxBitVal ? 0 : 1;
         isError = true;
      }
    }
    bitArray.push({ tx: bitVal, rx: rxBitVal, err: isError, fec: isFecFixed });

    if (!state.isPaused) {
        stats.totalBits++;
        if (isError) stats.errorBits++;
    }

    if (isError) rxBitStr += `<span class="err">${rxBitVal}</span>`;
    else if (isFecFixed) rxBitStr += `<span class="fec">${rxBitVal}</span>`;
    else rxBitStr += rxBitVal;

    const x1 = i * bitW, x2 = (i + 1) * bitW;
    
    const drawLineCode = (start, end, val) => {
        if (useManchester) {
            const mid = start + (end - start)/2;
            const y1 = val ? 20 : 80, y2 = val ? 80 : 20;
            pDig += ` ${start===0?'M':'L'} ${start} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${end} ${y2}`;
        } else {
            const y = val ? 20 : 80;
            pDig += ` ${start===0?'M':'L'} ${start} ${y} L ${end} ${y}`;
        }
    };
    drawLineCode(x1, x2, bitVal);

    const drawRxCode = (start, end, val, color) => {
      const y = val ? 20 : 80;
      if (prevDemodY !== null && prevDemodY !== y) pDemod += `<line x1="${start}" y1="${prevDemodY}" x2="${start}" y2="${y}" stroke="${color}" stroke-width="2"/>`;
      pDemod += `<line x1="${start}" y1="${y}" x2="${end}" y2="${y}" stroke="${color}" stroke-width="2"/>`;
      prevDemodY = y;
    };
    drawRxCode(x1, x2, rxBitVal, isError ? 'var(--err)' : (isFecFixed ? '#a855f7' : 'var(--rx)'));
  }

  if (stats.totalBits > 0) {
      ui.vBER.textContent = ((stats.errorBits / stats.totalBits) * 100).toFixed(2);
  }

  // Dessin haute résolution
  for(let x=0; x<=w; x+=2) {
    const t = (x / w) * 4 + tGlobal;
    const bitIdx = Math.min(fe - 1, Math.floor(x / bitW));
    const bitVal = bitArray[bitIdx].tx;
    
    const valAna = getAnalogVal(t) * txGain;
    pSrc += ` L ${x} ${50 - valAna * 30}`;
    sourceSeries.push({ tb: (x / w) * fe, value: valAna });

    let phase = bitVal ? 0 : Math.PI;
    const valMod = Math.sin(t * fPorteuse + phase) * txGain;
    pMod += ` L ${x} ${50 - valMod * 30}`;
    modSeries.push({ tb: (x / w) * fe, value: valMod });

    const noiseLevel = Math.max(0, 100 - SNR_dB) * 0.015; 
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * noiseLevel;
    const attScale = Math.max(0.1, 1 - (attenuation / 100)); 
    
    const valCh = (valMod * attScale) + noise;
    pCh += ` L ${x} ${80 - valCh * 50}`;
    channelSeries.push({ tb: (x / w) * fe, value: valCh });

    // Application du Jitter sur l'oscilloscope de l'oeil
    const eyeWidth = bitW * 2;
    // Décalage horizontal aléatoire basé sur le curseur jitter
    const jOffset = (Math.random() - 0.5) * (jitterVal / 100) * bitW;
    const localX = (x + jOffset + w) % eyeWidth; 
    
    const eyeY = (hEye/2) - (useManchester ? (Math.sin(t*fPorteuse)*attScale > 0 ? 1 : -1) : (bitVal ? 1 : -1)) * 40 * attScale + (noise * 40);
    
    if (!state.isPaused) {
        if (localX <= 2) {
            ctxEye.beginPath(); ctxEye.moveTo(localX, eyeY);
        } else {
            ctxEye.lineTo(localX, eyeY);
            ctxEye.strokeStyle = BER < 0.1 ? 'rgba(16, 185, 129, 0.4)' : (BER < 0.3 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)');
            ctxEye.stroke(); ctxEye.beginPath(); ctxEye.moveTo(localX, eyeY);
        }
    }

    let yOut = 50;
    if (useFilter) {
      let outVal = getAnalogVal(t) * txGain;
      if (bitArray[bitIdx].err) outVal = -outVal + (Math.random()-0.5)*0.5; 
      yOut = 50 - outVal * 30;
      outSeries.push({ tb: (x / w) * fe, value: outVal });
    } else {
      const bRx = bitArray[bitIdx].rx;
      yOut = 50 - (bRx ? 1 : -1) * 20;
      outSeries.push({ tb: (x / w) * fe, value: bRx ? 1 : -1 });
    }
    pOut += ` L ${x} ${yOut}`;
  }

  bitArray.forEach(function (bit, index) {
    demodSeries.push({ tb: index + 0.5, value: bit.rx ? 1 : -1 });
  });

  transmissionPlotData.source = sourceSeries;
  transmissionPlotData.mod = modSeries;
  transmissionPlotData.channel = channelSeries;
  transmissionPlotData.demod = demodSeries;
  transmissionPlotData.out = outSeries;

  ui.txBits.textContent = txBitStr;
  ui.rxBits.innerHTML = rxBitStr;

  const baseAxes = buildSvgAxes(w, h, { top: 20, bottom: 80, xMax: fe, note: fe + ' bits observés' });
  const channelAxes = buildSvgAxes(w, hEye, { top: 30, bottom: 130, xMax: fe, note: 'SNR ' + SNR_dB.toFixed(1) + ' dB', dark: true });

  ui.svgSource.innerHTML = `${baseAxes}<path d="${pSrc}" stroke="#60a5fa" stroke-width="2" fill="none" />
    <path d="${pDig}" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2 2" fill="none"/>`;
  ui.svgMod.innerHTML = `${baseAxes}<path d="${pMod}" stroke="#818cf8" stroke-width="1.5" fill="none" />`;
  ui.svgChannel.innerHTML = `${channelAxes}<path d="${pCh}" stroke="${SNR_dB > 15 ? '#cbd5e1' : '#ef4444'}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
  
  // Tracé ligne de seuil sur le démodulateur
  const demodThreshY = 50 - (threshVal * 30);
  ui.svgDemod.innerHTML = `${baseAxes}${pDemod}<line x1="0" y1="${demodThreshY}" x2="${w}" y2="${demodThreshY}" stroke="rgba(239,68,68,0.5)" stroke-dasharray="4 4"/>`;
  
  ui.svgOut.innerHTML = `${baseAxes}<path d="${pOut}" stroke="${BER > 0.1 ? 'var(--err)' : 'var(--rx)'}" stroke-width="2.5" fill="none" />`;
  attachTransmissionHover(ui.svgSource, 'source', 'Source analogique');
  attachTransmissionHover(ui.svgMod, 'mod', 'Porteuse modulée');
  attachTransmissionHover(ui.svgChannel, 'channel', 'Signal reçu');
  attachTransmissionHover(ui.svgDemod, 'demod', 'Décision logique');
  attachTransmissionHover(ui.svgOut, 'out', 'Signal restitué');

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
