LabCommon.initHeader({ bodySection: 'analogique-emetteur', pageId: 'analogique-emetteur' });
// Récupération des éléments
const svgInfo = document.getElementById('svgInfo');
const svgCarrier = document.getElementById('svgCarrier');
const svgMod = document.getElementById('svgMod');

const fInfoInput = document.getElementById('fInfo');
const fPortInput = document.getElementById('fPort');
const modRadios = document.getElementsByName('modType');

const fInfoVal = document.getElementById('fInfoVal');
const fPortVal = document.getElementById('fPortVal');
const txModeValue = document.getElementById('txModeValue');
const txModeNote = document.getElementById('txModeNote');
const txIndexValue = document.getElementById('txIndexValue');
const txIndexNote = document.getElementById('txIndexNote');
const txBandwidthValue = document.getElementById('txBandwidthValue');
const txBandwidthNote = document.getElementById('txBandwidthNote');
const txPresetButtons = document.querySelectorAll('[data-tx-preset]');

// Variables de configuration
const w = 800, h = 120;
const yCenter = h / 2;
let timeOffset = 0; // Pour faire défiler les ondes (animation continue)
const AM_INDEX = 0.8;
const FM_BETA = 3.0;

const txPresets = {
  'am-base': { type: 'AM', info: 2, port: 30 },
  'am-fast': { type: 'AM', info: 4.5, port: 35 },
  'fm-wide': { type: 'FM', info: 3, port: 26 }
};

function setModulationType(type) {
  Array.from(modRadios).forEach(function (radio) {
    radio.checked = radio.value === type;
  });
}

txPresetButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const preset = txPresets[button.dataset.txPreset];
    if (!preset) {
      return;
    }

    setModulationType(preset.type);
    fInfoInput.value = preset.info;
    fPortInput.value = preset.port;
  });
});

function draw() {
  const fInfo = +fInfoInput.value;
  const fPort = +fPortInput.value;
  
  // Mise à jour de l'affichage des valeurs
  fInfoVal.textContent = fInfo.toFixed(1);
  fPortVal.textContent = fPort;

  // Quel type de modulation est sélectionné ?
  let isAM = true;
  for (const radio of modRadios) {
    if (radio.checked) { isAM = (radio.value === 'AM'); break; }
  }

  // Avancement du temps pour faire défiler l'onde (scroll vers la gauche)
  timeOffset += 0.003; 

  let pathInfo = `M 0 ${yCenter}`;
  let pathCarrier = `M 0 ${yCenter}`;
  let pathMod = `M 0 ${yCenter}`;
  let envTop = `M 0 ${yCenter}`; // Enveloppe AM (haut)
  let envBot = `M 0 ${yCenter}`; // Enveloppe AM (bas)

  // Boucle de calcul pour chaque pixel X
  for(let x = 0; x <= w; x += 2) {
    // Le temps virtuel (on simule une fenêtre de 2 secondes)
    const t = (x / w) * 2 + timeOffset;

    // 1. Calcul du Signal d'Information (sinusoïde simple)
    const valInfo = Math.sin(2 * Math.PI * fInfo * t);
    const yInfo = yCenter - valInfo * (h * 0.4);
    pathInfo += ` L ${x} ${yInfo}`;

    // 2. Calcul de l'Onde Porteuse (sinusoïde rapide)
    const valCarrier = Math.sin(2 * Math.PI * fPort * t);
    const yCarrier = yCenter - valCarrier * (h * 0.4);
    pathCarrier += ` L ${x} ${yCarrier}`;

    // 3. Calcul du Signal Modulé
    let yMod;
    if (isAM) {
      // Modulation d'Amplitude : S(t) = (1 + m * Info) * Porteuse
      const m = AM_INDEX; // Indice de modulation (80%)
      const amplitudeMod = (1 + m * valInfo);
      yMod = yCenter - (amplitudeMod * valCarrier * (h * 0.25));
      
      // Dessin de l'enveloppe pointillée pour l'AM (aide pédagogique)
      envTop += ` L ${x} ${yCenter - (amplitudeMod * (h * 0.25))}`;
      envBot += ` L ${x} ${yCenter + (amplitudeMod * (h * 0.25))}`;
    } else {
      // Modulation de Fréquence : S(t) = sin(2*pi*fC*t + beta * sin(2*pi*fI*t))
      const beta = FM_BETA; // Indice de modulation FM
      const phaseFM = 2 * Math.PI * fPort * t + beta * Math.sin(2 * Math.PI * fInfo * t);
      yMod = yCenter - Math.sin(phaseFM) * (h * 0.4);
    }
    pathMod += ` L ${x} ${yMod}`;
  }

  // Rendu SVG
  svgInfo.innerHTML = `<path d="${pathInfo}" stroke="var(--wave-info)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  
  svgCarrier.innerHTML = `<path d="${pathCarrier}" stroke="var(--wave-carrier)" stroke-width="2" fill="none" opacity="0.6"/>`;
  
  let modHTML = `<path d="${pathMod}" stroke="var(--wave-mod)" stroke-width="2" fill="none"/>`;
  // Ajouter les enveloppes pointillées si on est en AM
  if (isAM) {
    modHTML += `<path d="${envTop}" stroke="var(--wave-info)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" opacity="0.5"/>`;
    modHTML += `<path d="${envBot}" stroke="var(--wave-info)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" opacity="0.5"/>`;
  }
  svgMod.innerHTML = modHTML;

  if (isAM) {
    txModeValue.textContent = 'AM';
    txModeNote.textContent = 'En AM, l’information est portée par l’enveloppe de la porteuse et crée deux bandes latérales.';
    txIndexValue.textContent = 'm = ' + AM_INDEX.toFixed(2);
    txIndexNote.textContent = AM_INDEX > 1 ? 'Surmodulation : l’enveloppe se replie et la démodulation devient ambiguë.' : 'Indice inférieur à 1 : la démodulation d’enveloppe reste fidèle.';
    txBandwidthValue.textContent = (2 * fInfo).toFixed(1) + ' Hz';
    txBandwidthNote.textContent = 'Approximation AM double bande : B ≈ 2 fm, avec porteuse conservée.';
  } else {
    const deltaF = FM_BETA * fInfo;
    const bandwidth = 2 * (deltaF + fInfo);
    txModeValue.textContent = 'FM';
    txModeNote.textContent = 'En FM, l’amplitude reste quasi constante et l’information se lit sur la fréquence instantanée.';
    txIndexValue.textContent = 'Δf = ' + deltaF.toFixed(1) + ' Hz';
    txIndexNote.textContent = 'Déviation fréquentielle pédagogique : β × fm avec β = ' + FM_BETA.toFixed(1) + '.';
    txBandwidthValue.textContent = bandwidth.toFixed(1) + ' Hz';
    txBandwidthNote.textContent = 'Règle de Carson : B ≈ 2(Δf + fm), utile pour estimer la bande occupée.';
  }

  // Boucle d'animation optimisée
  requestAnimationFrame(draw);
}

// Lancement de l'animation
requestAnimationFrame(draw);
