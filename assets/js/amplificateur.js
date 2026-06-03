LabCommon.initHeader({ bodySection: 'analogique-amplificateur', pageId: 'analogique-amplificateur' });
// Récupération des éléments
const svgIn = document.getElementById('svgIn');
const svgOut = document.getElementById('svgOut');

const inInput = document.getElementById('inInput');
const gainInput = document.getElementById('gainInput');
const clipInput = document.getElementById('clipInput');

const inVal = document.getElementById('inVal');
const gainVal = document.getElementById('gainVal');
const clipVal = document.getElementById('clipVal');
const displayGain = document.getElementById('displayGain');

const meterIn = document.getElementById('meterIn');
const meterOut = document.getElementById('meterOut');
const textPowerIn = document.getElementById('textPowerIn');
const textPowerOut = document.getElementById('textPowerOut');
const ampGainDb = document.getElementById('ampGainDb');
const ampPeakOut = document.getElementById('ampPeakOut');
const ampSatRate = document.getElementById('ampSatRate');
const ampModeNote = document.getElementById('ampModeNote');
const ampPresetButtons = document.querySelectorAll('[data-amp-preset]');

const w = 400, h = 160;
const yCenter = h / 2;
let timeOffset = 0;
const freq = 3; // Fréquence visuelle fixe

const ampPresets = {
  linear: { input: 18, gain: 2.5, clip: 120 },
  edge: { input: 28, gain: 3.5, clip: 95 },
  clip: { input: 42, gain: 6, clip: 85 }
};

ampPresetButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const preset = ampPresets[button.dataset.ampPreset];
    if (!preset) {
      return;
    }

    inInput.value = preset.input;
    gainInput.value = preset.gain;
    clipInput.value = preset.clip;
  });
});

