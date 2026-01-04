// Content Extraction Utility
// This file will help extract and organize content from PDFs into the game data structure

import { MacroLevelContent, ContentItem } from '../data/gameContent';

export interface PDFContentExtractor {
  extractMacroLevelContent(pdfPath: string, readerLevel: 1 | 2 | 3 | 4): Promise<MacroLevelContent>;
}

// Temporary content processor for organizing content
export class ContentProcessor {
  
  // Process raw text into structured content items
  static processTextToItems(
    rawText: string, 
    type: 'words' | 'sentences' | 'paragraphs',
    macroLevel: 1 | 2 | 3 | 4,
    readerLevel: 1 | 2 | 3 | 4
  ): ContentItem[] {
    const items: ContentItem[] = [];
    
    if (type === 'words') {
      // Extract words (assuming space or newline separated)
      const words = rawText.split(/\s+/).filter(word => word.length > 0);
      
      words.forEach((word, index) => {
        if (index < 300) { // 100 main + 200 backup
          items.push({
            id: `r${readerLevel}_m${macroLevel}_w${index + 1}`,
            content: word.trim(),
            difficulty: this.calculateDifficulty(word, readerLevel),
            points: 1,
            keyWords: [word.toLowerCase()],
            isBackup: index >= 100
          });
        }
      });
    } 
    else if (type === 'sentences') {
      // Extract sentences (assuming period, exclamation, or question mark endings)
      const sentences = rawText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      
      sentences.forEach((sentence, index) => {
        if (index < 300) { // 100 main + 200 backup
          const cleanSentence = sentence.trim();
          items.push({
            id: `r${readerLevel}_m${macroLevel}_s${index + 1}`,
            content: cleanSentence + '.',
            difficulty: this.calculateDifficulty(cleanSentence, readerLevel),
            points: 2,
            keyWords: this.extractKeyWords(cleanSentence),
            isBackup: index >= 100
          });
        }
      });
    } 
    else if (type === 'paragraphs') {
      // Extract paragraphs (assuming double newline separation)
      const paragraphs = rawText.split(/\n\s*\n/).filter(para => para.trim().length > 0);
      
      paragraphs.forEach((paragraph, index) => {
        if (index < 300) { // 100 main + 200 backup
          const cleanParagraph = paragraph.trim().replace(/\s+/g, ' ');
          items.push({
            id: `r${readerLevel}_m${macroLevel}_p${index + 1}`,
            content: cleanParagraph,
            difficulty: this.calculateDifficulty(cleanParagraph, readerLevel),
            points: 3,
            keyWords: this.extractKeyWords(cleanParagraph),
            isBackup: index >= 100
          });
        }
      });
    }
    
    return items;
  }

  // Calculate difficulty based on content complexity and reader level
  private static calculateDifficulty(content: string, readerLevel: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 | 5 {
    const baseLevel = readerLevel;
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const syllableCount = this.estimateSyllables(content);
    
    // Simple difficulty calculation
    let difficulty = baseLevel;
    
    if (avgWordLength > 6) difficulty += 1;
    if (syllableCount / words.length > 2) difficulty += 1;
    if (words.length > 15) difficulty += 1;
    
    return Math.max(1, Math.min(5, difficulty)) as 1 | 2 | 3 | 4 | 5;
  }

  // Extract key words from content (simplified)
  private static extractKeyWords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter out short words
    
    // Remove common words
    const stopWords = ['the', 'and', 'but', 'that', 'this', 'with', 'have', 'will', 'been', 'from'];
    const keyWords = words.filter(word => !stopWords.includes(word));
    
    // Return top 5 key words
    return keyWords.slice(0, 5);
  }

  // Estimate syllable count (simplified)
  private static estimateSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;
    
    words.forEach(word => {
      // Simple syllable counting: count vowel groups
      const vowels = word.match(/[aeiouy]+/g);
      let syllables = vowels ? vowels.length : 1;
      
      // Adjust for silent e
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      totalSyllables += Math.max(1, syllables);
    });
    
