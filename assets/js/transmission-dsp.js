LabCommon.initHeader({ bodySection: 'transmission-dsp', pageId: 'transmission-dsp' });
LabCommon.initHeader({ bodySection: 'transmission-dsp', pageId: 'transmission-dsp' });

const state = { isPaused: false, time: 0, history: [] };
const phys = {
    cuivre: { attBase: 10, attKm: 0.5 },
    fibre: { attBase: 2, attKm: 0.05 },
    radio: { attBase: 20, attKm: 1.2 },
    sat: { attBase: 35, attKm: 0.01 }
};

const channelProfiles = {
    awgn: {
        label: 'AWGN de référence',
        fading: 'none',
        snrPenalty: 0,
        taps: [{ delay: 0, re: 1, im: 0 }],
        constLabel: 'Réception I/Q après bruit additif blanc gaussien',
        eyeLabel: 'Référence sans mémoire : ouverture limitée surtout par le bruit',
        note: 'Canal sans mémoire : les écarts proviennent surtout du bruit additif.'
    },
    multipath: {
        label: 'Multi-trajets modéré',
        fading: 'none',
        snrPenalty: 1.5,
        taps: [
            { delay: 0, re: 0.95, im: 0 },
            { delay: 1, re: 0.28, im: 0.12 },
            { delay: 2, re: -0.12, im: 0.08 }
        ],
        constLabel: 'Réception I/Q avec échos retardés et dispersion temporelle',
        eyeLabel: 'Des trajets secondaires ferment partiellement l’œil par superposition des symboles',
        note: 'Les échos déplacent la constellation et introduisent une première fermeture de l’œil.'
    },
    rayleigh: {
        label: 'Fading Rayleigh',
        fading: 'rayleigh',
        snrPenalty: 3,
        taps: [
            { delay: 0, re: 0.92, im: 0.04 },
            { delay: 1, re: 0.18, im: -0.08 }
        ],
        constLabel: 'Réception I/Q avec fading diffus sans trajet dominant',
        eyeLabel: 'Le gain fluctue dans le temps ; l’œil se referme pendant les creux de fading',
        note: 'Le canal varie rapidement : amplitude et phase dérivent sans trajet direct stabilisant.'
    },
    rician: {
        label: 'Fading Rician',
        fading: 'rician',
        snrPenalty: 1.5,
        taps: [
            { delay: 0, re: 0.98, im: 0.02 },
            { delay: 1, re: 0.16, im: 0.05 }
        ],
        constLabel: 'Réception I/Q avec trajet direct dominant et diffusion résiduelle',
        eyeLabel: 'Le trajet direct préserve une bonne lecture malgré une fluctuation plus douce du gain',
        note: 'Un trajet LOS stabilise partiellement la constellation malgré le fading multipath.'
    },
    isi: {
        label: 'ISI sévère',
        fading: 'none',
        snrPenalty: 2,
        taps: [
            { delay: 0, re: 0.78, im: 0 },
            { delay: 1, re: 0.42, im: 0 },
            { delay: 2, re: -0.24, im: 0.04 }
        ],
        constLabel: 'Réception I/Q dominée par l’interférence inter-symboles',
        eyeLabel: 'Les contributions voisines se recouvrent fortement et réduisent la marge de décision',
        note: 'La mémoire du canal domine : le symbole reçu dépend fortement des symboles précédents.'
    }
};

const mimoProfiles = {
    siso: {
        label: 'SISO 1x1',
        streams: 1,
        note: 'Référence : une seule chaîne radio et aucun gain spatial.',
        gainLabel: 'Référence'
    },
    simo12: {
        label: 'SIMO 1x2',
        streams: 1,
        note: 'Deux antennes de réception combinent les observations pour gagner en robustesse.',
        gainLabel: 'Diversité'
    },
    mimo22: {
        label: 'MIMO 2x2',
        streams: 2,
        note: 'Deux flux spatiaux sont transmis simultanément pour augmenter le débit utile, au prix d’une séparation plus sensible au canal.',
        gainLabel: 'Débit spatial'
    }
};

const $ = id => document.getElementById(id);
const ui = {
    dist: $('dist'),
    media: $('mediaType'),
    channelProfile: $('channelProfile'),
    systemMode: $('systemMode'),
    coverageScenario: $('coverageScenario'),
    schedulerMode: $('schedulerMode'),
    schedulerPolicy: $('schedulerPolicy'),
    waveformMode: $('waveformMode'),
    mimoMode: $('mimoMode'),
    fecType: $('fecType'),
    ofdmSubcarriers: $('ofdmSubcarriers'),
    ofdmCp: $('ofdmCp'),
    mod: $('modType'),
    baud: $('baudRate'),
    filter: $('filterType'),
    alpha: $('alpha'),
    btnPause: $('btnPlayPause'),
    vDist: $('valDist'),
    vSNR: $('valSNR'),
    vSER: $('valSER'),
    vSpecEff: $('valSpecEff'),
    vRb: $('valRb'),
    vAlpha: $('valAlpha'),
    vBaud: $('valBaud'),
    vModName: $('valModName'),
    vChannelProfile: $('valChannelProfile'),
    vCoverageScenario: $('valCoverageScenario'),
    vSchedulerPolicy: $('valSchedulerPolicy'),
    vWaveformMode: $('valWaveformMode'),
    vMimoMode: $('valMimoMode'),
    vFecType: $('valFecType'),
    vOfdmCp: $('valOfdmCp'),
    vBERRaw: $('valBERRaw'),
    vBERFec: $('valBERFec'),
    kpiEbN0: $('dspEbN0'),
    kpiBandwidth: $('dspBandwidth'),
    kpiState: $('dspChannelState'),
    kpiStateNote: $('dspChannelNote'),
    kpiCodeRate: $('dspCodeRate'),
    kpiCodeRateNote: $('dspCodeRateNote'),
    kpiFecGain: $('dspFecGain'),
    kpiFecGainNote: $('dspFecGainNote'),
    kpiWaveformMode: $('dspWaveformMode'),
    kpiWaveformNote: $('dspWaveformNote'),
    kpiCpGuard: $('dspCpGuard'),
    kpiCpGuardNote: $('dspCpGuardNote'),
    kpiMimoMode: $('dspMimoMode'),
    kpiMimoNote: $('dspMimoNote'),
    kpiMimoGain: $('dspMimoGain'),
    kpiMimoGainNote: $('dspMimoGainNote'),
    kpiMcs: $('dspMcs'),
    kpiMcsNote: $('dspMcsNote'),
    kpiCoverageState: $('dspCoverageState'),
    kpiCoverageNote: $('dspCoverageNote'),
    kpiSchedTotalRate: $('dspSchedTotalRate'),
    kpiSchedTotalRateNote: $('dspSchedTotalRateNote'),
    kpiSchedFairness: $('dspSchedFairness'),
    kpiSchedFairnessNote: $('dspSchedFairnessNote'),
    schedulerSummary: $('schedulerSummary'),
    schedulerUsers: $('schedulerUsers'),
    rbSummary: $('rbSummary'),
    rbFrameInfo: $('rbFrameInfo'),
    rbLegend: $('rbLegend'),
    rbGrid: $('rbGrid'),
    berLabel: $('berScopeLabel'),
    historyLabel: $('historyScopeLabel'),
    constLabel: $('constScopeLabel'),
    eyeLabel: $('eyeScopeLabel')
};

const ctxConst = $('constCanvas').getContext('2d');
const ctxSpec = $('specCanvas').getContext('2d');
const ctxEye = $('eyeCanvas').getContext('2d');
const ctxTime = $('timeCanvas').getContext('2d');
const ctxBer = $('berCanvas').getContext('2d');
const ctxHistory = $('historyCanvas').getContext('2d');
const dspPresetButtons = document.querySelectorAll('[data-dsp-preset]');

const dspPresets = {
    robust: { media: 'fibre', dist: 10, channel: 'awgn', waveform: 'single', mimo: 'simo12', fec: 'hamming74', ofdmSubcarriers: '8', ofdmCp: 25, mod: '2', baud: 8, filter: 'rrc', alpha: 0.2 },
    nominal: { media: 'cuivre', dist: 20, channel: 'multipath', waveform: 'single', mimo: 'siso', fec: 'none', ofdmSubcarriers: '8', ofdmCp: 25, mod: '16', baud: 10, filter: 'rrc', alpha: 0.3 },
    dense: { media: 'radio', dist: 32, channel: 'rayleigh', waveform: 'single', mimo: 'mimo22', fec: 'rep3', ofdmSubcarriers: '8', ofdmCp: 25, mod: '64', baud: 18, filter: 'rrc', alpha: 0.5 },
    ofdm: { media: 'radio', dist: 28, channel: 'multipath', waveform: 'ofdm', mimo: 'simo12', fec: 'hamming74', ofdmSubcarriers: '8', ofdmCp: 25, mod: '4', baud: 14, filter: 'rrc', alpha: 0.2 },
    '5g-good': { system: '5g', coverage: 'good', media: 'radio', dist: 12, channel: 'rician', waveform: 'ofdm', mimo: 'mimo22', fec: 'hamming74', ofdmSubcarriers: '16', ofdmCp: 15, mod: '64', baud: 18, filter: 'rrc', alpha: 0.2 },
    '5g-edge': { system: '5g', coverage: 'edge', media: 'radio', dist: 38, channel: 'rayleigh', waveform: 'ofdm', mimo: 'simo12', fec: 'rep3', ofdmSubcarriers: '8', ofdmCp: 30, mod: '4', baud: 12, filter: 'rrc', alpha: 0.2 }
};

let idealSymbols = [];
let symbolLookupByBits = {};

const fiveGProfiles = {
    good: {
        label: 'Bonne couverture',
        snrBias: 5,
        bandwidthFactor: 1.15,
        waveform: 'ofdm',
        mimo: 'mimo22',
        subcarriers: '16',
        cp: 15,
        alpha: 0.2,
        channelFallback: 'rician'
    },
    edge: {
        label: 'Cell edge',
        snrBias: -6,
        bandwidthFactor: 0.95,
        waveform: 'ofdm',
        mimo: 'simo12',
        subcarriers: '8',
        cp: 30,
        alpha: 0.2,
        channelFallback: 'rayleigh'
    }
};

