// Game Content Data Structure
// This file contains all the practice content organized by Reader Level and Macro Level  
// Content extracted from PDF files in src/assets/content/

export interface MacroLevelContent {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  words: ContentItem[];      // 100 items with 200 backup
  sentences: ContentItem[];  // 100 items with 200 backup  
  paragraphs: ContentItem[]; // 100 items with 200 backup
}

export interface ContentItem {
  id: string;
  content: string;
  difficulty: 1 | 2 | 3 | 4 | 5;  // Sub-difficulty within macro level
  points: number;
  keyWords?: string[];
  isBackup?: boolean;  // True for backup content (items 101-300)
}

export interface ReaderLevelData {
  readerLevel: 1 | 2 | 3 | 4;
  macroLevels: {
    macroLevel1: MacroLevelContent;
    macroLevel2: MacroLevelContent; 
    macroLevel3: MacroLevelContent;
    macroLevel4: MacroLevelContent;
  };
}

export interface GameProgress {
  currentReaderLevel: 1 | 2 | 3 | 4;
  currentMacroLevel: 1 | 2 | 3 | 4;
  currentSubLevel: number;        // 1-30 (10 words + 10 sentences + 10 paragraphs)
  completedContent: string[];     // Track used content IDs
  scores: {
    [contentId: string]: {
      phonemeAccuracy: number;    // 60% weight
      stressIntonation: number;   // 25% weight  
      vowelClarity: number;       // 15% weight
      totalScore: number;         // Weighted average
      attempts: number;
    };
  };
}

