LabCommon.initHeader({ bodySection: 'analogique-recepteur', pageId: 'analogique-recepteur' });
// Récupération des éléments
const svgRaw = document.getElementById('svgRaw');
const svgProcess = document.getElementById('svgProcess');
const svgClean = document.getElementById('svgClean');

const noiseInput = document.getElementById('noiseInput');
const filterInput = document.getElementById('filterInput');

const noiseVal = document.getElementById('noiseVal');
const filterVal = document.getElementById('filterVal');
const rxSnr = document.getElementById('rxSnr');
const rxTau = document.getElementById('rxTau');
const rxQuality = document.getElementById('rxQuality');
const rxQualityNote = document.getElementById('rxQualityNote');
const rxPresetButtons = document.querySelectorAll('[data-rx-preset]');

const w = 800, h = 120;
const yCenter = h / 2;
let timeOffset = 0;

const rxPresets = {
  clean: { noise: 4, filter: 12 },
  noisy: { noise: 28, filter: 12 },
  slow: { noise: 12, filter: 34 }
};

rxPresetButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const preset = rxPresets[button.dataset.rxPreset];
    if (!preset) {
      return;
    }

    noiseInput.value = preset.noise;
    filterInput.value = preset.filter;
  });
});

// Constantes du signal (simulées)
const fInfo = 2; // Fréquence du message
const fPort = 40; // Fréquence de la porteuse (véhicule)
const m = 0.8; // Indice de modulation

// Générateur de bruit (pseudo-aléatoire fluide)
function getNoise(t, amount) {
  return (Math.sin(t * 1234) * Math.cos(t * 4321) + Math.sin(t * 888)) * 0.33 * amount;
}

