const muxPageMode = LabCommon.getParams().get('mode');
LabCommon.initHeader({ bodySection: 'multiplexage-complet', pageId: muxPageMode === 'pcm' ? 'multiplexage-pcm' : 'multiplexage-complet' });
  // --- DONNÉES DE LA HIÉRARCHIE (E1 vs T1) ---
  const hierarchyData = {
    E1: {
      badge: "Réseau PDH Européen",
      btn: { L2: "Trame E2 (PDH)", L3: "Trame E3 (PDH)", L4: "Trame E4 (PDH)", OPT: "SDH Fibre (STM-1)" },
      L2: {
        inCount: 4, inText: "Flux E1 (2.048 Mbps)", dev: "MUX E2", out: "8.448 Mbps", cap: "120 Appels",
        math: "4 x 2.048 = 8.192 Mbps | Sortie brute = 8.448 Mbps",
        desc: "<strong>Le Plésiochrone Européen :</strong> Les 4 flux E1 ont des horloges indépendantes. Le MUX E2 ajoute des <strong>bits de justification (bourrage)</strong> pour rattraper les décalages d'horloge. D'où le surplus de bande passante (Overhead)."
      },
      L3: {
        inCount: 4, inText: "Flux E2 (8.448 Mbps)", dev: "MUX E3", out: "34.368 Mbps", cap: "480 Appels",
        math: "4 x 8.448 = 33.792 Mbps | Sortie = 34.368 Mbps",
        desc: "On multiplexe 4 flux E2. Le surplus sert à la synchronisation de niveau 3 et aux nouveaux bits de justification."
      },
      L4: {
        inCount: 4, inText: "Flux E3 (34 Mbps)", dev: "MUX E4", out: "139.264 Mbps", cap: "1920 Appels",
        math: "4 x 34.368 = 137.472 Mbps | Sortie = 139.264 Mbps",
        desc: "Dernier niveau standard du PDH européen. Historiquement utilisé pour relier les grandes villes via des faisceaux hertziens ou câbles coaxiaux."
      },
      OPT: {
        inCount: 1, inText: "Conteneur C-4 (E4)", dev: "MUX SDH", out: "155.520 Mbps", cap: "Fibre Optique",
        math: "STM-1 : 9 rangées x 270 colonnes x 8 bits x 8000 Hz",
        desc: "<strong>La Révolution Synchrone (SDH) :</strong> Tout le réseau mondial bat à la même seconde (horloge atomique). Il n'y a plus de bourrage aléatoire. La trame STM-1 utilise des <strong>pointeurs (SOH/POH)</strong>. On peut extraire 1 appel parmi 1920 sans rien démultiplexer !"
      }
    },
    T1: {
      badge: "Réseau T-Carrier Américain",
      btn: { L2: "Trame T2 / DS2", L3: "Trame T3 / DS3", L4: "Trame T4 / DS4", OPT: "SONET Fibre (STS-1)" },
      L2: {
        inCount: 4, inText: "Flux T1 (1.544 Mbps)", dev: "MUX T2", out: "6.312 Mbps", cap: "96 Appels",
        math: "4 x 1.544 = 6.176 Mbps | Sortie brute = 6.312 Mbps",
        desc: "<strong>Le Plésiochrone Américain :</strong> Tout comme en Europe, les horloges sont plésiochrones. Le MUX T2 regroupe 4 trames T1 et ajoute ses propres bits de cadrage et de justification."
      },
      L3: {
        inCount: 7, inText: "T2 (6.3 Mbps)", dev: "MUX T3", out: "44.736 Mbps", cap: "672 Appels",
        math: "7 x 6.312 = 44.184 Mbps | Sortie = 44.736 Mbps",
        desc: "<strong>Attention au multiplicateur !</strong> Aux USA, on regroupe <strong>7 flux T2</strong> pour former un T3 (aussi appelé DS3). C'est un standard massivement utilisé aux États-Unis pour l'accès Internet des grandes entreprises."
      },
      L4: {
        inCount: 6, inText: "T3 (44.7 Mbps)", dev: "MUX T4", out: "274.176 Mbps", cap: "4032 Appels",
        math: "6 x 44.736 = 268.416 Mbps | Sortie = 274.176 Mbps",
        desc: "Dernier niveau PDH aux USA. On regroupe 6 flux T3. Capable de transporter plus de 4000 conversations simultanées."
      },
      OPT: {
        inCount: 1, inText: "Conteneur STS-1 Payload", dev: "SONET", out: "51.840 Mbps", cap: "Fibre Optique",
        math: "STS-1 : 9 rangées x 90 colonnes x 8 bits x 8000 Hz",
        desc: "<strong>La Révolution SONET :</strong> L'équivalent américain de la SDH. La trame de base optique est le STS-1. Tout est parfaitement synchrone, on peut y glisser exactement un flux DS3 entier et le retrouver grâce aux pointeurs."
      }
    }
  };

  let currentMuxLevel = 'L2';

  function updateMuxUI() {
    const d = hierarchyData[currentStd];
    document.getElementById('muxBadge').textContent = d.badge;
    document.getElementById('btnMuxL2').textContent = d.btn.L2;
    document.getElementById('btnMuxL3').textContent = d.btn.L3;
    document.getElementById('btnMuxL4').textContent = d.btn.L4;
    document.getElementById('btnMuxOPT').textContent = d.btn.OPT;
    setMuxLevel(currentMuxLevel); 
  }

  function setMuxLevel(level) {
    currentMuxLevel = level;
    document.querySelectorAll('.mux-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btnMux' + level).classList.add('active');

    const data = hierarchyData[currentStd][level];
    
    const inputsDiv = document.getElementById('muxInputs');
    inputsDiv.innerHTML = '';
    for(let i=0; i<data.inCount; i++) {
      let b = document.createElement('div');
      b.className = 'mux-input-box';
      if(level==='OPT') b.style.background = "#d1fae5";
      b.textContent = data.inText;
      inputsDiv.appendChild(b);
    }

    document.getElementById('muxDevice').textContent = data.dev;
    const outBox = document.getElementById('muxOutput');
    outBox.textContent = data.out;
    if(level==='OPT') outBox.style.background = "#059669"; else outBox.style.background = "#10b981";
    
    document.getElementById('muxCapacity').textContent = data.cap;
    document.getElementById('muxDetails').innerHTML = `${data.desc}<br><div class="mux-math">${data.math}</div>`;
  }


  // --- MOTEUR AUDIO ET TRAME ---
  const pageParams = LabCommon.getParams();
  const grid = document.getElementById('grid');
  const stdSelect = document.getElementById('stdSelect');
  const btnPlay = document.getElementById('btnPlay');
  const speedRange = document.getElementById('speedRange');
  const speedVal = document.getElementById('speedVal');
  const inspTitle = document.getElementById('insp-title');
  const inspBadge = document.getElementById('insp-badge');
  const inspDesc = document.getElementById('insp-desc');
  const inspBin = document.getElementById('insp-bin');
  const btnAudio = document.getElementById('btnAudio');
  const freqSelect = document.getElementById('freqSelect');
  const liveAudioBin = document.getElementById('liveAudioBin');
  const canvas = document.getElementById('oscCanvas');
  const canvasCtx = canvas.getContext('2d');
  const muxStdValue = document.getElementById('muxStdValue');
  const muxStdNote = document.getElementById('muxStdNote');
  const muxCapValue = document.getElementById('muxCapValue');
  const muxCapNote = document.getElementById('muxCapNote');
  const muxArchValue = document.getElementById('muxArchValue');
  const muxArchNote = document.getElementById('muxArchNote');
  const muxPresetButtons = document.querySelectorAll('[data-mux-preset]');
  
  let cells = []; let isScanning = false; let scanIndex = 0; let scanInterval;
  let currentStd = 'E1'; let activeInspectedCell = null;
  let audioCtx, oscillator, analyser, dataArray;
  let isAudioActive = false; let currentLiveBinary = "00000000";

  const muxPresets = {
    'e1-pdh': { std: 'E1', level: 'L2', speed: '150' },
    't1-sonet': { std: 'T1', level: 'OPT', speed: '120' },
    'pcm-focus': { std: 'E1', level: 'L2', speed: '220', mode: 'pcm' }
  };

  muxPresetButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const preset = muxPresets[button.dataset.muxPreset];
      if (!preset) {
        return;
      }

      stdSelect.value = preset.std;
      speedRange.value = preset.speed;
      speedVal.textContent = preset.speed;
      updateUIForStandard();
      setMuxLevel(preset.level);

      if (preset.mode === 'pcm') {
        LabCommon.scrollToSection('pcmSection', 60);
      } else {
        LabCommon.scrollToSection('hierarchieSection', 60);
      }
    });
  });

  function applyInitialMode() {
    const focusBanner = document.getElementById('focusBanner');

    LabCommon.applyMode({
      pcm: function () {
      document.getElementById('pageTitle').textContent = 'Laboratoire intégral : focus PCM, TDM et injection audio';
      document.getElementById('pageSubtitle').textContent = 'Mode unifié issu de l’ancien simulateur PCM/TDM : l’accent est mis sur l’échantillonnage audio, l’injection binaire en voie 1 et l’inspection de trame.';
      focusBanner.textContent = 'Mode PCM actif : utilisez l’oscillateur, observez l’octet live, puis inspectez son insertion dans la trame TDM.';
      focusBanner.classList.add('visible');
      LabCommon.scrollToSection('pcmSection', 120);
      }
    });
  }

  function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth - 20; canvas.height = 100; }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();

  speedRange.addEventListener('input', () => { speedVal.textContent = speedRange.value; });

  btnAudio.addEventListener('click', () => {
    if (!isAudioActive) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioCtx.createOscillator(); analyser = audioCtx.createAnalyser(); analyser.fftSize = 2048;
      oscillator.type = 'sine'; oscillator.frequency.value = parseInt(freqSelect.value);
      oscillator.connect(analyser); analyser.connect(audioCtx.destination); oscillator.start();
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      isAudioActive = true; btnAudio.textContent = 'Désactiver le son'; btnAudio.style.background = "#ef4444"; freqSelect.disabled = false;
      if(audioCtx.state === 'suspended') audioCtx.resume();
      drawOscilloscope();
    } else {
      oscillator.stop(); audioCtx.close(); isAudioActive = false;
      btnAudio.textContent = "Activer le Son (Oscillateur)"; btnAudio.style.background = "var(--audio-ch)"; freqSelect.disabled = true;
      liveAudioBin.textContent = "-- AUDIO OFF --"; currentLiveBinary = "00000000";
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height); updateInspector(activeInspectedCell); 
    }
  });

  freqSelect.addEventListener('change', () => { if(isAudioActive) oscillator.frequency.value = parseInt(freqSelect.value); });

  function drawOscilloscope() {
    if (!isAudioActive) return;
    requestAnimationFrame(drawOscilloscope);
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = '#020617'; canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2; canvasCtx.strokeStyle = '#0ea5e9'; canvasCtx.beginPath();
    let sliceWidth = canvas.width * 1.0 / analyser.frequencyBinCount; let x = 0;
    for(let i = 0; i < analyser.frequencyBinCount; i++) {
      let v = dataArray[i] / 128.0; let y = v * (canvas.height / 2);
      if(i === 0) canvasCtx.moveTo(x, y); else canvasCtx.lineTo(x, y); x += sliceWidth;
    }
    canvasCtx.stroke();
    canvasCtx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; canvasCtx.beginPath(); canvasCtx.moveTo(canvas.width/2, 0); canvasCtx.lineTo(canvas.width/2, canvas.height); canvasCtx.stroke();
    let centerSample = dataArray[Math.floor(analyser.frequencyBinCount / 2)];
    currentLiveBinary = centerSample.toString(2).padStart(8, '0');
    liveAudioBin.textContent = `${currentLiveBinary.substring(0,4)} ${currentLiveBinary.substring(4,8)}`;
    
    if (activeInspectedCell && activeInspectedCell.dataset.type === 'audio') {
        if (currentStd === 'T1' && (activeInspectedCell.dataset.trame == 6 || activeInspectedCell.dataset.trame == 12)) {
            let robbedBin = currentLiveBinary.substring(0,7);
            inspBin.innerHTML = `${robbedBin.split('').join(' ')} <span style="color:#ef4444">S</span>`;
        } else { inspBin.innerHTML = currentLiveBinary.split('').join(' '); }
    }
  }

  function updateUIForStandard() { 
    currentStd = stdSelect.value; 
    document.getElementById('gridTitle').textContent = currentStd === 'E1' ? "Niveau 1 : Trame Spatiale E1" : "Niveau 1 : Trame Spatiale T1";
    stopScanner(); 
    buildGrid(); 
    updateMuxUI(); 
  }

  function buildGrid() {
    grid.innerHTML = ''; cells = [];
    if (currentStd === 'E1') {
      grid.style.gridTemplateColumns = '30px repeat(32, 1fr)'; grid.appendChild(document.createElement('div'));
      for (let c = 0; c < 32; c++) {
        let col = document.createElement('div'); col.className = 'col-header'; col.textContent = c; 
        if(c === 1) col.style.color = "var(--audio-ch)"; grid.appendChild(col);
      }
      for (let r = 0; r < 16; r++) {
        let row = document.createElement('div'); row.className = 'row-header'; row.textContent = `T${r}`; grid.appendChild(row);
        for (let c = 0; c < 32; c++) {
          let cell = document.createElement('div'); cell.className = 'cell'; let type = 'voice';
          if (c === 0) type = (r % 2 === 0) ? 'fas' : 'nfas'; else if (c === 16) type = (r === 0) ? 'vmt' : 'cas'; else if (c === 1) type = 'audio'; 
          cell.classList.add(`c-${type}`); cell.dataset.trame = r; cell.dataset.it = c; cell.dataset.type = type;
          cell.addEventListener('mouseenter', () => updateInspector(cell)); grid.appendChild(cell); cells.push(cell);
        }
      }
    } else if (currentStd === 'T1') {
      grid.style.gridTemplateColumns = '30px 12px repeat(24, 1fr)'; grid.appendChild(document.createElement('div'));
      let fbHead = document.createElement('div'); fbHead.className = 'col-header'; fbHead.textContent = 'F'; grid.appendChild(fbHead);
      for (let c = 1; c <= 24; c++) {
        let col = document.createElement('div'); col.className = 'col-header'; col.textContent = `C${c}`; 
        if(c === 1) col.style.color = "var(--audio-ch)"; grid.appendChild(col);
      }
      for (let r = 1; r <= 12; r++) {
        let row = document.createElement('div'); row.className = 'row-header'; row.textContent = `T${r}`; grid.appendChild(row);
        let fcell = document.createElement('div'); fcell.className = 'cell c-fbit'; fcell.dataset.trame = r; fcell.dataset.it = 'F'; fcell.dataset.type = 'fbit';
        fcell.addEventListener('mouseenter', () => updateInspector(fcell)); grid.appendChild(fcell); cells.push(fcell);
        for (let c = 1; c <= 24; c++) {
          let cell = document.createElement('div'); cell.className = 'cell'; let type = 'voice';
          if (c === 1) type = 'audio'; else if (r === 6 || r === 12) type = 'robbed';
          cell.classList.add(`c-${type}`); cell.dataset.trame = r; cell.dataset.it = c; cell.dataset.type = type;
          cell.addEventListener('mouseenter', () => updateInspector(cell)); grid.appendChild(cell); cells.push(cell);
        }
      }
    }
    updateInspector(cells[0]);
  }

  function updateInspector(cell) {
    if(!cell || (isScanning && cell !== cells[scanIndex])) return; 
    activeInspectedCell = cell; 
    const trame = cell.dataset.trame; const it = cell.dataset.it; const type = cell.dataset.type;
    inspTitle.textContent = currentStd === 'E1' ? `Trame ${trame} - Intervalle (IT) ${it}` : `Trame ${trame} - ${it === 'F' ? 'F-Bit' : 'Canal ' + it}`;
    let randVoice = () => { let b=""; for(let i=0; i<8; i++) b+=Math.random()>0.5?"1":"0"; return b;};

    switch (type) {
      case 'fas': inspBadge.textContent = "FAS (Synchro Trame)"; inspBadge.style.background = "var(--fas)"; inspDesc.innerHTML = `<strong>Logique :</strong> L'équipement distant lit ce motif fixe pour "verrouiller" son horloge et s'aligner sur la trame.`; inspBin.innerHTML = "x 0 0 1 1 0 1 1"; break;
      case 'nfas': inspBadge.textContent = "NFAS (Alarmes)"; inspBadge.style.background = "var(--nfas)"; inspDesc.innerHTML = `<strong>Logique :</strong> Transmission des alarmes distantes (A). Le bit 2 est forcé à 1 pour éviter de simuler le FAS.`; inspBin.innerHTML = "x 1 A S S S S S"; break;
      case 'vmt': inspBadge.textContent = "VMT (Multitrame)"; inspBadge.style.background = "var(--vmt)"; inspDesc.innerHTML = `<strong>Logique :</strong> Indique le début du cycle de 16 trames, indispensable pour décoder la signalisation CAS plus loin.`; inspBin.innerHTML = "0 0 0 0 x y x x"; break;
      case 'cas': inspBadge.textContent = "CAS (Signalisation)"; inspBadge.style.background = "var(--cas)"; const k = parseInt(trame, 10); inspDesc.innerHTML = `<strong>Logique :</strong> Canal sémaphore. Il donne l'état de la <b>Voie ${k}</b> et de la <b>Voie ${k + 15}</b> (ex. téléphone qui sonne).`; inspBin.innerHTML = "a b c d  a b c d"; break;
      case 'fbit': inspBadge.textContent = "F-Bit (Synchro T1)"; inspBadge.style.background = "var(--fbit)"; inspDesc.innerHTML = `<strong>Logique :</strong> Un seul bit de synchronisation en tête de trame. Son motif (terminal framing) aide à la synchro globale.`; inspBin.innerHTML = Math.random() > 0.5 ? "1" : "0"; break;
      case 'robbed': inspBadge.textContent = "Robbed Bit"; inspBadge.style.background = "var(--robbed)"; inspDesc.innerHTML = `<strong>Logique :</strong> Le réseau vole ce bit à la voix pour indiquer le statut du téléphone. La qualité audio passe temporairement à 7 bits.`; inspBin.innerHTML = `${randVoice().substring(0,7).split('').join(' ')} <span style="color:#ef4444">S</span>`; break;
      case 'voice': inspBadge.textContent = "Données utilisateur"; inspBadge.style.background = "var(--muted)"; inspDesc.innerHTML = `<strong>Logique :</strong> Canal libre (clear channel) garantissant 64 kbps nets à l'utilisateur.`; inspBin.innerHTML = randVoice().split('').join(' '); break;
      case 'audio':
        inspBadge.textContent = "Voie audio injectée (live)"; inspBadge.style.background = "var(--audio-ch)";
        if(isAudioActive) {
          inspDesc.innerHTML = `<strong>Logique :</strong> Binaire de l'onde sonore générée par l'oscilloscope à l'instant T.`;
          if (currentStd === 'T1' && (trame == 6 || trame == 12)) {
             let robbedBin = currentLiveBinary.substring(0,7); inspBin.innerHTML = `${robbedBin.split('').join(' ')} <span style="color:#ef4444" title="Bit de signalisation volé">S</span>`;
          } else { inspBin.innerHTML = currentLiveBinary.split('').join(' '); }
        } else { inspDesc.innerHTML = `Activez l'oscillateur pour injecter un véritable flux numérisé dans ce canal.`; inspBin.innerHTML = "0 0 0 0  0 0 0 0"; }
        break;
    }
  }

  btnPlay.addEventListener('click', () => { isScanning ? stopScanner() : startScanner(); });
  function startScanner() { isScanning = true; btnPlay.innerHTML = '⏸ Arrêter le scanner'; btnPlay.classList.add('active'); scanIndex = 0; runScannerLoop(); }
  function stopScanner() { isScanning = false; btnPlay.innerHTML = '▶ Lancer le scanner'; btnPlay.classList.remove('active'); clearTimeout(scanInterval); cells.forEach(c => c.classList.remove('scanning')); }
  function runScannerLoop() {
    if(!isScanning) return;
    if (scanIndex > 0) cells[scanIndex - 1].classList.remove('scanning'); else if (scanIndex === 0 && cells.length > 0) cells[cells.length - 1].classList.remove('scanning');
    cells[scanIndex].classList.add('scanning'); updateInspector(cells[scanIndex]);
    scanIndex++; if (scanIndex >= cells.length) scanIndex = 0;
    scanInterval = setTimeout(runScannerLoop, parseInt(speedRange.value));
  }

  stdSelect.addEventListener('change', updateUIForStandard);
  updateUIForStandard(); // Init au lancement
  applyInitialMode();
