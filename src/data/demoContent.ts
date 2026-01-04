// Demo Content Implementation
// This file demonstrates how to populate the game content from the PDF files
// Place your extracted PDF content here organized by Reader Level and Macro Level

import { GAME_CONTENT } from './gameContent';
import { ContentProcessor } from '../utils/contentExtractor';

// Sample content extracted from "Macro Level 1-4 - Content Compilation" PDFs
// Replace these with actual extracted content from your PDFs

const READER_LEVEL_1_CONTENT = {
  macroLevel1: {
    words: "cat dog sun moon car home food water happy sad big small red blue yes no help love run walk book read write day night good bad hot cold new old come go see look hear listen speak talk eat drink sleep wake work play clean dirty up down in out here there this that",
    sentences: "The cat is happy. The dog runs fast. I like food. The sun is bright. We go home now. Books help us learn. Red cars go fast. I can see you. The water is cold. Come here please. Good morning everyone. The moon shines bright. We eat together daily. Children play outside happily. Time to go now.",
    paragraphs: "The cat sits in the sun. It is a warm day. The cat is happy and sleeps peacefully. When evening comes, the cat wakes up and looks for food.\n\nEvery morning, people go to work. They drive cars or take buses. The city is busy with many sounds. At night, everyone goes home to rest.\n\nBooks are important for learning. They help us understand the world. Reading every day makes us smarter. We can learn about many different places and people through books."
  },
  macroLevel2: {
    words: "friend family people work school learn teach study help support meet greet talk discuss share care respect understand communicate listen speak answer question problem solution together community group team join participate contribute organize plan prepare arrange decide choose select prefer suggest recommend",
    sentences: "Friends help each other always. We work together as team. School teaches us important things. People need to communicate clearly. Family support makes us strong. Let's meet tomorrow morning. Please listen to the teacher. We should respect all people. Can you help me please? The community works together well.",
    paragraphs: "Friendship is very important in life. Good friends support each other through difficult times. They listen when you have problems and celebrate when good things happen. True friends respect your feelings and help you grow as a person.\n\nWorking in teams helps us achieve more. When people combine their skills and knowledge, they can solve complex problems. Good teamwork requires communication, respect, and shared goals. Everyone should contribute their best efforts.\n\nCommunication is the foundation of all relationships. We must learn to express our thoughts clearly and listen to others carefully. Good communication helps prevent misunderstandings and builds stronger connections between people."
  },
  // Add more macro levels...
};

const READER_LEVEL_2_CONTENT = {
  macroLevel1: {
    words: "colleague workplace professional responsibility deadline project meeting presentation report analysis evaluation assessment feedback performance improvement development career advancement opportunity challenge obstacle overcome achievement success failure experience knowledge skill competence expertise specialization",
    sentences: "Professional colleagues collaborate effectively on projects. Workplace communication requires clear and respectful language. Meeting deadlines demonstrates reliability and commitment. Presentations should be well-organized and engaging. Performance evaluations help identify areas for improvement. Career development requires continuous learning and skill building.",
    paragraphs: "The modern workplace demands strong communication skills. Professionals must interact effectively with colleagues, clients, and supervisors. Clear verbal and written communication prevents misunderstandings and ensures project success. Regular feedback helps employees improve their performance and advance their careers.\n\nSuccessful project management requires careful planning and coordination. Teams must establish clear timelines, assign responsibilities, and maintain regular communication. When challenges arise, effective problem-solving skills help find solutions quickly and efficiently.\n\nCareer advancement depends on continuous professional development. Employees should seek opportunities to learn new skills and gain experience in different areas. Building expertise and demonstrating competence leads to greater responsibility and career opportunities."
  },
  // Add more macro levels...
};

// Function to populate the game content with extracted PDF data
export function populateGameContent() {
  try {
    // Process Reader Level 1 content
    const r1m1 = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel1.words, 'words', 1, 1);
    const r1m1_sentences = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel1.sentences, 'sentences', 1, 1);
    const r1m1_paragraphs = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel1.paragraphs, 'paragraphs', 1, 1);
    
    // Update the game content
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.words = r1m1;
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.sentences = r1m1_sentences;
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.paragraphs = r1m1_paragraphs;

    // Process Reader Level 1, Macro Level 2
    const r1m2 = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel2.words, 'words', 2, 1);
    const r1m2_sentences = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel2.sentences, 'sentences', 2, 1);
    const r1m2_paragraphs = ContentProcessor.processTextToItems(READER_LEVEL_1_CONTENT.macroLevel2.paragraphs, 'paragraphs', 2, 1);
    
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel2.words = r1m2;
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel2.sentences = r1m2_sentences;
    GAME_CONTENT['reader-level-1'].macroLevels.macroLevel2.paragraphs = r1m2_paragraphs;

    // Process Reader Level 2 content
    const r2m1 = ContentProcessor.processTextToItems(READER_LEVEL_2_CONTENT.macroLevel1.words, 'words', 1, 2);
    const r2m1_sentences = ContentProcessor.processTextToItems(READER_LEVEL_2_CONTENT.macroLevel1.sentences, 'sentences', 1, 2);
    const r2m1_paragraphs = ContentProcessor.processTextToItems(READER_LEVEL_2_CONTENT.macroLevel1.paragraphs, 'paragraphs', 1, 2);
    
    GAME_CONTENT['reader-level-2'].macroLevels.macroLevel1.words = r2m1;
    GAME_CONTENT['reader-level-2'].macroLevels.macroLevel1.sentences = r2m1_sentences;
    GAME_CONTENT['reader-level-2'].macroLevels.macroLevel1.paragraphs = r2m1_paragraphs;

    console.log('Game content populated successfully!');
    
    // Log sample content for verification
    console.log('Sample Word:', GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.words[0]);
    console.log('Sample Sentence:', GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.sentences[0]);
    console.log('Sample Paragraph:', GAME_CONTENT['reader-level-1'].macroLevels.macroLevel1.paragraphs[0]);
    
    return true;
  } catch (error) {
    console.error('Error populating game content:', error);
    return false;
  }
}

// Instructions for adding your PDF content:
// 
// 1. Extract text from each PDF file:
//    - "Macro Level 1 - Content Compilation.pdf" -> Reader Level 1 content
//    - "Macro Level 2 - Content Compilation.pdf" -> Reader Level 2 content  
//    - "Macro Level 3 - Content Compilation.pdf" -> Reader Level 3 content
//    - "Macro Level 4 - Content Compilation.pdf" -> Reader Level 4 content
//
// 2. For each Reader Level, organize content into 4 Macro Levels:
//    - Each Macro Level should have: words, sentences, paragraphs
//    - Aim for 100 main items + 200 backup items per type (300 total)
//    - Words: single vocabulary items
//    - Sentences: complete sentences (1-2 lines)
//    - Paragraphs: multi-sentence text blocks (3-5 sentences)
//
// 3. Replace the sample content above with your extracted PDF content
//
// 4. Call populateGameContent() when the app starts to load all content
//
// Example PDF extraction workflow:
// - Use a PDF-to-text tool to extract raw text
// - Manually organize by content type and difficulty
// - Copy-paste into the content objects above
// - Test the app to ensure content loads correctly

export default populateGameContent;