function draw() {
  const noiseLevel = +noiseInput.value / 100;
  const filterTau = +filterInput.value; // Constante de décharge du condensateur
  
  // Mise à jour de l'UI
  noiseVal.textContent = Math.round(noiseLevel * 100);
  if (filterTau < 5) filterVal.textContent = 'Trop faible (grésillements)';
  else if (filterTau > 25) filterVal.textContent = 'Trop fort (étouffé)';
  else filterVal.textContent = "Optimal (Net)";

  const snrDb = Math.max(4, 32 - noiseLevel * 55);
  const tuningError = Math.abs(filterTau - 12);
  const qualityScore = Math.max(0, Math.min(100, 100 - noiseLevel * 150 - tuningError * 2.4));
  let qualityLabel = 'Excellente';
  let qualityNote = 'Le détecteur d’enveloppe suit correctement le message utile.';

  if (filterTau < 5) {
    qualityLabel = 'Instable';
    qualityNote = 'Le filtre se décharge trop vite : le bruit traverse la démodulation.';
  } else if (filterTau > 25) {
    qualityLabel = 'Lente';
    qualityNote = 'Le filtre mémorise trop longtemps les crêtes et étouffe les variations du message.';
  } else if (qualityScore < 45) {
    qualityLabel = 'Dégradée';
    qualityNote = 'Le bruit capté domine partiellement le signal et réduit l’intelligibilité.';
  } else if (qualityScore < 75) {
    qualityLabel = 'Bonne';
    qualityNote = 'La restitution reste exploitable mais la marge de bruit devient visible.';
  }

  rxSnr.textContent = snrDb.toFixed(1) + ' dB';
  rxTau.textContent = filterTau;
  rxQuality.textContent = qualityLabel;
  rxQualityNote.textContent = qualityNote;

  timeOffset += 0.003; 

  let pathRaw = `M 0 ${yCenter}`;
  let pathRect = `M 0 ${yCenter}`; // Signal redressé (positif uniquement)
  let pathEnv = `M 0 ${yCenter}`; // Enveloppe détectée (filtre)
  let pathClean = `M 0 ${yCenter}`; // Signal final restitué

  let lastEnvY = yCenter; // Mémoire du condensateur
  let dcOffsetSum = 0; // Pour centrer le signal final
  let pointsCount = 0;

  // 1ère passe : Calcul du signal complet
  for(let x = 0; x <= w; x += 2) {
    const t = (x / w) * 2 + timeOffset;

    // A. Onde émise d'origine (AM)
    const valInfo = Math.sin(2 * Math.PI * fInfo * t);
    const valCarrier = Math.sin(2 * Math.PI * fPort * t);
    const amplitudeMod = (1 + m * valInfo);
    let valRaw = amplitudeMod * valCarrier;

    // Ajout du bruit de l'air
    valRaw += getNoise(t, noiseLevel * 5); 

    const yRaw = yCenter - valRaw * (h * 0.25);
    pathRaw += ` L ${x} ${yRaw}`;

    // B. Étape 1 du récepteur : Redressement (Diode)
    // On ne garde que la partie positive (valeur absolue grossière)
    let yRect = yCenter - Math.max(0, valRaw) * (h * 0.25);
    pathRect += ` L ${x} ${yRect}`;

    // C. Étape 2 du récepteur : Filtrage (Condensateur)
    // Le condensateur se charge instantanément sur la crête, et se décharge lentement
    let dischargeRate = (filterTau / 1000) * h;
    
    // Si la crête est plus haute que la charge actuelle du condensateur -> charge rapide
    if (yRect < lastEnvY) {
      lastEnvY = yRect;
    } else {
      // Sinon -> décharge lente
      lastEnvY += dischargeRate; 
      // On s'assure qu'il ne descend pas sous la ligne médiane
      if (lastEnvY > yCenter) lastEnvY = yCenter; 
    }
    
    pathEnv += ` L ${x} ${lastEnvY}`;
    
    dcOffsetSum += lastEnvY;
    pointsCount++;
  }

  // Calcul de la composante continue (DC Offset) pour recentrer le son
  const dcOffset = dcOffsetSum / pointsCount;

  // 2ème passe : Dessin du signal restitué (Débarrassé du courant continu)
  lastEnvY = yCenter;
  for(let x = 0; x <= w; x += 2) {
    const t = (x / w) * 2 + timeOffset;
    
    const valInfo = Math.sin(2 * Math.PI * fInfo * t);
    const valCarrier = Math.sin(2 * Math.PI * fPort * t);
    const amplitudeMod = (1 + m * valInfo);
    let valRaw = amplitudeMod * valCarrier + getNoise(t, noiseLevel * 5);
    let yRect = yCenter - Math.max(0, valRaw) * (h * 0.25);
    let dischargeRate = (filterTau / 1000) * h;
    
    if (yRect < lastEnvY) lastEnvY = yRect;
    else { lastEnvY += dischargeRate; if(lastEnvY > yCenter) lastEnvY = yCenter; }

    // Le signal restitué est l'enveloppe recentrée et amplifiée
    // On amplifie légèrement pour retrouver la taille d'origine du panneau 1
    let yClean = yCenter + (lastEnvY - dcOffset) * 2.5; 
    
    // Limiteur matériel (écrêtage si ça dépasse)
    if (yClean < 10) yClean = 10;
    if (yClean > h - 10) yClean = h - 10;

    pathClean += ` L ${x} ${yClean}`;
  }

  // Rendu SVG
  svgRaw.innerHTML = `<path d="${pathRaw}" stroke="var(--wave-raw)" stroke-width="1.5" fill="none" opacity="0.8"/>`;
  
  // Dans le panneau de traitement, on montre le signal redressé ET le lissage au dessus
  svgProcess.innerHTML = `
    <path d="${pathRect}" stroke="var(--wave-raw)" stroke-width="1" fill="none" opacity="0.3"/>
    <path d="${pathEnv}" stroke="var(--wave-rect)" stroke-width="3" fill="none" stroke-linejoin="round"/>
  `;
  
  // Panneau final
  svgClean.innerHTML = `<path d="${pathClean}" stroke="var(--wave-clean)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
