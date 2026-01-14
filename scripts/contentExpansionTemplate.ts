/**
 * Content Expansion Template
 * Use this as a guide to add more content variations to gameContent.ts
 * 
 * Each macro level should have:
 * - 30 words (10 each of difficulty 1, 2, 3)
 * - 30 sentences (10 each of difficulty 1, 2, 3)
 * - 30 paragraphs (10 each of difficulty 1, 2, 3)
 */

// Example: Reader Level 1, Macro Level 2 - Basic Interaction
// Additional words to add (11-30):

const additionalWords = [
  { id: "r1_m2_w11", content: "goodbye", difficulty: 1, points: 1, keyWords: ["goodbye"] },
  { id: "r1_m2_w12", content: "yes", difficulty: 1, points: 1, keyWords: ["yes"] },
  { id: "r1_m2_w13", content: "no", difficulty: 1, points: 1, keyWords: ["no"] },
  { id: "r1_m2_w14", content: "welcome", difficulty: 1, points: 1, keyWords: ["welcome"] },
  { id: "r1_m2_w15", content: "excuse", difficulty: 2, points: 1, keyWords: ["excuse"] },
  { id: "r1_m2_w16", content: "pardon", difficulty: 2, points: 1, keyWords: ["pardon"] },
  { id: "r1_m2_w17", content: "morning", difficulty: 2, points: 1, keyWords: ["morning"] },
  { id: "r1_m2_w18", content: "evening", difficulty: 2, points: 1, keyWords: ["evening"] },
  { id: "r1_m2_w19", content: "night", difficulty: 2, points: 1, keyWords: ["night"] },
  { id: "r1_m2_w20", content: "price", difficulty: 2, points: 1, keyWords: ["price"] },
  { id: "r1_m2_w21", content: "question", difficulty: 3, points: 1, keyWords: ["question"] },
  { id: "r1_m2_w22", content: "answer", difficulty: 3, points: 1, keyWords: ["answer"] },
  { id: "r1_m2_w23", content: "understand", difficulty: 3, points: 1, keyWords: ["understand"] },
  { id: "r1_m2_w24", content: "repeat", difficulty: 3, points: 1, keyWords: ["repeat"] },
  { id: "r1_m2_w25", content: "hospital", difficulty: 3, points: 1, keyWords: ["hospital"] },
  { id: "r1_m2_w26", content: "police", difficulty: 3, points: 1, keyWords: ["police"] },
  { id: "r1_m2_w27", content: "restaurant", difficulty: 3, points: 1, keyWords: ["restaurant"] },
  { id: "r1_m2_w28", content: "bathroom", difficulty: 3, points: 1, keyWords: ["bathroom"] },
  { id: "r1_m2_w29", content: "pharmacy", difficulty: 3, points: 1, keyWords: ["pharmacy"] },
  { id: "r1_m2_w30", content: "library", difficulty: 3, points: 1, keyWords: ["library"] }
];

