LabCommon.initHeader({ bodySection: 'modulations-dashboard', pageId: 'modulations-dashboard' });
LabCommon.initHeader({ bodySection: 'modulations', pageId: 'modulations-dashboard' });

const modOptions = {
  ASK: [2, 4, 8, 16],
  PSK: [2, 4, 8, 16],
  QAM: [4, 16, 64, 256],
  FSK: [2, 4, 8]
};

const els = {
  modType: document.getElementById('modType'),
  modOrder: document.getElementById('modOrder'),
  alpha: document.getElementById('alpha'),
  snr: document.getElementById('snr'),
  vAlpha: document.getElementById('valAlpha'),
  vSNR: document.getElementById('valSNR'),
  statN: document.getElementById('statN'),
  statEff: document.getElementById('statEff'),
  statTEB: document.getElementById('statTEB'),
  fskWarning: document.getElementById('fskWarning'),
  ctxConst: document.getElementById('constCanvas').getContext('2d'),
  ctxBer: document.getElementById('berCanvas').getContext('2d'),
  ctxTime: document.getElementById('timeCanvas').getContext('2d')
};

let idealSymbols = [];
let timeOffset = 0;

function resizeCanvas() {
  const canvases = ['constCanvas', 'berCanvas', 'timeCanvas'];
  canvases.forEach(id => {
    const c = document.getElementById(id);
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(c.clientWidth, 320);
    const height = Math.max(c.clientHeight, 220);
    c.width = width * ratio;
    c.height = height * ratio;
    const ctx = c.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
  });
}
window.addEventListener('resize', () => { resizeCanvas(); draw(); });

function erfc(x) {
  const z = Math.abs(x);
  const t = 1.0 / (1.0 + 0.5 * z);
  const ans = t * Math.exp(-z*z - 1.26551223 + t*(1.00002368 + t*(0.37409196 + t*(0.09678418 + t*(-0.18628806 + t*(0.27886807 + t*(-1.13520398 + t*(1.48851587 + t*(-0.82215223 + t*0.17087277)))))))));
  return x >= 0 ? ans : 2.0 - ans;
}
function Q(x) { return 0.5 * erfc(x / Math.SQRT2); }

function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function updateOrderOptions() {
  const type = els.modType.value;
  const currentVal = els.modOrder.value;
  els.modOrder.innerHTML = '';
  modOptions[type].forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = `${m}-${type} (${Math.log2(m)} bits)`;
    if(m == currentVal) opt.selected = true;
    els.modOrder.appendChild(opt);
  });
  if(!els.modOrder.value) els.modOrder.value = modOptions[type][0];
  
  // Gestion de l'alerte FSK
  els.fskWarning.style.display = type === 'FSK' ? 'block' : 'none';
  
  calculateMetrics();
}

els.modType.addEventListener('change', updateOrderOptions);
['modOrder', 'alpha', 'snr'].forEach(id => {
  els[id].addEventListener('input', calculateMetrics);
});

function calculateMetrics() {
  const type = els.modType.value;
  const M = parseInt(els.modOrder.value);
  const n = Math.log2(M);
  const alpha = parseFloat(els.alpha.value);
  const ebno_dB = parseFloat(els.snr.value);
  const ebno_lin = Math.pow(10, ebno_dB / 10);

  els.vAlpha.textContent = alpha.toFixed(1);
  els.vSNR.textContent = ebno_dB + ' dB';
  els.statN.textContent = n + ' bits';
  els.statEff.textContent = (n / (1 + alpha)).toFixed(2) + ' b/s/Hz';

  let teb = 1.0;
  if (type === 'ASK') {
    teb = ((2*(M-1))/(M*n)) * Q(Math.sqrt((6*n/(M*M-1)) * ebno_lin));
  } else if (type === 'PSK') {
    if(M === 2) teb = Q(Math.sqrt(2*ebno_lin));
    else teb = (2/n) * Q(Math.sqrt(2*n*ebno_lin) * Math.sin(Math.PI/M));
  } else if (type === 'QAM') {
    teb = (4*(1-1/Math.sqrt(M))/n) * Q(Math.sqrt((3*n/(M-1)) * ebno_lin));
  } else if (type === 'FSK') {
    teb = ((M-1)/2) * Q(Math.sqrt(n * ebno_lin));
  }
  
  if(teb > 0.5) teb = 0.5;
  if(teb < 1e-12) els.statTEB.textContent = "< 1e-12";
  else els.statTEB.textContent = teb.toExponential(2);
  
  generateIdealSymbols(type, M);
  draw();
}

function generateIdealSymbols(type, M) {
  idealSymbols = [];
  if (type === 'QAM') {
    const levels = Math.sqrt(M);
    let scale = Math.sqrt(3 / (2 * (M - 1))); 
    for (let i = 0; i < levels; i++) {
      for (let j = 0; j < levels; j++) {
        idealSymbols.push({ I: (2*i - levels + 1) * scale, Q: (2*j - levels + 1) * scale });
      }
    }
  } else if (type === 'PSK') {
    for (let i = 0; i < M; i++) {
      const phase = (2 * Math.PI * i) / M + (M>2 ? Math.PI/M : 0);
      idealSymbols.push({ I: Math.cos(phase), Q: Math.sin(phase) });
    }
  } else if (type === 'ASK') {
    let scale = Math.sqrt(3 / (M*M - 1));
    for (let i = 0; i < M; i++) {
      idealSymbols.push({ I: (2*i - M + 1) * scale, Q: 0 });
    }
  }
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
}