    return totalSyllables;
  }

  // Generate macro level names based on reader level and macro level
  static getMacroLevelInfo(readerLevel: 1 | 2 | 3 | 4, macroLevel: 1 | 2 | 3 | 4) {
    const readerLevelInfo = {
      1: {
        1: { name: "Basic Foundation", description: "Essential everyday vocabulary and simple communication" },
        2: { name: "Basic Interaction", description: "Simple social interactions and basic needs" },
        3: { name: "Functional Communication", description: "Practical communication for daily activities" },
        4: { name: "Confident Expression", description: "Clear expression of ideas and opinions" }
      },
      2: {
        1: { name: "Social Foundations", description: "Building social communication skills" },
        2: { name: "Work Communication", description: "Professional and workplace interaction" },
        3: { name: "Community Engagement", description: "Participating in community activities" },
        4: { name: "Professional Interaction", description: "Advanced professional communication" }
      },
      3: {
        1: { name: "Academic Foundations", description: "Academic language and concepts" },
        2: { name: "Technical Communication", description: "Technical and specialized language" },
        3: { name: "Research & Analysis", description: "Research-based communication skills" },
        4: { name: "Professional Reports", description: "Formal reporting and presentation" }
      },
      4: {
        1: { name: "Abstract Concepts", description: "Complex abstract thinking and expression" },
        2: { name: "Theoretical Frameworks", description: "Theoretical and conceptual communication" },
        3: { name: "Critical Analysis", description: "Critical thinking and analytical expression" },
        4: { name: "Philosophical Discourse", description: "Highest level philosophical communication" }
      }
    };

    return readerLevelInfo[readerLevel][macroLevel];
  }
}

// Mock PDF content extractor for now - will be replaced with actual PDF processing
export class MockPDFExtractor implements PDFContentExtractor {
  
  async extractMacroLevelContent(pdfPath: string, readerLevel: 1 | 2 | 3 | 4): Promise<MacroLevelContent> {
    // This is a placeholder - in real implementation, you would:
    // 1. Read the PDF file using a PDF library
    // 2. Extract text content
    // 3. Parse and organize content by type (words, sentences, paragraphs)
    
    console.log(`Extracting content from ${pdfPath} for Reader Level ${readerLevel}`);
    
    // Mock extracted content based on reader level
    const sampleContent = this.generateSampleContent(readerLevel);
    const macroLevelInfo = ContentProcessor.getMacroLevelInfo(readerLevel, readerLevel); // Using readerLevel as macroLevel for demo
    
    return {
      level: readerLevel,
      name: macroLevelInfo.name,
      description: macroLevelInfo.description,
      words: ContentProcessor.processTextToItems(sampleContent.words, 'words', readerLevel, readerLevel),
      sentences: ContentProcessor.processTextToItems(sampleContent.sentences, 'sentences', readerLevel, readerLevel),
      paragraphs: ContentProcessor.processTextToItems(sampleContent.paragraphs, 'paragraphs', readerLevel, readerLevel)
    };
  }

  private generateSampleContent(readerLevel: 1 | 2 | 3 | 4) {
    const contentByLevel = {
      1: {
        words: "cat dog sun moon car home food water happy sad big small red blue yes no",
        sentences: "The cat is happy. The dog runs fast. I like food. The sun is bright.",
        paragraphs: "The cat sits in the sun. It is a warm day. The cat is happy and sleeps peacefully."
      },
      2: {
        words: "community work together family friends help support communicate share understand respect",
        sentences: "Our community works together. Family and friends help each other. Communication builds understanding.",
        paragraphs: "In our community, people work together to support each other. Families and friends communicate openly to build understanding and respect."
      },
      3: {
        words: "academic research analysis knowledge theory method investigation conclusion evidence data",
        sentences: "Academic research requires careful analysis. Knowledge comes from systematic investigation. Evidence supports theoretical conclusions.",
        paragraphs: "Academic research involves systematic investigation and careful analysis of data. Knowledge is built through methodical study that provides evidence to support or refute theoretical frameworks."
      },
      4: {
        words: "philosophical theoretical abstract conceptual metaphysical epistemological ontological phenomenological existential dialectical",
        sentences: "Philosophical inquiry explores abstract concepts. Theoretical frameworks guide epistemological investigation. Metaphysical questions challenge conventional understanding.",
        paragraphs: "Philosophical inquiry delves into abstract and theoretical concepts that challenge our fundamental understanding of existence. Epistemological and metaphysical frameworks provide the foundation for exploring complex phenomenological and existential questions."
      }
    };
    
    return contentByLevel[readerLevel];
  }
}

// Export utility functions
export const extractContentFromPDF = async (pdfPath: string, readerLevel: 1 | 2 | 3 | 4) => {
  const extractor = new MockPDFExtractor();
  return await extractor.extractMacroLevelContent(pdfPath, readerLevel);
};