const additionalSentences = [
  { id: "r1_m2_s11", content: "Goodbye, see you later.", difficulty: 1, points: 2, keyWords: ["goodbye", "see", "later"] },
  { id: "r1_m2_s12", content: "Yes, I agree.", difficulty: 1, points: 2, keyWords: ["yes", "agree"] },
  { id: "r1_m2_s13", content: "No, thank you.", difficulty: 1, points: 2, keyWords: ["no", "thank", "you"] },
  { id: "r1_m2_s14", content: "You are welcome.", difficulty: 1, points: 2, keyWords: ["you", "welcome"] },
  { id: "r1_m2_s15", content: "Excuse me please.", difficulty: 2, points: 2, keyWords: ["excuse", "me", "please"] },
  { id: "r1_m2_s16", content: "I beg your pardon.", difficulty: 2, points: 2, keyWords: ["beg", "pardon"] },
  { id: "r1_m2_s17", content: "Good morning everyone.", difficulty: 2, points: 2, keyWords: ["good", "morning", "everyone"] },
  { id: "r1_m2_s18", content: "Good evening to you.", difficulty: 2, points: 2, keyWords: ["good", "evening"] },
  { id: "r1_m2_s19", content: "Have a good night.", difficulty: 2, points: 2, keyWords: ["have", "good", "night"] },
  { id: "r1_m2_s20", content: "What is the price?", difficulty: 2, points: 2, keyWords: ["what", "price"] },
  { id: "r1_m2_s21", content: "I have a question.", difficulty: 3, points: 2, keyWords: ["have", "question"] },
  { id: "r1_m2_s22", content: "Can you answer this?", difficulty: 3, points: 2, keyWords: ["can", "answer", "this"] },
  { id: "r1_m2_s23", content: "I don't understand.", difficulty: 3, points: 2, keyWords: ["don't", "understand"] },
  { id: "r1_m2_s24", content: "Please repeat that.", difficulty: 3, points: 2, keyWords: ["please", "repeat", "that"] },
  { id: "r1_m2_s25", content: "Where is the hospital?", difficulty: 3, points: 2, keyWords: ["where", "hospital"] },
  { id: "r1_m2_s26", content: "Call the police please.", difficulty: 3, points: 2, keyWords: ["call", "police", "please"] },
  { id: "r1_m2_s27", content: "Let's eat at the restaurant.", difficulty: 3, points: 2, keyWords: ["eat", "restaurant"] },
  { id: "r1_m2_s28", content: "I need the bathroom.", difficulty: 3, points: 2, keyWords: ["need", "bathroom"] },
  { id: "r1_m2_s29", content: "The pharmacy is closed.", difficulty: 3, points: 2, keyWords: ["pharmacy", "closed"] },
  { id: "r1_m2_s30", content: "I study at the library.", difficulty: 3, points: 2, keyWords: ["study", "library"] }
];

