#!/usr/bin/env python3
"""
Convert Ready Read Curriculum CSVs to gameContent.json
Reads all Reader Level CSV files and generates structured game content
"""

import csv
import json
import os
from pathlib import Path
from typing import List, Dict, Any

def parse_csv_file(filepath: str) -> Dict[str, Any]:
    """Parse a single Reader Level CSV file"""
    # Extract reader level number from filename
    filename = os.path.basename(filepath)
    reader_level_num = ''.join(filter(str.isdigit, filename.split()[-1]))
    
    sections = {
        'words': [],
        'sentences': [],
        'paragraphs': []
    }
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_type = None
    
    for line in lines:
        line = line.strip()
        
        # Detect section headers
        if 'Vocabulary' in line:
            current_type = 'words'
            continue
        elif 'Sentences' in line:
            current_type = 'sentences'
            continue
        elif 'Paragraphs' in line:
            current_type = 'paragraphs'
            continue
        
        # Skip empty lines and header rows
        if not line or ',,,' in line:
            continue
        if line.startswith('Tier,Entry'):
            continue
        
        # Parse CSV line
        parts = [p.strip().strip('"') for p in line.split(',')]
        
        if len(parts) >= 3 and current_type and parts[0].startswith('Tier'):
            try:
                tier_str = parts[0]  # e.g., "Tier 1"
                entry_str = parts[1]  # e.g., "1"
                content = parts[2]   # The actual content
                
                # Extract tier number
                tier_num = int(tier_str.split()[-1])
                entry_num = entry_str
                
                # Map tier to difficulty within content type
                if current_type == 'words':
                    difficulty = min(5, max(1, (tier_num - 1) // 2 + 1))  # Tiers 1-10 -> difficulty 1-5
                elif current_type == 'sentences':
                    difficulty = min(5, max(1, (tier_num - 11) // 2 + 1))  # Tiers 11-20 -> difficulty 1-5
                else:  # paragraphs
                    difficulty = min(5, max(1, (tier_num - 21) // 2 + 1))  # Tiers 21-30 -> difficulty 1-5
                
                # Determine base points
                if current_type == 'words':
                    base_points = 1
                elif current_type == 'sentences':
                    base_points = 2
                else:  # paragraphs
                    base_points = 3
                
                item = {
                    'id': f'r{reader_level_num}_{current_type[0]}{tier_num}_{entry_num}',
                    'text': content,
                    'type': current_type[:-1] if current_type != 'words' else 'word',
                    'difficulty': difficulty,
                    'category': '',
                    'keyWords': content.split()[:5],
                    'basePoints': base_points
                }
                
                sections[current_type].append(item)
            except (ValueError, IndexError):
                # Skip malformed lines
                continue
    
    return {
        'readerLevel': reader_level_num,
        'sections': sections
    }

def organize_into_macro_levels(sections: Dict[str, List[Dict]]) -> List[Dict]:
    """Organize 100 words/sentences/paragraphs into 4 macro levels of 25 each"""
    macro_levels = []
    
    for macro_idx in range(1, 5):
        start_idx = (macro_idx - 1) * 25
        end_idx = start_idx + 25
        
        macro_level = {
            'id': f'm{macro_idx}',
            'name': f'Level {macro_idx}',
            'description': f'Macro Level {macro_idx}',
            'contentByType': {
                'words': sections['words'][start_idx:end_idx],
                'sentences': sections['sentences'][start_idx:end_idx],
                'paragraphs': sections['paragraphs'][start_idx:end_idx]
            }
        }
        macro_levels.append(macro_level)
    
    return macro_levels

def create_game_content_json(csv_dir: str, output_file: str):
    """Create gameContent.json from all Reader Level CSV files"""
    
    game_content = {
        'readerLevels': [],
        'metadata': {
            'version': '2.1.0',
            'lastUpdated': '2026-04-15',
            'source': 'Ready Read Curriculum CSV Files',
            'totalItems': 0
        }
    }
    
    reader_descriptions = {
        '1': {
            'name': 'Reader Level 1',
            'focus': 'Everyday Language',
            'description': 'Basic vocabulary and everyday communication'
        },
        '2': {
            'name': 'Reader Level 2',
            'focus': 'Transactional & Social Language',
            'description': 'Social interactions and work-related communication'
        },
        '3': {
            'name': 'Reader Level 3',
            'focus': 'Academic & Technical Language',
            'description': 'Academic vocabulary and technical concepts'
        },
        '4': {
            'name': 'Reader Level 4',
            'focus': 'Abstract & Philosophical Language',
            'description': 'Abstract concepts and philosophical vocabulary'
        }
    }
    
    # Find all CSV files
    csv_files = sorted([f for f in os.listdir(csv_dir) if f.endswith('.csv')])
    
    for csv_file in csv_files:
        filepath = os.path.join(csv_dir, csv_file)
        print(f"Processing {csv_file}...")
        
        parsed = parse_csv_file(filepath)
        reader_level_num = parsed['readerLevel']
        
        # Organize into macro levels
        macro_levels = organize_into_macro_levels(parsed['sections'])
        
        # Count total items
        total_items = (
            len(parsed['sections']['words']) + 
            len(parsed['sections']['sentences']) + 
            len(parsed['sections']['paragraphs'])
        )
        
        reader_level = {
            'id': f'r{reader_level_num}',
            'name': reader_descriptions[reader_level_num]['name'],
            'focus': reader_descriptions[reader_level_num]['focus'],
            'description': reader_descriptions[reader_level_num]['description'],
            'macroLevels': macro_levels
        }
        
        game_content['readerLevels'].append(reader_level)
        game_content['metadata']['totalItems'] += total_items
    
    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(game_content, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Created {output_file}")
    print(f"   - {len(game_content['readerLevels'])} reader levels")
    print(f"   - {game_content['metadata']['totalItems']} total content items")

if __name__ == '__main__':
    csv_dir = Path('/Users/aironevonnvillasor/FeedbackPronounciation-apk')
    output_file = csv_dir / 'public' / 'gameContent.json'
    
    create_game_content_json(str(csv_dir), str(output_file))
