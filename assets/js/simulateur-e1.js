LabCommon.initHeader({ bodySection: 'multiplexage-e1', pageId: 'multiplexage-e1' });
  const grid = document.getElementById('grid');
  const inspTitle = document.getElementById('insp-title');
  const inspBadge = document.getElementById('insp-badge');
  const inspDesc = document.getElementById('insp-desc');
  const inspBin = document.getElementById('insp-bin');
  const e1FocusValue = document.getElementById('e1FocusValue');
  const e1FocusNote = document.getElementById('e1FocusNote');
  const e1FocusButtons = document.querySelectorAll('[data-e1-focus]');
  
  let cells = [];
  let isScanning = false;
  let scanIndex = 0;
  let scanInterval;

  const e1FocusTargets = {
    fas: { trame: 0, it: 0, speed: 8 },
    cas: { trame: 5, it: 16, speed: 18 },
    voice: { trame: 3, it: 10, speed: 28 }
  };

  function findCell(trame, it) {
    return cells.find(function (cell) {
      return parseInt(cell.dataset.trame, 10) === trame && parseInt(cell.dataset.it, 10) === it;
    });
  }

  function inspectCell(cell) {
    if (!cell) {
      return;
    }

    updateInspector(cell, true);
    cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  e1FocusButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const target = e1FocusTargets[button.dataset.e1Focus];
      if (!target) {
        return;
      }

      speedRange.value = target.speed;
      stopScanner();
      inspectCell(findCell(target.trame, target.it));
    });
  });

  // 1. Initialisation de la Grille (16 Trames x 32 IT)
  function initGrid() {
    // Ligne d'en-tête (Colonnes IT)
    grid.appendChild(document.createElement('div')); // Coin vide
    for (let c = 0; c < 32; c++) {
      const colHead = document.createElement('div');
      colHead.className = 'col-header';
      colHead.textContent = c;
      grid.appendChild(colHead);
    }

    // Génération des 16 Trames
    for (let r = 0; r < 16; r++) {
      // En-tête de ligne
      const rowHead = document.createElement('div');
      rowHead.className = 'row-header';
      rowHead.textContent = `T${r}`;
      grid.appendChild(rowHead);

      for (let c = 0; c < 32; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // Détermination du type de l'IT
        let type = 'voice';
        if (c === 0) {
          type = (r % 2 === 0) ? 'fas' : 'nfas';
        } else if (c === 16) {
          type = (r === 0) ? 'vmt' : 'cas';
        }

        cell.classList.add(`c-${type}`);
        cell.dataset.trame = r;
        cell.dataset.it = c;
        cell.dataset.type = type;

        // Interaction Hover
        cell.addEventListener('mouseenter', () => updateInspector(cell));

        grid.appendChild(cell);
        cells.push(cell); // Stockage pour l'animation
      }
    }
  }

  // 2. Moteur d'Inspection (Mise à jour du panneau latéral)
  function updateInspector(cell, forceUpdate) {
    if(isScanning && !forceUpdate) return; // Ne pas perturber l'affichage si l'animation tourne

    const trame = parseInt(cell.dataset.trame);
    const it = parseInt(cell.dataset.it);
    const type = cell.dataset.type;

    inspTitle.textContent = `Trame ${trame} - IT ${it}`;
    inspBin.style.display = 'block';

    switch (type) {
      case 'fas':
        inspBadge.textContent = "FAS (Frame Alignment Signal)";
        inspBadge.style.background = "var(--fas)";
        inspDesc.innerHTML = `<strong>Mot de verrouillage de trame.</strong><br>Cet octet est émis sur les trames paires. Il permet au récepteur de repérer le début exact d'une trame de 125 µs au milieu du flux continu de bits.`;
        inspBin.textContent = "x 0 0 1 1 0 1 1"; // x = bit international
        e1FocusValue.textContent = 'IT0 / FAS';
        e1FocusNote.textContent = 'Octet de cadrage fondamental pour retrouver la frontière exacte de trame.';
        break;
      case 'nfas':
        inspBadge.textContent = "NFAS (Non-FAS & Alarmes)";
        inspBadge.style.background = "var(--nfas)";
        inspDesc.innerHTML = `<strong>Mot de supervision.</strong><br>Émis sur les trames impaires. Le bit n°2 est toujours à '1' (pour éviter d'être confondu avec le FAS). Il contient aussi le bit 'A' pour signaler une alarme distante.`;
        inspBin.textContent = "x 1 A S S S S S";
        e1FocusValue.textContent = 'IT0 / NFAS';
        e1FocusNote.textContent = 'La trame impaire transporte alarmes et supervision au lieu du motif FAS.';
        break;
      case 'vmt':
        inspBadge.textContent = "VMT (Verrouillage Multitrame)";
        inspBadge.style.background = "var(--vmt)";
        inspDesc.innerHTML = `<strong>Super-synchronisation.</strong><br>Uniquement dans l'IT16 de la trame 0. Permet au récepteur de savoir que le cycle des 16 trames (multitrame) commence, indispensable pour décoder correctement la signalisation des voies.`;
        inspBin.textContent = "0 0 0 0 x y x x"; // y = alarme multitrame
        e1FocusValue.textContent = 'IT16 / VMT';
        e1FocusNote.textContent = 'Point d’entrée du cycle CAS complet sur 16 trames successives.';
        break;
      case 'cas':
        inspBadge.textContent = "CAS (Signalisation hors bande)";
        inspBadge.style.background = "var(--cas)";
        // Calcul des voies associées (IT16 de la trame K signale la voie K et K+15)
        const voie1 = trame; 
        const voie2 = trame + 15;
        inspDesc.innerHTML = `<strong>Signalisation voie par voie.</strong><br>Cet octet ne contient pas de voix, mais l'état des téléphones (raccroché, sonnerie...).<br>Il gère 2 voies simultanément :<br>- 4 bits (a,b,c,d) pour la <b>Voie ${voie1} (IT${voie1})</b><br>- 4 bits (a,b,c,d) pour la <b>Voie ${voie2} (IT${voie2 + 1})</b>.`;
        inspBin.textContent = "a b c d  a b c d";
        e1FocusValue.textContent = 'IT16 / CAS';
        e1FocusNote.textContent = 'La signalisation CAS associe deux voies téléphoniques par octet IT16.';
        break;
      case 'voice':
        inspBadge.textContent = "Voie Utile (Payload)";
        inspBadge.style.background = "var(--muted)";
        // Calcul du numéro de la voie téléphonique (IT1->Voie1, IT17->Voie16...)
        const numVoie = it < 16 ? it : it - 1; 
        inspDesc.innerHTML = `<strong>Échantillon de données.</strong><br>Contient 8 bits de voix numérisée (loi A) ou de données informatiques pour la <b>Voie téléphonique n°${numVoie}</b>.<br>Étant émis 8000 fois par seconde, son débit est de 8000 x 8 = 64 kbit/s.`;
        
        // Générer un octet aléatoire visuel
        let randBin = "";
        for(let i=0; i<8; i++) randBin += Math.random() > 0.5 ? "1 " : "0 ";
        inspBin.textContent = randBin.trim();
        e1FocusValue.textContent = 'Voie ' + numVoie;
        e1FocusNote.textContent = 'Canal utile à 64 kbit/s, typique de la voix PCM ou d’un service de données.';
        break;
    }
  }

  // 3. Animation du "Scanner" de transmission
  const btnPlay = document.getElementById('btnPlay');
  const speedRange = document.getElementById('speedRange');

  btnPlay.addEventListener('click', () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  });

  function startScanner() {
    isScanning = true;
    btnPlay.textContent = '⏸ Arrêter la transmission';
    btnPlay.classList.add('active');
    scanIndex = 0;
    runScannerLoop();
  }

  function stopScanner() {
    isScanning = false;
    btnPlay.textContent = '▶ Lancer la transmission';
    btnPlay.classList.remove('active');
    clearTimeout(scanInterval);
    cells.forEach(c => c.classList.remove('scanning'));
  }

  function runScannerLoop() {
    if(!isScanning) return;

    // Nettoyer la case précédente
    if (scanIndex > 0) {
      cells[scanIndex - 1].classList.remove('scanning');
    } else if (scanIndex === 0 && cells.length > 0) {
      cells[cells.length - 1].classList.remove('scanning'); // Boucle
    }

    // Activer la nouvelle case
    const currentCell = cells[scanIndex];
    currentCell.classList.add('scanning');
    
    // Mettre à jour l'inspecteur pour suivre l'animation
    updateInspector(currentCell);

    // Incrémenter
    scanIndex++;
    if (scanIndex >= cells.length) {
      scanIndex = 0; // Reboucler la multitrame
    }

    // Calcul de la vitesse (inversé : + slider haut = + délai bas = + rapide)
    const delay = 500 - (speedRange.value * 9); 
    scanInterval = setTimeout(runScannerLoop, delay);
  }

  // Lancement initial
  initGrid();
  updateInspector(cells[0]); // Afficher les infos de la première case par défaut
