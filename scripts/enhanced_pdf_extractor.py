#!/usr/bin/env python3
"""
Enhanced PDF Content Extractor for Pronunciation Learning App
Generates content in the exact format expected by the existing TypeScript interfaces
"""

import os
import json
import re
import uuid
from pathlib import Path

try:
    import pdfplumber
    PDF_LIBRARY = "pdfplumber"
except ImportError:
    print("Error: pdfplumber not found. Please install: pip install pdfplumber")
    exit(1)

def extract_pdf_text(pdf_path):
    """Extract text from PDF using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return text

def calculate_difficulty(content_type, length, reader_level):
    """Calculate difficulty based on content type, length, and reader level"""
    base_difficulty = reader_level  # Start with reader level as base
    
    if content_type == "word":
        if length <= 4:
            return min(base_difficulty, 2)
        elif length <= 7:
            return base_difficulty
        elif length <= 10:
            return min(base_difficulty + 1, 5)
        else:
            return 5
    elif content_type == "sentence":
        word_count = len(content_type.split())
        if word_count <= 8:
            return base_difficulty
        elif word_count <= 15:
            return min(base_difficulty + 1, 5)
        else:
            return 5
    else:  # paragraph
        word_count = len(content_type.split())
        if word_count <= 50:
            return base_difficulty
        elif word_count <= 100:
            return min(base_difficulty + 1, 5)
        else:
            return 5

def calculate_points(difficulty, content_type):
    """Calculate points based on difficulty and content type"""
    base_points = {
        "word": 10,
        "sentence": 25,
        "paragraph": 50
    }
    return base_points[content_type] * difficulty

def extract_key_words(content, content_type):
    """Extract key words from content for practice focus"""
    if content_type == "word":
        return [content.lower()]
    
    # Remove punctuation and get significant words (length > 3)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
    # Return up to 3 key words
    return words[:3]

def parse_structured_content(text, reader_level):
    """Parse PDF text into structured content with multiple macro levels"""
    
    content = {}
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Find all macro levels in the text
    macro_levels = {}
    current_macro = 1
    
    # Initialize macro levels 1-4
    for i in range(1, 5):
        macro_levels[i] = {
            "words": [],
            "sentences": [], 
            "paragraphs": []
        }
    
    current_section = "words"
    word_counter = 0
    sentence_counter = 0
    paragraph_counter = 0
    
    for line in lines:
        # Skip very short lines and headers
        if len(line) < 3:
            continue
            
        # Check for macro level indicators
        if re.search(r'macro.{0,10}level.{0,10}(\d+)', line.lower()):
            macro_match = re.search(r'macro.{0,10}level.{0,10}(\d+)', line.lower())
            if macro_match:
                new_macro = int(macro_match.group(1))
                if 1 <= new_macro <= 4:
                    current_macro = new_macro
                    word_counter = 0
                    sentence_counter = 0
                    paragraph_counter = 0
            continue
        
        # Check for section headers
        if any(word in line.lower() for word in ['words', 'vocabulary']):
            current_section = "words"
            continue
        elif any(word in line.lower() for word in ['sentences']):
            current_section = "sentences"
            continue
        elif any(word in line.lower() for word in ['paragraphs']):
            current_section = "paragraphs"
            continue
        
        # Skip administrative text
        if any(skip_word in line.lower() for skip_word in [
            'copy-paste', 'implementation', 'documentation', 'format',
            'listed sequentially', 'ordered 1 through', 'tier group'
        ]):
            continue
        
        # Process content based on current section
        if current_section == "words" and word_counter < 100:
            # Extract individual words
            word_match = re.match(r'^(\d+\.\s*)?([a-zA-Z]+)', line)
            if word_match and len(word_match.group(2)) > 2:
                word = word_match.group(2).lower()
                if word not in [item['content'] for item in macro_levels[current_macro]['words']]:
                    content_item = create_content_item(
                        word, "word", reader_level, word_counter
                    )
                    macro_levels[current_macro]['words'].append(content_item)
                    word_counter += 1
        
        elif current_section == "sentences" and sentence_counter < 100:
            # Check if line looks like a complete sentence
            if (line.endswith('.') or line.endswith('!') or line.endswith('?')) and len(line.split()) >= 4:
                sentence = re.sub(r'^\d+\.\s*', '', line)
                if len(sentence) > 10:  # Minimum sentence length
                    content_item = create_content_item(
                        sentence, "sentence", reader_level, sentence_counter
                    )
                    macro_levels[current_macro]['sentences'].append(content_item)
                    sentence_counter += 1
        
        elif current_section == "paragraphs" and paragraph_counter < 100:
            # Check if line looks like paragraph content
            if len(line.split()) >= 10:  # Minimum paragraph length
                paragraph = re.sub(r'^\d+\.\s*', '', line)
                content_item = create_content_item(
                    paragraph, "paragraph", reader_level, paragraph_counter
                )
                macro_levels[current_macro]['paragraphs'].append(content_item)
                paragraph_counter += 1
    
    # Structure for TypeScript interface
    result = {
        "readerLevel": reader_level,
        "macroLevels": {}
    }
    
    for macro_num in range(1, 5):
        macro_key = f"macroLevel{macro_num}"
        result["macroLevels"][macro_key] = {
            "level": macro_num,
            "name": f"Macro Level {macro_num}",
            "description": f"Reader Level {reader_level}, Macro Level {macro_num} content",
            "words": macro_levels[macro_num]["words"],
            "sentences": macro_levels[macro_num]["sentences"],
            "paragraphs": macro_levels[macro_num]["paragraphs"]
        }
    
    return result

def create_content_item(content, content_type, reader_level, index):
    """Create a ContentItem following the TypeScript interface"""
    difficulty = calculate_difficulty(content_type, len(content), reader_level)
    points = calculate_points(difficulty, content_type)
    key_words = extract_key_words(content, content_type)
    
    # Generate unique ID
    content_id = f"r{reader_level}_{content_type[0]}{index+1:03d}"
    
    return {
        "id": content_id,
        "content": content,
        "difficulty": difficulty,
        "points": points,
        "keyWords": key_words,
        "isBackup": False
    }

def main():
    base_path = r"c:\Users\User\Desktop\FeedbackPronounciation-apk\FeedbackPronounciation-apk\src\assets\content"
    pdf_files = [
        {
            "path": os.path.join(base_path, r"reader-level-1\Macro Level 1 - Content Compilation (Words, Senten_.pdf"),
            "reader_level": 1
        },
        {
            "path": os.path.join(base_path, r"reader-level-2\Macro Level 2 - Content Compilation (Words, Senten_.pdf"), 
            "reader_level": 2
        },
        {
            "path": os.path.join(base_path, r"reader-level-3\Macro Level 3 - Content Compilation (Words, Senten_.pdf"),
            "reader_level": 3
        },
        {
            "path": os.path.join(base_path, r"reader-level-4\Macro Level 4 - Content Compilation (Words, Senten_.pdf"),
            "reader_level": 4
        }
    ]
    
    print(f"Using PDF library: {PDF_LIBRARY}")
    
    all_content = {}
    
    for pdf_info in pdf_files:
        pdf_path = pdf_info["path"]
        reader_level = pdf_info["reader_level"]
        
        print(f"\nProcessing Reader Level {reader_level}...")
        
        if not os.path.exists(pdf_path):
            print(f"Warning: File not found - {pdf_path}")
            continue
            
        # Extract text from PDF
        text = extract_pdf_text(pdf_path)
        
        if not text.strip():
            print(f"Warning: No text extracted from {pdf_path}")
            continue
            
        print(f"Extracted {len(text)} characters from PDF")
        
        # Parse content structure
        structured_content = parse_structured_content(text, reader_level)
        all_content[f"readerLevel{reader_level}"] = structured_content
        
        # Print summary
        for macro_key, macro_content in structured_content["macroLevels"].items():
            print(f"  {macro_key}: {len(macro_content['words'])} words, {len(macro_content['sentences'])} sentences, {len(macro_content['paragraphs'])} paragraphs")
    
    # Save structured content
    output_file = "enhanced_content.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)
    
    print(f"\nContent saved to {output_file}")
    
    # Generate TypeScript content file
    generate_typescript_content(all_content)

def generate_typescript_content(content):
    """Generate TypeScript content file matching the existing structure"""
    
    ts_content = '''// Game Content Data Structure
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
export const GAME_CONTENT: { [key: string]: ReaderLevelData } = ''' + json.dumps(content, indent=2) + ''';

export default GAME_CONTENT;
'''
    
    # Write TypeScript file
    with open('gameContentGenerated.ts', 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print("TypeScript content file created: gameContentGenerated.ts")

if __name__ == "__main__":
    main()