#!/usr/bin/env python3
"""
PDF Content Extractor for Pronunciation Learning App

This script extracts structured content from PDF files containing:
- Reader Levels (1-4)
- Macro Levels (1-4 within each reader level)  
- Content types: Words, Sentences, Paragraphs

Usage: python extract_pdf_content.py
"""

import os
import json
import re
from pathlib import Path

try:
    import PyPDF2
    PDF_LIBRARY = "PyPDF2"
except ImportError:
    try:
        import pdfplumber
        PDF_LIBRARY = "pdfplumber"
    except ImportError:
        try:
            import fitz  # pymupdf
            PDF_LIBRARY = "pymupdf"
        except ImportError:
            print("Error: No PDF library found. Please install one of:")
            print("  pip install PyPDF2")
            print("  pip install pdfplumber") 
            print("  pip install pymupdf")
            exit(1)

def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path} with PyPDF2: {e}")
    return text

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path} with pdfplumber: {e}")
    return text

def extract_text_pymupdf(pdf_path):
    """Extract text using PyMuPDF"""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        print(f"Error reading {pdf_path} with PyMuPDF: {e}")
    return text

def extract_pdf_text(pdf_path):
    """Extract text from PDF using available library"""
    if PDF_LIBRARY == "PyPDF2":
        return extract_text_pypdf2(pdf_path)
    elif PDF_LIBRARY == "pdfplumber":
        return extract_text_pdfplumber(pdf_path)
    elif PDF_LIBRARY == "pymupdf":
        return extract_text_pymupdf(pdf_path)
    return ""

def parse_content_structure(text, reader_level):
    """Parse extracted text into structured content"""
    
    # Initialize structure
    content = {
        f"reader_level_{reader_level}": {}
    }
    
    # Split text into lines and clean
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Patterns to identify content types
    word_patterns = [
        r'^[A-Za-z]+$',  # Single words
        r'^\d+\.\s*[A-Za-z]+',  # Numbered words
        r'^[A-Za-z]+\s*-\s*',  # Words with dashes
    ]
    
    sentence_patterns = [
        r'^[A-Z][^.!?]*[.!?]$',  # Complete sentences
        r'^\d+\.\s*[A-Z][^.!?]*[.!?]',  # Numbered sentences
    ]
    
    paragraph_patterns = [
        r'^[A-Z][^.!?]*[.!?].*[.!?]$',  # Multi-sentence content
    ]
    
    current_macro = 1
    current_section = "words"
    
    words = []
    sentences = []
    paragraphs = []
    
    for line in lines:
        # Skip headers, page numbers, etc.
        if len(line) < 3 or line.lower().startswith(('page', 'level', 'macro')):
            # Check if this indicates a new macro level
            if 'macro' in line.lower() and any(c.isdigit() for c in line):
                macro_match = re.search(r'(\d+)', line)
                if macro_match:
                    # Save current macro data
                    if words or sentences or paragraphs:
                        content[f"reader_level_{reader_level}"][f"macro_{current_macro}"] = {
                            "words": words[:10],  # Limit to 10
                            "sentences": sentences[:10],
                            "paragraphs": paragraphs[:10]
                        }
                    
                    # Reset for new macro
                    current_macro = int(macro_match.group(1))
                    words, sentences, paragraphs = [], [], []
            continue
        
        # Determine content type and add to appropriate list
        if any(re.match(pattern, line) for pattern in word_patterns):
            if len(words) < 10:
                # Extract just the word, remove numbering
                word = re.sub(r'^\d+\.\s*', '', line)
                word = re.sub(r'\s*-.*$', '', word)
                words.append({
                    "word": word.strip(),
                    "difficulty": determine_difficulty(word.strip())
                })
        
        elif any(re.match(pattern, line) for pattern in sentence_patterns):
            if len(sentences) < 10:
                sentence = re.sub(r'^\d+\.\s*', '', line)
                sentences.append(sentence.strip())
        
        elif len(line.split('.')) > 1:  # Likely a paragraph
            if len(paragraphs) < 10:
                paragraph = re.sub(r'^\d+\.\s*', '', line)
                paragraphs.append(paragraph.strip())
    
    # Save final macro data
    if words or sentences or paragraphs:
        content[f"reader_level_{reader_level}"][f"macro_{current_macro}"] = {
            "words": words[:10],
            "sentences": sentences[:10], 
            "paragraphs": paragraphs[:10]
        }
    
    return content

def determine_difficulty(word):
    """Determine difficulty level based on word characteristics"""
    length = len(word)
    
    if length <= 3:
        return "easy"
    elif length <= 6:
        return "medium"
    elif length <= 9:
        return "hard"
    else:
        return "expert"

def main():
    # Define PDF file paths - using absolute paths
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
        structured_content = parse_content_structure(text, reader_level)
        all_content.update(structured_content)
        
        print(f"Structured content for Reader Level {reader_level}:")
        for macro_key, macro_content in structured_content[f"reader_level_{reader_level}"].items():
            print(f"  {macro_key}: {len(macro_content['words'])} words, {len(macro_content['sentences'])} sentences, {len(macro_content['paragraphs'])} paragraphs")
    
    # Save to JSON file
    output_file = "extracted_content.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)
    
    print(f"\nContent saved to {output_file}")
    
    # Also create TypeScript interface
    create_typescript_interface(all_content)

def create_typescript_interface(content):
    """Create TypeScript interface and data file"""
    
    ts_interface = '''// Generated TypeScript interfaces for pronunciation content
export interface WordItem {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface MacroContent {
  words: WordItem[];
  sentences: string[];
  paragraphs: string[];
}

export interface ReaderLevel {
  [macroKey: string]: MacroContent;
}

export interface PronunciationContent {
  [readerKey: string]: ReaderLevel;
}
'''
    
    ts_data = f'''import {{ PronunciationContent }} from './contentTypes';

export const pronunciationContent: PronunciationContent = {json.dumps(content, indent=2)};
'''
    
    # Write TypeScript files
    with open('contentTypes.ts', 'w', encoding='utf-8') as f:
        f.write(ts_interface)
    
    with open('contentData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_data)
    
    print("TypeScript files created: contentTypes.ts, contentData.ts")

if __name__ == "__main__":
    main()