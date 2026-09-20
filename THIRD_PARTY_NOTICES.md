# Third-party data notices

## LEXiTRON

Vocabulary translations in `data/learning-bank.js` and `data/exam-bank.js` were adapted from the English–Thai LEXiTRON 2.0 dataset published by the National Electronics and Computer Technology Center (NECTEC), National Science and Technology Development Agency (NSTDA).

Copyright (c) 2003 National Electronics and Computer Technology Center (NECTEC). All rights reserved.

This product is created by the adaptation of LEXiTRON developed by NECTEC (http://www.nectec.or.th/).

Redistribution and use in source and binary form, with or without modification, are permitted when the copyright notice, license terms, and disclaimer are retained. Derived products must not be called “LEXiTRON”; NECTEC/NSTDA names may not be used to endorse derived products without permission.

LEXiTRON data is provided “AS IS” and “AS AVAILABLE”, without express or implied warranties. NECTEC and contributors are not liable for direct, indirect, incidental, special, exemplary, or consequential damages arising from its use.

- Dataset: https://opend.nstda.or.th/en/dataset/lexitron-2-0
- Original license text: https://github.com/veer66/Yaitron/blob/master/LICENSE-LEXITRON

## TUFS Asian Language Parallel Corpus (TALPCo)

Conversation pairs in `data/learning-bank.js` were selected and lightly normalized from the English and Thai portions of TALPCo. TALPCo is licensed under the Creative Commons Attribution 4.0 International license (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

- Corpus: https://github.com/matbahasa/TALPCo
- Nomoto, Hiroki, Kenji Okano, David Moeljadi and Hideo Sawada. 2018. “TUFS Asian Language Parallel Corpus (TALPCo).” Proceedings of the Twenty-Fourth Annual Meeting of the Association for Natural Language Processing, 436–439.
- Nomoto, Hiroki, Kenji Okano, Sunisa Wittayapanyanon and Junta Nomura. 2019. “Interpersonal meaning annotation for Asian language corpora: The case of TUFS Asian Language Parallel Corpus (TALPCo).” Proceedings of the Twenty-Fifth Annual Meeting of the Association for Natural Language Processing, 846–849.

Changes made for this project: removal of proper-name/culture-specific examples, selection of practical dialogue-like sentences, punctuation normalization, and conversion of Thai numerals to Arabic numerals for typing accessibility.

## CMU Pronouncing Dictionary / eng_to_ipa

The IPA pronunciation guides in `data/pronunciation-bank.js` and `data/exam-pronunciation-bank.js` were generated with `eng_to_ipa`, which uses the Carnegie Mellon University Pronouncing Dictionary (CMUdict).

- CMUdict: https://github.com/cmusphinx/cmudict
- eng_to_ipa: https://pypi.org/project/eng-to-ipa/

CMUdict is Copyright (C) 1993–2015 Carnegie Mellon University. Redistribution and use in source and binary forms, with or without modification, are permitted under its license conditions. The pronunciation data is provided without warranty.

## Academic Word List

The academic portion of `data/exam-bank.js` uses headwords and selected word-family members from Averil Coxhead's Academic Word List (AWL), originally developed from a 3.5-million-word academic corpus. The source vocabulary selection is used as a study aid; it is not an official TOEFL, IELTS, or KKU-AELT vocabulary list.

- Research record: https://ir.wgtn.ac.nz/items/8f852b22-3f82-427e-b0b3-8d9c954d8e61
- List rendering used by the build script: https://www.eapfoundation.com/vocab/academic/awllists/

## Iron-Man Mark 85 | Rigged

The interactive 3D character in `models/ironman/mark85.glb` is based on “Iron-Man Mark 85 | Rigged” by 9A Films / Nihar Arora and is used under the Creative Commons Attribution 4.0 International license (CC BY 4.0).

- Author: https://sketchfab.com/Nihar-9Afilms
- Original model: https://sketchfab.com/3d-models/iron-man-mark-85-rigged-dde1085c464d4f8da259fe6669ae4dd2
- License: https://creativecommons.org/licenses/by/4.0/
- Local attribution and modification record: `models/ironman/ATTRIBUTION.md`

Changes in the packaged model include resized embedded textures and mesh optimization. The rig is retained; this application adds its own lighting, holographic material treatment, and animated poses at runtime.

## The Amazing Spider Man 2 Rigged Model

The interactive 3D character in `models/spiderman/spiderman.glb` is “The Amazing Spider Man 2 Rigged Model” by Shitlock_Homeless and is used under the Creative Commons Attribution 4.0 International license (CC BY 4.0). The author, source, title, and license are embedded in the GLB metadata.

- Author: https://sketchfab.com/Shitlock_Homeless
- Original model: https://sketchfab.com/3d-models/the-amazing-spider-man-2-rigged-model-fd9385343d14477a979d0269b3015e1e
- License: https://creativecommons.org/licenses/by/4.0/
- Local attribution and modification record: `models/spiderman/ATTRIBUTION.md`

The geometry and textures are unchanged. This application normalizes the model’s scale and position, applies cinematic lighting, and drives the retained skeleton with original runtime poses.

## Three.js

The 3D character renderer uses Three.js and selected example modules under the MIT License. The complete license is included at `vendor/three/LICENSE`.

- Project: https://threejs.org/
- Source: https://github.com/mrdoob/three.js