// Content extracted from PDF files
export const GAME_CONTENT: { [key: string]: ReaderLevelData } = {
  "readerLevel1": {
    "readerLevel": 1,
    "macroLevels": {
      "macroLevel1": {
        "level": 1,
        "name": "Macro Level 1",
        "description": "Reader Level 1, Macro Level 1 content",
        "words": [
          {
            "id": "r1_w001",
            "content": "foundational",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "foundational"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w001",
            "content": "area",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "area"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w002",
            "content": "environment",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "environment"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w003",
            "content": "process",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "process"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w004",
            "content": "factor",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "factor"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w005",
            "content": "source",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "source"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w006",
            "content": "occur",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "occur"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w007",
            "content": "issue",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "issue"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w008",
            "content": "volume",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "volume"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w009",
            "content": "acquire",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "acquire"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w010",
            "content": "phase",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "phase"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w011",
            "content": "status",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "status"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w012",
            "content": "establish",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "establish"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w013",
            "content": "create",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "create"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w014",
            "content": "concept",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "concept"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w015",
            "content": "involve",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "involve"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w016",
            "content": "require",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "require"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w017",
            "content": "estimate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "estimate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w018",
            "content": "section",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "section"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w019",
            "content": "valid",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "valid"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w020",
            "content": "data",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w021",
            "content": "evaluate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "evaluate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w022",
            "content": "hypothesis",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w023",
            "content": "formula",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "formula"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w024",
            "content": "method",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "method"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w025",
            "content": "derive",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "derive"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w026",
            "content": "coherent",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "coherent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w027",
            "content": "major",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "major"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w028",
            "content": "conclude",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "conclude"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w029",
            "content": "define",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "define"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w030",
            "content": "consistent",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "consistent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w031",
            "content": "approach",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "approach"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w032",
            "content": "capacity",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "capacity"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w033",
            "content": "constrain",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "constrain"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w034",
            "content": "exceed",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "exceed"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w035",
            "content": "instruct",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "instruct"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w036",
            "content": "predict",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "predict"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w037",
            "content": "arbitrary",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "arbitrary"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w038",
            "content": "minimal",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "minimal"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w039",
            "content": "priority",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "priority"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w040",
            "content": "construct",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "construct"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w041",
            "content": "structure",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "structure"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w042",
            "content": "sequence",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "sequence"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w043",
            "content": "regime",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "regime"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w044",
            "content": "trace",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "trace"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w045",
            "content": "shift",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "shift"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w046",
            "content": "sum",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "sum"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w047",
            "content": "modify",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "modify"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w048",
            "content": "symbol",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "symbol"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w049",
            "content": "principal",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "principal"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w050",
            "content": "summary",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "summary"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w051",
            "content": "principle",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "principle"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w052",
            "content": "ethical",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "ethical"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w053",
            "content": "initial",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "initial"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w054",
            "content": "ultimate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "ultimate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w055",
            "content": "stable",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "stable"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w056",
            "content": "specific",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "specific"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w057",
            "content": "total",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "total"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w058",
            "content": "objective",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "objective"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w059",
            "content": "consequence",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "consequence"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w060",
            "content": "affect",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "affect"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w061",
            "content": "component",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "component"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w062",
            "content": "dominate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "dominate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w063",
            "content": "extract",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "extract"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w064",
            "content": "transmit",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "transmit"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w065",
            "content": "negate",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "negate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w066",
            "content": "perceive",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "perceive"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w067",
            "content": "intend",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "intend"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w068",
            "content": "justify",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "justify"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w069",
            "content": "attitude",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "attitude"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w070",
            "content": "civil",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "civil"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w071",
            "content": "ethic",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "ethic"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w072",
            "content": "grant",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "grant"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w073",
            "content": "notion",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "notion"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w074",
            "content": "parallel",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "parallel"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w075",
            "content": "perspective",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "perspective"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w076",
            "content": "prior",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "prior"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w077",
            "content": "authority",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "authority"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w078",
            "content": "project",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w079",
            "content": "commission",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "commission"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w080",
            "content": "dimension",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "dimension"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w081",
            "content": "illustrate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "illustrate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w082",
            "content": "scope",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "scope"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w083",
            "content": "technique",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "technique"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w084",
            "content": "trend",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "trend"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w085",
            "content": "dynamic",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "dynamic"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w086",
            "content": "generate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "generate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w087",
            "content": "implement",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "implement"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w088",
            "content": "subsequent",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "subsequent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w089",
            "content": "transcend",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "transcend"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w090",
            "content": "underlying",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "underlying"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w091",
            "content": "virtually",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "virtually"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w092",
            "content": "framework",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "framework"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w093",
            "content": "outcome",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "outcome"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w094",
            "content": "explicit",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "explicit"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w001",
            "content": "every",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "every"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w002",
            "content": "guaranteeing",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "guaranteeing"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w003",
            "content": "the",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "the"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w004",
            "content": "begin",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "begin"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w005",
            "content": "this",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "this"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w006",
            "content": "must",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w007",
            "content": "specimen",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "specimen"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w008",
            "content": "new",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "new"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w009",
            "content": "final",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "final"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w010",
            "content": "doctrine",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "doctrine"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w011",
            "content": "resources",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "resources"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w012",
            "content": "mandate",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "mandate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w013",
            "content": "was",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "was"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w014",
            "content": "other",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "other"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w015",
            "content": "effectiveness",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "effectiveness"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w016",
            "content": "satellite",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "satellite"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w017",
            "content": "circumstances",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "circumstances"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w018",
            "content": "clearly",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "clearly"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w019",
            "content": "his",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "his"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w020",
            "content": "liberties",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "liberties"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w021",
            "content": "resource",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "resource"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w022",
            "content": "nature",
            "difficulty": 1,
            "points": 10,
            "keyWords": [
              "nature"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w023",
            "content": "affected",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "affected"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w024",
            "content": "immediately",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "immediately"
            ],
            "isBackup": false
          },
          {
            "id": "r1_w025",
            "content": "implementing",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "implementing"
            ],
            "isBackup": false
          }
        ],
        "sentences": [
          {
            "id": "r1_s001",
            "content": "The area must be secured before the process can begin.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "area",
              "must",
              "secured"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s002",
            "content": "A single factor will acquire the necessary source of data.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "single",
              "factor",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s003",
            "content": "The issue will occur when the volume exceeds the limit.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "issue",
              "will",
              "occur"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s004",
            "content": "The first phase involves cleaning the environment and removing the debris.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "first",
              "phase",
              "involves"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s005",
            "content": "We must acquire new sources to evaluate the area of the project.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "acquire",
              "sources"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s006",
            "content": "The entire process depends on a single factor we cannot control.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "entire",
              "process",
              "depends"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s007",
            "content": "The problem will occur if the issue is not addressed in this phase.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "problem",
              "will",
              "occur"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s008",
            "content": "The volume of waste material exceeded the limits of the area.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "volume",
              "waste",
              "material"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s009",
            "content": "The team must acquire resources for the next phase of the process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "team",
              "must",
              "acquire"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s010",
            "content": "The main source of the pollution was the change in the environment.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "main",
              "source",
              "pollution"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s011",
            "content": "We must establish the status of the area before the phase begins.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "establish",
              "status"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s012",
            "content": "The team will create a new concept that does not involve this issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "team",
              "will",
              "create"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s013",
            "content": "The process will require an estimate of the volume of the material.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "process",
              "will",
              "require"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s014",
            "content": "The data in this section is not valid according to the protocol.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "data",
              "this",
              "section"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s015",
            "content": "We must involve a new factor to create a valid concept.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "involve",
              "factor"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s016",
            "content": "The status of the project will require a complete estimate of the area.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "status",
              "project",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s017",
            "content": "The new concept should establish a valid process for the phase.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "concept",
              "should",
              "establish"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s018",
            "content": "The data involved a large volume which made the estimate difficult.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "data",
              "involved",
              "large"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s019",
            "content": "The final section must establish the validity of the entire process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "final",
              "section",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s020",
            "content": "The issue will occur if we create a concept that is not valid.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "issue",
              "will",
              "occur"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s021",
            "content": "We must evaluate the hypothesis and derive a final estimate.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "evaluate",
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s022",
            "content": "The formula provides the method to define the major factor.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "formula",
              "provides",
              "method"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s023",
            "content": "The new concept is coherent but not consistent with all the data.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "concept",
              "coherent",
              "consistent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s024",
            "content": "We must conclude that the hypothesis is valid based on the process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "conclude",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s025",
            "content": "The major issue will occur if the method is not consistent.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "major",
              "issue",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s026",
            "content": "We must define a new formula to evaluate the volume of the area.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "define",
              "formula"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s027",
            "content": "The data will derive a coherent estimate for the next phase.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "data",
              "will",
              "derive"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s028",
            "content": "The core concept requires a major factor that is consistent and stable.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "core",
              "concept",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s029",
            "content": "We must conclude that the hypothesis lacks a consistent method.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "conclude",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s030",
            "content": "The formula to evaluate the status is the most coherent method.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "formula",
              "evaluate",
              "status"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s031",
            "content": "The new approach will exceed the capacity of the current process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "approach",
              "will",
              "exceed"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s032",
            "content": "We must construct a minimal formula to predict the issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "construct",
              "minimal"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s033",
            "content": "The major issue will constrain the approach to a single method.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "major",
              "issue",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s034",
            "content": "The formula will instruct the team to reject the arbitrary data.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "formula",
              "will",
              "instruct"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s035",
            "content": "The priority now is to predict when the volume will exceed the limit.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "priority",
              "predict",
              "when"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s036",
            "content": "The arbitrary factor will constrain the capacity of the environment.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "arbitrary",
              "factor",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s037",
            "content": "The minimal approach must instruct the team to maintain priority.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "minimal",
              "approach",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s038",
            "content": "We must construct a new formula to predict the major issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "construct",
              "formula"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s039",
            "content": "The project will exceed the original estimate if we do not constrain it.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "project",
              "will",
              "exceed"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s040",
            "content": "The main priority of the new phase is to instruct the team to acquire minimal data.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "main",
              "priority",
              "phase"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s041",
            "content": "The structure and sequence of the experiment are the principal issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "structure",
              "sequence",
              "experiment"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s042",
            "content": "The new regime will trace the shift in the market status.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "regime",
              "will",
              "trace"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s043",
            "content": "The final sum must modify the original estimate and provide a summary.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "final",
              "must",
              "modify"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s044",
            "content": "The symbol represents the principal factor in the entire process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "symbol",
              "represents",
              "principal"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s045",
            "content": "We must modify the structure to inhibit any further shift.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "modify",
              "structure"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s046",
            "content": "The summary will trace the sequence of events that occurred under the regime.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "summary",
              "will",
              "trace"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s047",
            "content": "The principal issue is whether the new structure is coherent.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "principal",
              "issue",
              "whether"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s048",
            "content": "The final sum depends on the sequence of the formula we modify.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "final",
              "depends",
              "sequence"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s049",
            "content": "The symbol's status will shift once the regime constructs a new concept.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "symbol",
              "status",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s050",
            "content": "We must trace the sum and evaluate the structure before concluding the summary.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "trace",
              "evaluate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s051",
            "content": "The initial principle of the objective was ethical and clear.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "initial",
              "principle",
              "objective"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s052",
            "content": "The ultimate goal is to establish a stable structure for the regime.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "ultimate",
              "goal",
              "establish"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s053",
            "content": "We must define the specific volume to find the total sum.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "define",
              "specific"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s054",
            "content": "The objective of the phase is to acquire a valid initial estimate.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "objective",
              "phase",
              "acquire"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s055",
            "content": "The ethical principle will constrain the ultimate structure of the process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "ethical",
              "principle",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s056",
            "content": "The total sum must be valid for this specific volume to be stable.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "total",
              "must",
              "valid"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s057",
            "content": "The initial objective was to construct an ethical and stable framework.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "initial",
              "objective",
              "construct"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s058",
            "content": "The specific factor will involve the ultimate principle of the doctrine.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "specific",
              "factor",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s059",
            "content": "The total volume of data should exceed the initial estimate.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "total",
              "volume",
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s060",
            "content": "The objective is to establish a valid sum that is specific and stable.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "objective",
              "establish",
              "valid"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s061",
            "content": "The consequence of the error will affect every component.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "consequence",
              "error",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s062",
            "content": "We must acquire new data and derive a new formula.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "acquire",
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s063",
            "content": "The major factor will dominate the final outcome, thereby negateing other variables.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "major",
              "factor",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s064",
            "content": "The team must extract the data and transmit the summary immediately.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "team",
              "must",
              "extract"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s065",
            "content": "We perceive the consequence as major because it affects the initial principle.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "perceive",
              "consequence",
              "major"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s066",
            "content": "The core component will dominate the structure, thereby negateing the approach.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "core",
              "component",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s067",
            "content": "We must acquire a new formula to derive the ultimate sum.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "acquire",
              "formula"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s068",
            "content": "The device will extract the data and transmit the status to the regime.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "device",
              "will",
              "extract"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s069",
            "content": "We perceive the consequence as major and it will affect the entire process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "perceive",
              "consequence",
              "major"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s070",
            "content": "The failure of a single component will negate the total sum we derive.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "failure",
              "single",
              "component"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s071",
            "content": "The team did intend to justify their action with a strong ethic.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "team",
              "intend",
              "justify"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s072",
            "content": "The civil grant was approved, a notion parallel to the original principle.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "civil",
              "grant",
              "approved"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s073",
            "content": "We must evaluate the prior attitude to derive a new perspective.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "evaluate",
              "prior"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s074",
            "content": "The objective is to justify the new formula and grant the approval.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "objective",
              "justify",
              "formula"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s075",
            "content": "We must intend to modify the prior ethic and acquire a new attitude.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "intend",
              "modify"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s076",
            "content": "The civil issue requires a parallel approach to find a solution.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "civil",
              "issue",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s077",
            "content": "The entire notion of granting the funds lacks an ethical principle.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "entire",
              "notion",
              "granting"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s078",
            "content": "His perspective was justified by prior data, notwithstanding his attitude.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "perspective",
              "justified",
              "prior"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s079",
            "content": "The civil regime did not intend to negate the prior principle.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "civil",
              "regime",
              "intend"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s080",
            "content": "We must grant the notion that the new ethic has a different perspective.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "grant",
              "notion"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s081",
            "content": "The authority will project the trend in the civil attitude.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "authority",
              "will",
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s082",
            "content": "The commission will generate the formula to illustrate the dynamic issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "commission",
              "will",
              "generate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s083",
            "content": "The technique must constrain the scope to a single dimension.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "technique",
              "must",
              "constrain"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s084",
            "content": "The authority did not intend to project the current trend.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "authority",
              "intend",
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s085",
            "content": "The new technique will generate a dynamic shift in the process.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "technique",
              "will",
              "generate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s086",
            "content": "The commission will illustrate the problem's dimension to the civil ethic council.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "commission",
              "will",
              "illustrate"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s087",
            "content": "The scope of the project requires a prior grant of authority.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "scope",
              "project",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s088",
            "content": "The dynamic trend will affect the entire dimension of the new technique.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "dynamic",
              "trend",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s089",
            "content": "We must generate a summary to illustrate the scope of the issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "generate",
              "summary"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s090",
            "content": "The authority of the commission must justify the project's scope.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "authority",
              "commission",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s091",
            "content": "We must implement the subsequent technique to transcend the prior issue.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "must",
              "implement",
              "subsequent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s092",
            "content": "The underlying framework must transmit a virtually coherent outcome.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "underlying",
              "framework",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s093",
            "content": "The explicit objective is to implement the new formula immediately.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "explicit",
              "objective",
              "implement"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s094",
            "content": "The subsequent phase will transcend the dimension of the original project.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "subsequent",
              "phase",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s095",
            "content": "The authority must transmit the explicit protocol to implement the technique.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "authority",
              "must",
              "transmit"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s096",
            "content": "The framework must be coherent to generate a virtually valid outcome.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "framework",
              "must",
              "coherent"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s097",
            "content": "The underlying factor will transcend the scope of the entire project.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "underlying",
              "factor",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s098",
            "content": "The subsequent issue will affect the explicit summary we transmit.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "subsequent",
              "issue",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s099",
            "content": "The dynamic trend requires us to implement a coherent framework.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "dynamic",
              "trend",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r1_s100",
            "content": "The virtually explicit outcome of the project will transcend all expectations.",
            "difficulty": 1,
            "points": 25,
            "keyWords": [
              "virtually",
              "explicit",
              "outcome"
            ],
            "isBackup": false
          }
        ],
        "paragraphs": [
          {
            "id": "r1_p001",
            "content": "The initial phase of the project required that the team assess the entire area. The main",
            "difficulty": 1,
            "points": 50,
            "keyWords": [
              "initial",
              "phase",
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r1_p002",
            "content": "issue was determining the exact volume of existing material. This factor was integral to",
            "difficulty": 1,
            "points": 50,
            "keyWords": [
              "issue",
              "determining",
              "exact"
            ],
            "isBackup": false
          }
        ]
      },
      "macroLevel2": {
        "level": 2,
        "name": "Macro Level 2",
        "description": "Reader Level 1, Macro Level 2 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel3": {
        "level": 3,
        "name": "Macro Level 3",
        "description": "Reader Level 1, Macro Level 3 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel4": {
        "level": 4,
        "name": "Macro Level 4",
        "description": "Reader Level 1, Macro Level 4 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      }
    }
  },
  "readerLevel2": {
    "readerLevel": 2,
    "macroLevels": {
      "macroLevel1": {
        "level": 1,
        "name": "Macro Level 1",
        "description": "Reader Level 2, Macro Level 1 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel2": {
        "level": 2,
        "name": "Macro Level 2",
        "description": "Reader Level 2, Macro Level 2 content",
        "words": [
          {
            "id": "r2_w001",
            "content": "abstract",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "abstract"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w001",
            "content": "culture",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "culture"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w002",
            "content": "contrast",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "contrast"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w003",
            "content": "feature",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "feature"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w004",
            "content": "perceive",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "perceive"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w005",
            "content": "perspective",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "perspective"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w006",
            "content": "interpret",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "interpret"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w007",
            "content": "mediate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "mediate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w008",
            "content": "reinforce",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "reinforce"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w009",
            "content": "denote",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "denote"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w010",
            "content": "inherent",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "inherent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w011",
            "content": "fundamental",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "fundamental"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w012",
            "content": "profound",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "profound"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w013",
            "content": "ambiguous",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "ambiguous"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w014",
            "content": "marginal",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "marginal"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w015",
            "content": "explicit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "explicit"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w016",
            "content": "implicit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "implicit"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w017",
            "content": "conform",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "conform"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w018",
            "content": "transmit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "transmit"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w019",
            "content": "resolve",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "resolve"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w020",
            "content": "formulate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "formulate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w021",
            "content": "ideology",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "ideology"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w022",
            "content": "paradigm",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "paradigm"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w023",
            "content": "bias",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "bias"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w024",
            "content": "challenge",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "challenge"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w025",
            "content": "distort",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "distort"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w026",
            "content": "conceive",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "conceive"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w027",
            "content": "evoke",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "evoke"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w028",
            "content": "hypothesis",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w029",
            "content": "premise",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "premise"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w030",
            "content": "advocate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "advocate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w031",
            "content": "arbitrary",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "arbitrary"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w032",
            "content": "assert",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "assert"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w033",
            "content": "negate",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "negate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w034",
            "content": "prevail",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "prevail"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w035",
            "content": "comprise",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "comprise"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w036",
            "content": "integral",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "integral"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w037",
            "content": "mutual",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "mutual"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w038",
            "content": "sole",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "sole"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w039",
            "content": "subordinate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "subordinate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w040",
            "content": "hierarchy",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "hierarchy"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w041",
            "content": "domain",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "domain"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w042",
            "content": "finite",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "finite"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w043",
            "content": "infinite",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "infinite"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w044",
            "content": "static",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "static"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w045",
            "content": "dynamic",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "dynamic"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w046",
            "content": "flux",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "flux"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w047",
            "content": "scope",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "scope"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w048",
            "content": "parameter",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "parameter"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w049",
            "content": "variable",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "variable"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w050",
            "content": "correlation",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "correlation"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w051",
            "content": "empirical",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "empirical"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w052",
            "content": "phenomenon",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "phenomenon"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w053",
            "content": "quantitative",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "quantitative"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w054",
            "content": "qualitative",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "qualitative"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w055",
            "content": "theoretical",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "theoretical"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w056",
            "content": "validate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "validate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w057",
            "content": "verify",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "verify"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w058",
            "content": "refute",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "refute"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w059",
            "content": "postulate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "postulate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w060",
            "content": "analogy",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "analogy"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w061",
            "content": "synthesize",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "synthesize"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w062",
            "content": "concurrent",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "concurrent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w063",
            "content": "deduce",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "deduce"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w064",
            "content": "differentiate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "differentiate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w065",
            "content": "displace",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "displace"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w066",
            "content": "discrete",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "discrete"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w067",
            "content": "equivalent",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "equivalent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w068",
            "content": "intermediate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "intermediate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w069",
            "content": "ratio",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "ratio"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w070",
            "content": "sequence",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "sequence"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w071",
            "content": "supplement",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "supplement"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w072",
            "content": "tense",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "tense"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w073",
            "content": "utilize",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "utilize"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w074",
            "content": "entity",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "entity"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w075",
            "content": "essence",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "essence"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w076",
            "content": "identical",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "identical"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w077",
            "content": "manifest",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "manifest"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w078",
            "content": "ongoing",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "ongoing"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w079",
            "content": "passive",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "passive"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w080",
            "content": "radical",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "radical"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w081",
            "content": "refine",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "refine"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w082",
            "content": "sustain",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "sustain"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w083",
            "content": "tension",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "tension"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w084",
            "content": "virtual",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "virtual"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w085",
            "content": "alter",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "alter"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w086",
            "content": "capacity",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "capacity"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w087",
            "content": "crucial",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "crucial"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w088",
            "content": "decline",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "decline"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w089",
            "content": "expose",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "expose"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w090",
            "content": "intense",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "intense"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w091",
            "content": "magnitude",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "magnitude"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w092",
            "content": "mechanism",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "mechanism"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w093",
            "content": "modify",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "modify"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w094",
            "content": "network",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "network"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w095",
            "content": "regime",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "regime"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w096",
            "content": "sphere",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "sphere"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w097",
            "content": "ultimate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "ultimate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w098",
            "content": "unique",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "unique"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w001",
            "content": "interpretation",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "interpretation"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w002",
            "content": "the",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "the"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w003",
            "content": "trust",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "trust"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w004",
            "content": "objective",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "objective"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w005",
            "content": "are",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "are"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w006",
            "content": "this",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "this"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w007",
            "content": "logic",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "logic"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w008",
            "content": "authority",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "authority"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w009",
            "content": "his",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "his"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w010",
            "content": "its",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "its"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w011",
            "content": "component",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "component"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w012",
            "content": "previous",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "previous"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w013",
            "content": "data",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w014",
            "content": "consistency",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "consistency"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w015",
            "content": "technique",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "technique"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w016",
            "content": "shift",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "shift"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w017",
            "content": "environment",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "environment"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w018",
            "content": "outcome",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "outcome"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w019",
            "content": "and",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "and"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w020",
            "content": "that",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w021",
            "content": "rapidly",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "rapidly"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w022",
            "content": "limitations",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "limitations"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w023",
            "content": "underlying",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "underlying"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w024",
            "content": "meaning",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "meaning"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w025",
            "content": "advocacy",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "advocacy"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w026",
            "content": "organization",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "organization"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w027",
            "content": "central",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "central"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w028",
            "content": "deadline",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "deadline"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w029",
            "content": "within",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "within"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w030",
            "content": "directive",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "directive"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w031",
            "content": "entities",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "entities"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w032",
            "content": "potential",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "potential"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w033",
            "content": "requires",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w034",
            "content": "evidence",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "evidence"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w035",
            "content": "concept",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "concept"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w036",
            "content": "assumptions",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "assumptions"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w037",
            "content": "validated",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "validated"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w038",
            "content": "chemical",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "chemical"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w039",
            "content": "issue",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "issue"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w040",
            "content": "assertion",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "assertion"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w041",
            "content": "coherent",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "coherent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w042",
            "content": "functionality",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "functionality"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w043",
            "content": "during",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "during"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w044",
            "content": "supplementation",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "supplementation"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w045",
            "content": "failure",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "failure"
            ],
            "isBackup": false
          },
          {
            "id": "r2_w046",
            "content": "framework",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "framework"
            ],
            "isBackup": false
          }
        ],
        "sentences": [
          {
            "id": "r2_s001",
            "content": "The culture will contrast with the new feature we implement.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "culture",
              "will",
              "contrast"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s002",
            "content": "We must perceive the perspective and interpret the findings.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "perceive",
              "perspective"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s003",
            "content": "The mediator will mediate the tension and reinforce the agreement.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "mediator",
              "will",
              "mediate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s004",
            "content": "The symbol will denote the inherent fundamental flaw.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "symbol",
              "will",
              "denote"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s005",
            "content": "The profound truth was ambiguous and slightly marginal.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "profound",
              "truth",
              "ambiguous"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s006",
            "content": "The contract was explicit, but the intent was implicit.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "contract",
              "explicit",
              "intent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s007",
            "content": "The entity must conform to the rule or be transmitted out.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "entity",
              "must",
              "conform"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s008",
            "content": "We must resolve the issue and formulate a new plan.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "resolve",
              "issue"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s009",
            "content": "The new ideology will challenge the existing paradigm.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ideology",
              "will",
              "challenge"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s010",
            "content": "The bias will distort the abstract concept we conceive.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "bias",
              "will",
              "distort"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s011",
            "content": "We must evoke a strong hypothesis and a sound premise.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "evoke",
              "strong"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s012",
            "content": "The advocate will assert the truth and negate the false claim.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "advocate",
              "will",
              "assert"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s013",
            "content": "The rule must prevail over the arbitrary decision.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "rule",
              "must",
              "prevail"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s014",
            "content": "The structure will comprise two integral and mutual parts.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "structure",
              "will",
              "comprise"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s015",
            "content": "His sole purpose was to be subordinate to the master.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "sole",
              "purpose",
              "subordinate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s016",
            "content": "The new hierarchy applies only to this domain.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "hierarchy",
              "applies",
              "only"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s017",
            "content": "The resource is finite, not infinite, and therefore static.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "resource",
              "finite",
              "infinite"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s018",
            "content": "The dynamic flux will affect the scope of the experiment.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "dynamic",
              "flux",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s019",
            "content": "The parameter is a variable that is integral to the formula.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "parameter",
              "variable",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s020",
            "content": "The correlation is empirical, not merely theoretical.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "correlation",
              "empirical",
              "merely"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s021",
            "content": "The phenomenon is quantitative but lacks qualitative depth.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "phenomenon",
              "quantitative",
              "lacks"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s022",
            "content": "We must validate the hypothesis and verify the data.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "validate",
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s023",
            "content": "The scientist must refute the old claim and postulate a new theory.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "scientist",
              "must",
              "refute"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s024",
            "content": "The analogy will help synthesize the abstract ideas.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "analogy",
              "will",
              "help"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s025",
            "content": "The events were concurrent but the arbitrary factor intervened.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "events",
              "were",
              "concurrent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s026",
            "content": "We must deduce the answer and differentiate the elements.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "deduce",
              "answer"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s027",
            "content": "The large tree will displace the smaller, discrete shrub.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "large",
              "tree",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s028",
            "content": "The parts are equivalent but the functions are intermediate.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "parts",
              "equivalent",
              "functions"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s029",
            "content": "The ratio must be maintained in the entire sequence.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ratio",
              "must",
              "maintained"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s030",
            "content": "We must supplement the text because the tense is incorrect.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "supplement",
              "text"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s031",
            "content": "We must utilize the entity to study its essence.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "utilize",
              "entity"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s032",
            "content": "The two ideas are identical but they manifest differently.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ideas",
              "identical",
              "they"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s033",
            "content": "The ongoing issue is whether the role is passive or radical.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ongoing",
              "issue",
              "whether"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s034",
            "content": "We must refine the method to sustain the tension.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "refine",
              "method"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s035",
            "content": "The virtual reality will alter the user's perception.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "virtual",
              "reality",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s036",
            "content": "The capacity is crucial but the attendance will decline.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "capacity",
              "crucial",
              "attendance"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s037",
            "content": "We must expose the truth that the intensity is too high.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "expose",
              "truth"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s038",
            "content": "The magnitude of the problem requires a new mechanism.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "magnitude",
              "problem",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s039",
            "content": "We must modify the network of the current regime.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "modify",
              "network"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s040",
            "content": "The entire sphere of the project is the ultimate unique goal.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "entire",
              "sphere",
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s041",
            "content": "The inherent culture of the group will mediate the dispute.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "inherent",
              "culture",
              "group"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s042",
            "content": "We must perceive the ambiguous feature of the design.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "perceive",
              "ambiguous"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s043",
            "content": "The explicit perspective will contrast with the implicit meaning.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "explicit",
              "perspective",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s044",
            "content": "The fundamental difference will denote a profound shift.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "fundamental",
              "difference",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s045",
            "content": "The team will conform to the rule and transmit the data.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "team",
              "will",
              "conform"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s046",
            "content": "The marginal change will resolve the underlying tension.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "marginal",
              "change",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s047",
            "content": "We must interpret the ideology and formulate a new plan.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "interpret",
              "ideology"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s048",
            "content": "The paradigm shift will challenge the current premise.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "paradigm",
              "shift",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s049",
            "content": "The bias will distort the abstract concept we conceive.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "bias",
              "will",
              "distort"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s050",
            "content": "We must evoke a strong hypothesis and negate the old one.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "evoke",
              "strong"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s051",
            "content": "The advocate will assert that the arbitrary rule must prevail.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "advocate",
              "will",
              "assert"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s052",
            "content": "The integral component will comprise the mutual agreement.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "integral",
              "component",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s053",
            "content": "The sole purpose is subordinate to the overall hierarchy.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "sole",
              "purpose",
              "subordinate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s054",
            "content": "The domain is finite but the scope is dynamic.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "domain",
              "finite",
              "scope"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s055",
            "content": "The infinite flux will affect the static parameter.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "infinite",
              "flux",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s056",
            "content": "The variable is integral to the correlation study.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "variable",
              "integral",
              "correlation"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s057",
            "content": "The empirical phenomenon is qualitative and quantitative.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "empirical",
              "phenomenon",
              "qualitative"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s058",
            "content": "The theoretical premise must validate the hypothesis.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "theoretical",
              "premise",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s059",
            "content": "We must verify the data and refute the old postulate.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "verify",
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s060",
            "content": "The analogy will synthesize the concurrent elements.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "analogy",
              "will",
              "synthesize"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s061",
            "content": "We must deduce the ratio and differentiate the parts.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "deduce",
              "ratio"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s062",
            "content": "The discrete entity will displace the larger component.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "discrete",
              "entity",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s063",
            "content": "The intermediate step is equivalent to the final goal.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "intermediate",
              "step",
              "equivalent"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s064",
            "content": "The sequence must supplement the text that is too tense.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "sequence",
              "must",
              "supplement"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s065",
            "content": "We must utilize the essence that is identical to the source.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "utilize",
              "essence"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s066",
            "content": "The manifest problem is ongoing and remains passive.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "manifest",
              "problem",
              "ongoing"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s067",
            "content": "The radical shift will refine the current regime.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "radical",
              "shift",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s068",
            "content": "We must sustain the tension through the virtual network.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "sustain",
              "tension"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s069",
            "content": "The altering capacity is a crucial mechanism.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "altering",
              "capacity",
              "crucial"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s070",
            "content": "The decline will expose the magnitude of the issue.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "decline",
              "will",
              "expose"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s071",
            "content": "The intense process will modify the sphere of influence.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "intense",
              "process",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s072",
            "content": "The ultimate unique feature will transcend the initial scope.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ultimate",
              "unique",
              "feature"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s073",
            "content": "The inherent bias will distort the final outcome.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "inherent",
              "bias",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s074",
            "content": "The profound challenge will resolve the tension.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "profound",
              "challenge",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s075",
            "content": "The explicit ideology will contrast with the implicit rule.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "explicit",
              "ideology",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s076",
            "content": "The marginal entity must conform to the hierarchy.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "marginal",
              "entity",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s077",
            "content": "We must interpret the paradigm and formulate a new premise.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "interpret",
              "paradigm"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s078",
            "content": "The abstract notion will evoke a strong perspective.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "abstract",
              "notion",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s079",
            "content": "The advocate will conceive a hypothesis and assert its truth.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "advocate",
              "will",
              "conceive"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s080",
            "content": "The arbitrary rule will negate the mutual agreement.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "arbitrary",
              "rule",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s081",
            "content": "The integral component must prevail over the subordinate part.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "integral",
              "component",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s082",
            "content": "The finite domain will comprise the entire scope.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "finite",
              "domain",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s083",
            "content": "The dynamic variable is integral to the flux study.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "dynamic",
              "variable",
              "integral"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s084",
            "content": "The static correlation must be validated by empirical data.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "static",
              "correlation",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s085",
            "content": "The quantitative phenomenon must refute the theoretical claim.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "quantitative",
              "phenomenon",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s086",
            "content": "We must verify the postulate and synthesize the findings.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "verify",
              "postulate"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s087",
            "content": "The analogy will deduce the intermediate sequence.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "analogy",
              "will",
              "deduce"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s088",
            "content": "The concurrent events will differentiate the discrete parts.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "concurrent",
              "events",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s089",
            "content": "The equivalent ratio will supplement the abstract text.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "equivalent",
              "ratio",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s090",
            "content": "We must utilize the tension that is identical to the source.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "utilize",
              "tension"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s091",
            "content": "The essence of the radical shift will manifest virtually.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "essence",
              "radical",
              "shift"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s092",
            "content": "The ongoing regime will refine the crucial mechanism.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "ongoing",
              "regime",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s093",
            "content": "The altering sphere will sustain the intense process.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "altering",
              "sphere",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s094",
            "content": "The passive decline will expose the ultimate magnitude.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "passive",
              "decline",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s095",
            "content": "The unique network will modify the capacity of the domain.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "unique",
              "network",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s096",
            "content": "The inherent culture must transcend the subordinate rule.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "inherent",
              "culture",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s097",
            "content": "The fundamental perspective will resolve the ambiguous issue.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "fundamental",
              "perspective",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s098",
            "content": "The profound notion will reinforce the explicit premise.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "profound",
              "notion",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s099",
            "content": "We must perceive the implicit tension and formulate a new approach.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "must",
              "perceive",
              "implicit"
            ],
            "isBackup": false
          },
          {
            "id": "r2_s100",
            "content": "The marginal feature must conform to the unique design.",
            "difficulty": 2,
            "points": 50,
            "keyWords": [
              "marginal",
              "feature",
              "must"
            ],
            "isBackup": false
          }
        ],
        "paragraphs": [
          {
            "id": "r2_p001",
            "content": "The established culture of the organization presents a strong contrast to the new",
            "difficulty": 2,
            "points": 100,
            "keyWords": [
              "established",
              "culture",
              "organization"
            ],
            "isBackup": false
          },
          {
            "id": "r2_p002",
            "content": "feature we plan to implement. It is crucial that we perceive this tension accurately. The",
            "difficulty": 2,
            "points": 100,
            "keyWords": [
              "feature",
              "plan",
              "implement"
            ],
            "isBackup": false
          },
          {
            "id": "r2_p003",
            "content": "objective is to mediate the difference effectively so that the transition does not distort",
            "difficulty": 2,
            "points": 100,
            "keyWords": [
              "objective",
              "mediate",
              "difference"
            ],
            "isBackup": false
          }
        ]
      },
      "macroLevel3": {
        "level": 3,
        "name": "Macro Level 3",
        "description": "Reader Level 2, Macro Level 3 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel4": {
        "level": 4,
        "name": "Macro Level 4",
        "description": "Reader Level 2, Macro Level 4 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      }
    }
  },
  "readerLevel3": {
    "readerLevel": 3,
    "macroLevels": {
      "macroLevel1": {
        "level": 1,
        "name": "Macro Level 1",
        "description": "Reader Level 3, Macro Level 1 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel2": {
        "level": 2,
        "name": "Macro Level 2",
        "description": "Reader Level 3, Macro Level 2 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel3": {
        "level": 3,
        "name": "Macro Level 3",
        "description": "Reader Level 3, Macro Level 3 content",
        "words": [
          {
            "id": "r3_w001",
            "content": "communication",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "communication"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w001",
            "content": "integrate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "integrate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w002",
            "content": "articulate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "articulate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w003",
            "content": "disseminate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "disseminate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w004",
            "content": "converge",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "converge"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w005",
            "content": "diverge",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "diverge"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w006",
            "content": "global",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "global"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w007",
            "content": "local",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "local"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w008",
            "content": "architecture",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "architecture"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w009",
            "content": "commerce",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "commerce"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w010",
            "content": "treaty",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "treaty"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w011",
            "content": "reciprocal",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "reciprocal"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w012",
            "content": "diverse",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "diverse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w013",
            "content": "homogeneous",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "homogeneous"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w014",
            "content": "friction",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "friction"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w015",
            "content": "bloc",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "bloc"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w016",
            "content": "annex",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "annex"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w017",
            "content": "exploit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "exploit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w018",
            "content": "sanction",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "sanction"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w019",
            "content": "bilateral",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "bilateral"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w020",
            "content": "multilateral",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "multilateral"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w021",
            "content": "consensus",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "consensus"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w022",
            "content": "negotiate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "negotiate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w023",
            "content": "implement",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "implement"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w024",
            "content": "allocate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "allocate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w025",
            "content": "capitalize",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "capitalize"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w026",
            "content": "foster",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "foster"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w027",
            "content": "transcend",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "transcend"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w028",
            "content": "ubiquitous",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "ubiquitous"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w029",
            "content": "intrinsic",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "intrinsic"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w030",
            "content": "requisite",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "requisite"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w031",
            "content": "fidelity",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "fidelity"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w032",
            "content": "vernacular",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "vernacular"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w033",
            "content": "rhetoric",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "rhetoric"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w034",
            "content": "discourse",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "discourse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w035",
            "content": "intercede",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "intercede"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w036",
            "content": "procure",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "procure"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w037",
            "content": "mandate",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "mandate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w038",
            "content": "exempt",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "exempt"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w039",
            "content": "jurisdiction",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "jurisdiction"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w040",
            "content": "precedent",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "precedent"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w041",
            "content": "proxy",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "proxy"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w042",
            "content": "sovereign",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "sovereign"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w043",
            "content": "legitimate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "legitimate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w044",
            "content": "endorse",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "endorse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w045",
            "content": "subjugate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "subjugate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w046",
            "content": "synergy",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "synergy"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w047",
            "content": "cohesion",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "cohesion"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w048",
            "content": "fragmentation",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "fragmentation"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w049",
            "content": "systemic",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "systemic"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w050",
            "content": "juxtapose",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "juxtapose"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w051",
            "content": "parity",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "parity"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w052",
            "content": "disparity",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "disparity"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w053",
            "content": "norm",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "norm"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w054",
            "content": "protocol",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "protocol"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w055",
            "content": "liaison",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "liaison"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w056",
            "content": "conduit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "conduit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w057",
            "content": "framework",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "framework"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w058",
            "content": "trajectory",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "trajectory"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w059",
            "content": "epoch",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "epoch"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w060",
            "content": "cessation",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "cessation"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w061",
            "content": "contingent",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "contingent"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w062",
            "content": "bolster",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "bolster"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w063",
            "content": "augment",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "augment"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w064",
            "content": "compromise",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "compromise"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w065",
            "content": "perpetuate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "perpetuate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w066",
            "content": "undermine",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "undermine"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w067",
            "content": "resilience",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "resilience"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w068",
            "content": "sustainable",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "sustainable"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w069",
            "content": "volatile",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "volatile"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w070",
            "content": "arbitrate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "arbitrate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w071",
            "content": "discredit",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "discredit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w072",
            "content": "tacit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "tacit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w073",
            "content": "overt",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "overt"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w074",
            "content": "devise",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "devise"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w075",
            "content": "essential",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "essential"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w076",
            "content": "diffuse",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "diffuse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w077",
            "content": "spectrum",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "spectrum"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w078",
            "content": "encompass",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "encompass"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w079",
            "content": "capricious",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "capricious"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w080",
            "content": "proposition",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "proposition"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w081",
            "content": "discord",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "discord"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w082",
            "content": "aptitude",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "aptitude"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w083",
            "content": "extent",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "extent"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w084",
            "content": "modality",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "modality"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w085",
            "content": "amend",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "amend"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w086",
            "content": "nexus",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "nexus"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w087",
            "content": "governance",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "governance"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w088",
            "content": "orbit",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "orbit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w089",
            "content": "pivotal",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "pivotal"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w090",
            "content": "singular",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "singular"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w091",
            "content": "reconfigure",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "reconfigure"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w092",
            "content": "paramount",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "paramount"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w093",
            "content": "diminish",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "diminish"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w094",
            "content": "pronounced",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "pronounced"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w095",
            "content": "catalyst",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "catalyst"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w096",
            "content": "cultivate",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "cultivate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w097",
            "content": "concede",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "concede"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w098",
            "content": "endemic",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "endemic"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w099",
            "content": "pervasive",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "pervasive"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w100",
            "content": "asynchronous",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "asynchronous"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w001",
            "content": "the",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "the"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w002",
            "content": "need",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "need"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w003",
            "content": "powerful",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "powerful"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w004",
            "content": "that",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w005",
            "content": "and",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "and"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w006",
            "content": "formal",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "formal"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w007",
            "content": "achieving",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "achieving"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w008",
            "content": "true",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "true"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w009",
            "content": "maintaining",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "maintaining"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w010",
            "content": "his",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "his"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w011",
            "content": "claims",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "claims"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w012",
            "content": "historical",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "historical"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w013",
            "content": "condition",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "condition"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w014",
            "content": "dispute",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "dispute"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w015",
            "content": "under",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "under"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w016",
            "content": "surviving",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "surviving"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w017",
            "content": "through",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "through"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w018",
            "content": "correspondence",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "correspondence"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w019",
            "content": "violates",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "violates"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w020",
            "content": "between",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "between"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w021",
            "content": "ensure",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "ensure"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w022",
            "content": "must",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w023",
            "content": "building",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "building"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w024",
            "content": "can",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "can"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w025",
            "content": "soon",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "soon"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w026",
            "content": "current",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "current"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w027",
            "content": "project",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "project"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w028",
            "content": "blocs",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "blocs"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w029",
            "content": "fostering",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "fostering"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w030",
            "content": "clearly",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "clearly"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w031",
            "content": "thereby",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "thereby"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w032",
            "content": "for",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "for"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w033",
            "content": "new",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "new"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w034",
            "content": "resources",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "resources"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w035",
            "content": "across",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "across"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w036",
            "content": "environment",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "environment"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w037",
            "content": "leading",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "leading"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w038",
            "content": "reconfigured",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "reconfigured"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w039",
            "content": "limitations",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "limitations"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w040",
            "content": "among",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "among"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w041",
            "content": "perpetuates",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "perpetuates"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w042",
            "content": "undermineing",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "undermineing"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w043",
            "content": "amendment",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "amendment"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w044",
            "content": "cause",
            "difficulty": 3,
            "points": 30,
            "keyWords": [
              "cause"
            ],
            "isBackup": false
          },
          {
            "id": "r3_w045",
            "content": "amendments",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "amendments"
            ],
            "isBackup": false
          }
        ],
        "sentences": [
          {
            "id": "r3_s001",
            "content": "We must integrate all local data to articulate a clear global strategy.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "integrate",
              "local"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s002",
            "content": "The team will disseminate the protocol and articulate the framework to all members.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "team",
              "will",
              "disseminate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s003",
            "content": "A reciprocal agreement is essential to foster diverse and sustainable trade relations.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "reciprocal",
              "agreement",
              "essential"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s004",
            "content": "The friction between diverse opinions led to a homogeneous but tacit consensus.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "friction",
              "between",
              "diverse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s005",
            "content": "The bloc planned to annex the territory and exploit the local commerce.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "bloc",
              "planned",
              "annex"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s006",
            "content": "A sanction on global trade will diminish the ability to procure essential goods.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "sanction",
              "global",
              "trade"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s007",
            "content": "We must allocate the resources to capitalize on the market and foster new initiatives.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "allocate",
              "resources"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s008",
            "content": "The intrinsic value is the requisite factor for the proposition to be legitimate.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "intrinsic",
              "value",
              "requisite"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s009",
            "content": "The governance can exempt small businesses from the new jurisdiction and protocol.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "governance",
              "exempt",
              "small"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s010",
            "content": "The precedent set by the court will endorse the use of a political proxy.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "precedent",
              "court",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s011",
            "content": "The sovereign nation must present a legitimate reason to subjugate the local bloc.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "sovereign",
              "nation",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s012",
            "content": "The fragmentation of the nexus is a systemic issue that needs to be addressed.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "fragmentation",
              "nexus",
              "systemic"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s013",
            "content": "We must juxtapose the global and local data to find a clear correspondence.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "juxtapose",
              "global"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s014",
            "content": "The new protocol established a liaison to act as a conduit for formal discourse.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "protocol",
              "established",
              "liaison"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s015",
            "content": "The framework shows the trajectory of the reform across this current epoch.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "framework",
              "shows",
              "trajectory"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s016",
            "content": "The cessation of the volatile market caused a contingent drop in commerce.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "cessation",
              "volatile",
              "market"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s017",
            "content": "A compromise on the treaty will perpetuate discord and undermine cohesion.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "compromise",
              "treaty",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s018",
            "content": "We need to arbitrate the dispute and discredit the capricious claims made by the bloc.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "need",
              "arbitrate",
              "dispute"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s019",
            "content": "The tacit agreement was made overt by the official endorsement of the treaty.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "tacit",
              "agreement",
              "made"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s020",
            "content": "The diffuse structure allows the ideas to foster and prevents fragmentation.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "diffuse",
              "structure",
              "allows"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s021",
            "content": "The extent of the discord can encompass the whole governance if we don't intercede.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "extent",
              "discord",
              "encompass"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s022",
            "content": "His capricious decision to annex the land was not based on any formal proposition.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "capricious",
              "decision",
              "annex"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s023",
            "content": "The aptitude of the team will diminish if we do not amend the protocol soon.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "aptitude",
              "team",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s024",
            "content": "The extent of the problem requires a pronounced amendment to the existing modality.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "extent",
              "problem",
              "requires"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s025",
            "content": "The nexus is pivotal to the governance of the entire orbit of operations.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "nexus",
              "pivotal",
              "governance"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s026",
            "content": "The singular trait is the requisite factor to reconfigure the architecture.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "singular",
              "trait",
              "requisite"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s027",
            "content": "We must integrate diverse opinions to articulate a global strategy.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "integrate",
              "diverse"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s028",
            "content": "The disseminated message will converge on the central proposition.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "disseminated",
              "message",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s029",
            "content": "The divergence from the treaty will create friction in global commerce.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "divergence",
              "from",
              "treaty"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s030",
            "content": "The local architecture is essential for the reciprocal commerce to flourish.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "local",
              "architecture",
              "essential"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s031",
            "content": "The homogeneous bloc will exploit the mandate to annex the land.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "homogeneous",
              "bloc",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s032",
            "content": "The sanction is bilateral, but the governance must be multilateral.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "sanction",
              "bilateral",
              "governance"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s033",
            "content": "We must negotiate a consensus to implement a sustainable protocol.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "negotiate",
              "consensus"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s034",
            "content": "Allocate funds to capitalize on the ubiquitous need for resilience.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "allocate",
              "funds",
              "capitalize"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s035",
            "content": "Fostering synergy allows the team to transcend the intrinsic friction.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "fostering",
              "synergy",
              "allows"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s036",
            "content": "The requisite fidelity in the vernacular is essential for clear discourse.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "requisite",
              "fidelity",
              "vernacular"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s037",
            "content": "Rhetoric is often used to intercede and undermine legitimate governance.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "rhetoric",
              "often",
              "used"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s038",
            "content": "The mandate to procure is exempt from the new jurisdiction.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "mandate",
              "procure",
              "exempt"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s039",
            "content": "The precedent is tacit but the protocol must be overt.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "precedent",
              "tacit",
              "protocol"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s040",
            "content": "The proxy of the sovereign will endorse the subjugated territory's architecture.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "proxy",
              "sovereign",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s041",
            "content": "The systemic disparity must be juxtaposed with the ideal norm of parity.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "systemic",
              "disparity",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s042",
            "content": "The liaison acts as a conduit for the framework's trajectory.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "liaison",
              "acts",
              "conduit"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s043",
            "content": "The current epoch marks the cessation of the volatile commerce.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "current",
              "epoch",
              "marks"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s044",
            "content": "The contingent proposition will augment the aptitude of the bloc.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "contingent",
              "proposition",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s045",
            "content": "A painful compromise will perpetuate discord and diminish resilience.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "painful",
              "compromise",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s046",
            "content": "We must arbitrate the discord and discredit the capricious claims.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "arbitrate",
              "discord"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s047",
            "content": "The tacit protocol was made overt by the pivotal amendment.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "tacit",
              "protocol",
              "made"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s048",
            "content": "Devise an essential architecture to diffuse the pronounced tension.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "devise",
              "essential",
              "architecture"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s049",
            "content": "The spectrum of opinions must be encompassed by the proposition.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "spectrum",
              "opinions",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s050",
            "content": "The capricious governance caused discord across the entire orbit.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "capricious",
              "governance",
              "caused"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s051",
            "content": "The aptitude to integrate systems is paramount for the nexus.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "aptitude",
              "integrate",
              "systems"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s052",
            "content": "The extent of the sanction will amend the global commerce modality.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "extent",
              "sanction",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s053",
            "content": "The nexus is pivotal to the governance of the orbit.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "nexus",
              "pivotal",
              "governance"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s054",
            "content": "The singular treaty will reconfigure the multilateral framework.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "singular",
              "treaty",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s055",
            "content": "The pronounced friction will diminish the aptitude for cohesion.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "pronounced",
              "friction",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s056",
            "content": "The catalyst for change must cultivate a legitimate governance.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "catalyst",
              "change",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s057",
            "content": "We must concede the local norm to integrate into the global framework.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "concede",
              "local"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s058",
            "content": "The endemic disparity is pervasive across the entire spectrum.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "endemic",
              "disparity",
              "pervasive"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s059",
            "content": "The asynchronous protocol must be amended to foster synergy.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "asynchronous",
              "protocol",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s060",
            "content": "Integrate the diverse elements to articulate a coherent proposition.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "integrate",
              "diverse",
              "elements"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s061",
            "content": "Disseminate the protocol to prevent fragmentation in the nexus.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "disseminate",
              "protocol",
              "prevent"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s062",
            "content": "The convergence of global and local efforts is essential for sustainable governance.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "convergence",
              "global",
              "local"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s063",
            "content": "The divergence from the norm will undermine the treaty and cause friction.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "divergence",
              "from",
              "norm"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s064",
            "content": "The architecture of global commerce requires reciprocal sanctions.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "architecture",
              "global",
              "commerce"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s065",
            "content": "The bilateral bloc must annex the local resources to exploit their aptitude.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "bilateral",
              "bloc",
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s066",
            "content": "We must negotiate a consensus to implement the multilateral mandate.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "negotiate",
              "consensus"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s067",
            "content": "Allocate resources to capitalize on the ubiquitous need to transcend discord.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "allocate",
              "resources",
              "capitalize"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s068",
            "content": "The intrinsic value is the requisite for high fidelity in discourse.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "intrinsic",
              "value",
              "requisite"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s069",
            "content": "The vernacular rhetoric will intercede and bolster the bloc's proposition.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "vernacular",
              "rhetoric",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s070",
            "content": "The governance is exempt from the sanction under this jurisdiction.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "governance",
              "exempt",
              "from"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s071",
            "content": "The precedent is tacit, but the sovereign must endorse the modality overtly.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "precedent",
              "tacit",
              "sovereign"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s072",
            "content": "The proxy will subjugate the local commerce under a capricious framework.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "proxy",
              "will",
              "subjugate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s073",
            "content": "Juxtapose the parity goal with the current disparity to devise a protocol.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "juxtapose",
              "parity",
              "goal"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s074",
            "content": "The liaison is the conduit for the framework's trajectory during this epoch.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "liaison",
              "conduit",
              "framework"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s075",
            "content": "The cessation of friction is contingent upon a painful compromise.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "cessation",
              "friction",
              "contingent"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s076",
            "content": "We must bolster resilience and augment the aptitude for sustainable governance.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "bolster",
              "resilience"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s077",
            "content": "The volatile market will perpetuate discord and diminish commerce.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "volatile",
              "market",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s078",
            "content": "The arbitrated solution will reconfigure the architecture to foster cohesion.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "arbitrated",
              "solution",
              "will"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s079",
            "content": "The diffuse spectrum of ideas is essential to encompass all propositions.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "diffuse",
              "spectrum",
              "ideas"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s080",
            "content": "The paramount aptitude of the team is the catalyst for the singular modality.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "paramount",
              "aptitude",
              "team"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s081",
            "content": "We must cultivate a legitimate governance to diminish the discord.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "must",
              "cultivate",
              "legitimate"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s082",
            "content": "The conceded point is pivotal to the multilateral treaty's extent.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "conceded",
              "point",
              "pivotal"
            ],
            "isBackup": false
          },
          {
            "id": "r3_s083",
            "content": "The pronounced friction will discredit the mandate to implement the protocol.",
            "difficulty": 3,
            "points": 75,
            "keyWords": [
              "pronounced",
              "friction",
              "will"
            ],
            "isBackup": false
          }
        ],
        "paragraphs": [
          {
            "id": "r3_p001",
            "content": "The plan is to integrate the local architecture with the global system to articulate a",
            "difficulty": 3,
            "points": 150,
            "keyWords": [
              "plan",
              "integrate",
              "local"
            ],
            "isBackup": false
          },
          {
            "id": "r3_p002",
            "content": "coherent strategy. This essential step aims to foster a sense of reciprocal benefit within",
            "difficulty": 3,
            "points": 150,
            "keyWords": [
              "coherent",
              "strategy",
              "this"
            ],
            "isBackup": false
          },
          {
            "id": "r3_p003",
            "content": "the diverse nexus. We must implement the protocol carefully to transcend the initial",
            "difficulty": 3,
            "points": 150,
            "keyWords": [
              "diverse",
              "nexus",
              "must"
            ],
            "isBackup": false
          }
        ]
      },
      "macroLevel4": {
        "level": 4,
        "name": "Macro Level 4",
        "description": "Reader Level 3, Macro Level 4 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      }
    }
  },
  "readerLevel4": {
    "readerLevel": 4,
    "macroLevels": {
      "macroLevel1": {
        "level": 1,
        "name": "Macro Level 1",
        "description": "Reader Level 4, Macro Level 1 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel2": {
        "level": 2,
        "name": "Macro Level 2",
        "description": "Reader Level 4, Macro Level 2 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel3": {
        "level": 3,
        "name": "Macro Level 3",
        "description": "Reader Level 4, Macro Level 3 content",
        "words": [],
        "sentences": [],
        "paragraphs": []
      },
      "macroLevel4": {
        "level": 4,
        "name": "Macro Level 4",
        "description": "Reader Level 4, Macro Level 4 content",
        "words": [
          {
            "id": "r4_w001",
            "content": "ideology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ideology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w001",
            "content": "intangible",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "intangible"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w001",
            "content": "paradigm",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "paradigm"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w002",
            "content": "ontology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ontology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w003",
            "content": "epistemology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "epistemology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w004",
            "content": "metaphysics",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "metaphysics"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w005",
            "content": "asceticism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "asceticism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w006",
            "content": "hedonism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "hedonism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w007",
            "content": "relativism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "relativism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w008",
            "content": "absolutism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "absolutism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w009",
            "content": "existential",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "existential"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w010",
            "content": "utilitarian",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "utilitarian"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w011",
            "content": "dialectic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "dialectic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w012",
            "content": "tautology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "tautology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w013",
            "content": "syllogism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "syllogism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w014",
            "content": "sophistry",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "sophistry"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w015",
            "content": "dichotomy",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "dichotomy"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w016",
            "content": "axiom",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "axiom"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w017",
            "content": "hypothesis",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w018",
            "content": "dogma",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "dogma"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w019",
            "content": "esoteric",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "esoteric"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w020",
            "content": "arcane",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "arcane"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w021",
            "content": "empirical",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "empirical"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w022",
            "content": "theoretical",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "theoretical"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w023",
            "content": "concrete",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "concrete"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w024",
            "content": "ephemeral",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ephemeral"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w025",
            "content": "eternal",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "eternal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w026",
            "content": "immutable",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "immutable"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w027",
            "content": "malleable",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "malleable"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w028",
            "content": "subjective",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "subjective"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w029",
            "content": "objective",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "objective"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w030",
            "content": "cognitive",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "cognitive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w031",
            "content": "intuition",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "intuition"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w032",
            "content": "subconscious",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "subconscious"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w033",
            "content": "conscious",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "conscious"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w034",
            "content": "volatile",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "volatile"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w035",
            "content": "stable",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "stable"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w036",
            "content": "pragmatic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "pragmatic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w037",
            "content": "idealistic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "idealistic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w038",
            "content": "fallacy",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "fallacy"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w039",
            "content": "conjecture",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "conjecture"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w040",
            "content": "postulate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "postulate"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w041",
            "content": "verify",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "verify"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w042",
            "content": "refute",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "refute"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w043",
            "content": "ascertain",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ascertain"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w044",
            "content": "surmise",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "surmise"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w045",
            "content": "equivocate",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "equivocate"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w046",
            "content": "unequivocal",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "unequivocal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w047",
            "content": "elusive",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "elusive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w048",
            "content": "lucid",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "lucid"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w049",
            "content": "opaque",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "opaque"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w050",
            "content": "coherence",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "coherence"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w051",
            "content": "ambiguity",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ambiguity"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w052",
            "content": "inference",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "inference"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w053",
            "content": "deduction",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "deduction"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w054",
            "content": "induction",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "induction"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w055",
            "content": "abstraction",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "abstraction"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w056",
            "content": "synthesis",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "synthesis"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w057",
            "content": "reductionism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "reductionism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w058",
            "content": "holistic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "holistic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w059",
            "content": "intrinsic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "intrinsic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w060",
            "content": "extrinsic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "extrinsic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w061",
            "content": "autonomous",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "autonomous"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w062",
            "content": "interdependent",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "interdependent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w063",
            "content": "inherent",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "inherent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w064",
            "content": "contingent",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "contingent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w065",
            "content": "spurious",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "spurious"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w066",
            "content": "germane",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "germane"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w067",
            "content": "peripheral",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "peripheral"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w068",
            "content": "salient",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "salient"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w069",
            "content": "pivotal",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "pivotal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w070",
            "content": "pervasive",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "pervasive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w071",
            "content": "cryptic",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "cryptic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w072",
            "content": "manifest",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "manifest"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w073",
            "content": "latent",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "latent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w074",
            "content": "vernacular",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "vernacular"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w075",
            "content": "nomenclature",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "nomenclature"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w076",
            "content": "semantic",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "semantic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w077",
            "content": "syntax",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "syntax"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w078",
            "content": "lexicon",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "lexicon"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w079",
            "content": "rhetoric",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "rhetoric"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w080",
            "content": "orthodox",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "orthodox"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w081",
            "content": "heterodox",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "heterodox"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w082",
            "content": "conventional",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "conventional"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w083",
            "content": "radical",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "radical"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w084",
            "content": "reactionary",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "reactionary"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w085",
            "content": "progressive",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "progressive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w086",
            "content": "transcendent",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "transcendent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w087",
            "content": "immanent",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "immanent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w088",
            "content": "secular",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "secular"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w089",
            "content": "divine",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "divine"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w090",
            "content": "cosmology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "cosmology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w091",
            "content": "teleology",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "teleology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w092",
            "content": "ethics",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "ethics"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w093",
            "content": "morality",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "morality"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w094",
            "content": "aesthetics",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "aesthetics"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w095",
            "content": "nihilism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "nihilism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w096",
            "content": "altruism",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "altruism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w097",
            "content": "egoism",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "egoism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w001",
            "content": "must",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "must"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w002",
            "content": "the",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "the"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w003",
            "content": "this",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "this"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w004",
            "content": "move",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "move"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w005",
            "content": "for",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "for"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w006",
            "content": "rejects",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "rejects"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w007",
            "content": "his",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "his"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w008",
            "content": "refuted",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "refuted"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w009",
            "content": "resistant",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "resistant"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w010",
            "content": "blind",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "blind"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w011",
            "content": "and",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "and"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w012",
            "content": "difficult",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "difficult"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w013",
            "content": "message",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "message"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w014",
            "content": "that",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w015",
            "content": "belief",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "belief"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w016",
            "content": "creating",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "creating"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w017",
            "content": "patient",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "patient"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w018",
            "content": "often",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w019",
            "content": "clearly",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "clearly"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w020",
            "content": "data",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w021",
            "content": "she",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "she"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w022",
            "content": "maintain",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "maintain"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w023",
            "content": "any",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "any"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w024",
            "content": "which",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "which"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w025",
            "content": "leading",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "leading"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w026",
            "content": "claims",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "claims"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w027",
            "content": "through",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "through"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w028",
            "content": "refuteing",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "refuteing"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w029",
            "content": "helps",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "helps"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w030",
            "content": "achieve",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "achieve"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w031",
            "content": "not",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "not"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w032",
            "content": "price",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "price"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w033",
            "content": "groupthink",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "groupthink"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w034",
            "content": "ascertaining",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "ascertaining"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w035",
            "content": "powerful",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "powerful"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w036",
            "content": "waiting",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "waiting"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w037",
            "content": "analysis",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "analysis"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w038",
            "content": "saw",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "saw"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w039",
            "content": "preferring",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "preferring"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w040",
            "content": "contrasts",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "contrasts"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w041",
            "content": "wrong",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "wrong"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w042",
            "content": "subjectively",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "subjectively"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w043",
            "content": "approach",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "approach"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w044",
            "content": "paramount",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "paramount"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w045",
            "content": "rigorous",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "rigorous"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w046",
            "content": "moves",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "moves"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w047",
            "content": "economics",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "economics"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w048",
            "content": "meaning",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "meaning"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w049",
            "content": "leads",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "leads"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w050",
            "content": "conclusion",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "conclusion"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w051",
            "content": "established",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "established"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w052",
            "content": "concept",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "concept"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w053",
            "content": "demonstrating",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "demonstrating"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w054",
            "content": "used",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "used"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w055",
            "content": "logical",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "logical"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w056",
            "content": "purpose",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "purpose"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w057",
            "content": "meaninglessness",
            "difficulty": 5,
            "points": 50,
            "keyWords": [
              "meaninglessness"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w058",
            "content": "self",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "self"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w059",
            "content": "linking",
            "difficulty": 4,
            "points": 40,
            "keyWords": [
              "linking"
            ],
            "isBackup": false
          },
          {
            "id": "r4_w060",
            "content": "only",
            "difficulty": 2,
            "points": 20,
            "keyWords": [
              "only"
            ],
            "isBackup": false
          }
        ],
        "sentences": [
          {
            "id": "r4_s001",
            "content": "The shift in paradigm necessitated a new approach to ontology and epistemology.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "shift",
              "paradigm",
              "necessitated"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s002",
            "content": "Metaphysics often explores the relationship between the ephemeral and the eternal.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "metaphysics",
              "often",
              "explores"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s003",
            "content": "Asceticism is the opposite of hedonism, prioritizing self-control over pleasure.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "asceticism",
              "opposite",
              "hedonism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s004",
            "content": "The debate between relativism and absolutism is pivotal to modern ethics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "debate",
              "between",
              "relativism"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s005",
            "content": "An existential crisis often forces one to question their inherent purpose.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "existential",
              "crisis",
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s006",
            "content": "Utilitarian ethics judge actions based on their objective outcome for the greater good.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "utilitarian",
              "ethics",
              "judge"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s007",
            "content": "The dialectic method uses a tautology to establish a foundation for the syllogism.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dialectic",
              "method",
              "uses"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s008",
            "content": "His use of sophistry made the argument spurious and led to a logical fallacy.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "sophistry",
              "made",
              "argument"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s009",
            "content": "The dichotomy between the concrete and the intangible is central to metaphysics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dichotomy",
              "between",
              "concrete"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s010",
            "content": "The fundamental axiom forms the basis of the hypothesis we aim to verify.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "fundamental",
              "axiom",
              "forms"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s011",
            "content": "Blind adherence to dogma makes the argument immutable and difficult to refute.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "blind",
              "adherence",
              "dogma"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s012",
            "content": "The esoteric text used arcane nomenclature that was difficult to ascertain.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "esoteric",
              "text",
              "used"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s013",
            "content": "We rely on empirical evidence rather than theoretical conjecture to verify the claims.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "rely",
              "empirical",
              "evidence"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s014",
            "content": "That political victory was ephemeral, while the cultural change proved eternal.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "that",
              "political",
              "victory"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s015",
            "content": "Belief systems that are immutable are often stable, resisting malleable dogma.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "belief",
              "systems",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s016",
            "content": "The analysis became too subjective, losing its objective and lucid coherence.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "analysis",
              "became",
              "subjective"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s017",
            "content": "Cognitive dissonance arises when intuition clashes with the conscious mind's logic.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "cognitive",
              "dissonance",
              "arises"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s018",
            "content": "A pragmatic approach to ethics contrasts sharply with an idealistic metaphysics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "pragmatic",
              "approach",
              "ethics"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s019",
            "content": "He based his entire hypothesis on a factual fallacy and a flawed conjecture.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "based",
              "entire",
              "hypothesis"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s020",
            "content": "We must postulate a new theory and then verify it using empirical data.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "must",
              "postulate",
              "theory"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s021",
            "content": "It is easier to refute a simple hypothesis than to ascertain an elusive truth.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "easier",
              "refute",
              "simple"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s022",
            "content": "She could only surmise the truth, deliberately choosing to equivocate on the facts.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "could",
              "only",
              "surmise"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s023",
            "content": "The results must be unequivocal and lucid, avoiding ambiguity and sophistry.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "results",
              "must",
              "unequivocal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s024",
            "content": "The elusive theory remained opaque due to the ambiguity in its nomenclature.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "elusive",
              "theory",
              "remained"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s025",
            "content": "The coherence of the argument was lost in its ambiguity and rhetoric.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "coherence",
              "argument",
              "lost"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s026",
            "content": "Through inference and deduction, we reached a lucid and unequivocal conclusion.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "through",
              "inference",
              "deduction"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s027",
            "content": "The induction method led to a solid hypothesis, but deduction provided the final proof.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "induction",
              "method",
              "solid"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s028",
            "content": "The abstraction of the concept required synthesis of theoretical and empirical data.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "abstraction",
              "concept",
              "required"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s029",
            "content": "Reductionism seeks to simplify the whole, while a holistic view emphasizes synthesis.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "reductionism",
              "seeks",
              "simplify"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s030",
            "content": "The intrinsic value of the art exists independently of its extrinsic market price.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "intrinsic",
              "value",
              "exists"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s031",
            "content": "The most salient point in the dialectic was also the most pivotal to the new paradigm.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "most",
              "salient",
              "point"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s032",
            "content": "His influence became pervasive because the core idea was so esoteric yet powerful.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "influence",
              "became",
              "pervasive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s033",
            "content": "The cryptic message made the meaning latent and difficult to manifest lucidly.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "cryptic",
              "message",
              "made"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s034",
            "content": "The emotional rhetoric overshadowed the dogma of the orthodox movement.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "emotional",
              "rhetoric",
              "overshadowed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s035",
            "content": "The heterodox view was deemed too radical by the conventional governance.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "heterodox",
              "view",
              "deemed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s036",
            "content": "The reactionary movement opposed the progressive new paradigm of metaphysics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "reactionary",
              "movement",
              "opposed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s037",
            "content": "The theory of the transcendent soul contrasts with the immanent belief in spirit.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "theory",
              "transcendent",
              "soul"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s038",
            "content": "Secular ethics are often separate from those derived from the divine command.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "secular",
              "ethics",
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s039",
            "content": "Cosmology deals with the eternal structure of the objective universe.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "cosmology",
              "deals",
              "with"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s040",
            "content": "Teleology argues that all things have an inherent purpose or ultimate goal.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "teleology",
              "argues",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s041",
            "content": "The value of aesthetics is often subjective, contrasting with the objective truth.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "value",
              "aesthetics",
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s042",
            "content": "Nihilism rejects all intrinsic value, unlike altruism and egoism.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "nihilism",
              "rejects",
              "intrinsic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s043",
            "content": "The new paradigm fundamentally changed the scientific ontology.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "paradigm",
              "fundamentally",
              "changed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s044",
            "content": "Epistemology concerns the nature of knowledge, including how we verify facts.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "epistemology",
              "concerns",
              "nature"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s045",
            "content": "Metaphysics investigates reality beyond empirical or concrete experience.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "metaphysics",
              "investigates",
              "reality"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s046",
            "content": "Asceticism views pleasure, or hedonism, as a moral fallacy.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "asceticism",
              "views",
              "pleasure"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s047",
            "content": "Relativism argues that no truth is absolute, and all is subjective.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "relativism",
              "argues",
              "that"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s048",
            "content": "Existential thought emphasizes autonomous choice and inherent freedom.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "existential",
              "thought",
              "emphasizes"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s049",
            "content": "A utilitarian approach often ignores subjective aesthetics for objective results.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "utilitarian",
              "approach",
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s050",
            "content": "The dialectic process aims to refute the initial hypothesis and reach synthesis.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dialectic",
              "process",
              "aims"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s051",
            "content": "A tautology adds nothing to the argument, unlike a structured syllogism.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "tautology",
              "adds",
              "nothing"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s052",
            "content": "His sophistry relied on ambiguity and led to a spurious conclusion.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "sophistry",
              "relied",
              "ambiguity"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s053",
            "content": "The dichotomy between volatile market prices and stable intrinsic value is salient.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dichotomy",
              "between",
              "volatile"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s054",
            "content": "An axiom is an immutable truth, forming the basis of all deduction.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "axiom",
              "immutable",
              "truth"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s055",
            "content": "The hypothesis must be verifiable using empirical and objective data.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "hypothesis",
              "must",
              "verifiable"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s056",
            "content": "The dogma became arcane and opaque, requiring esoteric knowledge to ascertain.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dogma",
              "became",
              "arcane"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s057",
            "content": "Empirical data is concrete, while theoretical models remain intangible conjecture.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "empirical",
              "data",
              "concrete"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s058",
            "content": "The fleeting joy was ephemeral, leaving behind an eternal sense of loss.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "fleeting",
              "ephemeral",
              "leaving"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s059",
            "content": "Immutable laws govern the universe, but human society remains malleable.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "immutable",
              "laws",
              "govern"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s060",
            "content": "Cognitive function relies on the integration of conscious thought and intuition.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "cognitive",
              "function",
              "relies"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s061",
            "content": "A volatile emotional state can quickly destabilize a seemingly stable argument.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "volatile",
              "emotional",
              "state"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s062",
            "content": "A pragmatic approach helps to refute an idealistic but ultimately spurious hypothesis.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "pragmatic",
              "approach",
              "helps"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s063",
            "content": "The logical fallacy was identified, leading to the complete refute of his conjecture.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "logical",
              "fallacy",
              "identified"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s064",
            "content": "We must postulate an unequivocal premise to avoid the trap of equivocateing.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "must",
              "postulate",
              "unequivocal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s065",
            "content": "We must verify the data and ascertain the truth, choosing not to merely surmise.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "must",
              "verify",
              "data"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s066",
            "content": "He chose to equivocate on the matter, making a truly unequivocal statement elusive.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "chose",
              "equivocate",
              "matter"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s067",
            "content": "The lucid explanation brought coherence where there was previously ambiguity.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "lucid",
              "explanation",
              "brought"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s068",
            "content": "The opaque and cryptic language was intentional to mislead the vernacular reader.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "opaque",
              "cryptic",
              "language"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s069",
            "content": "The inference was based on deduction, not mere conjecture or induction.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "inference",
              "based",
              "deduction"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s070",
            "content": "Induction uses empirical observation, while deduction relies on established axioms.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "induction",
              "uses",
              "empirical"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s071",
            "content": "Abstraction and synthesis are necessary to overcome reductionism in cosmology.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "abstraction",
              "synthesis",
              "necessary"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s072",
            "content": "The holistic view emphasizes interdependent systems over autonomous parts.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "holistic",
              "view",
              "emphasizes"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s073",
            "content": "The extrinsic reward was contingent upon achieving the intrinsic goal.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "extrinsic",
              "reward",
              "contingent"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s074",
            "content": "The spurious claim was deemed not germane and therefore peripheral to the debate.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "spurious",
              "claim",
              "deemed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s075",
            "content": "The salient detail was pivotal to resolving the cryptic message.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "salient",
              "detail",
              "pivotal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s076",
            "content": "The belief became pervasive despite its esoteric and arcane origins.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "belief",
              "became",
              "pervasive"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s077",
            "content": "The manifest error was caused by a latent and systemic fallacy.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "manifest",
              "error",
              "caused"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s078",
            "content": "The vernacular nomenclature differs from the precise semantic lexicon.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "vernacular",
              "nomenclature",
              "differs"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s079",
            "content": "The rhetoric used flawed syntax to distract from the orthodox dogma.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "rhetoric",
              "used",
              "flawed"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s080",
            "content": "The heterodox and radical elements challenged the conventional paradigm.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "heterodox",
              "radical",
              "elements"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s081",
            "content": "The reactionary forces resisted the progressive move toward a secular ontology.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "reactionary",
              "forces",
              "resisted"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s082",
            "content": "Transcendent thought often rejects the immanent reality of the concrete world.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "transcendent",
              "thought",
              "often"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s083",
            "content": "The divine right of kings is challenged by secular governance.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "divine",
              "right",
              "kings"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s084",
            "content": "Cosmology explores the teleology of the eternal universe.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "cosmology",
              "explores",
              "teleology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s085",
            "content": "Ethics and morality form the inherent basis of aesthetics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "ethics",
              "morality",
              "form"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s086",
            "content": "Aesthetics deals with subjective beauty, contrasting with objective ethics.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "aesthetics",
              "deals",
              "with"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s087",
            "content": "Nihilism rejects all teleology, embracing the ephemeral.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "nihilism",
              "rejects",
              "teleology"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s088",
            "content": "Altruism focuses on extrinsic benefit, while egoism focuses on the intrinsic.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "altruism",
              "focuses",
              "extrinsic"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s089",
            "content": "The metaphysics of the paradigm proved to be malleable.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "metaphysics",
              "paradigm",
              "proved"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s090",
            "content": "The dichotomy of conscious and subconscious is crucial to cognitive ontology.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "dichotomy",
              "conscious",
              "subconscious"
            ],
            "isBackup": false
          },
          {
            "id": "r4_s091",
            "content": "Idealistic thought often leads to an elusive and theoretical hypothesis.",
            "difficulty": 4,
            "points": 100,
            "keyWords": [
              "idealistic",
              "thought",
              "often"
            ],
            "isBackup": false
          }
        ],
        "paragraphs": [
          {
            "id": "r4_p001",
            "content": "The sudden shift in paradigm forced the committee to re-examine its basic ontology and",
            "difficulty": 4,
            "points": 200,
            "keyWords": [
              "sudden",
              "shift",
              "paradigm"
            ],
            "isBackup": false
          },
          {
            "id": "r4_p002",
            "content": "epistemology. This pivotal intellectual move was paramount for ascertaining whether",
            "difficulty": 4,
            "points": 200,
            "keyWords": [
              "epistemology",
              "this",
              "pivotal"
            ],
            "isBackup": false
          },
          {
            "id": "r4_p003",
            "content": "the new hypothesis was germane to the problem. They had to refute the old,",
            "difficulty": 4,
            "points": 200,
            "keyWords": [
              "hypothesis",
              "germane",
              "problem"
            ],
            "isBackup": false
          }
        ]
      }
    }
  }
};

export default GAME_CONTENT;