const mcsProfiles = [
    { id: 'MCS 0', label: 'MCS 0 • BPSK + REP3 + SIMO', minSnr: -Infinity, mod: '2', fec: 'rep3', mimo: 'simo12' },
    { id: 'MCS 2', label: 'MCS 2 • QPSK + Hamming + SIMO', minSnr: 6, mod: '4', fec: 'hamming74', mimo: 'simo12' },
    { id: 'MCS 4', label: 'MCS 4 • 16-QAM + Hamming + SIMO', minSnr: 12, mod: '16', fec: 'hamming74', mimo: 'simo12' },
    { id: 'MCS 7', label: 'MCS 7 • 16-QAM + Hamming + 2x2', minSnr: 18, mod: '16', fec: 'hamming74', mimo: 'mimo22' },
    { id: 'MCS 9', label: 'MCS 9 • 64-QAM + Hamming + 2x2', minSnr: 24, mod: '64', fec: 'hamming74', mimo: 'mimo22' }
];

const schedulerPolicies = {
    max: { label: 'Débit max' },
    fair: { label: 'Équité stricte' },
    pf: { label: 'Proportionnel' }
};

const schedulerUsers = [
    { id: 'near', label: 'UE proche', snrOffset: 8, weight: 1.2, color: '#16a34a' },
    { id: 'mid', label: 'UE moyen', snrOffset: 0, weight: 1.0, color: '#0ea5e9' },
    { id: 'edge', label: 'UE bord cellule', snrOffset: -8, weight: 0.8, color: '#f97316' }
];

const waveformProfiles = {
    single: {
        label: 'Monoporteuse',
        note: 'Toute la bande utile est portée par un seul flux symbole, plus sensible à l’ISI quand le canal a de la mémoire.'
    },
    ofdm: {
        label: 'OFDM pédagogique',
        note: 'Les données sont réparties sur des sous-porteuses orthogonales et un préfixe cyclique limite l’ISI en canal multi-trajets.'
    }
};

const fecProfiles = {
    none: { label: 'Sans FEC', codeRate: 1, note: 'Aucune redondance : le BER utile suit directement le BER brut.' },
    rep3: { label: 'Répétition ×3', codeRate: 1 / 3, note: 'Chaque bit est transmis trois fois puis décidé par majorité simple.' },
    hamming74: { label: 'Hamming (7,4)', codeRate: 4 / 7, note: 'Chaque mot de 4 bits ajoute 3 bits de parité et corrige une erreur simple.' }
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getMcsForSnr(snrDb) {
    let selected = mcsProfiles[0];
    mcsProfiles.forEach(function (profile) {
        if (snrDb >= profile.minSnr) {
            selected = profile;
        }
    });
    return selected;
}

function computeSchedulerSnapshot(baseSnrDb, schedulerMode, policyKey, frameIndex) {
    if (schedulerMode !== 'on') {
        return null;
    }

    const policy = schedulerPolicies[policyKey] || schedulerPolicies.pf;
    const numBands = 6;
    const numSymbols = 12;
    const totalBlocks = numBands * numSymbols;
    const users = schedulerUsers.map(function (user) {
        const fading = 1.6 * Math.sin(frameIndex * 0.35 + user.weight * 2.1);
        const snr = clamp(baseSnrDb + user.snrOffset + fading, 0, 35);
        const mcs = getMcsForSnr(snr);
        const fec = fecProfiles[mcs.fec] || fecProfiles.none;
        const mimo = mimoProfiles[mcs.mimo] || mimoProfiles.siso;
        const bitsPerSym = Math.log2(parseInt(mcs.mod, 10));
        const rawCapacity = bitsPerSym * fec.codeRate * mimo.streams;
        return {
            id: user.id,
            label: user.label,
            color: user.color,
            snr: snr,
            mcs: mcs,
            rawCapacity: rawCapacity,
            weight: user.weight,
            servedBlocks: 0,
            temporalBias: 1 + 0.18 * Math.sin(frameIndex * 0.4 + user.weight * 1.7)
        };
    });

    const rbAssignments = [];
    for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
        let bestUser = users[0];
        let bestScore = -Infinity;

        users.forEach(function (user, userIndex) {
            const slotBias = 1 + 0.08 * Math.sin(frameIndex * 0.5 + blockIndex * 0.35 + userIndex);
            let score = 0;

            if (policyKey === 'max') {
                score = user.rawCapacity * user.temporalBias * slotBias;
            } else if (policyKey === 'fair') {
                score = 1 / Math.max(1, user.servedBlocks + 1);
                score += 0.02 * user.rawCapacity * slotBias;
            } else {
                score = (user.rawCapacity * user.temporalBias * slotBias) / Math.max(1, user.servedBlocks + 1.2);
            }

            if (score > bestScore) {
                bestScore = score;
                bestUser = user;
            }
        });

        bestUser.servedBlocks++;
        rbAssignments.push(bestUser);
    }

    users.forEach(function (user) {
        user.share = user.servedBlocks / totalBlocks;
        user.rate = user.share * user.rawCapacity * 12;
    });

    const totalRate = users.reduce(function (sum, user) { return sum + user.rate; }, 0);
    const sumRates = users.reduce(function (sum, user) { return sum + user.rate; }, 0);
    const sumSquares = users.reduce(function (sum, user) { return sum + user.rate * user.rate; }, 0);
    const fairness = sumSquares > 0 ? (sumRates * sumRates) / (users.length * sumSquares) : 0;

    return {
        policy: policy,
        users: users,
        totalRate: totalRate,
        fairness: fairness,
        frameIndex: frameIndex,
        numBands: numBands,
        numSymbols: numSymbols,
        rbAssignments: rbAssignments
    };
}

