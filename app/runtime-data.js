'use strict';
window.MOOG_APP_DATA = {
  "dataVersion": 1,
  "specs": {
    "dfam": {
      "schemaVersion": 2,
      "id": "dfam",
      "name": "DFAM",
      "longName": "Drummer From Another Mother",
      "source": "docs/DFAM_Manual.pdf — patchbay pp.24-29, specifications p.40",
      "format": {
        "hp": 60,
        "widthIn": 12.57,
        "heightIn": 5.24,
        "depthIn": 4.21
      },
      "engine": {
        "sources": [
          "VCO 1",
          "VCO 2",
          "White Noise"
        ],
        "filter": "Selectable HP/LP 4-pole (-24dB/oct) ladder",
        "envelopes": [
          "VCO EG (decay only)",
          "VCF EG (decay only)",
          "VCA EG (decay + fast/slow attack)"
        ],
        "sequencer": {
          "steps": 8,
          "perStep": [
            "PITCH",
            "VELOCITY"
          ],
          "tempoBpm": [
            10,
            10000
          ]
        }
      },
      "internalSources": [
        {
          "id": "fm-1-to-2-amount-knob",
          "kind": "control",
          "desc": "1>2 FM AMOUNT knob"
        },
        {
          "id": "internal-vca-eg",
          "kind": "signal",
          "desc": "Internal VCA envelope CV"
        },
        {
          "id": "noise-ext-level-knob",
          "kind": "control",
          "desc": "NOISE / EXT LEVEL knob"
        },
        {
          "id": "noise-vcf-mod-source",
          "kind": "signal",
          "desc": "Noise acting as the VCF modulation source"
        },
        {
          "id": "sequencer-clock",
          "kind": "signal",
          "desc": "Internal sequencer clock"
        },
        {
          "id": "sequencer-pitch",
          "kind": "signal",
          "desc": "Sequencer PITCH 1-8 CV"
        },
        {
          "id": "sequencer-velocity-knobs",
          "kind": "control",
          "desc": "Sequencer VELOCITY 1-8 knobs"
        },
        {
          "id": "tempo-knob",
          "kind": "control",
          "desc": "TEMPO knob"
        },
        {
          "id": "vca-decay-knob",
          "kind": "control",
          "desc": "VCA DECAY knob"
        },
        {
          "id": "vcf-decay-knob",
          "kind": "control",
          "desc": "VCF DECAY knob"
        },
        {
          "id": "vco-1-eg-amount",
          "kind": "control",
          "desc": "VCO 1 EG AMOUNT knob"
        },
        {
          "id": "vco-1-frequency-knob",
          "kind": "control",
          "desc": "VCO 1 FREQUENCY knob"
        },
        {
          "id": "vco-decay-knob",
          "kind": "control",
          "desc": "VCO DECAY knob"
        },
        {
          "id": "white-noise-generator",
          "kind": "signal",
          "desc": "Internal white noise generator"
        }
      ],
      "patchbay": {
        "total": 24,
        "inputs": 15,
        "outputs": 9,
        "layout": {
          "cols": 3,
          "rows": 8,
          "note": "Manual describes jacks in physical order; 8 rows of 3."
        },
        "jacks": [
          {
            "id": "trigger-in",
            "row": 1,
            "col": 1,
            "name": "TRIGGER",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 10,
            "normalledFrom": "sequencer-clock",
            "desc": "Fires all three EGs at current step velocity without advancing the sequencer."
          },
          {
            "id": "vca-cv-in",
            "row": 1,
            "col": 2,
            "name": "VCA CV",
            "dir": "in",
            "signal": "cv",
            "range": [
              0,
              8
            ],
            "sumsWith": [
              "internal-vca-eg"
            ],
            "desc": "Summed with internal VCA EG; the VCA circuit can saturate when their sum is high."
          },
          {
            "id": "vca-out",
            "row": 1,
            "col": 3,
            "name": "VCA",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "desc": "Main audio output, post VOLUME knob."
          },
          {
            "id": "velocity-in",
            "row": 2,
            "col": 1,
            "name": "VELOCITY",
            "dir": "in",
            "signal": "cv",
            "range": [
              0,
              5
            ],
            "normalledFrom": "sequencer-velocity-knobs",
            "desc": "Sets the maximum amplitude of all three envelope generators."
          },
          {
            "id": "vca-decay-in",
            "row": 2,
            "col": 2,
            "name": "VCA DECAY",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vca-decay-knob"
            ],
            "desc": "Bipolar; centre the knob for full CV range."
          },
          {
            "id": "vca-eg-out",
            "row": 2,
            "col": 3,
            "name": "VCA EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              8
            ],
            "desc": "Copy of the internal VCA modulation CV."
          },
          {
            "id": "ext-audio-in",
            "row": 3,
            "col": 1,
            "name": "EXT AUDIO",
            "dir": "in",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "replaces": "white-noise-generator",
            "desc": "Unity gain, expects 10Vpp. Level set by NOISE / EXT LEVEL."
          },
          {
            "id": "vcf-decay-in",
            "row": 3,
            "col": 2,
            "name": "VCF DECAY",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vcf-decay-knob"
            ]
          },
          {
            "id": "vcf-eg-out",
            "row": 3,
            "col": 3,
            "name": "VCF EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              8
            ]
          },
          {
            "id": "noise-level-in",
            "row": 4,
            "col": 1,
            "name": "NOISE LEVEL",
            "dir": "in",
            "signal": "cv",
            "range": [
              0,
              8
            ],
            "sumsWith": [
              "noise-ext-level-knob"
            ]
          },
          {
            "id": "vco-decay-in",
            "row": 4,
            "col": 2,
            "name": "VCO DECAY",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vco-decay-knob"
            ]
          },
          {
            "id": "vco-eg-out",
            "row": 4,
            "col": 3,
            "name": "VCO EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              8
            ]
          },
          {
            "id": "vcf-mod-in",
            "row": 5,
            "col": 1,
            "name": "VCF MOD",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "replaces": "noise-vcf-mod-source",
            "desc": "Only direct CV path to filter cutoff. Depth set by NOISE / VCF MOD knob."
          },
          {
            "id": "vco-1-cv-in",
            "row": 5,
            "col": 2,
            "name": "VCO 1 CV",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct",
            "sumsWith": [
              "vco-1-frequency-knob",
              "vco-1-eg-amount",
              "sequencer-pitch"
            ]
          },
          {
            "id": "vco-1-out",
            "row": 5,
            "col": 3,
            "name": "VCO 1",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "fm-1-to-2-amount-in",
            "row": 6,
            "col": 1,
            "name": "1>2 FM AMT",
            "dir": "in",
            "signal": "cv",
            "range": [
              0,
              8
            ],
            "sumsWith": [
              "fm-1-to-2-amount-knob"
            ],
            "desc": "Depth of linear FM from VCO 1 into VCO 2."
          },
          {
            "id": "vco-2-cv-in",
            "row": 6,
            "col": 2,
            "name": "VCO 2 CV",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct"
          },
          {
            "id": "vco-2-out",
            "row": 6,
            "col": 3,
            "name": "VCO 2",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "tempo-in",
            "row": 7,
            "col": 1,
            "name": "TEMPO",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct on clock VCO",
            "sumsWith": [
              "tempo-knob"
            ],
            "desc": "Drives clock into audio rates."
          },
          {
            "id": "run-stop-in",
            "row": 7,
            "col": 2,
            "name": "RUN / STOP",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 10
          },
          {
            "id": "trigger-out",
            "row": 7,
            "col": 3,
            "name": "TRIGGER",
            "dir": "out",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "pulseMs": 1
          },
          {
            "id": "advance-clock-in",
            "row": 8,
            "col": 1,
            "name": "ADV / CLOCK",
            "dir": "in",
            "signal": "clock",
            "range": [
              0,
              5
            ],
            "tolerant": 10,
            "desc": "Rising edge advances one step; TEMPO knob ignored."
          },
          {
            "id": "velocity-out",
            "row": 8,
            "col": 2,
            "name": "VELOCITY",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              5
            ]
          },
          {
            "id": "pitch-out",
            "row": 8,
            "col": 3,
            "name": "PITCH",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ]
          }
        ]
      },
      "panel": {
        "note": "Control geometry is normalized to the cited Moog panel drawing.",
        "sections": [
          {
            "id": "vco",
            "label": "VCO",
            "controls": [
              {
                "id": "vco.vco-1-frequency",
                "name": "VCO 1 FREQUENCY",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.304,
                  "y": 0.19
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualOctaves": 10
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Both VCO knobs span ten octaves",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vco.vco-1-wave",
                "name": "VCO 1 WAVE",
                "type": "switch",
                "positions": [
                  "TRIANGLE",
                  "SQUARE"
                ],
                "panelPosition": {
                  "x": 0.37,
                  "y": 0.19
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "TRI",
                    "SQ"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco-2-frequency",
                "name": "VCO 2 FREQUENCY",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.304,
                  "y": 0.414
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualOctaves": 10
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Both VCO knobs span ten octaves",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vco.vco-2-wave",
                "name": "VCO 2 WAVE",
                "type": "switch",
                "positions": [
                  "TRIANGLE",
                  "SQUARE"
                ],
                "panelPosition": {
                  "x": 0.37,
                  "y": 0.414
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "TRI",
                    "SQ"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.hard-sync",
                "name": "HARD SYNC",
                "type": "switch",
                "positions": [
                  "OFF",
                  "ON"
                ],
                "desc": "VCO 1 is master, VCO 2 is synced.",
                "panelPosition": {
                  "x": 0.141,
                  "y": 0.414
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "OFF",
                    "ON"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.seq-pitch-mod",
                "name": "SEQ PITCH MOD",
                "type": "switch",
                "positions": [
                  "VCO 1&2",
                  "OFF",
                  "VCO 2"
                ],
                "panelPosition": {
                  "x": 0.141,
                  "y": 0.19
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "VCO 1&2",
                    "OFF",
                    "VCO 2"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco-decay",
                "name": "VCO DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.073,
                  "y": 0.19
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "VCO EG attack is fixed at 1ms (not a panel control); this knob sets decay only",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vco.vco-1-eg-amount",
                "name": "VCO 1 EG AMOUNT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.221,
                  "y": 0.19
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco-2-eg-amount",
                "name": "VCO 2 EG AMOUNT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.221,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco1-to-vco2-fm-amount",
                "name": "1>2 FM AMOUNT",
                "type": "knob",
                "desc": "Linear FM depth.",
                "panelPosition": {
                  "x": 0.073,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "mixer",
            "label": "MIXER",
            "controls": [
              {
                "id": "mixer.vco-1-level",
                "name": "VCO 1 LEVEL",
                "type": "knob",
                "panelPosition": {
                  "x": 0.432,
                  "y": 0.15
                },
                "panelSize": "small",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Low settings preserve headroom/dynamics; high settings clip aggressively. Square is perceived louder than triangle.",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.noise-ext-level",
                "name": "NOISE / EXT LEVEL",
                "type": "knob",
                "panelPosition": {
                  "x": 0.432,
                  "y": 0.302
                },
                "panelSize": "small",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Low settings preserve headroom/dynamics; high settings clip aggressively. Square is perceived louder than triangle.",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.vco-2-level",
                "name": "VCO 2 LEVEL",
                "type": "knob",
                "panelPosition": {
                  "x": 0.432,
                  "y": 0.452
                },
                "panelSize": "small",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Low settings preserve headroom/dynamics; high settings clip aggressively. Square is perceived louder than triangle.",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "vcf",
            "label": "VCF",
            "controls": [
              {
                "id": "vcf.cutoff",
                "name": "CUTOFF",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.569,
                  "y": 0.19
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualEndpoints": [
                    20,
                    20000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "LP self-oscillates ~3oclock; HP resonance scaling differs",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.resonance",
                "name": "RESONANCE",
                "type": "knob",
                "panelPosition": {
                  "x": 0.666,
                  "y": 0.19
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "LP/HP have different resonance behavior",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.vcf-mode",
                "name": "VCF MODE",
                "type": "switch",
                "positions": [
                  "LP",
                  "HP"
                ],
                "panelPosition": {
                  "x": 0.497,
                  "y": 0.19
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "LP",
                    "HP"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.vcf-decay",
                "name": "VCF DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.517,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms",
                  "manualRange": [
                    10,
                    10000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "VCF EG attack is fixed at 1ms (not a panel control); decay spans 10ms-10s",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.vcf-eg-amount",
                "name": "VCF EG AMOUNT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.608,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.noise-vcf-mod",
                "name": "NOISE / VCF MOD",
                "type": "knob",
                "panelPosition": {
                  "x": 0.701,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "vca",
            "label": "VCA",
            "controls": [
              {
                "id": "vca.vca-eg",
                "name": "VCA EG",
                "type": "switch",
                "positions": [
                  "FAST",
                  "SLOW"
                ],
                "desc": "Attack time.",
                "panelPosition": {
                  "x": 0.731,
                  "y": 0.19
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "FAST",
                    "SLOW"
                  ],
                  "times": [
                    1,
                    100
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "VCA attack: 1ms FAST or 100ms SLOW",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vca.vca-decay",
                "name": "VCA DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.803,
                  "y": 0.414
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vca.volume",
                "name": "VOLUME",
                "type": "knob",
                "panelPosition": {
                  "x": 0.803,
                  "y": 0.19
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "seq",
            "label": "SEQUENCER",
            "controls": [
              {
                "id": "seq.pitch-1-8",
                "name": "PITCH 1-8",
                "type": "knobArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.269,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[0]",
                    "index": 0,
                    "name": "PITCH 1",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.345,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[1]",
                    "index": 1,
                    "name": "PITCH 2",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.421,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[2]",
                    "index": 2,
                    "name": "PITCH 3",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.497,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[3]",
                    "index": 3,
                    "name": "PITCH 4",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.573,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[4]",
                    "index": 4,
                    "name": "PITCH 5",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.65,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[5]",
                    "index": 5,
                    "name": "PITCH 6",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.726,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[6]",
                    "index": 6,
                    "name": "PITCH 7",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.803,
                      "y": 0.654
                    },
                    "panelSize": "small",
                    "id": "seq.pitch[7]",
                    "index": 7,
                    "name": "PITCH 8",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        -5,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer PITCH knob spans roughly ten octaves (+/-5V)",
                        "confidence": "high"
                      }
                    ]
                  }
                ]
              },
              {
                "id": "seq.velocity-1-8",
                "name": "VELOCITY 1-8",
                "type": "knobArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.269,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[0]",
                    "index": 0,
                    "name": "VELOCITY 1",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.345,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[1]",
                    "index": 1,
                    "name": "VELOCITY 2",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.421,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[2]",
                    "index": 2,
                    "name": "VELOCITY 3",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.497,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[3]",
                    "index": 3,
                    "name": "VELOCITY 4",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.573,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[4]",
                    "index": 4,
                    "name": "VELOCITY 5",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.65,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[5]",
                    "index": 5,
                    "name": "VELOCITY 6",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.726,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[6]",
                    "index": 6,
                    "name": "VELOCITY 7",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  },
                  {
                    "panelPosition": {
                      "x": 0.803,
                      "y": 0.831
                    },
                    "panelSize": "small",
                    "id": "seq.velocity[7]",
                    "index": 7,
                    "name": "VELOCITY 8",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "V",
                      "manualRange": [
                        0,
                        5
                      ]
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate",
                    "evidence": [
                      {
                        "page": "PDF p. 22",
                        "status": "manual",
                        "source": "DFAM_Manual.pdf",
                        "claim": "Each sequencer VELOCITY knob spans 0V to 5V",
                        "confidence": "high"
                      }
                    ]
                  }
                ]
              },
              {
                "id": "seq.tempo",
                "name": "TEMPO",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.161,
                  "y": 0.675
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "bpm",
                  "manualRange": [
                    10,
                    10000
                  ],
                  "clockRangeHz": [
                    0.7,
                    700
                  ],
                  "stepsPerQuarterNote": 4,
                  "manualNotes": "Live BPM is derived from the 0.7-700Hz clock. Moog rounds this to roughly 10-10,000 BPM when each step is a sixteenth note."
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 16, 18–20, 23–29",
                    "status": "manual",
                    "source": "DFAM_Manual.pdf",
                    "claim": "Tempo spans 0.7-700Hz, roughly 10-10,000 BPM for sixteenth-note steps, with 1V/oct CV",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "seq.run-stop",
                "name": "RUN / STOP",
                "type": "button",
                "panelPosition": {
                  "x": 0.132,
                  "y": 0.831
                },
                "panelSize": "pad",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.advance",
                "name": "ADVANCE",
                "type": "button",
                "panelPosition": {
                  "x": 0.192,
                  "y": 0.831
                },
                "panelSize": "pad",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.trigger",
                "name": "TRIGGER",
                "type": "button",
                "panelPosition": {
                  "x": 0.073,
                  "y": 0.675
                },
                "panelSize": "pad",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              }
            ]
          }
        ],
        "layout": {
          "source": {
            "file": "DFAM_Preset_Template.pdf",
            "page": 1,
            "renderDpi": 300,
            "cropPx": [
              164,
              236,
              2339,
              1160
            ]
          },
          "physical": {
            "eurorackHp": 60,
            "widthMm": 304.8,
            "heightMm": 128.5,
            "moduleDepthMm": 26,
            "outerCaseMm": {
              "width": 319.28,
              "height": 106.93,
              "depth": 133.1
            }
          },
          "aspectRatio": 2.3719844357976654,
          "patchbay": {
            "x": 0.848,
            "y": 0.075,
            "width": 0.132,
            "height": 0.79
          },
          "sectionLabels": {
            "vco": {
              "x": 0.045,
              "y": 0.035
            },
            "mixer": {
              "x": 0.385,
              "y": 0.035
            },
            "vcf": {
              "x": 0.49,
              "y": 0.035
            },
            "vca": {
              "x": 0.72,
              "y": 0.035
            },
            "seq": {
              "x": 0.22,
              "y": 0.535
            }
          }
        }
      }
    },
    "mother32": {
      "schemaVersion": 2,
      "id": "mother32",
      "name": "MOTHER-32",
      "longName": "Semi-Modular Analog Synthesizer",
      "source": "docs/Mother_32_Users_Manual.pdf — patchbay pp.47-57, performance functions p.29, specifications p.70; docs/Mother_32_Firmware_Update_V2.0.pdf — v2 sequencer, tempo modes, clock divisions, save modes",
      "firmware": "v2.0 (April 2020) assumed — it changes defaults and adds features. v1 behaviour differs; see notes.",
      "format": {
        "hp": 60,
        "widthIn": 12.57,
        "heightIn": 5.24,
        "depthIn": 4.21
      },
      "engine": {
        "polyphony": "monophonic",
        "keys": "13 momentary pads",
        "sources": [
          "VCO",
          "Noise",
          "External Audio"
        ],
        "filter": "Switchable LP/HP 4-pole (-24dB/oct) Moog ladder",
        "envelopes": [
          "EG (Attack, Decay, switchable Sustain) → VCF and/or VCA"
        ],
        "lfo": "Triangle / Square, audio-rate capable",
        "sequencer": {
          "steps": 32,
          "patterns": "8 banks x 8 patterns = 64",
          "tempoBpm": [
            20,
            300
          ],
          "clock": [
            "internal",
            "external analog",
            "MIDI"
          ],
          "playbackDirection": [
            "forward",
            "reverse",
            "pendulum",
            "random"
          ],
          "playbackDirectionNote": "v2.0 addition. v1 is forward only.",
          "clockDivisions": {
            "count": 24,
            "groups": [
              "dotted",
              "triplet",
              "straight"
            ],
            "values": [
              "2 whole",
              "whole",
              "half",
              "quarter",
              "eighth",
              "sixteenth",
              "thirty-second",
              "sixty-fourth"
            ],
            "note": "v2.0 raised this from 8 divisions to 24."
          },
          "swing": {
            "amount": "SHIFT + TEMPO knob; 50% = no swing",
            "interval": "v2.0 addition — swing interval can differ from the step interval, using the same 24 note values. Stored per pattern."
          },
          "ratchet": {
            "perStep": [
              1,
              4
            ],
            "live": "SHIFT + GLIDE knob"
          },
          "saveModes": [
            "manual",
            "auto",
            "write-protect"
          ],
          "saveModesNote": "auto and write-protect are v2.0 additions. Write-protect is the live-performance mode — patterns can be mangled without touching stored memory."
        },
        "performanceFunctions": {
          "note": "Manual p.29. These are base firmware, NOT v2 additions. None are stored in memory. Pattern rotation is separate: the current manual documents it as a Step-mode edit function on printed p.44 (PDF p.45), not as one of these four live performance functions.",
          "items": [
            {
              "name": "Live Accent",
              "how": "SHIFT + ACCENT held during playback",
              "desc": "Accents every step, overriding stored accent data."
            },
            {
              "name": "Live Mute",
              "how": "SHIFT + REST held during playback",
              "desc": "Mutes output while the sequencer keeps advancing."
            },
            {
              "name": "Live Ratchet",
              "how": "SHIFT + rotate GLIDE",
              "desc": "1-4 ratchets per step, overriding stored ratchet data."
            },
            {
              "name": "Live Pattern Transpose",
              "how": "KB / STEP arrows to pick an octave, then the keyboard",
              "desc": "Transposes the running pattern. Default octave 4, reference note low C."
            }
          ],
          "stepModeRotation": {
            "how": "In Step mode, press the right STEP arrow to rotate every step right once or the left KB arrow to rotate every step left once.",
            "desc": "Moves all stored pattern steps one location left or right.",
            "source": "Mother_32_Users_Manual.pdf, printed p.44 (PDF p.45)"
          }
        },
        "utilities": [
          "2-in voltage-controlled mixer",
          "1-to-2 mult",
          "assignable output"
        ]
      },
      "internalSources": [
        {
          "id": "+5v-reference",
          "kind": "reference",
          "desc": "+5V reference normalled to MIX 2"
        },
        {
          "id": "+5v-reference-to-mix-2",
          "kind": "normal",
          "desc": "+5V reference into MIX 2"
        },
        {
          "id": "0v-reference",
          "kind": "reference",
          "desc": "0V reference normalled to MIX 1"
        },
        {
          "id": "0v-reference-to-mix-1",
          "kind": "normal",
          "desc": "0V reference into MIX 1"
        },
        {
          "id": "cutoff-knob",
          "kind": "control",
          "desc": "CUTOFF knob"
        },
        {
          "id": "eg-out-to-vco-mod-source-selector-up",
          "kind": "normal",
          "desc": "EG into the upper VCO MOD SOURCE position"
        },
        {
          "id": "keyboard-cv",
          "kind": "signal",
          "desc": "Keyboard / sequencer 1V/oct pitch CV"
        },
        {
          "id": "lfo-rate-knob",
          "kind": "control",
          "desc": "LFO RATE knob"
        },
        {
          "id": "mix-knob",
          "kind": "control",
          "desc": "MIX knob"
        },
        {
          "id": "resonance-knob",
          "kind": "control",
          "desc": "RESONANCE knob"
        },
        {
          "id": "vc-mix-knob",
          "kind": "control",
          "desc": "VC MIX panel control"
        },
        {
          "id": "vca-mode-source",
          "kind": "signal",
          "desc": "Source selected by the VCA MODE switch"
        },
        {
          "id": "vcf-modulation-signal",
          "kind": "signal",
          "desc": "Summed VCF modulation"
        },
        {
          "id": "vco-frequency-knob",
          "kind": "control",
          "desc": "VCO FREQUENCY knob"
        },
        {
          "id": "vco-frequency-modulation",
          "kind": "signal",
          "desc": "Summed VCO frequency modulation"
        },
        {
          "id": "vco-mod-source-selector-up",
          "kind": "condition",
          "desc": "VCO MOD SOURCE switch in its upper (EG) position"
        },
        {
          "id": "white-noise-at-main-mixer",
          "kind": "signal",
          "desc": "Noise normalled to the clockwise end of MIX"
        }
      ],
      "patchbay": {
        "total": 32,
        "inputs": 18,
        "outputs": 14,
        "layout": {
          "cols": 4,
          "rows": 8,
          "note": "Physical panel layout: eight rows of four jacks. Order below is row-major."
        },
        "jacks": [
          {
            "id": "ext-audio-in",
            "row": 1,
            "col": 1,
            "name": "EXT AUDIO",
            "dir": "in",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "replaces": "white-noise-at-main-mixer",
            "desc": "Unity-gain 10Vpp external audio input. Patching it replaces the white-noise normal at the clockwise side of the main mixer."
          },
          {
            "id": "mix-cv-in",
            "row": 1,
            "col": 2,
            "name": "MIX CV",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "mix-knob"
            ],
            "desc": "Crossfades the selected VCO waveform against noise or external audio."
          },
          {
            "id": "vca-cv-in",
            "row": 1,
            "col": 3,
            "name": "VCA CV",
            "dir": "in",
            "signal": "cv",
            "range": null,
            "rangeNote": "Mode-dependent; see rangeByMode.",
            "rangeByMode": {
              "EG": [
                0,
                8
              ],
              "ON": [
                -5,
                5
              ]
            },
            "sumsWith": [
              "vca-mode-source"
            ],
            "desc": "Voltage control over the output VCA; accepted range depends on VCA MODE."
          },
          {
            "id": "vca-out",
            "row": 1,
            "col": 4,
            "name": "VCA",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "rangeNote": "Typical",
            "desc": "Main audio output after the VOLUME attenuator."
          },
          {
            "id": "noise-out",
            "row": 2,
            "col": 1,
            "name": "NOISE",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "rangeNote": "Typical",
            "desc": "White-noise generator output."
          },
          {
            "id": "vcf-cutoff-in",
            "row": 2,
            "col": 2,
            "name": "VCF CUTOFF",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "cutoff-knob",
              "vcf-modulation-signal"
            ]
          },
          {
            "id": "vcf-res-in",
            "row": 2,
            "col": 3,
            "name": "VCF RES",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "resonance-knob"
            ]
          },
          {
            "id": "vcf-out",
            "row": 2,
            "col": 4,
            "name": "VCF",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "rangeNote": "Approximate maximum",
            "desc": "Filter output before the VCA."
          },
          {
            "id": "vco-1v-oct-in",
            "row": 3,
            "col": 1,
            "name": "VCO 1V/OCT",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct",
            "sumsWith": [
              "vco-frequency-knob",
              "keyboard-cv",
              "vco-frequency-modulation"
            ],
            "desc": "Exponential frequency input. It sums with internal pitch sources; patching it does not break keyboard or sequencer pitch."
          },
          {
            "id": "vco-lin-fm-in",
            "row": 3,
            "col": 2,
            "name": "VCO LIN FM",
            "dir": "in",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "desc": "Linear frequency-modulation input. The manual does not specify through-zero behavior."
          },
          {
            "id": "vco-mod-in",
            "row": 3,
            "col": 3,
            "name": "VCO MOD",
            "dir": "in",
            "signal": "cv",
            "range": null,
            "rangeNote": "The manual does not publish a separate voltage range for this jack.",
            "normalledFrom": "eg-out",
            "normalCondition": "vco-mod-source-selector-up",
            "breaksNormal": "eg-out-to-vco-mod-source-selector-up",
            "desc": "Overrides the EG normal at the upper EG/VCO MOD selector position. The lower LFO position remains available."
          },
          {
            "id": "vco-saw-out",
            "row": 3,
            "col": 4,
            "name": "VCO SAW",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vco-pulse-out",
            "row": 4,
            "col": 1,
            "name": "VCO PULSE",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "desc": "Width set by the PULSE WIDTH knob."
          },
          {
            "id": "lfo-rate-in",
            "row": 4,
            "col": 2,
            "name": "LFO RATE",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "lfo-rate-knob"
            ]
          },
          {
            "id": "lfo-square-out",
            "row": 4,
            "col": 3,
            "name": "LFO SQ",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "lfo-triangle-out",
            "row": 4,
            "col": 4,
            "name": "LFO TRI",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "mix-1-in",
            "row": 5,
            "col": 1,
            "name": "MIX 1",
            "dir": "in",
            "signal": "any",
            "range": [
              -5,
              5
            ],
            "normalledFrom": "0v-reference",
            "breaksNormal": "0v-reference-to-mix-1",
            "desc": "DC-coupled VC mixer channel 1, normalled to 0V."
          },
          {
            "id": "mix-2-in",
            "row": 5,
            "col": 2,
            "name": "MIX 2",
            "dir": "in",
            "signal": "any",
            "range": [
              -5,
              5
            ],
            "normalledFrom": "+5v-reference",
            "breaksNormal": "+5v-reference-to-mix-2",
            "desc": "DC-coupled VC mixer channel 2, normalled to nominal +5V."
          },
          {
            "id": "vc-mix-ctrl-in",
            "row": 5,
            "col": 3,
            "name": "VC MIX CTRL",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vc-mix-knob"
            ],
            "desc": "Crossfades MIX 1 against MIX 2."
          },
          {
            "id": "vc-mix-out",
            "row": 5,
            "col": 4,
            "name": "VC MIX",
            "dir": "out",
            "signal": "any",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "mult-in",
            "row": 6,
            "col": 1,
            "name": "MULT",
            "dir": "in",
            "signal": "any",
            "range": null,
            "rangeNote": "No separate range is published; this is a buffered signal splitter.",
            "desc": "Buffered 1-to-2 splitter input."
          },
          {
            "id": "mult-1-out",
            "row": 6,
            "col": 2,
            "name": "MULT 1",
            "dir": "out",
            "signal": "any",
            "range": null,
            "rangeNote": "Buffered copy of MULT input."
          },
          {
            "id": "mult-2-out",
            "row": 6,
            "col": 3,
            "name": "MULT 2",
            "dir": "out",
            "signal": "any",
            "range": null,
            "rangeNote": "Buffered copy of MULT input."
          },
          {
            "id": "assign-out",
            "row": 6,
            "col": 4,
            "name": "ASSIGN",
            "dir": "out",
            "signal": "any",
            "range": [
              -5,
              5
            ],
            "desc": "Source chosen in Setup Mode page 1. Default since v2.0 is Sequencer Clock — which is what makes the documented M-32 -> DFAM / Subharmonicon sync patches work out of the box. On v1 the default is not a clock, the usual reason that patch appears dead.",
            "sources": [
              "Accent",
              "Sequencer Clock (default)",
              "Sequencer Clock / 2",
              "Sequencer Clock / 4",
              "Sequencer Step Ramp",
              "Sequencer Step Saw",
              "Sequencer Step Triangle",
              "Sequencer Step Random",
              "Sequencer Step 1 Trigger",
              "MIDI Velocity",
              "MIDI Channel Pressure",
              "MIDI Pitch Bend",
              "MIDI CC 1",
              "MIDI CC 2",
              "MIDI CC 4",
              "MIDI CC 7"
            ]
          },
          {
            "id": "gate-in",
            "row": 7,
            "col": 1,
            "name": "GATE",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 10,
            "desc": "Fires the envelope generator."
          },
          {
            "id": "eg-out",
            "row": 7,
            "col": 2,
            "name": "EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              7.5
            ]
          },
          {
            "id": "kb-out",
            "row": 7,
            "col": 3,
            "name": "KB",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct",
            "desc": "Keyboard, sequencer, and MIDI pitch CV, including glide and pitch bend."
          },
          {
            "id": "gate-out",
            "row": 7,
            "col": 4,
            "name": "GATE",
            "dir": "out",
            "signal": "gate",
            "range": [
              0,
              5
            ]
          },
          {
            "id": "tempo-in",
            "row": 8,
            "col": 1,
            "name": "TEMPO",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "rangeNote": "-5..+5V default; 0..+5V selectable on Setup page 8 option 5.",
            "desc": "Four modes, set on Setup page 3. Behaviour differs completely between them, so implement the mode selector rather than one fixed behaviour.",
            "modes": [
              {
                "n": 1,
                "name": "Tempo CV",
                "desc": "Summed with the TEMPO knob. Knob centred, -5..+5V sweeps 20-300 BPM."
              },
              {
                "n": 2,
                "name": "Single Clock Advance",
                "default": true,
                "desc": "Rising edge advances one step; internal clock suppressed and TEMPO knob ignored. Edge must exceed 1V/msec or it is ignored."
              },
              {
                "n": 3,
                "name": "Analog Clock",
                "desc": "Syncs to any regular analog clock. Time base set by Clock Input PPQN, Setup page 4. Was fixed at 24 PPQN 'DIN Sync' before v2.0."
              },
              {
                "n": 4,
                "name": "Step Address CV",
                "desc": "Voltage selects the step directly."
              }
            ],
            "clockPriority": "internal < MIDI clock < analog clock"
          },
          {
            "id": "run-stop-in",
            "row": 8,
            "col": 2,
            "name": "RUN/STOP",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 15,
            "triggerThreshold": 3.2
          },
          {
            "id": "reset-in",
            "row": 8,
            "col": 3,
            "name": "RESET",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 15,
            "triggerThreshold": 3.2
          },
          {
            "id": "hold-in",
            "row": 8,
            "col": 4,
            "name": "HOLD",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "tolerant": 15,
            "triggerThreshold": 3.2
          }
        ]
      },
      "panel": {
        "note": "Control geometry is normalized to the cited Moog panel drawing.",
        "sections": [
          {
            "id": "vco",
            "label": "VCO",
            "controls": [
              {
                "id": "vco.frequency",
                "name": "FREQUENCY",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.091,
                  "y": 0.153
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "octaves",
                  "manualEndpoints": [
                    -1,
                    1
                  ],
                  "manualNotes": "Relative to center; the analog control is calibrated to slightly more than +/-1 octave."
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "smoothing": {
                  "kind": "profile-owned",
                  "status": "measurement-needed"
                },
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "VCO FREQUENCY tunes slightly more than +/-1 octave around center",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vco.vco-wave",
                "name": "VCO WAVE",
                "type": "switch",
                "positions": [
                  "PULSE",
                  "SAW"
                ],
                "panelPosition": {
                  "x": 0.183,
                  "y": 0.153
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "PULSE",
                    "SAW"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.pulse-width",
                "name": "PULSE WIDTH",
                "type": "knob",
                "panelPosition": {
                  "x": 0.275,
                  "y": 0.153
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "percent",
                  "manualRange": [
                    2,
                    98
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "PWM range 2-98%, modulation can reach 0-100%",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vco.vco-mod-source",
                "name": "VCO MOD SOURCE",
                "type": "switch",
                "positions": [
                  "LFO",
                  "EG"
                ],
                "panelPosition": {
                  "x": 0.183,
                  "y": 0.367
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "LFO",
                    "EG"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco-mod-amount",
                "name": "VCO MOD AMOUNT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.275,
                  "y": 0.367
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "normalized",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vco.vco-mod-destination",
                "name": "VCO MOD DESTINATION",
                "type": "switch",
                "positions": [
                  "PWM",
                  "FREQ"
                ],
                "panelPosition": {
                  "x": 0.368,
                  "y": 0.367
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "PWM",
                    "FREQ"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "lfo",
            "label": "LFO",
            "controls": [
              {
                "id": "lfo.lfo-rate",
                "name": "LFO RATE",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.275,
                  "y": 0.591
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualRange": [
                    0.1,
                    350
                  ],
                  "externalRangeHz": 600
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "LFO rate 0.1-350Hz, external CV extends to ~600Hz",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "lfo.lfo-wave",
                "name": "LFO WAVE",
                "type": "switch",
                "positions": [
                  "SQUARE",
                  "TRIANGLE"
                ],
                "panelPosition": {
                  "x": 0.368,
                  "y": 0.591
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "SQUARE",
                    "TRIANGLE"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "mixer",
            "label": "MIXER",
            "controls": [
              {
                "id": "mixer.mix",
                "name": "MIX",
                "type": "knob",
                "desc": "VCO against noise / external.",
                "panelPosition": {
                  "x": 0.368,
                  "y": 0.153
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "crossfade",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "modulation": {
                  "inputs": [
                    "mix-jack"
                  ],
                  "combine": "sum-in-control-domain"
                },
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "AC-coupled voltage-controlled crossfade VCO/noise. External input expects 10Vpp at unity",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "vcf",
            "label": "VCF",
            "controls": [
              {
                "id": "vcf.cutoff",
                "name": "CUTOFF",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.48,
                  "y": 0.153
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualEndpoints": [
                    20,
                    20000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "Cutoff 20Hz-20kHz",
                    "confidence": "high"
                  },
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "LP resonant/self-oscillates ~3oclock",
                    "confidence": "high"
                  },
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "HP is non-resonant; resonance restores LF content",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.resonance",
                "name": "RESONANCE",
                "type": "knob",
                "panelPosition": {
                  "x": 0.593,
                  "y": 0.153
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "normalized",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "LP/HP have different resonance behavior",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.vcf-mode",
                "name": "VCF MODE",
                "type": "switch",
                "positions": [
                  "LP",
                  "HP"
                ],
                "panelPosition": {
                  "x": 0.46,
                  "y": 0.367
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "LP",
                    "HP"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "LP resonant, HP non-resonant",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.vcf-mod-source",
                "name": "VCF MOD SOURCE",
                "type": "switch",
                "positions": [
                  "LFO",
                  "EG"
                ],
                "panelPosition": {
                  "x": 0.554,
                  "y": 0.367
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "LFO",
                    "EG"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.vcf-mod-amount",
                "name": "VCF MOD AMOUNT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.647,
                  "y": 0.367
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "normalized",
                  "range": [
                    -1,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.vcf-mod-polarity",
                "name": "VCF MOD POLARITY",
                "type": "switch",
                "positions": [
                  "+",
                  "-"
                ],
                "panelPosition": {
                  "x": 0.738,
                  "y": 0.367
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "+",
                    "-"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "eg",
            "label": "EG",
            "controls": [
              {
                "id": "eg.attack",
                "name": "ATTACK",
                "type": "knob",
                "panelPosition": {
                  "x": 0.46,
                  "y": 0.591
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "ms",
                  "manufacturerReported": [
                    1.25,
                    3000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "section": "Mother-32 review — envelope specifications",
                    "status": "manufacturer-reported",
                    "source": "Sound On Sound review",
                    "claim": "Attack 1.25-3000ms",
                    "confidence": "medium"
                  }
                ]
              },
              {
                "id": "eg.decay",
                "name": "DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.647,
                  "y": 0.591
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms",
                  "manufacturerReported": [
                    1.25,
                    7000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "section": "Mother-32 review — envelope specifications",
                    "status": "manufacturer-reported",
                    "source": "Sound On Sound review",
                    "claim": "Decay/release 1.25-7000ms",
                    "confidence": "medium"
                  }
                ]
              },
              {
                "id": "eg.sustain",
                "name": "SUSTAIN",
                "type": "switch",
                "positions": [
                  "OFF",
                  "ON"
                ],
                "panelPosition": {
                  "x": 0.554,
                  "y": 0.591
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "OFF",
                    "ON"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "Sustain OFF: A/D retrigger on new note. Sustain ON: A/S/R, no retrigger",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "eg.vca-mode",
                "name": "VCA MODE",
                "type": "switch",
                "positions": [
                  "EG",
                  "ON"
                ],
                "panelPosition": {
                  "x": 0.669,
                  "y": 0.153
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "EG",
                    "ON"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "VCA CV 0-8V EG mode or ±5V ON mode",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "out",
            "label": "OUTPUT",
            "controls": [
              {
                "id": "out.volume",
                "name": "VOLUME",
                "type": "knob",
                "panelPosition": {
                  "x": 0.738,
                  "y": 0.153
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 12–18, 47–54, 63",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "VOLUME attenuates patch and rear outputs",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "kb",
            "label": "KEYBOARD",
            "controls": [
              {
                "id": "kb.glide",
                "name": "GLIDE",
                "type": "knob",
                "panelPosition": {
                  "x": 0.091,
                  "y": 0.367
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "ms",
                  "manualNotes": "Glide smooths keyboard and sequencer pitch, including KB OUT. Sequencer glide is enabled per step; its rate is set by this knob."
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 18, 27, 54",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "GLIDE controls note transitions and KB OUT; sequencer glide on/off is per step while its rate is global",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "kb.pads",
                "name": "PADS",
                "type": "padArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.302,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "1",
                    "id": "kb.pad[0]",
                    "index": 0,
                    "name": "KEYBOARD PAD 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.328,
                      "y": 0.79
                    },
                    "panelSize": "upper-pad",
                    "panelLegend": "1–8",
                    "id": "kb.pad[1]",
                    "index": 1,
                    "name": "KEYBOARD PAD 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.354,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "2",
                    "id": "kb.pad[2]",
                    "index": 2,
                    "name": "KEYBOARD PAD 3",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.38,
                      "y": 0.79
                    },
                    "panelSize": "upper-pad",
                    "panelLegend": "9–16",
                    "id": "kb.pad[3]",
                    "index": 3,
                    "name": "KEYBOARD PAD 4",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.406,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "3",
                    "id": "kb.pad[4]",
                    "index": 4,
                    "name": "KEYBOARD PAD 5",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.458,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "4",
                    "id": "kb.pad[5]",
                    "index": 5,
                    "name": "KEYBOARD PAD 6",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.484,
                      "y": 0.79
                    },
                    "panelSize": "upper-pad",
                    "panelLegend": "17–24",
                    "id": "kb.pad[6]",
                    "index": 6,
                    "name": "KEYBOARD PAD 7",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.51,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "5",
                    "id": "kb.pad[7]",
                    "index": 7,
                    "name": "KEYBOARD PAD 8",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.536,
                      "y": 0.79
                    },
                    "panelSize": "upper-pad",
                    "panelLegend": "25–32",
                    "id": "kb.pad[8]",
                    "index": 8,
                    "name": "KEYBOARD PAD 9",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.562,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "6",
                    "id": "kb.pad[9]",
                    "index": 9,
                    "name": "KEYBOARD PAD 10",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.588,
                      "y": 0.79
                    },
                    "panelSize": "upper-pad",
                    "panelLegend": "SET END",
                    "id": "kb.pad[10]",
                    "index": 10,
                    "name": "KEYBOARD PAD 11",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.614,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "7",
                    "id": "kb.pad[11]",
                    "index": 11,
                    "name": "KEYBOARD PAD 12",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.666,
                      "y": 0.845
                    },
                    "panelSize": "lower-pad",
                    "panelLegend": "8",
                    "id": "kb.pad[12]",
                    "index": 12,
                    "name": "KEYBOARD PAD 13",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "gate",
                      "range": [
                        0,
                        1
                      ]
                    },
                    "mapping": {
                      "kind": "event"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              }
            ]
          },
          {
            "id": "util",
            "label": "VC MIX",
            "controls": [
              {
                "id": "util.vc-mix",
                "name": "VC MIX",
                "type": "knob",
                "panelPosition": {
                  "x": 0.738,
                  "y": 0.591
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ratio",
                  "manualEndpoints": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 10, 22, 51-52",
                    "status": "manual",
                    "source": "Mother_32_Users_Manual.pdf",
                    "claim": "VC MIX crossfades DC-coupled MIX 1 and MIX 2; VC MIX CTRL sums with the knob position",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "seq",
            "label": "SEQUENCER",
            "controls": [
              {
                "id": "seq.tempo-gate-length",
                "name": "TEMPO / GATE LENGTH",
                "type": "knob",
                "panelPosition": {
                  "x": 0.15,
                  "y": 0.591
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "bpm",
                  "manualEndpoints": [
                    20,
                    300
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "page": "PDF pp. 4–5",
                    "status": "manual",
                    "source": "Mother_32_Firmware_Update_V2.0.pdf",
                    "claim": "Tempo 20-300 BPM",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "seq.pattern-bank",
                "name": "PATTERN (BANK)",
                "type": "button",
                "panelPosition": {
                  "x": 0.244,
                  "y": 0.74
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.run-stop-rec",
                "name": "RUN/STOP (REC)",
                "type": "button",
                "panelPosition": {
                  "x": 0.244,
                  "y": 0.83
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.reset-accent",
                "name": "RESET/ACCENT",
                "type": "button",
                "panelPosition": {
                  "x": 0.148,
                  "y": 0.83
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.hold-rest",
                "name": "HOLD/REST",
                "type": "button",
                "panelPosition": {
                  "x": 0.148,
                  "y": 0.74
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "seq.swing",
                "name": "SWING",
                "type": "button",
                "panelPosition": {
                  "x": 0.195,
                  "y": 0.74
                },
                "panelSize": "indicator",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              }
            ]
          }
        ],
        "layout": {
          "source": {
            "file": "Mother_32_Patch_Sheet.pdf",
            "page": 1,
            "renderDpi": 300,
            "cropPx": [
              354,
              301,
              2296,
              1124
            ]
          },
          "physical": {
            "eurorackHp": 60,
            "widthMm": 304.8,
            "heightMm": 128.5,
            "moduleDepthMm": 26,
            "outerCaseMm": {
              "width": 319.28,
              "height": 106.93,
              "depth": 133.1
            }
          },
          "aspectRatio": 2.3719844357976654,
          "patchbay": {
            "x": 0.797,
            "y": 0.073,
            "width": 0.181,
            "height": 0.82
          },
          "sectionLabels": {
            "vco": {
              "x": 0.045,
              "y": 0.028
            },
            "lfo": {
              "x": 0.23,
              "y": 0.47
            },
            "mixer": {
              "x": 0.34,
              "y": 0.028
            },
            "vcf": {
              "x": 0.43,
              "y": 0.028
            },
            "eg": {
              "x": 0.43,
              "y": 0.47
            },
            "out": {
              "x": 0.7,
              "y": 0.028
            },
            "kb": {
              "x": 0.195,
              "y": 0.7
            },
            "util": {
              "x": 0.69,
              "y": 0.47
            },
            "seq": {
              "x": 0.1,
              "y": 0.47
            }
          }
        }
      }
    },
    "subharmonicon": {
      "schemaVersion": 2,
      "id": "subharmonicon",
      "name": "SUBHARMONICON",
      "longName": "Semi-Modular Analog Polyrhythmic Synthesizer",
      "source": "docs/Subharmonicon_Manual AMZ.pdf — patchbay pp.30-37, specifications p.58",
      "format": {
        "hp": 60,
        "widthIn": 12.57,
        "heightIn": 5.24,
        "depthIn": 4.21
      },
      "engine": {
        "sources": [
          "VCO 1 + SUB 1 + SUB 2",
          "VCO 2 + SUB 1 + SUB 2"
        ],
        "subharmonics": "Each VCO drives two dividers; division ratio 1-16 per sub",
        "filter": "Self-oscillating ladder, low-pass only, 4-pole (-24dB/oct)",
        "envelopes": [
          "VCA EG (Attack, Decay)",
          "VCF EG (Attack, Decay)"
        ],
        "sequencers": {
          "count": 2,
          "steps": 4,
          "quantize": "selectable"
        },
        "rhythmGenerators": {
          "count": 4,
          "divide": [
            1,
            16
          ],
          "desc": "Each divides the master tempo by an integer; any combination can clock either sequencer."
        },
        "tempoBpm": [
          20,
          3000
        ]
      },
      "internalSources": [
        {
          "id": "cutoff-knob",
          "kind": "control",
          "desc": "CUTOFF knob"
        },
        {
          "id": "rhythm-1-knob",
          "kind": "control",
          "desc": "RHYTHM 1 divisor knob"
        },
        {
          "id": "rhythm-2-knob",
          "kind": "control",
          "desc": "RHYTHM 2 divisor knob"
        },
        {
          "id": "rhythm-3-knob",
          "kind": "control",
          "desc": "RHYTHM 3 divisor knob"
        },
        {
          "id": "rhythm-4-knob",
          "kind": "control",
          "desc": "RHYTHM 4 divisor knob"
        },
        {
          "id": "sequencer-1-steps",
          "kind": "signal",
          "desc": "Sequencer 1 step CV"
        },
        {
          "id": "sequencer-2-steps",
          "kind": "signal",
          "desc": "Sequencer 2 step CV"
        },
        {
          "id": "vca-eg",
          "kind": "signal",
          "desc": "VCA envelope CV"
        },
        {
          "id": "vcf-eg",
          "kind": "signal",
          "desc": "VCF envelope CV"
        },
        {
          "id": "vco-1-frequency-knob",
          "kind": "control",
          "desc": "VCO 1 FREQUENCY knob"
        },
        {
          "id": "vco-1-in-to-vco-2-in",
          "kind": "normal",
          "desc": "VCO 1 pitch CV carried onward to VCO 2"
        },
        {
          "id": "vco-1-sub-1-saw",
          "kind": "signal",
          "desc": "VCO 1 SUB 1 sawtooth, internal PWM source"
        },
        {
          "id": "vco-1-sub-1-saw-to-vco-1-pwm",
          "kind": "normal",
          "desc": "SUB 1 saw into VCO 1 PWM"
        },
        {
          "id": "vco-1-sub-frequency-knobs",
          "kind": "control",
          "desc": "SUB 1 / SUB 2 FREQ knobs for VCO 1"
        },
        {
          "id": "vco-1-waveform-middle",
          "kind": "condition",
          "desc": "VCO 1 WAVEFORM switch in its middle (PWM) position"
        },
        {
          "id": "vco-2-frequency-knob",
          "kind": "control",
          "desc": "VCO 2 FREQUENCY knob"
        },
        {
          "id": "vco-2-sub-1-saw",
          "kind": "signal",
          "desc": "VCO 2 SUB 1 sawtooth, internal PWM source"
        },
        {
          "id": "vco-2-sub-1-saw-to-vco-2-pwm",
          "kind": "normal",
          "desc": "SUB 1 saw into VCO 2 PWM"
        },
        {
          "id": "vco-2-sub-frequency-knobs",
          "kind": "control",
          "desc": "SUB 1 / SUB 2 FREQ knobs for VCO 2"
        },
        {
          "id": "vco-2-waveform-middle",
          "kind": "condition",
          "desc": "VCO 2 WAVEFORM switch in its middle (PWM) position"
        }
      ],
      "patchbay": {
        "total": 32,
        "inputs": 17,
        "outputs": 15,
        "layout": {
          "cols": 4,
          "rows": 8,
          "note": "Manual explicitly documents this as eight rows of four."
        },
        "jacks": [
          {
            "id": "vco-1-in",
            "row": 1,
            "col": 1,
            "name": "VCO 1",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct",
            "sumsWith": [
              "vco-1-frequency-knob",
              "sequencer-1-steps"
            ],
            "normalledTo": "vco-2-in",
            "desc": "Also controls VCO 2 through an internal normal; patching VCO 2 IN breaks that normal."
          },
          {
            "id": "vco-1-sub-in",
            "row": 1,
            "col": 2,
            "name": "VCO 1 SUB",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vco-1-sub-frequency-knobs"
            ],
            "desc": "Selects subharmonic division (1-16) for VCO 1's subs. Centre SUB FREQ knobs for bipolar CV."
          },
          {
            "id": "vco-1-pwm-in",
            "row": 1,
            "col": 3,
            "name": "VCO 1 PWM",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "normalledFrom": "vco-1-sub-1-saw",
            "normalCondition": "vco-1-waveform-middle",
            "breaksNormal": "vco-1-sub-1-saw-to-vco-1-pwm",
            "desc": "Overrides the internal SUB 1 sawtooth PWM source used by the waveform switch's middle position."
          },
          {
            "id": "vca-out",
            "row": 1,
            "col": 4,
            "name": "VCA",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ],
            "desc": "Main audio output (10Vpp)."
          },
          {
            "id": "vco-1-out",
            "row": 2,
            "col": 1,
            "name": "VCO 1",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vco-1-sub-1-out",
            "row": 2,
            "col": 2,
            "name": "VCO 1 SUB 1",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vco-1-sub-2-out",
            "row": 2,
            "col": 3,
            "name": "VCO 1 SUB 2",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vca-in",
            "row": 2,
            "col": 4,
            "name": "VCA",
            "dir": "in",
            "signal": "cv",
            "range": [
              0,
              8
            ],
            "sumsWith": [
              "vca-eg"
            ]
          },
          {
            "id": "vco-2-in",
            "row": 3,
            "col": 1,
            "name": "VCO 2",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "scaling": "1V/oct",
            "sumsWith": [
              "vco-2-frequency-knob",
              "sequencer-2-steps"
            ],
            "normalledFrom": "vco-1-in",
            "breaksNormal": "vco-1-in-to-vco-2-in"
          },
          {
            "id": "vco-2-sub-in",
            "row": 3,
            "col": 2,
            "name": "VCO 2 SUB",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "vco-2-sub-frequency-knobs"
            ]
          },
          {
            "id": "vco-2-pwm-in",
            "row": 3,
            "col": 3,
            "name": "VCO 2 PWM",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "normalledFrom": "vco-2-sub-1-saw",
            "normalCondition": "vco-2-waveform-middle",
            "breaksNormal": "vco-2-sub-1-saw-to-vco-2-pwm",
            "desc": "Overrides the internal SUB 1 sawtooth PWM source used by the waveform switch's middle position."
          },
          {
            "id": "vca-eg-out",
            "row": 3,
            "col": 4,
            "name": "VCA EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              8
            ]
          },
          {
            "id": "vco-2-out",
            "row": 4,
            "col": 1,
            "name": "VCO 2",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vco-2-sub-1-out",
            "row": 4,
            "col": 2,
            "name": "VCO 2 SUB 1",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "vco-2-sub-2-out",
            "row": 4,
            "col": 3,
            "name": "VCO 2 SUB 2",
            "dir": "out",
            "signal": "audio",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "cutoff-in",
            "row": 4,
            "col": 4,
            "name": "CUTOFF",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "cutoff-knob",
              "vcf-eg"
            ]
          },
          {
            "id": "play-in",
            "row": 5,
            "col": 1,
            "name": "PLAY",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              10
            ]
          },
          {
            "id": "reset-in",
            "row": 5,
            "col": 2,
            "name": "RESET",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              10
            ]
          },
          {
            "id": "trigger-in",
            "row": 5,
            "col": 3,
            "name": "TRIGGER",
            "dir": "in",
            "signal": "gate",
            "range": [
              0,
              10
            ]
          },
          {
            "id": "vcf-eg-out",
            "row": 5,
            "col": 4,
            "name": "VCF EG",
            "dir": "out",
            "signal": "cv",
            "range": [
              0,
              8
            ]
          },
          {
            "id": "rhythm-1-in",
            "row": 6,
            "col": 1,
            "name": "RHYTHM 1",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "rhythm-1-knob"
            ],
            "desc": "Sets the division of Rhythm Generator 1."
          },
          {
            "id": "rhythm-2-in",
            "row": 6,
            "col": 2,
            "name": "RHYTHM 2",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "rhythm-2-knob"
            ]
          },
          {
            "id": "rhythm-3-in",
            "row": 6,
            "col": 3,
            "name": "RHYTHM 3",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "rhythm-3-knob"
            ]
          },
          {
            "id": "rhythm-4-in",
            "row": 6,
            "col": 4,
            "name": "RHYTHM 4",
            "dir": "in",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "sumsWith": [
              "rhythm-4-knob"
            ]
          },
          {
            "id": "seq-1-out",
            "row": 7,
            "col": 1,
            "name": "SEQ 1",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ],
            "desc": "Sequencer 1 pitch CV."
          },
          {
            "id": "seq-1-clock-out",
            "row": 7,
            "col": 2,
            "name": "SEQ 1 CLK",
            "dir": "out",
            "signal": "clock",
            "range": [
              0,
              5
            ]
          },
          {
            "id": "seq-2-out",
            "row": 7,
            "col": 3,
            "name": "SEQ 2",
            "dir": "out",
            "signal": "cv",
            "range": [
              -5,
              5
            ]
          },
          {
            "id": "seq-2-clock-out",
            "row": 7,
            "col": 4,
            "name": "SEQ 2 CLK",
            "dir": "out",
            "signal": "clock",
            "range": [
              0,
              5
            ]
          },
          {
            "id": "midi-in",
            "row": 8,
            "col": 1,
            "name": "MIDI IN",
            "dir": "in",
            "signal": "midi",
            "range": null,
            "rangeNote": "Digital MIDI transport, not a voltage-domain jack.",
            "desc": "3.5mm MIDI."
          },
          {
            "id": "clock-in",
            "row": 8,
            "col": 2,
            "name": "CLOCK",
            "dir": "in",
            "signal": "clock",
            "range": [
              0,
              10
            ]
          },
          {
            "id": "clock-out",
            "row": 8,
            "col": 3,
            "name": "CLOCK",
            "dir": "out",
            "signal": "clock",
            "range": [
              0,
              10
            ]
          },
          {
            "id": "trigger-out",
            "row": 8,
            "col": 4,
            "name": "TRIGGER",
            "dir": "out",
            "signal": "gate",
            "range": [
              0,
              5
            ],
            "pulseMs": 1
          }
        ]
      },
      "panel": {
        "note": "Control geometry is normalized to the cited Moog panel drawing.",
        "sections": [
          {
            "id": "osc1",
            "label": "OSCILLATOR 1",
            "controls": [
              {
                "id": "osc1.vco-1-freq",
                "name": "VCO 1 FREQ",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.354,
                  "y": 0.208
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualRange": [
                    262,
                    4186
                  ],
                  "manualNotes": "C4 to C8"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Parent VCO panel frequency spans C4-C8; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc1.sub-1-freq-vco-1",
                "name": "SUB 1 FREQ (VCO 1)",
                "type": "knob",
                "desc": "Subharmonic divisor 1-16.",
                "panelPosition": {
                  "x": 0.309,
                  "y": 0.402
                },
                "panelSize": "large",
                "kind": "stepped",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "divisor",
                  "range": [
                    1,
                    16
                  ]
                },
                "mapping": {
                  "kind": "integer",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Suboscillators divide parent by exact integers 1-16; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc1.sub-2-freq-vco-1",
                "name": "SUB 2 FREQ (VCO 1)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.398,
                  "y": 0.402
                },
                "panelSize": "large",
                "kind": "stepped",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "divisor",
                  "range": [
                    1,
                    16
                  ]
                },
                "mapping": {
                  "kind": "integer",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Suboscillators divide parent by exact integers 1-16; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc1.waveform-vco-1",
                "name": "WAVEFORM (VCO 1)",
                "type": "switch",
                "positions": [
                  "SQUARE",
                  "PWM",
                  "SAW"
                ],
                "desc": "Middle position: VCO 1 is pulse while both subs are saw; SUB 1 saw is normalled to VCO 1 PWM.",
                "panelPosition": {
                  "x": 0.294,
                  "y": 0.208
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "SQUARE",
                    "PWM",
                    "SAW"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "osc2",
            "label": "OSCILLATOR 2",
            "controls": [
              {
                "id": "osc2.vco-2-freq",
                "name": "VCO 2 FREQ",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.534,
                  "y": 0.208
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualRange": [
                    262,
                    4186
                  ],
                  "manualNotes": "C4 to C8"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Parent VCO panel frequency spans C4-C8; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc2.sub-1-freq-vco-2",
                "name": "SUB 1 FREQ (VCO 2)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.49,
                  "y": 0.402
                },
                "panelSize": "large",
                "kind": "stepped",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "divisor",
                  "range": [
                    1,
                    16
                  ]
                },
                "mapping": {
                  "kind": "integer",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Suboscillators divide parent by exact integers 1-16; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc2.sub-2-freq-vco-2",
                "name": "SUB 2 FREQ (VCO 2)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.579,
                  "y": 0.402
                },
                "panelSize": "large",
                "kind": "stepped",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "divisor",
                  "range": [
                    1,
                    16
                  ]
                },
                "mapping": {
                  "kind": "integer",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Suboscillators divide parent by exact integers 1-16; outputs 10Vpp",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "osc2.waveform-vco-2",
                "name": "WAVEFORM (VCO 2)",
                "type": "switch",
                "positions": [
                  "SQUARE",
                  "PWM",
                  "SAW"
                ],
                "desc": "Middle position: VCO 2 is pulse while both subs are saw; SUB 1 saw is normalled to VCO 2 PWM.",
                "panelPosition": {
                  "x": 0.596,
                  "y": 0.208
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "SQUARE",
                    "PWM",
                    "SAW"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "mixer",
            "label": "MIXER",
            "controls": [
              {
                "id": "mixer.vco-1-level",
                "name": "VCO 1 LEVEL",
                "type": "knob",
                "panelPosition": {
                  "x": 0.354,
                  "y": 0.674
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.sub-1-level-vco-1",
                "name": "SUB 1 LEVEL (VCO 1)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.309,
                  "y": 0.844
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.sub-2-level-vco-1",
                "name": "SUB 2 LEVEL (VCO 1)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.398,
                  "y": 0.844
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.vco-2-level",
                "name": "VCO 2 LEVEL",
                "type": "knob",
                "panelPosition": {
                  "x": 0.534,
                  "y": 0.674
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.sub-1-level-vco-2",
                "name": "SUB 1 LEVEL (VCO 2)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.49,
                  "y": 0.844
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "mixer.sub-2-level-vco-2",
                "name": "SUB 2 LEVEL (VCO 2)",
                "type": "knob",
                "panelPosition": {
                  "x": 0.579,
                  "y": 0.844
                },
                "panelSize": "large",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Six-source mixer; maximum levels create warm distortion, moderate levels are cleaner",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "vcf",
            "label": "FILTER",
            "controls": [
              {
                "id": "vcf.cutoff",
                "name": "CUTOFF",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.67,
                  "y": 0.142
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "Hz",
                  "manualEndpoints": [
                    20,
                    20000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "LP-only, 24dB/oct, self-oscillates",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.resonance",
                "name": "RESONANCE",
                "type": "knob",
                "desc": "Self-oscillates at maximum.",
                "panelPosition": {
                  "x": 0.67,
                  "y": 0.374
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.vcf-attack",
                "name": "VCF ATTACK",
                "type": "knob",
                "panelPosition": {
                  "x": 0.67,
                  "y": 0.609
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "ms",
                  "manualRange": [
                    1,
                    10000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "VCF/VCA attack span 1ms-10s; new gates ignored during attack",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vcf.vcf-decay",
                "name": "VCF DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.767,
                  "y": 0.609
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms",
                  "manualRange": [
                    5,
                    10000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vcf.vcf-eg-amt",
                "name": "VCF EG AMT",
                "type": "knob",
                "panelPosition": {
                  "x": 0.767,
                  "y": 0.374
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "vca",
            "label": "AMPLIFIER",
            "controls": [
              {
                "id": "vca.vca-attack",
                "name": "VCA ATTACK",
                "type": "knob",
                "panelPosition": {
                  "x": 0.67,
                  "y": 0.844
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "ms",
                  "manualRange": [
                    1,
                    10000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "VCF/VCA attack span 1ms-10s; new gates ignored during attack",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "vca.vca-decay",
                "name": "VCA DECAY",
                "type": "knob",
                "panelPosition": {
                  "x": 0.767,
                  "y": 0.844
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "ms",
                  "manualRange": [
                    5,
                    10000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "vca.volume",
                "name": "VOLUME",
                "type": "knob",
                "panelPosition": {
                  "x": 0.767,
                  "y": 0.142
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "normalized"
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate"
              }
            ]
          },
          {
            "id": "seq",
            "label": "SEQUENCERS",
            "controls": [
              {
                "id": "seq.seq-1-step-1-4",
                "name": "SEQ 1 STEP 1-4",
                "type": "knobArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.05,
                      "y": 0.145
                    },
                    "panelSize": "small",
                    "id": "seq.seq1.step[0]",
                    "index": 0,
                    "name": "SEQ 1 STEP 1",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.112,
                      "y": 0.145
                    },
                    "panelSize": "small",
                    "id": "seq.seq1.step[1]",
                    "index": 1,
                    "name": "SEQ 1 STEP 2",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.173,
                      "y": 0.145
                    },
                    "panelSize": "small",
                    "id": "seq.seq1.step[2]",
                    "index": 2,
                    "name": "SEQ 1 STEP 3",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.234,
                      "y": 0.145
                    },
                    "panelSize": "small",
                    "id": "seq.seq1.step[3]",
                    "index": 3,
                    "name": "SEQ 1 STEP 4",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "seq.seq-2-step-1-4",
                "name": "SEQ 2 STEP 1-4",
                "type": "knobArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.05,
                      "y": 0.329
                    },
                    "panelSize": "small",
                    "id": "seq.seq2.step[0]",
                    "index": 0,
                    "name": "SEQ 2 STEP 1",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.112,
                      "y": 0.329
                    },
                    "panelSize": "small",
                    "id": "seq.seq2.step[1]",
                    "index": 1,
                    "name": "SEQ 2 STEP 2",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.173,
                      "y": 0.329
                    },
                    "panelSize": "small",
                    "id": "seq.seq2.step[2]",
                    "index": 2,
                    "name": "SEQ 2 STEP 3",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.234,
                      "y": 0.329
                    },
                    "panelSize": "small",
                    "id": "seq.seq2.step[3]",
                    "index": 3,
                    "name": "SEQ 2 STEP 4",
                    "type": "knob",
                    "kind": "continuous",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "normalized"
                    },
                    "mapping": {
                      "kind": "measured-table",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "seq.seq-1-assign-vco-1",
                "name": "SEQ 1 ASSIGN (VCO 1)",
                "type": "buttonArray",
                "desc": "Routes SEQ 1 to VCO 1 / SUB 1 / SUB 2.",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.313,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq1.assign.vco1",
                    "index": 0,
                    "name": "SEQ 1 → VCO 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.354,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq1.assign.sub1",
                    "index": 1,
                    "name": "SEQ 1 → SUB 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.398,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq1.assign.sub2",
                    "index": 2,
                    "name": "SEQ 1 → SUB 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "seq.seq-2-assign-vco-2",
                "name": "SEQ 2 ASSIGN (VCO 2)",
                "type": "buttonArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.49,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq2.assign.vco2",
                    "index": 0,
                    "name": "SEQ 2 → VCO 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.534,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq2.assign.sub1",
                    "index": 1,
                    "name": "SEQ 2 → SUB 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.579,
                      "y": 0.538
                    },
                    "panelSize": "key",
                    "id": "seq.seq2.assign.sub2",
                    "index": 2,
                    "name": "SEQ 2 → SUB 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "seq.seq-oct",
                "name": "SEQ OCT",
                "type": "switch",
                "positions": [
                  "+/-5",
                  "+/-2",
                  "+/-1"
                ],
                "panelPosition": {
                  "x": 0.445,
                  "y": 0.286
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "+/-5",
                    "+/-2",
                    "+/-1"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "SEQ OCT selects a shared +/-5, +/-2, or +/-1 octave step range",
                    "confidence": "high"
                  }
                ]
              },
              {
                "id": "seq.quantize",
                "name": "QUANTIZE",
                "type": "switch",
                "positions": [
                  "OFF",
                  "12-ET",
                  "8-ET",
                  "12-JI",
                  "8-JI"
                ],
                "panelPosition": {
                  "x": 0.445,
                  "y": 0.664
                },
                "panelSize": "switch",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "OFF",
                    "12-ET",
                    "8-ET",
                    "12-JI",
                    "8-JI"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "QUANTIZE cycles through Off, 12-ET, 8-ET, 12-JI, and 8-JI",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "rhythm",
            "label": "POLYRHYTHM",
            "controls": [
              {
                "id": "rhythm.rhythm-1-4",
                "name": "RHYTHM 1-4",
                "type": "knobArray",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.05,
                      "y": 0.522
                    },
                    "panelSize": "small",
                    "id": "rhythm.generator[0]",
                    "index": 0,
                    "name": "RHYTHM 1",
                    "type": "knob",
                    "kind": "stepped",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "divisor",
                      "range": [
                        1,
                        16
                      ],
                      "direction": "clockwise-decreases"
                    },
                    "mapping": {
                      "kind": "integer",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.112,
                      "y": 0.522
                    },
                    "panelSize": "small",
                    "id": "rhythm.generator[1]",
                    "index": 1,
                    "name": "RHYTHM 2",
                    "type": "knob",
                    "kind": "stepped",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "divisor",
                      "range": [
                        1,
                        16
                      ],
                      "direction": "clockwise-decreases"
                    },
                    "mapping": {
                      "kind": "integer",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.173,
                      "y": 0.522
                    },
                    "panelSize": "small",
                    "id": "rhythm.generator[2]",
                    "index": 2,
                    "name": "RHYTHM 3",
                    "type": "knob",
                    "kind": "stepped",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "divisor",
                      "range": [
                        1,
                        16
                      ],
                      "direction": "clockwise-decreases"
                    },
                    "mapping": {
                      "kind": "integer",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.234,
                      "y": 0.522
                    },
                    "panelSize": "small",
                    "id": "rhythm.generator[3]",
                    "index": 3,
                    "name": "RHYTHM 4",
                    "type": "knob",
                    "kind": "stepped",
                    "defaultNormalized": 0.5,
                    "plain": {
                      "unit": "divisor",
                      "range": [
                        1,
                        16
                      ],
                      "direction": "clockwise-decreases"
                    },
                    "mapping": {
                      "kind": "integer",
                      "status": "measurement-needed"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "rhythm.rhythm-assign-matrix",
                "name": "RHYTHM ASSIGN MATRIX",
                "type": "buttonMatrix",
                "desc": "Each rhythm generator can clock SEQ 1, SEQ 2, both, or neither.",
                "kind": "group",
                "elements": [
                  {
                    "panelPosition": {
                      "x": 0.05,
                      "y": 0.616
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 1",
                    "id": "rhythm.generator[0].assign.seq1",
                    "index": 0,
                    "name": "RHYTHM 1 → SEQ 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.05,
                      "y": 0.684
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 2",
                    "id": "rhythm.generator[0].assign.seq2",
                    "index": 1,
                    "name": "RHYTHM 1 → SEQ 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.112,
                      "y": 0.616
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 1",
                    "id": "rhythm.generator[1].assign.seq1",
                    "index": 2,
                    "name": "RHYTHM 2 → SEQ 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.112,
                      "y": 0.684
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 2",
                    "id": "rhythm.generator[1].assign.seq2",
                    "index": 3,
                    "name": "RHYTHM 2 → SEQ 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.173,
                      "y": 0.616
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 1",
                    "id": "rhythm.generator[2].assign.seq1",
                    "index": 4,
                    "name": "RHYTHM 3 → SEQ 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.173,
                      "y": 0.684
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 2",
                    "id": "rhythm.generator[2].assign.seq2",
                    "index": 5,
                    "name": "RHYTHM 3 → SEQ 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.234,
                      "y": 0.616
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 1",
                    "id": "rhythm.generator[3].assign.seq1",
                    "index": 6,
                    "name": "RHYTHM 4 → SEQ 1",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  },
                  {
                    "panelPosition": {
                      "x": 0.234,
                      "y": 0.684
                    },
                    "panelSize": "key",
                    "panelLegend": "SEQ 2",
                    "id": "rhythm.generator[3].assign.seq2",
                    "index": 7,
                    "name": "RHYTHM 4 → SEQ 2",
                    "type": "button",
                    "kind": "button",
                    "defaultNormalized": 0,
                    "plain": {
                      "unit": "boolean",
                      "values": [
                        "OFF",
                        "ON"
                      ]
                    },
                    "mapping": {
                      "kind": "switch"
                    },
                    "automationRate": "k-rate"
                  }
                ]
              },
              {
                "id": "rhythm.tempo",
                "name": "TEMPO",
                "type": "knob",
                "taper": "exp",
                "panelPosition": {
                  "x": 0.08,
                  "y": 0.846
                },
                "panelSize": "xlarge",
                "kind": "continuous",
                "defaultNormalized": 0.5,
                "plain": {
                  "unit": "bpm",
                  "manualRange": [
                    20,
                    3000
                  ]
                },
                "mapping": {
                  "kind": "measured-table",
                  "status": "measurement-needed"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "Tempo range ~20-3000 BPM",
                    "confidence": "high"
                  }
                ]
              }
            ]
          },
          {
            "id": "transport",
            "label": "TRANSPORT",
            "controls": [
              {
                "id": "transport.play",
                "name": "PLAY",
                "type": "button",
                "panelPosition": {
                  "x": 0.164,
                  "y": 0.858
                },
                "panelSize": "wide-key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "transport.trigger",
                "name": "TRIGGER",
                "type": "button",
                "panelPosition": {
                  "x": 0.229,
                  "y": 0.858
                },
                "panelSize": "wide-key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "transport.reset",
                "name": "RESET",
                "type": "button",
                "panelPosition": {
                  "x": 0.154,
                  "y": 0.782
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "transport.next",
                "name": "NEXT",
                "type": "button",
                "panelPosition": {
                  "x": 0.238,
                  "y": 0.782
                },
                "panelSize": "key",
                "kind": "button",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "gate",
                  "range": [
                    0,
                    1
                  ]
                },
                "mapping": {
                  "kind": "event"
                },
                "automationRate": "k-rate"
              },
              {
                "id": "transport.eg",
                "name": "EG",
                "type": "switch",
                "positions": [
                  "OFF",
                  "ON",
                  "HELD"
                ],
                "desc": "Controls whether sequencer steps trigger the envelopes or hold them open.",
                "panelPosition": {
                  "x": 0.195,
                  "y": 0.782
                },
                "panelSize": "key",
                "kind": "switch",
                "defaultNormalized": 0,
                "plain": {
                  "unit": "enum",
                  "values": [
                    "OFF",
                    "ON",
                    "HELD"
                  ]
                },
                "mapping": {
                  "kind": "switch"
                },
                "automationRate": "k-rate",
                "evidence": [
                  {
                    "source": "Subharmonicon_Manual AMZ.pdf",
                    "page": "PDF pp. 17–24, 28–30",
                    "status": "manual",
                    "claim": "EG has Off, On, and Held states; attacks ignore retriggers and Held sustains both envelopes",
                    "confidence": "high"
                  }
                ]
              }
            ]
          }
        ],
        "layout": {
          "source": {
            "file": "Subharmonicon_Patchbook_2022.pdf",
            "page": 3,
            "renderDpi": 300,
            "cropPx": [
              186,
              469,
              3114,
              1716
            ]
          },
          "physical": {
            "eurorackHp": 60,
            "widthMm": 304.8,
            "heightMm": 128.5,
            "moduleDepthMm": 26,
            "outerCaseMm": {
              "width": 319.28,
              "height": 106.93,
              "depth": 133.1
            }
          },
          "aspectRatio": 2.3719844357976654,
          "patchbay": {
            "x": 0.814,
            "y": 0.073,
            "width": 0.174,
            "height": 0.82
          },
          "sectionLabels": {
            "osc1": {
              "x": 0.275,
              "y": 0.025
            },
            "osc2": {
              "x": 0.485,
              "y": 0.025
            },
            "mixer": {
              "x": 0.29,
              "y": 0.57
            },
            "vcf": {
              "x": 0.635,
              "y": 0.025
            },
            "vca": {
              "x": 0.635,
              "y": 0.7
            },
            "seq": {
              "x": 0.02,
              "y": 0.025
            },
            "rhythm": {
              "x": 0.02,
              "y": 0.43
            },
            "transport": {
              "x": 0.04,
              "y": 0.7
            }
          }
        }
      }
    }
  },
  "manifests": {
    "dfam": {
      "manifestVersion": 1,
      "schemaVersion": 2,
      "instrumentId": "dfam",
      "parameterCount": 42,
      "parameterHash": "52cccafbfabfbf7d980c801dbec8e527fc0069c8e8bdb449b33d5016f0d1c28e",
      "sourceHash": "f0bf20d109204425aceac8ce2e2a240ecc4a3e11585ec8995f68bf2f40dd4ee0",
      "parameters": [
        {
          "slot": 0,
          "id": "mixer.noise-ext-level",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 1,
          "id": "mixer.vco-1-level",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 2,
          "id": "mixer.vco-2-level",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 3,
          "id": "seq.advance",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 4,
          "id": "seq.pitch[0]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 0
        },
        {
          "slot": 5,
          "id": "seq.pitch[1]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 1
        },
        {
          "slot": 6,
          "id": "seq.pitch[2]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 2
        },
        {
          "slot": 7,
          "id": "seq.pitch[3]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 3
        },
        {
          "slot": 8,
          "id": "seq.pitch[4]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 4
        },
        {
          "slot": 9,
          "id": "seq.pitch[5]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 5
        },
        {
          "slot": 10,
          "id": "seq.pitch[6]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 6
        },
        {
          "slot": 11,
          "id": "seq.pitch[7]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.pitch-1-8",
          "elementIndex": 7
        },
        {
          "slot": 12,
          "id": "seq.run-stop",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 13,
          "id": "seq.tempo",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 14,
          "id": "seq.trigger",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 15,
          "id": "seq.velocity[0]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 0
        },
        {
          "slot": 16,
          "id": "seq.velocity[1]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 1
        },
        {
          "slot": 17,
          "id": "seq.velocity[2]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 2
        },
        {
          "slot": 18,
          "id": "seq.velocity[3]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 3
        },
        {
          "slot": 19,
          "id": "seq.velocity[4]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 4
        },
        {
          "slot": 20,
          "id": "seq.velocity[5]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 5
        },
        {
          "slot": 21,
          "id": "seq.velocity[6]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 6
        },
        {
          "slot": 22,
          "id": "seq.velocity[7]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.velocity-1-8",
          "elementIndex": 7
        },
        {
          "slot": 23,
          "id": "vca.vca-decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 24,
          "id": "vca.vca-eg",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 25,
          "id": "vca.volume",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 26,
          "id": "vcf.cutoff",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 27,
          "id": "vcf.noise-vcf-mod",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 28,
          "id": "vcf.resonance",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 29,
          "id": "vcf.vcf-decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 30,
          "id": "vcf.vcf-eg-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 31,
          "id": "vcf.vcf-mode",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 32,
          "id": "vco.hard-sync",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 33,
          "id": "vco.seq-pitch-mod",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 34,
          "id": "vco.vco1-to-vco2-fm-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 35,
          "id": "vco.vco-1-eg-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 36,
          "id": "vco.vco-1-frequency",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 37,
          "id": "vco.vco-1-wave",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 38,
          "id": "vco.vco-2-eg-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 39,
          "id": "vco.vco-2-frequency",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 40,
          "id": "vco.vco-2-wave",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 41,
          "id": "vco.vco-decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        }
      ]
    },
    "mother32": {
      "manifestVersion": 1,
      "schemaVersion": 2,
      "instrumentId": "mother32",
      "parameterCount": 41,
      "parameterHash": "85e788c85f4a86b94fd8399bd6889ec05e88ce3089e2e8e814a77982b3427b05",
      "sourceHash": "de00f93cbd9b4a79cf4d4104c09a1eac8672ab2f80b107ecb806b941caa2af1e",
      "parameters": [
        {
          "slot": 0,
          "id": "eg.attack",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 1,
          "id": "eg.decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 2,
          "id": "eg.sustain",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 3,
          "id": "eg.vca-mode",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 4,
          "id": "kb.glide",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 5,
          "id": "kb.pad[0]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 0
        },
        {
          "slot": 6,
          "id": "kb.pad[1]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 1
        },
        {
          "slot": 7,
          "id": "kb.pad[2]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 2
        },
        {
          "slot": 8,
          "id": "kb.pad[3]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 3
        },
        {
          "slot": 9,
          "id": "kb.pad[4]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 4
        },
        {
          "slot": 10,
          "id": "kb.pad[5]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 5
        },
        {
          "slot": 11,
          "id": "kb.pad[6]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 6
        },
        {
          "slot": 12,
          "id": "kb.pad[7]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 7
        },
        {
          "slot": 13,
          "id": "kb.pad[8]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 8
        },
        {
          "slot": 14,
          "id": "kb.pad[9]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 9
        },
        {
          "slot": 15,
          "id": "kb.pad[10]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 10
        },
        {
          "slot": 16,
          "id": "kb.pad[11]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 11
        },
        {
          "slot": 17,
          "id": "kb.pad[12]",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "kb.pads",
          "elementIndex": 12
        },
        {
          "slot": 18,
          "id": "lfo.lfo-rate",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 19,
          "id": "lfo.lfo-wave",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 20,
          "id": "mixer.mix",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 21,
          "id": "out.volume",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 22,
          "id": "seq.hold-rest",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 23,
          "id": "seq.pattern-bank",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 24,
          "id": "seq.reset-accent",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 25,
          "id": "seq.run-stop-rec",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 26,
          "id": "seq.swing",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 27,
          "id": "seq.tempo-gate-length",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 28,
          "id": "util.vc-mix",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 29,
          "id": "vcf.cutoff",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 30,
          "id": "vcf.resonance",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 31,
          "id": "vcf.vcf-mod-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 32,
          "id": "vcf.vcf-mod-polarity",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 33,
          "id": "vcf.vcf-mod-source",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 34,
          "id": "vcf.vcf-mode",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 35,
          "id": "vco.frequency",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 36,
          "id": "vco.pulse-width",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 37,
          "id": "vco.vco-mod-amount",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 38,
          "id": "vco.vco-mod-destination",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 39,
          "id": "vco.vco-mod-source",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 40,
          "id": "vco.vco-wave",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        }
      ]
    },
    "subharmonicon": {
      "manifestVersion": 1,
      "schemaVersion": 2,
      "instrumentId": "subharmonicon",
      "parameterCount": 56,
      "parameterHash": "74447116358af606abd0835260acb7463cb4ac0d006a6e753a549cb696b04741",
      "sourceHash": "479a3bfbb537f65b20966e68ab8152bba7ffa880199ed36329690a643b01438d",
      "parameters": [
        {
          "slot": 0,
          "id": "mixer.sub-1-level-vco-1",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 1,
          "id": "mixer.sub-1-level-vco-2",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 2,
          "id": "mixer.sub-2-level-vco-1",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 3,
          "id": "mixer.sub-2-level-vco-2",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 4,
          "id": "mixer.vco-1-level",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 5,
          "id": "mixer.vco-2-level",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 6,
          "id": "osc1.sub-1-freq-vco-1",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 7,
          "id": "osc1.sub-2-freq-vco-1",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 8,
          "id": "osc1.vco-1-freq",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 9,
          "id": "osc1.waveform-vco-1",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 10,
          "id": "osc2.sub-1-freq-vco-2",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 11,
          "id": "osc2.sub-2-freq-vco-2",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 12,
          "id": "osc2.vco-2-freq",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 13,
          "id": "osc2.waveform-vco-2",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 14,
          "id": "rhythm.generator[0]",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "rhythm.rhythm-1-4",
          "elementIndex": 0
        },
        {
          "slot": 15,
          "id": "rhythm.generator[0].assign.seq1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 0
        },
        {
          "slot": 16,
          "id": "rhythm.generator[0].assign.seq2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 1
        },
        {
          "slot": 17,
          "id": "rhythm.generator[1]",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "rhythm.rhythm-1-4",
          "elementIndex": 1
        },
        {
          "slot": 18,
          "id": "rhythm.generator[1].assign.seq1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 2
        },
        {
          "slot": 19,
          "id": "rhythm.generator[1].assign.seq2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 3
        },
        {
          "slot": 20,
          "id": "rhythm.generator[2]",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "rhythm.rhythm-1-4",
          "elementIndex": 2
        },
        {
          "slot": 21,
          "id": "rhythm.generator[2].assign.seq1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 4
        },
        {
          "slot": 22,
          "id": "rhythm.generator[2].assign.seq2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 5
        },
        {
          "slot": 23,
          "id": "rhythm.generator[3]",
          "kind": "stepped",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "rhythm.rhythm-1-4",
          "elementIndex": 3
        },
        {
          "slot": 24,
          "id": "rhythm.generator[3].assign.seq1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 6
        },
        {
          "slot": 25,
          "id": "rhythm.generator[3].assign.seq2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "rhythm.rhythm-assign-matrix",
          "elementIndex": 7
        },
        {
          "slot": 26,
          "id": "rhythm.tempo",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 27,
          "id": "seq.quantize",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 28,
          "id": "seq.seq1.assign.sub1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-1-assign-vco-1",
          "elementIndex": 1
        },
        {
          "slot": 29,
          "id": "seq.seq1.assign.sub2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-1-assign-vco-1",
          "elementIndex": 2
        },
        {
          "slot": 30,
          "id": "seq.seq1.assign.vco1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-1-assign-vco-1",
          "elementIndex": 0
        },
        {
          "slot": 31,
          "id": "seq.seq1.step[0]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-1-step-1-4",
          "elementIndex": 0
        },
        {
          "slot": 32,
          "id": "seq.seq1.step[1]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-1-step-1-4",
          "elementIndex": 1
        },
        {
          "slot": 33,
          "id": "seq.seq1.step[2]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-1-step-1-4",
          "elementIndex": 2
        },
        {
          "slot": 34,
          "id": "seq.seq1.step[3]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-1-step-1-4",
          "elementIndex": 3
        },
        {
          "slot": 35,
          "id": "seq.seq2.assign.sub1",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-2-assign-vco-2",
          "elementIndex": 1
        },
        {
          "slot": 36,
          "id": "seq.seq2.assign.sub2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-2-assign-vco-2",
          "elementIndex": 2
        },
        {
          "slot": 37,
          "id": "seq.seq2.assign.vco2",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0,
          "groupId": "seq.seq-2-assign-vco-2",
          "elementIndex": 0
        },
        {
          "slot": 38,
          "id": "seq.seq2.step[0]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-2-step-1-4",
          "elementIndex": 0
        },
        {
          "slot": 39,
          "id": "seq.seq2.step[1]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-2-step-1-4",
          "elementIndex": 1
        },
        {
          "slot": 40,
          "id": "seq.seq2.step[2]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-2-step-1-4",
          "elementIndex": 2
        },
        {
          "slot": 41,
          "id": "seq.seq2.step[3]",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5,
          "groupId": "seq.seq-2-step-1-4",
          "elementIndex": 3
        },
        {
          "slot": 42,
          "id": "seq.seq-oct",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 43,
          "id": "transport.eg",
          "kind": "switch",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 44,
          "id": "transport.next",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 45,
          "id": "transport.play",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 46,
          "id": "transport.reset",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 47,
          "id": "transport.trigger",
          "kind": "button",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 48,
          "id": "vca.vca-attack",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 49,
          "id": "vca.vca-decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 50,
          "id": "vca.volume",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 51,
          "id": "vcf.cutoff",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 52,
          "id": "vcf.resonance",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 53,
          "id": "vcf.vcf-attack",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0
        },
        {
          "slot": 54,
          "id": "vcf.vcf-decay",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        },
        {
          "slot": 55,
          "id": "vcf.vcf-eg-amt",
          "kind": "continuous",
          "automationRate": "k-rate",
          "defaultNormalized": 0.5
        }
      ]
    }
  },
  "calibrationManifest": {
    "contractVersion": 1,
    "schemaVersion": 2,
    "signalDomain": {
      "unit": "V",
      "internalFloatPerVolt": 1,
      "status": "design-decision",
      "source": "tools/PLAN.md section 2.1"
    },
    "profileSet": {
      "requiredProvenance": [
        "instrumentId",
        "unitId",
        "serialNumber",
        "firmware",
        "measurementDate",
        "sampleRateHz",
        "interface",
        "fixtureRoot"
      ]
    },
    "templates": {
      "oscillator": [
        "frequencyMapping",
        "pitchCvTracking",
        "waveformShape",
        "pulseWidthMapping",
        "outputVolts",
        "dcOffset",
        "phaseBehavior",
        "aliasEnergy"
      ],
      "hardSync": [
        "resetThresholdVolts",
        "resetPhase",
        "eventCorrection",
        "outputVolts",
        "aliasEnergy"
      ],
      "lfo": [
        "rateMapping",
        "rateCvTracking",
        "waveformShape",
        "outputVolts",
        "dcOffset",
        "phaseBehavior"
      ],
      "noise": [
        "spectrum",
        "distribution",
        "outputVolts",
        "dcOffset"
      ],
      "divider": [
        "divisionRatio",
        "phaseRelationship",
        "waveformShape",
        "outputVolts",
        "dcOffset"
      ],
      "mixer": [
        "channelGainMapping",
        "crossfadeLaw",
        "summingHeadroom",
        "driveTransfer",
        "clipOnsetVolts",
        "outputVolts"
      ],
      "filter": [
        "inputVoltsToDrive",
        "cutoffMapping",
        "cutoffCvTracking",
        "resonanceLaw",
        "selfOscillation",
        "modeRealization",
        "oversampling",
        "resamplerQuality",
        "outputVolts"
      ],
      "envelope": [
        "timeMapping",
        "segmentCurve",
        "timingConvention",
        "retriggerStateMachine",
        "gateBehavior",
        "peakVolts",
        "velocityCvInteraction"
      ],
      "vca": [
        "gainLaw",
        "cvSumming",
        "receiverLimits",
        "residualLevel",
        "clipOnsetVolts",
        "outputVolts"
      ],
      "output": [
        "attenuationLaw",
        "maximumInputVolts",
        "clipOnsetVolts",
        "browserFullScaleVolts",
        "dcBehavior"
      ]
    },
    "slots": [
      {
        "id": "dfam.vco1.triangle",
        "instrumentId": "dfam",
        "block": "vco1",
        "mode": "triangle",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vco1.square",
        "instrumentId": "dfam",
        "block": "vco1",
        "mode": "square",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vco2.triangle",
        "instrumentId": "dfam",
        "block": "vco2",
        "mode": "triangle",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vco2.square",
        "instrumentId": "dfam",
        "block": "vco2",
        "mode": "square",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vco2.hard-sync",
        "instrumentId": "dfam",
        "block": "vco2",
        "mode": "hard-sync",
        "template": "hardSync",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.noise",
        "instrumentId": "dfam",
        "block": "noise",
        "mode": "white",
        "template": "noise",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.mixer",
        "instrumentId": "dfam",
        "block": "mixer",
        "mode": "three-source",
        "template": "mixer",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vcf.lp",
        "instrumentId": "dfam",
        "block": "vcf",
        "mode": "lp",
        "template": "filter",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vcf.hp",
        "instrumentId": "dfam",
        "block": "vcf",
        "mode": "hp",
        "template": "filter",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.eg.vco",
        "instrumentId": "dfam",
        "block": "eg",
        "mode": "vco",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.eg.vcf",
        "instrumentId": "dfam",
        "block": "eg",
        "mode": "vcf",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.eg.vca-fast",
        "instrumentId": "dfam",
        "block": "eg",
        "mode": "vca-fast",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.eg.vca-slow",
        "instrumentId": "dfam",
        "block": "eg",
        "mode": "vca-slow",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.vca",
        "instrumentId": "dfam",
        "block": "vca",
        "mode": "envelope",
        "template": "vca",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "dfam.output",
        "instrumentId": "dfam",
        "block": "output",
        "mode": "main",
        "template": "output",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vco.pulse",
        "instrumentId": "mother32",
        "block": "vco",
        "mode": "pulse",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vco.saw",
        "instrumentId": "mother32",
        "block": "vco",
        "mode": "saw",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.lfo.square",
        "instrumentId": "mother32",
        "block": "lfo",
        "mode": "square",
        "template": "lfo",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.lfo.triangle",
        "instrumentId": "mother32",
        "block": "lfo",
        "mode": "triangle",
        "template": "lfo",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.mixer",
        "instrumentId": "mother32",
        "block": "mixer",
        "mode": "crossfade",
        "template": "mixer",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vc-mixer",
        "instrumentId": "mother32",
        "block": "vc-mixer",
        "mode": "dc-crossfade",
        "template": "mixer",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vcf.lp",
        "instrumentId": "mother32",
        "block": "vcf",
        "mode": "lp",
        "template": "filter",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vcf.hp",
        "instrumentId": "mother32",
        "block": "vcf",
        "mode": "hp",
        "template": "filter",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.eg",
        "instrumentId": "mother32",
        "block": "eg",
        "mode": "ad-sustain",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vca.eg",
        "instrumentId": "mother32",
        "block": "vca",
        "mode": "eg",
        "template": "vca",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.vca.on",
        "instrumentId": "mother32",
        "block": "vca",
        "mode": "on",
        "template": "vca",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "mother32.output",
        "instrumentId": "mother32",
        "block": "output",
        "mode": "main",
        "template": "output",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco1.square",
        "instrumentId": "subharmonicon",
        "block": "vco1",
        "mode": "square",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco1.pwm",
        "instrumentId": "subharmonicon",
        "block": "vco1",
        "mode": "pwm",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco1.saw",
        "instrumentId": "subharmonicon",
        "block": "vco1",
        "mode": "saw",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco2.square",
        "instrumentId": "subharmonicon",
        "block": "vco2",
        "mode": "square",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco2.pwm",
        "instrumentId": "subharmonicon",
        "block": "vco2",
        "mode": "pwm",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vco2.saw",
        "instrumentId": "subharmonicon",
        "block": "vco2",
        "mode": "saw",
        "template": "oscillator",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.divider.vco1.sub1",
        "instrumentId": "subharmonicon",
        "block": "divider",
        "mode": "vco1-sub1",
        "template": "divider",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.divider.vco1.sub2",
        "instrumentId": "subharmonicon",
        "block": "divider",
        "mode": "vco1-sub2",
        "template": "divider",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.divider.vco2.sub1",
        "instrumentId": "subharmonicon",
        "block": "divider",
        "mode": "vco2-sub1",
        "template": "divider",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.divider.vco2.sub2",
        "instrumentId": "subharmonicon",
        "block": "divider",
        "mode": "vco2-sub2",
        "template": "divider",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.mixer",
        "instrumentId": "subharmonicon",
        "block": "mixer",
        "mode": "six-source",
        "template": "mixer",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vcf.lp",
        "instrumentId": "subharmonicon",
        "block": "vcf",
        "mode": "lp",
        "template": "filter",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.eg.vcf",
        "instrumentId": "subharmonicon",
        "block": "eg",
        "mode": "vcf",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.eg.vca",
        "instrumentId": "subharmonicon",
        "block": "eg",
        "mode": "vca",
        "template": "envelope",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.vca",
        "instrumentId": "subharmonicon",
        "block": "vca",
        "mode": "envelope",
        "template": "vca",
        "status": "measurement-needed",
        "values": {}
      },
      {
        "id": "subharmonicon.output",
        "instrumentId": "subharmonicon",
        "block": "output",
        "mode": "main",
        "template": "output",
        "status": "measurement-needed",
        "values": {}
      }
    ],
    "slotCount": 43,
    "contractHash": "f8e8569dee3e515d93b5e6a6042564ae4671e9094b8ebf9e00c4f8f6561428d9"
  },
  "patchIdeas": {
    "schemaVersion": 2,
    "pageConvention": "pdf-1-based",
    "ideas": [
      {
        "id": "sub-music-for-washing-dishes",
        "title": "Music for Washing Dishes",
        "evidence": {
          "file": "Subharmonicon_Patchbook_2022.pdf",
          "page": 3,
          "quote": "Play with VCF ATTACK to add dish soap."
        },
        "routeVerification": {
          "method": "visual-render-review",
          "status": "verified"
        },
        "confidence": "manual-stated",
        "cables": [
          {
            "from": {
              "instrumentId": "subharmonicon",
              "jackId": "seq-2-out"
            },
            "to": {
              "instrumentId": "subharmonicon",
              "jackId": "cutoff-in"
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "subharmonicon",
            "controlId": "vcf.vcf-attack",
            "hint": "Play with VCF ATTACK to add dish soap."
          }
        ],
        "rationale": "Sequencer outputs are control voltages. Patching SEQ 2 into CUTOFF turns a pitch sequence into a filter-sweep sequence."
      },
      {
        "id": "sub-shuffled-subs",
        "title": "Shuffled Subs",
        "evidence": {
          "file": "Subharmonicon_Patchbook_2022.pdf",
          "page": 4,
          "quote": "Tune VCO 1 and VCO 2 together. As sequence plays, adjust bassline with VCO 1’s SUB 1 FREQ."
        },
        "routeVerification": {
          "method": "visual-render-review",
          "status": "verified"
        },
        "confidence": "manual-stated",
        "cables": [
          {
            "from": {
              "instrumentId": "subharmonicon",
              "jackId": "seq-1-out"
            },
            "to": {
              "instrumentId": "subharmonicon",
              "jackId": "vco-2-in"
            }
          },
          {
            "from": {
              "instrumentId": "subharmonicon",
              "jackId": "seq-2-out"
            },
            "to": {
              "instrumentId": "subharmonicon",
              "jackId": "cutoff-in"
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "subharmonicon",
            "controlId": "osc1.sub-1-freq-vco-1",
            "hint": "Adjust VCO 1 SUB 1 FREQ while the sequence plays."
          }
        ],
        "rationale": "SEQ 1 changes VCO 2 pitch while SEQ 2 moves the shared filter cutoff, separating pitch and timbre motion."
      },
      {
        "id": "sub-duet-for-tone-and-wind",
        "title": "Duet for Tone and Wind",
        "evidence": {
          "file": "Subharmonicon_Patchbook_2022.pdf",
          "page": 8,
          "quote": "Play with VCF ATTACK, RHYTHM 1, and RHYTHM 2 to find new patterns in wind sound."
        },
        "routeVerification": {
          "method": "visual-render-review",
          "status": "verified"
        },
        "confidence": "manual-stated",
        "cables": [
          {
            "from": {
              "instrumentId": "subharmonicon",
              "jackId": "seq-1-out"
            },
            "to": {
              "instrumentId": "subharmonicon",
              "jackId": "vco-2-pwm-in"
            }
          },
          {
            "from": {
              "instrumentId": "subharmonicon",
              "jackId": "vco-2-out"
            },
            "to": {
              "instrumentId": "subharmonicon",
              "jackId": "clock-in"
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "subharmonicon",
            "controlId": "vcf.vcf-attack",
            "hint": "Play with VCF ATTACK, RHYTHM 1, and RHYTHM 2."
          }
        ],
        "rationale": "The oscillator clocks the instrument while sequencer voltage modulates pulse width, coupling tone and rhythm."
      },
      {
        "id": "electronicus-baroque-as-a-joke",
        "title": "Baroque As A Joke",
        "evidence": {
          "file": "Electronicus_Patch_Book.pdf",
          "page": 4,
          "quote": "DFAM does not run but rather is triggered by Mother-32. Step 8 velocity must be turned up on the DFAM as marked."
        },
        "routeVerification": {
          "method": "visual-render-review",
          "status": "verified"
        },
        "confidence": "manual-stated",
        "cables": [
          {
            "from": {
              "instrumentId": "mother32",
              "jackId": "kb-out"
            },
            "to": {
              "instrumentId": "mother32",
              "jackId": "mult-in"
            }
          },
          {
            "from": {
              "instrumentId": "mother32",
              "jackId": "mult-1-out"
            },
            "to": {
              "instrumentId": "dfam",
              "jackId": "vco-1-cv-in"
            }
          },
          {
            "from": {
              "instrumentId": "mother32",
              "jackId": "mult-2-out"
            },
            "to": {
              "instrumentId": "dfam",
              "jackId": "vco-2-cv-in"
            }
          },
          {
            "from": {
              "instrumentId": "mother32",
              "jackId": "gate-out"
            },
            "to": {
              "instrumentId": "dfam",
              "jackId": "trigger-in"
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "dfam",
            "controlId": "seq.velocity[7]",
            "hint": "Turn up DFAM step 8 VELOCITY; Mother-32 triggers DFAM while DFAM’s own sequencer stays stopped."
          }
        ],
        "rationale": "Mother-32 keyboard CV is split to both DFAM oscillators while Mother-32 GATE triggers DFAM, creating a three-oscillator voice without running the DFAM sequencer."
      }
    ]
  },
  "coachCues": {
    "schemaVersion": 2,
    "pageConvention": "pdf-1-based",
    "cues": [
      {
        "id": "dfam-vco-decay",
        "concept": "dfam-pitch-envelope",
        "match": {
          "action": "control-change",
          "instrumentId": "dfam",
          "targetIds": [
            "vco.vco-decay"
          ]
        },
        "title": "Shape the pitch sweep",
        "actionText": "You changed how long the DFAM pitch envelope develops.",
        "listenFor": "a shorter click or a longer falling-pitch drum gesture.",
        "tryNext": {
          "instrumentId": "dfam",
          "targetId": "vca.vca-decay",
          "text": "Compare it with VCA DECAY to separate pitch motion from note length."
        },
        "rationale": "VCO DECAY shapes the pitch envelope; VCA DECAY shapes the amplitude envelope.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "DFAM_Manual.pdf",
          "page": 16,
          "quote": "The VCO DECAY knob will determine how quickly the jump, or spike in pitch falls back to its original note."
        }
      },
      {
        "id": "dfam-step-velocity",
        "concept": "dfam-velocity-envelopes",
        "match": {
          "action": "control-change",
          "instrumentId": "dfam",
          "targetIds": [
            "seq.velocity[0]",
            "seq.velocity[1]",
            "seq.velocity[2]",
            "seq.velocity[3]",
            "seq.velocity[4]",
            "seq.velocity[5]",
            "seq.velocity[6]",
            "seq.velocity[7]"
          ]
        },
        "title": "Velocity changes more than loudness",
        "actionText": "You changed one DFAM step’s velocity.",
        "listenFor": "changes in pitch, filter, and amplifier-envelope intensity on that step.",
        "tryNext": {
          "instrumentId": "dfam",
          "targetId": "vcf.vcf-decay",
          "text": "Adjust VCF DECAY while this step repeats to hear velocity shape the filter gesture."
        },
        "rationale": "DFAM velocity controls the maximum amplitude of all three envelope generators.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "DFAM_Manual.pdf",
          "page": 25,
          "quote": "This input controls the maximum amplitude of DFAM’s Envelope Generators"
        }
      },
      {
        "id": "dfam-filter-cutoff",
        "concept": "filter-cutoff",
        "match": {
          "action": "control-change",
          "instrumentId": "dfam",
          "targetIds": [
            "vcf.cutoff"
          ]
        },
        "title": "Open or close the filter",
        "actionText": "You moved DFAM’s filter cutoff.",
        "listenFor": "brightness and upper harmonics changing.",
        "tryNext": {
          "instrumentId": "dfam",
          "targetId": "vcf.resonance",
          "text": "Raise RESONANCE slightly, then sweep CUTOFF again."
        },
        "rationale": "Cutoff sets the filter boundary; resonance emphasizes frequencies near it.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "DFAM_Manual.pdf",
          "page": 18,
          "quote": "The CUTOFF knob specifies the Frequency at which the Filter begins to attenuate (or reduce) sound in either the Low Pass or High Pass mode."
        }
      },
      {
        "id": "mother32-mixer-balance",
        "concept": "mother32-source-balance",
        "match": {
          "action": "control-change",
          "instrumentId": "mother32",
          "targetIds": [
            "mixer.mix"
          ]
        },
        "title": "Choose the Mother-32 source",
        "actionText": "You changed the oscillator/external-audio balance.",
        "listenFor": "the internal oscillator giving way to the EXT AUDIO input, or vice versa.",
        "tryNext": {
          "instrumentId": "mother32",
          "targetId": "vcf.cutoff",
          "text": "Sweep CUTOFF to hear the selected source through the ladder filter."
        },
        "rationale": "The MIX control crossfades the internal VCO and external-audio path before the filter.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Mother_32_Users_Manual.pdf",
          "page": 14,
          "quote": "The MIX knob blends the selected VCO waveform (counterclockwise) and an onboard White Noise generator, or signal plugged into the EXT. AUDIO input jack (clockwise)."
        }
      },
      {
        "id": "mother32-filter-cutoff",
        "concept": "filter-cutoff",
        "match": {
          "action": "control-change",
          "instrumentId": "mother32",
          "targetIds": [
            "vcf.cutoff"
          ]
        },
        "title": "Follow the filter boundary",
        "actionText": "You moved Mother-32’s cutoff.",
        "listenFor": "the sound becoming darker or brighter.",
        "tryNext": {
          "instrumentId": "mother32",
          "targetId": "vcf.resonance",
          "text": "Add RESONANCE and listen for a narrow peak around the cutoff frequency."
        },
        "rationale": "The ladder filter attenuates frequencies on one side of its cutoff according to VCF mode.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Mother_32_Users_Manual.pdf",
          "page": 15,
          "quote": "Rotating the CUTOFF knob clockwise will open the Filter, creating a brighter sound."
        }
      },
      {
        "id": "mother32-lfo-rate",
        "concept": "mother32-lfo-modulation",
        "match": {
          "action": "control-change",
          "instrumentId": "mother32",
          "targetIds": [
            "lfo.lfo-rate"
          ]
        },
        "title": "Set the modulation pace",
        "actionText": "You changed the Mother-32 LFO rate.",
        "listenFor": "slow motion becoming vibrato or audio-rate modulation as the rate rises.",
        "tryNext": {
          "instrumentId": "mother32",
          "targetId": "vco.vco-mod-amount",
          "text": "Raise VCO MOD AMOUNT to make the LFO’s pitch effect easier to hear."
        },
        "rationale": "LFO RATE controls how quickly the low-frequency oscillator repeats.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Mother_32_Users_Manual.pdf",
          "page": 14,
          "quote": "This knob is used to determine the LFO’s modulation frequency, which ranges from about 0.1Hz to approximately 350Hz."
        }
      },
      {
        "id": "subharmonicon-filter-cutoff",
        "concept": "filter-cutoff",
        "match": {
          "action": "control-change",
          "instrumentId": "subharmonicon",
          "targetIds": [
            "vcf.cutoff"
          ]
        },
        "title": "Reveal or hide the harmonic stack",
        "actionText": "You moved Subharmonicon’s cutoff.",
        "listenFor": "upper partials from the six-source mixer appearing or disappearing.",
        "tryNext": {
          "instrumentId": "subharmonicon",
          "targetId": "vcf.resonance",
          "text": "Raise RESONANCE and sweep slowly to isolate harmonics."
        },
        "rationale": "All six oscillator sources pass through the shared ladder filter.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Subharmonicon_Manual AMZ.pdf",
          "page": 22,
          "quote": "The combined output signal from the mixer is internally wired to the input of the filter."
        }
      },
      {
        "id": "subharmonicon-filter-envelope",
        "concept": "subharmonicon-filter-envelope",
        "match": {
          "action": "control-change",
          "instrumentId": "subharmonicon",
          "targetIds": [
            "vcf.vcf-attack",
            "vcf.vcf-decay"
          ]
        },
        "title": "Shape the filter gesture",
        "actionText": "You changed the Subharmonicon filter envelope.",
        "listenFor": "the timbre opening more gradually or lingering longer after each trigger.",
        "tryNext": {
          "instrumentId": "subharmonicon",
          "targetId": "vcf.vcf-eg-amt",
          "text": "Change VCF EG AMT to hear more or less of that envelope at the cutoff."
        },
        "rationale": "Attack and decay set the envelope’s timing; VCF EG AMT sets its depth and polarity.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Subharmonicon_Manual AMZ.pdf",
          "page": 23,
          "quote": "The VCF EG produces a time-variant control voltage that modulates the setting of the VCF Cutoff Frequency."
        }
      },
      {
        "id": "subharmonicon-rhythm-structure",
        "concept": "subharmonicon-repeat-horizon",
        "match": {
          "action": "control-change",
          "instrumentId": "subharmonicon",
          "targetIds": [
            "rhythm.generator[0]",
            "rhythm.generator[1]",
            "rhythm.generator[2]",
            "rhythm.generator[3]",
            "rhythm.generator[0].assign.seq1",
            "rhythm.generator[0].assign.seq2",
            "rhythm.generator[1].assign.seq1",
            "rhythm.generator[1].assign.seq2",
            "rhythm.generator[2].assign.seq1",
            "rhythm.generator[2].assign.seq2",
            "rhythm.generator[3].assign.seq1",
            "rhythm.generator[3].assign.seq2"
          ]
        },
        "title": "Reshape the structural repeat",
        "actionText": "You changed a rhythm divisor or sequencer assignment.",
        "listenFor": "the two four-step sequences falling into a new relationship.",
        "tryNext": {
          "instrumentId": "subharmonicon",
          "targetId": "rhythm.generator[0].assign.seq1",
          "text": "Compare the structural-repeat readout before and after changing an assignment."
        },
        "rationale": "Both divisor values and routing determine when the rhythm generators and sequencers realign.",
        "confidence": "manual-stated",
        "evidence": {
          "file": "Subharmonicon_Manual AMZ.pdf",
          "page": 29,
          "quote": "dividing the current tempo by an integer value from 1 to 16"
        }
      }
    ]
  },
  "concepts": {
    "schemaVersion": 1,
    "note": "Concept graph for adaptive coaching (docs/design/07-adaptive-coaching.md). Every control and jack belongs to exactly one concept. Texts are the project's own structural explanations (confidence general-synthesis); Moog-sourced wording lives in coach-cues.json and patch-ideas.json, which become rung-0 and rung-3 content for the matching concept.",
    "concepts": [
      {
        "id": "pitch",
        "title": "Oscillator pitch",
        "intro": {
          "text": "Frequency knobs set each oscillator's base pitch; pitch CV patched into its input adds to that setting.",
          "listenFor": "the note moving up or down."
        },
        "confidence": "general-synthesis",
        "related": [
          "waveform",
          "oscillator-interaction",
          "keyboard-glide"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-1-frequency"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-2-frequency"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vco.frequency"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc1.vco-1-freq"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc2.vco-2-freq"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vco-1-cv-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vco-2-cv-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vco-1v-oct-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-in"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vco.vco-2-frequency",
              "text": "Bring VCO 2 FREQUENCY close to VCO 1 and listen for the two tones beating against each other."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vco-1-cv-in"
              },
              "text": "Instead of turning it by hand, patch Mother-32 LFO TRI into DFAM VCO 1 CV and let the pitch wander."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "kb.glide",
              "text": "Raise GLIDE and play two different pads to hear the pitch slide between them."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vco-1v-oct-in"
              },
              "text": "Patch LFO TRI into VCO 1V/OCT for vibrato; LFO RATE sets its speed."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "osc2.vco-2-freq",
              "text": "Tune VCO 2 against VCO 1 and listen for the interval between the two voices."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "vco-1-in"
              },
              "text": "Patch Mother-32 LFO TRI into Subharmonicon VCO 1. VCO 2 follows through its internal normal until VCO 2 IN is patched."
            }
          }
        }
      },
      {
        "id": "waveform",
        "title": "Waveform and pulse width",
        "intro": {
          "text": "The waveform setting changes the oscillator's harmonic content before anything reaches the filter.",
          "listenFor": "a hollower or brighter, buzzier tone at the same pitch."
        },
        "confidence": "general-synthesis",
        "related": [
          "pitch",
          "filter-cutoff"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-1-wave"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-2-wave"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vco.vco-wave"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vco.pulse-width"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc1.waveform-vco-1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc2.waveform-vco-2"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vco-1-out"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vco-2-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vco-saw-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vco-pulse-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-pwm-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-pwm-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-out"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "Switch the wave, then lower CUTOFF: the filter removes the extra harmonics a square adds."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "vco.pulse-width",
              "text": "With VCO WAVE on PULSE, sweep PULSE WIDTH from narrow to square."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vco-mod-in"
              },
              "text": "Let the pulse width move on its own: set VCO MOD DESTINATION to PWM, raise VCO MOD AMOUNT, and patch LFO TRI into VCO MOD."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "osc1.waveform-vco-1",
              "text": "Try the middle WAVEFORM position: VCO 1 becomes a pulse whose width follows its PWM input."
            }
          }
        }
      },
      {
        "id": "oscillator-interaction",
        "title": "Sync and FM",
        "intro": {
          "text": "Hard sync and FM let one oscillator reshape another, adding harmonics that shift as you retune.",
          "listenFor": "a metallic, vocal, or clangorous edge that changes with tuning."
        },
        "confidence": "general-synthesis",
        "related": [
          "pitch",
          "waveform"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vco.hard-sync"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco1-to-vco2-fm-amount"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "fm-1-to-2-amount-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vco-lin-fm-in"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vco.vco-2-frequency",
              "text": "With HARD SYNC on, sweep VCO 2 FREQUENCY: the pitch stays locked while the timbre sweeps."
            },
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "vcf-eg-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "fm-1-to-2-amount-in"
              },
              "text": "Patch VCF EG into 1>2 FM AMT so FM depth rises and falls with every hit."
            }
          }
        }
      },
      {
        "id": "subharmonics",
        "title": "Subharmonic division",
        "intro": {
          "text": "Each SUB FREQ knob divides its parent oscillator's frequency by a whole number from 1 to 16.",
          "listenFor": "lower tones drawn from the undertone series, not from a normal scale."
        },
        "confidence": "spec-derived",
        "related": [
          "mixer-levels",
          "pitch",
          "step-sequencing"
        ],
        "controls": [
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc1.sub-1-freq-vco-1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc1.sub-2-freq-vco-1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc2.sub-1-freq-vco-2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "osc2.sub-2-freq-vco-2"
          }
        ],
        "jacks": [
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-sub-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-sub-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-sub-1-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-1-sub-2-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-sub-1-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vco-2-sub-2-out"
          }
        ],
        "ladder": {
          "subharmonicon": {
            "contrast": {
              "targetId": "mixer.sub-1-level-vco-1",
              "text": "Raise SUB 1 LEVEL (VCO 1) alone so you hear just the divided tone, then change the divisor."
            },
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "seq-2-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "vco-1-sub-in"
              },
              "text": "Patch SEQ 2 into VCO 1 SUB so the sequence moves the subharmonic divisors."
            }
          }
        }
      },
      {
        "id": "vco-modulation",
        "title": "Built-in VCO modulation",
        "intro": {
          "text": "VCO MOD picks a source (LFO or EG), an amount, and a destination (pulse width or frequency) without any cables.",
          "listenFor": "vibrato or a pitch sweep on FREQ, or a shifting hollow tone on PWM."
        },
        "confidence": "general-synthesis",
        "related": [
          "mother32-lfo-modulation",
          "waveform",
          "amp-envelope"
        ],
        "controls": [
          {
            "instrumentId": "mother32",
            "targetId": "vco.vco-mod-source"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vco.vco-mod-amount"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vco.vco-mod-destination"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "vco-mod-in"
          }
        ],
        "ladder": {
          "mother32": {
            "contrast": {
              "targetId": "vco.vco-mod-destination",
              "text": "Keep the same VCO MOD AMOUNT and flip DESTINATION between PWM and FREQ."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "vco-saw-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vco-mod-in"
              },
              "text": "Patching VCO MOD replaces the internal source. Try VCO SAW into VCO MOD with a small amount for audio-rate grit."
            }
          }
        }
      },
      {
        "id": "mother32-lfo-modulation",
        "title": "The rack's LFO",
        "intro": {
          "text": "The Mother-32 LFO is the only LFO in this rack; its outputs can slowly move controls on any of the three instruments.",
          "listenFor": "a repeating rise and fall at the LFO RATE."
        },
        "confidence": "general-synthesis",
        "related": [
          "vco-modulation",
          "filter-modulation",
          "filter-cutoff"
        ],
        "controls": [
          {
            "instrumentId": "mother32",
            "targetId": "lfo.lfo-rate"
          },
          {
            "instrumentId": "mother32",
            "targetId": "lfo.lfo-wave"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "lfo-rate-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "lfo-square-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "lfo-triangle-out"
          }
        ],
        "ladder": {
          "mother32": {
            "contrast": {
              "targetId": "lfo.lfo-wave",
              "text": "Switch LFO WAVE: triangle glides smoothly, square jumps between two states."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vcf-mod-in"
              },
              "text": "Send LFO TRI to DFAM VCF MOD and raise NOISE / VCF MOD to sweep the drum filter."
            }
          }
        }
      },
      {
        "id": "mixer-levels",
        "title": "Mixer levels",
        "intro": {
          "text": "Mixer levels set how much of each source reaches the filter, and so how hard the filter is driven.",
          "listenFor": "the balance between sources, and grit as the total level rises."
        },
        "confidence": "general-synthesis",
        "related": [
          "subharmonics",
          "filter-cutoff",
          "output-level"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "mixer.vco-1-level"
          },
          {
            "instrumentId": "dfam",
            "targetId": "mixer.noise-ext-level"
          },
          {
            "instrumentId": "dfam",
            "targetId": "mixer.vco-2-level"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.vco-1-level"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.sub-1-level-vco-1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.sub-2-level-vco-1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.vco-2-level"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.sub-1-level-vco-2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "mixer.sub-2-level-vco-2"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "ext-audio-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "noise-level-in"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "mixer.noise-ext-level",
              "text": "Bring in NOISE / EXT LEVEL under the oscillators for a snare-like wash."
            },
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "velocity-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "noise-level-in"
              },
              "text": "Patch VELOCITY into NOISE LEVEL so each step's velocity knob also sets how much noise it gets."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "mixer.sub-1-level-vco-2",
              "text": "Mute everything except one oscillator and one sub, then fade the second voice in."
            }
          }
        }
      },
      {
        "id": "mother32-source-balance",
        "title": "VCO and noise balance",
        "intro": {
          "text": "MIX crossfades between the oscillator and the noise or external input before the filter.",
          "listenFor": "the tone thinning into noise, or an external signal taking over."
        },
        "confidence": "general-synthesis",
        "related": [
          "mixer-levels",
          "utilities"
        ],
        "controls": [
          {
            "instrumentId": "mother32",
            "targetId": "mixer.mix"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "ext-audio-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "mix-cv-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "noise-out"
          }
        ],
        "ladder": {
          "mother32": {
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "eg-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "mix-cv-in"
              },
              "text": "Patch EG into MIX CV so each note starts on one source and moves toward the other."
            }
          }
        }
      },
      {
        "id": "filter-cutoff",
        "title": "Filter cutoff",
        "intro": {
          "text": "CUTOFF sets where the ladder filter starts removing high frequencies.",
          "listenFor": "the sound getting darker or brighter."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-resonance",
          "filter-modulation",
          "filter-envelope"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vcf.cutoff"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.cutoff"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vcf.cutoff"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "vcf-cutoff-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vcf-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "cutoff-in"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vcf.resonance",
              "text": "Raise RESONANCE, then sweep CUTOFF again: the corner starts to ring."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vcf-mod-in"
              },
              "text": "You're sweeping the filter by hand. Patch Mother-32 LFO TRI into DFAM VCF MOD and raise NOISE / VCF MOD to let it move on its own."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "vcf.resonance",
              "text": "Raise RESONANCE, then sweep CUTOFF again: the corner starts to ring."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vcf-cutoff-in"
              },
              "text": "You're sweeping the filter by hand. Patch LFO TRI into VCF CUTOFF and set LFO RATE to let it move on its own."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "vcf.resonance",
              "text": "Raise RESONANCE, then sweep CUTOFF again: the corner starts to ring."
            },
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "seq-2-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "cutoff-in"
              },
              "text": "You're sweeping the filter by hand. Patch SEQ 2 into CUTOFF so the sequence steps the filter for you."
            }
          }
        }
      },
      {
        "id": "filter-resonance",
        "title": "Filter resonance",
        "intro": {
          "text": "RESONANCE emphasizes frequencies near the cutoff; high settings ring and can self-oscillate.",
          "listenFor": "a whistling peak that follows the cutoff."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-cutoff"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vcf.resonance"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.resonance"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vcf.resonance"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "vcf-res-in"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "Leave RESONANCE high and move CUTOFF slowly to hear the ringing peak travel."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "Leave RESONANCE high and move CUTOFF slowly to hear the ringing peak travel."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "eg-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vcf-res-in"
              },
              "text": "Patch EG into VCF RES so each note rings harder at its start."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "Leave RESONANCE high and move CUTOFF slowly to hear the ringing peak travel."
            }
          }
        }
      },
      {
        "id": "filter-mode",
        "title": "Low-pass and high-pass",
        "intro": {
          "text": "LP keeps the lows and removes highs above the cutoff; HP keeps the highs and removes the lows.",
          "listenFor": "the body of the sound disappearing in HP, leaving the click and fizz."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-cutoff"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vcf.vcf-mode"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.vcf-mode"
          }
        ],
        "jacks": [],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "In HP mode, sweep CUTOFF: now turning it up removes more of the sound."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "vcf.cutoff",
              "text": "In HP mode, sweep CUTOFF: now turning it up removes more of the sound."
            }
          }
        }
      },
      {
        "id": "filter-envelope",
        "title": "Filter envelope",
        "intro": {
          "text": "The filter envelope opens the cutoff on each hit and closes it over the decay; its amount sets how far.",
          "listenFor": "a bright attack that darkens over the note."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-cutoff",
          "amp-envelope",
          "subharmonicon-filter-envelope"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vcf.vcf-decay"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vcf.vcf-eg-amount"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vcf-decay-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vcf-eg-out"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vca.vca-decay",
              "text": "Compare VCF DECAY with VCA DECAY: one shapes brightness over time, the other loudness."
            },
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "velocity-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vcf-decay-in"
              },
              "text": "Patch VELOCITY into VCF DECAY so each step's velocity knob also sets how long its filter stays open."
            }
          }
        }
      },
      {
        "id": "subharmonicon-filter-envelope",
        "title": "Subharmonicon filter envelope",
        "intro": {
          "text": "VCF ATTACK and VCF DECAY shape how the filter opens and closes on each triggered step; VCF EG AMT sets how far it moves.",
          "listenFor": "a softer swell or a sharper pluck on each step."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-envelope",
          "subharmonicon-eg-mode",
          "amp-envelope"
        ],
        "controls": [
          {
            "instrumentId": "subharmonicon",
            "targetId": "vcf.vcf-attack"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vcf.vcf-decay"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vcf.vcf-eg-amt"
          }
        ],
        "jacks": [
          {
            "instrumentId": "subharmonicon",
            "jackId": "vcf-eg-out"
          }
        ],
        "ladder": {
          "subharmonicon": {
            "contrast": {
              "targetId": "vca.vca-attack",
              "text": "Match VCA ATTACK to VCF ATTACK, then pull them apart to hear the filter open after the note starts."
            },
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "vcf-eg-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vcf-cutoff-in"
              },
              "text": "Patch the Subharmonicon's VCF EG into Mother-32 VCF CUTOFF so both filters move together."
            }
          }
        }
      },
      {
        "id": "filter-modulation",
        "title": "Filter modulation",
        "intro": {
          "text": "Filter modulation adds a moving control signal to the cutoff; its amount (and polarity on Mother-32) sets depth and direction.",
          "listenFor": "the filter moving on its own at the modulation source's pace."
        },
        "confidence": "general-synthesis",
        "related": [
          "filter-cutoff",
          "mother32-lfo-modulation"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vcf.noise-vcf-mod"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.vcf-mod-source"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.vcf-mod-amount"
          },
          {
            "instrumentId": "mother32",
            "targetId": "vcf.vcf-mod-polarity"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vcf-mod-in"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vcf-mod-in"
              },
              "text": "Patching VCF MOD replaces the noise as the filter's modulation source. Try Mother-32 LFO TRI there."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "vcf.vcf-mod-polarity",
              "text": "Flip VCF MOD POLARITY at the same amount: the envelope or LFO now closes the filter instead of opening it."
            }
          }
        }
      },
      {
        "id": "dfam-pitch-envelope",
        "title": "DFAM pitch envelope",
        "intro": {
          "text": "VCO DECAY sets how fast each hit's pitch drop falls back; the EG AMOUNT knobs set how far each oscillator jumps.",
          "listenFor": "a click, a tom-like drop, or a laser sweep."
        },
        "confidence": "general-synthesis",
        "related": [
          "pitch",
          "amp-envelope",
          "dfam-velocity-envelopes"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-decay"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-1-eg-amount"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vco.vco-2-eg-amount"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vco-decay-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vco-eg-out"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "vco-eg-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vco-1v-oct-in"
              },
              "text": "Borrow the drum's pitch drop: patch DFAM VCO EG into Mother-32 VCO 1V/OCT."
            }
          }
        }
      },
      {
        "id": "amp-envelope",
        "title": "Amplitude envelope",
        "intro": {
          "text": "The amplitude envelope shapes each note's loudness from start to finish.",
          "listenFor": "a sharp or soft start and a short or long tail."
        },
        "confidence": "general-synthesis",
        "related": [
          "output-level",
          "filter-envelope",
          "keyboard-glide"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vca.vca-eg"
          },
          {
            "instrumentId": "dfam",
            "targetId": "vca.vca-decay"
          },
          {
            "instrumentId": "mother32",
            "targetId": "eg.attack"
          },
          {
            "instrumentId": "mother32",
            "targetId": "eg.decay"
          },
          {
            "instrumentId": "mother32",
            "targetId": "eg.sustain"
          },
          {
            "instrumentId": "mother32",
            "targetId": "eg.vca-mode"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vca.vca-attack"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vca.vca-decay"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vca-cv-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vca-decay-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "vca-eg-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vca-cv-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "gate-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "eg-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vca-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vca-eg-out"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vca.vca-eg",
              "text": "Toggle VCA EG between FAST and SLOW and listen to the start of each hit."
            }
          },
          "mother32": {
            "contrast": {
              "targetId": "eg.sustain",
              "text": "Turn SUSTAIN on and hold a pad: the note now stays open until you let go."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "vca.vca-attack",
              "text": "Raise VCA ATTACK so each step swells in instead of plucking."
            }
          }
        }
      },
      {
        "id": "output-level",
        "title": "Output level",
        "intro": {
          "text": "VOLUME sets how loud this instrument is in the rack mix.",
          "listenFor": "this instrument's share of the mix."
        },
        "confidence": "general-synthesis",
        "related": [
          "mixer-levels",
          "amp-envelope"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vca.volume"
          },
          {
            "instrumentId": "mother32",
            "targetId": "out.volume"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "vca.volume"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "vca-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vca-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "vca-out"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "vca-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "ext-audio-in"
              },
              "text": "Run DFAM VCA into Mother-32 EXT AUDIO and raise MIX toward external to filter the drums through a second ladder filter."
            }
          },
          "subharmonicon": {
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "vca-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "ext-audio-in"
              },
              "text": "Run Subharmonicon VCA into Mother-32 EXT AUDIO and raise MIX toward external to layer it through a second ladder filter."
            }
          }
        }
      },
      {
        "id": "dfam-velocity-envelopes",
        "title": "Step velocity",
        "intro": {
          "text": "Each step's velocity knob scales how strongly that step's envelopes fire.",
          "listenFor": "accents and ghost notes appearing in the pattern."
        },
        "confidence": "general-synthesis",
        "related": [
          "step-sequencing",
          "amp-envelope",
          "dfam-pitch-envelope"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[0]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[1]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[2]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[3]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[4]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[5]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[6]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[7]"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "velocity-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "velocity-out"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "velocity-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vcf-cutoff-in"
              },
              "text": "Patch DFAM VELOCITY into Mother-32 VCF CUTOFF so the drum accents also brighten the synth."
            }
          }
        }
      },
      {
        "id": "step-sequencing",
        "title": "Step sequencing",
        "intro": {
          "text": "Step knobs store a value per step; the sequencer plays them back in order each time it advances.",
          "listenFor": "the change arriving only when the sequencer reaches that step."
        },
        "confidence": "general-synthesis",
        "related": [
          "clock-tempo",
          "transport",
          "dfam-velocity-envelopes"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "vco.seq-pitch-mod"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[0]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[1]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[2]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[3]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[4]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[5]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[6]"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.pitch[7]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.pattern-bank"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.reset-accent"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.hold-rest"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.swing"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.step[0]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.step[1]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.step[2]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.step[3]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.step[0]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.step[1]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.step[2]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.step[3]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.assign.vco1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.assign.sub1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq1.assign.sub2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.assign.vco2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.assign.sub1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq2.assign.sub2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.seq-oct"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "seq.quantize"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "pitch-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "reset-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "hold-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "seq-1-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "seq-2-out"
          }
        ],
        "ladder": {
          "dfam": {
            "contrast": {
              "targetId": "vco.seq-pitch-mod",
              "text": "Switch SEQ PITCH MOD between VCO 1&2, OFF, and VCO 2 to choose which oscillators follow the pitch knobs."
            },
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "pitch-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vco-1v-oct-in"
              },
              "text": "Patch DFAM PITCH into Mother-32 VCO 1V/OCT so the drum pattern also plays the synth's notes."
            }
          },
          "subharmonicon": {
            "contrast": {
              "targetId": "seq.quantize",
              "text": "Change QUANTIZE to snap the step knobs to a scale, or turn it off for free tuning."
            },
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "seq-1-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vco-1-cv-in"
              },
              "text": "Patch SEQ 1 into DFAM VCO 1 CV so the Subharmonicon's sequence tunes the drum."
            }
          }
        }
      },
      {
        "id": "clock-tempo",
        "title": "Clock and tempo",
        "intro": {
          "text": "TEMPO sets how often the sequencer advances; clock outputs and inputs let one instrument lead the others.",
          "listenFor": "the pattern speeding up or slowing down."
        },
        "confidence": "general-synthesis",
        "related": [
          "transport",
          "step-sequencing",
          "subharmonicon-repeat-horizon"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "seq.tempo"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.advance"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.tempo-gate-length"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.tempo"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "tempo-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "advance-clock-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "assign-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "tempo-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "seq-1-clock-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "seq-2-clock-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "clock-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "clock-out"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "assign-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "advance-clock-in"
              },
              "text": "Lock the tempos: patch Mother-32 ASSIGN (Sequencer Clock) into DFAM ADV / CLOCK."
            }
          },
          "mother32": {
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "assign-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "clock-in"
              },
              "text": "Let Mother-32 lead: patch ASSIGN (Sequencer Clock) into Subharmonicon CLOCK."
            }
          },
          "subharmonicon": {
            "automate": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "clock-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "advance-clock-in"
              },
              "text": "Let the Subharmonicon lead: patch its CLOCK out into DFAM ADV / CLOCK."
            }
          }
        }
      },
      {
        "id": "transport",
        "title": "Transport and triggers",
        "intro": {
          "text": "Run, play, and trigger controls start the sequence or fire a single event; their jacks let another instrument do the same.",
          "listenFor": "the pattern starting, stopping, or a single hit."
        },
        "confidence": "general-synthesis",
        "related": [
          "clock-tempo",
          "step-sequencing"
        ],
        "controls": [
          {
            "instrumentId": "dfam",
            "targetId": "seq.run-stop"
          },
          {
            "instrumentId": "dfam",
            "targetId": "seq.trigger"
          },
          {
            "instrumentId": "mother32",
            "targetId": "seq.run-stop-rec"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "transport.play"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "transport.trigger"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "transport.reset"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "transport.next"
          }
        ],
        "jacks": [
          {
            "instrumentId": "dfam",
            "jackId": "trigger-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "run-stop-in"
          },
          {
            "instrumentId": "dfam",
            "jackId": "trigger-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "run-stop-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "play-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "reset-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "trigger-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "trigger-out"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "midi-in"
          }
        ],
        "ladder": {
          "dfam": {
            "automate": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "trigger-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "gate-in"
              },
              "text": "Patch DFAM TRIGGER into Mother-32 GATE so every drum step also plays the synth."
            }
          }
        }
      },
      {
        "id": "subharmonicon-repeat-horizon",
        "title": "Polyrhythm",
        "intro": {
          "text": "Each RHYTHM knob divides the tempo; the assign buttons choose which sequencer each rhythm advances.",
          "listenFor": "two sequences drifting apart and meeting again."
        },
        "confidence": "general-synthesis",
        "related": [
          "clock-tempo",
          "step-sequencing"
        ],
        "controls": [
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[0]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[1]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[2]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[3]"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[0].assign.seq1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[0].assign.seq2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[1].assign.seq1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[1].assign.seq2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[2].assign.seq1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[2].assign.seq2"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[3].assign.seq1"
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[3].assign.seq2"
          }
        ],
        "jacks": [
          {
            "instrumentId": "subharmonicon",
            "jackId": "rhythm-1-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "rhythm-2-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "rhythm-3-in"
          },
          {
            "instrumentId": "subharmonicon",
            "jackId": "rhythm-4-in"
          }
        ],
        "ladder": {
          "subharmonicon": {
            "contrast": {
              "targetId": "rhythm.generator[1].assign.seq2",
              "text": "Send RHYTHM 2 to SEQ 2 with a different divider, and watch the repeat readout grow."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "rhythm-1-in"
              },
              "text": "Patch Mother-32 LFO TRI into RHYTHM 1 so its divider keeps shifting."
            }
          }
        }
      },
      {
        "id": "subharmonicon-eg-mode",
        "title": "Envelope mode",
        "intro": {
          "text": "EG decides whether sequencer steps trigger the envelopes (ON), hold them open (HELD), or leave them untriggered (OFF).",
          "listenFor": "separate plucks on ON, a continuous drone on HELD."
        },
        "confidence": "spec-derived",
        "related": [
          "subharmonicon-filter-envelope",
          "amp-envelope",
          "transport"
        ],
        "controls": [
          {
            "instrumentId": "subharmonicon",
            "targetId": "transport.eg"
          }
        ],
        "jacks": [],
        "ladder": {
          "subharmonicon": {
            "contrast": {
              "targetId": "vca.vca-decay",
              "text": "With EG ON, lengthen VCA DECAY until the steps start to overlap."
            }
          }
        }
      },
      {
        "id": "keyboard-glide",
        "title": "Keyboard and glide",
        "intro": {
          "text": "Pads play notes into the VCO and KB OUT; GLIDE slides the pitch from one note to the next.",
          "listenFor": "notes jumping at zero GLIDE, sliding as it rises."
        },
        "confidence": "general-synthesis",
        "related": [
          "pitch",
          "amp-envelope"
        ],
        "controls": [
          {
            "instrumentId": "mother32",
            "targetId": "kb.glide"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[0]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[1]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[2]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[3]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[4]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[5]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[6]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[7]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[8]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[9]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[10]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[11]"
          },
          {
            "instrumentId": "mother32",
            "targetId": "kb.pad[12]"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "kb-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "gate-out"
          }
        ],
        "ladder": {
          "mother32": {
            "contrast": {
              "targetId": "eg.sustain",
              "text": "Turn SUSTAIN on so held pads stay open while GLIDE slides between them."
            },
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "kb-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "vco-1-in"
              },
              "text": "Patch KB OUT into Subharmonicon VCO 1 so the pads also play its oscillators and their subharmonics."
            }
          }
        }
      },
      {
        "id": "utilities",
        "title": "Mixer and mult utilities",
        "intro": {
          "text": "VC MIX crossfades MIX 1 and MIX 2 under voltage control (unpatched, they supply 0 V and +5 V); MULT copies one signal to two outputs.",
          "listenFor": "nothing by itself: utilities route and shape other signals."
        },
        "confidence": "spec-derived",
        "related": [
          "mother32-source-balance",
          "mother32-lfo-modulation"
        ],
        "controls": [
          {
            "instrumentId": "mother32",
            "targetId": "util.vc-mix"
          }
        ],
        "jacks": [
          {
            "instrumentId": "mother32",
            "jackId": "mix-1-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "mix-2-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vc-mix-ctrl-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "vc-mix-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "mult-in"
          },
          {
            "instrumentId": "mother32",
            "jackId": "mult-1-out"
          },
          {
            "instrumentId": "mother32",
            "jackId": "mult-2-out"
          }
        ],
        "ladder": {
          "mother32": {
            "automate": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "mult-in"
              },
              "text": "Patch LFO TRI into MULT to send the same LFO to two destinations at once."
            }
          }
        }
      }
    ],
    "openEnds": [
      {
        "id": "dfam-vcf-mod-depth",
        "jack": {
          "instrumentId": "dfam",
          "jackId": "vcf-mod-in"
        },
        "control": {
          "instrumentId": "dfam",
          "targetId": "vcf.noise-vcf-mod"
        },
        "when": {
          "atMost": 0.001
        },
        "title": "Modulation depth is zero",
        "text": "VCF MOD is patched, but NOISE / VCF MOD is at zero, so the signal can't move the filter. Raise NOISE / VCF MOD."
      },
      {
        "id": "mother32-vco-mod-depth",
        "jack": {
          "instrumentId": "mother32",
          "jackId": "vco-mod-in"
        },
        "control": {
          "instrumentId": "mother32",
          "targetId": "vco.vco-mod-amount"
        },
        "when": {
          "atMost": 0.001
        },
        "title": "Modulation depth is zero",
        "text": "VCO MOD is patched, but VCO MOD AMOUNT is at zero, so it has no effect yet. Raise VCO MOD AMOUNT."
      },
      {
        "id": "mother32-vcf-mod-depth",
        "jack": {
          "instrumentId": "mother32",
          "jackId": "vcf-cutoff-in"
        },
        "control": {
          "instrumentId": "mother32",
          "targetId": "vcf.cutoff"
        },
        "when": {
          "atLeast": 0.999
        },
        "title": "The filter is already fully open",
        "text": "VCF CUTOFF is patched, but CUTOFF is all the way up, so a positive signal has no room to open it further. Lower CUTOFF."
      },
      {
        "id": "subharmonicon-vco-1-pwm-waveform",
        "jack": {
          "instrumentId": "subharmonicon",
          "jackId": "vco-1-pwm-in"
        },
        "control": {
          "instrumentId": "subharmonicon",
          "targetId": "osc1.waveform-vco-1"
        },
        "when": {
          "atLeast": 0.75
        },
        "title": "PWM needs a square wave",
        "text": "VCO 1 PWM has no effect with WAVEFORM (VCO 1) on SAW. Choose SQUARE or the middle PWM position."
      },
      {
        "id": "subharmonicon-vco-2-pwm-waveform",
        "jack": {
          "instrumentId": "subharmonicon",
          "jackId": "vco-2-pwm-in"
        },
        "control": {
          "instrumentId": "subharmonicon",
          "targetId": "osc2.waveform-vco-2"
        },
        "when": {
          "atLeast": 0.75
        },
        "title": "PWM needs a square wave",
        "text": "VCO 2 PWM has no effect with WAVEFORM (VCO 2) on SAW. Choose SQUARE or the middle PWM position."
      }
    ]
  },
  "rackRecipes": {
    "schemaVersion": 1,
    "pageConvention": "pdf-1-based",
    "note": "Guided patches that connect all three instruments. Each recipe is the project's composition (confidence general-synthesis); individual steps cite the Moog page that establishes the jack behavior or procedure they rely on. Steps are checked against live rack state in order.",
    "recipes": [
      {
        "id": "rack-clock-mother32-leads",
        "title": "One clock for all three",
        "summary": "Mother-32 leads. Its MULT splits the ASSIGN clock to DFAM and the Subharmonicon.",
        "confidence": "general-synthesis",
        "rationale": "Mother-32 ASSIGN sends one clock pulse per step. The MULT copies that clock to both followers: DFAM advances one step per pulse, and the Subharmonicon replaces its internal clock with it.",
        "steps": [
          {
            "id": "assign-to-mult",
            "ifRemoved": "Without ASSIGN in the MULT, neither DFAM nor the Subharmonicon receives the Mother-32 clock.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "assign-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "mult-in"
              }
            },
            "panel": "ASSIGN → MULT",
            "text": "Patch Mother-32 ASSIGN into MULT. ASSIGN sends a clock, one pulse per sequencer step.",
            "evidence": {
              "file": "Mother_32_Users_Manual.pdf",
              "page": 53,
              "quote": "This outputs a 0 to +5V Clock signal at the internal clock tempo, one pulse per step."
            }
          },
          {
            "id": "mult-to-dfam",
            "ifRemoved": "DFAM no longer follows the Mother-32 clock.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-1-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "advance-clock-in"
              }
            },
            "panel": "MULT 1 → DFAM ADV/CLOCK",
            "text": "Patch MULT 1 into DFAM ADV / CLOCK. DFAM will advance one step per pulse and ignore its own TEMPO knob.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 29,
              "quote": "This input allows the DFAM to be synchronized to an external clock source such as another DFAM or a Mother-32."
            }
          },
          {
            "id": "mult-to-sub",
            "ifRemoved": "The Subharmonicon falls back to its own tempo.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-2-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "clock-in"
              }
            },
            "panel": "MULT 2 → SUB CLOCK",
            "text": "Patch MULT 2 into Subharmonicon CLOCK. The incoming clock replaces its internal tempo.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 36,
              "quote": "A clock signal received via this jack will override the internal clock setting."
            }
          },
          {
            "id": "sub-rhythm",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "rhythm.generator[0].assign.seq1",
              "rhythm.generator[0].assign.seq2",
              "rhythm.generator[1].assign.seq1",
              "rhythm.generator[1].assign.seq2",
              "rhythm.generator[2].assign.seq1",
              "rhythm.generator[2].assign.seq2",
              "rhythm.generator[3].assign.seq1",
              "rhythm.generator[3].assign.seq2"
            ],
            "atLeast": 0.5,
            "panel": "Assign a rhythm",
            "text": "On the Subharmonicon, assign a rhythm to a sequencer, for example RHYTHM 1 → SEQ 1. A sequencer only steps when a rhythm generator clocks it.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 25,
              "quote": "In order for a sequencer to play, it must receive clock information from at least one of the rhythm generators."
            }
          },
          {
            "id": "sub-eg",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "transport.eg"
            ],
            "atLeast": 0.25,
            "panel": "EG → ON",
            "text": "Press Subharmonicon EG until it reads ON so each step triggers its envelopes.",
            "confidence": "spec-derived"
          },
          {
            "id": "arm-dfam",
            "kind": "transport",
            "instrumentId": "dfam",
            "role": "follower",
            "panel": "Arm DFAM",
            "text": "Press DFAM RUN / STOP. It waits for the first clock instead of starting on its own.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 31,
              "quote": "Press RUN / STOP on your DFAM. This will ensure that it is ready to play when it begins receiving a Clock signal from the Mother-32."
            }
          },
          {
            "id": "arm-sub",
            "kind": "transport",
            "instrumentId": "subharmonicon",
            "role": "follower",
            "panel": "Arm Subharmonicon",
            "text": "Press Subharmonicon PLAY. It also waits for the Mother-32 clock."
          },
          {
            "id": "start-mother32",
            "kind": "transport",
            "instrumentId": "mother32",
            "role": "leader",
            "panel": "Start Mother-32 last",
            "text": "Press Mother-32 RUN/STOP last. All three now step together.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 31,
              "quote": "Press RUN / STOP on the Mother-32. Both units should now be playing in sync."
            }
          }
        ],
        "buildOn": [
          {
            "id": "dfam-polyrhythm",
            "title": "Put DFAM in polyrhythm",
            "replaces": [
              "mult-to-dfam"
            ],
            "cables": [
              {
                "from": {
                  "instrumentId": "subharmonicon",
                  "jackId": "seq-1-clock-out"
                },
                "to": {
                  "instrumentId": "dfam",
                  "jackId": "advance-clock-in"
                }
              }
            ],
            "text": "Keep Mother-32 leading the Subharmonicon, but clock DFAM from Subharmonicon SEQ 1 CLK: remove MULT 1 → DFAM ADV / CLOCK, then patch SEQ 1 CLK → DFAM ADV / CLOCK.",
            "result": "DFAM now steps at sequencer 1's divided rate while the Subharmonicon still follows Mother-32.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 37,
              "quote": "clock DFAM by using the Subharmonicon TRIGGER output, or the SEQ 1 CLK and SEQ 2 CLK outputs to clock DFAM with a polyrhythm."
            }
          },
          {
            "id": "lfo-on-drums",
            "title": "Sweep DFAM's filter with the LFO",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "lfo-triangle-out"
                },
                "to": {
                  "instrumentId": "dfam",
                  "jackId": "vcf-mod-in"
                }
              }
            ],
            "text": "The MULT is carrying the clock, so patch Mother-32 LFO TRI straight into DFAM VCF MOD, then raise NOISE / VCF MOD to set the depth.",
            "result": "DFAM's filter now moves with the LFO while the clock pathway keeps running.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 27,
              "quote": "Plugging a control voltage into this jack replaces the Noise Generator"
            }
          },
          {
            "id": "drums-open-synth-filter",
            "title": "Drum hits open Mother-32's filter",
            "cables": [
              {
                "from": {
                  "instrumentId": "dfam",
                  "jackId": "vcf-eg-out"
                },
                "to": {
                  "instrumentId": "mother32",
                  "jackId": "vcf-cutoff-in"
                }
              }
            ],
            "text": "Patch DFAM VCF EG into Mother-32 VCF CUTOFF, then lower Mother-32 CUTOFF so each hit has room to open it.",
            "result": "Every DFAM hit now opens Mother-32's filter, locked to the same clock.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 26,
              "quote": "This output provides a copy of the control voltage used to modulate the VCF internally."
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "mother32",
            "targetId": "seq.tempo-gate-length",
            "text": "Turn Mother-32 TEMPO: DFAM and the Subharmonicon follow it."
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[0]",
            "text": "Change RHYTHM 1 to divide the shared clock differently on the Subharmonicon."
          }
        ]
      },
      {
        "id": "rack-clock-subharmonicon-polyrhythm",
        "title": "Subharmonicon polyrhythm leads",
        "summary": "The Subharmonicon's two sequencer clocks drive DFAM and Mother-32 at different rates.",
        "confidence": "general-synthesis",
        "rationale": "SEQ 1 CLK and SEQ 2 CLK each carry the clock of one Subharmonicon sequencer. Sending them to DFAM ADV / CLOCK and Mother-32 TEMPO makes the drums and the synth step in a cross-rhythm.",
        "steps": [
          {
            "id": "seq1-rhythm",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "rhythm.generator[0].assign.seq1",
              "rhythm.generator[1].assign.seq1",
              "rhythm.generator[2].assign.seq1",
              "rhythm.generator[3].assign.seq1"
            ],
            "atLeast": 0.5,
            "panel": "RHYTHM → SEQ 1",
            "text": "Assign a rhythm to SEQ 1, for example RHYTHM 1 → SEQ 1.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 25,
              "quote": "In order for a sequencer to play, it must receive clock information from at least one of the rhythm generators."
            }
          },
          {
            "id": "seq2-rhythm",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "rhythm.generator[1].assign.seq2",
              "rhythm.generator[0].assign.seq2",
              "rhythm.generator[2].assign.seq2",
              "rhythm.generator[3].assign.seq2"
            ],
            "atLeast": 0.5,
            "panel": "RHYTHM → SEQ 2",
            "text": "Assign a different rhythm to SEQ 2, for example RHYTHM 2 → SEQ 2, and give RHYTHM 2 another divider."
          },
          {
            "id": "seq1-clock-to-dfam",
            "ifRemoved": "DFAM no longer steps with Subharmonicon sequencer 1.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "seq-1-clock-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "advance-clock-in"
              }
            },
            "panel": "SEQ 1 CLK → DFAM ADV/CLOCK",
            "text": "Patch Subharmonicon SEQ 1 CLK into DFAM ADV / CLOCK. DFAM now steps with sequencer 1.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 37,
              "quote": "clock DFAM by using the Subharmonicon TRIGGER output, or the SEQ 1 CLK and SEQ 2 CLK outputs to clock DFAM with a polyrhythm."
            }
          },
          {
            "id": "seq2-clock-to-mother32",
            "ifRemoved": "Mother-32 no longer steps with Subharmonicon sequencer 2.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "subharmonicon",
                "jackId": "seq-2-clock-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "tempo-in"
              }
            },
            "panel": "SEQ 2 CLK → M-32 TEMPO",
            "text": "Patch SEQ 2 CLK into Mother-32 TEMPO. In its default mode, each pulse advances the Mother-32 pattern one step.",
            "evidence": {
              "file": "Mother_32_Users_Manual.pdf",
              "page": 56,
              "quote": "The pattern is advanced one step for each rising edge detected."
            }
          },
          {
            "id": "sub-eg",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "transport.eg"
            ],
            "atLeast": 0.25,
            "panel": "EG → ON",
            "text": "Press Subharmonicon EG until it reads ON so each step triggers its envelopes.",
            "confidence": "spec-derived"
          },
          {
            "id": "arm-dfam",
            "kind": "transport",
            "instrumentId": "dfam",
            "role": "follower",
            "panel": "Arm DFAM",
            "text": "Press DFAM RUN / STOP so it waits for the Subharmonicon clock.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 37,
              "quote": "press the RUN/STOP button on your DFAM. This will ensure that it is ready to play when it begins to receive the Subharmonicon clock signal."
            }
          },
          {
            "id": "arm-mother32",
            "kind": "transport",
            "instrumentId": "mother32",
            "role": "follower",
            "panel": "Arm Mother-32",
            "text": "Press Mother-32 RUN/STOP so it waits for the Subharmonicon clock too."
          },
          {
            "id": "start-sub",
            "kind": "transport",
            "instrumentId": "subharmonicon",
            "role": "leader",
            "panel": "PLAY last",
            "text": "Press Subharmonicon PLAY last. Its clocks only run while it is playing.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 36,
              "quote": "The clock signal is only present while the sequencer(s) are playing"
            }
          }
        ],
        "buildOn": [
          {
            "id": "sub-tunes-dfam",
            "title": "Subharmonicon sequence tunes DFAM",
            "cables": [
              {
                "from": {
                  "instrumentId": "subharmonicon",
                  "jackId": "seq-1-out"
                },
                "to": {
                  "instrumentId": "dfam",
                  "jackId": "vco-1-cv-in"
                }
              }
            ],
            "text": "Patch Subharmonicon SEQ 1 into DFAM VCO 1 CV. For steadier pitch, centre DFAM VCO 1 FREQUENCY and VCO 1 EG AMOUNT and set SEQ PITCH MOD to OFF.",
            "result": "DFAM's pitch now follows Subharmonicon sequencer 1, on the same polyrhythmic clock."
          },
          {
            "id": "lfo-on-sub-filter",
            "title": "LFO on the Subharmonicon filter",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "lfo-square-out"
                },
                "to": {
                  "instrumentId": "subharmonicon",
                  "jackId": "cutoff-in"
                }
              }
            ],
            "text": "Patch Mother-32 LFO SQ into Subharmonicon CUTOFF and set CUTOFF near the middle.",
            "result": "The Subharmonicon's filter now jumps between two settings while the polyrhythm keeps running.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 33,
              "quote": "With the CUTOFF knob centered, the signal received here can sweep the Cutoff Frequency through a range of up to ±5 octaves."
            }
          },
          {
            "id": "drums-open-synth-filter",
            "title": "Drum hits open Mother-32's filter",
            "cables": [
              {
                "from": {
                  "instrumentId": "dfam",
                  "jackId": "vcf-eg-out"
                },
                "to": {
                  "instrumentId": "mother32",
                  "jackId": "vcf-cutoff-in"
                }
              }
            ],
            "text": "Patch DFAM VCF EG into Mother-32 VCF CUTOFF, then lower Mother-32 CUTOFF so each hit has room to open it.",
            "result": "Every DFAM hit now opens Mother-32's filter, locked to the same clock.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 26,
              "quote": "This output provides a copy of the control voltage used to modulate the VCF internally."
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[0]",
            "text": "Change RHYTHM 1: if it only drives SEQ 1, DFAM's pace changes and Mother-32's does not."
          },
          {
            "instrumentId": "subharmonicon",
            "targetId": "rhythm.generator[1]",
            "text": "Change RHYTHM 2 to shift Mother-32 against DFAM."
          }
        ]
      },
      {
        "id": "rack-shared-lfo",
        "title": "One LFO moves the whole rack",
        "summary": "The Mother-32 LFO, split by its MULT, sweeps the DFAM and Subharmonicon filters.",
        "confidence": "general-synthesis",
        "rationale": "Neither DFAM nor the Subharmonicon has an LFO. Splitting Mother-32 LFO TRI with the MULT sends the same slow wave to both filters, so they move together.",
        "steps": [
          {
            "id": "lfo-to-mult",
            "ifRemoved": "The LFO no longer reaches DFAM or the Subharmonicon.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "lfo-triangle-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "mult-in"
              }
            },
            "panel": "LFO TRI → MULT",
            "text": "Patch Mother-32 LFO TRI into MULT so one LFO can feed two destinations.",
            "evidence": {
              "file": "Mother_32_Users_Manual.pdf",
              "page": 52,
              "quote": "Do not use the Mult to mix two signals together. It is designed to be used ONLY as a CV signal splitter."
            }
          },
          {
            "id": "mult-to-dfam-filter",
            "ifRemoved": "DFAM's filter no longer moves with the LFO, and noise returns as its filter modulation.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-1-out"
              },
              "to": {
                "instrumentId": "dfam",
                "jackId": "vcf-mod-in"
              }
            },
            "panel": "MULT 1 → DFAM VCF MOD",
            "text": "Patch MULT 1 into DFAM VCF MOD. The LFO replaces noise as DFAM's filter modulation.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 27,
              "quote": "Plugging a control voltage into this jack replaces the Noise Generator"
            }
          },
          {
            "id": "dfam-mod-depth",
            "kind": "setting",
            "instrumentId": "dfam",
            "targetIds": [
              "vcf.noise-vcf-mod"
            ],
            "atLeast": 0.3,
            "panel": "Raise NOISE / VCF MOD",
            "text": "Raise DFAM NOISE / VCF MOD. It sets how far the LFO can move DFAM's filter.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 27,
              "quote": "The maximum amount of modulation applied to the Filter will still be controlled by the NOISE / VCF MOD knob."
            }
          },
          {
            "id": "mult-to-sub-filter",
            "ifRemoved": "The Subharmonicon's filter no longer moves with the LFO.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-2-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "cutoff-in"
              }
            },
            "panel": "MULT 2 → SUB CUTOFF",
            "text": "Patch MULT 2 into Subharmonicon CUTOFF."
          },
          {
            "id": "sub-cutoff-centre",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "vcf.cutoff"
            ],
            "between": [
              0.35,
              0.65
            ],
            "panel": "Centre SUB CUTOFF",
            "text": "Set Subharmonicon CUTOFF near the middle so the LFO can sweep it both ways.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 33,
              "quote": "With the CUTOFF knob centered, the signal received here can sweep the Cutoff Frequency through a range of up to ±5 octaves."
            }
          },
          {
            "id": "slow-lfo",
            "kind": "setting",
            "instrumentId": "mother32",
            "targetIds": [
              "lfo.lfo-rate"
            ],
            "atMost": 0.45,
            "panel": "Slow LFO RATE",
            "text": "Turn Mother-32 LFO RATE down for a slow sweep you can follow."
          },
          {
            "id": "play-dfam",
            "kind": "transport",
            "instrumentId": "dfam",
            "role": "independent",
            "panel": "Start DFAM",
            "text": "Press DFAM RUN / STOP to hear the sweep on the drums."
          },
          {
            "id": "sub-rhythm",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "rhythm.generator[0].assign.seq1",
              "rhythm.generator[0].assign.seq2",
              "rhythm.generator[1].assign.seq1",
              "rhythm.generator[1].assign.seq2",
              "rhythm.generator[2].assign.seq1",
              "rhythm.generator[2].assign.seq2",
              "rhythm.generator[3].assign.seq1",
              "rhythm.generator[3].assign.seq2"
            ],
            "atLeast": 0.5,
            "panel": "Assign a rhythm",
            "text": "On the Subharmonicon, assign a rhythm to a sequencer, for example RHYTHM 1 → SEQ 1.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 25,
              "quote": "In order for a sequencer to play, it must receive clock information from at least one of the rhythm generators."
            }
          },
          {
            "id": "sub-eg",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "transport.eg"
            ],
            "atLeast": 0.25,
            "panel": "EG → ON",
            "text": "Press Subharmonicon EG until it reads ON so each step triggers its envelopes.",
            "confidence": "spec-derived"
          },
          {
            "id": "play-sub",
            "kind": "transport",
            "instrumentId": "subharmonicon",
            "role": "independent",
            "panel": "Start Subharmonicon",
            "text": "Press Subharmonicon PLAY to hear the sweep there too."
          }
        ],
        "buildOn": [
          {
            "id": "lock-dfam-clock",
            "title": "Clock DFAM from Mother-32",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "assign-out"
                },
                "to": {
                  "instrumentId": "dfam",
                  "jackId": "advance-clock-in"
                }
              }
            ],
            "text": "The MULT is carrying the LFO, so patch Mother-32 ASSIGN straight into DFAM ADV / CLOCK. Press DFAM RUN / STOP first, then start Mother-32.",
            "result": "DFAM now steps with Mother-32 while the shared LFO keeps sweeping.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 29,
              "quote": "This input allows the DFAM to be synchronized to an external clock source such as another DFAM or a Mother-32."
            }
          },
          {
            "id": "envelope-speeds-lfo",
            "title": "Envelope speeds up the LFO",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "eg-out"
                },
                "to": {
                  "instrumentId": "mother32",
                  "jackId": "lfo-rate-in"
                }
              }
            ],
            "text": "Patch Mother-32 EG into LFO RATE so each Mother-32 note briefly speeds up the sweep on both filters.",
            "result": "Both filters now sweep faster at the start of each Mother-32 note."
          },
          {
            "id": "sub-envelope-on-mother32",
            "title": "Subharmonicon envelope on Mother-32's filter",
            "cables": [
              {
                "from": {
                  "instrumentId": "subharmonicon",
                  "jackId": "vcf-eg-out"
                },
                "to": {
                  "instrumentId": "mother32",
                  "jackId": "vcf-cutoff-in"
                }
              }
            ],
            "text": "Patch Subharmonicon VCF EG into Mother-32 VCF CUTOFF, then lower Mother-32 CUTOFF.",
            "result": "Mother-32's filter now opens with every Subharmonicon step."
          }
        ],
        "tryNext": [
          {
            "instrumentId": "mother32",
            "targetId": "lfo.lfo-rate",
            "text": "Turn LFO RATE to change how quickly both filters sweep."
          },
          {
            "instrumentId": "dfam",
            "targetId": "vcf.noise-vcf-mod",
            "text": "Adjust NOISE / VCF MOD to balance how much the drums move."
          }
        ]
      },
      {
        "id": "rack-drum-accents",
        "title": "Drum hits shape the synths",
        "summary": "DFAM leads the clock, and its envelopes open the Mother-32 and Subharmonicon filters on every hit.",
        "confidence": "general-synthesis",
        "rationale": "DFAM TRIGGER is a clock derived from its sequencer, and its VCF EG and VCO EG outputs copy its internal envelopes. Patched into the other two, every drum step clocks them and opens their filters.",
        "steps": [
          {
            "id": "trigger-to-mult",
            "ifRemoved": "DFAM no longer clocks the Subharmonicon or Mother-32.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "trigger-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "mult-in"
              }
            },
            "panel": "DFAM TRIGGER → MULT",
            "text": "Patch DFAM TRIGGER into Mother-32 MULT. DFAM's step pulse becomes the rack clock.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 29,
              "quote": "This output provides a pulse derived from the Sequencer Clock that can be used as a clock source for synchronizing to other instruments"
            }
          },
          {
            "id": "mult-to-sub-clock",
            "ifRemoved": "The Subharmonicon falls back to its own tempo.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-1-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "clock-in"
              }
            },
            "panel": "MULT 1 → SUB CLOCK",
            "text": "Patch MULT 1 into Subharmonicon CLOCK.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 36,
              "quote": "A clock signal received via this jack will override the internal clock setting."
            }
          },
          {
            "id": "mult-to-mother32-tempo",
            "ifRemoved": "Mother-32 no longer steps with DFAM.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "mother32",
                "jackId": "mult-2-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "tempo-in"
              }
            },
            "panel": "MULT 2 → M-32 TEMPO",
            "text": "Patch MULT 2 into Mother-32 TEMPO so each DFAM step advances the Mother-32 pattern.",
            "evidence": {
              "file": "Mother_32_Users_Manual.pdf",
              "page": 56,
              "quote": "The pattern is advanced one step for each rising edge detected."
            }
          },
          {
            "id": "vcf-eg-to-mother32",
            "ifRemoved": "DFAM hits no longer open Mother-32's filter.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "vcf-eg-out"
              },
              "to": {
                "instrumentId": "mother32",
                "jackId": "vcf-cutoff-in"
              }
            },
            "panel": "DFAM VCF EG → M-32 CUTOFF",
            "text": "Patch DFAM VCF EG into Mother-32 VCF CUTOFF.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 26,
              "quote": "This output provides a copy of the control voltage used to modulate the VCF internally."
            }
          },
          {
            "id": "mother32-cutoff-room",
            "kind": "setting",
            "instrumentId": "mother32",
            "targetIds": [
              "vcf.cutoff"
            ],
            "atMost": 0.55,
            "panel": "Lower M-32 CUTOFF",
            "text": "Lower Mother-32 CUTOFF so each hit has room to open the filter.",
            "evidence": {
              "file": "Mother_32_Users_Manual.pdf",
              "page": 49,
              "quote": "This input is summed with the Filter CUTOFF knob and the VCF Modulation signal."
            }
          },
          {
            "id": "vco-eg-to-sub",
            "ifRemoved": "DFAM hits no longer open the Subharmonicon's filter.",
            "kind": "cable",
            "cable": {
              "from": {
                "instrumentId": "dfam",
                "jackId": "vco-eg-out"
              },
              "to": {
                "instrumentId": "subharmonicon",
                "jackId": "cutoff-in"
              }
            },
            "panel": "DFAM VCO EG → SUB CUTOFF",
            "text": "Patch DFAM VCO EG into Subharmonicon CUTOFF.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 27,
              "quote": "This output provides a copy of the control voltage used to modulate the VCOs internally."
            }
          },
          {
            "id": "sub-cutoff-room",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "vcf.cutoff"
            ],
            "atMost": 0.55,
            "panel": "Lower SUB CUTOFF",
            "text": "Lower Subharmonicon CUTOFF the same way."
          },
          {
            "id": "sub-rhythm",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "rhythm.generator[0].assign.seq1",
              "rhythm.generator[0].assign.seq2",
              "rhythm.generator[1].assign.seq1",
              "rhythm.generator[1].assign.seq2",
              "rhythm.generator[2].assign.seq1",
              "rhythm.generator[2].assign.seq2",
              "rhythm.generator[3].assign.seq1",
              "rhythm.generator[3].assign.seq2"
            ],
            "atLeast": 0.5,
            "panel": "Assign a rhythm",
            "text": "On the Subharmonicon, assign a rhythm to a sequencer, for example RHYTHM 1 → SEQ 1.",
            "evidence": {
              "file": "Subharmonicon_Manual AMZ.pdf",
              "page": 25,
              "quote": "In order for a sequencer to play, it must receive clock information from at least one of the rhythm generators."
            }
          },
          {
            "id": "sub-eg",
            "kind": "setting",
            "instrumentId": "subharmonicon",
            "targetIds": [
              "transport.eg"
            ],
            "atLeast": 0.25,
            "panel": "EG → ON",
            "text": "Press Subharmonicon EG until it reads ON so each step triggers its envelopes.",
            "confidence": "spec-derived"
          },
          {
            "id": "arm-sub",
            "kind": "transport",
            "instrumentId": "subharmonicon",
            "role": "follower",
            "panel": "Arm Subharmonicon",
            "text": "Press Subharmonicon PLAY so it waits for DFAM's clock."
          },
          {
            "id": "arm-mother32",
            "kind": "transport",
            "instrumentId": "mother32",
            "role": "follower",
            "panel": "Arm Mother-32",
            "text": "Press Mother-32 RUN/STOP so it waits for DFAM's clock."
          },
          {
            "id": "start-dfam",
            "kind": "transport",
            "instrumentId": "dfam",
            "role": "leader",
            "panel": "Start DFAM last",
            "text": "Press DFAM RUN / STOP last. Every drum step now clocks the other two and opens their filters."
          }
        ],
        "buildOn": [
          {
            "id": "dfam-pitch-plays-mother32",
            "title": "DFAM pitch plays Mother-32",
            "cables": [
              {
                "from": {
                  "instrumentId": "dfam",
                  "jackId": "pitch-out"
                },
                "to": {
                  "instrumentId": "mother32",
                  "jackId": "vco-1v-oct-in"
                }
              }
            ],
            "text": "Patch DFAM PITCH into Mother-32 VCO 1V/OCT so DFAM's pitch knobs also set Mother-32's notes.",
            "result": "Mother-32's notes now follow DFAM's pitch row, step for step."
          },
          {
            "id": "mother32-plays-sub",
            "title": "Mother-32 notes play the Subharmonicon",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "kb-out"
                },
                "to": {
                  "instrumentId": "subharmonicon",
                  "jackId": "vco-1-in"
                }
              }
            ],
            "text": "Patch Mother-32 KB OUT into Subharmonicon VCO 1. VCO 2 follows until VCO 2 IN is patched.",
            "result": "The Subharmonicon's oscillators now follow Mother-32's sequence, which DFAM clocks."
          },
          {
            "id": "lfo-on-drums",
            "title": "Sweep DFAM's filter with the LFO",
            "cables": [
              {
                "from": {
                  "instrumentId": "mother32",
                  "jackId": "lfo-triangle-out"
                },
                "to": {
                  "instrumentId": "dfam",
                  "jackId": "vcf-mod-in"
                }
              }
            ],
            "text": "Patch Mother-32 LFO TRI straight into DFAM VCF MOD, then raise NOISE / VCF MOD to set the depth.",
            "result": "DFAM's filter now moves with the LFO while the clock pathway keeps running.",
            "evidence": {
              "file": "DFAM_Manual.pdf",
              "page": 27,
              "quote": "Plugging a control voltage into this jack replaces the Noise Generator"
            }
          }
        ],
        "tryNext": [
          {
            "instrumentId": "dfam",
            "targetId": "seq.velocity[0]",
            "text": "Turn step VELOCITY knobs: louder drum steps open the other filters wider."
          },
          {
            "instrumentId": "dfam",
            "targetId": "vcf.vcf-decay",
            "text": "Lengthen DFAM VCF DECAY for longer swells on Mother-32."
          }
        ]
      }
    ]
  },
  "signalFlow": {
    "schemaVersion": 1,
    "note": "Internal connections (normals) that patching an input can replace, drawn by the hidden-wiring view. Each entry mirrors a jack's normalledFrom/replaces/normalCondition in the instrument spec; anchors only choose where on the faceplate the line starts. condition says when the internal connection exists; cableCondition says when a patched cable takes effect, which can differ (Subharmonicon PWM cables also work on SQUARE, manual PDF pp. 31-32). See docs/design/09-visible-signal-flow.md.",
    "normals": [
      {
        "id": "dfam-sequencer-clock-to-trigger",
        "instrumentId": "dfam",
        "to": "trigger-in",
        "kind": "normal",
        "from": {
          "control": "seq.tempo"
        },
        "label": "Sequencer clock",
        "summary": "the sequencer clock that fires the envelopes"
      },
      {
        "id": "dfam-velocity-knobs-to-velocity",
        "instrumentId": "dfam",
        "to": "velocity-in",
        "kind": "normal",
        "from": {
          "control": "seq.velocity[7]"
        },
        "label": "Velocity knobs",
        "summary": "the eight VELOCITY knobs that set envelope levels"
      },
      {
        "id": "dfam-noise-to-ext-audio",
        "instrumentId": "dfam",
        "to": "ext-audio-in",
        "kind": "replaces",
        "from": {
          "control": "mixer.noise-ext-level"
        },
        "label": "White noise",
        "summary": "the white noise in the mixer"
      },
      {
        "id": "dfam-noise-to-vcf-mod",
        "instrumentId": "dfam",
        "to": "vcf-mod-in",
        "kind": "replaces",
        "from": {
          "control": "vcf.noise-vcf-mod"
        },
        "label": "Noise → filter mod",
        "summary": "noise as the filter's modulation source"
      },
      {
        "id": "mother32-noise-to-ext-audio",
        "instrumentId": "mother32",
        "to": "ext-audio-in",
        "kind": "replaces",
        "from": {
          "jack": "noise-out"
        },
        "label": "White noise",
        "summary": "the white noise at the clockwise end of MIX"
      },
      {
        "id": "mother32-eg-to-vco-mod",
        "instrumentId": "mother32",
        "to": "vco-mod-in",
        "kind": "normal",
        "from": {
          "jack": "eg-out"
        },
        "label": "EG",
        "summary": "the envelope as the VCO modulation source",
        "condition": {
          "targetId": "vco.vco-mod-source",
          "atLeast": 0.5,
          "label": "VCO MOD SOURCE on EG"
        },
        "cableCondition": {
          "targetId": "vco.vco-mod-source",
          "atLeast": 0.5,
          "label": "VCO MOD SOURCE on EG"
        }
      },
      {
        "id": "mother32-zero-volts-to-mix-1",
        "instrumentId": "mother32",
        "to": "mix-1-in",
        "kind": "normal",
        "from": {
          "constant": "0 V"
        },
        "label": "0 V",
        "summary": "a fixed 0 V"
      },
      {
        "id": "mother32-five-volts-to-mix-2",
        "instrumentId": "mother32",
        "to": "mix-2-in",
        "kind": "normal",
        "from": {
          "constant": "+5 V"
        },
        "label": "+5 V",
        "summary": "a fixed +5 V"
      },
      {
        "id": "subharmonicon-vco-1-to-vco-2",
        "instrumentId": "subharmonicon",
        "to": "vco-2-in",
        "kind": "normal",
        "from": {
          "jack": "vco-1-in"
        },
        "label": "VCO 1 pitch CV",
        "summary": "the pitch CV patched into VCO 1"
      },
      {
        "id": "subharmonicon-sub-1-saw-to-vco-1-pwm",
        "instrumentId": "subharmonicon",
        "to": "vco-1-pwm-in",
        "kind": "normal",
        "from": {
          "control": "osc1.sub-1-freq-vco-1"
        },
        "label": "SUB 1 saw",
        "summary": "VCO 1's SUB 1 sawtooth as its PWM source",
        "condition": {
          "targetId": "osc1.waveform-vco-1",
          "between": [
            0.25,
            0.75
          ],
          "label": "WAVEFORM (VCO 1) on PWM"
        },
        "cableCondition": {
          "targetId": "osc1.waveform-vco-1",
          "atMost": 0.75,
          "label": "WAVEFORM (VCO 1) is on SQUARE or PWM"
        }
      },
      {
        "id": "subharmonicon-sub-1-saw-to-vco-2-pwm",
        "instrumentId": "subharmonicon",
        "to": "vco-2-pwm-in",
        "kind": "normal",
        "from": {
          "control": "osc2.sub-1-freq-vco-2"
        },
        "label": "SUB 1 saw",
        "summary": "VCO 2's SUB 1 sawtooth as its PWM source",
        "condition": {
          "targetId": "osc2.waveform-vco-2",
          "between": [
            0.25,
            0.75
          ],
          "label": "WAVEFORM (VCO 2) on PWM"
        },
        "cableCondition": {
          "targetId": "osc2.waveform-vco-2",
          "atMost": 0.75,
          "label": "WAVEFORM (VCO 2) is on SQUARE or PWM"
        }
      }
    ]
  },
  "audioRuntime": {
    "dfam": {
      "schemaVersion": 2,
      "parameterHash": "52cccafbfabfbf7d980c801dbec8e527fc0069c8e8bdb449b33d5016f0d1c28e",
      "patchInputIds": [
        "trigger-in",
        "vca-cv-in",
        "velocity-in",
        "vca-decay-in",
        "ext-audio-in",
        "vcf-decay-in",
        "noise-level-in",
        "vco-decay-in",
        "vcf-mod-in",
        "vco-1-cv-in",
        "fm-1-to-2-amount-in",
        "vco-2-cv-in",
        "tempo-in",
        "run-stop-in",
        "advance-clock-in"
      ],
      "patchOutputIds": [
        "vca-out",
        "vca-eg-out",
        "vcf-eg-out",
        "vco-eg-out",
        "vco-1-out",
        "vco-2-out",
        "trigger-out",
        "velocity-out",
        "pitch-out"
      ],
      "browserOutputGain": 0.1,
      "browserOutputGainStatus": "provisional-safety-limit",
      "unsupportedParameterIds": []
    },
    "mother32": {
      "schemaVersion": 2,
      "parameterHash": "85e788c85f4a86b94fd8399bd6889ec05e88ce3089e2e8e814a77982b3427b05",
      "patchInputIds": [
        "ext-audio-in",
        "mix-cv-in",
        "vca-cv-in",
        "vcf-cutoff-in",
        "vcf-res-in",
        "vco-1v-oct-in",
        "vco-lin-fm-in",
        "vco-mod-in",
        "lfo-rate-in",
        "mix-1-in",
        "mix-2-in",
        "vc-mix-ctrl-in",
        "mult-in",
        "gate-in",
        "tempo-in",
        "run-stop-in",
        "reset-in",
        "hold-in"
      ],
      "patchOutputIds": [
        "vca-out",
        "noise-out",
        "vcf-out",
        "vco-saw-out",
        "vco-pulse-out",
        "lfo-square-out",
        "lfo-triangle-out",
        "vc-mix-out",
        "mult-1-out",
        "mult-2-out",
        "assign-out",
        "eg-out",
        "kb-out",
        "gate-out"
      ],
      "browserOutputGain": 0.1,
      "browserOutputGainStatus": "provisional-safety-limit",
      "unsupportedParameterIds": [
        "seq.swing"
      ]
    },
    "subharmonicon": {
      "schemaVersion": 2,
      "parameterHash": "74447116358af606abd0835260acb7463cb4ac0d006a6e753a549cb696b04741",
      "patchInputIds": [
        "vco-1-in",
        "vco-1-sub-in",
        "vco-1-pwm-in",
        "vca-in",
        "vco-2-in",
        "vco-2-sub-in",
        "vco-2-pwm-in",
        "cutoff-in",
        "play-in",
        "reset-in",
        "trigger-in",
        "rhythm-1-in",
        "rhythm-2-in",
        "rhythm-3-in",
        "rhythm-4-in",
        "midi-in",
        "clock-in"
      ],
      "patchOutputIds": [
        "vca-out",
        "vco-1-out",
        "vco-1-sub-1-out",
        "vco-1-sub-2-out",
        "vca-eg-out",
        "vco-2-out",
        "vco-2-sub-1-out",
        "vco-2-sub-2-out",
        "vcf-eg-out",
        "seq-1-out",
        "seq-1-clock-out",
        "seq-2-out",
        "seq-2-clock-out",
        "clock-out",
        "trigger-out"
      ],
      "browserOutputGain": 0.1,
      "browserOutputGainStatus": "provisional-safety-limit",
      "unsupportedParameterIds": []
    }
  },
  "defaultState": {
    "formatVersion": 1,
    "schemaVersion": 2,
    "parameterTables": {
      "dfam": "52cccafbfabfbf7d980c801dbec8e527fc0069c8e8bdb449b33d5016f0d1c28e",
      "mother32": "85e788c85f4a86b94fd8399bd6889ec05e88ce3089e2e8e814a77982b3427b05",
      "subharmonicon": "74447116358af606abd0835260acb7463cb4ac0d006a6e753a549cb696b04741"
    },
    "instruments": {
      "dfam": {
        "enabled": true,
        "parameters": {
          "mixer.noise-ext-level": 0.5,
          "mixer.vco-1-level": 0.5,
          "mixer.vco-2-level": 0.5,
          "seq.advance": 0,
          "seq.pitch[0]": 0.5,
          "seq.pitch[1]": 0.5,
          "seq.pitch[2]": 0.5,
          "seq.pitch[3]": 0.5,
          "seq.pitch[4]": 0.5,
          "seq.pitch[5]": 0.5,
          "seq.pitch[6]": 0.5,
          "seq.pitch[7]": 0.5,
          "seq.run-stop": 0,
          "seq.tempo": 0.5,
          "seq.trigger": 0,
          "seq.velocity[0]": 0.5,
          "seq.velocity[1]": 0.5,
          "seq.velocity[2]": 0.5,
          "seq.velocity[3]": 0.5,
          "seq.velocity[4]": 0.5,
          "seq.velocity[5]": 0.5,
          "seq.velocity[6]": 0.5,
          "seq.velocity[7]": 0.5,
          "vca.vca-decay": 0.5,
          "vca.vca-eg": 0,
          "vca.volume": 0.5,
          "vcf.cutoff": 0.5,
          "vcf.noise-vcf-mod": 0.5,
          "vcf.resonance": 0,
          "vcf.vcf-decay": 0.5,
          "vcf.vcf-eg-amount": 0.5,
          "vcf.vcf-mode": 0,
          "vco.hard-sync": 0,
          "vco.seq-pitch-mod": 0,
          "vco.vco1-to-vco2-fm-amount": 0.5,
          "vco.vco-1-eg-amount": 0.5,
          "vco.vco-1-frequency": 0.5,
          "vco.vco-1-wave": 0,
          "vco.vco-2-eg-amount": 0.5,
          "vco.vco-2-frequency": 0.5,
          "vco.vco-2-wave": 0,
          "vco.vco-decay": 0.5
        }
      },
      "mother32": {
        "enabled": true,
        "parameters": {
          "eg.attack": 0,
          "eg.decay": 0.5,
          "eg.sustain": 0,
          "eg.vca-mode": 0,
          "kb.glide": 0,
          "kb.pad[0]": 0,
          "kb.pad[1]": 0,
          "kb.pad[2]": 0,
          "kb.pad[3]": 0,
          "kb.pad[4]": 0,
          "kb.pad[5]": 0,
          "kb.pad[6]": 0,
          "kb.pad[7]": 0,
          "kb.pad[8]": 0,
          "kb.pad[9]": 0,
          "kb.pad[10]": 0,
          "kb.pad[11]": 0,
          "kb.pad[12]": 0,
          "lfo.lfo-rate": 0.5,
          "lfo.lfo-wave": 0,
          "mixer.mix": 0.5,
          "out.volume": 0.5,
          "seq.hold-rest": 0,
          "seq.pattern-bank": 0,
          "seq.reset-accent": 0,
          "seq.run-stop-rec": 0,
          "seq.swing": 0,
          "seq.tempo-gate-length": 0.5,
          "util.vc-mix": 0.5,
          "vcf.cutoff": 0.5,
          "vcf.resonance": 0,
          "vcf.vcf-mod-amount": 0,
          "vcf.vcf-mod-polarity": 0,
          "vcf.vcf-mod-source": 0,
          "vcf.vcf-mode": 0,
          "vco.frequency": 0.5,
          "vco.pulse-width": 0.5,
          "vco.vco-mod-amount": 0,
          "vco.vco-mod-destination": 0,
          "vco.vco-mod-source": 0,
          "vco.vco-wave": 0
        },
        "patternBank": {
          "selected": 0,
          "patterns": {}
        }
      },
      "subharmonicon": {
        "enabled": true,
        "parameters": {
          "mixer.sub-1-level-vco-1": 0.5,
          "mixer.sub-1-level-vco-2": 0.5,
          "mixer.sub-2-level-vco-1": 0.5,
          "mixer.sub-2-level-vco-2": 0.5,
          "mixer.vco-1-level": 0.5,
          "mixer.vco-2-level": 0.5,
          "osc1.sub-1-freq-vco-1": 0,
          "osc1.sub-2-freq-vco-1": 0,
          "osc1.vco-1-freq": 0.5,
          "osc1.waveform-vco-1": 0,
          "osc2.sub-1-freq-vco-2": 0,
          "osc2.sub-2-freq-vco-2": 0,
          "osc2.vco-2-freq": 0.5,
          "osc2.waveform-vco-2": 0,
          "rhythm.generator[0]": 0.5,
          "rhythm.generator[0].assign.seq1": 0,
          "rhythm.generator[0].assign.seq2": 0,
          "rhythm.generator[1]": 0.5,
          "rhythm.generator[1].assign.seq1": 0,
          "rhythm.generator[1].assign.seq2": 0,
          "rhythm.generator[2]": 0.5,
          "rhythm.generator[2].assign.seq1": 0,
          "rhythm.generator[2].assign.seq2": 0,
          "rhythm.generator[3]": 0.5,
          "rhythm.generator[3].assign.seq1": 0,
          "rhythm.generator[3].assign.seq2": 0,
          "rhythm.tempo": 0.5,
          "seq.quantize": 0,
          "seq.seq1.assign.sub1": 0,
          "seq.seq1.assign.sub2": 0,
          "seq.seq1.assign.vco1": 0,
          "seq.seq1.step[0]": 0.5,
          "seq.seq1.step[1]": 0.5,
          "seq.seq1.step[2]": 0.5,
          "seq.seq1.step[3]": 0.5,
          "seq.seq2.assign.sub1": 0,
          "seq.seq2.assign.sub2": 0,
          "seq.seq2.assign.vco2": 0,
          "seq.seq2.step[0]": 0.5,
          "seq.seq2.step[1]": 0.5,
          "seq.seq2.step[2]": 0.5,
          "seq.seq2.step[3]": 0.5,
          "seq.seq-oct": 0,
          "transport.eg": 0,
          "transport.next": 0,
          "transport.play": 0,
          "transport.reset": 0,
          "transport.trigger": 0,
          "vca.vca-attack": 0,
          "vca.vca-decay": 0.5,
          "vca.volume": 0.5,
          "vcf.cutoff": 0.5,
          "vcf.resonance": 0,
          "vcf.vcf-attack": 0,
          "vcf.vcf-decay": 0.5,
          "vcf.vcf-eg-amt": 0.5
        }
      }
    },
    "patches": [],
    "ui": {
      "mode": "practice",
      "collapsedInstruments": [],
      "zoom": 1
    }
  }
};
