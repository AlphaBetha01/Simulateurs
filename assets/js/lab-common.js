(function (global) {
  const RECENT_PAGES_KEY = 'labRecentPagesV1';
  const LAB_PROGRESS_KEY = 'labProgressV1';
  const LAB_QUIZ_RESULTS_KEY = 'labQuizResultsV1';
  const LAB_TEACHER_MODE_KEY = 'labTeacherModeV1';
  const LAB_PROFILE_KEY = 'labProfileV1';
  const LAB_NOTEBOOK_KEY = 'labNotebookV1';
  const LAB_STRUCTURE = {
    analogique: {
      title: 'Cha\u00eene analogique',
      pages: [
        { id: 'analogique-emetteur', label: '\u00c9metteur AM / FM', href: 'pages/analogique/Emetteur.html' },
        { id: 'analogique-amplificateur', label: 'Amplificateur', href: 'pages/analogique/Amplificateur.html' },
        { id: 'analogique-recepteur', label: 'R\u00e9cepteur', href: 'pages/analogique/R\u00e9cepteur.html' }
      ],
      bridges: [
        { label: 'Basculer vers le CAN', href: 'pages/numerisation/CAN.html' },
        { label: 'Voir la transmission compl\u00e8te', href: 'pages/transmission/Transmission.html' }
      ]
    },
    numerisation: {
      title: 'Num\u00e9risation et PCM',
      pages: [
        { id: 'numerisation-can', label: 'Convertisseur CAN', href: 'pages/numerisation/CAN.html' },
        { id: 'numerisation-codage-ligne', label: 'Codage de Ligne', href: 'pages/numerisation/CodageLigne.html' },
        { id: 'multiplexage-e1', label: 'Multitrame E1', href: 'pages/multiplexage/Simulateur_E12.html' }
      ],
      bridges: [
        { label: 'Poursuivre vers les modulations', href: 'pages/modulations/Simulateur 2.html' },
        { label: 'Comparer E1 / T1', href: 'pages/multiplexage/Simulateur_MUX.html' },
        { label: 'Voir les codes de ligne', href: 'pages/numerisation/CodageLigne.html' }
      ]
    },
    modulations: {
      title: 'Modulations num\u00e9riques',
      pages: [
        { id: 'modulations-symbol', label: 'Analyse d\u2019un symbole', href: 'pages/modulations/Simulateur 2.html?mode=symbol&num=1' },
        { id: 'modulations-sequence', label: 'S\u00e9quence de symboles', href: 'pages/modulations/Simulateur 2.html' },
        { id: 'modulations-dashboard', label: 'Tableau de bord BER', href: 'pages/modulations/Tableau de Bord Modulations Num\u00e9riques.html' }
      ],
      bridges: [
        { label: 'Tester la cha\u00eene de transmission', href: 'pages/transmission/Transmission.html' },
        { label: 'Revenir au CAN', href: 'pages/numerisation/CAN.html' }
      ]
    },
    transmission: {
      title: 'Transmission sur canal',
      pages: [
        { id: 'transmission-base', label: 'Transmission p\u00e9dagogique', href: 'pages/transmission/Transmission.html' },
        { id: 'transmission-dsp', label: 'Traitement du signal avanc\u00e9', href: 'pages/transmission/Transmission Num et Traite Sgnal.html' }
      ],
      bridges: [
        { label: 'Comparer les modulations', href: 'pages/modulations/Tableau de Bord Modulations Num\u00e9riques.html' },
        { label: 'Passer au multiplexage', href: 'pages/multiplexage/MUX.html' }
      ]
    },
    multiplexage: {
      title: 'Multiplexage et r\u00e9seaux',
      pages: [
        { id: 'multiplexage-e1', label: 'Multitrame E1', href: 'pages/multiplexage/Simulateur_E12.html' },
        { id: 'multiplexage-compare', label: 'Comparatif E1 / T1', href: 'pages/multiplexage/Simulateur_MUX.html' },
        { id: 'multiplexage-pcm', label: 'PCM + TDM avec audio', href: 'pages/multiplexage/MUX.html?mode=pcm' },
        { id: 'multiplexage-complet', label: 'Laboratoire r\u00e9seau complet', href: 'pages/multiplexage/MUX.html' }
      ],
      bridges: [
        { label: 'Repartir de la cha\u00eene analogique', href: 'pages/analogique/Emetteur.html' },
        { label: 'Voir la transmission num\u00e9rique', href: 'pages/transmission/Transmission.html' }
      ]
    }
  };

  const LAB_PAGE_GUIDE_SUPPLEMENTS = {
    'analogique-emetteur': {
      exercises: [
        {
          title: 'Comparer robustesse et coût spectral',
          prompt: 'Expliquez dans quel contexte télécom vous choisiriez l’AM plutôt que la FM, puis l’inverse.',
          correction: [
            'L’AM reste simple à générer et à démoduler dans des montages pédagogiques ou à faible complexité.',
            'La FM devient pertinente quand on cherche une meilleure robustesse aux parasites d’amplitude.',
            'Le choix final doit comparer simplicité d’architecture, robustesse attendue et bande disponible.'
          ]
        }
      ],
      quiz: [
        {
          question: 'En AM, si la fréquence du message augmente à porteuse fixe, que deviennent les bandes latérales ? ',
          options: ['Elles s’éloignent de la porteuse', 'Elles disparaissent', 'Elles deviennent du bruit'],
          answer: 0,
          explanation: 'Les bandes latérales se placent autour de la porteuse à ± fm.'
        },
        {
          question: 'Quel inconvénient principal de la FM accepte-t-on souvent pour gagner en robustesse ? ',
          options: ['Une bande plus large', 'Une disparition de la porteuse', 'Une baisse obligatoire de la fréquence message'],
          answer: 0,
          explanation: 'La FM consomme en général davantage de bande pour une meilleure tolérance au bruit d’amplitude.'
        }
      ]
    },
    'analogique-amplificateur': {
      exercises: [
        {
          title: 'Relier distorsion et spectre',
          prompt: 'Expliquez pourquoi un sinus écrêté ne reste pas un sinus pur du point de vue spectral.',
          correction: [
            'Une non-linéarité déforme la forme temporelle originale.',
            'Cette déformation introduit des composantes harmoniques supplémentaires.',
            'La saturation dégrade donc à la fois la fidélité temporelle et le contenu spectral.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel paramètre fixe souvent la limite maximale de sortie d’un amplificateur simple ? ',
          options: ['La tension d’alimentation', 'Le nombre de bits', 'Le multiplexage'],
          answer: 0,
          explanation: 'La sortie ne peut pas dépasser indéfiniment les limites imposées par l’alimentation.'
        },
        {
          question: 'Un amplificateur saturé dégrade surtout : ',
          options: ['La fidélité de restitution', 'La définition de la porteuse FM seule', 'La structure de trame E1'],
          answer: 0,
          explanation: 'La saturation introduit une distorsion qui altère le signal utile.'
        }
      ]
    },
    'analogique-recepteur': {
      exercises: [
        {
          title: 'Analyser un compromis de réglage',
          prompt: 'Décrivez une procédure expérimentale courte pour trouver la meilleure zone de réglage de τ à bruit donné.',
          correction: [
            'Fixer un niveau de bruit puis faire varier τ par paliers.',
            'Comparer la stabilité de l’enveloppe et la fidélité du message restitué.',
            'Retenir la zone où le message reste lisible tout en rejetant la HF et les fluctuations rapides.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel compromis cherche-t-on en réglant τ ? ',
          options: ['Suivre le message sans suivre la HF', 'Supprimer toute porteuse du laboratoire', 'Augmenter le nombre de symboles'],
          answer: 0,
          explanation: 'Le filtrage doit lisser la HF tout en conservant les variations utiles du message.'
        },
        {
          question: 'Si le bruit augmente à filtrage constant, la qualité restituée : ',
          options: ['A tendance à diminuer', 'Devient parfaite', 'Reste strictement identique'],
          answer: 0,
          explanation: 'Une hausse du bruit dégrade généralement la restitution du message.'
        }
      ]
    },
    'numerisation-can': {
      exercises: [
        {
          title: 'Évaluer le coût numérique',
          prompt: 'Expliquez pourquoi augmenter simultanément Fe et B améliore la qualité mais alourdit aussi le système numérique.',
          correction: [
            'Fe plus élevée et B plus grand améliorent la fidélité temporelle et d’amplitude.',
            'Le débit produit augmente alors comme Fe × B.',
            'Le dimensionnement final doit donc équilibrer qualité, stockage et transport de données.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Le nombre de niveaux de quantification vaut en première approximation : ',
          options: ['2^B', 'B^2', '2B'],
          answer: 0,
          explanation: 'Un convertisseur codé sur B bits possède 2^B niveaux.'
        },
        {
          question: 'Augmenter Fe sans changer B agit d’abord sur : ',
          options: ['La fidélité temporelle', 'Le pas de quantification', 'Le nombre de niveaux'],
          answer: 0,
          explanation: 'Fe agit sur l’échantillonnage, pas directement sur la résolution en amplitude.'
        }
      ]
    },
    'numerisation-codage-ligne': {
      exercises: [
        {
          title: 'Analyser l\u2019impact des longues s\u00e9ries de z\u00e9ros',
          prompt: 'Pourquoi une longue s\u00e9quence de z\u00e9ros nuit-elle \u00e0 la synchronisation en AMI et comment HDB3 y rem\u00e9die ?',
          correction: [
            'En AMI, une suite de z\u00e9ros produit un signal 0\u202fV continu, sans aucune transition.',
            'Sans transition, le r\u00e9cepteur ne peut pas r\u00e9cup\u00e9rer le rythme d\u2019horloge.',
            'HDB3 substitue chaque groupe de 4 z\u00e9ros cons\u00e9cutifs par 000V ou B00V.'
          ]
        },
        {
          title: 'Comparer bande minimale et composante DC',
          prompt: 'Comparez NRZ-L, Manchester et AMI sur deux crit\u00e8res : bande minimale occup\u00e9e et pr\u00e9sence d\u2019une composante DC.',
          correction: [
            'NRZ-L occupe la bande minimale (0,5\u202f/\u202fTb) mais peut contenir une DC si les 0 et 1 sont d\u00e9s\u00e9quilibr\u00e9s.',
            'Manchester occupe le double de bande (1\u202f/\u202fTb) mais garantit une DC nulle par la transition centrale.',
            'AMI \u00e9limine la DC car +V et \u2212V s\u2019\u00e9quilibrent, avec une d\u00e9tection d\u2019erreur native.'
          ]
        },
        {
          title: 'Identifier les substitutions B8ZS',
          prompt: 'Sur la s\u00e9quence de test B8ZS, localisez les marqueurs V et B et expliquez leur r\u00f4le respectif.',
          correction: [
            'V est une violation de la r\u00e8gle AMI : deux marques successives de m\u00eame polarit\u00e9.',
            'B est une marque bipolaire conforme ins\u00e9r\u00e9e pour maintenir la r\u00e8gle d\u2019alternance.',
            'Ensemble, V et B signalent la s\u00e9quence substitu\u00e9e au r\u00e9cepteur.'
          ]
        }
      ],
      quiz: [
        {
          question: 'En Manchester, une transition montante au milieu du bit repr\u00e9sente : ',
          options: ['Un bit \u00e0 1', 'Un bit \u00e0 0', 'Une violation AMI'],
          answer: 0,
          explanation: 'Par convention IEEE\u202f802.3, la transition montante au milieu code le 1 en Manchester.'
        },
        {
          question: 'Avantage principal de Manchester Diff\u00e9rentiel : ',
          options: ['Insensibilit\u00e9 \u00e0 l\u2019inversion de polarit\u00e9 de ligne', 'Bande deux fois plus \u00e9troite', 'Absence totale de transitions'],
          answer: 0,
          explanation: 'La pr\u00e9sence ou l\u2019absence de transition en d\u00e9but de bit porte l\u2019information.'
        },
        {
          question: 'HDB3 est principalement utilis\u00e9 dans : ',
          options: ['Les liaisons E1 (2 Mbit/s) en Europe', 'Les liaisons Wi-Fi 802.11', 'La modulation 64-QAM'],
          answer: 0,
          explanation: 'HDB3 est le code de ligne standardis\u00e9 pour la trame primaire E1 \u00e0 2,048 Mbit/s.'
        },
        {
          question: 'B8ZS diff\u00e8re de HDB3 par : ',
          options: ['Le seuil de substitution (8 z\u00e9ros) et son usage en T1/DS1', 'L\u2019absence de DC', 'Des niveaux quaternaires'],
          answer: 0,
          explanation: 'B8ZS substitue les groupes de 8 z\u00e9ros, normalis\u00e9 pour les hi\u00e9rarchies T1/DS1.'
        }
      ]
    },
    'modulations-symbol': {
      exercises: [
        {
          title: 'Comparer deux familles sur un même mot',
          prompt: 'Expliquez pourquoi un même mot binaire n’a pas nécessairement la même interprétation géométrique en PSK et en QAM.',
          correction: [
            'Le mot binaire indexe un symbole dans un alphabet dépendant de la famille choisie.',
            'En PSK, l’angle est la grandeur dominante, alors qu’en QAM amplitude et angle coexistent.',
            'La signification géométrique dépend donc du schéma de modulation retenu.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Dans le plan I/Q, l’angle d’un point renseigne surtout sur : ',
          options: ['La phase', 'Le débit E1', 'Le nombre de lignes de code'],
          answer: 0,
          explanation: 'L’angle d’un point I/Q est directement lié à la phase du symbole.'
        },
        {
          question: 'Pourquoi la QAM est-elle plus riche qu’une modulation ne jouant que sur la phase ? ',
          options: ['Elle combine amplitude et phase', 'Elle supprime le bruit thermique', 'Elle évite toute porteuse'],
          answer: 0,
          explanation: 'La QAM exploite deux degrés de liberté pour coder davantage d’information.'
        }
      ]
    },
    'modulations-sequence': {
      exercises: [
        {
          title: 'Lire les transitions critiques',
          prompt: 'Expliquez pourquoi certaines transitions successives sont plus exigeantes à suivre que d’autres dans une séquence symbolique.',
          correction: [
            'Certaines transitions imposent un déplacement plus important dans le plan I/Q.',
            'La variation temporelle associée peut devenir plus rapide ou plus marquée.',
            'La séquence révèle ainsi la difficulté dynamique du signal au-delà de la constellation seule.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Ce qui change entre deux séquences de même famille est surtout : ',
          options: ['L’ordre temporel des symboles', 'Le principe physique de la modulation', 'Le nombre de pages du laboratoire'],
          answer: 0,
          explanation: 'Le schéma de modulation reste le même, mais l’ordre d’enchaînement des symboles change.'
        },
        {
          question: 'La trajectoire I/Q sert particulièrement à visualiser : ',
          options: ['Les transitions entre symboles', 'Le nombre de bits d’un CAN', 'La tension d’alimentation RF'],
          answer: 0,
          explanation: 'Elle met en évidence le chemin parcouru d’un symbole au suivant.'
        }
      ]
    },
    'modulations-dashboard': {
      exercises: [
        {
          title: 'Choisir une modulation selon le service',
          prompt: 'Comparez un service très robuste et un service à forte capacité, puis proposez une modulation plausible pour chacun.',
          correction: [
            'Un service robuste privilégiera un ordre faible pour garder de la marge de décision.',
            'Un service à forte capacité acceptera un ordre plus élevé si Eb/N0 reste suffisant.',
            'Le choix doit toujours être justifié par le compromis efficacité spectrale / robustesse.'
          ]
        }
      ],
      quiz: [
        {
          question: 'À Eb/N0 donné, une modulation plus dense présente généralement : ',
          options: ['Une marge de décision plus faible', 'Une immunité absolue au bruit', 'Un roll-off forcément nul'],
          answer: 0,
          explanation: 'Des points plus rapprochés rendent la décision plus sensible.'
        },
        {
          question: 'L’efficacité spectrale augmente principalement quand : ',
          options: ['Le nombre de bits par symbole augmente', 'Le bruit augmente', 'La trame E1 est activée'],
          answer: 0,
          explanation: 'Plus de bits par symbole augmentent la quantité d’information transportée pour une même cadence symbole.'
        }
      ]
    },
    'transmission-base': {
      exercises: [
        {
          title: 'Comparer deux dégradations',
          prompt: 'Expliquez comment différencier expérimentalement une dégradation dominée par le bruit d’une dégradation dominée par le jitter.',
          correction: [
            'Le bruit dégrade surtout l’amplitude reçue et augmente l’incertitude verticale.',
            'Le jitter agit davantage sur le placement temporel des transitions et ferme l’œil horizontalement.',
            'L’analyse doit donc croiser SNR, BER et lecture visuelle de l’œil.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel couple d’indicateurs aide le plus à juger la qualité d’une liaison ? ',
          options: ['SNR et BER', 'Couleur et résolution écran', 'Nom du module et du fichier'],
          answer: 0,
          explanation: 'SNR renseigne la réserve de bruit et BER matérialise l’effet final sur la transmission.'
        },
        {
          question: 'Quand la marge devient trop faible, une action cohérente peut être : ',
          options: ['Réduire l’exigence de modulation ou ajouter de la correction', 'Supprimer tous les indicateurs', 'Changer le titre de la page'],
          answer: 0,
          explanation: 'On restaure de la robustesse soit en réduisant l’exigence du lien, soit en renforçant la protection.'
        }
      ]
    },
    'transmission-dsp': {
      exercises: [
        {
          title: 'Comparer trois vues du canal',
          prompt: 'Expliquez comment utiliser simultanément le spectre, la constellation et l’œil pour poser un diagnostic cohérent sur le canal.',
          correction: [
            'Le spectre renseigne sur l’occupation fréquentielle et le filtrage.',
            'La constellation renseigne sur la marge de décision symbole.',
            'L’œil renseigne sur la qualité temporelle de l’échantillonnage.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Une fermeture verticale de l’œil traduit surtout : ',
          options: ['Une dégradation d’amplitude et de bruit', 'Une hiérarchie PDH', 'Un codage PCM parfait'],
          answer: 0,
          explanation: 'L’ouverture verticale renseigne sur la marge d’amplitude disponible à la décision.'
        },
        {
          question: 'Le spectre aide particulièrement à juger : ',
          options: ['La bande occupée et le filtrage', 'Le numéro de groupe étudiant', 'La structure CAS'],
          answer: 0,
          explanation: 'Le domaine fréquentiel donne une lecture directe de l’occupation de bande et du façonnage du signal.'
        }
      ]
    },
    'multiplexage-e1': {
      exercises: [
        {
          title: 'Séparer charge utile et signalisation',
          prompt: 'Expliquez pourquoi une bonne lecture de la trame impose de distinguer fonction binaire et utilité télécom de chaque champ.',
          correction: [
            'Deux champs peuvent transporter des bits sans transporter la même fonction réseau.',
            'Certains bits servent à cadrer ou signaler, d’autres à porter la voix utile.',
            'Le bon diagnostic demande donc une lecture fonctionnelle, pas seulement binaire.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Pourquoi IT0 n’est-il pas une voie utile ordinaire ? ',
          options: ['Parce qu’il sert au cadrage et à la supervision', 'Parce qu’il transporte la FM', 'Parce qu’il augmente Eb/N0'],
          answer: 0,
          explanation: 'IT0 a une fonction de structure et non de transport utile voix.'
        },
        {
          question: 'Quel calcul simple permet de retrouver 64 kbit/s par voie ? ',
          options: ['8 bits × 8000 trames/s', '16 bits × 32 voies', '2 Mbit/s ÷ 8'],
          answer: 0,
          explanation: 'Une voie utile transporte 8 bits à chaque trame de 8 kHz.'
        }
      ]
    },
    'multiplexage-compare': {
      exercises: [
        {
          title: 'Argumenter un choix de norme',
          prompt: 'Proposez un critère de choix entre E1 et T1 pour un usage moderne orienté données plutôt que voix traditionnelle.',
          correction: [
            'Il faut privilégier la transparence binaire de la charge utile.',
            'La lisibilité de la structure et la séparation de la signalisation deviennent des atouts.',
            'L’architecture la plus favorable aux données modernes n’est donc pas seulement celle du débit brut.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Comparer E1 et T1 demande surtout d’étudier : ',
          options: ['Charge utile, overhead et signalisation', 'Uniquement la couleur de l’interface', 'Le nom du fabricant'],
          answer: 0,
          explanation: 'La comparaison pertinente porte sur la structure fonctionnelle complète.'
        },
        {
          question: 'Le robbed bit signaling est surtout problématique pour : ',
          options: ['Les données exigeant une bonne transparence binaire', 'Les graphes BER', 'La FM analogique'],
          answer: 0,
          explanation: 'L’intrusion dans les bits utiles pénalise davantage les usages de données.'
        }
      ]
    },
    'multiplexage-pcm': {
      exercises: [
        {
          title: 'Relier échantillon et position de trame',
          prompt: 'Expliquez pourquoi la position temporelle d’un échantillon dans la trame est aussi importante que sa valeur binaire.',
          correction: [
            'La valeur binaire seule ne suffit pas si on ne sait pas à quelle voie elle appartient.',
            'La position dans la trame identifie le canal de destination.',
            'Le multiplexage nécessite donc à la fois codage et synchronisation temporelle.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Pourquoi la position dans la trame est-elle essentielle ? ',
          options: ['Parce qu’elle identifie la voie concernée', 'Parce qu’elle change l’amplitude analogique passée', 'Parce qu’elle remplace le codage PCM'],
          answer: 0,
          explanation: 'L’intervalle de temps permet d’associer le mot binaire à la bonne voie.'
        },
        {
          question: 'La chaîne correcte est : ',
          options: ['Signal analogique → échantillonnage → quantification → mot binaire', 'Mot binaire → porteuse FM → IT16', 'Bruit → signalisation → PCM'],
          answer: 0,
          explanation: 'La PCM suit d’abord la chaîne de numérisation avant l’insertion temporelle.'
        }
      ]
    },
    'multiplexage-complet': {
      exercises: [
        {
          title: 'Lire une chaîne d’agrégation',
          prompt: 'Expliquez ce qu’un ingénieur doit regarder en priorité quand il suit un flux depuis la voie source jusqu’à la hiérarchie réseau.',
          correction: [
            'Il doit identifier le débit ou tribut élémentaire de départ.',
            'Il doit repérer comment ce flux est inséré, agrégé puis accompagné d’overhead.',
            'Il doit enfin comparer capacité utile et débit global de sortie.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Dans une chaîne complète de multiplexage, on suit principalement : ',
          options: ['Le passage d’un flux élémentaire à une capacité agrégée', 'Une simple modulation AM', 'La température ambiante'],
          answer: 0,
          explanation: 'L’objectif est de suivre un tribut élémentaire jusqu’au niveau réseau supérieur.'
        },
        {
          question: 'Pourquoi distinguer capacité utile et débit de sortie ? ',
          options: ['Parce que l’overhead consomme une partie du débit', 'Parce qu’ils sont toujours identiques', 'Parce que cela dépend de la couleur du câble'],
          answer: 0,
          explanation: 'Le débit global inclut aussi la structure, la synchronisation et la supervision.'
        }
      ]
    }
  };

  const LAB_TP_PAGE_DEFAULTS = {
    'analogique-emetteur': [{
      prefilledRows: [['AM', 'fm nominale', 'fp nominale', 'm ou β', 'B relevée'], ['FM', 'fm nominale', 'fp nominale', 'm ou β', 'B relevée'], ['Comparaison', '', '', '', 'Conclusion']],
      expectedValues: ['En AM, la bande relevée doit rester de l’ordre de 2 fm.', 'En FM, la bande relevée augmente avec la déviation et dépasse souvent le cas AM.', 'La comparaison doit distinguer enveloppe variable et fréquence instantanée variable.'],
      rubric: [{ label: 'Mesures AM/FM correctement relevées', max: 4 }, { label: 'Comparaison physique correcte', max: 4 }, { label: 'Conclusion d’ingénierie', max: 2 }]
    }],
    'analogique-amplificateur': [{
      prefilledRows: [['Linéaire', 'Vin', 'Gain', 'Vout crête', 'Sat %'], ['Limite', 'Vin', 'Gain', 'Vout crête', 'Sat %'], ['Écrêté', 'Vin', 'Gain', 'Vout crête', 'Sat %']],
      expectedValues: ['En zone linéaire, Vout suit approximativement Vin × gain.', 'Au seuil de saturation, les crêtes cessent de croître proportionnellement.', 'Le taux de saturation doit augmenter quand la sortie atteint les limites d’alimentation.'],
      rubric: [{ label: 'Identification du seuil de saturation', max: 4 }, { label: 'Exploitation des mesures', max: 3 }, { label: 'Lien entre fidélité et Vcc', max: 3 }]
    }],
    'analogique-recepteur': [{
      prefilledRows: [['Bruit faible', 'τ', 'SNR', 'Qualité', 'Observation'], ['Bruit moyen', 'τ', 'SNR', 'Qualité', 'Observation'], ['Bruit fort', 'τ', 'SNR', 'Qualité', 'Observation']],
      expectedValues: ['La qualité doit décroître quand le bruit augmente à filtrage constant.', 'Une constante trop faible laisse trop de fluctuations rapides.', 'Une constante trop forte lisse aussi le message utile.'],
      rubric: [{ label: 'Choix des cas d’essai', max: 3 }, { label: 'Analyse bruit / filtrage', max: 4 }, { label: 'Conclusion sur le compromis', max: 3 }]
    }],
    'numerisation-can': [{
      prefilledRows: [['Sous-Nyquist', 'f', 'Fe', 'B', 'Observation'], ['Nyquist', 'f', 'Fe', 'B', 'Observation'], ['Haute résolution', 'f', 'Fe', 'B', 'Observation']],
      expectedValues: ['Un cas sous-Nyquist doit montrer un repliement spectral apparent.', 'Le pas de quantification diminue quand B augmente.', 'Le SQNR augmente avec B à fréquence d’échantillonnage fixée.'],
      rubric: [{ label: 'Diagnostic aliasing', max: 4 }, { label: 'Diagnostic quantification', max: 3 }, { label: 'Justification numérique', max: 3 }]
    }],
    'modulations-symbol': [{
      prefilledRows: [['Symbole 1', 'Mot binaire', 'I/Q', 'Mesure', 'Interprétation'], ['Symbole 2', 'Mot binaire', 'I/Q', 'Mesure', 'Interprétation'], ['Symbole 3', 'Mot binaire', 'I/Q', 'Mesure', 'Interprétation']],
      expectedValues: ['Chaque mot binaire doit correspondre à un seul symbole valide.', 'En PSK, l’angle porte l’essentiel de l’information ; en QAM, amplitude et angle sont conjoints.', 'La mesure affichée doit être cohérente avec la position géométrique relevée.'],
      rubric: [{ label: 'Correspondance bit / symbole', max: 4 }, { label: 'Lecture I/Q correcte', max: 3 }, { label: 'Interprétation temporelle', max: 3 }]
    }],
    'modulations-sequence': [{
      prefilledRows: [['Séquence A', 'Famille', 'M', 'Trajectoire I/Q', 'Conclusion'], ['Séquence B', 'Famille', 'M', 'Trajectoire I/Q', 'Conclusion'], ['Comparaison', '', '', '', '']],
      expectedValues: ['Deux séquences de même famille peuvent produire des trajectoires différentes si l’ordre change.', 'L’ordre M reste fixe mais la dynamique de transition dépend de l’enchaînement.', 'La lecture doit distinguer géométrie statique et trajet temporel.'],
      rubric: [{ label: 'Construction de séquences pertinente', max: 3 }, { label: 'Analyse des trajectoires', max: 4 }, { label: 'Conclusion sur l’ordre symbolique', max: 3 }]
    }],
    'modulations-dashboard': [{
      prefilledRows: [['Modulation robuste', 'Ordre', 'Roll-off', 'TEB', 'Efficacité'], ['Modulation dense', 'Ordre', 'Roll-off', 'TEB', 'Efficacité'], ['Comparaison', '', '', '', '']],
      expectedValues: ['À Eb/N0 identique, une modulation dense présente en général un TEB moins favorable.', 'L’efficacité spectrale augmente avec l’ordre M.', 'Un roll-off plus élevé réduit l’efficacité spectrale à débit utile donné.'],
      rubric: [{ label: 'Tableau comparatif cohérent', max: 3 }, { label: 'Lecture TEB / efficacité', max: 4 }, { label: 'Choix de modulation justifié', max: 3 }]
    }],
    'transmission-base': [{
      prefilledRows: [['Nominal', 'SNR', 'BER', 'Marge', 'État'], ['Dégradé', 'SNR', 'BER', 'Marge', 'État'], ['Corrigé', 'SNR', 'BER', 'Marge', 'État']],
      expectedValues: ['Le cas nominal doit garder une marge positive et un BER faible.', 'Le cas dégradé doit montrer une dégradation nette d’au moins un indicateur.', 'Le cas corrigé doit récupérer une partie mesurable de la marge ou du BER.'],
      rubric: [{ label: 'Bilan de liaison relevé sur 3 cas', max: 4 }, { label: 'Choix de correction pertinent', max: 3 }, { label: 'Conclusion sur l’acceptabilité du lien', max: 3 }]
    }],
    'transmission-dsp': [{
      prefilledRows: [['Cas robuste', 'Eb/N0', 'SER', 'Bande', 'Observation'], ['Cas dense', 'Eb/N0', 'SER', 'Bande', 'Observation'], ['Comparaison', '', '', '', '']],
      expectedValues: ['Quand Eb/N0 baisse, le SER doit augmenter.', 'Une constellation plus dense réduit la distance de décision.', 'Le spectre et l’œil doivent être lus conjointement avec la constellation.'],
      rubric: [{ label: 'Lecture croisée des 3 vues', max: 4 }, { label: 'Lien quantitatif Eb/N0 / SER', max: 3 }, { label: 'Conclusion système', max: 3 }]
    }],
    'multiplexage-e1': [{
      prefilledRows: [['IT0', 'Rôle', 'Info portée', 'Débit utile', 'Commentaire'], ['IT16', 'Rôle', 'Info portée', 'Débit utile', 'Commentaire'], ['Voie utile', 'Rôle', 'Info portée', 'Débit utile', 'Commentaire']],
      expectedValues: ['Une voie utile E1 correspond à 8 bits émis à 8000 trames/s, soit 64 kbit/s.', 'IT0 et IT16 doivent être identifiés comme champs de structure/signalisation.', 'La comparaison doit distinguer overhead et charge utile.'],
      rubric: [{ label: 'Identification des champs', max: 4 }, { label: 'Justification du 64 kbit/s', max: 3 }, { label: 'Conclusion sur l’efficacité utile', max: 3 }]
    }],
    'multiplexage-compare': [{
      prefilledRows: [['E1', 'Signalisation', 'Charge utile', 'Overhead', 'Conclusion'], ['T1', 'Signalisation', 'Charge utile', 'Overhead', 'Conclusion'], ['Comparaison', '', '', '', '']],
      expectedValues: ['E1 et T1 doivent être distingués par leur logique de signalisation.', 'Le robbed bit signaling doit être identifié comme une intrusion dans l’utile.', 'La comparaison doit motiver un choix pour le transport de données modernes.'],
      rubric: [{ label: 'Comparaison structurée des normes', max: 4 }, { label: 'Analyse de la signalisation', max: 3 }, { label: 'Recommandation motivée', max: 3 }]
    }],
    'multiplexage-pcm': [{
      prefilledRows: [['Source audio', 'Code', 'Position trame', 'Niveau', 'Conclusion'], ['Deuxième essai', 'Code', 'Position trame', 'Niveau', 'Conclusion'], ['Synthèse', '', '', '', '']],
      expectedValues: ['Un octet PCM complet doit pouvoir être relevé sur la voie audio.', 'La case correspondante doit être repérée dans la trame TDM.', 'La chaîne source analogique → octet → voie temporelle doit être explicitée.'],
      rubric: [{ label: 'Suivi complet de la voie', max: 4 }, { label: 'Relevé binaire correct', max: 3 }, { label: 'Lien PCM / TDM bien expliqué', max: 3 }]
    }],
    'multiplexage-complet': [{
      prefilledRows: [['PCM', 'Entrées', 'Sortie', 'Capacité', 'Conclusion'], ['Trame primaire', 'Entrées', 'Sortie', 'Capacité', 'Conclusion'], ['Hiérarchie', 'Entrées', 'Sortie', 'Capacité', 'Conclusion']],
      expectedValues: ['Le flux élémentaire doit être suivi jusqu’au niveau hiérarchique.', 'La sortie agrégée doit être comparée à la somme utile et à l’overhead.', 'La conclusion doit relier tribut élémentaire et capacité réseau.'],
      rubric: [{ label: 'Parcours multi-niveaux complet', max: 4 }, { label: 'Lecture capacité / overhead', max: 3 }, { label: 'Synthèse réseau cohérente', max: 3 }]
    }]
  };

  const LAB_PRACTICE_DEFAULTS = {
    home: {
      exercises: [
        {
          title: 'Structurer un parcours d’étude',
          prompt: 'Proposez une progression logique entre les familles de simulateurs, puis justifiez en quoi chaque étape prépare la suivante.',
          correction: [
            'Commencer par la chaîne analogique pour identifier le support physique du message.',
            'Passer ensuite au CAN pour comprendre la transition continu/discret.',
            'Enchaîner avec les modulations, puis la transmission et enfin le multiplexage pour remonter vers l’architecture réseau.'
          ]
        },
        {
          title: 'Relier phénomène physique et métrique',
          prompt: 'Associez trois grandeurs observables dans le laboratoire à une grandeur d’ingénierie utile pour le dimensionnement.',
          correction: [
            'Amplitude/bruit ↔ SNR ou marge de décision.',
            'Fréquence d’échantillonnage ↔ critère de Nyquist et bande utile.',
            'Débit, overhead et nombre de voies ↔ capacité utile et efficacité de transport.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Construire un mini-parcours comparatif',
          objective: 'Comparer trois simulateurs successifs pour suivre une même information du monde analogique jusqu’au réseau.',
          actions: [
            'Sélectionner un module analogique, un module numérique et un module de transport.',
            'Relever sur chaque page une grandeur principale et une contrainte technique.',
            'Rédiger une synthèse expliquant comment la contrainte change de nature au fil du parcours.'
          ],
          measures: [
            'Grandeur principale observée',
            'Réglage critique utilisé',
            'Indicateur de qualité retenu',
            'Conclusion d’ingénierie'
          ]
        }
      ],
      measurementHints: ['Module', 'Réglage', 'Mesure', 'Unité', 'Interprétation']
    },
    analogique: {
      exercises: [
        {
          title: 'Identifier le régime physique',
          prompt: 'Expliquez comment distinguer visuellement un régime linéaire, un régime bruité et un régime saturé sur les oscillogrammes.',
          correction: [
            'Régime linéaire : forme conservée et proportionnalité entrée/sortie.',
            'Régime bruité : fluctuations parasites sans écrêtage systématique.',
            'Régime saturé : crêtes aplaties, enveloppe déformée ou écrêtage net.'
          ]
        },
        {
          title: 'Relier réglage et fidélité',
          prompt: 'Choisissez un réglage du simulateur analogique et justifiez précisément son effet sur la fidélité de restitution.',
          correction: [
            'Le gain excessif conduit à la saturation.',
            'Un filtrage mal choisi déforme l’enveloppe ou la dynamique du message.',
            'Le bruit reçu réduit l’intelligibilité même si la structure générale reste visible.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Étude de linéarité',
          objective: 'Mesurer la frontière entre fonctionnement fidèle et non linéaire.',
          actions: [
            'Partir d’un cas nominal.',
            'Augmenter progressivement le gain ou la profondeur de modulation.',
            'Repérer le point où apparaît la première déformation notable.',
            'Comparer visuellement entrée, signal traité et sortie.'
          ],
          measures: ['Amplitude entrée', 'Amplitude sortie', 'Gain ou indice', 'Taux de saturation', 'Observation physique']
        },
        {
          title: 'Impact du bruit ou du filtrage',
          objective: 'Qualifier l’effet des perturbations sur la restitution du message.',
          actions: [
            'Garder la source inchangée.',
            'Faire varier uniquement le bruit ou la constante de filtrage.',
            'Noter à partir de quel seuil la restitution devient dégradée.',
            'Conclure sur le compromis fidélité/stabilité.'
          ],
          measures: ['Niveau de bruit', 'Constante de filtrage', 'SNR estimé', 'Qualité perçue', 'Conclusion']
        }
      ],
      measurementHints: ['Réglage', 'Valeur', 'Unité', 'Observation', 'Interprétation']
    },
    numerisation: {
      exercises: [
        {
          title: 'Séparer aliasing et quantification',
          prompt: 'Expliquez pourquoi deux erreurs numériques différentes peuvent apparaître même si le signal d’entrée est le même.',
          correction: [
            'L’aliasing provient d’un échantillonnage trop lent.',
            'La quantification provient d’un nombre de niveaux trop faible.',
            'Augmenter Fe ne corrige pas directement l’erreur de quantification ; augmenter B ne supprime pas l’aliasing.'
          ]
        },
        {
          title: 'Dimensionner un convertisseur',
          prompt: 'Décrivez une méthode simple pour choisir Fe et B à partir d’une fréquence maximale et d’une qualité cible.',
          correction: [
            'Choisir d’abord Fe au-dessus de 2fmax avec une marge pratique.',
            'Choisir ensuite B selon l’erreur admissible ou le SQNR visé.',
            'Vérifier enfin le coût débit/stockage induit par Fe × B.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Cas de sous-échantillonnage',
          objective: 'Mettre en évidence un repliement spectral contrôlé.',
          actions: [
            'Fixer la fréquence du signal.',
            'Descendre Fe sous la borne de Nyquist.',
            'Relever la fréquence apparente observée.',
            'Comparer avec le cas nominal correctement échantillonné.'
          ],
          measures: ['f signal', 'Fe', 'Rapport de Nyquist', 'Fréquence repliée', 'Conclusion']
        },
        {
          title: 'Influence du nombre de bits',
          objective: 'Quantifier l’amélioration de résolution quand B augmente.',
          actions: [
            'Conserver Fe constant.',
            'Faire varier la résolution bit par bit.',
            'Comparer visuellement les paliers et le code binaire obtenu.',
            'Conclure sur l’évolution du SQNR.'
          ],
          measures: ['B', 'Nombre de niveaux', 'Pas de quantification', 'SQNR', 'Observation']
        }
      ],
      measurementHints: ['Paramètre', 'Valeur', 'Unité', 'Effet observé', 'Conclusion']
    },
    modulations: {
      exercises: [
        {
          title: 'Lire une constellation',
          prompt: 'Expliquez comment retrouver le compromis robustesse/efficacité spectrale à partir d’une constellation.',
          correction: [
            'Plus les points sont espacés, plus la décision est robuste au bruit.',
            'Plus la constellation est dense, plus le nombre de bits par symbole augmente.',
            'Le gain spectral se paie par une plus forte exigence en SNR.'
          ]
        },
        {
          title: 'Comparer deux familles',
          prompt: 'Comparez PSK et QAM sur la grandeur porteuse d’information et sur la sensibilité au canal.',
          correction: [
            'PSK porte surtout l’information sur la phase.',
            'QAM combine phase et amplitude pour accroître la densité d’information.',
            'QAM devient plus sensible aux perturbations d’amplitude et de décision.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Montée en ordre de modulation',
          objective: 'Comparer l’écartement des points et l’évolution des indicateurs de performance.',
          actions: [
            'Choisir une famille de modulation.',
            'Comparer deux ordres successifs.',
            'Relever bits/symbole, BER/SER théorique ou commentaire de robustesse.',
            'Conclure sur le compromis spectral.'
          ],
          measures: ['Famille', 'Ordre M', 'Bits/symbole', 'Indicateur BER/SER', 'Conclusion']
        },
        {
          title: 'Lecture I/Q',
          objective: 'Relier les points affichés à la trajectoire et à l’onde temporelle.',
          actions: [
            'Choisir un symbole ou une séquence.',
            'Repérer la position du ou des points dans le plan I/Q.',
            'Noter la grandeur dominante (phase, amplitude, fréquence relative).',
            'Décrire l’effet sur la forme d’onde produite.'
          ],
          measures: ['Symbole', 'I', 'Q', 'Grandeur dominante', 'Interprétation']
        }
      ],
      measurementHints: ['Cas étudié', 'Mesure', 'Unité', 'Décision', 'Interprétation']
    },
    transmission: {
      exercises: [
        {
          title: 'Établir un bilan de liaison',
          prompt: 'Décrivez les trois indicateurs que vous retiendriez en priorité pour juger si le lien est acceptable.',
          correction: [
            'Le SNR ou Eb/N0 pour situer la réserve de bruit.',
            'La marge de capacité pour comparer débit utile et limite du canal.',
            'BER/SER ou ouverture de l’œil pour relier le canal à la décision binaire.'
          ]
        },
        {
          title: 'Justifier une correction',
          prompt: 'Expliquez dans quels cas agir sur le FEC, le filtre, le gain TX ou le choix de modulation.',
          correction: [
            'FEC : quand le canal reste récupérable mais la marge est faible.',
            'Filtre : quand l’ISI ou la forme d’onde limitent la décision.',
            'Gain TX ou modulation : quand le canal ne supporte plus le débit ou la densité choisie.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Stress progressif du lien',
          objective: 'Identifier le paramètre dominant dans la dégradation du lien.',
          actions: [
            'Partir d’un cas stable.',
            'Faire varier un seul paramètre : distance, bruit, jitter ou seuil.',
            'Relever BER/SER, SNR et état du lien.',
            'Répéter pour un second paramètre et comparer les effets.'
          ],
          measures: ['Scénario', 'SNR', 'BER/SER', 'Marge', 'Diagnostic']
        },
        {
          title: 'Récupération du lien',
          objective: 'Tester différentes actions correctives et choisir la plus efficace.',
          actions: [
            'Créer un cas dégradé.',
            'Essayer successivement FEC, filtrage, gain ou baisse d’ordre de modulation.',
            'Comparer l’amélioration obtenue sur les KPI.',
            'Conclure sur la stratégie d’ingénierie la plus pertinente.'
          ],
          measures: ['Action', 'Avant', 'Après', 'Gain observé', 'Conclusion']
        }
      ],
      measurementHints: ['Paramètre', 'Avant', 'Après', 'Unité', 'Conclusion']
    },
    multiplexage: {
      exercises: [
        {
          title: 'Comparer structure utile et overhead',
          prompt: 'Expliquez comment distinguer ressource utile, signalisation et overhead dans une trame ou une hiérarchie.',
          correction: [
            'La ressource utile correspond aux voies ou tributaires transportant voix/données.',
            'La signalisation transporte l’état des voies ou le cadrage de service.',
            'L’overhead de transport assure synchronisation, supervision et agrégation réseau.'
          ]
        },
        {
          title: 'Relier trame et capacité',
          prompt: 'Montrez comment passer d’une voie élémentaire à une estimation de capacité d’un niveau supérieur.',
          correction: [
            'Identifier d’abord le débit élémentaire d’une voie ou d’un tribut.',
            'Compter ensuite le nombre de tributaires agrégés.',
            'Ajouter enfin l’overhead propre au niveau hiérarchique considéré.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Lecture de trame',
          objective: 'Distinguer champs utiles, cadrage et signalisation.',
          actions: [
            'Choisir une norme ou un niveau.',
            'Repérer les emplacements de trame réservés.',
            'Comparer une voie utile à un champ de service.',
            'Conclure sur l’efficacité utile.'
          ],
          measures: ['Norme', 'Champ observé', 'Fonction', 'Débit utile', 'Commentaire']
        },
        {
          title: 'Montée en hiérarchie',
          objective: 'Relier un tribut primaire à une capacité réseau supérieure.',
          actions: [
            'Partir d’un niveau primaire.',
            'Suivre son agrégation dans le niveau supérieur.',
            'Relever le nombre d’entrées, le débit de sortie et la logique de synchronisation.',
            'Comparer deux architectures si possible.'
          ],
          measures: ['Niveau', 'Entrées', 'Sortie', 'Overhead', 'Conclusion']
        }
      ],
      measurementHints: ['Niveau', 'Champ', 'Valeur', 'Unité', 'Interprétation']
    }
  };

  const LAB_EVAL_DEFAULTS = {
    home: {
      expectedAnswers: [
        'Un parcours complet suit g\u00e9n\u00e9ralement : analogique ? CAN ? modulations ? transmission ? multiplexage.',
        'La page CAN sert de transition cl\u00e9 entre signal analogique et repr\u00e9sentation num\u00e9rique.',
        'Les notions de capacit\u00e9, d\u2019overhead et de hi\u00e9rarchie deviennent centrales dans les modules de transmission et de multiplexage.'
      ],
      quiz: [
        {
          question: 'Quelle page joue le r\u00f4le de passerelle entre monde analogique et monde num\u00e9rique ? ',
          options: ['Amplificateur', 'CAN', 'MUX'],
          answer: 1,
          explanation: 'Le convertisseur CAN introduit l\u2019\u00e9chantillonnage, la quantification et le codage binaire.'
        },
        {
          question: 'Quel ordre est le plus coh\u00e9rent pour une d\u00e9couverte progressive ? ',
          options: ['Multiplexage ? analogique ? CAN', 'Analogique ? CAN ? modulations ? transmission', 'Transmission ? analogique ? PCM'],
          answer: 1,
          explanation: 'On part d\u2019abord du signal physique avant de monter vers la modulation puis le r\u00e9seau.'
        }
      ]
    },
    analogique: {
      expectedAnswers: [
        'La cha\u00eene analogique transporte l\u2019information via une grandeur continue : amplitude, fr\u00e9quence ou enveloppe selon le bloc \u00e9tudi\u00e9.',
        'Un fonctionnement non lin\u00e9aire appara\u00eet quand le montage atteint ses limites physiques, par exemple la saturation.',
        'Le bon raisonnement consiste \u00e0 comparer entr\u00e9e, traitement et sortie pour expliquer la fid\u00e9lit\u00e9 finale.'
      ],
      quiz: [
        {
          question: 'Dans une modulation AM, o\u00f9 se lit principalement l\u2019information utile ? ',
          options: ['Dans l\u2019enveloppe', 'Dans la tension d\u2019alimentation', 'Dans la seule phase'],
          answer: 0,
          explanation: 'L\u2019amplitude instantan\u00e9e de la porteuse suit le signal message, donc l\u2019enveloppe contient l\u2019information.'
        },
        {
          question: 'Quel ph\u00e9nom\u00e8ne indique qu\u2019un amplificateur sort de son r\u00e9gime lin\u00e9aire ? ',
          options: ['L\u2019\u00e9cr\u00eatage', 'La num\u00e9risation', 'Le multiplexage'],
          answer: 0,
          explanation: 'L\u2019\u00e9cr\u00eatage appara\u00eet lorsque la sortie ne peut plus suivre le gain demand\u00e9 \u00e0 cause des limites d\u2019alimentation.'
        }
      ]
    },
    numerisation: {
      expectedAnswers: [
        'Le crit\u00e8re fondamental d\u2019\u00e9chantillonnage est Fe ? 2fmax pour \u00e9viter l\u2019aliasing.',
        'L\u2019augmentation du nombre de bits r\u00e9duit l\u2019erreur de quantification et am\u00e9liore le SQNR.',
        'L\u2019aliasing est un d\u00e9faut temporel alors que la quantification est un d\u00e9faut d\u2019amplitude.'
      ],
      quiz: [
        {
          question: 'Quel param\u00e8tre combat directement l\u2019aliasing ? ',
          options: ['La fr\u00e9quence d\u2019\u00e9chantillonnage', 'Le nombre de bits', 'La couleur du signal'],
          answer: 0,
          explanation: 'L\u2019aliasing dispara\u00ee t en relevant Fe au-del\u00e0 de la borne de Nyquist.'
        },
        {
          question: 'Que fait principalement l\u2019augmentation du nombre de bits ? ',
          options: ['Elle r\u00e9duit l\u2019erreur de quantification', 'Elle double la fr\u00e9quence du signal', 'Elle supprime automatiquement le bruit de canal'],
          answer: 0,
          explanation: 'Davantage de niveaux quantifi\u00e9s signifie un pas plus fin et donc une erreur d\u2019amplitude plus faible.'
        }
      ]
    },
    modulations: {
      expectedAnswers: [
        'Une modulation plus dense augmente l\u2019efficacit\u00e9 spectrale mais r\u00e9duit la distance minimale entre symboles.',
        'En PSK, l\u2019information se lit surtout sur la phase ; en QAM, elle combine amplitude et phase.',
        'Le plan I/Q permet une lecture g\u00e9om\u00e9trique directe de la d\u00e9cision symbole.'
      ],
      quiz: [
        {
          question: 'Pourquoi 64-QAM demande-t-elle un meilleur SNR que QPSK ? ',
          options: ['Parce que ses points sont plus rapproch\u00e9s', 'Parce qu\u2019elle utilise moins de bits', 'Parce qu\u2019elle ne transmet pas sur I/Q'],
          answer: 0,
          explanation: 'La densit\u00e9 de constellation augmente et la moindre perturbation peut changer la d\u00e9cision symbole.'
        },
        {
          question: 'Quelle grandeur porte surtout l\u2019information en PSK ? ',
          options: ['La phase', 'La puissance d\u2019alimentation', 'La largeur du c\u00e2ble'],
          answer: 0,
          explanation: 'La PSK code les symboles par des angles diff\u00e9rents dans le plan I/Q.'
        }
      ]
    },
    transmission: {
      expectedAnswers: [
        'Le SNR, la marge de capacit\u00e9 et l\u2019ouverture de l\u2019\u0153il sont des indicateurs prioritaires de robustesse de lien.',
        'La gigue agit principalement sur le moment d\u2019\u00e9chantillonnage et de d\u00e9cision.',
        'Le FEC n\u2019am\u00e9liore pas le canal physique lui-m\u00eame mais augmente la robustesse globale du syst\u00e8me.'
      ],
      quiz: [
        {
          question: 'Quel indicateur relie directement d\u00e9bit demand\u00e9 et capacit\u00e9 du canal ? ',
          options: ['La marge de capacit\u00e9', 'La couleur du trac\u00e9', 'Le nombre de panneaux'],
          answer: 0,
          explanation: 'La marge de capacit\u00e9 exprime l\u2019\u00e9cart entre le d\u00e9bit utile et la limite que peut supporter le canal.'
        },
        {
          question: 'Quel effet est typiquement li\u00e9 au jitter ? ',
          options: ['Une fermeture horizontale de l\u2019\u0153il', 'Une hausse du nombre de bits par symbole', 'Une conversion PCM'],
          answer: 0,
          explanation: 'Le jitter perturbe surtout le calage temporel des d\u00e9cisions.'
        }
      ]
    },
    multiplexage: {
      expectedAnswers: [
        'Le multiplexage temporel partage une m\u00eame ressource physique en s\u00e9parant les utilisateurs par intervalles de temps.',
        'E1 s\u00e9pare voix et signalisation alors que le T1 classique utilise historiquement du robbed bit signaling.',
        'Les hi\u00e9rarchies PDH puis SDH/SONET servent \u00e0 agr\u00e9ger des flux primaires vers des capacit\u00e9s r\u00e9seau bien plus \u00e9lev\u00e9es.'
      ],
      quiz: [
        {
          question: 'Quelle affirmation d\u00e9crit le mieux l\u2019E1 classique ? ',
          options: ['Signalisation s\u00e9par\u00e9e de la voix', 'Vol p\u00e9riodique du bit de poids faible', 'Aucune structure de trame'],
          answer: 0,
          explanation: 'L\u2019E1 r\u00e9serve des intervalles d\u00e9di\u00e9s \u00e0 la structure et \u00e0 la signalisation, laissant les voies utiles intactes.'
        },
        {
          question: '\u00c0 quoi sert une hi\u00e9rarchie PDH/SDH ? ',
          options: ['\u00c0 agr\u00e9ger plusieurs flux primaires', '\u00c0 cr\u00e9er une modulation FM', '\u00c0 filtrer le bruit analogique'],
          answer: 0,
          explanation: 'Ces hi\u00e9rarchies regroupent les tributaires de faible d\u00e9bit dans des liaisons de plus grande capacit\u00e9.'
        }
      ]
    }
  };

  const LAB_GUIDE_DEFAULTS = {
    analogique: {
      title: 'Cha\u00eene analogique',
      subtitle: 'Observez la transformation progressive du message, de la modulation jusqu\u2019\u00e0 la restitution.',
      help: [
        'Commencez par identifier la grandeur qui porte l\u2019information : amplitude, fr\u00e9quence ou enveloppe.',
        'Reliez toujours une d\u00e9formation visuelle \u00e0 un effet physique : bruit, saturation, filtrage ou d\u00e9phasage.',
        'Comparez le signal d\u2019entr\u00e9e, le signal trait\u00e9 et le signal restitu\u00e9 pour raisonner en cha\u00eene compl\u00e8te.'
      ],
      objectives: [
        'Identifier le r\u00f4le de chaque bloc analogique de la cha\u00eene radio.',
        'Relier un r\u00e9glage de curseur \u00e0 une d\u00e9formation temporelle observable.',
        'Expliquer les limites physiques d\u2019un traitement analogique.'
      ],
      questions: [
        'Quel param\u00e8tre modifie directement la fid\u00e9lit\u00e9 du message ?',
        'Quelle grandeur reste stable et laquelle porte l\u2019information ?',
        '\u00c0 partir de quel r\u00e9glage le traitement devient-il non lin\u00e9aire ?'
      ],
      tpSteps: [
        { title: 'Observer la r\u00e9f\u00e9rence', text: 'Lancez la page dans un \u00e9tat nominal et rep\u00e9rez le signal de r\u00e9f\u00e9rence avant traitement.', target: '.controls' },
        { title: 'Faire varier un seul param\u00e8tre', text: 'Modifiez un seul curseur \u00e0 la fois pour attribuer clairement chaque effet \u00e0 sa cause.', target: '.lab-kpi-grid' },
        { title: 'Conclure sur la fid\u00e9lit\u00e9', text: 'Comparez le signal final au signal de d\u00e9part et qualifiez la qualit\u00e9 de transmission.', target: '.stage' }
      ]
    },
    numerisation: {
      title: 'Num\u00e9risation',
      subtitle: 'Passez du monde continu au monde discret en distinguant \u00e9chantillonnage, quantification et codage.',
      help: [
        'Surveillez toujours le rapport entre fr\u00e9quence du signal et fr\u00e9quence d\u2019\u00e9chantillonnage.',
        'Le nombre de bits agit sur le bruit de quantification, pas sur l\u2019aliasing.',
        'Interpr\u00e9tez les indicateurs comme des outils de dimensionnement de convertisseur.'
      ],
      objectives: [
        'V\u00e9rifier le crit\u00e8re de Nyquist-Shannon.',
        'Estimer l\u2019effet du nombre de bits sur la qualit\u00e9 num\u00e9rique.',
        'Lire un codage binaire associ\u00e9 \u00e0 un niveau quantifi\u00e9.'
      ],
      questions: [
        'Quand observe-t-on un repliement spectral ?',
        'Comment \u00e9volue le SQNR quand la r\u00e9solution augmente ?',
        'Pourquoi deux convertisseurs avec la m\u00eame Fe peuvent-ils donner des r\u00e9sultats diff\u00e9rents ?'
      ],
      tpSteps: [
        { title: 'Cr\u00e9er un aliasing', text: 'R\u00e9glez un cas de sous-\u00e9chantillonnage puis notez la fr\u00e9quence apparente du signal repli\u00e9.', target: '.lab-preset-bar' },
        { title: 'Revenir \u00e0 Nyquist', text: 'Placez-vous juste au seuil de Nyquist et observez la faible marge disponible.', target: '.lab-kpi-grid' },
        { title: 'Augmenter la r\u00e9solution', text: 'Gardez Fe fixe puis augmentez le nombre de bits pour isoler l\u2019effet de la quantification.', target: '.stage' }
      ]
    },
    'numerisation-codage-ligne': {
      title: 'Codage de Ligne',
      subtitle: 'Comparez 9 codes en bande de base et identifiez leurs propri\u00e9t\u00e9s spectrales, leur composante DC et leur capacit\u00e9 d\u2019auto-synchronisation.',
      help: [
        'Commencez par saisir une s\u00e9quence avec une longue plage de z\u00e9ros pour voir AMI \u00e9chouer et HDB3 compenser.',
        'Comparez toujours la bande du spectre affich\u00e9e avec la bande th\u00e9orique 0,5/Tb ou 1/Tb.',
        'Utilisez les pr\u00e9r\u00e9glages \u00ab\u202fAMI vs HDB3\u202f\u00bb et \u00ab\u202fB8ZS\u202f\u00bb pour observer directement les substitutions.'
      ],
      objectives: [
        'Identifier les propri\u00e9t\u00e9s (DC, bande, synchronisation) de chaque famille de codes.',
        'Expliquer le m\u00e9canisme de substitution HDB3 et B8ZS.',
        'Relier le choix du code de ligne \u00e0 son contexte d\u2019usage (E1, T1, Ethernet).'
      ],
      questions: [
        'Pourquoi Manchester est-il pr\u00e9f\u00e9r\u00e9 dans Ethernet malgr\u00e9 sa bande plus large ?',
        'Quel crit\u00e8re favorise HDB3 par rapport \u00e0 AMI simple ?',
        'En quoi B8ZS et HDB3 sont-ils analogues mais distincts ?'
      ],
      tpSteps: [
        { title: 'Observer NRZ et RZ', text: 'Saisissez \u00ab\u202f10110100\u202f\u00bb et comparez NRZ-L, NRZ-M et RZ : amplitude, transitions et largeur spectrale.', target: '.cl-code-grid' },
        { title: 'Provoquer une perte de synchro AMI', text: 'Entrez \u00ab\u202f100000001\u202f\u00bb et observez la longue plage plate en AMI : justifiez le probl\u00e8me de synchronisation.', target: '.cl-stage' },
        { title: 'Comparer HDB3 et B8ZS', text: 'Activez le pr\u00e9r\u00e9glage B8ZS/HDB3, localisez les marqueurs V et B et expliquez les substitutions.', target: '.cl-stage' }
      ]
    },
    modulations: {
      title: 'Modulations num\u00e9riques',
      subtitle: 'Lisez la constellation comme une carte de d\u00e9cision o\u00f9 se combinent phase, amplitude et robustesse au bruit.',
      help: [
        'En PSK, observez surtout l\u2019angle ; en QAM, amplitude et angle sont tous deux porteurs d\u2019information.',
        'Plus la constellation est dense, plus la distance minimale entre symboles diminue.',
        'Reliez la trajectoire I/Q \u00e0 la forme temporelle g\u00e9n\u00e9r\u00e9e.'
      ],
      objectives: [
        'Identifier la grandeur informative dominante selon la famille de modulation.',
        'Relier le nombre de bits par symbole \u00e0 la densit\u00e9 de constellation.',
        'Interpr\u00e9ter une s\u00e9quence binaire comme une suite de points I/Q.'
      ],
      questions: [
        'Quelle modulation offre la meilleure robustesse \u00e0 puissance \u00e9gale ?',
        'Pourquoi 64-QAM exige-t-elle un meilleur SNR que QPSK ?',
        'Comment la trajectoire I/Q refl\u00e8te-t-elle la succession des symboles ?'
      ],
      tpSteps: [
        { title: 'Choisir une famille', text: 'S\u00e9lectionnez une modulation et notez la grandeur physique qui porte l\u2019information.', target: '.panel' },
        { title: 'Comparer les constellations', text: 'Passez de BPSK \u00e0 16-QAM et observez la r\u00e9duction de l\u2019\u00e9cart entre points.', target: '.lab-kpi-grid' },
        { title: 'Lire la forme d\u2019onde', text: 'Reliez chaque symbole affich\u00e9 \u00e0 son influence sur la trajectoire temporelle.', target: '.stage' }
      ]
    },
    transmission: {
      title: 'Transmission sur canal',
      subtitle: 'Analysez la cha\u00eene compl\u00e8te avec ses limitations physiques : bruit, att\u00e9nuation, gigue et filtrage.',
      help: [
        'Commencez par le SNR et la marge de capacit\u00e9 avant d\u2019interpr\u00e9ter BER ou SER.',
        'La gigue agit sur le temps de d\u2019\u00e9chantillonnage alors que le bruit agit sur l\u2019amplitude re\u00e7ue.',
        'Utilisez les pr\u00e9r\u00e9glages comme sc\u00e9narios de bilan de liaison.'
      ],
      objectives: [
        '\u00c9valuer la robustesse d\u2019un lien num\u00e9rique complet.',
        'Relier une contrainte de canal \u00e0 une d\u00e9gradation de la d\u00e9cision.',
        'Interpr\u00e9ter la capacit\u00e9 th\u00e9orique au regard du d\u00e9bit demand\u00e9.'
      ],
      questions: [
        'Quel param\u00e8tre referme le plus rapidement l\u2019\u0153il ?',
        'Dans quels cas le FEC apporte-t-il une marge utile ?',
        'Pourquoi une modulation dense est-elle plus sensible \u00e0 distance \u00e9gale ?'
      ],
      tpSteps: [
        { title: '\u00c9tablir un cas nominal', text: 'Choisissez un canal propre puis relevez SNR, d\u00e9bit et \u00e9tat du lien.', target: '.lab-preset-bar' },
        { title: 'D\u00e9grader un param\u00e8tre', text: 'Augmentez distance, bruit ou jitter s\u00e9par\u00e9ment pour identifier leur impact dominant.', target: '.lab-kpi-grid' },
        { title: 'Conclure sur la r\u00e9ception', text: 'Interpr\u00e9tez BER/SER et diagramme de l\u2019\u0153il pour justifier la qualit\u00e9 finale.', target: '.stage' }
      ]
    },
    multiplexage: {
      title: 'Multiplexage et hi\u00e9rarchies',
      subtitle: 'Passez de la voie \u00e9l\u00e9mentaire \u00e0 l\u2019architecture de transport en distinguant structure, signalisation et agr\u00e9gation.',
      help: [
        'Rep\u00e9rez d\u2019abord la ressource utile, puis l\u2019overhead n\u00e9cessaire \u00e0 la synchronisation et \u00e0 la supervision.',
        'Comparez toujours voix utile, signalisation et d\u00e9bit ligne.',
        'Interpr\u00e9tez la hi\u00e9rarchie comme un empilement de tributaires et d\u2019overhead r\u00e9seau.'
      ],
      objectives: [
        'Lire une trame E1 ou T1 au niveau de ses champs fonctionnels.',
        'Expliquer la diff\u00e9rence entre signalisation s\u00e9par\u00e9e et robbed bit signaling.',
        'Relier un niveau PDH/SDH ou SONET \u00e0 sa capacit\u00e9 d\u2019agr\u00e9gation.'
      ],
      questions: [
        'Pourquoi E1 et T1 n\u2019ont-ils pas la m\u00eame efficacit\u00e9 utile ?',
        'Quel est l\u2019int\u00e9r\u00eat d\u2019une hi\u00e9rarchie synchrone face au PDH ?',
        'Que transporte r\u00e9ellement l\u2019overhead dans une trame r\u00e9seau ?'
      ],
      tpSteps: [
        { title: 'Cadrer la trame', text: 'Commencez par IT0 et distinguez trame paire et impaire.', target: '.lab-preset-bar' },
        { title: 'Observer la CAS', text: 'Passez sur IT16 pour comprendre l\u2019organisation de la signalisation.', target: '.lab-kpi-grid' },
        { title: 'Lire une voie utile', text: 'Comparez ensuite une case de voix utile avec les champs d\u2019overhead.', target: '.stage' }
      ],
      exercises: [
        {
          title: 'Identifier les rôles d’IT0 et IT16',
          prompt: 'Expliquez pourquoi IT0 et IT16 ne peuvent pas être analysés comme des voies utiles ordinaires.',
          correction: [
            'IT0 sert au cadrage et à la supervision.',
            'IT16 sert à la logique de multitrame et à la signalisation CAS.',
            'Ils consomment donc de la structure de trame et non de la charge utile voix.'
          ]
        },
        {
          title: 'Retrouver la capacité utile',
          prompt: 'Justifiez le nombre réel de voies utiles d’un E1 et le débit associé par voie.',
          correction: [
            'Les intervalles réservés à la structure ne transportent pas tous de la voix utile.',
            'Une voie utile reste codée sur 8 bits à 8000 échantillons/s, soit 64 kbit/s.',
            'L’efficacité utile se déduit donc du nombre de canaux réellement disponibles.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Inspection de trame E1',
          objective: 'Séparer cadrage, signalisation et charge utile.',
          actions: [
            'Pointer successivement IT0, IT16 et une voie utile.',
            'Relever leur rôle respectif.',
            'Comparer les informations binaires affichées.',
            'Conclure sur la structure fonctionnelle d’une multitrame.'
          ],
          measures: ['Champ', 'Rôle', 'Information portée', 'Débit utile', 'Conclusion'],
          quantitativeHints: [
            'Rappeler qu’une trame E1 dure 125 µs, soit 8000 trames/s.',
            'Une voie utile de 8 bits émise à 8000 trames/s correspond à 64 kbit/s.',
            'Comparer les champs de structure à un canal utile pour distinguer overhead et charge utile.'
          ],
          validationCriteria: [
            'IT0, IT16 et au moins une voie utile doivent être comparés explicitement.',
            'Le débit utile par voie doit être justifié numériquement.',
            'La conclusion doit relier structure de trame et efficacité de transport.'
          ]
        }
      ],
      measurementHints: ['Champ', 'Fonction', 'Mesure', 'Unité', 'Commentaire']
    },
    'multiplexage-compare': {
      title: 'Comparatif E1 / T1',
      subtitle: 'Mettez en regard deux philosophies historiques du transport t\u00e9l\u00e9phonique num\u00e9rique.',
      help: ['E1 s\u00e9pare mieux structure, signalisation et voies utiles.', 'T1 utilise un F-Bit et, historiquement, du robbed bit signaling.', 'Le bon r\u00e9flexe est de comparer d\u00e9bit ligne, capacit\u00e9 utile et m\u00e9thode de signalisation.'],
      objectives: ['Comparer E1 et T1 sur le plan structurel.', 'Expliquer la notion de robbed bit signaling.', 'Mesurer l\u2019impact de l\u2019overhead et des choix de signalisation.'],
      questions: ['Pourquoi l\u2019E1 est-il souvent qualifi\u00e9 de clear channel ?', 'Quel compromis historique a pouss\u00e9 le T1 vers le robbed bit ?', 'Quelle architecture pr\u00e9f\u00e9rez-vous pour un transport de donn\u00e9es modernes ?'],
      tpSteps: [
        { title: '\u00c9tudier E1', text: 'Commencez par la structure E1 et relevez ses champs r\u00e9serv\u00e9s.', target: '.lab-preset-bar' },
        { title: 'Basculer en T1', text: 'Observez l\u2019apparition du F-Bit et des trames robbed bit.', target: '.lab-kpi-grid' },
        { title: 'Comparer la logique', text: 'Concluez sur la s\u00e9paration ou l\u2019intrusion de la signalisation dans la voix.', target: '.stage' }
      ],
      exercises: [
        {
          title: 'Comparer E1 et T1',
          prompt: 'Expliquez pourquoi E1 et T1 ne présentent pas le même compromis entre structure et capacité utile.',
          correction: [
            'Les deux systèmes n’emploient pas la même organisation de trame.',
            'La signalisation n’est pas intégrée de la même manière à la charge utile.',
            'L’efficacité utile et la lisibilité de la structure diffèrent donc selon la norme.'
          ]
        },
        {
          title: 'Interpréter le robbed bit signaling',
          prompt: 'Montrez pourquoi le robbed bit signaling est historiquement acceptable mais moins transparent pour des données modernes.',
          correction: [
            'Le procédé prélève périodiquement une partie de l’information utile pour la signalisation.',
            'Cela reste tolérable pour certains usages voix classiques.',
            'Pour les données modernes, cette intrusion dégrade la transparence binaire du canal.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Comparatif normatif',
          objective: 'Comparer la structure utile de deux hiérarchies téléphoniques.',
          actions: [
            'Observer la structure E1.',
            'Basculer vers T1.',
            'Relever les différences de signalisation, overhead et charge utile.',
            'Conclure sur la norme la plus adaptée à un transport numérique moderne.'
          ],
          measures: ['Norme', 'Signalisation', 'Charge utile', 'Overhead', 'Conclusion'],
          quantitativeHints: [
            'Comparer le nombre de voies utiles ou la transparence de canal selon E1 et T1.',
            'Identifier numériquement le débit élémentaire d’une voie téléphonique typique.',
            'Noter si la signalisation est séparée ou intrusive dans la charge utile.'
          ],
          validationCriteria: [
            'Le tableau doit faire apparaître au moins trois différences structurelles.',
            'L’analyse doit distinguer capacité utile et logique de signalisation.',
            'La conclusion doit motiver le choix d’une norme pour des données modernes.'
          ]
        }
      ],
      measurementHints: ['Norme', 'Critère', 'Valeur', 'Unité', 'Interprétation']
    },
    'multiplexage-pcm': {
      title: 'PCM + TDM avec audio',
      subtitle: 'Injectez un flux audio p\u00e9dagogique dans une voie et suivez sa place dans la matrice TDM.',
      help: ['La voie 1 sert de fil conducteur entre audio, octet PCM et case de trame.', 'L\u2019oscilloscope montre une num\u00e9risation simplifi\u00e9e mais coh\u00e9rente avec un canal t\u00e9l\u00e9phonique.', 'Le scanner mat\u00e9rialise l\u2019interlacement temporel des voies.'],
      objectives: ['Relier audio analogique, octet PCM et position dans la trame.', 'Comprendre le multiplexage temporel voie par voie.', 'Suivre un tribut jusqu\u2019\u00e0 la hi\u00e9rarchie sup\u00e9rieure.'],
      questions: ['Pourquoi l\u2019utilisateur ne per\u00e7oit-il pas les autres voies du multiplex ?', 'Comment un octet de voix devient-il un tribut r\u00e9seau ?', 'Que change la norme choisie sur le traitement de la voie audio ?'],
      tpSteps: [
        { title: 'Activer l\u2019audio', text: 'Injectez un signal sur la voie 1 et observez son octet live.', target: '#pcmSection' },
        { title: 'Suivre la voie dans la trame', text: 'Rep\u00e9rez la case correspondante dans la matrice TDM.', target: '#trameSection' },
        { title: 'Monter en hi\u00e9rarchie', text: 'Observez comment le flux primaire s\u2019ins\u00e8re dans un niveau de transport sup\u00e9rieur.', target: '#hierarchieSection' }
      ],
      exercises: [
        {
          title: 'Du signal audio à l’octet PCM',
          prompt: 'Expliquez comment un échantillon analogique devient un mot binaire puis un élément de trame.',
          correction: [
            'Le signal analogique est échantillonné puis quantifié.',
            'La valeur quantifiée est codée sur un mot binaire.',
            'Cet octet est ensuite inséré dans un intervalle de temps du multiplex.'
          ]
        },
        {
          title: 'Justifier le partage temporel',
          prompt: 'Montrez pourquoi le multiplexage temporel permet de transporter plusieurs voies sur un même support.',
          correction: [
            'Chaque voie dispose d’un intervalle temporel réservé dans la trame.',
            'Les utilisateurs ne se superposent pas mais se succèdent dans le temps.',
            'La synchronisation garantit que chaque voie récupère son tribut à la réception.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Suivi d’une voie audio',
          objective: 'Suivre un échantillon audio depuis la source jusqu’à la trame.',
          actions: [
            'Activer l’audio.',
            'Observer le code binaire live.',
            'Repérer la voie correspondante dans la matrice TDM.',
            'Noter la correspondance entre signal analogique, octet PCM et case de trame.'
          ],
          measures: ['Voie', 'Octet', 'Position trame', 'Niveau hiérarchique', 'Conclusion'],
          quantitativeHints: [
            'Relever au moins un octet binaire complet issu de la voie audio.',
            'Identifier sa position de voie et son insertion dans la trame TDM.',
            'Relier ce tribut élémentaire au débit téléphonique de référence de 64 kbit/s.'
          ],
          validationCriteria: [
            'Le suivi doit être continu de la source audio jusqu’à la case de trame.',
            'Le relevé doit comporter un octet explicite et son emplacement.',
            'La conclusion doit décrire comment une grandeur analogique devient un tribut numérique.'
          ]
        }
      ],
      measurementHints: ['Voie', 'Code', 'Position', 'Mesure', 'Interprétation']
    },
    'multiplexage-complet': {
      title: 'Laboratoire r\u00e9seau complet',
      subtitle: 'Reliez la source PCM, la trame TDM et la hi\u00e9rarchie PDH/SDH dans un seul parcours p\u00e9dagogique.',
      help: ['Le m\u00eame laboratoire couvre source, trame et agr\u00e9gation.', 'Utilisez les sauts rapides pour passer du niveau voie au niveau r\u00e9seau.', 'Les indicateurs de capacit\u00e9 permettent de relier architecture et \u00e9chelle de trafic.'],
      objectives: ['Comprendre le continuum PCM ? TDM ? hi\u00e9rarchie.', 'Comparer les architectures E1/PDH et T1/SONET.', 'Lire la capacit\u00e9 d\u2019agr\u00e9gation \u00e0 plusieurs niveaux.'],
      questions: ['\u00c0 quel niveau appara\u00ee t la notion de tribut ?', 'Pourquoi le transport optique synchrone simplifie-t-il l\u2019exploitation ?', 'Quel lien faites-vous entre voie \u00e0 64 kbit/s et capacit\u00e9 de niveau sup\u00e9rieur ?'],
      tpSteps: [
        { title: 'Commencer au PCM', text: 'Observez d\u2019abord comment un octet est produit \u00e0 partir d\u2019une source audio.', target: '#pcmSection' },
        { title: 'Lire la matrice', text: 'Rep\u00e9rez ensuite la place de cet octet dans la trame primaire.', target: '#trameSection' },
        { title: 'Passer au r\u00e9seau', text: 'Terminez sur la hi\u00e9rarchie d\u2019agr\u00e9gation pour quantifier la capacit\u00e9 transport\u00e9e.', target: '#hierarchieSection' }
      ],
      exercises: [
        {
          title: 'Relier source, trame et réseau',
          prompt: 'Expliquez comment un même flux peut être suivi du niveau audio jusqu’au niveau hiérarchique de transport.',
          correction: [
            'Le signal source devient d’abord un octet PCM.',
            'Cet octet occupe ensuite un intervalle de temps dans une trame primaire.',
            'La trame primaire devient enfin un tribut au sein d’une hiérarchie réseau supérieure.'
          ]
        },
        {
          title: 'Lire une agrégation de capacité',
          prompt: 'Montrez comment interpréter le passage d’un niveau de multiplexage à un autre en termes de capacité et d’overhead.',
          correction: [
            'Chaque niveau agrège plusieurs flux de niveau inférieur.',
            'Le débit de sortie inclut la charge utile et l’overhead de structure/synchronisation.',
            'La capacité utile ne se résume donc pas au seul débit ligne brut.'
          ]
        }
      ],
      manipulations: [
        {
          title: 'Chaîne complète de multiplexage',
          objective: 'Suivre un flux du niveau PCM jusqu’au transport hiérarchique.',
          actions: [
            'Observer un octet audio produit en amont.',
            'Le localiser dans la trame primaire.',
            'Monter ensuite dans la hiérarchie réseau.',
            'Comparer entrée, sortie et capacité affichée à chaque niveau.'
          ],
          measures: ['Niveau', 'Entrées', 'Sortie', 'Capacité', 'Conclusion'],
          quantitativeHints: [
            'Comparer le débit ou la capacité à au moins deux niveaux hiérarchiques.',
            'Repérer que la sortie agrégée excède la simple somme utile à cause de l’overhead.',
            'Relier un canal élémentaire à la capacité globale transportée au niveau supérieur.'
          ],
          validationCriteria: [
            'Le tableau doit contenir plusieurs niveaux de la hiérarchie.',
            'L’exploitation doit distinguer entrées, sortie et overhead.',
            'La conclusion doit décrire le passage d’un tribut élémentaire à une capacité réseau agrégée.'
          ]
        }
      ],
      measurementHints: ['Niveau', 'Entrées', 'Sortie', 'Mesure', 'Interprétation']
    }
  };

  const LAB_PAGE_GUIDE_OVERRIDES = {
    'analogique-emetteur': {
      title: 'Émetteur AM / FM',
      subtitle: 'Comparez précisément les grandeurs modulées, l’occupation spectrale et la robustesse associées à l’AM et à la FM.',
      expectedAnswers: [
        'En AM, l’information suit principalement l’enveloppe de la porteuse.',
        'En FM, l’amplitude reste presque constante et l’information se lit sur la fréquence instantanée.',
        'La bande FM augmente avec la déviation et la fréquence du message, alors que l’AM se lit d’abord via ses bandes latérales.'
      ],
      exercises: [
        {
          title: 'Comparer enveloppe et fréquence instantanée',
          prompt: 'Expliquez comment distinguer expérimentalement un signal AM d’un signal FM lorsque le message modulant reste identique.',
          correction: [
            'En AM, l’enveloppe suit directement le message et varie visiblement.',
            'En FM, l’enveloppe reste quasi constante alors que l’espacement des oscillations varie.',
            'La différence de lecture doit être reliée à la grandeur réellement modulée.'
          ]
        },
        {
          title: 'Justifier la bande occupée',
          prompt: 'Montrez comment relier les réglages de fréquence message et de déviation à la bande observée sur l’émetteur.',
          correction: [
            'En AM, les bandes latérales s’écartent de la porteuse quand la fréquence du message augmente.',
            'En FM, la bande augmente avec la déviation et avec la composante fréquentielle du message.',
            'La conclusion doit comparer explicitement le coût spectral des deux solutions.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Dans quel cas l’enveloppe du signal transmis est-elle directement porteuse de l’information ? ',
          options: ['AM', 'FM', 'PCM'],
          answer: 0,
          explanation: 'En AM, le message est lu sur l’enveloppe de la porteuse.'
        },
        {
          question: 'Quel réglage accroît le plus directement la bande occupée en FM ? ',
          options: ['La déviation fréquentielle', 'La couleur du tracé', 'Le nombre de bits'],
          answer: 0,
          explanation: 'La déviation fréquentielle élargit directement la bande occupée en FM.'
        },
        {
          question: 'Quelle propriété rend la FM plus tolérante aux variations d’amplitude parasites ? ',
          options: ['Son enveloppe reste presque constante', 'Elle n’utilise pas de porteuse', 'Elle supprime le bruit thermique'],
          answer: 0,
          explanation: 'La FM code surtout l’information sur la fréquence instantanée, pas sur l’amplitude.'
        }
      ]
    },
    'analogique-amplificateur': {
      title: 'Amplificateur et saturation',
      subtitle: 'Déterminez la zone de linéarité utile, repérez l’écrêtage et reliez-le à la fidélité de transmission.',
      expectedAnswers: [
        'La zone linéaire conserve la proportionnalité entrée/sortie.',
        'La saturation apparaît quand la sortie atteint ses limites d’alimentation et se traduit par un écrêtage.',
        'Au-delà du seuil, augmenter le gain dégrade surtout la fidélité au lieu d’augmenter le signal utile.'
      ],
      exercises: [
        {
          title: 'Identifier le seuil de saturation',
          prompt: 'Décrivez la méthode de relevé la plus fiable pour identifier expérimentalement le début de saturation d’un amplificateur.',
          correction: [
            'Fixer l’entrée puis augmenter progressivement le gain.',
            'Comparer la croissance attendue de la sortie au comportement réellement observé.',
            'Repérer le premier point où la sortie cesse d’être proportionnelle et où l’écrêtage apparaît.'
          ]
        },
        {
          title: 'Interpréter la fidélité',
          prompt: 'Expliquez pourquoi la puissance de sortie ne suffit pas à juger la qualité d’un amplificateur en régime saturé.',
          correction: [
            'La sortie peut rester forte tout en étant déformée.',
            'L’énergie supplémentaire se convertit en distorsion et en composantes harmoniques.',
            'La fidélité doit donc être jugée avec la forme d’onde et non avec la seule amplitude.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel symptôme visuel signale le plus directement la saturation ? ',
          options: ['L’écrêtage des crêtes', 'La disparition du temps', 'L’augmentation du nombre de bits'],
          answer: 0,
          explanation: 'Les crêtes aplaties indiquent que la sortie atteint ses limites physiques.'
        },
        {
          question: 'En régime linéaire, la sortie doit être principalement : ',
          options: ['Proportionnelle à l’entrée', 'Indépendante du gain', 'Toujours égale à Vcc'],
          answer: 0,
          explanation: 'La propriété clé d’un régime linéaire est la proportionnalité entrée/sortie.'
        },
        {
          question: 'Quand l’amplificateur sature, augmenter le gain produit surtout : ',
          options: ['Plus de distorsion', 'Moins de bande passante utile sans déformation', 'Une modulation FM'],
          answer: 0,
          explanation: 'Au-delà du seuil, le gain supplémentaire se traduit surtout par de la distorsion.'
        }
      ]
    },
    'analogique-recepteur': {
      title: 'Récepteur et démodulation d’enveloppe',
      subtitle: 'Étudiez comment bruit et filtrage déterminent la qualité de restitution du message démodulé.',
      expectedAnswers: [
        'Un filtre trop rapide laisse passer trop de fluctuations parasites.',
        'Un filtre trop lent lisse aussi l’enveloppe utile du message.',
        'Le compromis se juge à partir du SNR restitué et de la qualité temporelle du message final.'
      ],
      exercises: [
        {
          title: 'Choisir la constante de temps',
          prompt: 'Expliquez comment choisir la constante de temps du filtre d’enveloppe pour suivre le message sans laisser passer la HF.',
          correction: [
            'La constante doit rester supérieure à la période de la porteuse pour lisser la HF.',
            'Elle doit rester suffisamment faible pour suivre les variations utiles du message.',
            'Le meilleur réglage est donc un compromis temporel et non une valeur arbitraire.'
          ]
        },
        {
          title: 'Relier SNR et qualité perçue',
          prompt: 'Montrez pourquoi un bon SNR ne suffit pas si le filtrage de détection d’enveloppe reste mal réglé.',
          correction: [
            'Un bon SNR améliore la propreté du signal reçu mais ne corrige pas un mauvais filtrage.',
            'Un filtre mal choisi peut déformer le message même avec peu de bruit.',
            'Il faut donc analyser simultanément bruit et dynamique du filtre.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel réglage laisse le plus facilement passer les fluctuations rapides parasites ? ',
          options: ['Une constante de temps trop faible', 'Une constante de temps trop élevée', 'Un groupe PCM'],
          answer: 0,
          explanation: 'Un filtre trop rapide suit aussi les variations non désirées.'
        },
        {
          question: 'Quel effet d’un filtre trop lent observe-t-on en démodulation d’enveloppe ? ',
          options: ['Le message est trop lissé', 'Le SNR devient infini', 'La modulation devient QAM'],
          answer: 0,
          explanation: 'Un filtre trop lent étouffe les variations utiles du message.'
        },
        {
          question: 'Pour juger la restitution, il faut croiser principalement : ',
          options: ['SNR et forme du message restitué', 'Couleur et police du graphe', 'Nombre de pages du module'],
          answer: 0,
          explanation: 'La qualité perçue dépend à la fois du bruit et du filtrage.'
        }
      ]
    },
    'numerisation-can': {
      title: 'Convertisseur CAN',
      subtitle: 'Distinguez clairement aliasing, quantification et coût de conversion dans un raisonnement d’ingénierie.',
      expectedAnswers: [
        'Le critère de Nyquist impose de choisir Fe au moins supérieure à deux fois la fréquence maximale utile.',
        'Le nombre de bits agit sur le pas de quantification et donc sur l’erreur d’amplitude.',
        'L’aliasing et la quantification sont deux défauts distincts qui se corrigent par des paramètres différents.'
      ],
      exercises: [
        {
          title: 'Séparer deux familles d’erreurs',
          prompt: 'Expliquez comment montrer expérimentalement qu’un signal mal échantillonné et un signal mal quantifié ne présentent pas la même dégradation.',
          correction: [
            'L’aliasing modifie la fréquence apparente du signal reconstruit.',
            'La quantification conserve la dynamique globale mais crée des paliers et une erreur d’amplitude.',
            'Le diagnostic doit donc croiser fréquence apparente et finesse des niveaux.'
          ]
        },
        {
          title: 'Dimensionner Fe et B',
          prompt: 'Proposez une méthode simple pour choisir Fe et B quand la bande utile et la précision cible sont connues.',
          correction: [
            'Choisir d’abord Fe à partir de la fréquence maximale utile avec une marge pratique.',
            'Choisir ensuite B à partir de l’erreur d’amplitude admissible ou du SQNR visé.',
            'Vérifier enfin l’impact de Fe × B sur le débit numérique produit.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel réglage combat directement l’aliasing ? ',
          options: ['Augmenter Fe', 'Augmenter seulement B', 'Modifier la couleur du tracé'],
          answer: 0,
          explanation: 'L’aliasing est un défaut d’échantillonnage, donc Fe est le paramètre critique.'
        },
        {
          question: 'Que réduit principalement l’augmentation du nombre de bits ? ',
          options: ['L’erreur de quantification', 'La fréquence du message', 'Le jitter de canal'],
          answer: 0,
          explanation: 'Plus de bits signifie plus de niveaux et donc un pas de quantification plus fin.'
        },
        {
          question: 'Un cas sous-Nyquist se reconnaît surtout par : ',
          options: ['Un repliement spectral apparent', 'Une hausse automatique du SQNR', 'Une modulation de phase'],
          answer: 0,
          explanation: 'Le signal semble changer de fréquence apparente quand Fe est insuffisante.'
        }
      ]
    },
    'modulations-symbol': {
      title: 'Analyse d’un symbole',
      subtitle: 'Reliez mot binaire, point I/Q et équation temporelle dans une lecture symbolique précise.',
      expectedAnswers: [
        'Chaque mot binaire valide sélectionne un symbole unique dans la constellation.',
        'En PSK, la lecture se fait surtout sur l’angle ; en QAM, sur l’angle et la distance à l’origine.',
        'La forme d’onde s(t) découle directement des coordonnées ou paramètres du symbole choisi.'
      ],
      exercises: [
        {
          title: 'Du bit au point I/Q',
          prompt: 'Expliquez le chemin complet qui permet de passer d’un mot binaire saisi à un point géométrique dans le plan I/Q.',
          correction: [
            'Le mot binaire est interprété comme un symbole de l’alphabet choisi.',
            'Ce symbole est associé à des coordonnées I/Q ou à une grandeur équivalente.',
            'Le plan I/Q offre ensuite une représentation géométrique de la décision symbole.'
          ]
        },
        {
          title: 'Lire la grandeur dominante',
          prompt: 'Montrez comment distinguer visuellement si l’information est portée surtout par la phase, l’amplitude ou la fréquence relative.',
          correction: [
            'La PSK privilégie les angles des points.',
            'La QAM combine distance à l’origine et angle.',
            'La FSK se lit plutôt par un décalage fréquentiel que par une constellation I/Q classique.'
          ]
        }
      ],
      quiz: [
        {
          question: 'En PSK, la grandeur informative principale est : ',
          options: ['La phase', 'La température du support', 'Le nombre de trames E1'],
          answer: 0,
          explanation: 'La PSK code les symboles principalement par l’angle.'
        },
        {
          question: 'En QAM, la distance à l’origine est surtout liée à : ',
          options: ['L’amplitude du symbole', 'La longueur du câble', 'Le jitter'],
          answer: 0,
          explanation: 'En QAM, l’amplitude contribue directement à la position du point.'
        },
        {
          question: 'Un mot binaire valide doit conduire à : ',
          options: ['Un seul symbole', 'Deux symboles simultanés', 'Aucune représentation'],
          answer: 0,
          explanation: 'Chaque mot de longueur correcte sélectionne un unique symbole de l’alphabet.'
        }
      ]
    },
    'modulations-sequence': {
      title: 'Séquence de symboles',
      subtitle: 'Analysez les transitions symboliques et leur impact sur la trajectoire I/Q et l’onde temporelle.',
      expectedAnswers: [
        'L’ordre des symboles modifie la trajectoire sans changer l’alphabet de départ.',
        'Deux séquences de même modulation peuvent générer des tracés I/Q différents.',
        'La lecture dynamique complète la lecture statique de la constellation.'
      ],
      exercises: [
        {
          title: 'Comparer deux séquences',
          prompt: 'Expliquez pourquoi deux séquences construites avec les mêmes symboles peuvent donner des trajectoires I/Q différentes.',
          correction: [
            'L’ordre temporel des symboles change les segments reliant les points.',
            'La constellation reste la même mais la trajectoire dépend des transitions successives.',
            'Il faut donc distinguer alphabet disponible et chemin effectivement parcouru.'
          ]
        },
        {
          title: 'Lire l’onde temporelle',
          prompt: 'Montrez ce que la forme d’onde apporte de plus par rapport à la seule constellation.',
          correction: [
            'La forme d’onde met en évidence la succession temporelle des symboles.',
            'Elle aide à lire les transitions et les changements rapides.',
            'Elle permet d’articuler la vue géométrique I/Q et la réalisation physique dans le temps.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Deux séquences de même famille peuvent-elles produire des trajectoires différentes ? ',
          options: ['Oui, si l’ordre des symboles change', 'Non, jamais', 'Seulement en PCM'],
          answer: 0,
          explanation: 'La trajectoire dépend de la succession temporelle des symboles.'
        },
        {
          question: 'La constellation seule décrit surtout : ',
          options: ['Les positions symboliques possibles', 'Le bruit thermique du câble', 'La structure E1'],
          answer: 0,
          explanation: 'Elle présente l’alphabet disponible, pas la dynamique complète des transitions.'
        },
        {
          question: 'La lecture temporelle complète l’I/Q parce qu’elle montre : ',
          options: ['L’enchaînement des symboles', 'La température du processeur', 'Le débit du routeur'],
          answer: 0,
          explanation: 'La vue temporelle matérialise les transitions successives dans le temps.'
        }
      ]
    },
    'modulations-dashboard': {
      title: 'Tableau de bord des modulations',
      subtitle: 'Comparez BER, efficacité spectrale et densité de modulation pour choisir une solution adaptée au canal.',
      expectedAnswers: [
        'Quand M augmente, l’efficacité spectrale augmente mais la robustesse diminue à Eb/N0 donné.',
        'Le roll-off augmente la bande occupée et réduit l’efficacité spectrale à débit identique.',
        'Le choix de modulation dépend d’un compromis entre capacité visée et marge de bruit disponible.'
      ],
      exercises: [
        {
          title: 'Comparer deux ordres de modulation',
          prompt: 'Expliquez comment justifier le choix entre une modulation robuste et une modulation dense à Eb/N0 voisin.',
          correction: [
            'La modulation robuste présente une meilleure marge de décision.',
            'La modulation dense transporte davantage de bits par symbole.',
            'Le choix final dépend de la qualité cible et de la capacité utile recherchée.'
          ]
        },
        {
          title: 'Lire l’effet du roll-off',
          prompt: 'Montrez pourquoi le roll-off doit être lu en même temps que l’efficacité spectrale affichée.',
          correction: [
            'Un roll-off plus élevé élargit la bande occupée.',
            'À débit symbole identique, l’efficacité spectrale apparente diminue.',
            'Le bon réglage dépend donc de la compacité fréquentielle recherchée.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Que se passe-t-il en général quand l’ordre M augmente à Eb/N0 constant ? ',
          options: ['Le BER/TEB devient plus exigeant', 'Le bruit disparaît', 'Le roll-off devient nul automatiquement'],
          answer: 0,
          explanation: 'Des points plus rapprochés rendent la décision plus sensible aux perturbations.'
        },
        {
          question: 'Quel paramètre agit directement sur l’efficacité spectrale affichée sans modifier la famille de modulation ? ',
          options: ['Le roll-off', 'Le nom du symbole', 'Le fond de page'],
          answer: 0,
          explanation: 'Le roll-off influe sur la bande occupée et donc sur l’efficacité spectrale.'
        },
        {
          question: 'Pour un canal très bruité, on choisira plutôt : ',
          options: ['Une modulation d’ordre plus faible', 'La modulation la plus dense possible', 'Une hiérarchie SONET'],
          answer: 0,
          explanation: 'Un ordre plus faible laisse davantage de marge de décision.'
        }
      ]
    },
    'transmission-base': {
      title: 'Transmission pédagogique complète',
      subtitle: 'Établissez un bilan de liaison simplifié en reliant SNR, marge, BER et lecture de l’œil.',
      expectedAnswers: [
        'Le lien se juge d’abord par le SNR, la marge de capacité et l’état de décision binaire.',
        'La gigue agit surtout sur le timing de décision, alors que le bruit agit davantage sur l’amplitude utile.',
        'Une action corrective doit être choisie en fonction de la cause dominante de dégradation.'
      ],
      exercises: [
        {
          title: 'Choisir les KPI principaux',
          prompt: 'Expliquez pourquoi un bilan de liaison ne peut pas se limiter à un seul indicateur comme le débit brut.',
          correction: [
            'Le débit brut ne renseigne pas sur la marge réelle du canal.',
            'Le SNR et la marge de capacité relient la demande au support physique.',
            'Le BER et l’œil montrent ensuite l’impact pratique sur la décision reçue.'
          ]
        },
        {
          title: 'Justifier une action corrective',
          prompt: 'Montrez comment choisir entre FEC, filtrage, gain TX ou baisse d’ordre de modulation selon le scénario observé.',
          correction: [
            'Le FEC aide quand le lien reste récupérable mais trop juste.',
            'Le filtrage aide si l’ISI ou la forme d’onde dominent.',
            'Le gain TX ou la baisse d’ordre agissent quand la marge physique devient insuffisante.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel indicateur relie directement le débit demandé à la limite du canal ? ',
          options: ['La marge de capacité', 'La couleur du graphe', 'Le nombre de curseurs'],
          answer: 0,
          explanation: 'La marge de capacité compare directement besoin et capacité théorique.'
        },
        {
          question: 'Quel phénomène ferme surtout l’œil horizontalement ? ',
          options: ['Le jitter', 'Le nombre de bits', 'Le PCM'],
          answer: 0,
          explanation: 'Le jitter agit principalement sur l’instant d’échantillonnage.'
        },
        {
          question: 'Le FEC améliore surtout : ',
          options: ['La robustesse globale du système', 'La fréquence porteuse physique', 'La structure mécanique du câble'],
          answer: 0,
          explanation: 'Le FEC augmente la tolérance aux erreurs sans changer le canal lui-même.'
        }
      ]
    },
    'transmission-dsp': {
      title: 'Traitement du signal avancé',
      subtitle: 'Croisez constellation, spectre, œil et SER pour lire le canal numérique comme un ingénieur système.',
      expectedAnswers: [
        'Une constellation plus diffuse annonce une hausse des erreurs de symbole.',
        'Le filtrage RRC agit à la fois sur l’occupation spectrale et sur l’ISI.',
        'La qualité de canal doit être lue simultanément sur les vues temporelles, fréquentielles et géométriques.'
      ],
      exercises: [
        {
          title: 'Relier SER et constellation',
          prompt: 'Expliquez pourquoi la lecture de la constellation permet souvent d’anticiper la dégradation du SER.',
          correction: [
            'Quand les nuages sont bien séparés, la marge de décision reste confortable.',
            'Quand ils s’élargissent ou se rapprochent, les erreurs de symbole augmentent.',
            'La géométrie complète donc utilement la mesure numérique du SER.'
          ]
        },
        {
          title: 'Lire le rôle du filtre RRC',
          prompt: 'Montrez comment le filtrage RRC peut améliorer l’échantillonnage utile tout en modelant la bande occupée.',
          correction: [
            'Le RRC limite l’ISI au bon instant d’échantillonnage.',
            'Il façonne aussi la bande occupée en fonction du roll-off.',
            'Le compromis se lit donc à la fois dans le spectre et dans l’œil.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Une constellation qui se diffuse indique généralement : ',
          options: ['Une hausse probable du SER', 'Une baisse automatique du débit', 'Une conversion E1'],
          answer: 0,
          explanation: 'Des nuages plus diffus réduisent la marge de décision symbole.'
        },
        {
          question: 'Le rôle du filtre RRC est principalement de : ',
          options: ['Limiter l’ISI et modeler le spectre', 'Créer une modulation analogique', 'Remplacer le canal'],
          answer: 0,
          explanation: 'Le filtrage RRC agit conjointement sur le domaine temporel et fréquentiel.'
        },
        {
          question: 'Quel indicateur facilite la comparaison entre modulations d’ordres différents ? ',
          options: ['Eb/N0', 'La couleur des points', 'Le numéro de page'],
          answer: 0,
          explanation: 'Eb/N0 normalise l’analyse énergétique par bit utile.'
        }
      ]
    },
    'multiplexage-e1': {
      title: 'Multitrame E1',
      subtitle: 'Décodez la structure PCM 30/32 en distinguant cadrage, signalisation et charge utile.',
      expectedAnswers: [
        'IT0 sert au cadrage et à la supervision de trame.',
        'IT16 sert à la logique de multitrame et à la signalisation CAS.',
        'Une voie utile E1 correspond à 64 kbit/s lorsqu’elle transporte 8 bits sur 8000 trames/s.'
      ],
      exercises: [
        {
          title: 'Identifier les champs réservés',
          prompt: 'Expliquez comment distinguer rapidement, à l’écran, un champ de structure d’un intervalle de temps utile.',
          correction: [
            'Un champ de structure porte une fonction de cadrage ou de signalisation.',
            'Une voie utile transporte au contraire une charge binaire associée à un canal.',
            'La comparaison fonctionnelle permet de séparer overhead et charge utile.'
          ]
        },
        {
          title: 'Justifier le 64 kbit/s',
          prompt: 'Montrez comment retrouver numériquement le débit élémentaire d’une voie utile E1.',
          correction: [
            'Une trame E1 revient toutes les 125 µs, soit 8000 fois par seconde.',
            'Chaque voie utile apporte 8 bits par trame.',
            'Le débit est donc 8 × 8000 = 64 kbit/s.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quel intervalle de temps porte principalement la signalisation CAS dans l’E1 ? ',
          options: ['IT16', 'IT0', 'Toutes les voies utiles'],
          answer: 0,
          explanation: 'IT16 est dédié à la logique de signalisation de multitrame.'
        },
        {
          question: 'Quel champ sert au cadrage de trame ? ',
          options: ['IT0', 'IT16', 'Une voie utile quelconque'],
          answer: 0,
          explanation: 'IT0 porte les informations de structure et de supervision.'
        },
        {
          question: 'Le débit élémentaire d’une voie utile E1 vaut : ',
          options: ['64 kbit/s', '2 Mbit/s', '8 kbit/s'],
          answer: 0,
          explanation: 'Chaque voie transporte 8 bits à 8000 trames/s.'
        }
      ]
    },
    'multiplexage-compare': {
      title: 'Comparatif E1 / T1',
      subtitle: 'Mettez en regard deux philosophies historiques de transport téléphonique numérique et leurs compromis utiles.',
      expectedAnswers: [
        'L’E1 sépare mieux les ressources utiles et la signalisation que le T1 historique.',
        'Le robbed bit signaling prélève périodiquement une partie du flux utile.',
        'La meilleure architecture pour des données modernes est celle qui préserve la transparence binaire du canal.'
      ],
      exercises: [
        {
          title: 'Comparer deux philosophies de trame',
          prompt: 'Expliquez pourquoi E1 et T1 ne peuvent pas être comparés uniquement par leur débit ligne brut.',
          correction: [
            'Le débit brut ne dit rien de la place prise par la structure et la signalisation.',
            'Il faut comparer simultanément charge utile, overhead et méthode de signalisation.',
            'L’efficacité utile peut donc différer malgré des débits ligne connus.'
          ]
        },
        {
          title: 'Évaluer la transparence binaire',
          prompt: 'Montrez pourquoi le robbed bit signaling peut être acceptable pour la voix historique mais moins pour les données modernes.',
          correction: [
            'La voix tolère certaines altérations périodiques limitées.',
            'Les données numériques exigent une meilleure transparence binaire.',
            'Prélever des bits utiles pour la signalisation devient alors plus pénalisant.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Quelle architecture est souvent dite plus “clear channel” ? ',
          options: ['E1', 'T1 avec robbed bit', 'FM'],
          answer: 0,
          explanation: 'L’E1 sépare plus explicitement les ressources utiles et la signalisation.'
        },
        {
          question: 'Le robbed bit signaling consiste à : ',
          options: ['Prélever périodiquement une partie du flux utile', 'Ajouter du bruit RF', 'Multiplier les symboles QAM'],
          answer: 0,
          explanation: 'Une partie de l’information utile est réutilisée à des fins de signalisation.'
        },
        {
          question: 'Pour des données modernes, on privilégie généralement : ',
          options: ['La meilleure transparence binaire possible', 'Le plus grand nombre de voyants', 'Le plus petit écran'],
          answer: 0,
          explanation: 'Les données modernes supportent mal une intrusion de la signalisation dans l’utile.'
        }
      ]
    },
    'multiplexage-pcm': {
      title: 'PCM + TDM avec audio',
      subtitle: 'Suivez un échantillon audio, son codage PCM puis son insertion dans la trame temporelle.',
      expectedAnswers: [
        'Le signal analogique est d’abord échantillonné puis quantifié.',
        'La valeur quantifiée devient un mot binaire inséré dans un intervalle de temps.',
        'Le multiplexage temporel permet à plusieurs voies de partager le même support sans se superposer simultanément.'
      ],
      exercises: [
        {
          title: 'Du signal à l’octet',
          prompt: 'Expliquez comment un échantillon audio instantané se transforme en octet PCM visible dans l’interface.',
          correction: [
            'Le signal est prélevé à un instant donné par échantillonnage.',
            'La valeur est quantifiée puis codée sur un mot binaire.',
            'Cet octet devient alors la représentation numérique d’un échantillon de voie.'
          ]
        },
        {
          title: 'Justifier le partage temporel',
          prompt: 'Montrez pourquoi plusieurs canaux peuvent être transportés sans se mélanger quand le multiplexage est temporel.',
          correction: [
            'Chaque voie possède un intervalle de temps réservé dans la trame.',
            'Les utilisateurs se succèdent dans le temps au lieu de se superposer.',
            'La synchronisation permet de restituer chaque tribut à la bonne voie.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Dans un multiplexage temporel, plusieurs voies partagent le support principalement : ',
          options: ['Par alternance dans le temps', 'Par variation de couleur', 'Par modulation FM obligatoire'],
          answer: 0,
          explanation: 'Le TDM sépare les canaux par intervalles temporels réservés.'
        },
        {
          question: 'Un octet PCM représente principalement : ',
          options: ['La valeur codée d’un échantillon', 'Une porteuse radio', 'Un bruit parasite'],
          answer: 0,
          explanation: 'Le mot PCM code numériquement un échantillon analogique quantifié.'
        },
        {
          question: 'Pour retrouver la bonne voie à la réception, il faut surtout : ',
          options: ['La synchronisation de trame', 'Supprimer toutes les autres voies', 'Changer de modulation à chaque octet'],
          answer: 0,
          explanation: 'La synchronisation permet d’associer chaque intervalle temporel à la bonne voie.'
        }
      ]
    },
    'multiplexage-complet': {
      title: 'Laboratoire réseau complet',
      subtitle: 'Reliez source PCM, trame primaire et hiérarchie d’agrégation dans une lecture réseau cohérente.',
      expectedAnswers: [
        'La chaîne complète relie un échantillon source à un tribut de transport hiérarchique.',
        'Chaque niveau ajoute sa logique propre d’agrégation et d’overhead.',
        'La capacité utile ne se confond jamais exactement avec le débit ligne brut.'
      ],
      exercises: [
        {
          title: 'Suivre un tribut de bout en bout',
          prompt: 'Expliquez comment un même flux peut être suivi depuis sa création PCM jusqu’à son insertion dans un niveau hiérarchique supérieur.',
          correction: [
            'Le flux est d’abord produit comme mot PCM élémentaire.',
            'Il prend ensuite place dans une trame primaire TDM.',
            'Cette trame devient enfin un tribut d’un niveau de transport supérieur.'
          ]
        },
        {
          title: 'Comparer utile et overhead',
          prompt: 'Montrez pourquoi la capacité d’un niveau supérieur ne se résume pas à la simple somme des flux utiles en entrée.',
          correction: [
            'Chaque niveau ajoute des informations de structure, synchronisation ou supervision.',
            'Le débit de sortie inclut donc utile et overhead.',
            'Il faut distinguer capacité ligne, capacité utile et rendement global.'
          ]
        }
      ],
      quiz: [
        {
          question: 'Dans une hiérarchie réseau, un tribut est : ',
          options: ['Un flux de niveau inférieur intégré dans un niveau supérieur', 'Une modulation analogique', 'Un simple voyant d’interface'],
          answer: 0,
          explanation: 'Un tribut correspond à un flux élémentaire agrégé par un niveau supérieur.'
        },
        {
          question: 'Pourquoi le débit ligne brut dépasse-t-il souvent la seule charge utile ? ',
          options: ['À cause de l’overhead', 'Parce que la voix devient FM', 'Parce que les symboles sont rouges'],
          answer: 0,
          explanation: 'Le débit ligne inclut aussi les informations de structure et de supervision.'
        },
        {
          question: 'L’intérêt d’une hiérarchie synchrone est notamment de : ',
          options: ['Faciliter l’exploitation et l’agrégation', 'Supprimer toute structure de trame', 'Rendre inutile la synchronisation'],
          answer: 0,
          explanation: 'Une hiérarchie synchrone simplifie l’accès, l’agrégation et l’exploitation réseau.'
        }
      ]
    }
  };

  function getParams() {
    return new URLSearchParams(global.location.search);
  }

  function readJsonStorage(key, fallbackValue) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    }
  }

  function emitLabProgressUpdated(detail) {
    try {
      if (typeof global.CustomEvent === 'function') {
        global.dispatchEvent(new global.CustomEvent('lab-progress-updated', { detail: detail || {} }));
        return;
      }

      if (document.createEvent) {
        const event = document.createEvent('Event');
        event.initEvent('lab-progress-updated', true, true);
        event.detail = detail || {};
        global.dispatchEvent(event);
      }
    } catch (error) {
    }
  }

  function getAllPageIds() {
    const ids = [];
    Object.keys(LAB_STRUCTURE).forEach(function (moduleKey) {
      (LAB_STRUCTURE[moduleKey].pages || []).forEach(function (page) {
        if (page && page.id && ids.indexOf(page.id) === -1) {
          ids.push(page.id);
        }
      });
    });
    return ids;
  }

  const ALL_PAGE_IDS = getAllPageIds();

  function readLabProgress() {
    return readJsonStorage(LAB_PROGRESS_KEY, { visited: {} });
  }

  function markPageVisited(pageId) {
    if (!pageId || pageId === 'home') {
      return;
    }

    const progress = readLabProgress();
    progress.visited = progress.visited || {};
    progress.visited[pageId] = Date.now();
    writeJsonStorage(LAB_PROGRESS_KEY, progress);
    emitLabProgressUpdated({ pageId: pageId });
  }

  function readQuizResults() {
    const raw = readJsonStorage(LAB_QUIZ_RESULTS_KEY, {});
    Object.keys(raw || {}).forEach(function (pageId) {
      const entry = raw[pageId];
      if (!entry) {
        return;
      }

      if (!Array.isArray(entry.attempts)) {
        const attempt = (typeof entry.score === 'number' && typeof entry.total === 'number')
          ? [{ score: entry.score, total: entry.total, completedAt: entry.completedAt || Date.now() }]
          : [];
        raw[pageId] = {
          score: typeof entry.score === 'number' ? entry.score : 0,
          total: typeof entry.total === 'number' ? entry.total : 0,
          completedAt: entry.completedAt || Date.now(),
          attempts: attempt
        };
      }
    });
    return raw;
  }

  function saveQuizResult(pageId, score, total) {
    if (!pageId || pageId === 'home') {
      return;
    }

    const results = readQuizResults();
    const previous = results[pageId] || { attempts: [] };
    const attempts = Array.isArray(previous.attempts) ? previous.attempts.slice() : [];
    attempts.push({
      score: score,
      total: total,
      completedAt: Date.now()
    });
    results[pageId] = {
      score: score,
      total: total,
      completedAt: Date.now(),
      attempts: attempts
    };
    writeJsonStorage(LAB_QUIZ_RESULTS_KEY, results);
  }

  function readProfile() {
    const profile = readJsonStorage(LAB_PROFILE_KEY, {});
    return {
      establishmentName: profile.establishmentName || 'École d’ingénieurs — Département Télécommunications',
      studentName: profile.studentName || '',
      partnerName: profile.partnerName || '',
      groupName: profile.groupName || '',
      certificateSigner: profile.certificateSigner || 'Responsable pédagogique du laboratoire'
    };
  }

  function saveProfile(profile) {
    writeJsonStorage(LAB_PROFILE_KEY, {
      establishmentName: profile.establishmentName || 'École d’ingénieurs — Département Télécommunications',
      studentName: profile.studentName || '',
      partnerName: profile.partnerName || '',
      groupName: profile.groupName || '',
      certificateSigner: profile.certificateSigner || 'Responsable pédagogique du laboratoire'
    });
    emitLabProgressUpdated({ profile: true });
  }

  function getLatestAttempt(pageId) {
    const entry = readQuizResults()[pageId];
    if (!entry) {
      return null;
    }

    if (Array.isArray(entry.attempts) && entry.attempts.length) {
      return entry.attempts[entry.attempts.length - 1];
    }

    return (typeof entry.score === 'number' && typeof entry.total === 'number') ? entry : null;
  }

  function formatDateTime(timestamp) {
    if (!timestamp) {
      return '\u2014';
    }
    try {
      return new Date(timestamp).toLocaleString('fr-FR');
    } catch (error) {
      return String(timestamp);
    }
  }

  function getTeacherMode() {
    try {
      return global.localStorage.getItem(LAB_TEACHER_MODE_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function setTeacherMode(value) {
    try {
      global.localStorage.setItem(LAB_TEACHER_MODE_KEY, value ? '1' : '0');
    } catch (error) {
    }
    emitLabProgressUpdated({ teacherMode: true });
  }

  function safeExecute(action) {
    try {
      return action();
    } catch (error) {
      return null;
    }
  }

  function getModulePages(moduleKey) {
    return (LAB_STRUCTURE[moduleKey] && LAB_STRUCTURE[moduleKey].pages ? LAB_STRUCTURE[moduleKey].pages : []).map(function (page) {
      return page.id;
    });
  }

  function getModuleQuizStats(moduleKey) {
    const pageIds = getModulePages(moduleKey);
    const values = pageIds.map(function (pageId) {
      return getLatestAttempt(pageId);
    }).filter(function (result) {
      return result && typeof result.score === 'number' && typeof result.total === 'number' && result.total > 0;
    });

    if (!values.length) {
      return { completed: 0, average: 0 };
    }

    const average = values.reduce(function (sum, result) {
      return sum + (result.score / result.total) * 100;
    }, 0) / values.length;

    return { completed: values.length, average: average };
  }

  function buildTeacherDashboardData() {
    const progress = readLabProgress();
    return Object.keys(LAB_STRUCTURE).map(function (moduleKey) {
      const pageIds = getModulePages(moduleKey);
      const visited = pageIds.filter(function (pageId) {
        return !!(progress.visited || {})[pageId];
      }).length;
      const quizStats = getModuleQuizStats(moduleKey);
      return {
        key: moduleKey,
        title: LAB_STRUCTURE[moduleKey].title,
        totalPages: pageIds.length,
        visitedPages: visited,
        quizCompleted: quizStats.completed,
        quizAverage: quizStats.average
      };
    });
  }

  function computeAchievements() {
    const progress = readLabProgress();
    const visitedCount = ALL_PAGE_IDS.filter(function (id) { return !!(progress.visited || {})[id]; }).length;
    const totalPages = ALL_PAGE_IDS.length || 1;
    const dashboard = buildTeacherDashboardData();
    const quizResults = readQuizResults();
    const quizCount = Object.keys(quizResults).length;
    const allModulesComplete = dashboard.every(function (item) { return item.totalPages > 0 && item.visitedPages === item.totalPages; });
    const allModulesWithQuiz = dashboard.every(function (item) { return item.totalPages === 0 || item.quizCompleted >= 1; });
    const globalAverage = dashboard.filter(function (item) { return item.quizCompleted > 0; }).reduce(function (sum, item, _, arr) {
      return sum + item.quizAverage / arr.length;
    }, 0);

    return {
      badges: [
        {
          key: 'explorer',
          title: 'Badge Explorateur',
          earned: visitedCount >= 3,
          text: 'Attribu\u00e9 d\u00e8s que 3 pages distinctes du laboratoire ont \u00e9t\u00e9 explor\u00e9es.'
        },
        {
          key: 'analyst',
          title: 'Badge Analyste',
          earned: quizCount >= 3,
          text: 'Attribu\u00e9 d\u00e8s que 3 quiz de modules ont \u00e9t\u00e9 valid\u00e9s.'
        },
        {
          key: 'architect',
          title: 'Badge Architecte R\u00e9seau',
          earned: allModulesComplete,
          text: 'Attribu\u00e9 lorsque toutes les pages p\u00e9dagogiques du laboratoire ont \u00e9t\u00e9 visit\u00e9es.'
        },
        {
          key: 'mastery',
          title: 'Badge Ma\u00eetrise',
          earned: allModulesWithQuiz && globalAverage >= 70,
          text: 'Attribu\u00e9 lorsque chaque module comporte au moins un quiz valid\u00e9 avec une moyenne globale d\u2019au moins 70 %.'
        }
      ],
      certificate: {
        earned: allModulesComplete && allModulesWithQuiz && globalAverage >= 75,
        title: 'Certificat interne de progression t\u00e9l\u00e9com',
        text: 'Certificat accord\u00e9 si tout le parcours est visit\u00e9 et si la moyenne globale aux quiz atteint au moins 75 %.'
      },
      globalAverage: globalAverage,
      visitedCount: visitedCount,
      totalPages: totalPages
    };
  }

  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
    const url = global.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    global.setTimeout(function () {
      global.URL.revokeObjectURL(url);
    }, 500);
  }

  function buildCsvReport() {
    const progress = readLabProgress();
    const quizResults = readQuizResults();
    const dashboard = buildTeacherDashboardData();
    const profile = readProfile();
    const lines = ['Type;Identifiant;Titre;Visite;Quiz;Moyenne'];

    lines.push(['Profil', 'etudiant', profile.studentName || 'Non renseign\u00e9', '', '', ''].join(';'));
    lines.push(['Profil', 'binome', profile.partnerName || 'Non renseign\u00e9', '', '', ''].join(';'));
    lines.push(['Profil', 'groupe', profile.groupName || 'Non renseign\u00e9', '', '', ''].join(';'));
    lines.push(['Profil', 'signataire', profile.certificateSigner || 'Non renseign\u00e9', '', '', ''].join(';'));

    dashboard.forEach(function (item) {
      lines.push([
        'Module',
        item.key,
        item.title,
        item.visitedPages + '/' + item.totalPages,
        item.quizCompleted,
        item.quizCompleted ? item.quizAverage.toFixed(1) + '%' : '\u2014'
      ].join(';'));
    });

    ALL_PAGE_IDS.forEach(function (pageId) {
      const visited = !!(progress.visited || {})[pageId];
      const result = getLatestAttempt(pageId);
      lines.push([
        'Page',
        pageId,
        pageId,
        visited ? 'oui' : 'non',
        result ? (result.score + '/' + result.total) : '\u2014',
        result ? (((result.score / result.total) * 100).toFixed(1) + '%') : '\u2014'
      ].join(';'));

      const attempts = quizResults[pageId] && Array.isArray(quizResults[pageId].attempts) ? quizResults[pageId].attempts : [];
      attempts.forEach(function (attempt, index) {
        lines.push([
          'Tentative',
          pageId,
          'Tentative ' + (index + 1),
          formatDateTime(attempt.completedAt),
          attempt.score + '/' + attempt.total,
          attempt.total ? (((attempt.score / attempt.total) * 100).toFixed(1) + '%') : '\u2014'
        ].join(';'));
      });
    });

    return lines.join('\n');
  }

  function buildPrintableReportHtml() {
    const dashboard = buildTeacherDashboardData();
    const achievements = computeAchievements();
    const quizResults = readQuizResults();
    const profile = readProfile();
    const rows = dashboard.map(function (item) {
      return '<tr><td>' + item.title + '</td><td>' + item.visitedPages + '/' + item.totalPages + '</td><td>' + item.quizCompleted + '</td><td>' + (item.quizCompleted ? item.quizAverage.toFixed(1) + ' %' : '\u2014') + '</td></tr>';
    }).join('');
    const badgeRows = achievements.badges.map(function (badge) {
      return '<li><strong>' + badge.title + '</strong> : ' + (badge.earned ? 'obtenu' : 'non obtenu') + ' \u2014 ' + badge.text + '</li>';
    }).join('');
    const historyRows = ALL_PAGE_IDS.map(function (pageId) {
      const attempts = quizResults[pageId] && Array.isArray(quizResults[pageId].attempts) ? quizResults[pageId].attempts : [];
      return attempts.map(function (attempt, index) {
        return '<tr><td>' + pageId + '</td><td>Tentative ' + (index + 1) + '</td><td>' + formatDateTime(attempt.completedAt) + '</td><td>' + attempt.score + '/' + attempt.total + '</td></tr>';
      }).join('');
    }).join('');

    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport p\u00e9dagogique</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h1,h2{margin-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}ul{line-height:1.6}.sign{margin-top:20px;padding-top:12px;border-top:1px solid #cbd5e1}</style></head><body><h1>Rapport p\u00e9dagogique du laboratoire</h1><p><strong>\u00c9tudiant :</strong> ' + (profile.studentName || 'Non renseign\u00e9') + '<br><strong>Bin\u00f4me :</strong> ' + (profile.partnerName || 'Non renseign\u00e9') + '<br><strong>Groupe :</strong> ' + (profile.groupName || 'Non renseign\u00e9') + '<br><strong>Signataire :</strong> ' + (profile.certificateSigner || 'Non renseign\u00e9') + '</p><p>Export enseignant des visites, quiz et validations internes.</p><h2>Tableau de bord multi-pages</h2><table><thead><tr><th>Module</th><th>Visites</th><th>Quiz valid\u00e9s</th><th>Moyenne</th></tr></thead><tbody>' + rows + '</tbody></table><h2>Historique d\u00e9taill\u00e9 des tentatives</h2><table><thead><tr><th>Page</th><th>Tentative</th><th>Date</th><th>R\u00e9sultat</th></tr></thead><tbody>' + (historyRows || '<tr><td colspan="4">Aucune tentative enregistr\u00e9e.</td></tr>') + '</tbody></table><h2>Badges et certificat</h2><ul>' + badgeRows + '</ul><p><strong>Certificat interne :</strong> ' + (achievements.certificate.earned ? 'accord\u00e9' : 'non accord\u00e9') + ' \u2014 ' + achievements.certificate.text + '</p><div class="sign"><strong>Signature :</strong> ' + (profile.certificateSigner || 'Responsable p\u00e9dagogique du laboratoire') + '<br><strong>Date :</strong> ' + formatDateTime(Date.now()) + '</div></body></html>';
  }

  function buildTpReportHtml(pageKey, guide) {
    const profile = readProfile();
    const notebook = getNotebookPage(pageKey);
    const teacherMode = getTeacherMode();
    const pageMeta = notebook.pageMeta || {};
    const firstTp = getEngineeringLab(guide, 0, pageKey);
    const headers = (firstTp.measures || ['Champ 1', 'Champ 2', 'Champ 3', 'Champ 4', 'Champ 5']).slice(0, 5);
    while (headers.length < 5) {
      headers.push('Champ ' + (headers.length + 1));
    }
    const rows = (notebook.measureRows || []).map(function (values) {
      return '<tr>' + values.map(function (value) {
        return '<td>' + (value || '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    const tpBlocks = (guide.manipulations || []).map(function (_, index) {
      const tp = getEngineeringLab(guide, index, pageKey);
      const correctionModel = buildTpCorrectionModel(tp);
      const autoScore = computeTpAutoScore(pageKey, guide, index);
      const report = (notebook.labReports || {})[index] || {};
      const rubricScores = report.rubricScores || {};
      const rubricTotal = (tp.rubric || []).reduce(function (sum, item, rubricIndex) {
        return sum + (rubricScores[rubricIndex] || 0);
      }, 0);
      const rubricMax = (tp.rubric || []).reduce(function (sum, item) { return sum + (item.max || 0); }, 0);
      return '<section><h2>' + tp.title + '</h2>' +
        '<h3>Consigne</h3><p>' + tp.consigne + '</p>' +
        '<h3>Protocole</h3><ul>' + (tp.protocole || []).map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>' +
        '<h3>Ordres de grandeur / valeurs attendues</h3><ul>' + (tp.quantitativeHints || []).concat(tp.expectedValues || []).map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>' +
        '<h3>Exploitation rédigée</h3><p>' + ((report.analysis || 'Non renseignée.').replace(/\n/g, '<br>')) + '</p>' +
        '<h3>Conclusion rédigée</h3><p>' + ((report.conclusion || 'Non renseignée.').replace(/\n/g, '<br>')) + '</p>' +
        '<h3>Score automatique indicatif</h3><p>' + autoScore.score + ' / ' + autoScore.max + '</p><ul>' + autoScore.details.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>' +
        '<h3>Auto-évaluation</h3><p>' + rubricTotal + ' / ' + rubricMax + ' points</p><ul>' + (tp.rubric || []).map(function (item, rubricIndex) {
          return '<li>' + item.label + ' : ' + (rubricScores[rubricIndex] || 0) + ' / ' + (item.max || 0) + '</li>';
        }).join('') + '</ul>' +
        (teacherMode
          ? ('<h3>Correction type enseignant</h3><ul>' + (correctionModel.measures || []).concat(correctionModel.exploitation || []).map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul><p><strong>Conclusion type :</strong> ' + (correctionModel.conclusion || '') + '</p>')
          : '') +
        '</section>';
    }).join('');

    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Compte-rendu TP</title><style>body{font-family:"Times New Roman",serif;padding:30px;color:#111827;background:#fff}h1,h2,h3{margin-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #475569;padding:8px;text-align:left;vertical-align:top}ul{line-height:1.6}.meta{margin:18px 0 24px;padding:16px;border:2px solid #334155}.meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}.report-head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #334155;padding-bottom:14px;margin-bottom:18px}.report-logo{width:78px;height:78px;border:2px solid #0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700}.report-brand strong{display:block;font-size:20px}.report-brand span{display:block;margin-top:4px;font-size:13px}.stamp{display:inline-flex;align-items:center;justify-content:center;min-width:140px;padding:12px 16px;border:2px dashed #991b1b;border-radius:999px;color:#991b1b;font-weight:700;transform:rotate(-8deg);margin-top:12px}.section{page-break-inside:avoid;margin-top:18px}</style></head><body><div class="report-head"><div class="report-logo">LT</div><div class="report-brand"><strong>' + (profile.establishmentName || 'École d’ingénieurs — Département Télécommunications') + '</strong><span>Compte-rendu académique de TP — Télécommunications et traitement du signal</span></div><div><strong>N° ' + (pageMeta.tpNumber || ('TP-' + String(pageKey || '01').toUpperCase())) + '</strong></div></div><h1>Compte-rendu TP</h1><div class="meta"><div class="meta-grid"><div><strong>Page :</strong> ' + guide.title + '</div><div><strong>Date :</strong> ' + (pageMeta.reportDate || formatDateTime(Date.now())) + '</div><div><strong>Étudiant :</strong> ' + (profile.studentName || 'Non renseigné') + '</div><div><strong>Binôme :</strong> ' + (profile.partnerName || 'Non renseigné') + '</div><div><strong>Groupe :</strong> ' + (profile.groupName || 'Non renseigné') + '</div><div><strong>Enseignant correcteur :</strong> ' + (pageMeta.teacherCorrector || profile.certificateSigner || 'Non renseigné') + '</div><div><strong>Note finale :</strong> ' + (pageMeta.finalGrade || computePageTpFinalGrade(pageKey, guide).score) + ' / 20</div><div><strong>Matériel simulé :</strong> ' + (pageMeta.equipment || guide.title) + '</div><div><strong>Objectif :</strong> ' + (pageMeta.objective || guide.subtitle || '') + '</div><div><strong>Résultats :</strong> ' + (pageMeta.results || 'Non renseignés') + '</div><div><strong>Conclusion :</strong> ' + (pageMeta.summaryConclusion || 'Non renseignée') + '</div><div><strong>Visa enseignant :</strong> ' + (pageMeta.teacherVisa || profile.certificateSigner || 'Non renseigné') + '</div></div><div class="stamp">' + (pageMeta.teacherVisa || 'Visa enseignant') + '</div></div><div class="section">' + tpBlocks + '</div><div class="section"><h2>Tableau de mesures</h2><table><thead><tr><th>' + headers.join('</th><th>') + '</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Aucune mesure saisie.</td></tr>') + '</tbody></table></div></body></html>';
  }

  function exportTpReport(pageKey, guide) {
    downloadTextFile((pageKey || 'tp') + '-compte-rendu.html', buildTpReportHtml(pageKey, guide), 'text/html;charset=utf-8');
  }

  function exportTpPdfReport(pageKey, guide) {
    const popup = global.open('', '_blank');
    if (!popup) {
      return;
    }
    popup.document.open();
    popup.document.write(buildTpReportHtml(pageKey, guide));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function exportCsvReport() {
    downloadTextFile('laboratoire-resultats.csv', buildCsvReport(), 'text/csv;charset=utf-8');
  }

  function exportPdfReport() {
    const popup = global.open('', '_blank');
    if (!popup) {
      return;
    }
    popup.document.open();
    popup.document.write(buildPrintableReportHtml());
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function initHeader(options) {
    const opts = options || {};
    const homeLink = document.querySelector('.lab-global-header__home');
    const brandSubtitle = document.querySelector('.lab-global-header__brand span');
    const basePath = opts.navBasePath || inferBasePath(homeLink);

    if (homeLink && !homeLink.getAttribute('title')) {
      homeLink.setAttribute('title', 'Retour \u00e0 l\u2019accueil du laboratoire');
      homeLink.setAttribute('aria-label', 'Retour \u00e0 l\u2019accueil du laboratoire');
    }

    if (brandSubtitle && opts.brandSubtitle) {
      brandSubtitle.textContent = opts.brandSubtitle;
    }

    if (opts.bodySection) {
      document.body.dataset.labSection = opts.bodySection;
    }

    if (opts.pageId) {
      document.body.dataset.labPage = opts.pageId;
    }

    safeExecute(function () {
      markPageVisited(document.body.dataset.labPage || 'home');
    });

    safeExecute(function () {
      renderModuleNav(basePath);
    });

    safeExecute(function () {
      renderContextNav(basePath, document.body.dataset.labSection || '', document.body.dataset.labPage || '');
    });

    safeExecute(function () {
      renderLearningSupport(document.body.dataset.labSection || '', document.body.dataset.labPage || '');
    });

    safeExecute(function () {
      renderHeaderPedagogyActions();
    });

    if (opts.trackVisit !== false) {
      safeExecute(function () {
        trackRecentPage({
          title: document.title,
          href: global.location.href,
          section: document.body.dataset.labSection || '',
          pageId: document.body.dataset.labPage || '',
          subtitle: brandSubtitle ? brandSubtitle.textContent : ''
        });
      });
    }
  }

  function getGuideDefinition(section, pageId) {
    const moduleKey = pageId === 'home' || section === 'home' ? 'home' : getActiveModule(section);
    const baseGuide = LAB_GUIDE_DEFAULTS[moduleKey] || LAB_GUIDE_DEFAULTS.home || {};
    const directGuide = LAB_PAGE_GUIDE_OVERRIDES[pageId] || LAB_PAGE_GUIDE_OVERRIDES[section] || {};
    const supplementGuide = LAB_PAGE_GUIDE_SUPPLEMENTS[pageId] || LAB_PAGE_GUIDE_SUPPLEMENTS[section] || {};
    const evalGuide = LAB_EVAL_DEFAULTS[moduleKey] || LAB_EVAL_DEFAULTS.home || {};
    const practiceGuide = LAB_PRACTICE_DEFAULTS[moduleKey] || LAB_PRACTICE_DEFAULTS.home || {};
    const exercises = decorateDifficulty((directGuide.exercises || practiceGuide.exercises || []).concat(supplementGuide.exercises || []));
    const quiz = decorateDifficulty((directGuide.quiz || evalGuide.quiz || []).concat(supplementGuide.quiz || []));

    return {
      title: directGuide.title || baseGuide.title || '',
      subtitle: directGuide.subtitle || baseGuide.subtitle || '',
      help: directGuide.help || baseGuide.help || [],
      objectives: directGuide.objectives || baseGuide.objectives || [],
      questions: directGuide.questions || baseGuide.questions || [],
      tpSteps: directGuide.tpSteps || baseGuide.tpSteps || [],
      expectedAnswers: directGuide.expectedAnswers || evalGuide.expectedAnswers || [],
      quiz: quiz,
      exercises: exercises,
      manipulations: directGuide.manipulations || practiceGuide.manipulations || [],
      measurementHints: directGuide.measurementHints || practiceGuide.measurementHints || []
    };
  }

  function inferDifficulty(index, total) {
    if (total <= 1) {
      return 'intermediate';
    }

  const DIFFICULTY_SEQUENCE = ['fundamental', 'intermediate', 'advanced'];

  function getDifficultyIndex(level) {
    const value = level === 'fundamental' || level === 'intermediate' || level === 'advanced'
      ? level
      : 'intermediate';
    return Math.max(0, DIFFICULTY_SEQUENCE.indexOf(value));
  }

  function getNextDifficultyLevel(level) {
    const index = getDifficultyIndex(level);
    return DIFFICULTY_SEQUENCE[Math.min(index + 1, DIFFICULTY_SEQUENCE.length - 1)];
  }

    if (total === 2) {
      return index === 0 ? 'fundamental' : 'intermediate';
    }

    if (total === 3) {
      return ['fundamental', 'intermediate', 'advanced'][index] || 'advanced';
    }

    if (index === 0) {
      return 'fundamental';
    }

    if (index === total - 1) {
      return 'advanced';
    }

    return 'intermediate';
  }

  function getDifficultyMeta(level) {
    const value = level === 'fundamental' || level === 'advanced' || level === 'intermediate'
      ? level
      : 'intermediate';
    return {
      key: value,
      label: value === 'fundamental'
        ? 'Fondamental'
        : (value === 'advanced' ? 'Approfondissement' : 'Intermédiaire')
    };
  }

  function decorateDifficulty(items) {
    const list = Array.isArray(items) ? items : [];
    return list.map(function (item, index) {
      const difficulty = getDifficultyMeta(item && item.difficulty ? item.difficulty : inferDifficulty(index, list.length));
      const clone = {};
      Object.keys(item || {}).forEach(function (key) {
        clone[key] = item[key];
      });
      clone.difficulty = difficulty.key;
      clone.difficultyLabel = difficulty.label;
      return clone;
    });
  }

  function isExerciseAnswerComplete(value) {
    return (value || '').trim().length >= 24;
  }

  function computeUnlockedExerciseDifficulty(exercises, answers) {
    let unlockedIndex = 0;
    DIFFICULTY_SEQUENCE.forEach(function (level, index) {
      if (index >= DIFFICULTY_SEQUENCE.length - 1 || index > unlockedIndex) {
        return;
      }

      const requiredIndexes = (exercises || []).map(function (exercise, exerciseIndex) {
        return exercise && exercise.difficulty === level ? exerciseIndex : -1;
      }).filter(function (value) {
        return value >= 0;
      });

      if (!requiredIndexes.length) {
        unlockedIndex = Math.min(index + 1, DIFFICULTY_SEQUENCE.length - 1);
        return;
      }

      const completed = requiredIndexes.every(function (exerciseIndex) {
        return isExerciseAnswerComplete((answers || {})[exerciseIndex]);
      });

      if (completed) {
        unlockedIndex = Math.min(index + 1, DIFFICULTY_SEQUENCE.length - 1);
      }
    });

    return DIFFICULTY_SEQUENCE[unlockedIndex];
  }

  function getAdaptiveProgress(pageKey) {
    return getNotebookPage(pageKey).adaptiveProgress || {};
  }

  function getUnlockedQuizDifficulty(pageKey) {
    const progress = getAdaptiveProgress(pageKey);
    const level = progress.quizLevel || 'fundamental';
    return getDifficultyMeta(level).key;
  }

  function setUnlockedQuizDifficulty(pageKey, level) {
    const nextLevel = getDifficultyMeta(level).key;
    updateNotebookPage(pageKey, function (pageState) {
      pageState.adaptiveProgress = pageState.adaptiveProgress || {};
      const currentLevel = getDifficultyMeta(pageState.adaptiveProgress.quizLevel || 'fundamental').key;
      if (getDifficultyIndex(nextLevel) > getDifficultyIndex(currentLevel)) {
        pageState.adaptiveProgress.quizLevel = nextLevel;
      }
    });
  }

  function createItemsList(tagName, items, className) {
    const list = document.createElement(tagName);
    list.className = className;
    (items || []).forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    return list;
  }

  function createDefinitionList(items) {
    const list = document.createElement('ul');
    list.className = 'lab-guide-panel__list';
    (items || []).forEach(function (item) {
      const li = document.createElement('li');
      if (item && typeof item === 'object') {
        li.innerHTML = '<strong>' + (item.label || item.title || 'Élément') + ' :</strong> ' + (item.value || item.text || '');
      } else {
        li.textContent = item;
      }
      list.appendChild(li);
    });
    return list;
  }

  function readLabNotebook() {
    return readJsonStorage(LAB_NOTEBOOK_KEY, {});
  }

  function getNotebookPage(pageKey) {
    const notebook = readLabNotebook();
    return notebook[pageKey] || { exercises: {}, measureRows: [], manipDone: {} };
  }

  function updateNotebookPage(pageKey, updater) {
    if (!pageKey) {
      return;
    }
    const notebook = readLabNotebook();
    const pageState = notebook[pageKey] || { exercises: {}, measureRows: [], manipDone: {} };
    updater(pageState);
    notebook[pageKey] = pageState;
    writeJsonStorage(LAB_NOTEBOOK_KEY, notebook);
    emitLabProgressUpdated({ notebook: true, pageKey: pageKey });
  }

  function createMeasureRow(values, hints, onChange, onRemove) {
    const row = document.createElement('div');
    row.className = 'lab-measure-row';
    const safeValues = Array.isArray(values) ? values.slice(0, 5) : [];
    while (safeValues.length < 5) {
      safeValues.push('');
    }

    safeValues.forEach(function (value, index) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = value || '';
      input.placeholder = (hints[index] || ('Champ ' + (index + 1)));
      input.addEventListener('input', onChange);
      row.appendChild(input);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'lab-guide-btn';
    removeBtn.textContent = 'Supprimer';
    removeBtn.addEventListener('click', onRemove);
    row.appendChild(removeBtn);
    return row;
  }

  function getEngineeringLab(guide, index, pageKey) {
    const manipulation = (guide.manipulations || [])[index] || {};
    const pageDefaults = (LAB_TP_PAGE_DEFAULTS[pageKey] || [])[index] || {};
    const questions = guide.questions || [];
    const expectedAnswers = guide.expectedAnswers || [];
    const measures = manipulation.measures || pageDefaults.measures || guide.measurementHints || [];
    return {
      title: manipulation.title || ('TP guidé ' + (index + 1)),
      consigne: manipulation.consigne || manipulation.objective || 'Conduisez la manipulation puis justifiez vos résultats avec un raisonnement d’ingénierie.',
      protocole: manipulation.protocole || manipulation.actions || [],
      measures: measures,
      exploitation: manipulation.exploitation || [
        questions[index] || 'Expliquez la tendance principale observée sur vos mesures.',
        'Comparez les résultats obtenus entre cas nominal et cas dégradé.',
        'Justifiez les écarts au regard du phénomène physique ou numérique étudié.'
      ],
      quantitativeHints: manipulation.quantitativeHints || pageDefaults.quantitativeHints || measures.map(function (item) {
        return 'Relever et commenter : ' + item + '.';
      }),
      validationCriteria: manipulation.validationCriteria || pageDefaults.validationCriteria || [
        'Les mesures doivent être cohérentes avec le scénario choisi et les unités doivent être explicites.',
        'L’exploitation doit comparer au moins deux cas ou deux réglages.',
        'La conclusion finale doit relier les résultats observés au phénomène télécom étudié.'
      ],
      prefilledRows: manipulation.prefilledRows || pageDefaults.prefilledRows || [],
      expectedValues: manipulation.expectedValues || pageDefaults.expectedValues || [],
      rubric: manipulation.rubric || pageDefaults.rubric || [],
      autoScoreThresholds: manipulation.autoScoreThresholds || pageDefaults.autoScoreThresholds || {
        measureRows: Math.max(1, (pageDefaults.prefilledRows || []).length || 2),
        measureFillRatio: 0.6,
        analysisChars: 140,
        conclusionChars: 90
      },
      conclusion: manipulation.expectedConclusion || expectedAnswers[index] || expectedAnswers[0] || 'La conclusion attendue doit relier les mesures réalisées au comportement physique du système.'
    };
  }

  function buildTpCorrectionModel(tp) {
    return {
      measures: tp.expectedValues || [],
      exploitation: tp.exploitation || [],
      conclusion: tp.conclusion || ''
    };
  }

  function computeTpAutoScore(pageKey, guide, index) {
    const tp = getEngineeringLab(guide, index, pageKey);
    const notebook = getNotebookPage(pageKey);
    const report = (notebook.labReports || {})[index] || {};
    const thresholds = tp.autoScoreThresholds || {};
    const rows = notebook.measureRows || [];
    const targetRows = Math.max(1, thresholds.measureRows || 2);
    const filledRows = rows.filter(function (values) {
      return (values || []).some(function (value) { return !!value; });
    });
    const totalCells = Math.max(targetRows * 5, 5);
    const filledCells = filledRows.reduce(function (sum, values) {
      return sum + (values || []).filter(function (value) { return !!value; }).length;
    }, 0);
    const measureRatio = filledCells / totalCells;
    const analysisLength = (report.analysis || '').trim().length;
    const conclusionLength = (report.conclusion || '').trim().length;
    let score = 0;
    const details = [];

    if (measureRatio >= 1) {
      score += 3;
      details.push('Mesures complètes : 3/3');
    } else if (measureRatio >= (thresholds.measureFillRatio || 0.6)) {
      score += 2;
      details.push('Mesures exploitables : 2/3');
    } else if (filledCells > 0) {
      score += 1;
      details.push('Mesures partielles : 1/3');
    } else {
      details.push('Mesures absentes : 0/3');
    }

    if (analysisLength >= (thresholds.analysisChars || 140) * 1.6) {
      score += 3;
      details.push('Exploitation détaillée : 3/3');
    } else if (analysisLength >= (thresholds.analysisChars || 140)) {
      score += 2;
      details.push('Exploitation correcte : 2/3');
    } else if (analysisLength >= 50) {
      score += 1;
      details.push('Exploitation brève : 1/3');
    } else {
      details.push('Exploitation insuffisante : 0/3');
    }

    if (conclusionLength >= (thresholds.conclusionChars || 90) * 1.5) {
      score += 2;
      details.push('Conclusion solide : 2/2');
    } else if (conclusionLength >= (thresholds.conclusionChars || 90)) {
      score += 1;
      details.push('Conclusion présente : 1/2');
    } else {
      details.push('Conclusion insuffisante : 0/2');
    }

    if ((notebook.manipDone || {})[index]) {
      score += 1;
      details.push('Manipulation validée : 1/1');
    } else {
      details.push('Manipulation non validée : 0/1');
    }

    const rubricScores = report.rubricScores || {};
    const rubricPoints = Object.keys(rubricScores).reduce(function (sum, key) {
      return sum + (rubricScores[key] || 0);
    }, 0);
    if (rubricPoints > 0) {
      score += 1;
      details.push('Auto-évaluation renseignée : 1/1');
    } else {
      details.push('Auto-évaluation absente : 0/1');
    }

    return {
      score: score,
      max: 10,
      details: details
    };
  }

  function computePageTpFinalGrade(pageKey, guide) {
    const manipulations = guide.manipulations || [];
    if (!manipulations.length) {
      return { score: 0, max: 20 };
    }
    const notebook = getNotebookPage(pageKey);
    let total = 0;
    manipulations.forEach(function (_, index) {
      const autoScore = computeTpAutoScore(pageKey, guide, index);
      const tp = getEngineeringLab(guide, index, pageKey);
      const report = (notebook.labReports || {})[index] || {};
      const rubricScores = report.rubricScores || {};
      const rubricMax = (tp.rubric || []).reduce(function (sum, item) { return sum + (item.max || 0); }, 0);
      const rubricValue = (tp.rubric || []).reduce(function (sum, item, idx) {
        return sum + (rubricScores[idx] || 0);
      }, 0);
      const autoOn20 = autoScore.max ? (autoScore.score / autoScore.max) * 20 : 0;
      const rubricOn20 = rubricMax ? (rubricValue / rubricMax) * 20 : autoOn20;
      total += (autoOn20 + rubricOn20) / 2;
    });
    return {
      score: Math.round((total / manipulations.length) * 10) / 10,
      max: 20
    };
  }

  function renderLearningSheet(guide) {
    if (document.querySelector('.lab-learning-sheet')) {
      return;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    const sheet = document.createElement('section');
    sheet.className = 'lab-learning-sheet';
    sheet.setAttribute('aria-label', 'Objectifs p\u00e9dagogiques et questions d\u2019analyse');

    const head = document.createElement('div');
    head.className = 'lab-learning-sheet__head';

    const headText = document.createElement('div');
    const eyebrow = document.createElement('div');
    eyebrow.className = 'lab-learning-sheet__eyebrow';
    eyebrow.textContent = 'Fiche p\u00e9dagogique';

    const title = document.createElement('h2');
    title.className = 'lab-learning-sheet__title';
    title.textContent = guide.title;

    const subtitle = document.createElement('p');
    subtitle.className = 'lab-learning-sheet__subtitle';
    subtitle.textContent = guide.subtitle;

    headText.appendChild(eyebrow);
    headText.appendChild(title);
    headText.appendChild(subtitle);
    head.appendChild(headText);

    const grid = document.createElement('div');
    grid.className = 'lab-learning-sheet__grid';

    const objectivesCard = document.createElement('article');
    objectivesCard.className = 'lab-learning-sheet__card';
    const objectivesTitle = document.createElement('h3');
    objectivesTitle.textContent = 'Objectifs p\u00e9dagogiques';
    objectivesCard.appendChild(objectivesTitle);
    objectivesCard.appendChild(createItemsList('ul', guide.objectives, 'lab-learning-sheet__list'));

    const questionsCard = document.createElement('article');
    questionsCard.className = 'lab-learning-sheet__card';
    const questionsTitle = document.createElement('h3');
    questionsTitle.textContent = 'Questions d\u2019analyse';
    questionsCard.appendChild(questionsTitle);
    questionsCard.appendChild(createItemsList('ol', guide.questions, 'lab-guide-panel__list'));

    grid.appendChild(objectivesCard);
    grid.appendChild(questionsCard);
    sheet.appendChild(head);
    sheet.appendChild(grid);
    host.appendChild(sheet);
  }

  function renderPedagogyQuickBar(pageKey) {
    if (document.querySelector('.lab-pedagogy-bar')) {
      return;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    const bar = document.createElement('section');
    bar.className = 'lab-pedagogy-bar';
    bar.setAttribute('aria-label', 'Accès rapide aux ressources pédagogiques');

    const title = document.createElement('div');
    title.className = 'lab-pedagogy-bar__title';
    title.textContent = 'Accès rapide pédagogique';
    const actions = document.createElement('div');
    actions.className = 'lab-pedagogy-bar__actions';
    const section = document.body.dataset.labSection || '';
    const pageId = document.body.dataset.labPage || '';
    const guide = getGuideDefinition(section, pageId);
    const steps = guide.tpSteps || [];
    const stepKey = 'labGuideStep:' + pageKey;

    function readStepIndex() {
      try {
        const stored = parseInt(global.localStorage.getItem(stepKey) || '0', 10);
        return Math.max(0, Math.min(Math.max(steps.length - 1, 0), stored || 0));
      } catch (error) {
        return 0;
      }
    }

    function writeStepIndex(index) {
      try {
        global.localStorage.setItem(stepKey, String(index));
      } catch (error) {
      }
      emitLabProgressUpdated({ pageKey: pageKey, tpStep: index });
    }

    function goToCurrentStep(index) {
      if (steps[index] && steps[index].target) {
        scrollToSelector(steps[index].target);
      }
    }

    function createButton(text, onClick, primary) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-guide-btn' + (primary ? ' lab-guide-btn--primary' : '');
      button.textContent = text;
      button.addEventListener('click', onClick);
      return button;
    }

    actions.appendChild(createButton('TP', function () {
      ensurePedagogyPanel('tp', '.lab-notebook-sheet');
    }, true));
    actions.appendChild(createButton('Exercices', function () {
      ensurePedagogyPanel('exercises', '.lab-exercise-sheet');
    }));
    actions.appendChild(createButton('Quiz', function () {
      ensurePedagogyPanel('quiz', '.lab-quiz-sheet');
    }));
    actions.appendChild(createButton('Mode enseignant', function () {
      setTeacherMode(!getTeacherMode());
      ensurePedagogyPanel('teacher', '.lab-notebook-sheet');
    }));
    actions.appendChild(createButton('Assistant pédagogique', function () {
      ensurePedagogyPanel('help', '.lab-learning-sheet');
    }));

    const levelBox = document.createElement('div');
    levelBox.className = 'lab-pedagogy-level';
    const levelLabel = document.createElement('div');
    levelLabel.className = 'lab-pedagogy-level__label';
    const levelValue = document.createElement('div');
    levelValue.className = 'lab-pedagogy-level__value';
    const levelDetail = document.createElement('div');
    levelDetail.className = 'lab-pedagogy-level__detail';

    function renderLevelIndicator() {
      const notebook = getNotebookPage(pageKey);
      const exerciseLevel = computeUnlockedExerciseDifficulty(guide.exercises || [], notebook.exercises || {});
      const quizLevel = getUnlockedQuizDifficulty(pageKey);
      const exerciseMeta = getDifficultyMeta(exerciseLevel);
      const quizMeta = getDifficultyMeta(quizLevel);
      const globalLevel = DIFFICULTY_SEQUENCE[Math.min(getDifficultyIndex(exerciseLevel), getDifficultyIndex(quizLevel))] || 'fundamental';
      const globalMeta = getDifficultyMeta(globalLevel);

      levelLabel.textContent = 'Niveau débloqué global';
      levelValue.textContent = globalMeta.label;
      levelValue.className = 'lab-pedagogy-level__value lab-difficulty-badge lab-difficulty-badge--' + globalMeta.key;
      levelDetail.textContent = 'Exercices : ' + exerciseMeta.label + ' • Quiz : ' + quizMeta.label;
    }

    levelBox.appendChild(levelLabel);
    levelBox.appendChild(levelValue);
    levelBox.appendChild(levelDetail);
    renderLevelIndicator();
    bar.appendChild(levelBox);

    if (steps.length) {
      const stepper = document.createElement('div');
      stepper.className = 'lab-pedagogy-stepper';
      const stepperLabel = document.createElement('div');
      stepperLabel.className = 'lab-pedagogy-stepper__label';
      const stepperText = document.createElement('div');
      stepperText.className = 'lab-pedagogy-stepper__text';
      const stepperActions = document.createElement('div');
      stepperActions.className = 'lab-pedagogy-stepper__actions';
      const prevStepBtn = createButton('Étape précédente', function () {
        const nextIndex = Math.max(0, readStepIndex() - 1);
        writeStepIndex(nextIndex);
        goToCurrentStep(nextIndex);
      });
      const nextStepBtn = createButton('Étape suivante', function () {
        const nextIndex = Math.min(steps.length - 1, readStepIndex() + 1);
        writeStepIndex(nextIndex);
        goToCurrentStep(nextIndex);
      }, true);

      function renderStepper() {
        const currentStep = readStepIndex();
        const step = steps[currentStep] || {};
        stepperLabel.textContent = 'TP guidé — étape ' + (currentStep + 1) + ' / ' + steps.length;
        stepperText.textContent = step.title || 'Étape en cours';
        prevStepBtn.disabled = currentStep === 0;
        nextStepBtn.disabled = currentStep === steps.length - 1;
      }

      stepperActions.appendChild(prevStepBtn);
      stepperActions.appendChild(nextStepBtn);
      stepper.appendChild(stepperLabel);
      stepper.appendChild(stepperText);
      stepper.appendChild(stepperActions);
      renderStepper();
      global.addEventListener('lab-progress-updated', function (event) {
        const detail = event && event.detail ? event.detail : {};
        if (!detail.pageKey || detail.pageKey === pageKey || detail.tpStep === undefined) {
          renderStepper();
        }
        if (!detail.pageKey || detail.pageKey === pageKey || detail.notebook || detail.tpStep !== undefined) {
          renderLevelIndicator();
        }
      });
      bar.appendChild(stepper);
    } else {
      global.addEventListener('lab-progress-updated', function (event) {
        const detail = event && event.detail ? event.detail : {};
        if (!detail.pageKey || detail.pageKey === pageKey || detail.notebook) {
          renderLevelIndicator();
        }
      });
    }

    bar.appendChild(title);
    bar.appendChild(actions);

    const firstSection = host.querySelector('.lab-learning-sheet, .lab-exercise-sheet, .lab-quiz-sheet, .lab-notebook-sheet, .lab-achievement-sheet');
    if (firstSection && firstSection.parentNode === host) {
      host.insertBefore(bar, firstSection);
    } else if (host.firstChild) {
      host.insertBefore(bar, host.firstChild.nextSibling);
    } else {
      host.appendChild(bar);
    }
  }

  function openGuideDrawerPanel(panelName) {
    const drawer = document.querySelector('.lab-guide-drawer');
    if (!drawer) {
      return false;
    }

    drawer.classList.add('is-open');
    const tabs = drawer.querySelectorAll('.lab-guide-drawer__tab');
    const panels = drawer.querySelectorAll('.lab-guide-panel');
    let found = false;

    tabs.forEach(function (tab) {
      const isActive = tab.dataset.panel === panelName;
      tab.classList.toggle('active', isActive);
      if (isActive) {
        found = true;
      }
    });

    panels.forEach(function (panel) {
      panel.classList.toggle('active', panel.dataset.panel === panelName);
    });

    if (!found) {
      const firstTab = drawer.querySelector('.lab-guide-drawer__tab');
      const firstPanel = drawer.querySelector('.lab-guide-panel');
      if (firstTab) {
        firstTab.classList.add('active');
      }
      if (firstPanel) {
        firstPanel.classList.add('active');
      }
    }

    if (typeof drawer.scrollTo === 'function') {
      drawer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return true;
  }

  function ensurePedagogyPanel(panelName, selector) {
    let opened = openGuideDrawerPanel(panelName);
    let target = selector ? document.querySelector(selector) : null;

    if (!opened && !target) {
      const section = document.body.dataset.labSection || '';
      const pageId = document.body.dataset.labPage || '';
      const pageKey = pageId || section || 'home';
      const guide = getGuideDefinition(section, pageId);

      safeExecute(function () { renderLearningSheet(guide); });
      safeExecute(function () { renderPedagogyQuickBar(pageKey); });
      safeExecute(function () { renderExerciseSheet(guide, pageKey); });
      safeExecute(function () { renderQuizSheet(guide, pageKey); });
      safeExecute(function () { renderNotebookSheet(guide, pageKey); });
      safeExecute(function () { renderAchievementSheet(); });
      safeExecute(function () { renderGuideDrawer(guide, pageKey); });

      opened = openGuideDrawerPanel(panelName);
      target = selector ? document.querySelector(selector) : null;
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    if (opened) {
      return true;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return false;
    }

    const notice = document.createElement('div');
    notice.className = 'lab-guide-note lab-guide-note--floating';
    notice.textContent = panelName === 'teacher'
      ? 'Le mode enseignant est activé. Ouvrez le panneau pédagogique flottant s’il apparaît en bas à droite.'
      : 'Le contenu pédagogique de cette page est en cours de chargement. Faites défiler la page pour voir les blocs pédagogiques.';
    host.insertBefore(notice, host.firstChild);
    global.setTimeout(function () {
      if (notice.parentNode) {
        notice.parentNode.removeChild(notice);
      }
    }, 3000);
    return false;
  }

  function renderHeaderPedagogyActions() {
    if (document.querySelector('.lab-global-header__actions')) {
      return;
    }

    const headerInner = document.querySelector('.lab-global-header__inner');
    if (!headerInner) {
      return;
    }

    const actions = document.createElement('div');
    actions.className = 'lab-global-header__actions';

    function createButton(text, handler, primary) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-guide-btn' + (primary ? ' lab-guide-btn--primary' : '');
      button.textContent = text;
      button.addEventListener('click', handler);
      return button;
    }

    function goToPedagogy(selector, panelName) {
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      openGuideDrawerPanel(panelName);
    }

    actions.appendChild(createButton('TP', function () {
      ensurePedagogyPanel('tp', '.lab-notebook-sheet');
    }, true));
    actions.appendChild(createButton('Exercices', function () {
      ensurePedagogyPanel('exercises', '.lab-exercise-sheet');
    }));
    actions.appendChild(createButton('Enseignant', function () {
      setTeacherMode(!getTeacherMode());
      ensurePedagogyPanel('teacher', '.lab-notebook-sheet');
    }));

    headerInner.appendChild(actions);
  }

  function renderExerciseSheet(guide, pageKey) {
    if (document.querySelector('.lab-exercise-sheet') || !guide.exercises || !guide.exercises.length) {
      return;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    const notebook = getNotebookPage(pageKey);
    const section = document.createElement('section');
    section.className = 'lab-exercise-sheet';
    section.setAttribute('aria-label', 'Exercices et corrigés');

    const title = document.createElement('h2');
    title.className = 'lab-exercise-sheet__title';
    title.textContent = 'Exercices d’application et corrigés';
    const subtitle = document.createElement('p');
    subtitle.className = 'lab-exercise-sheet__subtitle';
    subtitle.textContent = 'Rédigez votre réponse d’ingénieur, puis comparez-la au corrigé raisonné.';
    const progressionNote = document.createElement('div');
    progressionNote.className = 'lab-guide-note';
    section.appendChild(title);
    section.appendChild(subtitle);
    section.appendChild(progressionNote);

    const exerciseCards = [];

    guide.exercises.forEach(function (exercise, index) {
      const card = document.createElement('article');
      card.className = 'lab-exercise-card';
      const cardHead = document.createElement('div');
      cardHead.className = 'lab-difficulty-head';
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'lab-exercise-card__title';
      cardTitle.textContent = (index + 1) + '. ' + exercise.title;
      const badge = document.createElement('span');
      badge.className = 'lab-difficulty-badge lab-difficulty-badge--' + (exercise.difficulty || 'intermediate');
      badge.textContent = exercise.difficultyLabel || 'Intermédiaire';
      const prompt = document.createElement('p');
      prompt.className = 'lab-exercise-card__prompt';
      prompt.textContent = exercise.prompt;
      const lockNote = document.createElement('div');
      lockNote.className = 'lab-card-lock-note';
      lockNote.hidden = true;
      const answer = document.createElement('textarea');
      answer.className = 'lab-exercise-card__answer';
      answer.rows = 5;
      answer.placeholder = 'Rédigez ici votre raisonnement, vos hypothèses et votre conclusion.';
      answer.value = (notebook.exercises && notebook.exercises[index]) || '';
      answer.addEventListener('input', function () {
        updateNotebookPage(pageKey, function (pageState) {
          pageState.exercises = pageState.exercises || {};
          pageState.exercises[index] = answer.value;
        });
        refreshExerciseLocks();
      });

      const actions = document.createElement('div');
      actions.className = 'lab-quiz-actions';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'lab-guide-btn';
      toggle.textContent = 'Afficher le corrigé';
      const correction = document.createElement('div');
      correction.className = 'lab-exercise-card__correction';
      correction.hidden = true;
      const correctionTitle = document.createElement('div');
      correctionTitle.className = 'lab-exercise-card__correction-title';
      correctionTitle.textContent = 'Corrigé attendu';
      correction.appendChild(correctionTitle);
      correction.appendChild(createItemsList('ul', exercise.correction || [], 'lab-guide-panel__list'));
      toggle.addEventListener('click', function () {
        if (toggle.disabled) {
          return;
        }
        correction.hidden = !correction.hidden;
        toggle.textContent = correction.hidden ? 'Afficher le corrigé' : 'Masquer le corrigé';
      });
      actions.appendChild(toggle);

      cardHead.appendChild(cardTitle);
      cardHead.appendChild(badge);
      card.appendChild(cardHead);
      card.appendChild(prompt);
      card.appendChild(lockNote);
      card.appendChild(answer);
      card.appendChild(actions);
      card.appendChild(correction);
      section.appendChild(card);
      exerciseCards.push({ card: card, answer: answer, toggle: toggle, correction: correction, lockNote: lockNote, exercise: exercise });
    });

    function refreshExerciseLocks() {
      const unlockedLevel = computeUnlockedExerciseDifficulty(guide.exercises || [], getNotebookPage(pageKey).exercises || {});
      const unlockedMeta = getDifficultyMeta(unlockedLevel);
      progressionNote.textContent = 'Progression adaptative : niveau actuellement ouvert — ' + unlockedMeta.label + '. Complétez les exercices du niveau courant pour débloquer le suivant.';

      exerciseCards.forEach(function (entry) {
        const isLocked = getDifficultyIndex(entry.exercise.difficulty) > getDifficultyIndex(unlockedLevel);
        entry.card.classList.toggle('is-locked', isLocked);
        entry.answer.disabled = isLocked;
        entry.toggle.disabled = isLocked;
        entry.lockNote.hidden = !isLocked;
        if (isLocked) {
          entry.correction.hidden = true;
          entry.toggle.textContent = 'Corrigé verrouillé';
          entry.lockNote.textContent = 'Débloquez d’abord le niveau ' + unlockedMeta.label + ' pour accéder à cet exercice.';
        } else if (entry.toggle.textContent === 'Corrigé verrouillé') {
          entry.toggle.textContent = 'Afficher le corrigé';
        }
      });
    }

    refreshExerciseLocks();

    host.appendChild(section);
  }

  function renderNotebookSheet(guide, pageKey) {
    if (document.querySelector('.lab-notebook-sheet')) {
      return;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'lab-notebook-sheet';
    section.setAttribute('aria-label', 'Manipulations et relevés de mesures');

    const title = document.createElement('h2');
    title.className = 'lab-notebook-sheet__title';
    title.textContent = 'Manipulations et relevés de mesures';
    const subtitle = document.createElement('p');
    subtitle.className = 'lab-notebook-sheet__subtitle';
    subtitle.textContent = 'Suivez un protocole de manipulation, puis consignez vos mesures et votre interprétation.';
    section.appendChild(title);
    section.appendChild(subtitle);

    const profile = readProfile();
    const notebookState = getNotebookPage(pageKey);
    const pageMeta = notebookState.pageMeta || {};
    const suggestedGrade = computePageTpFinalGrade(pageKey, guide);
    const cover = document.createElement('div');
    cover.className = 'lab-tp-cover';
    const coverHeader = document.createElement('div');
    coverHeader.className = 'lab-tp-cover__header';
    const coverLogo = document.createElement('div');
    coverLogo.className = 'lab-tp-cover__logo';
    coverLogo.textContent = 'LT';
    const coverBrand = document.createElement('div');
    coverBrand.className = 'lab-tp-cover__brand';
    const coverEstablishment = document.createElement('strong');
    coverEstablishment.textContent = profile.establishmentName || 'École d’ingénieurs — Département Télécommunications';
    const coverProgram = document.createElement('span');
    coverProgram.textContent = 'Compte-rendu de TP — Télécommunications et traitement du signal';
    coverBrand.appendChild(coverEstablishment);
    coverBrand.appendChild(coverProgram);
    coverHeader.appendChild(coverLogo);
    coverHeader.appendChild(coverBrand);
    const coverTitle = document.createElement('h3');
    coverTitle.textContent = 'Cartouche de compte-rendu';
    const coverGrid = document.createElement('div');
    coverGrid.className = 'lab-tp-cover__grid';

    function createCoverField(labelText, value, placeholder, isTextarea) {
      const field = document.createElement('div');
      field.className = 'lab-form-field';
      const label = document.createElement('label');
      label.textContent = labelText;
      const input = document.createElement(isTextarea ? 'textarea' : 'input');
      if (!isTextarea) {
        input.type = 'text';
      } else {
        input.rows = 3;
      }
      input.value = value || '';
      input.placeholder = placeholder || '';
      field.appendChild(label);
      field.appendChild(input);
      return { field: field, input: input };
    }

    const establishmentField = createCoverField('Établissement', profile.establishmentName, 'École d’ingénieurs — Département Télécommunications', false);
    const tpNumberCover = createCoverField('Numéro de TP', pageMeta.tpNumber || ('TP-' + String(pageKey || '01').toUpperCase()), 'Ex. TP-03', false);
    const studentCover = createCoverField('Nom', profile.studentName, 'Nom de l’étudiant', false);
    const partnerCover = createCoverField('Binôme', profile.partnerName, 'Nom du binôme', false);
    const groupCover = createCoverField('Groupe', profile.groupName, 'Ex. GI-2A', false);
    const dateCover = createCoverField('Date', pageMeta.reportDate || new Date().toLocaleDateString('fr-FR'), '', false);
    const teacherCorrectorCover = createCoverField('Enseignant correcteur', pageMeta.teacherCorrector || profile.certificateSigner || '', 'Nom de l’enseignant correcteur', false);
    const objectiveCover = createCoverField('Objectif', pageMeta.objective || guide.subtitle || '', 'Objectif du TP', true);
    const equipmentCover = createCoverField('Matériel simulé', pageMeta.equipment || guide.title, 'Simulateur / chaîne étudiée', true);
    const resultsCover = createCoverField('Résultats', pageMeta.results || '', 'Synthèse courte des résultats obtenus', true);
    const conclusionCover = createCoverField('Conclusion', pageMeta.summaryConclusion || '', 'Conclusion synthétique du TP', true);
    const gradeCover = createCoverField('Note finale (/20)', pageMeta.finalGrade || suggestedGrade.score, 'Note finale', false);
    const visaCover = createCoverField('Visa / signature enseignant', pageMeta.teacherVisa || profile.certificateSigner || '', 'Visa enseignant', false);
    const suggestBtn = document.createElement('button');
    suggestBtn.type = 'button';
    suggestBtn.className = 'lab-guide-btn';
    suggestBtn.textContent = 'Appliquer la note suggérée';
    const suggestedLabel = document.createElement('div');
    suggestedLabel.className = 'lab-guide-note';
    suggestedLabel.textContent = 'Note suggérée actuelle : ' + suggestedGrade.score + ' / ' + suggestedGrade.max;

    const visualStamp = document.createElement('div');
    visualStamp.className = 'lab-tp-cover__stamp';
    [establishmentField.field, tpNumberCover.field, studentCover.field, partnerCover.field, groupCover.field, dateCover.field, teacherCorrectorCover.field, objectiveCover.field, equipmentCover.field, resultsCover.field, conclusionCover.field, gradeCover.field, visaCover.field].forEach(function (field) {
      coverGrid.appendChild(field);
    });
    cover.appendChild(coverHeader);
    cover.appendChild(coverTitle);
    cover.appendChild(coverGrid);
    cover.appendChild(suggestedLabel);
    cover.appendChild(suggestBtn);
    cover.appendChild(visualStamp);
    section.appendChild(cover);

    function persistCoverMeta() {
      updateNotebookPage(pageKey, function (pageState) {
        pageState.pageMeta = pageState.pageMeta || {};
        pageState.pageMeta.tpNumber = tpNumberCover.input.value.trim();
        pageState.pageMeta.reportDate = dateCover.input.value.trim();
        pageState.pageMeta.teacherCorrector = teacherCorrectorCover.input.value.trim();
        pageState.pageMeta.objective = objectiveCover.input.value.trim();
        pageState.pageMeta.equipment = equipmentCover.input.value.trim();
        pageState.pageMeta.results = resultsCover.input.value.trim();
        pageState.pageMeta.summaryConclusion = conclusionCover.input.value.trim();
        pageState.pageMeta.finalGrade = gradeCover.input.value.trim();
        pageState.pageMeta.teacherVisa = visaCover.input.value.trim();
      });
      const profileValue = readProfile();
      profileValue.establishmentName = establishmentField.input.value.trim() || 'École d’ingénieurs — Département Télécommunications';
      profileValue.studentName = studentCover.input.value.trim();
      profileValue.partnerName = partnerCover.input.value.trim();
      profileValue.groupName = groupCover.input.value.trim();
      profileValue.certificateSigner = teacherCorrectorCover.input.value.trim() || 'Responsable pédagogique du laboratoire';
      saveProfile(profileValue);
      coverEstablishment.textContent = profileValue.establishmentName;
      visualStamp.textContent = visaCover.input.value.trim() ? ('Visa : ' + visaCover.input.value.trim()) : 'Visa enseignant';
    }

    [establishmentField.input, tpNumberCover.input, studentCover.input, partnerCover.input, groupCover.input, dateCover.input, teacherCorrectorCover.input, objectiveCover.input, equipmentCover.input, resultsCover.input, conclusionCover.input, gradeCover.input, visaCover.input].forEach(function (input) {
      input.addEventListener('change', persistCoverMeta);
    });
    suggestBtn.addEventListener('click', function () {
      const nextGrade = computePageTpFinalGrade(pageKey, guide);
      gradeCover.input.value = nextGrade.score;
      suggestedLabel.textContent = 'Note suggérée actuelle : ' + nextGrade.score + ' / ' + nextGrade.max;
      persistCoverMeta();
    });
    visualStamp.textContent = visaCover.input.value.trim() ? ('Visa : ' + visaCover.input.value.trim()) : 'Visa enseignant';

    if (guide.manipulations && guide.manipulations.length) {
      const grid = document.createElement('div');
      grid.className = 'lab-learning-sheet__grid';
      const notebook = getNotebookPage(pageKey);
      const tpRefreshers = [];
      guide.manipulations.forEach(function (item, index) {
        const tp = getEngineeringLab(guide, index, pageKey);
        const correctionModel = buildTpCorrectionModel(tp);
        const card = document.createElement('article');
        card.className = 'lab-learning-sheet__card lab-tp-card';
        const cardTitle = document.createElement('h3');
        cardTitle.textContent = tp.title;
        const consigneTitle = document.createElement('div');
        consigneTitle.className = 'lab-tp-card__section-title';
        consigneTitle.textContent = 'Consigne';
        const objective = document.createElement('p');
        objective.className = 'lab-notebook-sheet__objective';
        objective.textContent = tp.consigne;
        const protocolTitle = document.createElement('div');
        protocolTitle.className = 'lab-tp-card__section-title';
        protocolTitle.textContent = 'Protocole';
        const measureTitle = document.createElement('div');
        measureTitle.className = 'lab-tp-card__section-title';
        measureTitle.textContent = 'Tableau de mesures';
        const exploitationTitle = document.createElement('div');
        exploitationTitle.className = 'lab-tp-card__section-title';
        exploitationTitle.textContent = 'Exploitation';
        const quantitativeTitle = document.createElement('div');
        quantitativeTitle.className = 'lab-tp-card__section-title';
        quantitativeTitle.textContent = 'Ordres de grandeur attendus';
        const expectedValuesTitle = document.createElement('div');
        expectedValuesTitle.className = 'lab-tp-card__section-title';
        expectedValuesTitle.textContent = 'Valeurs attendues';
        const validationTitle = document.createElement('div');
        validationTitle.className = 'lab-tp-card__section-title';
        validationTitle.textContent = 'Critères de validation';
        const rubricTitle = document.createElement('div');
        rubricTitle.className = 'lab-tp-card__section-title';
        rubricTitle.textContent = 'Barème et auto-évaluation';
        const autoScoreTitle = document.createElement('div');
        autoScoreTitle.className = 'lab-tp-card__section-title';
        autoScoreTitle.textContent = 'Score automatique indicatif';
        const conclusionTitle = document.createElement('div');
        conclusionTitle.className = 'lab-tp-card__section-title';
        conclusionTitle.textContent = 'Conclusion attendue';
        const notebook = getNotebookPage(pageKey);
        const reportState = (notebook.labReports || {})[index] || {};
        const exploitationBox = document.createElement('textarea');
        exploitationBox.className = 'lab-exercise-card__answer';
        exploitationBox.rows = 4;
        exploitationBox.placeholder = 'Analysez ici vos mesures, les tendances et les écarts observés.';
        exploitationBox.value = reportState.analysis || '';
        exploitationBox.addEventListener('input', function () {
          updateNotebookPage(pageKey, function (pageState) {
            pageState.labReports = pageState.labReports || {};
            pageState.labReports[index] = pageState.labReports[index] || {};
            pageState.labReports[index].analysis = exploitationBox.value;
          });
        });
        const conclusionBox = document.createElement('textarea');
        conclusionBox.className = 'lab-exercise-card__answer';
        conclusionBox.rows = 3;
        conclusionBox.placeholder = 'Rédigez ici votre conclusion d’ingénierie.';
        conclusionBox.value = reportState.conclusion || '';
        conclusionBox.addEventListener('input', function () {
          updateNotebookPage(pageKey, function (pageState) {
            pageState.labReports = pageState.labReports || {};
            pageState.labReports[index] = pageState.labReports[index] || {};
            pageState.labReports[index].conclusion = conclusionBox.value;
          });
        });
        const rubricBox = document.createElement('div');
        rubricBox.className = 'lab-rubric';
        const autoScoreBox = document.createElement('div');
        autoScoreBox.className = 'lab-rubric';
        const autoScoreValue = document.createElement('div');
        autoScoreValue.className = 'lab-rubric__total';
        const autoScoreList = document.createElement('ul');
        autoScoreList.className = 'lab-guide-panel__list';
        autoScoreBox.appendChild(autoScoreValue);
        autoScoreBox.appendChild(autoScoreList);
        const teacherCorrection = document.createElement('div');
        teacherCorrection.className = 'lab-teacher-answer';
        const teacherCorrectionTitle = document.createElement('h3');
        teacherCorrectionTitle.textContent = 'Correction type du compte-rendu';
        teacherCorrection.appendChild(teacherCorrectionTitle);
        teacherCorrection.appendChild(createItemsList('ul', correctionModel.measures || [], 'lab-guide-panel__list'));
        teacherCorrection.appendChild(createItemsList('ul', correctionModel.exploitation || [], 'lab-guide-panel__list'));
        const correctionConclusion = document.createElement('p');
        correctionConclusion.className = 'lab-notebook-sheet__objective';
        correctionConclusion.textContent = correctionModel.conclusion || '';
        teacherCorrection.appendChild(correctionConclusion);
        const rubricTotal = document.createElement('div');
        rubricTotal.className = 'lab-rubric__total';
        const rubricScores = reportState.rubricScores || {};
        function renderRubricTotal(total, max) {
          rubricTotal.textContent = 'Auto-évaluation : ' + total + ' / ' + max + ' points';
        }
        if (tp.rubric && tp.rubric.length) {
          let maxScore = 0;
          tp.rubric.forEach(function (criterion, criterionIndex) {
            maxScore += criterion.max || 0;
            const row = document.createElement('div');
            row.className = 'lab-rubric__row';
            const label = document.createElement('div');
            label.className = 'lab-rubric__label';
            label.textContent = criterion.label + ' (' + (criterion.max || 0) + ' pts max)';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = String(criterion.max || 0);
            input.step = '1';
            input.value = typeof rubricScores[criterionIndex] === 'number' ? String(rubricScores[criterionIndex]) : '';
            input.addEventListener('input', function () {
              const value = Math.max(0, Math.min(criterion.max || 0, parseInt(input.value || '0', 10) || 0));
              updateNotebookPage(pageKey, function (pageState) {
                pageState.labReports = pageState.labReports || {};
                pageState.labReports[index] = pageState.labReports[index] || {};
                pageState.labReports[index].rubricScores = pageState.labReports[index].rubricScores || {};
                pageState.labReports[index].rubricScores[criterionIndex] = value;
              });
              const total = tp.rubric.reduce(function (sum, item, idx) {
                const saved = idx === criterionIndex ? value : ((reportState.rubricScores || {})[idx] || 0);
                return sum + saved;
              }, 0);
              reportState.rubricScores = reportState.rubricScores || {};
              reportState.rubricScores[criterionIndex] = value;
              renderRubricTotal(total, maxScore);
            });
            row.appendChild(label);
            row.appendChild(input);
            rubricBox.appendChild(row);
          });
          renderRubricTotal(tp.rubric.reduce(function (sum, item, idx) {
            return sum + ((rubricScores[idx] || 0));
          }, 0), maxScore);
          rubricBox.appendChild(rubricTotal);
        }
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'lab-guide-btn';
        const isDone = !!((notebook.manipDone || {})[index]);
        doneBtn.textContent = isDone ? 'Manipulation réalisée' : 'Marquer comme réalisée';
        doneBtn.classList.toggle('is-done', isDone);
        doneBtn.addEventListener('click', function () {
          const next = !doneBtn.classList.contains('is-done');
          doneBtn.classList.toggle('is-done', next);
          doneBtn.textContent = next ? 'Manipulation réalisée' : 'Marquer comme réalisée';
          updateNotebookPage(pageKey, function (pageState) {
            pageState.manipDone = pageState.manipDone || {};
            pageState.manipDone[index] = next;
          });
        });
        card.appendChild(cardTitle);
        card.appendChild(consigneTitle);
        card.appendChild(objective);
        card.appendChild(protocolTitle);
        card.appendChild(createItemsList('ol', tp.protocole || [], 'lab-learning-sheet__questions'));
        card.appendChild(measureTitle);
        card.appendChild(createItemsList('ul', tp.measures || [], 'lab-learning-sheet__list'));
        card.appendChild(quantitativeTitle);
        card.appendChild(createItemsList('ul', tp.quantitativeHints || [], 'lab-learning-sheet__list'));
        card.appendChild(expectedValuesTitle);
        card.appendChild(createItemsList('ul', tp.expectedValues || [], 'lab-learning-sheet__list'));
        card.appendChild(exploitationTitle);
        card.appendChild(createItemsList('ul', tp.exploitation || [], 'lab-guide-panel__list'));
        card.appendChild(exploitationBox);
        card.appendChild(validationTitle);
        card.appendChild(createItemsList('ul', tp.validationCriteria || [], 'lab-guide-panel__list'));
        if (tp.rubric && tp.rubric.length) {
          card.appendChild(rubricTitle);
          card.appendChild(rubricBox);
        }
        card.appendChild(autoScoreTitle);
        card.appendChild(autoScoreBox);
        card.appendChild(conclusionTitle);
        const expected = document.createElement('p');
        expected.className = 'lab-notebook-sheet__objective';
        expected.textContent = tp.conclusion;
        card.appendChild(expected);
        card.appendChild(conclusionBox);
        card.appendChild(teacherCorrection);
        card.appendChild(doneBtn);

        function refreshTpCard() {
          const autoScore = computeTpAutoScore(pageKey, guide, index);
          autoScoreValue.textContent = 'Score automatique estimé : ' + autoScore.score + ' / ' + autoScore.max;
          autoScoreList.innerHTML = '';
          autoScore.details.forEach(function (line) {
            const li = document.createElement('li');
            li.textContent = line;
            autoScoreList.appendChild(li);
          });
          teacherCorrection.hidden = !getTeacherMode();
        }

        tpRefreshers.push(refreshTpCard);
        refreshTpCard();
        grid.appendChild(card);
      });
      section.appendChild(grid);
      global.addEventListener('lab-progress-updated', function () {
        tpRefreshers.forEach(function (refresh) {
          refresh();
        });
      });
    }

    const logCard = document.createElement('div');
    logCard.className = 'lab-measure-log';
    const logTitle = document.createElement('h3');
    logTitle.textContent = 'Carnet de relevés';
    const logText = document.createElement('p');
    logText.className = 'lab-notebook-sheet__subtitle';
    logText.textContent = 'Utilisez une ligne par essai ou par scénario. Conservez les unités et la conclusion physique.';
    const rowsBox = document.createElement('div');
    rowsBox.className = 'lab-measure-log__rows';
    const rowActions = document.createElement('div');
    rowActions.className = 'lab-quiz-actions';
    const addRowBtn = document.createElement('button');
    addRowBtn.type = 'button';
    addRowBtn.className = 'lab-guide-btn lab-guide-btn--primary';
    addRowBtn.textContent = 'Ajouter une ligne';
    const exportTpBtn = document.createElement('button');
    exportTpBtn.type = 'button';
    exportTpBtn.className = 'lab-guide-btn';
    exportTpBtn.textContent = 'Exporter HTML TP';
    const exportTpPdfBtn = document.createElement('button');
    exportTpPdfBtn.type = 'button';
    exportTpPdfBtn.className = 'lab-guide-btn';
    exportTpPdfBtn.textContent = 'Exporter PDF TP';
    const clearRowsBtn = document.createElement('button');
    clearRowsBtn.type = 'button';
    clearRowsBtn.className = 'lab-guide-btn';
    clearRowsBtn.textContent = 'Effacer les relevés';
    rowActions.appendChild(addRowBtn);
    rowActions.appendChild(exportTpBtn);
    rowActions.appendChild(exportTpPdfBtn);
    rowActions.appendChild(clearRowsBtn);

    function snapshotRows() {
      return Array.from(rowsBox.querySelectorAll('.lab-measure-row')).map(function (row) {
        return Array.from(row.querySelectorAll('input')).slice(0, 5).map(function (input) {
          return input.value.trim();
        });
      }).filter(function (values) {
        return values.some(function (value) { return value; });
      });
    }

    function persistRows() {
      updateNotebookPage(pageKey, function (pageState) {
        pageState.measureRows = snapshotRows();
      });
    }

    function appendRow(values) {
      const row = createMeasureRow(values, guide.measurementHints || [], persistRows, function () {
        row.remove();
        persistRows();
      });
      rowsBox.appendChild(row);
    }

    const storedRows = getNotebookPage(pageKey).measureRows || [];
    const defaultRows = getEngineeringLab(guide, 0, pageKey).prefilledRows || [];
    if (storedRows.length) {
      storedRows.forEach(appendRow);
    } else if (defaultRows.length) {
      defaultRows.forEach(appendRow);
      persistRows();
    } else {
      appendRow([]);
    }

    addRowBtn.addEventListener('click', function () {
      appendRow([]);
    });
    clearRowsBtn.addEventListener('click', function () {
      rowsBox.innerHTML = '';
      if (defaultRows.length) {
        defaultRows.forEach(appendRow);
        persistRows();
      } else {
        appendRow([]);
        persistRows();
      }
    });

    exportTpBtn.addEventListener('click', function () {
      exportTpReport(pageKey, guide);
    });

    exportTpPdfBtn.addEventListener('click', function () {
      exportTpPdfReport(pageKey, guide);
    });

    logCard.appendChild(logTitle);
    logCard.appendChild(logText);
    logCard.appendChild(rowsBox);
    logCard.appendChild(rowActions);
    section.appendChild(logCard);
    host.appendChild(section);
  }

  function renderQuizSheet(guide, pageKey) {
    if (document.querySelector('.lab-quiz-sheet') || !guide.quiz || !guide.quiz.length) {
      return;
    }

    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'lab-quiz-sheet';
    section.setAttribute('aria-label', 'Quiz interactif de fin de module');

    const title = document.createElement('h2');
    title.className = 'lab-quiz-sheet__title';
    title.textContent = 'Quiz interactif de fin de module';
    const subtitle = document.createElement('p');
    subtitle.className = 'lab-quiz-sheet__subtitle';
    subtitle.textContent = 'Validez les acquis essentiels du module puis comparez votre r\u00e9sultat avec les r\u00e9ponses attendues en mode enseignant.';
    section.appendChild(title);
    section.appendChild(subtitle);

    guide.quiz.forEach(function (item, index) {
      const card = document.createElement('article');
      card.className = 'lab-quiz-question';
      const cardHead = document.createElement('div');
      cardHead.className = 'lab-difficulty-head';
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'lab-quiz-question__title';
      cardTitle.textContent = (index + 1) + '. ' + item.question;
      const badge = document.createElement('span');
      badge.className = 'lab-difficulty-badge lab-difficulty-badge--' + (item.difficulty || 'intermediate');
      badge.textContent = item.difficultyLabel || 'Intermédiaire';
      const lockNote = document.createElement('div');
      lockNote.className = 'lab-card-lock-note';
      lockNote.hidden = true;
      const options = document.createElement('div');
      options.className = 'lab-quiz-options';
      const inputs = [];

      (item.options || []).forEach(function (option, optionIndex) {
        const label = document.createElement('label');
        label.className = 'lab-quiz-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'labQuiz-' + pageKey + '-' + index;
        input.value = String(optionIndex);
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        options.appendChild(label);
        inputs.push(input);
      });

      cardHead.appendChild(cardTitle);
      cardHead.appendChild(badge);
      card.appendChild(cardHead);
      card.appendChild(lockNote);
      card.appendChild(options);
      section.appendChild(card);
      quizCards.push({ card: card, item: item, inputs: inputs, lockNote: lockNote, index: index });
    });

    const actions = document.createElement('div');
    actions.className = 'lab-quiz-actions';
    const submit = document.createElement('button');
    submit.className = 'lab-guide-btn lab-guide-btn--primary';
    submit.type = 'button';
    submit.textContent = 'Corriger le quiz';
    actions.appendChild(submit);
    section.appendChild(actions);

    const feedback = document.createElement('div');
    feedback.className = 'lab-quiz-feedback';
    section.appendChild(feedback);

    function renderStoredFeedback() {
      const result = readQuizResults()[pageKey];
      if (result && typeof result.score === 'number') {
        feedback.textContent = 'Dernier score enregistr\u00e9 : ' + result.score + ' / ' + result.total + '.';
      }
    }

    submit.addEventListener('click', function () {
      const unlockedLevel = getUnlockedQuizDifficulty(pageKey);
      const visibleQuestions = guide.quiz.filter(function (item) {
        return getDifficultyIndex(item.difficulty) <= getDifficultyIndex(unlockedLevel);
      });
      let answered = 0;
      let score = 0;
      const lines = [];

      visibleQuestions.forEach(function (item, visibleIndex) {
        const index = guide.quiz.indexOf(item);
        const checked = section.querySelector('input[name="labQuiz-' + pageKey + '-' + index + '"]:checked');
        if (checked) {
          answered += 1;
          if (parseInt(checked.value, 10) === item.answer) {
            score += 1;
          }
        }

        lines.push(
          'Q' + (index + 1) + ' : ' +
          (checked && parseInt(checked.value, 10) === item.answer ? 'Correct' : 'Incorrect') +
          ' \u2014 ' + (item.explanation || 'R\u00e9ponse enregistr\u00e9e.')
        );
      });

      if (answered < guide.quiz.length) {
        feedback.textContent = 'Veuillez r\u00e9pondre \u00e0 toutes les questions avant correction.';
        return;
      }

      saveQuizResult(pageKey, score, guide.quiz.length);
      feedback.innerHTML = 'Score : <strong>' + score + ' / ' + guide.quiz.length + '</strong><br>' + lines.join('<br>');
      emitLabProgressUpdated({ pageKey: pageKey });
    });

    renderStoredFeedback();
    host.appendChild(section);
  }

  function renderAchievementSheet() {
    const host = document.querySelector('.wrap, .container');
    if (!host) {
      return;
    }

    let section = document.querySelector('.lab-achievement-sheet');
    if (!section) {
      section = document.createElement('section');
      section.className = 'lab-achievement-sheet';
      section.setAttribute('aria-label', 'Badges de r\u00e9ussite et certificat interne');
      host.appendChild(section);
    }

    const data = computeAchievements();
    const profile = readProfile();
    section.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'lab-achievement-sheet__title';
    title.textContent = 'Badges de r\u00e9ussite et certificat interne';
    const subtitle = document.createElement('p');
    subtitle.className = 'lab-achievement-sheet__subtitle';
    subtitle.textContent = 'La progression globale du laboratoire d\u00e9bloque des badges p\u00e9dagogiques puis un certificat interne de validation.';
    section.appendChild(title);
    section.appendChild(subtitle);

    const grid = document.createElement('div');
    grid.className = 'lab-achievement-grid';
    data.badges.forEach(function (badge) {
      const card = document.createElement('article');
      card.className = 'lab-badge-card' + (badge.earned ? ' is-earned' : '');
      const state = document.createElement('div');
      state.className = 'lab-badge-card__state';
      state.textContent = badge.earned ? 'Obtenu' : '\u00c0 d\u00e9bloquer';
      const cardTitle = document.createElement('h3');
      cardTitle.className = 'lab-badge-card__title';
      cardTitle.textContent = badge.title;
      const text = document.createElement('div');
      text.className = 'lab-badge-card__text';
      text.textContent = badge.text;
      card.appendChild(state);
      card.appendChild(cardTitle);
      card.appendChild(text);
      grid.appendChild(card);
    });

    const certificate = document.createElement('article');
    certificate.className = 'lab-certificate-card';
    const meta = document.createElement('div');
    meta.className = 'lab-certificate-card__meta';
    meta.textContent = data.certificate.earned ? 'Certificat accord\u00e9' : 'Certificat en cours';
    const certTitle = document.createElement('h3');
    certTitle.className = 'lab-certificate-card__title';
    certTitle.textContent = data.certificate.title;
    const certText = document.createElement('div');
    certText.className = 'lab-certificate-card__text';
    certText.innerHTML = data.certificate.text + '<br><br><strong>\u00c9tudiant :</strong> ' + (profile.studentName || 'Non renseign\u00e9') + '<br><strong>Signature :</strong> ' + (profile.certificateSigner || 'Responsable p\u00e9dagogique du laboratoire');
    certificate.appendChild(meta);
    certificate.appendChild(certTitle);
    certificate.appendChild(certText);
    grid.appendChild(certificate);

    section.appendChild(grid);
  }

  function renderLearningSupport(section, pageId) {
    if (document.querySelector('.lab-guide-fab')) {
      return;
    }

    const guide = getGuideDefinition(section, pageId);
    if (!guide) {
      return;
    }

    const pageKey = pageId || section || 'home';
    safeExecute(function () { renderLearningSheet(guide); });
    safeExecute(function () { renderPedagogyQuickBar(pageKey); });
    safeExecute(function () { renderExerciseSheet(guide, pageKey); });
    safeExecute(function () { renderQuizSheet(guide, pageKey); });
    safeExecute(function () { renderNotebookSheet(guide, pageKey); });
    safeExecute(function () { renderAchievementSheet(); });
    safeExecute(function () { renderGuideDrawer(guide, pageKey); });
  }

  function renderGuideDrawer(guide, pageKey) {
    const drawer = document.createElement('aside');
    drawer.className = 'lab-guide-drawer';
    drawer.setAttribute('aria-label', 'Aide contextuelle du laboratoire');

    const fab = document.createElement('button');
    fab.className = 'lab-guide-fab';
    fab.type = 'button';
    fab.textContent = 'Aide \u2022 TP guid\u00e9';

    const head = document.createElement('div');
    head.className = 'lab-guide-drawer__head';
    const headText = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Assistant p\u00e9dagogique';
    const subtitle = document.createElement('p');
    subtitle.textContent = guide.subtitle;
    headText.appendChild(title);
    headText.appendChild(subtitle);
    const close = document.createElement('button');
    close.className = 'lab-guide-drawer__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fermer l\u2019aide');
    close.textContent = '\u00d7';
    head.appendChild(headText);
    head.appendChild(close);

    const tabs = document.createElement('div');
    tabs.className = 'lab-guide-drawer__tabs';
    const body = document.createElement('div');
    body.className = 'lab-guide-drawer__body';

    const panels = {};
    ['help', 'tp', 'objectives', 'exercises', 'measures', 'teacher', 'progress', 'quiz'].forEach(function (name) {
      const button = document.createElement('button');
      button.className = 'lab-guide-drawer__tab' + (name === 'help' ? ' active' : '');
      button.type = 'button';
      button.textContent = name === 'help'
        ? 'Aide'
        : (name === 'tp'
          ? 'TP guid\u00e9'
          : (name === 'objectives'
            ? 'Objectifs'
            : (name === 'exercises'
              ? 'Exercices'
              : (name === 'measures'
                ? 'Mesures'
                : (name === 'teacher' ? 'Enseignant' : (name === 'progress' ? 'Progression' : 'Quiz'))))));
      button.dataset.panel = name;
      tabs.appendChild(button);

      const panel = document.createElement('section');
      panel.className = 'lab-guide-panel' + (name === 'help' ? ' active' : '');
      panel.dataset.panel = name;
      panels[name] = panel;
      body.appendChild(panel);
    });

    panels.help.appendChild(createItemsList('ul', guide.help, 'lab-guide-panel__list'));
    panels.objectives.appendChild(createItemsList('ul', guide.objectives, 'lab-guide-panel__list'));
    panels.objectives.appendChild(createItemsList('ol', guide.questions, 'lab-guide-panel__list'));
    panels.exercises.appendChild(createDefinitionList((guide.exercises || []).map(function (item, index) {
      return { label: 'Exercice ' + (index + 1), value: item.title + ' — ' + item.prompt };
    })));
    panels.measures.appendChild(createDefinitionList((guide.manipulations || []).map(function (item, index) {
      return { label: 'Manipulation ' + (index + 1), value: item.title + ' — ' + item.objective };
    })));

    const exerciseGoBtn = document.createElement('button');
    exerciseGoBtn.className = 'lab-guide-btn lab-guide-btn--primary';
    exerciseGoBtn.type = 'button';
    exerciseGoBtn.textContent = 'Aller aux exercices';
    exerciseGoBtn.disabled = !guide.exercises || !guide.exercises.length;
    panels.exercises.appendChild(exerciseGoBtn);

    const measureGoBtn = document.createElement('button');
    measureGoBtn.className = 'lab-guide-btn lab-guide-btn--primary';
    measureGoBtn.type = 'button';
    measureGoBtn.textContent = 'Aller au carnet de mesures';
    measureGoBtn.disabled = !guide.manipulations || !guide.manipulations.length;
    panels.measures.appendChild(measureGoBtn);

    const steps = guide.tpSteps || [];
    const stepKey = 'labGuideStep:' + pageKey;
    let currentStep = 0;
    try {
      const stored = parseInt(global.localStorage.getItem(stepKey) || '0', 10);
      currentStep = Math.max(0, Math.min(steps.length - 1, stored || 0));
    } catch (error) {
    }

    const stepBox = document.createElement('div');
    stepBox.className = 'lab-guide-step';
    const stepMeta = document.createElement('div');
    stepMeta.className = 'lab-guide-step__meta';
    const stepTitle = document.createElement('h3');
    stepTitle.className = 'lab-guide-step__title';
    const stepText = document.createElement('div');
    stepText.className = 'lab-guide-step__text';
    const stepActions = document.createElement('div');
    stepActions.className = 'lab-guide-step__actions';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lab-guide-btn';
    prevBtn.type = 'button';
    prevBtn.textContent = '\u00c9tape pr\u00e9c\u00e9dente';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lab-guide-btn lab-guide-btn--primary';
    nextBtn.type = 'button';
    nextBtn.textContent = '\u00c9tape suivante';
    const targetBtn = document.createElement('button');
    targetBtn.className = 'lab-guide-btn';
    targetBtn.type = 'button';
    targetBtn.textContent = 'Aller \u00e0 la zone';
    const progress = document.createElement('div');
    progress.className = 'lab-guide-progress';
    stepActions.appendChild(prevBtn);
    stepActions.appendChild(nextBtn);
    stepActions.appendChild(targetBtn);
    stepBox.appendChild(stepMeta);
    stepBox.appendChild(stepTitle);
    stepBox.appendChild(stepText);
    stepBox.appendChild(stepActions);
    stepBox.appendChild(progress);
    panels.tp.appendChild(stepBox);

    const teacherToggle = document.createElement('button');
    teacherToggle.className = 'lab-teacher-toggle';
    teacherToggle.type = 'button';
    const teacherNote = document.createElement('div');
    teacherNote.className = 'lab-guide-note';
    const teacherAnswersBox = document.createElement('div');
    const profileForm = document.createElement('div');
    profileForm.className = 'lab-form-stack';
    const establishmentField = document.createElement('div');
    establishmentField.className = 'lab-form-field';
    const establishmentLabel = document.createElement('label');
    establishmentLabel.textContent = 'Établissement';
    const establishmentInput = document.createElement('input');
    establishmentInput.type = 'text';
    establishmentInput.placeholder = 'École d’ingénieurs — Département Télécommunications';
    establishmentField.appendChild(establishmentLabel);
    establishmentField.appendChild(establishmentInput);
    const studentField = document.createElement('div');
    studentField.className = 'lab-form-field';
    const studentLabel = document.createElement('label');
    studentLabel.textContent = 'Nom de l’étudiant';
    const studentInput = document.createElement('input');
    studentInput.type = 'text';
    studentInput.placeholder = 'Ex. Aïssatou Diallo';
    studentField.appendChild(studentLabel);
    studentField.appendChild(studentInput);
    const partnerField = document.createElement('div');
    partnerField.className = 'lab-form-field';
    const partnerLabel = document.createElement('label');
    partnerLabel.textContent = 'Binôme';
    const partnerInput = document.createElement('input');
    partnerInput.type = 'text';
    partnerInput.placeholder = 'Ex. Mamadou Traoré';
    partnerField.appendChild(partnerLabel);
    partnerField.appendChild(partnerInput);
    const groupField = document.createElement('div');
    groupField.className = 'lab-form-field';
    const groupLabel = document.createElement('label');
    groupLabel.textContent = 'Groupe';
    const groupInput = document.createElement('input');
    groupInput.type = 'text';
    groupInput.placeholder = 'Ex. GI-2A';
    groupField.appendChild(groupLabel);
    groupField.appendChild(groupInput);
    const signerField = document.createElement('div');
    signerField.className = 'lab-form-field';
    const signerLabel = document.createElement('label');
    signerLabel.textContent = 'Signataire du certificat';
    const signerInput = document.createElement('input');
    signerInput.type = 'text';
    signerInput.placeholder = 'Responsable p\u00e9dagogique du laboratoire';
    signerField.appendChild(signerLabel);
    signerField.appendChild(signerInput);
    profileForm.appendChild(establishmentField);
    profileForm.appendChild(studentField);
    profileForm.appendChild(partnerField);
    profileForm.appendChild(groupField);
    profileForm.appendChild(signerField);
    panels.teacher.appendChild(teacherToggle);
    panels.teacher.appendChild(profileForm);
    panels.teacher.appendChild(teacherNote);
    panels.teacher.appendChild(teacherAnswersBox);

    const progressStats = document.createElement('div');
    progressStats.className = 'lab-guide-stats';
    const progressBar = document.createElement('div');
    progressBar.className = 'lab-guide-progressbar';
    const progressFill = document.createElement('div');
    progressFill.className = 'lab-guide-progressbar__fill';
    progressBar.appendChild(progressFill);
    const progressNote = document.createElement('div');
    progressNote.className = 'lab-guide-note';
    panels.progress.appendChild(progressStats);
    panels.progress.appendChild(progressBar);
    panels.progress.appendChild(progressNote);

    const quizSummary = document.createElement('div');
    quizSummary.className = 'lab-guide-note';
    const quizGoBtn = document.createElement('button');
    quizGoBtn.className = 'lab-guide-btn lab-guide-btn--primary';
    quizGoBtn.type = 'button';
    quizGoBtn.textContent = 'Aller au quiz';
    const exportCsvBtn = document.createElement('button');
    exportCsvBtn.className = 'lab-guide-btn';
    exportCsvBtn.type = 'button';
    exportCsvBtn.textContent = 'Exporter CSV';
    const exportPdfBtn = document.createElement('button');
    exportPdfBtn.className = 'lab-guide-btn';
    exportPdfBtn.type = 'button';
    exportPdfBtn.textContent = 'Exporter PDF';
    const exportActions = document.createElement('div');
    exportActions.className = 'lab-dashboard-actions';
    exportActions.appendChild(exportCsvBtn);
    exportActions.appendChild(exportPdfBtn);
    const teacherDashboard = document.createElement('div');
    teacherDashboard.className = 'lab-dashboard-grid';
    const historyBox = document.createElement('div');
    historyBox.className = 'lab-guide-note';
    panels.quiz.appendChild(quizSummary);
    panels.quiz.appendChild(quizGoBtn);
    panels.quiz.appendChild(exportActions);
    panels.quiz.appendChild(historyBox);
    panels.teacher.appendChild(teacherDashboard);

    function persistStep() {
      try {
        global.localStorage.setItem(stepKey, String(currentStep));
      } catch (error) {
      }
      emitLabProgressUpdated({ pageKey: pageKey, tpStep: currentStep });
    }

    function scrollToSelector(selector) {
      if (!selector) {
        return;
      }
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function renderStep() {
      if (!steps.length) {
        stepMeta.textContent = 'TP guid\u00e9 indisponible';
        stepTitle.textContent = 'Aucune \u00e9tape d\u00e9finie';
        stepText.textContent = 'Cette page ne propose pas encore de sc\u00e9nario guid\u00e9.';
        progress.textContent = '';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        targetBtn.disabled = true;
        return;
      }

      const step = steps[currentStep];
      stepMeta.textContent = '\u00c9tape ' + (currentStep + 1) + ' / ' + steps.length;
      stepTitle.textContent = step.title;
      stepText.textContent = step.text;
      progress.textContent = 'Mode TP guid\u00e9 actif : avancez s\u00e9quentiellement puis validez votre interpr\u00e9tation physique.';
      prevBtn.disabled = currentStep === 0;
      nextBtn.disabled = currentStep === steps.length - 1;
      targetBtn.disabled = !step.target;
      persistStep();
    }

    function renderTeacherPanel() {
      const teacherMode = getTeacherMode();
      const profile = readProfile();
      teacherToggle.textContent = teacherMode ? 'Désactiver le mode enseignant' : 'Activer le mode enseignant';
      establishmentInput.value = profile.establishmentName || '';
      studentInput.value = profile.studentName || '';
      partnerInput.value = profile.partnerName || '';
      groupInput.value = profile.groupName || '';
      signerInput.value = profile.certificateSigner || '';
      teacherAnswersBox.innerHTML = '';
      teacherDashboard.innerHTML = '';

      if (!teacherMode) {
        teacherNote.textContent = 'Le mode enseignant masque les r\u00e9ponses attendues et les \u00e9l\u00e9ments de correction d\u00e9taill\u00e9s.';
        return;
      }

      teacherNote.textContent = 'R\u00e9ponses attendues pour ce module : utilisez-les comme correction ou comme trame de synth\u00e8se.';

      const answerCard = document.createElement('section');
      answerCard.className = 'lab-teacher-answer';
      const answerTitle = document.createElement('h3');
      answerTitle.textContent = 'R\u00e9ponses attendues';
      answerCard.appendChild(answerTitle);
      answerCard.appendChild(createItemsList('ul', guide.expectedAnswers, 'lab-guide-panel__list'));
      teacherAnswersBox.appendChild(answerCard);

      if (guide.quiz && guide.quiz.length) {
        const correctionCard = document.createElement('section');
        correctionCard.className = 'lab-teacher-answer';
        const correctionTitle = document.createElement('h3');
        correctionTitle.textContent = 'Correction du quiz';
        correctionCard.appendChild(correctionTitle);
        correctionCard.appendChild(createItemsList('ul', guide.quiz.map(function (item, index) {
          return 'Q' + (index + 1) + ' : ' + item.options[item.answer] + ' \u2014 ' + (item.explanation || 'Correction attendue.');
        }), 'lab-guide-panel__list'));
        teacherAnswersBox.appendChild(correctionCard);
      }

      if (guide.exercises && guide.exercises.length) {
        const exerciseCard = document.createElement('section');
        exerciseCard.className = 'lab-teacher-answer';
        const exerciseTitle = document.createElement('h3');
        exerciseTitle.textContent = 'Corrigés des exercices';
        exerciseCard.appendChild(exerciseTitle);
        guide.exercises.forEach(function (item, index) {
          const block = document.createElement('div');
          block.className = 'lab-guide-note';
          const title = document.createElement('strong');
          title.textContent = 'Exercice ' + (index + 1) + ' — ' + item.title;
          block.appendChild(title);
          block.appendChild(createItemsList('ul', item.correction || [], 'lab-guide-panel__list'));
          exerciseCard.appendChild(block);
        });
        teacherAnswersBox.appendChild(exerciseCard);
      }

      buildTeacherDashboardData().forEach(function (item) {
        const card = document.createElement('article');
        card.className = 'lab-dashboard-card';
        const meta = document.createElement('div');
        meta.className = 'lab-dashboard-card__meta';
        meta.textContent = item.visitedPages + '/' + item.totalPages + ' pages \u2022 ' + item.quizCompleted + ' quiz';
        const title = document.createElement('h3');
        title.className = 'lab-dashboard-card__title';
        title.textContent = item.title;
        const text = document.createElement('div');
        text.className = 'lab-dashboard-card__text';
        text.textContent = item.quizCompleted ? ('Moyenne quiz : ' + item.quizAverage.toFixed(1) + ' %.') : 'Aucun quiz valid\u00e9 pour ce module.';
        card.appendChild(meta);
        card.appendChild(title);
        card.appendChild(text);
        teacherDashboard.appendChild(card);
      });
    }

    function renderProgressPanel() {
      const progressState = readLabProgress();
      const quizResults = readQuizResults();
      const visitedCount = ALL_PAGE_IDS.filter(function (id) { return !!(progressState.visited || {})[id]; }).length;
      const totalCount = ALL_PAGE_IDS.length || 1;
      const quizCompleted = Object.keys(quizResults).length;
      const moduleKey = getActiveModule(document.body.dataset.labSection || '');
      const modulePages = (LAB_STRUCTURE[moduleKey] && LAB_STRUCTURE[moduleKey].pages ? LAB_STRUCTURE[moduleKey].pages : []).map(function (page) { return page.id; });
      const moduleVisited = modulePages.filter(function (id) { return !!(progressState.visited || {})[id]; }).length;
      const moduleStepInfo = steps.length ? ('TP local : \u00e9tape ' + (currentStep + 1) + ' / ' + steps.length) : 'TP local : non d\u00e9fini';
      const stats = [
        { label: 'Pages visit\u00e9es', value: visitedCount + ' / ' + totalCount },
        { label: 'Quiz valid\u00e9s', value: quizCompleted + ' / ' + totalCount },
        { label: 'Module actif', value: modulePages.length ? (moduleVisited + ' / ' + modulePages.length) : '\u2014' },
        { label: 'TP local', value: steps.length ? (currentStep + 1) + ' / ' + steps.length : '\u2014' }
      ];

      progressStats.innerHTML = '';
      stats.forEach(function (item) {
        const card = document.createElement('div');
        card.className = 'lab-guide-stat';
        const label = document.createElement('div');
        label.className = 'lab-guide-stat__label';
        label.textContent = item.label;
        const value = document.createElement('div');
        value.className = 'lab-guide-stat__value';
        value.textContent = item.value;
        card.appendChild(label);
        card.appendChild(value);
        progressStats.appendChild(card);
      });

      progressFill.style.width = ((visitedCount / totalCount) * 100).toFixed(1) + '%';
      progressNote.textContent = moduleStepInfo + '. La progression globale combine visites, TP locaux et quiz compl\u00e9t\u00e9s.';
    }

    function renderQuizPanel() {
      const allResults = readQuizResults();
      const result = allResults[pageKey];
      if (result && typeof result.score === 'number') {
        quizSummary.innerHTML = 'Dernier score enregistr\u00e9 : <strong>' + result.score + ' / ' + result.total + '</strong>.';
      } else {
        quizSummary.textContent = 'Aucun score enregistr\u00e9 pour cette page. Le quiz interactif est disponible en bas du module.';
      }
      const attempts = result && Array.isArray(result.attempts) ? result.attempts : [];
      if (attempts.length) {
        historyBox.innerHTML = '<strong>Historique d\u00e9taill\u00e9 :</strong>';
        const list = document.createElement('ol');
        list.className = 'lab-history-list';
        attempts.slice().reverse().forEach(function (attempt, index) {
          const li = document.createElement('li');
          const attemptNumber = attempts.length - index;
          li.textContent = 'Tentative ' + attemptNumber + ' \u2014 ' + formatDateTime(attempt.completedAt) + ' \u2014 score ' + attempt.score + ' / ' + attempt.total + '.';
          list.appendChild(li);
        });
        historyBox.appendChild(list);
      } else {
        historyBox.textContent = 'Historique d\u00e9taill\u00e9 : aucune tentative enregistr\u00e9e pour cette page.';
      }
      quizGoBtn.disabled = !document.querySelector('.lab-quiz-sheet');
    }

    prevBtn.addEventListener('click', function () {
      if (currentStep > 0) {
        currentStep -= 1;
        renderStep();
        renderProgressPanel();
        if (steps[currentStep] && steps[currentStep].target) {
          scrollToSelector(steps[currentStep].target);
        }
      }
    });

    nextBtn.addEventListener('click', function () {
      if (currentStep < steps.length - 1) {
        currentStep += 1;
        renderStep();
        renderProgressPanel();
        if (steps[currentStep] && steps[currentStep].target) {
          scrollToSelector(steps[currentStep].target);
        }
      }
    });

    targetBtn.addEventListener('click', function () {
      if (steps[currentStep] && steps[currentStep].target) {
        scrollToSelector(steps[currentStep].target);
      }
    });

    teacherToggle.addEventListener('click', function () {
      setTeacherMode(!getTeacherMode());
      renderTeacherPanel();
    });

    establishmentInput.addEventListener('change', function () {
      const profile = readProfile();
      profile.establishmentName = establishmentInput.value.trim() || 'École d’ingénieurs — Département Télécommunications';
      saveProfile(profile);
    });

    studentInput.addEventListener('change', function () {
      const profile = readProfile();
      profile.studentName = studentInput.value.trim();
      saveProfile(profile);
      renderAchievementSheet();
    });

    partnerInput.addEventListener('change', function () {
      const profile = readProfile();
      profile.partnerName = partnerInput.value.trim();
      saveProfile(profile);
    });

    groupInput.addEventListener('change', function () {
      const profile = readProfile();
      profile.groupName = groupInput.value.trim();
      saveProfile(profile);
    });

    signerInput.addEventListener('change', function () {
      const profile = readProfile();
      profile.certificateSigner = signerInput.value.trim() || 'Responsable p\u00e9dagogique du laboratoire';
      saveProfile(profile);
      renderAchievementSheet();
    });

    quizGoBtn.addEventListener('click', function () {
      scrollToSelector('.lab-quiz-sheet');
    });

    exerciseGoBtn.addEventListener('click', function () {
      scrollToSelector('.lab-exercise-sheet');
    });

    measureGoBtn.addEventListener('click', function () {
      scrollToSelector('.lab-notebook-sheet');
    });

    exportCsvBtn.addEventListener('click', function () {
      exportCsvReport();
    });

    exportPdfBtn.addEventListener('click', function () {
      exportPdfReport();
    });

    tabs.addEventListener('click', function (event) {
      const button = event.target.closest('.lab-guide-drawer__tab');
      if (!button) {
        return;
      }

      const panelName = button.dataset.panel;
      Array.from(tabs.querySelectorAll('.lab-guide-drawer__tab')).forEach(function (tab) {
        tab.classList.toggle('active', tab === button);
      });
      Array.from(body.querySelectorAll('.lab-guide-panel')).forEach(function (panel) {
        panel.classList.toggle('active', panel.dataset.panel === panelName);
      });
    });

    function setOpen(isOpen) {
      drawer.classList.toggle('is-open', isOpen);
    }

    fab.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('is-open'));
    });

    close.addEventListener('click', function () {
      setOpen(false);
    });

    renderStep();
    renderTeacherPanel();
    renderProgressPanel();
    renderQuizPanel();
    global.addEventListener('lab-progress-updated', function () {
      renderProgressPanel();
      renderQuizPanel();
      renderTeacherPanel();
      renderAchievementSheet();
    });
    global.addEventListener('lab-progress-updated', function (event) {
      const detail = event && event.detail ? event.detail : {};
      if (detail.pageKey === pageKey && typeof detail.tpStep === 'number' && detail.tpStep !== currentStep) {
        currentStep = Math.max(0, Math.min(steps.length - 1, detail.tpStep));
        renderStep();
        renderProgressPanel();
      }
    });
    drawer.appendChild(head);
    drawer.appendChild(tabs);
    drawer.appendChild(body);
    document.body.appendChild(drawer);
    document.body.appendChild(fab);
  }

  function inferBasePath(homeLink) {
    if (!homeLink) {
      return '';
    }

    const href = homeLink.getAttribute('href') || '';
    return href.replace(/index\.html$/i, '');
  }

  function getActiveModule(section) {
    if (!section) return 'home';
    if (section.indexOf('analogique') === 0) return 'analogique';
    if (section.indexOf('numerisation') === 0) return 'numerisation';
    if (section.indexOf('modulations') === 0 || section.indexOf('compat-symbol') === 0) return 'modulations';
    if (section.indexOf('transmission') === 0) return 'transmission';
    if (section.indexOf('multiplexage') === 0 || section.indexOf('compat-pcm') === 0) return 'multiplexage';
    return 'home';
  }

  function withBasePath(basePath, href) {
    return encodeURI((basePath || '') + href);
  }

  function createLinkItem(className, item, basePath, activeId) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = className + (item.id && item.id === activeId ? ' active' : '');
    a.href = withBasePath(basePath, item.href);
    a.textContent = item.label;
    li.appendChild(a);
    return li;
  }

  function appendLinkList(container, title, items, className, basePath, activeId) {
    if (!items || !items.length) {
      return;
    }

    const card = document.createElement('section');
    card.className = 'lab-context-nav__card';

    const heading = document.createElement('h2');
    heading.className = 'lab-context-nav__title';
    heading.textContent = title;
    card.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'lab-context-nav__list';
    items.forEach(function (item) {
      list.appendChild(createLinkItem(className, item, basePath, activeId));
    });

    card.appendChild(list);
    container.appendChild(card);
  }

  function renderModuleNav(basePath) {
    if (document.querySelector('.lab-module-nav')) {
      return;
    }

    const prefix = basePath || '';
    const bodySection = document.body.dataset.labSection || '';
    const active = getActiveModule(bodySection);
    const navItems = [
      { key: 'home', label: 'Accueil', href: prefix + 'index.html' },
      { key: 'analogique', label: 'Analogique', href: prefix + 'pages/analogique/Emetteur.html' },
      { key: 'numerisation', label: 'Num\u00e9risation', href: prefix + 'pages/numerisation/CAN.html' },
      { key: 'modulations', label: 'Modulations', href: prefix + 'pages/modulations/Simulateur 2.html' },
      { key: 'transmission', label: 'Transmission', href: prefix + 'pages/transmission/Transmission.html' },
      { key: 'multiplexage', label: 'Multiplexage', href: prefix + 'pages/multiplexage/MUX.html' }
    ];

    const nav = document.createElement('nav');
    nav.className = 'lab-module-nav';
    nav.setAttribute('aria-label', 'Navigation transversale du laboratoire');

    const list = document.createElement('ul');
    list.className = 'lab-module-nav__list';

    navItems.forEach(function (item) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'lab-module-nav__link' + (item.key === active ? ' active' : '');
      a.href = encodeURI(item.href);
      a.textContent = item.label;
      li.appendChild(a);
      list.appendChild(li);
    });

    nav.appendChild(list);

    const header = document.querySelector('.lab-global-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(nav, header.nextSibling);
    }
  }

  function readRecentPages() {
    try {
      const raw = global.localStorage.getItem(RECENT_PAGES_KEY);
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      return [];
    }
  }

  function writeRecentPages(items) {
    try {
      global.localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(items));
    } catch (error) {
    }
  }

  function trackRecentPage(entry) {
    if (!entry || !entry.href || !entry.title) {
      return;
    }

    const items = readRecentPages().filter(function (item) {
      return item && item.href !== entry.href;
    });

    items.unshift({
      title: entry.title,
      href: entry.href,
      section: entry.section || '',
      pageId: entry.pageId || '',
      subtitle: entry.subtitle || '',
      visitedAt: Date.now()
    });

    writeRecentPages(items.slice(0, 8));
  }

  function getRecentPages(limit) {
    const max = typeof limit === 'number' ? limit : 8;
    return readRecentPages().slice(0, max);
  }

  function clearRecentPages() {
    try {
      global.localStorage.removeItem(RECENT_PAGES_KEY);
    } catch (error) {
    }
  }

  function renderContextNav(basePath, section, pageId) {
    if (document.querySelector('.lab-context-nav')) {
      return;
    }

    const activeModule = getActiveModule(section);
    const moduleDef = LAB_STRUCTURE[activeModule];
    if (!moduleDef) {
      return;
    }

    const pageIndex = moduleDef.pages.findIndex(function (page) {
      return page.id === pageId;
    });
    const stepItems = [];

    if (pageIndex > 0) {
      stepItems.push(moduleDef.pages[pageIndex - 1]);
    }
    if (pageIndex >= 0 && pageIndex < moduleDef.pages.length - 1) {
      stepItems.push(moduleDef.pages[pageIndex + 1]);
    }
    if (!stepItems.length && moduleDef.pages.length) {
      stepItems.push(moduleDef.pages[0]);
    }

    const wrapper = document.createElement('section');
    wrapper.className = 'lab-context-nav';
    wrapper.setAttribute('aria-label', 'Navigation de parcours du module');

    const inner = document.createElement('div');
    inner.className = 'lab-context-nav__grid';

    const intro = document.createElement('section');
    intro.className = 'lab-context-nav__card lab-context-nav__card--intro';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'lab-context-nav__eyebrow';
    eyebrow.textContent = 'Parcours du laboratoire';

    const title = document.createElement('h2');
    title.className = 'lab-context-nav__title';
    title.textContent = moduleDef.title;

    const text = document.createElement('p');
    text.className = 'lab-context-nav__text';
    text.textContent = 'Navigation locale du module actif et passerelles rapides vers les autres briques p\u00e9dagogiques.';

    intro.appendChild(eyebrow);
    intro.appendChild(title);
    intro.appendChild(text);
    inner.appendChild(intro);

    appendLinkList(inner, 'Dans ce module', moduleDef.pages, 'lab-context-nav__link', basePath, pageId);
    appendLinkList(inner, '\u00c9tapes voisines', stepItems, 'lab-context-nav__link lab-context-nav__link--step', basePath, '');
    appendLinkList(inner, 'Passerelles labo', moduleDef.bridges, 'lab-context-nav__link lab-context-nav__link--bridge', basePath, '');

    wrapper.appendChild(inner);

    const moduleNav = document.querySelector('.lab-module-nav');
    if (moduleNav && moduleNav.parentNode) {
      moduleNav.parentNode.insertBefore(wrapper, moduleNav.nextSibling);
    }
  }

  function redirectTo(url) {
    global.location.replace(url);
  }

  function setupRedirectPage(targetUrl) {
    redirectTo(targetUrl);
  }

  function applyMode(modeHandlers) {
    const params = getParams();
    const mode = params.get('mode');

    if (mode && modeHandlers && typeof modeHandlers[mode] === 'function') {
      modeHandlers[mode](params);
    }

    return { mode: mode, params: params };
  }

  function scrollToSection(id, delay) {
    const wait = typeof delay === 'number' ? delay : 0;
    global.setTimeout(function () {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, wait);
  }

  global.LabCommon = {
    getParams: getParams,
    initHeader: initHeader,
    redirectTo: redirectTo,
    setupRedirectPage: setupRedirectPage,
    applyMode: applyMode,
    scrollToSection: scrollToSection,
    renderModuleNav: renderModuleNav,
    getRecentPages: getRecentPages,
    clearRecentPages: clearRecentPages
  };
})(window);