function renderSchedulerSnapshot(snapshot) {
    if (!snapshot) {
        ui.vSchedulerPolicy.textContent = 'Aucune';
        ui.kpiSchedTotalRate.textContent = '—';
        ui.kpiSchedFairness.textContent = '—';
        ui.kpiSchedTotalRateNote.textContent = 'Somme des débits utiles alloués aux trois usagers quand le scheduler est actif.';
        ui.kpiSchedFairnessNote.textContent = 'Mesure la régularité du partage des ressources entre `UE proche`, `UE moyen` et `UE bord cellule`.'.replace(/`/g, '');
        ui.schedulerSummary.textContent = 'Scheduler désactivé : le laboratoire affiche un seul lien utilisateur.';
        ui.schedulerUsers.innerHTML = '';
        return;
    }

    ui.vSchedulerPolicy.textContent = snapshot.policy.label;
    ui.kpiSchedTotalRate.textContent = snapshot.totalRate.toFixed(1) + ' Mb/s';
    ui.kpiSchedFairness.textContent = snapshot.fairness.toFixed(2);
    ui.kpiSchedTotalRateNote.textContent = 'Plus la politique favorise les meilleurs canaux, plus le débit total augmente.';
    ui.kpiSchedFairnessNote.textContent = snapshot.policy.label === 'Équité stricte'
        ? 'La répartition est plus homogène, même si le débit total peut diminuer.'
        : (snapshot.policy.label === 'Débit max'
            ? 'La politique privilégie les UE les mieux couverts, au détriment possible du bord de cellule.'
            : 'Le proportionnel cherche un compromis entre efficacité totale et partage raisonnable.');
    ui.schedulerSummary.textContent = 'Politique ' + snapshot.policy.label + ' : trame ' + snapshot.frameIndex + ' — comparez la part de ressources et le MCS obtenu par chaque UE pour visualiser le compromis équité / débit total.';
    ui.schedulerUsers.innerHTML = snapshot.users.map(function (user) {
        return '<article style="border:1px solid var(--border);border-radius:10px;padding:12px;background:#fff">'
            + '<div style="font-weight:800;color:' + user.color + ';margin-bottom:6px">' + user.label + '</div>'
            + '<div>SNR radio : <strong>' + user.snr.toFixed(1) + ' dB</strong></div>'
            + '<div>MCS : <strong>' + user.mcs.id + '</strong></div>'
            + '<div>Part RB : <strong>' + Math.round(user.share * 100) + ' %</strong></div>'
            + '<div>RB servis : <strong>' + user.servedBlocks + '</strong></div>'
            + '<div>Débit utile : <strong>' + user.rate.toFixed(1) + ' Mb/s</strong></div>'
            + '</article>';
    }).join('');
}

function renderRadioBlocks(snapshot) {
    if (!snapshot) {
        ui.rbSummary.textContent = 'Activez le scheduler pour visualiser la répartition des ressources en temps et en fréquence.';
        ui.rbFrameInfo.textContent = 'Trame courante : —';
        ui.rbLegend.innerHTML = '';
        ui.rbGrid.innerHTML = '';
        return;
    }

    const numSymbols = snapshot.numSymbols;
    const numBands = snapshot.numBands;
    const cells = snapshot.rbAssignments || [];

    ui.rbSummary.textContent = 'La grille montre ' + numBands + ' sous-bandes × ' + numSymbols + ' intervalles temps. Les couleurs représentent l’UE servi sur chaque Resource Block selon la politique ' + snapshot.policy.label + '.';
    ui.rbFrameInfo.textContent = 'Trame courante : ' + snapshot.frameIndex + ' • allocation animée selon la politique scheduler';
    ui.rbLegend.innerHTML = snapshot.users.map(function (user) {
        return '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text)">'
            + '<span style="width:14px;height:14px;border-radius:4px;background:' + user.color + ';display:inline-block;border:1px solid rgba(15,23,42,0.15)"></span>'
            + user.label + ' (' + Math.round(user.share * 100) + ' % RB)'
            + '</div>';
    }).join('');

    const header = ['<div></div>'];
    for (let t = 0; t < numSymbols; t++) {
        header.push('<div style="font-size:11px;color:var(--muted);text-align:center;font-weight:700">T' + (t + 1) + '</div>');
    }

    const grid = header.slice();
    for (let band = 0; band < numBands; band++) {
        grid.push('<div style="font-size:11px;color:var(--muted);font-weight:700">RB-F' + (numBands - band) + '</div>');
        for (let t = 0; t < numSymbols; t++) {
            const user = cells[band * numSymbols + t];
            const pulse = 0.72 + 0.16 * Math.sin(snapshot.frameIndex * 0.45 + band * 0.6 + t * 0.35);
            grid.push('<div title="' + user.label + '" style="height:24px;border-radius:6px;background:' + user.color + ';opacity:' + pulse.toFixed(2) + ';border:1px solid rgba(15,23,42,0.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.18)"></div>');
        }
    }

    ui.rbGrid.innerHTML = grid.join('');
}

function formatBer(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return '0.000';
    }
    return value < 0.001 ? value.toExponential(2) : value.toFixed(3);
}

function qFunction(x) {
    const absX = Math.abs(x);
    const t = 1 / (1 + 0.2316419 * absX);
    const d = 0.3989423 * Math.exp(-(absX * absX) / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    prob = x >= 0 ? prob : 1 - prob;
    return clamp(prob, 1e-9, 0.5);
}

function getTheoreticalRawBer(ebN0Db, modulationOrder) {
    const ebN0 = Math.pow(10, ebN0Db / 10);
    if (modulationOrder === 2 || modulationOrder === 4) {
        return clamp(qFunction(Math.sqrt(2 * ebN0)), 1e-9, 0.5);
    }

    const bitsPerSymbol = Math.log2(modulationOrder);
    const qArg = Math.sqrt((3 * bitsPerSymbol * ebN0) / Math.max(modulationOrder - 1, 1));
    const ber = (4 / bitsPerSymbol) * (1 - 1 / Math.sqrt(modulationOrder)) * qFunction(qArg);
    return clamp(ber, 1e-9, 0.5);
}

function getTheoreticalCorrectedBer(rawBer, fecKey) {
    if (fecKey === 'rep3') {
        return clamp(rawBer * rawBer * (3 - (2 * rawBer)), 1e-9, 0.5);
    }

    if (fecKey === 'hamming74') {
        const wordFail = 1 - (Math.pow(1 - rawBer, 7) + 7 * rawBer * Math.pow(1 - rawBer, 6));
        return clamp(wordFail / 4, 1e-9, 0.5);
    }

    return clamp(rawBer, 1e-9, 0.5);
}

function drawBerCurve(ctx, modulationOrder, fecKey, currentEbN0Db, measuredRawBer, measuredCorrectedBer) {
    const width = 700;
    const height = 260;
    ctx.clearRect(0, 0, width, height);
    const layout = drawRectAxes(ctx, width, height, {
        xTicks: [
            { pos: 0, label: '0' },
            { pos: 0.25, label: '5' },
            { pos: 0.5, label: '10' },
            { pos: 0.75, label: '15' },
            { pos: 1, label: '20' }
        ],
        yTicks: [
            { pos: 0, label: '1e-1' },
            { pos: 0.25, label: '1e-2' },
            { pos: 0.5, label: '1e-3' },
            { pos: 0.75, label: '1e-4' },
            { pos: 1, label: '1e-5' }
        ],
        xLabel: 'Eb/N0 (dB)',
        yLabel: 'BER (échelle log)',
        axisColor: 'rgba(226,232,240,0.85)',
        gridColor: 'rgba(148,163,184,0.14)'
    });

    function xToCanvas(value) {
        return layout.left + (clamp(value, 0, 20) / 20) * layout.plotW;
    }

    function yToCanvas(value) {
        const safe = clamp(value, 1e-5, 1e-1);
        const logMin = -5;
        const logMax = -1;
        const yNorm = (Math.log10(safe) - logMax) / (logMin - logMax);
        return layout.top + yNorm * layout.plotH;
    }

    const rawCurve = [];
    const correctedCurve = [];
    for (let eb = 0; eb <= 20; eb += 0.25) {
        const raw = getTheoreticalRawBer(eb, modulationOrder);
        rawCurve.push({ x: xToCanvas(eb), y: yToCanvas(raw) });
        correctedCurve.push({ x: xToCanvas(eb), y: yToCanvas(getTheoreticalCorrectedBer(raw, fecKey)) });
    }

    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    rawCurve.forEach(function (point, index) {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    correctedCurve.forEach(function (point, index) {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    const currentX = xToCanvas(currentEbN0Db);
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(currentX, layout.top);
    ctx.lineTo(currentX, layout.top + layout.plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    const rawY = yToCanvas(measuredRawBer);
    const correctedY = yToCanvas(measuredCorrectedBer);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(currentX, rawY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(currentX, correctedY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(226,232,240,0.9)';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText('Brut', layout.left + 10, layout.top + 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(layout.left + 44, layout.top + 6, 14, 3);
    ctx.fillStyle = 'rgba(226,232,240,0.9)';
    ctx.fillText('Après FEC', layout.left + 74, layout.top + 14);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(layout.left + 140, layout.top + 6, 14, 3);
}

function pushLinkHistory(snrDb, correctedBer, usefulRate) {
    state.history.push({
        snr: snrDb,
        ber: correctedBer,
        rate: usefulRate
    });

    if (state.history.length > 120) {
        state.history.shift();
    }
}

function drawLinkHistory(ctx, history) {
    const width = 700;
    const height = 260;
    ctx.clearRect(0, 0, width, height);
    const layout = drawRectAxes(ctx, width, height, {
        xTicks: [
            { pos: 0, label: '-120' },
            { pos: 0.25, label: '-90' },
            { pos: 0.5, label: '-60' },
            { pos: 0.75, label: '-30' },
            { pos: 1, label: '0' }
        ],
        yTicks: [
            { pos: 0.1, label: 'haut' },
            { pos: 0.5, label: 'moyen' },
            { pos: 0.9, label: 'bas' }
        ],
        xLabel: 'Historique glissant (échantillons)',
        yLabel: 'Niveaux normalisés',
        axisColor: 'rgba(226,232,240,0.85)',
        gridColor: 'rgba(148,163,184,0.14)'
    });

    if (!history.length) {
        return;
    }

    const maxRate = Math.max.apply(null, history.map(function (entry) { return entry.rate; }).concat([1]));
    const snrMin = 0;
    const snrMax = 35;

    function xAt(index) {
        return layout.left + (index / Math.max(history.length - 1, 1)) * layout.plotW;
    }

    function yFromNorm(norm) {
        return layout.top + (1 - clamp(norm, 0, 1)) * layout.plotH;
    }

    const traces = [
        {
            color: '#38bdf8',
            label: 'SNR',
            norm: function (entry) { return (entry.snr - snrMin) / Math.max(snrMax - snrMin, 1); }
        },
        {
            color: '#22c55e',
            label: 'Débit utile',
            norm: function (entry) { return entry.rate / Math.max(maxRate, 1e-6); }
        },
        {
            color: '#f59e0b',
            label: 'BER utile',
            norm: function (entry) {
                const logBer = -Math.log10(clamp(entry.ber, 1e-5, 1e-1));
                return logBer / 5;
            }
        }
    ];

    traces.forEach(function (trace) {
        ctx.beginPath();
        ctx.strokeStyle = trace.color;
        ctx.lineWidth = 2;
        history.forEach(function (entry, index) {
            const x = xAt(index);
            const y = yFromNorm(trace.norm(entry));
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        const last = history[history.length - 1];
        const lastX = xAt(history.length - 1);
        const lastY = yFromNorm(trace.norm(last));
        ctx.fillStyle = trace.color;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = 'rgba(226,232,240,0.9)';
    ctx.font = '11px Segoe UI, sans-serif';
    const legend = [
        { x: layout.left + 10, color: '#38bdf8', label: 'SNR' },
        { x: layout.left + 82, color: '#22c55e', label: 'Débit utile' },
        { x: layout.left + 190, color: '#f59e0b', label: 'BER utile' }
    ];
    legend.forEach(function (item) {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, layout.top + 6, 14, 3);
        ctx.fillStyle = 'rgba(226,232,240,0.9)';
        ctx.fillText(item.label, item.x + 20, layout.top + 14);
    });
}

function countBitErrors(referenceBits, observedBits) {
    let errors = 0;
    const length = Math.min(referenceBits.length, observedBits.length);
    for (let i = 0; i < length; i++) {
        if (referenceBits[i] !== observedBits[i]) {
            errors++;
        }
    }
    return errors;
}

function buildRandomBits(length) {
    const bits = [];
    for (let i = 0; i < length; i++) {
        bits.push(Math.random() >= 0.5 ? 1 : 0);
    }
    return bits;
}

function encodeFecBits(sourceBits, fecKey) {
    if (fecKey === 'rep3') {
        const encoded = [];
        sourceBits.forEach(bit => {
            encoded.push(bit, bit, bit);
        });
        return { bits: encoded, payloadLength: sourceBits.length };
    }

    if (fecKey === 'hamming74') {
        const padded = sourceBits.slice();
        while (padded.length % 4 !== 0) {
            padded.push(0);
        }

        const encoded = [];
        for (let i = 0; i < padded.length; i += 4) {
            const d1 = padded[i];
            const d2 = padded[i + 1];
            const d3 = padded[i + 2];
            const d4 = padded[i + 3];
            const p1 = d1 ^ d2 ^ d4;
            const p2 = d1 ^ d3 ^ d4;
            const p3 = d2 ^ d3 ^ d4;
            encoded.push(p1, p2, d1, p3, d2, d3, d4);
        }

        return { bits: encoded, payloadLength: sourceBits.length, paddedPayloadLength: padded.length };
    }

    return { bits: sourceBits.slice(), payloadLength: sourceBits.length };
}

function decodeFecBits(receivedBits, fecKey, meta) {
    if (fecKey === 'rep3') {
        const decoded = [];
        for (let i = 0; i < receivedBits.length; i += 3) {
            const b0 = receivedBits[i] || 0;
            const b1 = receivedBits[i + 1] || 0;
            const b2 = receivedBits[i + 2] || 0;
            decoded.push((b0 + b1 + b2) >= 2 ? 1 : 0);
        }
        return { bits: decoded.slice(0, meta.payloadLength) };
    }

    if (fecKey === 'hamming74') {
        const decoded = [];
        let correctedWords = 0;

        for (let i = 0; i < receivedBits.length; i += 7) {
            const word = receivedBits.slice(i, i + 7);
            while (word.length < 7) {
                word.push(0);
            }

            const s1 = word[0] ^ word[2] ^ word[4] ^ word[6];
            const s2 = word[1] ^ word[2] ^ word[5] ^ word[6];
            const s3 = word[3] ^ word[4] ^ word[5] ^ word[6];
            const syndrome = s1 + (2 * s2) + (4 * s3);

            if (syndrome > 0 && syndrome <= 7) {
                word[syndrome - 1] ^= 1;
                correctedWords++;
            }

            decoded.push(word[2], word[4], word[5], word[6]);
        }

        return { bits: decoded.slice(0, meta.payloadLength), correctedWords: correctedWords };
    }

    return { bits: receivedBits.slice(0, meta.payloadLength) };
}

function mapBitsToSymbolSequence(bits, bitsPerSym) {
    const paddedBits = bits.slice();
    while (paddedBits.length % bitsPerSym !== 0) {
        paddedBits.push(0);
    }

    const symbols = [];
    for (let i = 0; i < paddedBits.length; i += bitsPerSym) {
        const key = paddedBits.slice(i, i + bitsPerSym).join('');
        symbols.push(symbolLookupByBits[key] || idealSymbols[0]);
    }

    return symbols;
}

function demapSymbolsToBits(symbols) {
    const bits = [];
    symbols.forEach(symbol => {
        symbol.bits.split('').forEach(bit => {
            bits.push(bit === '1' ? 1 : 0);
        });
    });
    return bits;
}

function transmitSymbolSequence(txSymbols, snapshot, noiseStdDev) {
    const rxSymbols = [];

    for (let index = 0; index < txSymbols.length; index++) {
        let rxI = 0;
        let rxQ = 0;

        snapshot.taps.forEach(tap => {
            const source = txSymbols[index - tap.delay];
            if (!source) {
                return;
            }
            const contribution = applyCoefficientToSymbol(source, tap);
            rxI += contribution.I;
            rxQ += contribution.Q;
        });

        rxI += randn_bm() * noiseStdDev;
        rxQ += randn_bm() * noiseStdDev;
        rxSymbols.push(getNearestIdealSymbol(rxI, rxQ));
    }

    return rxSymbols;
}

function simulateModeSymbolSequence(txSymbols, snapshot, noiseStdDev, waveformMode, ofdmConfig, mimoMode, timeSeed) {
    if (waveformMode === 'ofdm') {
        return receiveOfdmSymbols(txSymbols, snapshot, noiseStdDev, ofdmConfig, mimoMode, timeSeed).decodedSymbols;
    }
    return simulateSpatialTransmission(txSymbols, snapshot, noiseStdDev, mimoMode || 'siso', null, timeSeed || 0, null).decodedSymbols;
}

function simulateFecMetrics(bitsPerSym, snapshot, noiseStdDev, fecKey, waveformMode, ofdmConfig, mimoMode, timeSeed) {
    const payloadBits = buildRandomBits(96);
    const encoded = encodeFecBits(payloadBits, fecKey);
    const txSymbols = mapBitsToSymbolSequence(encoded.bits, bitsPerSym);
    const rxSymbols = simulateModeSymbolSequence(txSymbols, snapshot, noiseStdDev, waveformMode, ofdmConfig, mimoMode, timeSeed);
    const rxEncodedBits = demapSymbolsToBits(rxSymbols).slice(0, encoded.bits.length);
    const decoded = decodeFecBits(rxEncodedBits, fecKey, encoded);

    return {
        rawBer: countBitErrors(encoded.bits, rxEncodedBits) / Math.max(1, encoded.bits.length),
        correctedBer: countBitErrors(payloadBits, decoded.bits) / Math.max(1, payloadBits.length),
        correctedWords: decoded.correctedWords || 0,
        encodedBits: encoded.bits.length,
        payloadBits: payloadBits.length
    };
}

function randn_bm() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sinc(x) {
    if (Math.abs(x) < 1e-6) return 1.0;
    const piX = Math.PI * x;
    return Math.sin(piX) / piX;
}

function rrc(t, alpha, Ts) {
    if (alpha === 0) return sinc(t / Ts);
    const tNorm = t / Ts;
    if (Math.abs(Math.abs(tNorm) - 1 / (4 * alpha)) < 1e-4) {
        return (alpha / Math.SQRT2) * ((1 + 2 / Math.PI) * Math.sin(Math.PI / (4 * alpha)) + (1 - 2 / Math.PI) * Math.cos(Math.PI / (4 * alpha)));
    }
    const num = Math.sin(Math.PI * tNorm * (1 - alpha)) + 4 * alpha * tNorm * Math.cos(Math.PI * tNorm * (1 + alpha));
    const den = Math.PI * tNorm * (1 - Math.pow(4 * alpha * tNorm, 2));
    return num / den;
}

function complexMultiply(a, b) {
    return {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re
    };
}

function complexDivide(a, b) {
    const denom = Math.max(1e-6, b.re * b.re + b.im * b.im);
    return {
        re: (a.re * b.re + a.im * b.im) / denom,
        im: (a.im * b.re - a.re * b.im) / denom
    };
}

function complexAdd(a, b) {
    return { re: a.re + b.re, im: a.im + b.im };
}

function complexSubtract(a, b) {
    return { re: a.re - b.re, im: a.im - b.im };
}

function complexConjugate(a) {
    return { re: a.re, im: -a.im };
}

function complexScale(a, scale) {
    return { re: a.re * scale, im: a.im * scale };
}

function complexMagnitude(value) {
    return Math.hypot(value.re, value.im);
}

function channelFrequencyResponseComplex(taps, fNorm) {
    let re = 0;
    let im = 0;

    taps.forEach(tap => {
        const phase = -2 * Math.PI * fNorm * tap.delay;
        const cosPhase = Math.cos(phase);
        const sinPhase = Math.sin(phase);
        re += tap.re * cosPhase - tap.im * sinPhase;
        im += tap.re * sinPhase + tap.im * cosPhase;
    });

    return { re: re, im: im };
}

function getSpatialBaseResponse(snapshot, frequency) {
    const response = channelFrequencyResponseComplex(snapshot.taps, frequency || 0);
    if (complexMagnitude(response) < 0.12) {
        const angle = Math.atan2(response.im, response.re || 1e-6);
        return { re: 0.12 * Math.cos(angle), im: 0.12 * Math.sin(angle) };
    }
    return response;
}

function getDiversityBranches(timeSeed) {
    return [
        { re: 1.0, im: 0.0 },
        { re: 0.84 * Math.cos(0.53 * timeSeed + 0.4), im: 0.84 * Math.sin(0.53 * timeSeed + 0.4) }
    ];
}

function getSpatialMatrix(timeSeed) {
    return {
        h11: { re: 1.0, im: 0.04 },
        h12: { re: 0.32 * Math.cos(0.41 * timeSeed + 0.8), im: 0.32 * Math.sin(0.41 * timeSeed + 0.8) },
        h21: { re: 0.28 * Math.cos(0.37 * timeSeed + 1.2), im: 0.28 * Math.sin(0.37 * timeSeed + 1.2) },
        h22: { re: 0.96 * Math.cos(0.17), im: 0.96 * Math.sin(0.17) }
    };
}

function getResidualInterference(snapshot, guardInfo) {
    let residual = snapshot.echoEnergy * 0.12;
    if (snapshot.profile === channelProfiles.isi) {
        residual += 0.06;
    }
    if (guardInfo && !guardInfo.protected) {
        residual += guardInfo.residualLevel * 0.45;
    }
    return residual;
}

function toComplexSymbol(symbol) {
    return { re: symbol.I, im: symbol.Q };
}

function simulateSpatialTransmission(txSymbols, snapshot, noiseStdDev, mimoMode, frequencies, timeSeed, guardInfo) {
    const decodedSymbols = [];
    const equalizedPoints = [];
    const residual = getResidualInterference(snapshot, guardInfo);
    const safeFrequencies = frequencies && frequencies.length ? frequencies : txSymbols.map(function () { return 0; });

    if (mimoMode === 'simo12') {
        for (let index = 0; index < txSymbols.length; index++) {
            const freq = safeFrequencies[index] || 0;
            const base = getSpatialBaseResponse(snapshot, freq);
            const tx = toComplexSymbol(txSymbols[index] || idealSymbols[0]);
            const branches = getDiversityBranches(timeSeed + index * 0.13);
            const branchResponses = branches.map(branch => complexMultiply(base, branch));
            let numerator = { re: 0, im: 0 };
            let denom = 0;

            branchResponses.forEach(function (response) {
                const noise = { re: randn_bm() * (noiseStdDev + residual), im: randn_bm() * (noiseStdDev + residual) };
                const y = complexAdd(complexMultiply(response, tx), noise);
                numerator = complexAdd(numerator, complexMultiply(complexConjugate(response), y));
                denom += Math.pow(complexMagnitude(response), 2);
            });

            const equalized = complexScale(numerator, 1 / Math.max(denom, 1e-6));
            equalizedPoints.push({ I: equalized.re, Q: equalized.im });
            decodedSymbols.push(getNearestIdealSymbol(equalized.re, equalized.im));
        }

        return { decodedSymbols: decodedSymbols, equalizedPoints: equalizedPoints };
    }

    if (mimoMode === 'mimo22') {
        for (let index = 0; index < txSymbols.length; index += 2) {
            const x1 = toComplexSymbol(txSymbols[index] || idealSymbols[0]);
            const x2 = toComplexSymbol(txSymbols[index + 1] || idealSymbols[0]);
            const freq1 = safeFrequencies[index] || 0;
            const freq2 = safeFrequencies[index + 1] || freq1;
            const base1 = getSpatialBaseResponse(snapshot, freq1);
            const base2 = getSpatialBaseResponse(snapshot, freq2);
            const spatial = getSpatialMatrix(timeSeed + index * 0.09);
            const h11 = complexMultiply(base1, spatial.h11);
            const h12 = complexMultiply(base1, spatial.h12);
            const h21 = complexMultiply(base2, spatial.h21);
            const h22 = complexMultiply(base2, spatial.h22);
            const n1 = { re: randn_bm() * (noiseStdDev + residual), im: randn_bm() * (noiseStdDev + residual) };
            const n2 = { re: randn_bm() * (noiseStdDev + residual), im: randn_bm() * (noiseStdDev + residual) };
            const y1 = complexAdd(complexAdd(complexMultiply(h11, x1), complexMultiply(h12, x2)), n1);
            const y2 = complexAdd(complexAdd(complexMultiply(h21, x1), complexMultiply(h22, x2)), n2);
            const det = complexSubtract(complexMultiply(h11, h22), complexMultiply(h12, h21));
            const xHat1 = complexDivide(complexSubtract(complexMultiply(h22, y1), complexMultiply(h12, y2)), det);
            const xHat2 = complexDivide(complexSubtract(complexMultiply(h11, y2), complexMultiply(h21, y1)), det);
            equalizedPoints.push({ I: xHat1.re, Q: xHat1.im });
            decodedSymbols.push(getNearestIdealSymbol(xHat1.re, xHat1.im));

            if (index + 1 < txSymbols.length) {
                equalizedPoints.push({ I: xHat2.re, Q: xHat2.im });
                decodedSymbols.push(getNearestIdealSymbol(xHat2.re, xHat2.im));
            }
        }

        return { decodedSymbols: decodedSymbols, equalizedPoints: equalizedPoints };
    }

    for (let index = 0; index < txSymbols.length; index++) {
        const freq = safeFrequencies[index] || 0;
        const response = getSpatialBaseResponse(snapshot, freq);
        const tx = toComplexSymbol(txSymbols[index] || idealSymbols[0]);
        const noise = { re: randn_bm() * (noiseStdDev + residual), im: randn_bm() * (noiseStdDev + residual) };
        const y = complexAdd(complexMultiply(response, tx), noise);
        const equalized = complexDivide(y, response);
        equalizedPoints.push({ I: equalized.re, Q: equalized.im });
        decodedSymbols.push(getNearestIdealSymbol(equalized.re, equalized.im));
    }

    return { decodedSymbols: decodedSymbols, equalizedPoints: equalizedPoints };
}

function getOfdmSubcarrierFrequencies(count) {
    const frequencies = [];
    const center = (count - 1) / 2;
    for (let k = 0; k < count; k++) {
        frequencies.push(((k - center) / Math.max(count, 2)) * 0.9);
    }
    return frequencies;
}

function getOfdmGuardInfo(snapshot, cpRatio) {
    const maxDelay = snapshot.taps.reduce((max, tap) => Math.max(max, tap.delay), 0);
    const delaySpreadSamples = Math.max(0, maxDelay * 8);
    const cpSamples = Math.round(64 * cpRatio);
    const shortage = Math.max(0, delaySpreadSamples - cpSamples);
    return {
        cpSamples: cpSamples,
        delaySpreadSamples: delaySpreadSamples,
        shortage: shortage,
        protected: shortage === 0,
        residualLevel: shortage / 64
    };
}

function buildOfdmFrame(frameIndex, numSubcarriers, M) {
    const frame = [];
    for (let k = 0; k < numSubcarriers; k++) {
        frame.push(getSym(frameIndex * numSubcarriers + k, M));
    }
    return frame;
}

function receiveOfdmSymbols(txSymbols, snapshot, noiseStdDev, ofdmConfig, mimoMode, timeSeed) {
    const numSubcarriers = ofdmConfig.numSubcarriers;
    const cpRatio = ofdmConfig.cpRatio;
    const frequencies = getOfdmSubcarrierFrequencies(numSubcarriers);
    const guardInfo = getOfdmGuardInfo(snapshot, cpRatio);
    const frequencyList = txSymbols.map(function (_, index) {
        return frequencies[index % numSubcarriers];
    });
    const spatialResult = simulateSpatialTransmission(txSymbols, snapshot, noiseStdDev, mimoMode || 'siso', frequencyList, timeSeed || 0, guardInfo);

    return {
        decodedSymbols: spatialResult.decodedSymbols,
        equalizedPoints: spatialResult.equalizedPoints,
        guardInfo: guardInfo,
        frequencies: frequencies
    };
}

function buildOfdmTimeSeries(frameIndex, numSubcarriers, snapshot, noiseStdDev, cpRatio, M) {
    const usefulSamples = 64;
    const cpSamples = Math.round(usefulSamples * cpRatio);
    const totalSamples = usefulSamples + cpSamples;
    const displayFrames = 2;
    const txFrames = [];
    for (let frame = 0; frame < displayFrames + 1; frame++) {
        txFrames.push(buildOfdmFrame(frameIndex + frame, numSubcarriers, M));
    }

    const frequencies = getOfdmSubcarrierFrequencies(numSubcarriers);
    const txSamples = [];
    const rxSamples = [];

    function buildUsefulSample(frameSymbols, sampleIndex) {
        let re = 0;
        let im = 0;
        frameSymbols.forEach((symbol, carrierIndex) => {
            const freq = frequencies[carrierIndex] * 0.5;
            const phase = 2 * Math.PI * freq * sampleIndex;
            re += symbol.I * Math.cos(phase) - symbol.Q * Math.sin(phase);
            im += symbol.I * Math.sin(phase) + symbol.Q * Math.cos(phase);
        });
        return { I: re / Math.sqrt(numSubcarriers), Q: im / Math.sqrt(numSubcarriers) };
    }

    for (let frame = 0; frame < displayFrames; frame++) {
        const useful = [];
        for (let n = 0; n < usefulSamples; n++) {
            useful.push(buildUsefulSample(txFrames[frame], n / usefulSamples));
        }
        const symbolSamples = useful.slice(useful.length - cpSamples).concat(useful);
        symbolSamples.forEach(sample => txSamples.push(sample));
    }

    for (let index = 0; index < txSamples.length; index++) {
        let rxI = 0;
        let rxQ = 0;
        snapshot.taps.forEach(tap => {
            const delaySamples = tap.delay * 8;
            const source = txSamples[index - delaySamples];
            if (!source) {
                return;
            }
            const contribution = applyCoefficientToSymbol(source, tap);
            rxI += contribution.I;
            rxQ += contribution.Q;
        });
        rxSamples.push({ I: rxI + randn_bm() * noiseStdDev, Q: rxQ + randn_bm() * noiseStdDev });
    }

    return {
        samples: rxSamples,
        symbolSamples: totalSamples,
        cpSamples: cpSamples
    };
}

function applyCoefficientToSymbol(symbol, coeff) {
    return {
        I: symbol.I * coeff.re - symbol.Q * coeff.im,
        Q: symbol.I * coeff.im + symbol.Q * coeff.re
    };
}

function getFadingCoefficient(mode, time) {
    if (mode === 'rayleigh') {
        const re = 0.7 * Math.sin(0.57 * time) + 0.45 * Math.sin(1.73 * time + 0.8);
        const im = 0.7 * Math.cos(0.41 * time + 0.3) + 0.45 * Math.cos(1.39 * time + 1.1);
        return { re: re / 1.2, im: im / 1.2 };
    }

    if (mode === 'rician') {
        const los = { re: 0.92, im: 0.06 };
        const scatter = {
            re: 0.22 * Math.sin(0.62 * time + 0.15),
            im: 0.22 * Math.cos(0.51 * time + 0.65)
        };
        return { re: los.re + scatter.re, im: los.im + scatter.im };
    }

    return { re: 1, im: 0 };
}

function buildChannelSnapshot(profileKey, time) {
    const profile = channelProfiles[profileKey] || channelProfiles.awgn;
    const fading = getFadingCoefficient(profile.fading, time);
    const taps = profile.taps.map(tap => {
        const tapCoeff = { re: tap.re, im: tap.im };
        const coeff = profile.fading === 'none' ? tapCoeff : complexMultiply(tapCoeff, fading);
        return { delay: tap.delay, re: coeff.re, im: coeff.im };
    });
    const mainGain = complexMagnitude(taps[0] || { re: 1, im: 0 });
    const echoEnergy = taps.slice(1).reduce((sum, tap) => sum + complexMagnitude(tap), 0);
    return { profile, taps, fading, mainGain, echoEnergy };
}

function getSym(idx, M) {
    const seed = Math.abs(Math.sin(idx * 12345.6789));
    return idealSymbols[Math.floor(seed * M)] || idealSymbols[0];
}

function getNearestIdealSymbol(I, Q) {
    let best = idealSymbols[0];
    let bestDistance = Infinity;

    idealSymbols.forEach(symbol => {
        const dI = I - symbol.I;
        const dQ = Q - symbol.Q;
        const distance = dI * dI + dQ * dQ;
        if (distance < bestDistance) {
            bestDistance = distance;
            best = symbol;
        }
    });

    return best;
}

function sampleReceivedSymbol(symIndex, M, snapshot, noiseStdDev) {
    let rxI = 0;
    let rxQ = 0;

    snapshot.taps.forEach(tap => {
        const source = getSym(symIndex - tap.delay, M);
        const contribution = applyCoefficientToSymbol(source, tap);
        rxI += contribution.I;
        rxQ += contribution.Q;
    });

    rxI += randn_bm() * noiseStdDev;
    rxQ += randn_bm() * noiseStdDev;

    return { I: rxI, Q: rxQ };
}

function sampleWaveformAt(tSym, M, filterType, alpha, snapshot) {
    let valI = 0;
    let valQ = 0;

    if (filterType === 'rect') {
        snapshot.taps.forEach(tap => {
            const delayedTime = tSym - tap.delay;
            const source = getSym(Math.floor(delayedTime), M);
            const contribution = applyCoefficientToSymbol(source, tap);
            valI += contribution.I;
            valQ += contribution.Q;
        });
        return { I: valI, Q: valQ };
    }

    snapshot.taps.forEach(tap => {
        const delayedTime = tSym - tap.delay;
        for (let i = -4; i <= 4; i++) {
            const symIdx = Math.floor(delayedTime) + i;
            const source = getSym(symIdx, M);
            const pulse = rrc(delayedTime - symIdx - 0.5, alpha, 1.0);
            const contribution = applyCoefficientToSymbol(source, tap);
            valI += contribution.I * pulse;
            valQ += contribution.Q * pulse;
        }
    });

    return { I: valI, Q: valQ };
}

function channelFrequencyResponseMagnitude(taps, fNorm) {
    let re = 0;
    let im = 0;

    taps.forEach(tap => {
        const phase = -2 * Math.PI * fNorm * tap.delay;
        const cosPhase = Math.cos(phase);
        const sinPhase = Math.sin(phase);
        re += tap.re * cosPhase - tap.im * sinPhase;
        im += tap.re * sinPhase + tap.im * cosPhase;
    });

    return Math.max(0.12, Math.hypot(re, im));
}

function describeChannelCondition(snapshot, snrDb, serPercent, waveformMode, guardInfo) {
    let stateLabel = 'Confortable';
    let stateNote = snapshot.profile.note + ' La constellation reste bien séparée et l’œil garde une bonne ouverture.';

    if (snapshot.mainGain < 0.45 || snrDb < 9 || serPercent > 12 || (snapshot.profile === channelProfiles.isi && serPercent > 6)) {
        stateLabel = 'Critique';
        stateNote = snapshot.profile.note + ' La marge de décision devient faible et les erreurs symboles augmentent nettement.';
    } else if (snapshot.echoEnergy > 0.2 || snapshot.profile !== channelProfiles.awgn || snrDb < 18 || serPercent > 2) {
        stateLabel = 'Sensible';
        stateNote = snapshot.profile.note + ' Le canal reste exploitable mais la dispersion et le fading réduisent la robustesse.';
    }

    if (waveformMode === 'ofdm' && guardInfo) {
        if (guardInfo.protected) {
            stateNote += ' Le préfixe cyclique couvre l’étalement du canal : l’égalisation fréquentielle suffit souvent à restaurer les sous-porteuses.';
        } else {
            stateNote += ' Le préfixe cyclique est trop court : une partie de l’ISI redevient visible malgré l’égalisation OFDM.';
            if (stateLabel === 'Confortable') {
                stateLabel = 'Sensible';
            }
        }
    }

    return { stateLabel, stateNote };
}

dspPresetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const preset = dspPresets[button.dataset.dspPreset];
        if (!preset) {
            return;
        }

        ui.systemMode.value = preset.system || 'manual';
        ui.coverageScenario.value = preset.coverage || ui.coverageScenario.value;
        ui.media.value = preset.media;
        ui.dist.value = preset.dist;
        ui.channelProfile.value = preset.channel;
        ui.waveformMode.value = preset.waveform;
        ui.mimoMode.value = preset.mimo || 'siso';
        ui.fecType.value = preset.fec;
        ui.ofdmSubcarriers.value = preset.ofdmSubcarriers;
        ui.ofdmCp.value = preset.ofdmCp;
        ui.mod.value = preset.mod;
        ui.baud.value = preset.baud;
        ui.filter.value = preset.filter;
        ui.alpha.value = preset.alpha;
    });
});

ui.btnPause.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    ui.btnPause.textContent = state.isPaused ? '▶ Reprendre' : '⏸ Pause / Mesures';
    if (state.isPaused) ui.btnPause.classList.add('paused');
    else ui.btnPause.classList.remove('paused');
});

function drawRectAxes(ctx, width, height, options) {
    const left = options.left || 50;
    const right = options.right || 16;
    const top = options.top || 16;
    const bottom = options.bottom || 30;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const gridColor = options.gridColor || 'rgba(148,163,184,0.14)';
    const axisColor = options.axisColor || 'rgba(226,232,240,0.8)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    (options.xTicks || []).forEach(tick => {
        const x = left + tick.pos * plotW;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, top + plotH);
        ctx.stroke();
        ctx.fillStyle = axisColor;
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tick.label, x, height - 6);
    });

    (options.yTicks || []).forEach(tick => {
        const y = top + tick.pos * plotH;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(left + plotW, y);
        ctx.stroke();
        ctx.fillStyle = axisColor;
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(tick.label, left - 6, y + 3);
    });

    ctx.setLineDash([]);
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, top + plotH);
    ctx.lineTo(left + plotW, top + plotH);
    ctx.stroke();

    ctx.fillStyle = axisColor;
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.xLabel, left + plotW / 2, height - 18);
    ctx.save();
    ctx.translate(16, top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(options.yLabel, 0, 0);
    ctx.restore();

    return { left, right, top, bottom, plotW, plotH };
}

function drawConstellationAxes(ctx, width, height) {
    ctx.strokeStyle = 'rgba(148,163,184,0.14)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [width / 2 - 100, width / 2, width / 2 + 100].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 16);
        ctx.lineTo(x, height - 30);
        ctx.stroke();
    });
    [height / 2 - 100, height / 2, height / 2 + 100].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(44, y);
        ctx.lineTo(width - 16, y);
        ctx.stroke();
    });
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(226,232,240,0.8)';
    ctx.beginPath();
    ctx.moveTo(44, height / 2);
    ctx.lineTo(width - 16, height / 2);
    ctx.moveTo(width / 2, 16);
    ctx.lineTo(width / 2, height - 30);
    ctx.stroke();

    ctx.fillStyle = 'rgba(226,232,240,0.85)';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('-1', width / 2 - 100, height - 6);
    ctx.fillText('0', width / 2, height - 6);
    ctx.fillText('+1', width / 2 + 100, height - 6);
    ctx.fillText('I (u.a.)', width / 2, height - 18);
    ctx.textAlign = 'right';
    ctx.fillText('+1', 40, height / 2 - 100 + 3);
    ctx.fillText('0', 40, height / 2 + 3);
    ctx.fillText('-1', 40, height / 2 + 100 + 3);
    ctx.save();
    ctx.translate(14, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Q (u.a.)', 0, 0);
    ctx.restore();
}

function render() {
    if (!state.isPaused) {
        state.time += 0.05;
    }

    const dist = +ui.dist.value;
    const systemMode = ui.systemMode.value;
    const coverageScenario = ui.coverageScenario.value;
    const schedulerMode = ui.schedulerMode.value;
    const schedulerPolicy = ui.schedulerPolicy.value;
    const schedulerFrameIndex = Math.floor(state.time * 10);
    let mediaKey = ui.media.value;
    let profileKey = ui.channelProfile.value;
    let waveformMode = ui.waveformMode.value;
    let mimoMode = ui.mimoMode.value;
    let fecKey = ui.fecType.value;
    let numSubcarriers = parseInt(ui.ofdmSubcarriers.value, 10);
    let cpRatio = (+ui.ofdmCp.value) / 100;
    let M = +ui.mod.value;
    const Rs = +ui.baud.value;
    let filterType = ui.filter.value;
    let alpha = +ui.alpha.value;
    let coverageProfile = null;
    let mcsProfile = null;

    if (systemMode === '5g') {
        coverageProfile = fiveGProfiles[coverageScenario] || fiveGProfiles.good;
        mediaKey = 'radio';
        profileKey = coverageProfile.channelFallback;
        waveformMode = coverageProfile.waveform;
        filterType = 'rrc';
        alpha = coverageProfile.alpha;
        numSubcarriers = parseInt(coverageProfile.subcarriers, 10);
        cpRatio = coverageProfile.cp / 100;
    }

    const media = phys[mediaKey];
    const channel = buildChannelSnapshot(profileKey, state.time * 1.4 + dist * 0.03);
    const attenuation = media.attBase + (dist * media.attKm);
    const fadingGainDb = 20 * Math.log10(Math.max(channel.mainGain, 0.18));
    const scenarioBias = coverageProfile ? coverageProfile.snrBias : 0;
    const baseScenarioSnr = clamp(45 - attenuation - channel.profile.snrPenalty + fadingGainDb + scenarioBias, 0, 45);

    if (systemMode === '5g') {
        mcsProfile = getMcsForSnr(baseScenarioSnr);
        M = +mcsProfile.mod;
        fecKey = mcsProfile.fec;
        mimoMode = mcsProfile.mimo;
    }

    const fecProfile = fecProfiles[fecKey] || fecProfiles.none;
    const waveformProfile = waveformProfiles[waveformMode] || waveformProfiles.single;
    const mimoProfile = mimoProfiles[mimoMode] || mimoProfiles.siso;
    const ofdmConfig = { numSubcarriers: numSubcarriers, cpRatio: cpRatio };

    const bitsPerSym = Math.log2(M);
    const Rb = Rs * bitsPerSym;
    const lineRb = Rb * mimoProfile.streams;
    const usefulRb = Rb * fecProfile.codeRate * mimoProfile.streams * (waveformMode === 'ofdm' ? (1 / (1 + cpRatio)) : 1);
    const modNames = { 2: 'BPSK', 4: 'QPSK', 16: '16-QAM', 64: '64-QAM' };

    const baseSNR = 45 - attenuation + scenarioBias;
    const SNR_dB = clamp(baseSNR - channel.profile.snrPenalty + fadingGainDb, 0, 45);
    const SNR_linear = Math.pow(10, SNR_dB / 10);
    const noiseStdDev = Math.sqrt((1 / Math.max(SNR_linear, 1e-6)) / 2);
    const schedulerSnapshot = computeSchedulerSnapshot(baseScenarioSnr, schedulerMode, schedulerPolicy, schedulerFrameIndex);

    const bandwidth = waveformMode === 'ofdm'
        ? Rs * (coverageProfile ? coverageProfile.bandwidthFactor : 1.1)
        : (filterType === 'rrc' ? Rs * (1 + alpha) : Rs * 10);
    const specEff = usefulRb / bandwidth;
    const ebN0Db = SNR_dB + 10 * Math.log10(Math.max(bandwidth / Math.max(Rb, 0.001), 0.001));

    ui.vDist.textContent = (mediaKey === 'sat' ? dist * 700 + 35000 : dist) + ' km';
    ui.vBaud.textContent = Rs + ' kBd';
    ui.vAlpha.textContent = alpha.toFixed(1);
    ui.vSNR.textContent = SNR_dB.toFixed(1) + ' dB';
    ui.vRb.textContent = lineRb.toFixed(1) + ' kb/s';
    ui.vSpecEff.textContent = (waveformMode === 'single' && filterType === 'rect' ? '< ' : '') + specEff.toFixed(2) + ' b/s/Hz';
    ui.vModName.textContent = modNames[M] || (M + '-QAM');
    ui.vChannelProfile.textContent = channel.profile.label;
    ui.vCoverageScenario.textContent = systemMode === '5g' ? ((coverageProfile && coverageProfile.label) || '5G-like') : 'Libre';
    ui.vSchedulerPolicy.textContent = schedulerSnapshot ? schedulerSnapshot.policy.label : 'Aucune';
    ui.vWaveformMode.textContent = waveformProfile.label;
    ui.vMimoMode.textContent = mimoProfile.label;
    ui.vFecType.textContent = fecProfile.label;
    ui.vOfdmCp.textContent = Math.round(cpRatio * 100) + ' %';
    ui.constLabel.textContent = waveformMode === 'ofdm'
        ? ('Sous-porteuses OFDM après canal, FFT et égalisation simple' + (mimoMode === 'mimo22' ? ' (2 flux spatiaux)' : ''))
        : (mimoMode === 'siso' ? channel.profile.constLabel : ('Réception I/Q après combinaison/égalisation spatiale — ' + mimoProfile.label));
    ui.eyeLabel.textContent = waveformMode === 'ofdm'
        ? 'Fenêtre OFDM : le préfixe cyclique absorbe une partie des échos si sa durée est suffisante'
        : (mimoMode === 'mimo22'
            ? 'Vue temporelle d’un flux représentatif après séparation spatiale ; la robustesse dépend du conditionnement du canal 2x2'
            : channel.profile.eyeLabel);
    ui.media.disabled = systemMode === '5g';
    ui.channelProfile.disabled = systemMode === '5g';
    ui.coverageScenario.disabled = false;
    ui.waveformMode.disabled = systemMode === '5g';
    ui.mimoMode.disabled = systemMode === '5g';
    ui.fecType.disabled = systemMode === '5g';
    ui.mod.disabled = systemMode === '5g';
    ui.filter.disabled = systemMode === '5g' || waveformMode === 'ofdm';
    ui.alpha.disabled = systemMode === '5g' || filterType !== 'rrc' || waveformMode === 'ofdm';
    ui.ofdmSubcarriers.disabled = false;
    ui.ofdmCp.disabled = false;

    const wC = 700;
    const hC = 260;

    if (!state.isPaused) {
        ctxConst.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctxConst.fillRect(0, 0, wC, hC);
    }
    drawConstellationAxes(ctxConst, wC, hC);

    idealSymbols = [];
    symbolLookupByBits = {};
    let scale = 1;
    if (M === 2) scale = 1;
    else if (M === 4) scale = Math.sqrt(1 / 2);
    else if (M === 16) scale = Math.sqrt(1 / 10);
    else if (M === 64) scale = Math.sqrt(1 / 42);

    const levels = Math.sqrt(M);
    for (let i = 0; i < levels; i++) {
        for (let j = 0; j < (M === 2 ? 1 : levels); j++) {
            const I = (M === 2) ? (i === 0 ? -1 : 1) : (2 * i - levels + 1) * scale;
            const Q = (M === 2) ? 0 : (2 * j - levels + 1) * scale;
            const bits = idealSymbols.length.toString(2).padStart(bitsPerSym, '0');
            const symbol = { I, Q, bits: bits };
            idealSymbols.push(symbol);
            symbolLookupByBits[bits] = symbol;
            ctxConst.fillStyle = 'rgba(255,255,255,0.8)';
            ctxConst.fillRect(wC / 2 + I * 100 - 2, hC / 2 - Q * 100 - 2, 4, 4);
        }
    }

    const fecMetrics = simulateFecMetrics(bitsPerSym, channel, noiseStdDev, fecKey, waveformMode, ofdmConfig, mimoMode, state.time * 0.9);

    let errors = 0;
    let numSymbols = state.isPaused ? 0 : 200;
    let ofdmGuardInfo = waveformMode === 'ofdm' ? getOfdmGuardInfo(channel, cpRatio) : null;
    ctxConst.fillStyle = SNR_dB > 15 ? 'rgba(56, 189, 248, 0.72)' : 'rgba(251, 191, 36, 0.72)';

    if (waveformMode === 'ofdm') {
        const numFrames = state.isPaused ? 0 : 24;
        numSymbols = numFrames * numSubcarriers;
        for (let frame = 0; frame < numFrames; frame++) {
            const txFrame = buildOfdmFrame(Math.floor(state.time * 8) + frame, numSubcarriers, M);
            const received = receiveOfdmSymbols(txFrame, channel, noiseStdDev, ofdmConfig, mimoMode, state.time + frame * 0.1);
            ofdmGuardInfo = received.guardInfo;
            received.equalizedPoints.forEach(point => {
                ctxConst.fillRect(wC / 2 + point.I * 100, hC / 2 - point.Q * 100, 2, 2);
            });
            received.decodedSymbols.forEach((decoded, index) => {
                if (decoded !== txFrame[index]) {
                    errors++;
                }
            });
        }
    } else {
        const txSymbols = [];
        for (let k = 0; k < numSymbols; k++) {
            txSymbols.push(getSym(Math.floor(state.time * 120) + k, M));
        }
        const received = simulateSpatialTransmission(txSymbols, channel, noiseStdDev, mimoMode, null, state.time, null);
        received.equalizedPoints.forEach(point => {
            ctxConst.fillRect(wC / 2 + point.I * 100, hC / 2 - point.Q * 100, 2, 2);
        });
        received.decodedSymbols.forEach((decoded, index) => {
            if (decoded !== txSymbols[index]) {
                errors++;
            }
        });
    }

    const instantSER = (errors / Math.max(1, numSymbols)) * 100;
    if (!state.isPaused) {
        ui.vSER.textContent = instantSER.toFixed(2) + ' %';
    }
    ui.vSER.style.color = instantSER > 0 ? 'var(--err)' : 'var(--rx)';
    ui.vBERRaw.textContent = formatBer(fecMetrics.rawBer);
    ui.vBERFec.textContent = formatBer(fecMetrics.correctedBer);
    ui.vBERRaw.style.color = fecMetrics.rawBer > 0.02 ? 'var(--err)' : 'var(--warn)';
    ui.vBERFec.style.color = fecMetrics.correctedBer > 0.01 ? 'var(--err)' : 'var(--rx)';

    const channelCondition = describeChannelCondition(channel, SNR_dB, instantSER, waveformMode, ofdmGuardInfo);
    ui.kpiEbN0.textContent = ebN0Db.toFixed(1) + ' dB';
    ui.kpiBandwidth.textContent = bandwidth.toFixed(1) + ' kHz';
    ui.kpiState.textContent = channelCondition.stateLabel;
    ui.kpiStateNote.textContent = channelCondition.stateNote + (fecKey === 'none' ? '' : ' Le FEC agit après décision : il réduit le BER utile sans modifier la constellation ou l’œil bruts.');
    ui.kpiCodeRate.textContent = fecProfile.codeRate.toFixed(2);
    ui.kpiCodeRateNote.textContent = 'Débit utile ≈ ' + usefulRb.toFixed(1) + ' kb/s. ' + fecProfile.note;
    ui.kpiWaveformMode.textContent = waveformProfile.label;
    ui.kpiWaveformNote.textContent = waveformMode === 'ofdm'
        ? waveformProfile.note + ' CP = ' + Math.round(cpRatio * 100) + ' %, ' + numSubcarriers + ' sous-porteuses.'
        : waveformProfile.note;
    ui.kpiMimoMode.textContent = mimoProfile.label;
    ui.kpiMimoNote.textContent = mimoProfile.note;
    ui.kpiMimoGain.textContent = mimoProfile.gainLabel;
    ui.kpiMimoGainNote.textContent = mimoMode === 'siso'
        ? 'Référence sans gain spatial : ni diversité, ni multiplexage simultané.'
        : (mimoMode === 'simo12'
            ? 'La combinaison 1x2 améliore surtout la marge de décision et réduit le BER.'
            : 'Le 2x2 augmente le débit utile par flux spatiaux, mais la séparation devient plus sensible au canal et au bruit.');
    ui.kpiMcs.textContent = systemMode === '5g' && mcsProfile ? mcsProfile.id : 'Manuel';
    ui.kpiMcsNote.textContent = systemMode === '5g' && mcsProfile
        ? (mcsProfile.label + ' sélectionné pour ' + coverageProfile.label.toLowerCase() + ' à SNR radio ≈ ' + baseScenarioSnr.toFixed(1) + ' dB.')
        : 'Le MCS suit directement vos réglages manuels de modulation, FEC et architecture spatiale.';
    ui.kpiCoverageState.textContent = systemMode === '5g' && coverageProfile ? coverageProfile.label : 'Libre';
    ui.kpiCoverageNote.textContent = systemMode === '5g' && coverageProfile
        ? (coverageScenario === 'good'
            ? 'Bonne couverture : la marge radio favorise des MCS plus denses, souvent avec `MIMO 2x2`.'
            : 'Cell edge : la marge radio est plus faible, l’adaptation privilégie robustesse, diversité et codage plus protecteur.')
        : 'Choisissez librement les paramètres pour construire votre propre scénario radio.';
    renderSchedulerSnapshot(schedulerSnapshot);
    renderRadioBlocks(schedulerSnapshot);

    if (waveformMode === 'ofdm' && ofdmGuardInfo) {
        const cpMargin = ofdmGuardInfo.cpSamples - ofdmGuardInfo.delaySpreadSamples;
        ui.kpiCpGuard.textContent = ofdmGuardInfo.protected ? ('+' + cpMargin + ' éch') : ('-' + Math.abs(cpMargin) + ' éch');
        ui.kpiCpGuardNote.textContent = ofdmGuardInfo.protected
            ? 'Le préfixe cyclique couvre les échos principaux : l’ISI résiduelle reste faible après FFT.'
            : 'Le préfixe cyclique est plus court que l’étalement du canal : une ISI résiduelle persiste.';
    } else {
        ui.kpiCpGuard.textContent = '—';
        ui.kpiCpGuardNote.textContent = 'Le préfixe cyclique n’est utilisé qu’en mode OFDM.';
    }

    let fecGainLabel = 'Aucun';
    let fecGainNote = fecKey === 'none'
        ? 'Pas de redondance ajoutée : le BER utile suit directement les erreurs décidées.'
        : 'Comparer BER brut et BER corrigé pour estimer le gain de protection obtenu.';

    if (fecKey !== 'none') {
        if (fecMetrics.rawBer === 0 && fecMetrics.correctedBer === 0) {
            fecGainLabel = 'Canal propre';
            fecGainNote = 'Le canal est déjà très favorable ; le coût principal du FEC devient la redondance.';
        } else if (fecMetrics.correctedBer === 0) {
            fecGainLabel = 'Correction totale';
            fecGainNote = 'Toutes les erreurs simulées ont été corrigées sur cette fenêtre de mesure.';
        } else {
            const gain = fecMetrics.rawBer / Math.max(fecMetrics.correctedBer, 1e-6);
            fecGainLabel = gain.toFixed(1) + '×';
            fecGainNote = 'Gain observé sur ' + fecMetrics.payloadBits + ' bits utiles et ' + fecMetrics.encodedBits + ' bits transmis.';
        }

        if (fecKey === 'hamming74' && fecMetrics.correctedWords > 0) {
            fecGainNote += ' Mots corrigés : ' + fecMetrics.correctedWords + '.';
        }
    }

    ui.kpiFecGain.textContent = fecGainLabel;
    ui.kpiFecGainNote.textContent = fecGainNote;
    ui.berLabel.textContent = 'Modulation ' + (modNames[M] || (M + '-QAM')) + ' • Eb/N0 courant ' + ebN0Db.toFixed(1) + ' dB • marqueurs brut/utiles';
    ui.historyLabel.textContent = 'Fenêtre glissante : SNR = ' + SNR_dB.toFixed(1) + ' dB • BER utile = ' + formatBer(fecMetrics.correctedBer) + ' • débit utile = ' + usefulRb.toFixed(1) + ' kb/s';

    if (!state.isPaused || !state.history.length) {
        pushLinkHistory(SNR_dB, Math.max(fecMetrics.correctedBer, 1e-5), usefulRb);
    }

    const wS = 700;
    const hS = 260;
    ctxSpec.clearRect(0, 0, wS, hS);
    drawRectAxes(ctxSpec, wS, hS, {
        xTicks: [
            { pos: 0, label: '-2' },
            { pos: 0.25, label: '-1' },
            { pos: 0.5, label: '0' },
            { pos: 0.75, label: '+1' },
            { pos: 1, label: '+2' }
        ],
        yTicks: [
            { pos: 0, label: '0 dB' },
            { pos: 1 / 3, label: '-20 dB' },
            { pos: 2 / 3, label: '-40 dB' },
            { pos: 1, label: '-60 dB' }
        ],
        xLabel: 'Fréquence normalisée (f/Rs)',
        yLabel: 'DSP (dB)',
        axisColor: 'rgba(226,232,240,0.85)',
        gridColor: 'rgba(148,163,184,0.14)'
    });

    ctxSpec.beginPath();
    ctxSpec.strokeStyle = '#38bdf8';
    ctxSpec.lineWidth = 2;

    const noiseFloorDB = -Math.max(10, SNR_dB + 10);
    const ofdmFrequencies = getOfdmSubcarrierFrequencies(numSubcarriers);

    for (let x = 0; x < wS; x++) {
        const fNorm = (x - wS / 2) / (wS / 4);
        let psd = 0;

        if (waveformMode === 'ofdm') {
            let psdLinear = 0;
            ofdmFrequencies.forEach(freq => {
                const response = channelFrequencyResponseMagnitude(channel.taps, freq);
                const shape = Math.pow(sinc((fNorm - freq) * numSubcarriers * 1.2), 2);
                psdLinear += Math.max(0, shape) * response * response;
            });
            psd = 10 * Math.log10(psdLinear + 1e-10);
        } else {
            if (filterType === 'rect') {
                const s = sinc(fNorm);
                psd = 10 * Math.log10(s * s + 1e-10);
            } else {
                const absF = Math.abs(fNorm);
                if (alpha === 0) {
                    const s = sinc(fNorm);
                    psd = 10 * Math.log10(s * s + 1e-10);
                } else if (absF <= (1 - alpha) / 2) psd = 0;
                else if (absF <= (1 + alpha) / 2) {
                    const val = 0.5 * (1 + Math.cos((Math.PI / alpha) * (absF - (1 - alpha) / 2)));
                    psd = 10 * Math.log10(val + 1e-10);
                } else {
                    psd = -100;
                }
            }
        }

        if (waveformMode !== 'ofdm') {
            psd += 20 * Math.log10(channelFrequencyResponseMagnitude(channel.taps, fNorm * 0.5));
        }
        psd = Math.max(psd, noiseFloorDB + (Math.random() * 2));
        const y = 20 - (psd / 60) * (hS - 40);

        if (x === 0) ctxSpec.moveTo(x, y);
        else ctxSpec.lineTo(x, y);
    }
    ctxSpec.stroke();

    drawBerCurve(ctxBer, M, fecKey, ebN0Db, Math.max(fecMetrics.rawBer, 1e-5), Math.max(fecMetrics.correctedBer, 1e-5));
    drawLinkHistory(ctxHistory, state.history);

    const wT = 700;
    const hT = 260;
    ctxTime.clearRect(0, 0, wT, hT);
    drawRectAxes(ctxTime, wT, hT, {
        xTicks: [
            { pos: 0, label: '0' },
            { pos: 0.25, label: '4' },
            { pos: 0.5, label: '8' },
            { pos: 0.75, label: '12' },
            { pos: 1, label: '16' }
        ],
        yTicks: [
            { pos: 0.15, label: '+1 u.a.' },
            { pos: 0.5, label: '0' },
            { pos: 0.85, label: '-1 u.a.' }
        ],
        xLabel: 'Temps (Ts)',
        yLabel: 'Amplitude (u.a.)',
        axisColor: 'rgba(30,41,59,0.8)',
        gridColor: 'rgba(148,163,184,0.15)'
    });

    ctxTime.beginPath();
    ctxTime.strokeStyle = '#38bdf8';
    const pathQ = new Path2D();

    if (!state.isPaused) {
        ctxEye.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctxEye.fillRect(0, 0, wT, hT);
    }
    const eyeLayout = drawRectAxes(ctxEye, wT, hT, {
        xTicks: [
            { pos: 0, label: '0' },
            { pos: 0.5, label: '1' },
            { pos: 1, label: '2' }
        ],
        yTicks: [
            { pos: 0.15, label: '+1 u.a.' },
            { pos: 0.5, label: '0' },
            { pos: 0.85, label: '-1 u.a.' }
        ],
        xLabel: 'Temps (Ts)',
        yLabel: 'Amplitude (u.a.)',
        axisColor: 'rgba(226,232,240,0.85)',
        gridColor: 'rgba(148,163,184,0.14)'
    });

    if (waveformMode === 'ofdm') {
        const timeSeries = buildOfdmTimeSeries(Math.floor(state.time * 4), numSubcarriers, channel, noiseStdDev, cpRatio, M);
        const samples = timeSeries.samples;
        samples.forEach((sample, index) => {
            const x = (index / Math.max(samples.length - 1, 1)) * wT;
            const yI = hT / 2 - sample.I * 40;
            const yQ = hT / 2 - sample.Q * 40;
            if (index === 0) {
                ctxTime.moveTo(x, yI);
                pathQ.moveTo(x, yQ);
            } else {
                ctxTime.lineTo(x, yI);
                pathQ.lineTo(x, yQ);
            }
        });

        const cpBoundary = eyeLayout.left + (timeSeries.cpSamples / Math.max(timeSeries.symbolSamples, 1)) * eyeLayout.plotW;
        for (let frame = 0; frame < Math.floor(samples.length / timeSeries.symbolSamples); frame++) {
            const offset = frame * timeSeries.symbolSamples;
            ctxEye.beginPath();
            for (let i = 0; i < timeSeries.symbolSamples; i++) {
                const sample = samples[offset + i];
                if (!sample) {
                    continue;
                }
                const x = eyeLayout.left + (i / Math.max(timeSeries.symbolSamples - 1, 1)) * eyeLayout.plotW;
                const y = eyeLayout.top + eyeLayout.plotH / 2 - sample.I * 40;
                if (i === 0) {
                    ctxEye.moveTo(x, y);
                } else {
                    ctxEye.lineTo(x, y);
                }
            }
            ctxEye.strokeStyle = ofdmGuardInfo && ofdmGuardInfo.protected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
            ctxEye.stroke();
        }
        ctxEye.strokeStyle = ofdmGuardInfo && ofdmGuardInfo.protected ? 'rgba(34, 197, 94, 0.9)' : 'rgba(220, 38, 38, 0.9)';
        ctxEye.setLineDash([6, 4]);
        ctxEye.beginPath();
        ctxEye.moveTo(cpBoundary, eyeLayout.top);
        ctxEye.lineTo(cpBoundary, eyeLayout.top + eyeLayout.plotH);
        ctxEye.stroke();
        ctxEye.setLineDash([]);
    } else {
        const pixelsPerSym = 40;
        const scrollOffset = state.time * 50;

        for (let x = 0; x < wT; x += 2) {
            const tSym = (x + scrollOffset) / pixelsPerSym;
            const sample = sampleWaveformAt(tSym, M, filterType, alpha, channel);
            const valI = sample.I + randn_bm() * noiseStdDev;
            const valQ = sample.Q + randn_bm() * noiseStdDev;

            const yI = hT / 2 - valI * 40;
            const yQ = hT / 2 - valQ * 40;

            if (x === 0) {
                ctxTime.moveTo(x, yI);
                pathQ.moveTo(x, yQ);
            } else {
                ctxTime.lineTo(x, yI);
                pathQ.lineTo(x, yQ);
            }

            if (!state.isPaused) {
                const eyeX = (tSym % 2) * (wT / 2);
                if (eyeX <= 2 || x === 0) {
                    ctxEye.beginPath();
                    ctxEye.moveTo(eyeX, yI);
                } else {
                    ctxEye.lineTo(eyeX, yI);
                    ctxEye.strokeStyle = SNR_dB > 20 && channel.echoEnergy < 0.2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                    ctxEye.stroke();
                    ctxEye.beginPath();
                    ctxEye.moveTo(eyeX, yI);
                }
            }
        }
    }

    ctxTime.stroke();
    ctxTime.strokeStyle = '#10b981';
    ctxTime.stroke(pathQ);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