function draw() {
  const ampIn = +inInput.value;
  const gain = +gainInput.value;
  const clipLimit = +clipInput.value;
  
  // Mise à jour de l'UI textuelle
  inVal.textContent = Math.round(ampIn);
  gainVal.textContent = gain.toFixed(1);
  displayGain.textContent = gain.toFixed(1);
  clipVal.textContent = clipLimit;

  timeOffset += 0.005; 

  let pathIn = `M 0 ${yCenter}`;
  let pathOutIdeal = `M 0 ${yCenter}`; // Trace fantôme si on dépasse la saturation
  let pathOutReal = `M 0 ${yCenter}`;

  // Calcul visuel (échelle pour que l'onde tienne dans le SVG)
  // On considère que 150 mV = 70 pixels (quasi le bord du SVG)
  const scale = 70 / 150; 
  
  let currentPowerOutRaw = 0;
  let saturatedSamples = 0;
  let totalSamples = 0;

  for(let x = 0; x <= w; x += 2) {
    totalSamples++;
    const t = (x / w) * 2 + timeOffset;
    const sineVal = Math.sin(2 * Math.PI * freq * t);
    
    // Signal d'entrée
    const vIn = sineVal * ampIn;
    const yIn = yCenter - (vIn * scale);
    pathIn += ` L ${x} ${yIn}`;

    // Signal de sortie idéal (sans limite)
    const vOutIdeal = vIn * gain;
    const yOutIdeal = yCenter - (vOutIdeal * scale);
    pathOutIdeal += ` L ${x} ${yOutIdeal}`;

    // Signal de sortie réel (avec écrêtage / saturation)
    let vOutReal = vOutIdeal;
    if (vOutReal > clipLimit) {
      vOutReal = clipLimit;
      saturatedSamples++;
    }
    if (vOutReal < -clipLimit) {
      vOutReal = -clipLimit;
      saturatedSamples++;
    }
    
    const yOutReal = yCenter - (vOutReal * scale);
    pathOutReal += ` L ${x} ${yOutReal}`;

    // On récupère la valeur absolue max pour calculer la puissance
    if (Math.abs(vOutReal) > currentPowerOutRaw) {
        currentPowerOutRaw = Math.abs(vOutReal);
    }
  }

  // Rendu SVG Entrée
  svgIn.innerHTML = `<path d="${pathIn}" stroke="var(--wave-in)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  
  // Rendu SVG Sortie (Incluant les lignes de limites Vcc)
  const clipYTop = yCenter - (clipLimit * scale);
  const clipYBot = yCenter + (clipLimit * scale);
  
  let outHTML = `
    <!-- Lignes de saturation (Alimentation) -->
    <line x1="0" y1="${clipYTop}" x2="${w}" y2="${clipYTop}" stroke="var(--clip-line)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
    <line x1="0" y1="${clipYBot}" x2="${w}" y2="${clipYBot}" stroke="var(--clip-line)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
    <text x="5" y="${clipYTop - 5}" fill="var(--clip-line)" font-size="10" font-weight="bold">+Vcc</text>
    <text x="5" y="${clipYBot + 12}" fill="var(--clip-line)" font-size="10" font-weight="bold">-Vcc</text>
  `;

  // Si on sature, on affiche le signal idéal en arrière-plan (pointillés clairs)
  if (ampIn * gain > clipLimit) {
    outHTML += `<path d="${pathOutIdeal}" stroke="var(--wave-out)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" opacity="0.3"/>`;
  }

  // Onde de sortie réelle
  outHTML += `<path d="${pathOutReal}" stroke="var(--wave-out)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  
  svgOut.innerHTML = outHTML;

  // Calcul et mise à jour des Vu-mètres de puissance
  // P = V^2 / R (On simplifie en disant P est proportionnel à V^2)
  const maxPowerTheoretical = Math.pow(150, 2); // basé sur le max possible (150mV)
  
  const powerIn = Math.pow(ampIn, 2);
  const powerOut = Math.pow(currentPowerOutRaw, 2);

  const percentIn = Math.min(100, (powerIn / maxPowerTheoretical) * 100);
  const percentOut = Math.min(100, (powerOut / maxPowerTheoretical) * 100);

  meterIn.style.width = `${percentIn}%`;
  meterOut.style.width = `${percentOut}%`;

  // Changement de couleur si ça sature
  if (currentPowerOutRaw >= clipLimit && clipLimit < (ampIn * gain)) {
      meterOut.style.backgroundColor = "var(--clip-line)"; // Devient rouge
  } else {
      meterOut.style.backgroundColor = "var(--wave-out)"; // Reste violet
  }

  // Valeurs fictives arbitraires pour l'affichage (ex: microWatts)
  textPowerIn.textContent = Math.round(powerIn / 100) + 'uW';
  textPowerOut.textContent = Math.round(powerOut / 100) + 'uW';

  const satPct = totalSamples ? (saturatedSamples / totalSamples) * 100 : 0;
  const gainDb = 20 * Math.log10(Math.max(gain, 0.001));
  let mode = 'Linéaire';
  let modeNote = 'Fonctionnement linéaire, sans écrêtage visible.';

  if (satPct > 0 && satPct < 8) {
    mode = 'Limite';
    modeNote = 'Le montage travaille proche de Vcc, avec un risque d’écrêtage sur les crêtes.';
  } else if (satPct >= 8 && satPct < 30) {
    mode = 'Saturé';
    modeNote = 'Le contenu harmonique augmente : l’amplificateur déforme le signal utile.';
  } else if (satPct >= 30) {
    mode = 'Écrêtage';
    modeNote = 'La sortie est fortement limitée : la chaîne n’est plus fidèle au message d’entrée.';
  }

  ampGainDb.textContent = gainDb.toFixed(1) + ' dB';
  ampPeakOut.textContent = currentPowerOutRaw.toFixed(0) + ' mV';
  ampSatRate.textContent = satPct.toFixed(1) + ' %';
  ampModeNote.textContent = mode + ' — ' + modeNote;

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