const additionalParagraphs = [
  { id: "r1_m2_p11", content: "When I leave, I always say goodbye. It is polite to say goodbye. People appreciate good manners.", difficulty: 1, points: 3, keyWords: ["leave", "goodbye", "polite", "people", "manners"] },
  { id: "r1_m2_p12", content: "If someone asks me a question, I say yes or no. It is important to give clear answers. Communication works better this way.", difficulty: 1, points: 3, keyWords: ["question", "yes", "no", "clear", "answers", "communication"] },
  { id: "r1_m2_p13", content: "When someone thanks me, I say you are welcome. This shows respect and kindness. Being polite makes people happy.", difficulty: 1, points: 3, keyWords: ["thanks", "welcome", "respect", "kindness", "polite", "happy"] },
  { id: "r1_m2_p14", content: "Sometimes I need to get someone's attention. I say excuse me first. Then I ask my question politely.", difficulty: 2, points: 3, keyWords: ["need", "attention", "excuse", "me", "ask", "question", "politely"] },
  { id: "r1_m2_p15", content: "Every morning I greet people. I say good morning with a smile. Starting the day with kindness is important.", difficulty: 2, points: 3, keyWords: ["morning", "greet", "people", "smile", "starting", "day", "kindness"] },
  { id: "r1_m2_p16", content: "In the evening, I say good evening. At night, I wish people good night. Time of day matters in greetings.", difficulty: 2, points: 3, keyWords: ["evening", "night", "wish", "time", "day", "greetings"] },
  { id: "r1_m2_p17", content: "Before I buy something, I ask about the price. Knowing the cost is important. I want to spend my money wisely.", difficulty: 2, points: 3, keyWords: ["buy", "price", "cost", "important", "spend", "money", "wisely"] },
  { id: "r1_m2_p18", content: "When I don't understand something, I ask questions. There is no shame in asking. Learning requires asking for help sometimes.", difficulty: 3, points: 3, keyWords: ["don't", "understand", "ask", "questions", "shame", "learning", "help"] },
  { id: "r1_m2_p19", content: "If I can't hear clearly, I ask people to repeat. It is better to ask than to guess. Clear communication prevents mistakes.", difficulty: 3, points: 3, keyWords: ["can't", "hear", "repeat", "better", "guess", "communication", "prevents", "mistakes"] },
  { id: "r1_m2_p20", content: "I know where important places are located. The hospital helps sick people. The police keep us safe. These places are very important.", difficulty: 3, points: 3, keyWords: ["know", "important", "places", "hospital", "sick", "police", "safe"] },
  { id: "r1_m2_p21", content: "My favorite restaurant has delicious food. The workers are always friendly. I enjoy eating there with my family.", difficulty: 3, points: 3, keyWords: ["favorite", "restaurant", "delicious", "workers", "friendly", "enjoy", "eating", "family"] },
  { id: "r1_m2_p22", content: "Public bathrooms are useful when traveling. It is important to know where they are. Most stores have public bathrooms available.", difficulty: 3, points: 3, keyWords: ["bathrooms", "useful", "traveling", "important", "know", "stores", "available"] },
  { id: "r1_m2_p23", content: "When I need medicine, I go to the pharmacy. The pharmacist is very helpful. They answer all my questions about medicine.", difficulty: 3, points: 3, keyWords: ["medicine", "pharmacy", "pharmacist", "helpful", "answer", "questions"] },
  { id: "r1_m2_p24", content: "The library is a quiet place to study. There are many books to read. I visit the library every week to learn new things.", difficulty: 3, points: 3, keyWords: ["library", "quiet", "place", "study", "books", "read", "visit", "learn"] },
  { id: "r1_m2_p25", content: "Good manners are important in every culture. Saying please and thank you shows respect. People appreciate when we are polite.", difficulty: 3, points: 3, keyWords: ["manners", "important", "culture", "please", "thank", "respect", "appreciate", "polite"] },
  { id: "r1_m2_p26", content: "At school, I learned to raise my hand before speaking. This shows respect to the teacher. Waiting your turn is part of good manners.", difficulty: 3, points: 3, keyWords: ["school", "learned", "raise", "hand", "speaking", "respect", "teacher", "waiting", "turn", "manners"] },
  { id: "r1_m2_p27", content: "When I make a mistake, I apologize. Saying sorry is important. It shows that I care about other people's feelings.", difficulty: 2, points: 3, keyWords: ["mistake", "apologize", "sorry", "important", "care", "feelings"] },
  { id: "r1_m2_p28", content: "During meals, we use good table manners. We say please when asking for food. We thank the cook for the delicious meal.", difficulty: 2, points: 3, keyWords: ["meals", "table", "manners", "please", "asking", "food", "thank", "cook", "delicious"] },
  { id: "r1_m2_p29", content: "My teacher taught us to be respectful. We listen when others are talking. We wait for our turn to speak. This makes everyone feel valued.", difficulty: 3, points: 3, keyWords: ["teacher", "taught", "respectful", "listen", "talking", "wait", "turn", "speak", "valued"] },
  { id: "r1_m2_p30", content: "Being kind to others makes the world better. Small acts of kindness matter. A smile or a kind word can change someone's day.", difficulty: 3, points: 3, keyWords: ["kind", "others", "world", "better", "acts", "kindness", "matter", "smile", "word", "change", "day"] }
];

/**
 * Pattern for other levels:
 * 
 * Reader Level 1:
 * - M1: Basic everyday words (cat, dog, sun, house, water, food)
 * - M2: Social interaction (hello, please, thank you, help, sorry)
 * - M3: Functional needs (time, place, phone, address, appointment)
 * - M4: Expression (opinion, idea, feeling, decision, problem)
 * 
 * Reader Level 2:
 * - M1: Enhanced everyday vocabulary
 * - M2: Social scenarios and contexts
 * - M3: Complex practical situations
 * - M4: Describing experiences and plans
 * 
 * Reader Level 3:
 * - M1: Professional vocabulary
 * - M2: Business communication
 * - M3: Technical explanations
 * - M4: Analytical discussions
 * 
 * Reader Level 4:
 * - M1: Advanced academic terms
 * - M2: Sophisticated argumentation
 * - M3: Abstract concepts
 * - M4: Philosophical discourse
 */

export {};