function drawConstellation() {
  const ctx = els.ctxConst;
  const canvas = document.getElementById('constCanvas');
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h);

  const type = els.modType.value;
  // Ne pas dessiner de points pour la FSK (Alerte texte à la place)
  if(type === 'FSK') return; 

  const n = Math.log2(parseInt(els.modOrder.value));
  const ebno_dB = parseFloat(els.snr.value);
  const ebno_lin = Math.pow(10, ebno_dB / 10);
  const esno_lin = n * ebno_lin;
  
  const noiseStdDev = Math.sqrt(1 / (2 * esno_lin));
  const scale = Math.min(w, h) / 3.5;

  ctx.fillStyle = '#ffffff';
  idealSymbols.forEach(sym => {
    ctx.beginPath();
    ctx.arc(w/2 + sym.I * scale, h/2 - sym.Q * scale, 3, 0, 2*Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = ebno_dB > 10 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)';
  const numPoints = 800;
  for (let i = 0; i < numPoints; i++) {
    const sym = idealSymbols[Math.floor(Math.random() * idealSymbols.length)];
    let rxI = sym.I + randn_bm() * noiseStdDev;
    let rxQ = sym.Q + randn_bm() * noiseStdDev;
    ctx.fillRect(w/2 + rxI * scale - 1, h/2 - rxQ * scale - 1, 2, 2);
  }
}

function drawBERChart() {
  const ctx = els.ctxBer;
  const canvas = document.getElementById('berCanvas');
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, h-20); ctx.lineTo(w-10, h-20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, h-20); ctx.stroke();
  
  // CORRECTION : Grille Y (10^0 en haut, 10^-8 en bas)
  ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
  for(let i=0; i<=8; i+=2) {
    const y = 10 + (i/8)*(h-30);
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w-10, y); ctx.stroke();
    ctx.fillText(`1e-${i}`, 5, y+3); 
  }
  
  for(let i=0; i<=30; i+=10) {
    const x = 40 + (i/30)*(w-50);
    ctx.fillText(i, x-5, h-5);
  }

  const type = els.modType.value;
  const M = parseInt(els.modOrder.value);
  const n = Math.log2(M);
  
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  for(let snr_db=0; snr_db<=30; snr_db+=0.5) {
    let ebno_lin = Math.pow(10, snr_db/10);
    let teb = 1.0;
    
    if (type === 'ASK') teb = ((2*(M-1))/(M*n)) * Q(Math.sqrt((6*n/(M*M-1)) * ebno_lin));
    else if (type === 'PSK') {
      if(M===2) teb = Q(Math.sqrt(2*ebno_lin));
      else teb = (2/n) * Q(Math.sqrt(2*n*ebno_lin) * Math.sin(Math.PI/M));
    }
    else if (type === 'QAM') teb = (4*(1-1/Math.sqrt(M))/n) * Q(Math.sqrt((3*n/(M-1)) * ebno_lin));
    else if (type === 'FSK') teb = ((M-1)/2) * Q(Math.sqrt(n * ebno_lin));
    
    if(teb > 0.5) teb = 0.5;
    if(teb < 1e-10) teb = 1e-10; 
    
    const logY = Math.log10(teb);
    const yPx = 10 + ((0 - logY)/8) * (h-30);
    const xPx = 40 + (snr_db/30)*(w-50);
    
    if(snr_db===0) ctx.moveTo(xPx, Math.min(yPx, h-20));
    else ctx.lineTo(xPx, Math.min(yPx, h-20));
  }
  ctx.stroke();

  const current_snr = parseFloat(els.snr.value);
  const current_teb = parseFloat(els.statTEB.textContent) || 1e-10;
  const curLogY = Math.log10(Math.max(current_teb, 1e-8));
  const ptY = 10 + ((0 - curLogY)/8) * (h-30);
  const ptX = 40 + (current_snr/30)*(w-50);
  
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(ptX, Math.min(ptY, h-20), 5, 0, 2*Math.PI); ctx.fill();
}

function drawTimeDomain() {
  const ctx = els.ctxTime;
  const canvas = document.getElementById('timeCanvas');
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();

  const type = els.modType.value;
  const M = parseInt(els.modOrder.value);
  const pxPerSym = 60;
  
  ctx.beginPath();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;

  let fc = 0.05; 
  
  for(let x=0; x<w; x++) {
    const t = (x + timeOffset);
    const symIdx = Math.floor(t / pxPerSym);
    const seed = Math.abs(Math.sin(symIdx * 12.345));
    
    let signal = 0;
    
    if (type === 'FSK') {
      const idx = Math.floor(seed * M);
      const deltaF = (idx - M/2) * 0.01;
      signal = Math.sin(2 * Math.PI * (fc + deltaF) * t);
    } else {
      const sym = idealSymbols[Math.floor(seed * M)] || idealSymbols[0];
      if (type === 'ASK') {
        signal = sym.I * Math.sin(2 * Math.PI * fc * t);
      } 
      else if (type === 'PSK') {
        const phase = Math.atan2(sym.Q, sym.I);
        signal = Math.sin(2 * Math.PI * fc * t + phase);
      } 
      else if (type === 'QAM') {
        signal = sym.I * Math.cos(2 * Math.PI * fc * t) - sym.Q * Math.sin(2 * Math.PI * fc * t);
      } 
    }

    const y = h/2 - signal * (h/3);
    if(x===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.setLineDash([5, 5]);
  for(let x = pxPerSym - (timeOffset % pxPerSym); x < w; x += pxPerSym) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  ctx.setLineDash([]);
}

function draw() {
  drawConstellation();
  drawBERChart();
  drawTimeDomain();
}

function animate() {
  timeOffset += 1;
  drawTimeDomain();
  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  resizeCanvas();
  updateOrderOptions();
  draw();
  animate();
});
