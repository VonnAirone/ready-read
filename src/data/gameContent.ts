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
  usedIndices: {                  // Track used content indices for randomization
    [key: string]: number[];      // key format: "r{reader}_m{macro}_{type}" (e.g., "r1_m1_words")
  };
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

// Temporary placeholder content - will be replaced with PDF content
export const GAME_CONTENT: { [key: string]: ReaderLevelData } = {
  'reader-level-1': {
    readerLevel: 1,
    macroLevels: {
      macroLevel1: {
        level: 1,
        name: "Basic Foundation",
        description: "Essential everyday vocabulary and simple communication",
        words: [
          { id: "r1_m1_w1", content: "cat", difficulty: 1, points: 1, keyWords: ["cat"] },
          { id: "r1_m1_w2", content: "sun", difficulty: 1, points: 1, keyWords: ["sun"] },
          { id: "r1_m1_w3", content: "book", difficulty: 1, points: 1, keyWords: ["book"] },
          { id: "r1_m1_w4", content: "house", difficulty: 2, points: 1, keyWords: ["house"] },
          { id: "r1_m1_w5", content: "water", difficulty: 2, points: 1, keyWords: ["water"] },
          { id: "r1_m1_w6", content: "food", difficulty: 2, points: 1, keyWords: ["food"] },
          { id: "r1_m1_w7", content: "happy", difficulty: 3, points: 1, keyWords: ["happy"] },
          { id: "r1_m1_w8", content: "street", difficulty: 3, points: 1, keyWords: ["street"] },
          { id: "r1_m1_w9", content: "friend", difficulty: 3, points: 1, keyWords: ["friend"] },
          { id: "r1_m1_w10", content: "family", difficulty: 3, points: 1, keyWords: ["family"] },
          { id: "r1_m1_w11", content: "dog", difficulty: 1, points: 1, keyWords: ["dog"] },
          { id: "r1_m1_w12", content: "moon", difficulty: 1, points: 1, keyWords: ["moon"] },
          { id: "r1_m1_w13", content: "pen", difficulty: 1, points: 1, keyWords: ["pen"] },
          { id: "r1_m1_w14", content: "car", difficulty: 1, points: 1, keyWords: ["car"] },
          { id: "r1_m1_w15", content: "tree", difficulty: 1, points: 1, keyWords: ["tree"] },
          { id: "r1_m1_w16", content: "door", difficulty: 2, points: 1, keyWords: ["door"] },
          { id: "r1_m1_w17", content: "milk", difficulty: 2, points: 1, keyWords: ["milk"] },
          { id: "r1_m1_w18", content: "bread", difficulty: 2, points: 1, keyWords: ["bread"] },
          { id: "r1_m1_w19", content: "window", difficulty: 2, points: 1, keyWords: ["window"] },
          { id: "r1_m1_w20", content: "garden", difficulty: 2, points: 1, keyWords: ["garden"] },
          { id: "r1_m1_w21", content: "smile", difficulty: 3, points: 1, keyWords: ["smile"] },
          { id: "r1_m1_w22", content: "school", difficulty: 3, points: 1, keyWords: ["school"] },
          { id: "r1_m1_w23", content: "mother", difficulty: 3, points: 1, keyWords: ["mother"] },
          { id: "r1_m1_w24", content: "father", difficulty: 3, points: 1, keyWords: ["father"] },
          { id: "r1_m1_w25", content: "brother", difficulty: 3, points: 1, keyWords: ["brother"] },
          { id: "r1_m1_w26", content: "sister", difficulty: 3, points: 1, keyWords: ["sister"] },
          { id: "r1_m1_w27", content: "table", difficulty: 2, points: 1, keyWords: ["table"] },
          { id: "r1_m1_w28", content: "chair", difficulty: 2, points: 1, keyWords: ["chair"] },
          { id: "r1_m1_w29", content: "bed", difficulty: 2, points: 1, keyWords: ["bed"] },
          { id: "r1_m1_w30", content: "park", difficulty: 2, points: 1, keyWords: ["park"] }
        ],
        sentences: [
          { id: "r1_m1_s1", content: "The cat sits in the sun.", difficulty: 1, points: 2, keyWords: ["cat", "sits", "sun"] },
          { id: "r1_m1_s2", content: "I read a good book.", difficulty: 1, points: 2, keyWords: ["read", "good", "book"] },
          { id: "r1_m1_s3", content: "My house is big.", difficulty: 1, points: 2, keyWords: ["house", "big"] },
          { id: "r1_m1_s4", content: "Water is cold today.", difficulty: 2, points: 2, keyWords: ["water", "cold", "today"] },
          { id: "r1_m1_s5", content: "We eat food together.", difficulty: 2, points: 2, keyWords: ["eat", "food", "together"] },
          { id: "r1_m1_s6", content: "The street is busy.", difficulty: 2, points: 2, keyWords: ["street", "busy"] },
          { id: "r1_m1_s7", content: "My friend is happy.", difficulty: 3, points: 2, keyWords: ["friend", "happy"] },
          { id: "r1_m1_s8", content: "I love my family.", difficulty: 3, points: 2, keyWords: ["love", "family"] },
          { id: "r1_m1_s9", content: "The sun is very hot.", difficulty: 3, points: 2, keyWords: ["sun", "very", "hot"] },
          { id: "r1_m1_s10", content: "Children play in the park.", difficulty: 3, points: 2, keyWords: ["children", "play", "park"] },
          { id: "r1_m1_s11", content: "The dog barks loudly.", difficulty: 1, points: 2, keyWords: ["dog", "barks", "loudly"] },
          { id: "r1_m1_s12", content: "The moon shines at night.", difficulty: 1, points: 2, keyWords: ["moon", "shines", "night"] },
          { id: "r1_m1_s13", content: "I write with a pen.", difficulty: 1, points: 2, keyWords: ["write", "pen"] },
          { id: "r1_m1_s14", content: "My car is red.", difficulty: 1, points: 2, keyWords: ["car", "red"] },
          { id: "r1_m1_s15", content: "The tree is tall.", difficulty: 1, points: 2, keyWords: ["tree", "tall"] },
          { id: "r1_m1_s16", content: "Please close the door.", difficulty: 2, points: 2, keyWords: ["close", "door"] },
          { id: "r1_m1_s17", content: "I drink milk every day.", difficulty: 2, points: 2, keyWords: ["drink", "milk", "every", "day"] },
          { id: "r1_m1_s18", content: "Bread is very fresh.", difficulty: 2, points: 2, keyWords: ["bread", "fresh"] },
          { id: "r1_m1_s19", content: "Open the window please.", difficulty: 2, points: 2, keyWords: ["open", "window", "please"] },
          { id: "r1_m1_s20", content: "The garden has many flowers.", difficulty: 2, points: 2, keyWords: ["garden", "flowers"] },
          { id: "r1_m1_s21", content: "She has a big smile.", difficulty: 3, points: 2, keyWords: ["big", "smile"] },
          { id: "r1_m1_s22", content: "We go to school together.", difficulty: 3, points: 2, keyWords: ["go", "school", "together"] },
          { id: "r1_m1_s23", content: "My mother cooks dinner.", difficulty: 3, points: 2, keyWords: ["mother", "cooks", "dinner"] },
          { id: "r1_m1_s24", content: "My father works hard.", difficulty: 3, points: 2, keyWords: ["father", "works", "hard"] },
          { id: "r1_m1_s25", content: "My brother is young.", difficulty: 3, points: 2, keyWords: ["brother", "young"] },
          { id: "r1_m1_s26", content: "My sister likes music.", difficulty: 3, points: 2, keyWords: ["sister", "likes", "music"] },
          { id: "r1_m1_s27", content: "The table is brown.", difficulty: 2, points: 2, keyWords: ["table", "brown"] },
          { id: "r1_m1_s28", content: "Sit on the chair.", difficulty: 2, points: 2, keyWords: ["sit", "chair"] },
          { id: "r1_m1_s29", content: "The bed is soft.", difficulty: 2, points: 2, keyWords: ["bed", "soft"] },
          { id: "r1_m1_s30", content: "Let's go to the park.", difficulty: 3, points: 2, keyWords: ["go", "park"] }
        ],
        paragraphs: [
          { id: "r1_m1_p1", content: "The cat sits in the sun. It is a warm day. The cat is happy.", difficulty: 1, points: 3, keyWords: ["cat", "sun", "warm", "day", "happy"] },
          { id: "r1_m1_p2", content: "I have a big house. My family lives there. We are happy together.", difficulty: 1, points: 3, keyWords: ["house", "family", "lives", "happy", "together"] },
          { id: "r1_m1_p3", content: "The book is on the table. I like to read. Books are fun.", difficulty: 1, points: 3, keyWords: ["book", "table", "read", "fun"] },
          { id: "r1_m1_p4", content: "Water is good for you. We drink water every day. It keeps us healthy.", difficulty: 2, points: 3, keyWords: ["water", "drink", "every", "day", "healthy"] },
          { id: "r1_m1_p5", content: "The street is very busy. Many cars drive by. People walk on the sidewalk.", difficulty: 2, points: 3, keyWords: ["street", "busy", "cars", "drive", "walk", "sidewalk"] },
          { id: "r1_m1_p6", content: "My friend comes to visit. We play games together. We have a lot of fun.", difficulty: 2, points: 3, keyWords: ["friend", "visit", "play", "games", "fun"] },
          { id: "r1_m1_p7", content: "Food tastes very good. We cook dinner at home. The whole family eats together.", difficulty: 3, points: 3, keyWords: ["food", "tastes", "cook", "dinner", "family", "eats"] },
          { id: "r1_m1_p8", content: "The sun shines bright today. Children play outside in the park. Everyone is having fun.", difficulty: 3, points: 3, keyWords: ["sun", "shines", "bright", "children", "play", "outside", "park", "fun"] },
          { id: "r1_m1_p9", content: "My cat likes to sleep. It finds a warm place in the house. The cat dreams about fish.", difficulty: 3, points: 3, keyWords: ["cat", "sleep", "warm", "place", "house", "dreams", "fish"] },
          { id: "r1_m1_p10", content: "We love our family very much. We spend time together every day. Family is the most important thing.", difficulty: 3, points: 3, keyWords: ["love", "family", "spend", "time", "together", "important"] },
          { id: "r1_m1_p11", content: "My dog is my best friend. He plays with me in the garden. Dogs are loyal animals.", difficulty: 1, points: 3, keyWords: ["dog", "friend", "plays", "garden", "loyal"] },
          { id: "r1_m1_p12", content: "The moon comes out at night. It gives us light. The moon is beautiful.", difficulty: 1, points: 3, keyWords: ["moon", "night", "light", "beautiful"] },
          { id: "r1_m1_p13", content: "I use a pen to write letters. Writing is important. I practice every day.", difficulty: 1, points: 3, keyWords: ["pen", "write", "letters", "important", "practice"] },
          { id: "r1_m1_p14", content: "My car takes me to work. I drive carefully on the road. Cars help us travel far.", difficulty: 2, points: 3, keyWords: ["car", "work", "drive", "carefully", "road", "travel"] },
          { id: "r1_m1_p15", content: "There is a big tree in our yard. Birds make nests in it. Trees give us shade.", difficulty: 2, points: 3, keyWords: ["tree", "yard", "birds", "nests", "shade"] },
          { id: "r1_m1_p16", content: "I open the door when someone knocks. Doors keep our home safe. Always lock the door at night.", difficulty: 2, points: 3, keyWords: ["door", "knocks", "home", "safe", "lock", "night"] },
          { id: "r1_m1_p17", content: "Milk is white and healthy. Children drink milk to grow strong. We buy fresh milk from the store.", difficulty: 2, points: 3, keyWords: ["milk", "white", "healthy", "children", "grow", "strong", "store"] },
          { id: "r1_m1_p18", content: "Bread is a basic food. We eat it for breakfast. Fresh bread smells wonderful.", difficulty: 2, points: 3, keyWords: ["bread", "basic", "food", "breakfast", "fresh", "smells"] },
          { id: "r1_m1_p19", content: "The window lets in fresh air. I can see outside through the window. Clean windows make the house bright.", difficulty: 3, points: 3, keyWords: ["window", "fresh", "air", "see", "outside", "clean", "bright"] },
          { id: "r1_m1_p20", content: "Our garden has many beautiful flowers. We water them every morning. Gardens make our home pretty.", difficulty: 3, points: 3, keyWords: ["garden", "flowers", "water", "morning", "home", "pretty"] },
          { id: "r1_m1_p21", content: "A smile makes everyone happy. When you smile, others smile too. Smiling is free and easy.", difficulty: 3, points: 3, keyWords: ["smile", "happy", "others", "free", "easy"] },
          { id: "r1_m1_p22", content: "School is where we learn new things. Teachers help students every day. Education is very important.", difficulty: 3, points: 3, keyWords: ["school", "learn", "teachers", "students", "education", "important"] },
          { id: "r1_m1_p23", content: "My mother is kind and caring. She takes care of the family. I love my mother very much.", difficulty: 3, points: 3, keyWords: ["mother", "kind", "caring", "takes", "care", "family", "love"] },
          { id: "r1_m1_p24", content: "My father goes to work every morning. He works hard for our family. Fathers are strong and helpful.", difficulty: 3, points: 3, keyWords: ["father", "work", "morning", "hard", "family", "strong"] },
          { id: "r1_m1_p25", content: "My brother and I play games together. He is younger than me. Brothers are special friends.", difficulty: 3, points: 3, keyWords: ["brother", "play", "games", "younger", "special", "friends"] },
          { id: "r1_m1_p26", content: "My sister likes to sing songs. She has a beautiful voice. Sisters bring joy to the family.", difficulty: 3, points: 3, keyWords: ["sister", "sing", "songs", "beautiful", "voice", "joy"] },
          { id: "r1_m1_p27", content: "We eat meals at the table. The table brings the family together. Sharing meals is important.", difficulty: 2, points: 3, keyWords: ["eat", "meals", "table", "family", "together", "sharing"] },
          { id: "r1_m1_p28", content: "I sit on a comfortable chair. Good chairs support our back. Every home needs chairs.", difficulty: 2, points: 3, keyWords: ["sit", "comfortable", "chair", "support", "back", "home"] },
          { id: "r1_m1_p29", content: "I sleep in my bed at night. A good bed helps us rest. Sleep is important for health.", difficulty: 2, points: 3, keyWords: ["sleep", "bed", "night", "rest", "important", "health"] },
          { id: "r1_m1_p30", content: "The park is a fun place. Children run and play there. Parks are good for everyone.", difficulty: 3, points: 3, keyWords: ["park", "fun", "place", "children", "run", "play", "good"] }
        ]
      },
      macroLevel2: {
        level: 2,
        name: "Basic Interaction", 
        description: "Simple social interactions and basic needs",
        words: [
          { id: "r1_m2_w1", content: "hello", difficulty: 1, points: 1, keyWords: ["hello"] },
          { id: "r1_m2_w2", content: "please", difficulty: 1, points: 1, keyWords: ["please"] },
          { id: "r1_m2_w3", content: "thank", difficulty: 1, points: 1, keyWords: ["thank"] },
          { id: "r1_m2_w4", content: "help", difficulty: 2, points: 1, keyWords: ["help"] },
          { id: "r1_m2_w5", content: "sorry", difficulty: 2, points: 1, keyWords: ["sorry"] },
          { id: "r1_m2_w6", content: "money", difficulty: 2, points: 1, keyWords: ["money"] },
          { id: "r1_m2_w7", content: "store", difficulty: 3, points: 1, keyWords: ["store"] },
          { id: "r1_m2_w8", content: "doctor", difficulty: 3, points: 1, keyWords: ["doctor"] },
          { id: "r1_m2_w9", content: "school", difficulty: 3, points: 1, keyWords: ["school"] },
          { id: "r1_m2_w10", content: "work", difficulty: 3, points: 1, keyWords: ["work"] },
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
        ],
        sentences: [
          { id: "r1_m2_s1", content: "Hello, how are you?", difficulty: 1, points: 2, keyWords: ["hello", "how", "are", "you"] },
          { id: "r1_m2_s2", content: "Please help me.", difficulty: 1, points: 2, keyWords: ["please", "help", "me"] },
          { id: "r1_m2_s3", content: "Thank you very much.", difficulty: 1, points: 2, keyWords: ["thank", "you", "very", "much"] },
          { id: "r1_m2_s4", content: "I am sorry.", difficulty: 2, points: 2, keyWords: ["sorry"] },
          { id: "r1_m2_s5", content: "I need some money.", difficulty: 2, points: 2, keyWords: ["need", "money"] },
          { id: "r1_m2_s6", content: "The store is open.", difficulty: 2, points: 2, keyWords: ["store", "open"] },
          { id: "r1_m2_s7", content: "I go to the doctor.", difficulty: 3, points: 2, keyWords: ["go", "doctor"] },
          { id: "r1_m2_s8", content: "Children go to school.", difficulty: 3, points: 2, keyWords: ["children", "school"] },
          { id: "r1_m2_s9", content: "My father goes to work.", difficulty: 3, points: 2, keyWords: ["father", "goes", "work"] },
          { id: "r1_m2_s10", content: "Can you help me please?", difficulty: 3, points: 2, keyWords: ["can", "help", "please"] },
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
        ],
        paragraphs: [
          { id: "r1_m2_p1", content: "Hello, my name is John. Nice to meet you. How are you today?", difficulty: 1, points: 3, keyWords: ["hello", "name", "nice", "meet", "today"] },
          { id: "r1_m2_p2", content: "Please help me find the store. I need to buy some food. Thank you for your help.", difficulty: 1, points: 3, keyWords: ["please", "help", "find", "store", "buy", "food", "thank"] },
          { id: "r1_m2_p3", content: "I am sorry I am late. The bus was slow today. I will try to be on time.", difficulty: 1, points: 3, keyWords: ["sorry", "late", "bus", "slow", "try", "time"] },
          { id: "r1_m2_p4", content: "I do not have enough money. Can you help me? I will pay you back tomorrow.", difficulty: 2, points: 3, keyWords: ["money", "enough", "help", "pay", "back", "tomorrow"] },
          { id: "r1_m2_p5", content: "The doctor is very nice. She helps sick people. I feel better after seeing her.", difficulty: 2, points: 3, keyWords: ["doctor", "nice", "helps", "sick", "people", "feel", "better", "seeing"] },
          { id: "r1_m2_p6", content: "My children love school. They learn many new things. The teachers are very kind.", difficulty: 2, points: 3, keyWords: ["children", "love", "school", "learn", "new", "things", "teachers", "kind"] },
          { id: "r1_m2_p7", content: "I go to work every morning. I like my job very much. My boss is a good person.", difficulty: 3, points: 3, keyWords: ["work", "morning", "like", "job", "boss", "good", "person"] },
          { id: "r1_m2_p8", content: "The store has many good things. You can buy food and clothes there. The workers are always helpful.", difficulty: 3, points: 3, keyWords: ["store", "good", "things", "buy", "food", "clothes", "workers", "helpful"] },
          { id: "r1_m2_p9", content: "When I meet new people, I always say hello. It is polite to be friendly. Most people like to talk.", difficulty: 3, points: 3, keyWords: ["meet", "new", "people", "hello", "polite", "friendly", "like", "talk"] },
          { id: "r1_m2_p10", content: "Thank you for all your help. You are a very kind person. I will remember your kindness always.", difficulty: 3, points: 3, keyWords: ["thank", "help", "kind", "person", "remember", "kindness", "always"] },
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
        ]
      },
      macroLevel3: {
        level: 3,
        name: "Functional Communication",
        description: "Practical communication for daily activities", 
        words: [
          { id: "r1_m3_w1", content: "time", difficulty: 1, points: 1, keyWords: ["time"] },
          { id: "r1_m3_w2", content: "place", difficulty: 1, points: 1, keyWords: ["place"] },
          { id: "r1_m3_w3", content: "phone", difficulty: 1, points: 1, keyWords: ["phone"] },
          { id: "r1_m3_w4", content: "address", difficulty: 2, points: 1, keyWords: ["address"] },
          { id: "r1_m3_w5", content: "number", difficulty: 2, points: 1, keyWords: ["number"] },
          { id: "r1_m3_w6", content: "appointment", difficulty: 2, points: 1, keyWords: ["appointment"] },
          { id: "r1_m3_w7", content: "information", difficulty: 3, points: 1, keyWords: ["information"] },
          { id: "r1_m3_w8", content: "directions", difficulty: 3, points: 1, keyWords: ["directions"] },
          { id: "r1_m3_w9", content: "emergency", difficulty: 3, points: 1, keyWords: ["emergency"] },
          { id: "r1_m3_w10", content: "transportation", difficulty: 3, points: 1, keyWords: ["transportation"] },
          { id: "r1_m3_w11", content: "date", difficulty: 1, points: 1, keyWords: ["date"] },
          { id: "r1_m3_w12", content: "schedule", difficulty: 1, points: 1, keyWords: ["schedule"] },
          { id: "r1_m3_w13", content: "map", difficulty: 1, points: 1, keyWords: ["map"] },
          { id: "r1_m3_w14", content: "ticket", difficulty: 1, points: 1, keyWords: ["ticket"] },
          { id: "r1_m3_w15", content: "meeting", difficulty: 2, points: 1, keyWords: ["meeting"] },
          { id: "r1_m3_w16", content: "location", difficulty: 2, points: 1, keyWords: ["location"] },
          { id: "r1_m3_w17", content: "message", difficulty: 2, points: 1, keyWords: ["message"] },
          { id: "r1_m3_w18", content: "email", difficulty: 2, points: 1, keyWords: ["email"] },
          { id: "r1_m3_w19", content: "calendar", difficulty: 2, points: 1, keyWords: ["calendar"] },
          { id: "r1_m3_w20", content: "reminder", difficulty: 2, points: 1, keyWords: ["reminder"] },
          { id: "r1_m3_w21", content: "document", difficulty: 3, points: 1, keyWords: ["document"] },
          { id: "r1_m3_w22", content: "application", difficulty: 3, points: 1, keyWords: ["application"] },
          { id: "r1_m3_w23", content: "confirmation", difficulty: 3, points: 1, keyWords: ["confirmation"] },
          { id: "r1_m3_w24", content: "registration", difficulty: 3, points: 1, keyWords: ["registration"] },
          { id: "r1_m3_w25", content: "identification", difficulty: 3, points: 1, keyWords: ["identification"] },
          { id: "r1_m3_w26", content: "reservation", difficulty: 3, points: 1, keyWords: ["reservation"] },
          { id: "r1_m3_w27", content: "notification", difficulty: 3, points: 1, keyWords: ["notification"] },
          { id: "r1_m3_w28", content: "instructions", difficulty: 3, points: 1, keyWords: ["instructions"] },
          { id: "r1_m3_w29", content: "procedure", difficulty: 3, points: 1, keyWords: ["procedure"] },
          { id: "r1_m3_w30", content: "requirement", difficulty: 3, points: 1, keyWords: ["requirement"] }
        ],
        sentences: [
          { id: "r1_m3_s1", content: "What time is it?", difficulty: 1, points: 2, keyWords: ["what", "time"] },
          { id: "r1_m3_s2", content: "Where is this place?", difficulty: 1, points: 2, keyWords: ["where", "place"] },
          { id: "r1_m3_s3", content: "Can I use your phone?", difficulty: 1, points: 2, keyWords: ["can", "use", "phone"] },
          { id: "r1_m3_s4", content: "What is your address?", difficulty: 2, points: 2, keyWords: ["what", "address"] },
          { id: "r1_m3_s5", content: "My phone number is 555-1234.", difficulty: 2, points: 2, keyWords: ["phone", "number"] },
          { id: "r1_m3_s6", content: "I have an appointment today.", difficulty: 2, points: 2, keyWords: ["appointment", "today"] },
          { id: "r1_m3_s7", content: "I need more information.", difficulty: 3, points: 2, keyWords: ["need", "information"] },
          { id: "r1_m3_s8", content: "Can you give me directions?", difficulty: 3, points: 2, keyWords: ["give", "directions"] },
          { id: "r1_m3_s9", content: "This is an emergency.", difficulty: 3, points: 2, keyWords: ["emergency"] },
          { id: "r1_m3_s10", content: "I need transportation to the hospital.", difficulty: 3, points: 2, keyWords: ["need", "transportation", "hospital"] },
          { id: "r1_m3_s11", content: "What is today's date?", difficulty: 1, points: 2, keyWords: ["what", "today", "date"] },
          { id: "r1_m3_s12", content: "Check your schedule please.", difficulty: 1, points: 2, keyWords: ["check", "schedule", "please"] },
          { id: "r1_m3_s13", content: "I have a map here.", difficulty: 1, points: 2, keyWords: ["have", "map", "here"] },
          { id: "r1_m3_s14", content: "Where can I buy tickets?", difficulty: 1, points: 2, keyWords: ["where", "buy", "tickets"] },
          { id: "r1_m3_s15", content: "The meeting starts at noon.", difficulty: 2, points: 2, keyWords: ["meeting", "starts", "noon"] },
          { id: "r1_m3_s16", content: "Share your location with me.", difficulty: 2, points: 2, keyWords: ["share", "location", "me"] },
          { id: "r1_m3_s17", content: "Did you get my message?", difficulty: 2, points: 2, keyWords: ["did", "get", "message"] },
          { id: "r1_m3_s18", content: "Send me an email.", difficulty: 2, points: 2, keyWords: ["send", "email"] },
          { id: "r1_m3_s19", content: "Mark it on your calendar.", difficulty: 2, points: 2, keyWords: ["mark", "calendar"] },
          { id: "r1_m3_s20", content: "Set a reminder for tomorrow.", difficulty: 2, points: 2, keyWords: ["set", "reminder", "tomorrow"] },
          { id: "r1_m3_s21", content: "Please sign this document.", difficulty: 3, points: 2, keyWords: ["please", "sign", "document"] },
          { id: "r1_m3_s22", content: "Fill out the application form.", difficulty: 3, points: 2, keyWords: ["fill", "application", "form"] },
          { id: "r1_m3_s23", content: "I need a confirmation number.", difficulty: 3, points: 2, keyWords: ["need", "confirmation", "number"] },
          { id: "r1_m3_s24", content: "Complete the registration process.", difficulty: 3, points: 2, keyWords: ["complete", "registration", "process"] },
          { id: "r1_m3_s25", content: "Show your identification please.", difficulty: 3, points: 2, keyWords: ["show", "identification", "please"] },
          { id: "r1_m3_s26", content: "I made a reservation online.", difficulty: 3, points: 2, keyWords: ["made", "reservation", "online"] },
          { id: "r1_m3_s27", content: "You will receive a notification.", difficulty: 3, points: 2, keyWords: ["receive", "notification"] },
          { id: "r1_m3_s28", content: "Follow the instructions carefully.", difficulty: 3, points: 2, keyWords: ["follow", "instructions", "carefully"] },
          { id: "r1_m3_s29", content: "Understand the procedure first.", difficulty: 3, points: 2, keyWords: ["understand", "procedure", "first"] },
          { id: "r1_m3_s30", content: "Meet all the requirements.", difficulty: 3, points: 2, keyWords: ["meet", "requirements"] }
        ],
        paragraphs: [
          { id: "r1_m3_p1", content: "I always check the time before I leave. Time is very important for appointments. I do not want to be late.", difficulty: 1, points: 3, keyWords: ["check", "time", "leave", "important", "appointments", "late"] },
          { id: "r1_m3_p2", content: "This place is new to me. I do not know where I am. Can someone help me find my way?", difficulty: 1, points: 3, keyWords: ["place", "new", "know", "where", "someone", "help", "find", "way"] },
          { id: "r1_m3_p3", content: "My phone is not working today. I need to call my family. May I borrow your phone please?", difficulty: 1, points: 3, keyWords: ["phone", "not", "working", "call", "family", "borrow", "please"] },
          { id: "r1_m3_p4", content: "The doctor needs my home address. I live at 123 Main Street. My phone number is on the form.", difficulty: 2, points: 3, keyWords: ["doctor", "needs", "address", "live", "Main", "Street", "phone", "number", "form"] },
          { id: "r1_m3_p5", content: "My appointment is at three o'clock. I will arrive early to fill out forms. The office closes at five.", difficulty: 2, points: 3, keyWords: ["appointment", "three", "o'clock", "arrive", "early", "fill", "forms", "office", "closes", "five"] },
          { id: "r1_m3_p6", content: "I need more information about this program. The website has good details. I will read it carefully tonight.", difficulty: 2, points: 3, keyWords: ["need", "information", "program", "website", "details", "read", "carefully", "tonight"] },
          { id: "r1_m3_p7", content: "I am lost and need directions. The GPS in my car is broken. A kind person helped me find the right road.", difficulty: 3, points: 3, keyWords: ["lost", "directions", "GPS", "car", "broken", "kind", "person", "helped", "find", "right", "road"] },
          { id: "r1_m3_p8", content: "There was an emergency at work today. Everyone stayed calm and followed the safety rules. Help arrived very quickly.", difficulty: 3, points: 3, keyWords: ["emergency", "work", "everyone", "stayed", "calm", "followed", "safety", "rules", "help", "arrived", "quickly"] },
          { id: "r1_m3_p9", content: "Public transportation is very useful in the city. Buses and trains run every day. They help people get to work and school.", difficulty: 3, points: 3, keyWords: ["public", "transportation", "useful", "city", "buses", "trains", "run", "every", "day", "help", "people", "get", "work", "school"] },
          { id: "r1_m3_p10", content: "I keep important phone numbers in my wallet. This includes my doctor, my children's school, and emergency contacts. It is good to be prepared.", difficulty: 3, points: 3, keyWords: ["keep", "important", "phone", "numbers", "wallet", "includes", "doctor", "children's", "school", "emergency", "contacts", "good", "prepared"] },
          { id: "r1_m3_p11", content: "Today's date is very important. I wrote it in my calendar. I don't want to forget my appointment.", difficulty: 1, points: 3, keyWords: ["today", "date", "important", "wrote", "calendar", "don't", "forget", "appointment"] },
          { id: "r1_m3_p12", content: "My work schedule changes every week. I need to check it every Monday morning. This helps me plan my day.", difficulty: 1, points: 3, keyWords: ["work", "schedule", "changes", "week", "check", "Monday", "morning", "helps", "plan", "day"] },
          { id: "r1_m3_p13", content: "I always carry a map when I travel. Maps help me find new places. They show me the best route to take.", difficulty: 1, points: 3, keyWords: ["carry", "map", "travel", "maps", "help", "find", "new", "places", "show", "best", "route"] },
          { id: "r1_m3_p14", content: "I bought my train ticket online. It was easy and fast. The ticket is on my phone now.", difficulty: 1, points: 3, keyWords: ["bought", "train", "ticket", "online", "easy", "fast", "phone", "now"] },
          { id: "r1_m3_p15", content: "We have a team meeting every Friday. Everyone must attend the meeting. We discuss our work plans together.", difficulty: 2, points: 3, keyWords: ["team", "meeting", "Friday", "everyone", "attend", "discuss", "work", "plans", "together"] },
          { id: "r1_m3_p16", content: "The GPS shows my exact location. This is helpful when I am lost. I can share my location with friends.", difficulty: 2, points: 3, keyWords: ["GPS", "shows", "exact", "location", "helpful", "lost", "share", "friends"] },
          { id: "r1_m3_p17", content: "I sent you a text message this morning. Did you receive it? Please reply when you can.", difficulty: 2, points: 3, keyWords: ["sent", "text", "message", "morning", "receive", "reply", "can"] },
          { id: "r1_m3_p18", content: "Email is a fast way to communicate. I check my email every day. Important messages come through email.", difficulty: 2, points: 3, keyWords: ["email", "fast", "way", "communicate", "check", "every", "day", "important", "messages"] },
          { id: "r1_m3_p19", content: "I use a calendar app on my phone. It reminds me of important dates. I never miss appointments anymore.", difficulty: 2, points: 3, keyWords: ["use", "calendar", "app", "phone", "reminds", "important", "dates", "never", "miss", "appointments"] },
          { id: "r1_m3_p20", content: "Set a reminder for tomorrow's meeting. The reminder will alert you one hour early. This gives you time to prepare.", difficulty: 2, points: 3, keyWords: ["set", "reminder", "tomorrow", "meeting", "alert", "hour", "early", "gives", "time", "prepare"] },
          { id: "r1_m3_p21", content: "Important documents must be signed by both parties. Read each document carefully before signing. Keep copies for your records.", difficulty: 3, points: 3, keyWords: ["important", "documents", "signed", "parties", "read", "carefully", "signing", "keep", "copies", "records"] },
          { id: "r1_m3_p22", content: "The job application has many questions. Answer all questions honestly and completely. Submit the application before the deadline.", difficulty: 3, points: 3, keyWords: ["job", "application", "questions", "answer", "honestly", "completely", "submit", "deadline"] },
          { id: "r1_m3_p23", content: "After booking online, you receive a confirmation email. The confirmation number is important. Save it for your reference.", difficulty: 3, points: 3, keyWords: ["booking", "online", "receive", "confirmation", "email", "number", "important", "save", "reference"] },
          { id: "r1_m3_p24", content: "Registration for the program opens next week. Complete the registration form early. Spaces fill up quickly.", difficulty: 3, points: 3, keyWords: ["registration", "program", "opens", "week", "complete", "form", "early", "spaces", "fill", "quickly"] },
          { id: "r1_m3_p25", content: "Always bring proper identification when needed. A driver's license or passport works well. Keep your ID in a safe place.", difficulty: 3, points: 3, keyWords: ["bring", "proper", "identification", "needed", "driver", "license", "passport", "works", "keep", "safe", "place"] },
          { id: "r1_m3_p26", content: "I made a hotel reservation for next month. The reservation is under my name. I paid a deposit to hold the room.", difficulty: 3, points: 3, keyWords: ["made", "hotel", "reservation", "month", "under", "name", "paid", "deposit", "hold", "room"] },
          { id: "r1_m3_p27", content: "You will receive a notification when your order ships. Check your email for tracking information. Delivery takes three to five days.", difficulty: 3, points: 3, keyWords: ["receive", "notification", "order", "ships", "check", "email", "tracking", "information", "delivery", "days"] },
          { id: "r1_m3_p28", content: "Follow the instructions step by step. Don't skip any steps in the procedure. Each step is important for success.", difficulty: 3, points: 3, keyWords: ["follow", "instructions", "step", "don't", "skip", "procedure", "important", "success"] },
          { id: "r1_m3_p29", content: "Before starting, understand the complete procedure. Ask questions if something is unclear. It's better to be sure than to make mistakes.", difficulty: 3, points: 3, keyWords: ["before", "starting", "understand", "complete", "procedure", "ask", "questions", "unclear", "better", "sure", "mistakes"] },
          { id: "r1_m3_p30", content: "Check all requirements before applying. Make sure you meet every requirement. Missing requirements can delay the process.", difficulty: 3, points: 3, keyWords: ["check", "requirements", "applying", "make", "sure", "meet", "every", "missing", "delay", "process"] }
        ]
      },
      macroLevel4: {
        level: 4,
        name: "Confident Expression",
        description: "Clear expression of ideas and opinions",
        words: [
          { id: "r1_m4_w1", content: "opinion", difficulty: 1, points: 1, keyWords: ["opinion"] },
          { id: "r1_m4_w2", content: "idea", difficulty: 1, points: 1, keyWords: ["idea"] },
          { id: "r1_m4_w3", content: "feeling", difficulty: 1, points: 1, keyWords: ["feeling"] },
          { id: "r1_m4_w4", content: "decision", difficulty: 2, points: 1, keyWords: ["decision"] },
          { id: "r1_m4_w5", content: "problem", difficulty: 2, points: 1, keyWords: ["problem"] },
          { id: "r1_m4_w6", content: "solution", difficulty: 2, points: 1, keyWords: ["solution"] },
          { id: "r1_m4_w7", content: "experience", difficulty: 3, points: 1, keyWords: ["experience"] },
          { id: "r1_m4_w8", content: "opportunity", difficulty: 3, points: 1, keyWords: ["opportunity"] },
          { id: "r1_m4_w9", content: "confidence", difficulty: 3, points: 1, keyWords: ["confidence"] },
          { id: "r1_m4_w10", content: "responsibility", difficulty: 3, points: 1, keyWords: ["responsibility"] },
          { id: "r1_m4_w11", content: "choice", difficulty: 1, points: 1, keyWords: ["choice"] },
          { id: "r1_m4_w12", content: "plan", difficulty: 1, points: 1, keyWords: ["plan"] },
          { id: "r1_m4_w13", content: "goal", difficulty: 1, points: 1, keyWords: ["goal"] },
          { id: "r1_m4_w14", content: "dream", difficulty: 1, points: 1, keyWords: ["dream"] },
          { id: "r1_m4_w15", content: "change", difficulty: 2, points: 1, keyWords: ["change"] },
          { id: "r1_m4_w16", content: "improve", difficulty: 2, points: 1, keyWords: ["improve"] },
          { id: "r1_m4_w17", content: "succeed", difficulty: 2, points: 1, keyWords: ["succeed"] },
          { id: "r1_m4_w18", content: "achieve", difficulty: 2, points: 1, keyWords: ["achieve"] },
          { id: "r1_m4_w19", content: "challenge", difficulty: 2, points: 1, keyWords: ["challenge"] },
          { id: "r1_m4_w20", content: "courage", difficulty: 2, points: 1, keyWords: ["courage"] },
          { id: "r1_m4_w21", content: "determination", difficulty: 3, points: 1, keyWords: ["determination"] },
          { id: "r1_m4_w22", content: "perseverance", difficulty: 3, points: 1, keyWords: ["perseverance"] },
          { id: "r1_m4_w23", content: "independence", difficulty: 3, points: 1, keyWords: ["independence"] },
          { id: "r1_m4_w24", content: "creativity", difficulty: 3, points: 1, keyWords: ["creativity"] },
          { id: "r1_m4_w25", content: "enthusiasm", difficulty: 3, points: 1, keyWords: ["enthusiasm"] },
          { id: "r1_m4_w26", content: "motivation", difficulty: 3, points: 1, keyWords: ["motivation"] },
          { id: "r1_m4_w27", content: "commitment", difficulty: 3, points: 1, keyWords: ["commitment"] },
          { id: "r1_m4_w28", content: "initiative", difficulty: 3, points: 1, keyWords: ["initiative"] },
          { id: "r1_m4_w29", content: "perspective", difficulty: 3, points: 1, keyWords: ["perspective"] },
          { id: "r1_m4_w30", content: "accomplishment", difficulty: 3, points: 1, keyWords: ["accomplishment"] }
        ],
        sentences: [
          { id: "r1_m4_s1", content: "What is your opinion?", difficulty: 1, points: 2, keyWords: ["what", "opinion"] },
          { id: "r1_m4_s2", content: "I have a good idea.", difficulty: 1, points: 2, keyWords: ["have", "good", "idea"] },
          { id: "r1_m4_s3", content: "This feeling is strange.", difficulty: 1, points: 2, keyWords: ["feeling", "strange"] },
          { id: "r1_m4_s4", content: "I made a difficult decision.", difficulty: 2, points: 2, keyWords: ["made", "difficult", "decision"] },
          { id: "r1_m4_s5", content: "We have a problem here.", difficulty: 2, points: 2, keyWords: ["have", "problem", "here"] },
          { id: "r1_m4_s6", content: "I found a good solution.", difficulty: 2, points: 2, keyWords: ["found", "good", "solution"] },
          { id: "r1_m4_s7", content: "This is a great experience.", difficulty: 3, points: 2, keyWords: ["great", "experience"] },
          { id: "r1_m4_s8", content: "This is a wonderful opportunity.", difficulty: 3, points: 2, keyWords: ["wonderful", "opportunity"] },
          { id: "r1_m4_s9", content: "I have confidence in myself.", difficulty: 3, points: 2, keyWords: ["have", "confidence", "myself"] },
          { id: "r1_m4_s10", content: "This is my responsibility.", difficulty: 3, points: 2, keyWords: ["responsibility"] },
          { id: "r1_m4_s11", content: "I made the right choice.", difficulty: 1, points: 2, keyWords: ["made", "right", "choice"] },
          { id: "r1_m4_s12", content: "We need a better plan.", difficulty: 1, points: 2, keyWords: ["need", "better", "plan"] },
          { id: "r1_m4_s13", content: "My goal is to learn.", difficulty: 1, points: 2, keyWords: ["goal", "learn"] },
          { id: "r1_m4_s14", content: "I have big dreams.", difficulty: 1, points: 2, keyWords: ["have", "big", "dreams"] },
          { id: "r1_m4_s15", content: "I want to change my life.", difficulty: 2, points: 2, keyWords: ["want", "change", "life"] },
          { id: "r1_m4_s16", content: "I can improve every day.", difficulty: 2, points: 2, keyWords: ["can", "improve", "every", "day"] },
          { id: "r1_m4_s17", content: "I will succeed eventually.", difficulty: 2, points: 2, keyWords: ["will", "succeed", "eventually"] },
          { id: "r1_m4_s18", content: "I can achieve my goals.", difficulty: 2, points: 2, keyWords: ["can", "achieve", "goals"] },
          { id: "r1_m4_s19", content: "This is a big challenge.", difficulty: 2, points: 2, keyWords: ["big", "challenge"] },
          { id: "r1_m4_s20", content: "I have the courage to try.", difficulty: 2, points: 2, keyWords: ["have", "courage", "try"] },
          { id: "r1_m4_s21", content: "I have strong determination.", difficulty: 3, points: 2, keyWords: ["have", "strong", "determination"] },
          { id: "r1_m4_s22", content: "Success requires perseverance.", difficulty: 3, points: 2, keyWords: ["success", "requires", "perseverance"] },
          { id: "r1_m4_s23", content: "I value my independence.", difficulty: 3, points: 2, keyWords: ["value", "independence"] },
          { id: "r1_m4_s24", content: "Creativity helps me solve problems.", difficulty: 3, points: 2, keyWords: ["creativity", "helps", "solve", "problems"] },
          { id: "r1_m4_s25", content: "I feel enthusiasm for learning.", difficulty: 3, points: 2, keyWords: ["feel", "enthusiasm", "learning"] },
          { id: "r1_m4_s26", content: "Motivation keeps me going.", difficulty: 3, points: 2, keyWords: ["motivation", "keeps", "going"] },
          { id: "r1_m4_s27", content: "I show commitment to my work.", difficulty: 3, points: 2, keyWords: ["show", "commitment", "work"] },
          { id: "r1_m4_s28", content: "Take initiative when possible.", difficulty: 3, points: 2, keyWords: ["take", "initiative", "possible"] },
          { id: "r1_m4_s29", content: "Different perspectives are valuable.", difficulty: 3, points: 2, keyWords: ["different", "perspectives", "valuable"] },
          { id: "r1_m4_s30", content: "Every accomplishment brings joy.", difficulty: 3, points: 2, keyWords: ["every", "accomplishment", "brings", "joy"] }
        ],
        paragraphs: [
          { id: "r1_m4_p1", content: "Everyone has different opinions about things. I respect other people's ideas. It is good to listen before I speak.", difficulty: 1, points: 3, keyWords: ["everyone", "different", "opinions", "things", "respect", "people's", "ideas", "good", "listen", "speak"] },
          { id: "r1_m4_p2", content: "I have many feelings every day. Sometimes I am happy, sometimes sad. Feelings are a normal part of life.", difficulty: 1, points: 3, keyWords: ["many", "feelings", "every", "day", "sometimes", "happy", "sad", "normal", "part", "life"] },
          { id: "r1_m4_p3", content: "Making decisions can be hard sometimes. I think carefully about my choices. Good decisions help me have a better life.", difficulty: 1, points: 3, keyWords: ["making", "decisions", "hard", "sometimes", "think", "carefully", "choices", "good", "help", "better", "life"] },
          { id: "r1_m4_p4", content: "When I have a problem, I try to stay calm. I think about possible solutions. Usually, there is more than one way to solve things.", difficulty: 2, points: 3, keyWords: ["problem", "try", "stay", "calm", "think", "possible", "solutions", "usually", "more", "than", "one", "way", "solve"] },
          { id: "r1_m4_p5", content: "Every experience teaches me something new. Even difficult times help me grow. I am grateful for all my experiences.", difficulty: 2, points: 3, keyWords: ["every", "experience", "teaches", "something", "new", "even", "difficult", "times", "help", "grow", "grateful", "experiences"] },
          { id: "r1_m4_p6", content: "New opportunities come to me often. I try to be ready for them. Some opportunities change my life in wonderful ways.", difficulty: 2, points: 3, keyWords: ["new", "opportunities", "come", "often", "try", "ready", "some", "change", "life", "wonderful", "ways"] },
          { id: "r1_m4_p7", content: "Building confidence takes time and practice. I believe in my abilities more each day. Confidence helps me try new things without fear.", difficulty: 3, points: 3, keyWords: ["building", "confidence", "takes", "time", "practice", "believe", "abilities", "more", "each", "day", "helps", "try", "new", "things", "without", "fear"] },
          { id: "r1_m4_p8", content: "I take responsibility for my actions and words. When I make mistakes, I admit them honestly. Taking responsibility shows that I am mature.", difficulty: 3, points: 3, keyWords: ["take", "responsibility", "actions", "words", "make", "mistakes", "admit", "honestly", "taking", "shows", "mature"] },
          { id: "r1_m4_p9", content: "My ideas are important and valuable. I share them with others when appropriate. Good communication helps my ideas become reality.", difficulty: 3, points: 3, keyWords: ["ideas", "important", "valuable", "share", "others", "appropriate", "good", "communication", "helps", "become", "reality"] },
          { id: "r1_m4_p10", content: "I express my feelings clearly and respectfully. This helps others understand me better. Open communication builds stronger relationships with people.", difficulty: 3, points: 3, keyWords: ["express", "feelings", "clearly", "respectfully", "helps", "others", "understand", "better", "open", "communication", "builds", "stronger", "relationships", "people"] },
          { id: "r1_m4_p11", content: "Every choice I make shapes my future. I think about the consequences before deciding. Smart choices lead to good outcomes.", difficulty: 1, points: 3, keyWords: ["every", "choice", "make", "shapes", "future", "think", "consequences", "deciding", "smart", "choices", "lead", "outcomes"] },
          { id: "r1_m4_p12", content: "I always make a plan before starting something big. Planning helps me stay organized. A good plan increases my chances of success.", difficulty: 1, points: 3, keyWords: ["always", "make", "plan", "starting", "big", "planning", "helps", "stay", "organized", "good", "increases", "chances", "success"] },
          { id: "r1_m4_p13", content: "Setting goals gives me direction in life. I write down my goals and review them often. Clear goals help me focus my energy.", difficulty: 1, points: 3, keyWords: ["setting", "goals", "gives", "direction", "life", "write", "down", "review", "often", "clear", "help", "focus", "energy"] },
          { id: "r1_m4_p14", content: "I have dreams about my future. Some dreams are small, some are big. Working toward my dreams makes life exciting.", difficulty: 1, points: 3, keyWords: ["have", "dreams", "future", "some", "small", "big", "working", "toward", "makes", "life", "exciting"] },
          { id: "r1_m4_p15", content: "Change is not always easy, but it is necessary for growth. I embrace positive changes in my life. Each change brings new learning opportunities.", difficulty: 2, points: 3, keyWords: ["change", "not", "always", "easy", "necessary", "growth", "embrace", "positive", "life", "each", "brings", "learning", "opportunities"] },
          { id: "r1_m4_p16", content: "I work hard to improve my skills. Every day I try to be a little better than yesterday. Constant improvement is my goal.", difficulty: 2, points: 3, keyWords: ["work", "hard", "improve", "skills", "every", "day", "try", "little", "better", "yesterday", "constant", "improvement", "goal"] },
          { id: "r1_m4_p17", content: "Success means different things to different people. For me, success is being happy and helping others. I measure success by how much I have grown.", difficulty: 2, points: 3, keyWords: ["success", "means", "different", "things", "people", "being", "happy", "helping", "others", "measure", "how", "much", "grown"] },
          { id: "r1_m4_p18", content: "I work hard to achieve my goals. Some goals take longer than others. With patience and effort, I can accomplish anything.", difficulty: 2, points: 3, keyWords: ["work", "hard", "achieve", "goals", "some", "take", "longer", "patience", "effort", "accomplish", "anything"] },
          { id: "r1_m4_p19", content: "Life presents many challenges to overcome. I see challenges as opportunities to grow stronger. Each challenge teaches me valuable lessons.", difficulty: 2, points: 3, keyWords: ["life", "presents", "challenges", "overcome", "see", "opportunities", "grow", "stronger", "each", "teaches", "valuable", "lessons"] },
          { id: "r1_m4_p20", content: "It takes courage to try new things. I feel scared sometimes, but I don't let fear stop me. Courage means acting despite being afraid.", difficulty: 2, points: 3, keyWords: ["takes", "courage", "try", "new", "things", "feel", "scared", "sometimes", "don't", "let", "fear", "stop", "means", "acting", "despite", "afraid"] },
          { id: "r1_m4_p21", content: "Determination is the key to reaching goals. When things get difficult, I don't give up. My determination pushes me forward every day.", difficulty: 3, points: 3, keyWords: ["determination", "key", "reaching", "goals", "things", "difficult", "don't", "give", "up", "pushes", "forward", "every", "day"] },
          { id: "r1_m4_p22", content: "Perseverance means continuing even when progress is slow. I keep working toward my goals despite obstacles. Perseverance separates success from failure.", difficulty: 3, points: 3, keyWords: ["perseverance", "means", "continuing", "progress", "slow", "keep", "working", "goals", "despite", "obstacles", "separates", "success", "failure"] },
          { id: "r1_m4_p23", content: "Independence is important to me. I can make my own decisions and solve my own problems. Being independent gives me freedom and confidence.", difficulty: 3, points: 3, keyWords: ["independence", "important", "can", "make", "own", "decisions", "solve", "problems", "being", "independent", "gives", "freedom", "confidence"] },
          { id: "r1_m4_p24", content: "Creativity helps me find new solutions to problems. I think outside the box and try different approaches. Creative thinking makes work more interesting.", difficulty: 3, points: 3, keyWords: ["creativity", "helps", "find", "new", "solutions", "problems", "think", "outside", "box", "try", "different", "approaches", "thinking", "makes", "work", "interesting"] },
          { id: "r1_m4_p25", content: "I feel enthusiasm for everything I do. This energy helps me work harder and longer. Enthusiasm is contagious and inspires others around me.", difficulty: 3, points: 3, keyWords: ["feel", "enthusiasm", "everything", "energy", "helps", "work", "harder", "longer", "contagious", "inspires", "others", "around"] },
          { id: "r1_m4_p26", content: "My motivation comes from my desire to succeed. I stay motivated by remembering my goals. Strong motivation helps me overcome any obstacle.", difficulty: 3, points: 3, keyWords: ["motivation", "comes", "desire", "succeed", "stay", "motivated", "remembering", "goals", "strong", "helps", "overcome", "obstacle"] },
          { id: "r1_m4_p27", content: "I show commitment by following through on my promises. When I start something, I finish it. My commitment to excellence shows in my work.", difficulty: 3, points: 3, keyWords: ["show", "commitment", "following", "through", "promises", "start", "something", "finish", "excellence", "shows", "work"] },
          { id: "r1_m4_p28", content: "Taking initiative means not waiting for others to tell me what to do. I see what needs to be done and I do it. Initiative is valued in every workplace.", difficulty: 3, points: 3, keyWords: ["taking", "initiative", "means", "not", "waiting", "others", "tell", "see", "needs", "done", "valued", "workplace"] },
          { id: "r1_m4_p29", content: "Everyone has a different perspective based on their experiences. I try to understand other viewpoints before making judgments. Multiple perspectives lead to better decisions.", difficulty: 3, points: 3, keyWords: ["everyone", "different", "perspective", "based", "experiences", "try", "understand", "viewpoints", "making", "judgments", "multiple", "perspectives", "lead", "better", "decisions"] },
          { id: "r1_m4_p30", content: "Every accomplishment, big or small, deserves recognition. I celebrate my achievements and those of others. Acknowledging accomplishments builds confidence and motivation.", difficulty: 3, points: 3, keyWords: ["every", "accomplishment", "big", "small", "deserves", "recognition", "celebrate", "achievements", "others", "acknowledging", "accomplishments", "builds", "confidence", "motivation"] }
        ]
      }
    }
  },
  'reader-level-2': {
    readerLevel: 2,
    macroLevels: {
      macroLevel1: { 
        level: 1, 
        name: "Social Foundations", 
        description: "Social and workplace communication",
        words: [
          { id: "r2_m1_w1", content: "cooperate", difficulty: 1, points: 2, keyWords: ["cooperate"] },
          { id: "r2_m1_w2", content: "schedule", difficulty: 1, points: 2, keyWords: ["schedule"] },
          { id: "r2_m1_w3", content: "purchase", difficulty: 1, points: 2, keyWords: ["purchase"] },
          { id: "r2_m1_w4", content: "community", difficulty: 1, points: 2, keyWords: ["community"] },
          { id: "r2_m1_w5", content: "organize", difficulty: 2, points: 2, keyWords: ["organize"] },
          { id: "r2_m1_w6", content: "negotiate", difficulty: 2, points: 2, keyWords: ["negotiate"] },
          { id: "r2_m1_w7", content: "appreciate", difficulty: 2, points: 2, keyWords: ["appreciate"] },
          { id: "r2_m1_w8", content: "responsibilities", difficulty: 3, points: 2, keyWords: ["responsibilities"] },
          { id: "r2_m1_w9", content: "professional", difficulty: 3, points: 2, keyWords: ["professional"] },
          { id: "r2_m1_w10", content: "collaboration", difficulty: 3, points: 2, keyWords: ["collaboration"] },
          { id: "r2_m1_w11", content: "participate", difficulty: 1, points: 2, keyWords: ["participate"] },
          { id: "r2_m1_w12", content: "contribute", difficulty: 1, points: 2, keyWords: ["contribute"] },
          { id: "r2_m1_w13", content: "volunteer", difficulty: 1, points: 2, keyWords: ["volunteer"] },
          { id: "r2_m1_w14", content: "budget", difficulty: 2, points: 2, keyWords: ["budget"] },
          { id: "r2_m1_w15", content: "prioritize", difficulty: 2, points: 2, keyWords: ["prioritize"] },
          { id: "r2_m1_w16", content: "coordinate", difficulty: 2, points: 2, keyWords: ["coordinate"] },
          { id: "r2_m1_w17", content: "implement", difficulty: 3, points: 2, keyWords: ["implement"] },
          { id: "r2_m1_w18", content: "accommodate", difficulty: 3, points: 2, keyWords: ["accommodate"] },
          { id: "r2_m1_w19", content: "facilitate", difficulty: 3, points: 2, keyWords: ["facilitate"] },
          { id: "r2_m1_w20", content: "demonstrate", difficulty: 3, points: 2, keyWords: ["demonstrate"] }
        ], 
        sentences: [
          { id: "r2_m1_s1", content: "We need to cooperate on this project.", difficulty: 1, points: 2, keyWords: ["need", "cooperate", "project"] },
          { id: "r2_m1_s2", content: "Let me check my schedule.", difficulty: 1, points: 2, keyWords: ["check", "schedule"] },
          { id: "r2_m1_s3", content: "I want to purchase this item.", difficulty: 1, points: 2, keyWords: ["want", "purchase", "item"] },
          { id: "r2_m1_s4", content: "Our community is very friendly.", difficulty: 2, points: 2, keyWords: ["community", "friendly"] },
          { id: "r2_m1_s5", content: "Can you help me organize this event?", difficulty: 2, points: 2, keyWords: ["help", "organize", "event"] },
          { id: "r2_m1_s6", content: "We need to negotiate a fair price.", difficulty: 2, points: 2, keyWords: ["need", "negotiate", "fair", "price"] },
          { id: "r2_m1_s7", content: "I really appreciate your help.", difficulty: 3, points: 2, keyWords: ["really", "appreciate", "help"] },
          { id: "r2_m1_s8", content: "These are my main responsibilities.", difficulty: 3, points: 2, keyWords: ["main", "responsibilities"] },
          { id: "r2_m1_s9", content: "He maintains a professional attitude.", difficulty: 3, points: 2, keyWords: ["maintains", "professional", "attitude"] },
          { id: "r2_m1_s10", content: "Successful collaboration requires good communication.", difficulty: 3, points: 2, keyWords: ["successful", "collaboration", "requires", "communication"] },
          { id: "r2_m1_s11", content: "Everyone should participate in the discussion.", difficulty: 1, points: 2, keyWords: ["everyone", "participate", "discussion"] },
          { id: "r2_m1_s12", content: "You can contribute your ideas freely.", difficulty: 1, points: 2, keyWords: ["contribute", "ideas", "freely"] },
          { id: "r2_m1_s13", content: "I volunteer at the local shelter.", difficulty: 1, points: 2, keyWords: ["volunteer", "local", "shelter"] },
          { id: "r2_m1_s14", content: "We must stay within our budget.", difficulty: 2, points: 2, keyWords: ["stay", "within", "budget"] },
          { id: "r2_m1_s15", content: "Let's prioritize the urgent tasks.", difficulty: 2, points: 2, keyWords: ["prioritize", "urgent", "tasks"] },
          { id: "r2_m1_s16", content: "We need to coordinate our efforts.", difficulty: 2, points: 2, keyWords: ["coordinate", "efforts"] },
          { id: "r2_m1_s17", content: "They will implement the new policy.", difficulty: 3, points: 2, keyWords: ["implement", "new", "policy"] },
          { id: "r2_m1_s18", content: "We can accommodate your special requests.", difficulty: 3, points: 2, keyWords: ["accommodate", "special", "requests"] },
          { id: "r2_m1_s19", content: "She will facilitate the training session.", difficulty: 3, points: 2, keyWords: ["facilitate", "training", "session"] },
          { id: "r2_m1_s20", content: "Please demonstrate the proper procedure.", difficulty: 3, points: 2, keyWords: ["demonstrate", "proper", "procedure"] }
        ], 
        paragraphs: [
          { id: "r2_m1_p1", content: "Cooperation is essential in any workplace. When team members work together effectively, projects succeed. Everyone benefits from good teamwork.", difficulty: 1, points: 3, keyWords: ["cooperation", "essential", "workplace", "teamwork"] },
          { id: "r2_m1_p2", content: "Managing your schedule helps you stay organized. Write down important appointments and deadlines. This prevents you from missing important events.", difficulty: 1, points: 3, keyWords: ["managing", "schedule", "organized", "appointments"] },
          { id: "r2_m1_p3", content: "Before you purchase something expensive, compare prices at different stores. Read reviews from other customers. Make sure you are getting good value.", difficulty: 1, points: 3, keyWords: ["purchase", "expensive", "compare", "value"] },
          { id: "r2_m1_p4", content: "A strong community supports all its members. People help each other during difficult times. Community events bring neighbors together.", difficulty: 2, points: 3, keyWords: ["community", "supports", "members", "neighbors"] },
          { id: "r2_m1_p5", content: "Learning to organize your work and personal life takes practice. Start with simple systems and improve them over time. Good organization reduces stress.", difficulty: 2, points: 3, keyWords: ["organize", "work", "personal", "systems"] },
          { id: "r2_m1_p6", content: "Successful negotiation requires patience and good listening skills. Try to understand the other person's needs and concerns. Look for win-win solutions.", difficulty: 2, points: 3, keyWords: ["negotiation", "patience", "listening", "solutions"] },
          { id: "r2_m1_p7", content: "Showing appreciation for others builds stronger relationships. Thank people when they help you. Recognition motivates people to continue good work.", difficulty: 3, points: 3, keyWords: ["appreciation", "relationships", "recognition", "motivates"] },
          { id: "r2_m1_p8", content: "Understanding your responsibilities at work and at home is important for success. Make a list of your duties and prioritize them carefully.", difficulty: 3, points: 3, keyWords: ["responsibilities", "success", "duties", "prioritize"] },
          { id: "r2_m1_p9", content: "Maintaining a professional appearance and behavior is crucial in the workplace. Dress appropriately for your job. Treat colleagues with respect.", difficulty: 3, points: 3, keyWords: ["professional", "appearance", "workplace", "colleagues"] },
          { id: "r2_m1_p10", content: "Effective collaboration happens when people combine their different skills and knowledge. Share information openly with your team. Listen to different perspectives.", difficulty: 3, points: 3, keyWords: ["collaboration", "skills", "knowledge", "perspectives"] },
          { id: "r2_m1_p11", content: "Active participation in meetings and discussions shows engagement. Don't be afraid to share your thoughts. Your input might provide valuable insights.", difficulty: 1, points: 3, keyWords: ["participation", "meetings", "engagement", "insights"] },
          { id: "r2_m1_p12", content: "Contributing your skills to team projects makes you a valuable member. Everyone has something unique to offer. Find ways to add value.", difficulty: 1, points: 3, keyWords: ["contributing", "skills", "valuable", "member"] },
          { id: "r2_m1_p13", content: "Volunteering in your community creates positive change. It helps those in need and builds connections. Many people find volunteering personally rewarding.", difficulty: 1, points: 3, keyWords: ["volunteering", "community", "positive", "rewarding"] },
          { id: "r2_m1_p14", content: "Creating and maintaining a budget helps you manage money wisely. Track your income and expenses carefully. Save regularly for future needs.", difficulty: 2, points: 3, keyWords: ["budget", "manage", "money", "save"] },
          { id: "r2_m1_p15", content: "Learning to prioritize tasks improves productivity. Focus on important and urgent items first. Less critical tasks can wait until later.", difficulty: 2, points: 3, keyWords: ["prioritize", "productivity", "important", "urgent"] },
          { id: "r2_m1_p16", content: "Coordinating activities among multiple people requires clear communication. Set expectations early and check in regularly. Good coordination prevents confusion.", difficulty: 2, points: 3, keyWords: ["coordinating", "communication", "expectations", "confusion"] },
          { id: "r2_m1_p17", content: "Implementing new procedures takes careful planning and training. Explain the reasons for changes clearly. Provide support during the transition period.", difficulty: 3, points: 3, keyWords: ["implementing", "procedures", "planning", "transition"] },
          { id: "r2_m1_p18", content: "Being able to accommodate different needs and preferences shows flexibility. Listen to requests carefully and find creative solutions. Flexibility builds goodwill.", difficulty: 3, points: 3, keyWords: ["accommodate", "flexibility", "requests", "solutions"] },
          { id: "r2_m1_p19", content: "Facilitating group discussions requires skill and practice. Keep conversations on track while allowing everyone to participate. Manage time effectively throughout.", difficulty: 3, points: 3, keyWords: ["facilitating", "discussions", "skill", "participate"] },
          { id: "r2_m1_p20", content: "Demonstrating new skills or procedures helps others learn effectively. Show each step clearly and explain why it matters. Allow time for questions and practice.", difficulty: 3, points: 3, keyWords: ["demonstrating", "skills", "procedures", "learn"] }
        ]
      },
      macroLevel2: { 
        level: 2, 
        name: "Work Communication", 
        description: "Professional workplace communication",
        words: [
          { id: "r2_m2_w1", content: "meeting", difficulty: 1, points: 2, keyWords: ["meeting"] },
          { id: "r2_m2_w2", content: "deadline", difficulty: 1, points: 2, keyWords: ["deadline"] },
          { id: "r2_m2_w3", content: "report", difficulty: 1, points: 2, keyWords: ["report"] },
          { id: "r2_m2_w4", content: "supervisor", difficulty: 2, points: 2, keyWords: ["supervisor"] },
          { id: "r2_m2_w5", content: "client", difficulty: 2, points: 2, keyWords: ["client"] },
          { id: "r2_m2_w6", content: "presentation", difficulty: 2, points: 2, keyWords: ["presentation"] },
          { id: "r2_m2_w7", content: "performance", difficulty: 3, points: 2, keyWords: ["performance"] },
          { id: "r2_m2_w8", content: "evaluation", difficulty: 3, points: 2, keyWords: ["evaluation"] },
          { id: "r2_m2_w9", content: "productivity", difficulty: 3, points: 2, keyWords: ["productivity"] },
          { id: "r2_m2_w10", content: "efficiency", difficulty: 3, points: 2, keyWords: ["efficiency"] }
        ], 
        sentences: [
          { id: "r2_m2_s1", content: "The meeting starts at nine o'clock.", difficulty: 1, points: 2, keyWords: ["meeting", "starts", "nine", "o'clock"] },
          { id: "r2_m2_s2", content: "We must finish before the deadline.", difficulty: 1, points: 2, keyWords: ["must", "finish", "before", "deadline"] },
          { id: "r2_m2_s3", content: "Please submit your report by Friday.", difficulty: 1, points: 2, keyWords: ["please", "submit", "report", "Friday"] },
          { id: "r2_m2_s4", content: "I need to speak with my supervisor.", difficulty: 2, points: 2, keyWords: ["need", "speak", "supervisor"] },
          { id: "r2_m2_s5", content: "Our client is very satisfied.", difficulty: 2, points: 2, keyWords: ["client", "very", "satisfied"] },
          { id: "r2_m2_s6", content: "The presentation went very well.", difficulty: 2, points: 2, keyWords: ["presentation", "went", "very", "well"] },
          { id: "r2_m2_s7", content: "Your performance has improved significantly.", difficulty: 3, points: 2, keyWords: ["performance", "improved", "significantly"] },
          { id: "r2_m2_s8", content: "The annual evaluation is next month.", difficulty: 3, points: 2, keyWords: ["annual", "evaluation", "next", "month"] },
          { id: "r2_m2_s9", content: "We need to increase our productivity.", difficulty: 3, points: 2, keyWords: ["need", "increase", "productivity"] },
          { id: "r2_m2_s10", content: "This new system improves efficiency.", difficulty: 3, points: 2, keyWords: ["new", "system", "improves", "efficiency"] }
        ], 
        paragraphs: [
          { id: "r2_m2_p1", content: "Effective meetings require good preparation and clear objectives. Distribute an agenda beforehand so participants know what to expect. Keep discussions focused and end on time.", difficulty: 1, points: 3, keyWords: ["effective", "meetings", "preparation", "agenda"] },
          { id: "r2_m2_p2", content: "Meeting deadlines is crucial for business success. Plan your work carefully and start important tasks early. If you think you might be late, communicate with your team immediately.", difficulty: 1, points: 3, keyWords: ["meeting", "deadlines", "crucial", "communicate"] },
          { id: "r2_m2_p3", content: "Writing clear reports helps others understand your work. Use simple language and organize information logically. Include relevant data and support your conclusions with evidence.", difficulty: 1, points: 3, keyWords: ["writing", "reports", "organize", "evidence"] },
          { id: "r2_m2_p4", content: "Building a good relationship with your supervisor benefits your career. Be honest about challenges and ask for guidance when needed. Show initiative and take responsibility for your work.", difficulty: 2, points: 3, keyWords: ["relationship", "supervisor", "initiative", "responsibility"] },
          { id: "r2_m2_p5", content: "Understanding your clients' needs leads to better service and stronger business relationships. Listen carefully to their concerns and respond promptly to their requests.", difficulty: 2, points: 3, keyWords: ["clients'", "needs", "service", "relationships"] },
          { id: "r2_m2_p6", content: "Giving successful presentations requires practice and confidence. Know your material well and anticipate questions from your audience. Use visual aids to support your key points.", difficulty: 2, points: 3, keyWords: ["presentations", "practice", "confidence", "audience"] },
          { id: "r2_m2_p7", content: "Regular performance reviews help employees understand their strengths and areas for improvement. Set clear goals and provide specific feedback. Recognition motivates continued excellence.", difficulty: 3, points: 3, keyWords: ["performance", "reviews", "feedback", "excellence"] },
          { id: "r2_m2_p8", content: "Performance evaluations should be fair and objective. Document achievements throughout the year, not just at review time. Discuss career development opportunities and future goals.", difficulty: 3, points: 3, keyWords: ["evaluations", "objective", "achievements", "development"] },
          { id: "r2_m2_p9", content: "Improving productivity requires analyzing current processes and identifying inefficiencies. Implement new tools and methods gradually. Train employees properly and monitor results carefully.", difficulty: 3, points: 3, keyWords: ["productivity", "processes", "inefficiencies", "implement"] },
          { id: "r2_m2_p10", content: "Workplace efficiency improves when systems are well-designed and employees are properly trained. Eliminate unnecessary steps in processes. Encourage feedback from workers who do the job daily.", difficulty: 3, points: 3, keyWords: ["efficiency", "systems", "eliminate", "feedback"] }
        ]
      },
      macroLevel3: { 
        level: 3, 
        name: "Community Engagement", 
        description: "Community and social engagement",
        words: [
          { id: "r2_m3_w1", content: "volunteer", difficulty: 1, points: 2, keyWords: ["volunteer"] },
          { id: "r2_m3_w2", content: "neighbor", difficulty: 1, points: 2, keyWords: ["neighbor"] },
          { id: "r2_m3_w3", content: "activity", difficulty: 1, points: 2, keyWords: ["activity"] },
          { id: "r2_m3_w4", content: "participate", difficulty: 2, points: 2, keyWords: ["participate"] },
          { id: "r2_m3_w5", content: "contribute", difficulty: 2, points: 2, keyWords: ["contribute"] },
          { id: "r2_m3_w6", content: "committee", difficulty: 2, points: 2, keyWords: ["committee"] },
          { id: "r2_m3_w7", content: "leadership", difficulty: 3, points: 2, keyWords: ["leadership"] },
          { id: "r2_m3_w8", content: "initiative", difficulty: 3, points: 2, keyWords: ["initiative"] },
          { id: "r2_m3_w9", content: "advocate", difficulty: 3, points: 2, keyWords: ["advocate"] },
          { id: "r2_m3_w10", content: "engagement", difficulty: 3, points: 2, keyWords: ["engagement"] }
        ], 
        sentences: [
          { id: "r2_m3_s1", content: "I want to volunteer at the library.", difficulty: 1, points: 2, keyWords: ["want", "volunteer", "library"] },
          { id: "r2_m3_s2", content: "My neighbor is very helpful.", difficulty: 1, points: 2, keyWords: ["neighbor", "very", "helpful"] },
          { id: "r2_m3_s3", content: "This activity brings people together.", difficulty: 1, points: 2, keyWords: ["activity", "brings", "people", "together"] },
          { id: "r2_m3_s4", content: "Everyone can participate in this event.", difficulty: 2, points: 2, keyWords: ["everyone", "participate", "event"] },
          { id: "r2_m3_s5", content: "I want to contribute to our community.", difficulty: 2, points: 2, keyWords: ["want", "contribute", "community"] },
          { id: "r2_m3_s6", content: "The committee meets every Tuesday.", difficulty: 2, points: 2, keyWords: ["committee", "meets", "every", "Tuesday"] },
          { id: "r2_m3_s7", content: "Strong leadership makes a difference.", difficulty: 3, points: 2, keyWords: ["strong", "leadership", "makes", "difference"] },
          { id: "r2_m3_s8", content: "She took the initiative to help.", difficulty: 3, points: 2, keyWords: ["took", "initiative", "help"] },
          { id: "r2_m3_s9", content: "We advocate for better schools.", difficulty: 3, points: 2, keyWords: ["advocate", "better", "schools"] },
          { id: "r2_m3_s10", content: "Community engagement benefits everyone.", difficulty: 3, points: 2, keyWords: ["community", "engagement", "benefits", "everyone"] }
        ], 
        paragraphs: [
          { id: "r2_m3_p1", content: "Volunteering at local organizations helps build stronger communities. You can meet new people and learn valuable skills. Many volunteer opportunities require only a few hours per week.", difficulty: 1, points: 3, keyWords: ["volunteering", "organizations", "communities", "skills"] },
          { id: "r2_m3_p2", content: "Getting to know your neighbors creates a sense of belonging. Introduce yourself when you see them outside. Offer help when they need assistance with small tasks.", difficulty: 1, points: 3, keyWords: ["neighbors", "belonging", "introduce", "assistance"] },
          { id: "r2_m3_p3", content: "Community activities provide opportunities for social connection. Attend local events and festivals when possible. These gatherings help you learn about different cultures and traditions.", difficulty: 1, points: 3, keyWords: ["activities", "connection", "events", "cultures"] },
          { id: "r2_m3_p4", content: "Participating in community projects creates positive change. Join clean-up efforts or fundraising campaigns. Your involvement inspires others to contribute as well.", difficulty: 2, points: 3, keyWords: ["participating", "projects", "campaigns", "involvement"] },
          { id: "r2_m3_p5", content: "Contributing your time and skills benefits the entire community. Share your expertise through teaching or mentoring. Help organize events that bring people together.", difficulty: 2, points: 3, keyWords: ["contributing", "expertise", "mentoring", "organize"] },
          { id: "r2_m3_p6", content: "Serving on committees allows you to influence important decisions. Attend meetings regularly and voice your opinions respectfully. Work collaboratively to find solutions to local problems.", difficulty: 2, points: 3, keyWords: ["committees", "decisions", "opinions", "collaboratively"] },
          { id: "r2_m3_p7", content: "Effective leadership emerges from understanding community needs and motivating others to action. Listen to different perspectives and build consensus around common goals.", difficulty: 3, points: 3, keyWords: ["leadership", "motivating", "perspectives", "consensus"] },
          { id: "r2_m3_p8", content: "Taking initiative means identifying problems and proposing solutions without being asked. Start small projects that address local issues. Encourage others to join your efforts.", difficulty: 3, points: 3, keyWords: ["initiative", "identifying", "proposing", "encourage"] },
          { id: "r2_m3_p9", content: "Advocating for important causes requires persistence and clear communication. Research the issues thoroughly and present facts to decision-makers. Build coalitions with like-minded individuals.", difficulty: 3, points: 3, keyWords: ["advocating", "persistence", "research", "coalitions"] },
          { id: "r2_m3_p10", content: "Meaningful community engagement strengthens social bonds and improves quality of life for everyone. Stay informed about local issues and participate in democratic processes.", difficulty: 3, points: 3, keyWords: ["engagement", "strengthens", "quality", "democratic"] }
        ]
      },
      macroLevel4: { 
        level: 4, 
        name: "Professional Interaction", 
        description: "Professional communication skills",
        words: [
          { id: "r2_m4_w1", content: "interview", difficulty: 1, points: 2, keyWords: ["interview"] },
          { id: "r2_m4_w2", content: "resume", difficulty: 1, points: 2, keyWords: ["resume"] },
          { id: "r2_m4_w3", content: "skills", difficulty: 1, points: 2, keyWords: ["skills"] },
          { id: "r2_m4_w4", content: "experience", difficulty: 2, points: 2, keyWords: ["experience"] },
          { id: "r2_m4_w5", content: "qualification", difficulty: 2, points: 2, keyWords: ["qualification"] },
          { id: "r2_m4_w6", content: "networking", difficulty: 2, points: 2, keyWords: ["networking"] },
          { id: "r2_m4_w7", content: "advancement", difficulty: 3, points: 2, keyWords: ["advancement"] },
          { id: "r2_m4_w8", content: "development", difficulty: 3, points: 2, keyWords: ["development"] },
          { id: "r2_m4_w9", content: "mentorship", difficulty: 3, points: 2, keyWords: ["mentorship"] },
          { id: "r2_m4_w10", content: "professionalism", difficulty: 3, points: 2, keyWords: ["professionalism"] }
        ], 
        sentences: [
          { id: "r2_m4_s1", content: "The job interview is tomorrow.", difficulty: 1, points: 2, keyWords: ["job", "interview", "tomorrow"] },
          { id: "r2_m4_s2", content: "Please update your resume.", difficulty: 1, points: 2, keyWords: ["please", "update", "resume"] },
          { id: "r2_m4_s3", content: "What skills do you have?", difficulty: 1, points: 2, keyWords: ["what", "skills", "have"] },
          { id: "r2_m4_s4", content: "I have five years of experience.", difficulty: 2, points: 2, keyWords: ["have", "five", "years", "experience"] },
          { id: "r2_m4_s5", content: "Do you have the right qualifications?", difficulty: 2, points: 2, keyWords: ["have", "right", "qualifications"] },
          { id: "r2_m4_s6", content: "Networking helps you find opportunities.", difficulty: 2, points: 2, keyWords: ["networking", "helps", "find", "opportunities"] },
          { id: "r2_m4_s7", content: "Career advancement requires continuous learning.", difficulty: 3, points: 2, keyWords: ["career", "advancement", "requires", "continuous", "learning"] },
          { id: "r2_m4_s8", content: "Professional development is important for growth.", difficulty: 3, points: 2, keyWords: ["professional", "development", "important", "growth"] },
          { id: "r2_m4_s9", content: "Mentorship provides valuable guidance.", difficulty: 3, points: 2, keyWords: ["mentorship", "provides", "valuable", "guidance"] },
          { id: "r2_m4_s10", content: "Professionalism opens many doors.", difficulty: 3, points: 2, keyWords: ["professionalism", "opens", "many", "doors"] }
        ], 
        paragraphs: [
          { id: "r2_m4_p1", content: "Preparing for job interviews requires research and practice. Learn about the company and the position beforehand. Prepare answers to common questions and dress appropriately.", difficulty: 1, points: 3, keyWords: ["preparing", "interviews", "research", "company"] },
          { id: "r2_m4_p2", content: "A good resume highlights your relevant skills and experience. Keep it clear and concise, usually no more than two pages. Include specific examples of your accomplishments.", difficulty: 1, points: 3, keyWords: ["resume", "highlights", "relevant", "accomplishments"] },
          { id: "r2_m4_p3", content: "Developing new skills helps you stay competitive in the job market. Take classes, attend workshops, or learn online. Practice what you learn to build confidence.", difficulty: 1, points: 3, keyWords: ["developing", "competitive", "workshops", "confidence"] },
          { id: "r2_m4_p4", content: "Work experience teaches you practical skills that cannot be learned in school. Every job provides opportunities to grow and learn new things. Document your achievements for future reference.", difficulty: 2, points: 3, keyWords: ["work", "experience", "practical", "achievements"] },
          { id: "r2_m4_p5", content: "Professional qualifications demonstrate your expertise to employers and clients. Pursue certifications relevant to your field. Keep your credentials current through continuing education.", difficulty: 2, points: 3, keyWords: ["qualifications", "demonstrate", "certifications", "credentials"] },
          { id: "r2_m4_p6", content: "Building a professional network opens doors to new opportunities. Attend industry events and join professional organizations. Maintain relationships by staying in regular contact.", difficulty: 2, points: 3, keyWords: ["building", "network", "opportunities", "organizations"] },
          { id: "r2_m4_p7", content: "Career advancement requires strategic planning and consistent effort. Set clear goals and create a timeline for achieving them. Seek feedback from supervisors and colleagues regularly.", difficulty: 3, points: 3, keyWords: ["advancement", "strategic", "timeline", "feedback"] },
          { id: "r2_m4_p8", content: "Continuous professional development keeps your skills current and marketable. Stay informed about industry trends and emerging technologies. Invest in learning opportunities that align with your career goals.", difficulty: 3, points: 3, keyWords: ["continuous", "development", "marketable", "technologies"] },
          { id: "r2_m4_p9", content: "Effective mentorship relationships benefit both mentors and mentees. Seek guidance from experienced professionals in your field. Share your knowledge with others who are earlier in their careers.", difficulty: 3, points: 3, keyWords: ["mentorship", "relationships", "guidance", "knowledge"] },
          { id: "r2_m4_p10", content: "Maintaining high standards of professionalism builds trust and credibility. Communicate clearly and respectfully in all interactions. Take responsibility for your work and admit mistakes honestly.", difficulty: 3, points: 3, keyWords: ["professionalism", "credibility", "communicate", "responsibility"] }
        ]
      }
    }
  },
  'reader-level-3': {
    readerLevel: 3,
    macroLevels: {
      macroLevel1: { 
        level: 1, 
        name: "Academic Foundations", 
        description: "Academic and technical vocabulary",
        words: [
          {
            id: "r3_m1_w1",
            content: "hypothesis",
            difficulty: 1,
            points: 3,
            keyWords: ["hypothesis"]
          },
          {
            id: "r3_m1_w2",
            content: "derive",
            difficulty: 1,
            points: 3,
            keyWords: ["derive"]
          },
          {
            id: "r3_m1_w3",
            content: "validate",
            difficulty: 1,
            points: 3,
            keyWords: ["validate"]
          },
          {
            id: "r3_m1_w4",
            content: "analyze",
            difficulty: 1,
            points: 3,
            keyWords: ["analyze"]
          },
          {
            id: "r3_m1_w5",
            content: "synthesize",
            difficulty: 2,
            points: 3,
            keyWords: ["synthesize"]
          },
          {
            id: "r3_m1_w6",
            content: "methodology",
            difficulty: 2,
            points: 3,
            keyWords: ["methodology"]
          },
          {
            id: "r3_m1_w7",
            content: "empirical",
            difficulty: 2,
            points: 3,
            keyWords: ["empirical"]
          },
          {
            id: "r3_m1_w8",
            content: "correlation",
            difficulty: 3,
            points: 3,
            keyWords: ["correlation"]
          },
          {
            id: "r3_m1_w9",
            content: "interdisciplinary",
            difficulty: 3,
            points: 3,
            keyWords: ["interdisciplinary"]
          },
          {
            id: "r3_m1_w10",
            content: "substantiate",
            difficulty: 3,
            points: 3,
            keyWords: ["substantiate"]
          }
        ], 
        sentences: [
          { id: "r3_m1_s1", content: "We need to test this hypothesis carefully.", difficulty: 1, points: 3, keyWords: ["need", "test", "hypothesis", "carefully"] },
          { id: "r3_m1_s2", content: "How did you derive this conclusion?", difficulty: 1, points: 3, keyWords: ["how", "derive", "conclusion"] },
          { id: "r3_m1_s3", content: "Please validate your research findings.", difficulty: 1, points: 3, keyWords: ["please", "validate", "research", "findings"] },
          { id: "r3_m1_s4", content: "We must analyze the data systematically.", difficulty: 1, points: 3, keyWords: ["must", "analyze", "data", "systematically"] },
          { id: "r3_m1_s5", content: "Can you synthesize these different theories?", difficulty: 2, points: 3, keyWords: ["can", "synthesize", "different", "theories"] },
          { id: "r3_m1_s6", content: "The methodology section needs revision.", difficulty: 2, points: 3, keyWords: ["methodology", "section", "needs", "revision"] },
          { id: "r3_m1_s7", content: "This empirical evidence supports our theory.", difficulty: 2, points: 3, keyWords: ["empirical", "evidence", "supports", "theory"] },
          { id: "r3_m1_s8", content: "There is a strong correlation between these variables.", difficulty: 3, points: 3, keyWords: ["strong", "correlation", "between", "variables"] },
          { id: "r3_m1_s9", content: "This interdisciplinary approach yields better results.", difficulty: 3, points: 3, keyWords: ["interdisciplinary", "approach", "yields", "better", "results"] },
          { id: "r3_m1_s10", content: "Additional research is needed to substantiate these claims.", difficulty: 3, points: 3, keyWords: ["additional", "research", "needed", "substantiate", "claims"] }
        ], 
        paragraphs: [
          { id: "r3_m1_p1", content: "Developing a strong hypothesis is the foundation of good research. State your hypothesis clearly and make it testable. A well-formed hypothesis guides the entire research process.", difficulty: 1, points: 4, keyWords: ["hypothesis", "foundation", "research", "testable"] },
          { id: "r3_m1_p2", content: "Learning to derive conclusions from data requires practice and critical thinking. Examine all available evidence before drawing conclusions. Ensure your reasoning is logical and well-supported.", difficulty: 1, points: 4, keyWords: ["derive", "conclusions", "evidence", "reasoning"] },
          { id: "r3_m1_p3", content: "Validating research findings helps ensure accuracy and reliability. Use multiple methods to verify your results. Peer review is an important part of the validation process.", difficulty: 1, points: 4, keyWords: ["validating", "findings", "accuracy", "reliability"] },
          { id: "r3_m1_p4", content: "Systematic analysis of data reveals patterns and relationships that might otherwise go unnoticed. Use appropriate statistical tools and techniques. Document your analytical process clearly.", difficulty: 1, points: 4, keyWords: ["analysis", "patterns", "relationships", "statistical"] },
          { id: "r3_m1_p5", content: "Synthesizing information from multiple sources creates new understanding and insights. Compare different perspectives and identify common themes. Integration of diverse viewpoints strengthens academic work.", difficulty: 2, points: 4, keyWords: ["synthesizing", "sources", "insights", "perspectives"] },
          { id: "r3_m1_p6", content: "A sound research methodology ensures that studies can be replicated and verified by other researchers. Choose methods appropriate to your research questions. Document procedures thoroughly for transparency.", difficulty: 2, points: 4, keyWords: ["methodology", "replicated", "procedures", "transparency"] },
          { id: "r3_m1_p7", content: "Empirical evidence provides the factual foundation for academic arguments and theories. Collect data through observation, experimentation, or measurement. Distinguish between empirical and theoretical knowledge.", difficulty: 2, points: 4, keyWords: ["empirical", "evidence", "factual", "theoretical"] },
          { id: "r3_m1_p8", content: "Understanding correlations between variables helps researchers identify potential causal relationships. Remember that correlation does not necessarily imply causation. Statistical significance must be interpreted carefully.", difficulty: 3, points: 4, keyWords: ["correlations", "variables", "causal", "significance"] },
          { id: "r3_m1_p9", content: "Interdisciplinary research combines knowledge and methods from different academic fields to address complex problems. This approach often leads to innovative solutions and new perspectives. Collaboration across disciplines enriches understanding.", difficulty: 3, points: 4, keyWords: ["interdisciplinary", "combines", "innovative", "collaboration"] },
          { id: "r3_m1_p10", content: "Substantiating claims with solid evidence is essential for credible academic work. Provide multiple forms of support for your arguments. Acknowledge limitations and areas for future research.", difficulty: 3, points: 4, keyWords: ["substantiating", "claims", "credible", "limitations"] }
        ] 
      },
      macroLevel2: { 
        level: 2, 
        name: "Technical Communication", 
        description: "Technical and professional language",
        words: [
          { id: "r3_m2_w1", content: "protocol", difficulty: 1, points: 3, keyWords: ["protocol"] },
          { id: "r3_m2_w2", content: "procedure", difficulty: 1, points: 3, keyWords: ["procedure"] },
          { id: "r3_m2_w3", content: "specification", difficulty: 1, points: 3, keyWords: ["specification"] },
          { id: "r3_m2_w4", content: "implementation", difficulty: 2, points: 3, keyWords: ["implementation"] },
          { id: "r3_m2_w5", content: "optimization", difficulty: 2, points: 3, keyWords: ["optimization"] },
          { id: "r3_m2_w6", content: "configuration", difficulty: 2, points: 3, keyWords: ["configuration"] },
          { id: "r3_m2_w7", content: "documentation", difficulty: 3, points: 3, keyWords: ["documentation"] },
          { id: "r3_m2_w8", content: "troubleshooting", difficulty: 3, points: 3, keyWords: ["troubleshooting"] },
          { id: "r3_m2_w9", content: "compatibility", difficulty: 3, points: 3, keyWords: ["compatibility"] },
          { id: "r3_m2_w10", content: "infrastructure", difficulty: 3, points: 3, keyWords: ["infrastructure"] }
        ], 
        sentences: [
          { id: "r3_m2_s1", content: "Follow the established protocol carefully.", difficulty: 1, points: 3, keyWords: ["follow", "established", "protocol", "carefully"] },
          { id: "r3_m2_s2", content: "This procedure requires special training.", difficulty: 1, points: 3, keyWords: ["procedure", "requires", "special", "training"] },
          { id: "r3_m2_s3", content: "Check the technical specifications first.", difficulty: 1, points: 3, keyWords: ["check", "technical", "specifications", "first"] },
          { id: "r3_m2_s4", content: "The implementation phase will begin tomorrow.", difficulty: 2, points: 3, keyWords: ["implementation", "phase", "begin", "tomorrow"] },
          { id: "r3_m2_s5", content: "System optimization improved overall performance.", difficulty: 2, points: 3, keyWords: ["system", "optimization", "improved", "performance"] },
          { id: "r3_m2_s6", content: "The network configuration needs adjustment.", difficulty: 2, points: 3, keyWords: ["network", "configuration", "needs", "adjustment"] },
          { id: "r3_m2_s7", content: "Complete documentation is essential for maintenance.", difficulty: 3, points: 3, keyWords: ["complete", "documentation", "essential", "maintenance"] },
          { id: "r3_m2_s8", content: "Effective troubleshooting requires systematic thinking.", difficulty: 3, points: 3, keyWords: ["effective", "troubleshooting", "requires", "systematic"] },
          { id: "r3_m2_s9", content: "Software compatibility issues affect user experience.", difficulty: 3, points: 3, keyWords: ["software", "compatibility", "issues", "experience"] },
          { id: "r3_m2_s10", content: "Robust infrastructure supports business operations.", difficulty: 3, points: 3, keyWords: ["robust", "infrastructure", "supports", "operations"] }
        ], 
        paragraphs: [
          { id: "r3_m2_p1", content: "Following established protocols ensures consistency and safety in technical work. Protocols provide step-by-step guidance for complex procedures. Regular updates keep protocols current with best practices.", difficulty: 1, points: 4, keyWords: ["protocols", "consistency", "safety", "guidance"] },
          { id: "r3_m2_p2", content: "Standard operating procedures help organizations maintain quality and efficiency. Document each step clearly and include safety considerations. Train all personnel thoroughly on proper procedures.", difficulty: 1, points: 4, keyWords: ["procedures", "quality", "efficiency", "safety"] },
          { id: "r3_m2_p3", content: "Technical specifications define requirements and standards for products and systems. Clear specifications prevent misunderstandings during development. Review specifications carefully before beginning any project.", difficulty: 1, points: 4, keyWords: ["specifications", "requirements", "standards", "development"] },
          { id: "r3_m2_p4", content: "Successful implementation requires careful planning and coordination among team members. Break large projects into manageable phases. Monitor progress regularly and adjust plans as needed.", difficulty: 2, points: 4, keyWords: ["implementation", "planning", "coordination", "phases"] },
          { id: "r3_m2_p5", content: "System optimization improves performance while reducing resource consumption. Identify bottlenecks and inefficiencies through careful analysis. Test optimizations thoroughly before full deployment.", difficulty: 2, points: 4, keyWords: ["optimization", "performance", "bottlenecks", "deployment"] },
          { id: "r3_m2_p6", content: "Proper configuration management ensures systems operate as intended. Document all configuration changes and their rationale. Maintain version control to track modifications over time.", difficulty: 2, points: 4, keyWords: ["configuration", "management", "rationale", "version"] },
          { id: "r3_m2_p7", content: "Comprehensive documentation serves as a knowledge repository for future reference. Include troubleshooting guides and common solutions. Keep documentation updated as systems evolve.", difficulty: 3, points: 4, keyWords: ["documentation", "repository", "troubleshooting", "evolve"] },
          { id: "r3_m2_p8", content: "Effective troubleshooting follows a systematic approach to identify and resolve technical problems. Gather relevant information before attempting solutions. Document resolution steps for future reference.", difficulty: 3, points: 4, keyWords: ["troubleshooting", "systematic", "resolution", "reference"] },
          { id: "r3_m2_p9", content: "Software compatibility testing ensures applications work correctly across different environments. Test on multiple platforms and configurations. Address compatibility issues before product release.", difficulty: 3, points: 4, keyWords: ["compatibility", "testing", "environments", "release"] },
          { id: "r3_m2_p10", content: "Reliable infrastructure forms the foundation of modern technological systems. Plan for scalability and future growth. Implement redundancy to ensure continuous operations.", difficulty: 3, points: 4, keyWords: ["infrastructure", "foundation", "scalability", "redundancy"] }
        ]
      },
      macroLevel3: { 
        level: 3, 
        name: "Research & Analysis", 
        description: "Research methodology and analysis",
        words: [
          { id: "r3_m3_w1", content: "survey", difficulty: 1, points: 3, keyWords: ["survey"] },
          { id: "r3_m3_w2", content: "sample", difficulty: 1, points: 3, keyWords: ["sample"] },
          { id: "r3_m3_w3", content: "variable", difficulty: 1, points: 3, keyWords: ["variable"] },
          { id: "r3_m3_w4", content: "statistics", difficulty: 2, points: 3, keyWords: ["statistics"] },
          { id: "r3_m3_w5", content: "qualitative", difficulty: 2, points: 3, keyWords: ["qualitative"] },
          { id: "r3_m3_w6", content: "quantitative", difficulty: 2, points: 3, keyWords: ["quantitative"] },
          { id: "r3_m3_w7", content: "interpretation", difficulty: 3, points: 3, keyWords: ["interpretation"] },
          { id: "r3_m3_w8", content: "significance", difficulty: 3, points: 3, keyWords: ["significance"] },
          { id: "r3_m3_w9", content: "longitudinal", difficulty: 3, points: 3, keyWords: ["longitudinal"] },
          { id: "r3_m3_w10", content: "meta-analysis", difficulty: 3, points: 3, keyWords: ["meta-analysis"] }
        ], 
        sentences: [
          { id: "r3_m3_s1", content: "The survey results are very interesting.", difficulty: 1, points: 3, keyWords: ["survey", "results", "very", "interesting"] },
          { id: "r3_m3_s2", content: "We need a larger sample size.", difficulty: 1, points: 3, keyWords: ["need", "larger", "sample", "size"] },
          { id: "r3_m3_s3", content: "This variable affects the outcome.", difficulty: 1, points: 3, keyWords: ["variable", "affects", "outcome"] },
          { id: "r3_m3_s4", content: "The statistics support our hypothesis.", difficulty: 2, points: 3, keyWords: ["statistics", "support", "hypothesis"] },
          { id: "r3_m3_s5", content: "Qualitative research provides rich insights.", difficulty: 2, points: 3, keyWords: ["qualitative", "research", "provides", "insights"] },
          { id: "r3_m3_s6", content: "Quantitative methods measure specific outcomes.", difficulty: 2, points: 3, keyWords: ["quantitative", "methods", "measure", "outcomes"] },
          { id: "r3_m3_s7", content: "Data interpretation requires careful consideration.", difficulty: 3, points: 3, keyWords: ["data", "interpretation", "requires", "consideration"] },
          { id: "r3_m3_s8", content: "The results show statistical significance.", difficulty: 3, points: 3, keyWords: ["results", "show", "statistical", "significance"] },
          { id: "r3_m3_s9", content: "This longitudinal study spans five years.", difficulty: 3, points: 3, keyWords: ["longitudinal", "study", "spans", "years"] },
          { id: "r3_m3_s10", content: "The meta-analysis combines multiple studies.", difficulty: 3, points: 3, keyWords: ["meta-analysis", "combines", "multiple", "studies"] }
        ], 
        paragraphs: [
          { id: "r3_m3_p1", content: "Conducting surveys effectively requires careful questionnaire design and appropriate sampling methods. Pre-test your survey with a small group before full deployment. Ensure questions are clear and unbiased.", difficulty: 1, points: 4, keyWords: ["surveys", "questionnaire", "sampling", "unbiased"] },
          { id: "r3_m3_p2", content: "Sample selection significantly impacts the validity and generalizability of research findings. Use random sampling when possible to reduce bias. Consider the target population when determining sample size.", difficulty: 1, points: 4, keyWords: ["sample", "validity", "generalizability", "population"] },
          { id: "r3_m3_p3", content: "Understanding different types of variables is essential for proper research design. Independent variables are manipulated while dependent variables are measured. Control variables help isolate specific effects.", difficulty: 1, points: 4, keyWords: ["variables", "independent", "dependent", "control"] },
          { id: "r3_m3_p4", content: "Statistical analysis helps researchers identify patterns and test hypotheses using numerical data. Choose appropriate statistical tests based on your data type and research questions. Report both statistical and practical significance.", difficulty: 2, points: 4, keyWords: ["statistical", "patterns", "hypotheses", "practical"] },
          { id: "r3_m3_p5", content: "Qualitative research methods explore complex phenomena through detailed observation and analysis. Interviews, focus groups, and ethnographic studies provide rich contextual information. Thematic analysis identifies patterns in qualitative data.", difficulty: 2, points: 4, keyWords: ["qualitative", "phenomena", "ethnographic", "thematic"] },
          { id: "r3_m3_p6", content: "Quantitative research emphasizes numerical measurement and statistical analysis to test specific hypotheses. Large sample sizes increase statistical power and reliability. Standardized instruments ensure consistent data collection.", difficulty: 2, points: 4, keyWords: ["quantitative", "numerical", "statistical", "standardized"] },
          { id: "r3_m3_p7", content: "Proper interpretation of research findings requires understanding both statistical results and their practical implications. Consider alternative explanations and potential limitations. Distinguish between correlation and causation carefully.", difficulty: 3, points: 4, keyWords: ["interpretation", "implications", "limitations", "causation"] },
          { id: "r3_m3_p8", content: "Statistical significance indicates whether observed differences likely occurred by chance. However, statistical significance does not necessarily imply practical importance. Effect size measures provide additional context.", difficulty: 3, points: 4, keyWords: ["significance", "differences", "chance", "effect"] },
          { id: "r3_m3_p9", content: "Longitudinal studies track changes in the same subjects over extended periods, providing insights into development and causation. These studies require significant time and resources but offer unique advantages over cross-sectional designs.", difficulty: 3, points: 4, keyWords: ["longitudinal", "changes", "development", "cross-sectional"] },
          { id: "r3_m3_p10", content: "Meta-analysis systematically combines results from multiple independent studies to increase statistical power and generalizability. Proper meta-analysis requires careful study selection and appropriate statistical techniques for data integration.", difficulty: 3, points: 4, keyWords: ["meta-analysis", "combines", "power", "integration"] }
        ]
      },
      macroLevel4: { 
        level: 4, 
        name: "Professional Reports", 
        description: "Professional and academic reporting",
        words: [], 
        sentences: [], 
        paragraphs: [] 
      }
    }
  },
  'reader-level-4': {
    readerLevel: 4,
    macroLevels: {
      macroLevel1: { 
        level: 1, 
        name: "Abstract Concepts", 
        description: "Abstract and philosophical vocabulary",
        words: [
          {
            id: "r4_m1_w1",
            content: "paradigm",
            difficulty: 1,
            points: 4,
            keyWords: ["paradigm"]
          },
          {
            id: "r4_m1_w2",
            content: "epistemology",
            difficulty: 1,
            points: 4,
            keyWords: ["epistemology"]
          },
          {
            id: "r4_m1_w3",
            content: "dichotomy",
            difficulty: 1,
            points: 4,
            keyWords: ["dichotomy"]
          },
          {
            id: "r4_m1_w4",
            content: "ideology",
            difficulty: 2,
            points: 4,
            keyWords: ["ideology"]
          },
          {
            id: "r4_m1_w5",
            content: "dialectical",
            difficulty: 2,
            points: 4,
            keyWords: ["dialectical"]
          },
          {
            id: "r4_m1_w6",
            content: "phenomenology",
            difficulty: 2,
            points: 4,
            keyWords: ["phenomenology"]
          },
          {
            id: "r4_m1_w7",
            content: "hermeneutics",
            difficulty: 3,
            points: 4,
            keyWords: ["hermeneutics"]
          },
          {
            id: "r4_m1_w8",
            content: "ontology",
            difficulty: 3,
            points: 4,
            keyWords: ["ontology"]
          },
          {
            id: "r4_m1_w9",
            content: "metaphysical",
            difficulty: 3,
            points: 4,
            keyWords: ["metaphysical"]
          },
          {
            id: "r4_m1_w10",
            content: "transcendental",
            difficulty: 4,
            points: 4,
            keyWords: ["transcendental"]
          }
        ], 
        sentences: [
          { id: "r4_m1_s1", content: "This paradigm shift changed everything.", difficulty: 1, points: 4, keyWords: ["paradigm", "shift", "changed", "everything"] },
          { id: "r4_m1_s2", content: "Epistemology examines the nature of knowledge.", difficulty: 1, points: 4, keyWords: ["epistemology", "examines", "nature", "knowledge"] },
          { id: "r4_m1_s3", content: "There is a false dichotomy here.", difficulty: 1, points: 4, keyWords: ["false", "dichotomy", "here"] },
          { id: "r4_m1_s4", content: "Her ontological assumptions are questionable.", difficulty: 2, points: 4, keyWords: ["ontological", "assumptions", "questionable"] },
          { id: "r4_m1_s5", content: "This phenomena defies easy categorization.", difficulty: 2, points: 4, keyWords: ["phenomena", "defies", "easy", "categorization"] },
          { id: "r4_m1_s6", content: "The hermeneutical approach reveals deeper meaning.", difficulty: 2, points: 4, keyWords: ["hermeneutical", "approach", "reveals", "deeper"] },
          { id: "r4_m1_s7", content: "This heuristic method simplifies complex problems.", difficulty: 3, points: 4, keyWords: ["heuristic", "method", "simplifies", "complex"] },
          { id: "r4_m1_s8", content: "Her dialectical reasoning impressed the committee.", difficulty: 3, points: 4, keyWords: ["dialectical", "reasoning", "impressed", "committee"] },
          { id: "r4_m1_s9", content: "The existential crisis affected his work.", difficulty: 3, points: 4, keyWords: ["existential", "crisis", "affected", "work"] },
          { id: "r4_m1_s10", content: "These transcendental ideas challenge conventional thinking.", difficulty: 3, points: 4, keyWords: ["transcendental", "ideas", "challenge", "conventional"] }
        ], 
        paragraphs: [
          { id: "r4_m1_p1", content: "Paradigm shifts fundamentally alter how we understand and approach complex problems. These transformative changes in perspective often meet resistance initially. However, successful paradigms eventually reshape entire fields of study.", difficulty: 1, points: 5, keyWords: ["paradigm", "shifts", "transformative", "reshape"] },
          { id: "r4_m1_p2", content: "Epistemological inquiry examines the fundamental nature of knowledge, truth, and justified belief. Different philosophical traditions offer varying approaches to understanding how we acquire knowledge. These debates continue to influence academic discourse.", difficulty: 1, points: 5, keyWords: ["epistemological", "inquiry", "philosophical", "discourse"] },
          { id: "r4_m1_p3", content: "False dichotomies oversimplify complex issues by presenting only two opposing options. Critical thinking requires recognizing when situations involve multiple possibilities. Avoiding binary thinking leads to more nuanced understanding.", difficulty: 1, points: 5, keyWords: ["dichotomies", "oversimplify", "binary", "nuanced"] },
          { id: "r4_m1_p4", content: "Ontological assumptions about the nature of reality significantly influence research methodologies and theoretical frameworks. Researchers must examine their fundamental beliefs about existence. These assumptions shape how questions are formulated and answered.", difficulty: 2, points: 5, keyWords: ["ontological", "assumptions", "methodologies", "formulated"] },
          { id: "r4_m1_p5", content: "Complex phenomena often resist simple explanations and require multifaceted analysis. Interdisciplinary approaches help illuminate different aspects of complicated issues. Understanding phenomena requires considering multiple perspectives simultaneously.", difficulty: 2, points: 5, keyWords: ["phenomena", "multifaceted", "interdisciplinary", "simultaneously"] },
          { id: "r4_m1_p6", content: "Hermeneutical interpretation seeks to understand meaning within specific cultural and historical contexts. This approach emphasizes the importance of perspective in understanding texts and experiences. Interpretation involves a dynamic dialogue between reader and subject.", difficulty: 2, points: 5, keyWords: ["hermeneutical", "interpretation", "contexts", "dialogue"] },
          { id: "r4_m1_p7", content: "Heuristic methods provide practical approaches to problem-solving when optimal solutions are not immediately apparent. These strategies offer good enough solutions in complex situations. Heuristics trade perfect accuracy for efficiency and applicability.", difficulty: 3, points: 5, keyWords: ["heuristic", "methods", "optimal", "efficiency"] },
          { id: "r4_m1_p8", content: "Dialectical reasoning examines opposing ideas to synthesize higher-level understanding. This process involves thesis, antithesis, and synthesis in ongoing intellectual development. Dialectical thinking embraces contradiction as a path to deeper truth.", difficulty: 3, points: 5, keyWords: ["dialectical", "reasoning", "synthesis", "contradiction"] },
          { id: "r4_m1_p9", content: "Existential philosophy explores fundamental questions about human existence, freedom, and responsibility. These inquiries examine the meaning and purpose of life in an apparently meaningless universe. Existential thought emphasizes individual choice and authenticity.", difficulty: 3, points: 5, keyWords: ["existential", "philosophy", "freedom", "authenticity"] },
          { id: "r4_m1_p10", content: "Transcendental concepts attempt to describe realities that exceed ordinary human experience and understanding. These ideas push beyond empirical observation to explore ultimate principles. Transcendental philosophy examines the conditions that make knowledge possible.", difficulty: 3, points: 5, keyWords: ["transcendental", "concepts", "empirical", "principles"] }
        ] 
      },
      macroLevel2: { 
        level: 2, 
        name: "Theoretical Frameworks", 
        description: "Complex theoretical concepts",
        words: [
          { id: "r4_m2_w1", content: "postmodernism", difficulty: 1, points: 4, keyWords: ["postmodernism"] },
          { id: "r4_m2_w2", content: "structuralism", difficulty: 1, points: 4, keyWords: ["structuralism"] },
          { id: "r4_m2_w3", content: "deconstruction", difficulty: 1, points: 4, keyWords: ["deconstruction"] },
          { id: "r4_m2_w4", content: "phenomenology", difficulty: 2, points: 4, keyWords: ["phenomenology"] },
          { id: "r4_m2_w5", content: "semiotics", difficulty: 2, points: 4, keyWords: ["semiotics"] },
          { id: "r4_m2_w6", content: "psychoanalysis", difficulty: 2, points: 4, keyWords: ["psychoanalysis"] },
          { id: "r4_m2_w7", content: "constructivism", difficulty: 3, points: 4, keyWords: ["constructivism"] },
          { id: "r4_m2_w8", content: "functionalism", difficulty: 3, points: 4, keyWords: ["functionalism"] },
          { id: "r4_m2_w9", content: "reductionism", difficulty: 3, points: 4, keyWords: ["reductionism"] },
          { id: "r4_m2_w10", content: "determinism", difficulty: 3, points: 4, keyWords: ["determinism"] }
        ], 
        sentences: [
          { id: "r4_m2_s1", content: "Postmodernism challenges traditional narratives.", difficulty: 1, points: 4, keyWords: ["postmodernism", "challenges", "traditional", "narratives"] },
          { id: "r4_m2_s2", content: "Structuralism examines underlying patterns.", difficulty: 1, points: 4, keyWords: ["structuralism", "examines", "underlying", "patterns"] },
          { id: "r4_m2_s3", content: "Deconstruction reveals hidden assumptions.", difficulty: 1, points: 4, keyWords: ["deconstruction", "reveals", "hidden", "assumptions"] },
          { id: "r4_m2_s4", content: "Phenomenology focuses on lived experience.", difficulty: 2, points: 4, keyWords: ["phenomenology", "focuses", "lived", "experience"] },
          { id: "r4_m2_s5", content: "Semiotics studies signs and symbols.", difficulty: 2, points: 4, keyWords: ["semiotics", "studies", "signs", "symbols"] },
          { id: "r4_m2_s6", content: "Psychoanalysis explores unconscious motivations.", difficulty: 2, points: 4, keyWords: ["psychoanalysis", "explores", "unconscious", "motivations"] },
          { id: "r4_m2_s7", content: "Constructivism emphasizes active knowledge building.", difficulty: 3, points: 4, keyWords: ["constructivism", "emphasizes", "active", "knowledge"] },
          { id: "r4_m2_s8", content: "Functionalism analyzes social structures systematically.", difficulty: 3, points: 4, keyWords: ["functionalism", "analyzes", "social", "systematically"] },
          { id: "r4_m2_s9", content: "Reductionism simplifies complex phenomena.", difficulty: 3, points: 4, keyWords: ["reductionism", "simplifies", "complex", "phenomena"] },
          { id: "r4_m2_s10", content: "Determinism questions the nature of free will.", difficulty: 3, points: 4, keyWords: ["determinism", "questions", "nature", "free", "will"] }
        ], 
        paragraphs: [
          { id: "r4_m2_p1", content: "Postmodern thought challenges the grand narratives and universal truths that characterized earlier philosophical and cultural movements. This intellectual movement emphasizes plurality, skepticism, and the social construction of reality. Postmodernism has influenced diverse fields from literature to architecture.", difficulty: 1, points: 5, keyWords: ["postmodern", "narratives", "universal", "construction"] },
          { id: "r4_m2_p2", content: "Structuralist theory seeks to understand cultural phenomena by analyzing underlying structures and relationships. This approach examines how elements derive meaning from their position within larger systems. Structuralism has been influential in linguistics, anthropology, and literary criticism.", difficulty: 1, points: 5, keyWords: ["structuralist", "phenomena", "relationships", "linguistics"] },
          { id: "r4_m2_p3", content: "Deconstructive reading strategies reveal the instability of meaning in texts and cultural artifacts. This critical approach examines how texts undermine their own apparent meaning. Deconstruction challenges binary oppositions and fixed interpretations.", difficulty: 1, points: 5, keyWords: ["deconstructive", "instability", "artifacts", "oppositions"] },
          { id: "r4_m2_p4", content: "Phenomenological investigation focuses on the structures of experience and consciousness as they present themselves to awareness. This philosophical method brackets assumptions about the external world. Phenomenology has influenced psychology, sociology, and cognitive science.", difficulty: 2, points: 5, keyWords: ["phenomenological", "consciousness", "awareness", "cognitive"] },
          { id: "r4_m2_p5", content: "Semiotic analysis examines how meaning is created and communicated through systems of signs and symbols. This interdisciplinary field studies language, images, gestures, and other forms of communication. Semiotics reveals the cultural codes underlying meaning-making processes.", difficulty: 2, points: 5, keyWords: ["semiotic", "analysis", "communicated", "interdisciplinary"] },
          { id: "r4_m2_p6", content: "Psychoanalytic theory explores the role of unconscious processes in shaping human behavior and experience. This framework examines repressed desires, defense mechanisms, and childhood influences. Psychoanalysis has profoundly influenced psychology, literature, and cultural studies.", difficulty: 2, points: 5, keyWords: ["psychoanalytic", "unconscious", "repressed", "mechanisms"] },
          { id: "r4_m2_p7", content: "Constructivist epistemology argues that knowledge is actively constructed rather than passively received. Learners build understanding through interaction with their environment and social context. This theory has transformed educational practice and cognitive psychology.", difficulty: 3, points: 5, keyWords: ["constructivist", "epistemology", "constructed", "transformed"] },
          { id: "r4_m2_p8", content: "Functionalist social theory examines how institutions and practices contribute to social stability and cohesion. This perspective views society as a complex system of interrelated parts. Functionalism emphasizes adaptation, integration, and the maintenance of social order.", difficulty: 3, points: 5, keyWords: ["functionalist", "institutions", "cohesion", "adaptation"] },
          { id: "r4_m2_p9", content: "Reductionist approaches attempt to explain complex phenomena by breaking them down into simpler components. While this strategy can provide valuable insights, critics argue it may oversimplify emergent properties. The tension between reductionism and holism continues in many disciplines.", difficulty: 3, points: 5, keyWords: ["reductionist", "components", "emergent", "holism"] },
          { id: "r4_m2_p10", content: "Determinist philosophies suggest that events are the inevitable result of prior causes, raising questions about human agency and moral responsibility. Different forms of determinism emphasize various causal factors. Contemporary debates examine compatibility with free will and ethical accountability.", difficulty: 3, points: 5, keyWords: ["determinist", "inevitable", "agency", "compatibility"] }
        ] 
      },
      macroLevel3: { 
        level: 3, 
        name: "Critical Analysis", 
        description: "Advanced critical thinking vocabulary",
        words: [
          { id: "r4_m3_w1", content: "juxtaposition", difficulty: 1, points: 4, keyWords: ["juxtaposition"] },
          { id: "r4_m3_w2", content: "synthesis", difficulty: 1, points: 4, keyWords: ["synthesis"] },
          { id: "r4_m3_w3", content: "antithesis", difficulty: 1, points: 4, keyWords: ["antithesis"] },
          { id: "r4_m3_w4", content: "paradox", difficulty: 2, points: 4, keyWords: ["paradox"] },
          { id: "r4_m3_w5", content: "irony", difficulty: 2, points: 4, keyWords: ["irony"] },
          { id: "r4_m3_w6", content: "allegory", difficulty: 2, points: 4, keyWords: ["allegory"] },
          { id: "r4_m3_w7", content: "epitome", difficulty: 3, points: 4, keyWords: ["epitome"] },
          { id: "r4_m3_w8", content: "dichotomy", difficulty: 3, points: 4, keyWords: ["dichotomy"] },
          { id: "r4_m3_w9", content: "anachronism", difficulty: 3, points: 4, keyWords: ["anachronism"] },
          { id: "r4_m3_w10", content: "zeitgeist", difficulty: 3, points: 4, keyWords: ["zeitgeist"] }
        ], 
        sentences: [
          { id: "r4_m3_s1", content: "The juxtaposition creates striking contrast.", difficulty: 1, points: 4, keyWords: ["juxtaposition", "creates", "striking", "contrast"] },
          { id: "r4_m3_s2", content: "Her synthesis unified opposing theories.", difficulty: 1, points: 4, keyWords: ["synthesis", "unified", "opposing", "theories"] },
          { id: "r4_m3_s3", content: "This represents the antithesis of progress.", difficulty: 1, points: 4, keyWords: ["represents", "antithesis", "progress"] },
          { id: "r4_m3_s4", content: "The situation presents an interesting paradox.", difficulty: 2, points: 4, keyWords: ["situation", "presents", "interesting", "paradox"] },
          { id: "r4_m3_s5", content: "The irony was not lost on observers.", difficulty: 2, points: 4, keyWords: ["irony", "not", "lost", "observers"] },
          { id: "r4_m3_s6", content: "The novel functions as political allegory.", difficulty: 2, points: 4, keyWords: ["novel", "functions", "political", "allegory"] },
          { id: "r4_m3_s7", content: "She embodies the epitome of excellence.", difficulty: 3, points: 4, keyWords: ["embodies", "epitome", "excellence"] },
          { id: "r4_m3_s8", content: "This false dichotomy oversimplifies the issue.", difficulty: 3, points: 4, keyWords: ["false", "dichotomy", "oversimplifies", "issue"] },
          { id: "r4_m3_s9", content: "The anachronism disrupts historical accuracy.", difficulty: 3, points: 4, keyWords: ["anachronism", "disrupts", "historical", "accuracy"] },
          { id: "r4_m3_s10", content: "The zeitgeist influenced artistic expression.", difficulty: 3, points: 4, keyWords: ["zeitgeist", "influenced", "artistic", "expression"] }
        ], 
        paragraphs: [
          { id: "r4_m3_p1", content: "Strategic juxtaposition in literary and visual arts creates powerful effects by placing contrasting elements in close proximity. This technique highlights differences and generates new meanings through comparison. Effective juxtaposition can challenge audience assumptions and provoke deeper reflection.", difficulty: 1, points: 5, keyWords: ["juxtaposition", "contrasting", "proximity", "assumptions"] },
          { id: "r4_m3_p2", content: "Intellectual synthesis combines disparate ideas, theories, or approaches to create new understanding or frameworks. This process requires identifying common elements while preserving essential differences. Successful synthesis often leads to breakthrough insights and innovative solutions.", difficulty: 1, points: 5, keyWords: ["synthesis", "disparate", "frameworks", "breakthrough"] },
          { id: "r4_m3_p3", content: "The concept of antithesis encompasses direct opposition or contrast between ideas, characters, or situations. This rhetorical and analytical tool reveals tensions and contradictions within arguments. Understanding antithetical relationships deepens critical analysis and argumentation.", difficulty: 1, points: 5, keyWords: ["antithesis", "opposition", "contradictions", "argumentation"] },
          { id: "r4_m3_p4", content: "Paradoxes present seemingly contradictory statements that reveal deeper truths upon careful examination. These logical puzzles often illuminate the limitations of conventional thinking. Paradoxical situations require nuanced understanding that transcends simple binary logic.", difficulty: 2, points: 5, keyWords: ["paradoxes", "contradictory", "illuminate", "transcends"] },
          { id: "r4_m3_p5", content: "Ironic situations involve discrepancies between expectation and reality, often revealing hidden truths or critiquing social conditions. Literary irony operates through various forms including verbal, situational, and dramatic irony. Understanding irony requires cultural and contextual knowledge.", difficulty: 2, points: 5, keyWords: ["ironic", "discrepancies", "critiquing", "contextual"] },
          { id: "r4_m3_p6", content: "Allegorical works use symbolic narratives to convey deeper meanings about moral, political, or philosophical issues. This literary technique allows authors to explore complex themes through extended metaphor. Allegorical interpretation requires understanding both surface narrative and underlying significance.", difficulty: 2, points: 5, keyWords: ["allegorical", "symbolic", "metaphor", "significance"] },
          { id: "r4_m3_p7", content: "The epitome represents the perfect example or embodiment of particular qualities or characteristics. Identifying epitomes helps clarify abstract concepts and establish standards for evaluation. Epitomical examples serve as benchmarks for understanding excellence in various domains.", difficulty: 3, points: 5, keyWords: ["epitome", "embodiment", "benchmarks", "domains"] },
          { id: "r4_m3_p8", content: "False dichotomies oversimplify complex issues by presenting only two opposing options when multiple possibilities exist. Critical analysis requires recognizing when binary thinking obscures nuanced understanding. Avoiding dichotomous reasoning leads to more sophisticated and accurate assessments.", difficulty: 3, points: 5, keyWords: ["dichotomies", "oversimplify", "binary", "sophisticated"] },
          { id: "r4_m3_p9", content: "Anachronisms involve placing people, objects, or ideas in inappropriate historical contexts, often revealing contemporary biases or misunderstandings. Historical analysis must attend to temporal accuracy and contextual appropriateness. Anachronistic errors can undermine scholarly credibility and interpretive validity.", difficulty: 3, points: 5, keyWords: ["anachronisms", "inappropriate", "temporal", "credibility"] },
          { id: "r4_m3_p10", content: "The zeitgeist encompasses the prevailing intellectual, cultural, and moral climate of a particular era. Understanding zeitgeist helps explain why certain ideas emerge and gain acceptance during specific historical periods. Cultural analysis requires sensitivity to temporal context and ideological atmosphere.", difficulty: 3, points: 5, keyWords: ["zeitgeist", "prevailing", "ideological", "atmosphere"] }
        ] 
      },
      macroLevel4: { 
        level: 4, 
        name: "Philosophical Discourse", 
        description: "Highest level philosophical terms",
        words: [
          { id: "r4_m4_w1", content: "metaphysical", difficulty: 1, points: 4, keyWords: ["metaphysical"] },
          { id: "r4_m4_w2", content: "empiricism", difficulty: 1, points: 4, keyWords: ["empiricism"] },
          { id: "r4_m4_w3", content: "rationalism", difficulty: 1, points: 4, keyWords: ["rationalism"] },
          { id: "r4_m4_w4", content: "solipsism", difficulty: 2, points: 4, keyWords: ["solipsism"] },
          { id: "r4_m4_w5", content: "nihilism", difficulty: 2, points: 4, keyWords: ["nihilism"] },
          { id: "r4_m4_w6", content: "pragmatism", difficulty: 2, points: 4, keyWords: ["pragmatism"] },
          { id: "r4_m4_w7", content: "phenomenological", difficulty: 3, points: 4, keyWords: ["phenomenological"] },
          { id: "r4_m4_w8", content: "teleological", difficulty: 3, points: 4, keyWords: ["teleological"] },
          { id: "r4_m4_w9", content: "epistemological", difficulty: 3, points: 4, keyWords: ["epistemological"] },
          { id: "r4_m4_w10", content: "ontological", difficulty: 3, points: 4, keyWords: ["ontological"] }
        ], 
        sentences: [
          { id: "r4_m4_s1", content: "Metaphysical questions transcend physical reality.", difficulty: 1, points: 4, keyWords: ["metaphysical", "questions", "transcend", "reality"] },
          { id: "r4_m4_s2", content: "Empiricism relies on sensory experience.", difficulty: 1, points: 4, keyWords: ["empiricism", "relies", "sensory", "experience"] },
          { id: "r4_m4_s3", content: "Rationalism emphasizes reason over experience.", difficulty: 1, points: 4, keyWords: ["rationalism", "emphasizes", "reason", "experience"] },
          { id: "r4_m4_s4", content: "Solipsism questions the existence of others.", difficulty: 2, points: 4, keyWords: ["solipsism", "questions", "existence", "others"] },
          { id: "r4_m4_s5", content: "Nihilism denies inherent meaning in existence.", difficulty: 2, points: 4, keyWords: ["nihilism", "denies", "inherent", "existence"] },
          { id: "r4_m4_s6", content: "Pragmatism values practical consequences.", difficulty: 2, points: 4, keyWords: ["pragmatism", "values", "practical", "consequences"] },
          { id: "r4_m4_s7", content: "Phenomenological analysis examines conscious experience.", difficulty: 3, points: 4, keyWords: ["phenomenological", "analysis", "conscious", "experience"] },
          { id: "r4_m4_s8", content: "Teleological explanations invoke purpose or design.", difficulty: 3, points: 4, keyWords: ["teleological", "explanations", "invoke", "design"] },
          { id: "r4_m4_s9", content: "Epistemological problems concern the nature of knowledge.", difficulty: 3, points: 4, keyWords: ["epistemological", "problems", "concern", "knowledge"] },
          { id: "r4_m4_s10", content: "Ontological assumptions shape our worldview fundamentally.", difficulty: 3, points: 4, keyWords: ["ontological", "assumptions", "worldview", "fundamentally"] }
        ], 
        paragraphs: [
          { id: "r4_m4_p1", content: "Metaphysical inquiry explores fundamental questions about the nature of reality that lie beyond the scope of empirical investigation. These philosophical investigations examine existence, identity, time, and causation. Metaphysical debates have shaped intellectual discourse throughout human history.", difficulty: 1, points: 5, keyWords: ["metaphysical", "inquiry", "empirical", "causation"] },
          { id: "r4_m4_p2", content: "Empiricist philosophy holds that knowledge derives primarily from sensory experience rather than innate ideas or pure reason. This tradition emphasizes observation, experimentation, and evidence-based reasoning. Empiricism has profoundly influenced scientific methodology and epistemological theory.", difficulty: 1, points: 5, keyWords: ["empiricist", "sensory", "innate", "methodology"] },
          { id: "r4_m4_p3", content: "Rationalist thought prioritizes reason and logical analysis over empirical observation as sources of knowledge. This philosophical approach emphasizes the mind's capacity for understanding through rational reflection. Rationalism has contributed significantly to mathematical and logical foundations of knowledge.", difficulty: 1, points: 5, keyWords: ["rationalist", "logical", "reflection", "mathematical"] },
          { id: "r4_m4_p4", content: "Solipsistic philosophy represents the extreme position that only one's own mind can be known to exist with certainty. This skeptical stance challenges assumptions about external reality and other minds. While philosophically interesting, solipsism poses significant practical and ethical challenges.", difficulty: 2, points: 5, keyWords: ["solipsistic", "skeptical", "external", "ethical"] },
          { id: "r4_m4_p5", content: "Nihilistic perspectives deny the existence of objective moral values, inherent purpose, or ultimate meaning in existence. This philosophical position emerged prominently in 19th-century European thought. Nihilism raises profound questions about how to live meaningfully without transcendent foundations.", difficulty: 2, points: 5, keyWords: ["nihilistic", "objective", "transcendent", "foundations"] },
          { id: "r4_m4_p6", content: "Pragmatic philosophy evaluates ideas and theories based on their practical consequences and utility rather than abstract principles. This approach emphasizes workable solutions and effective action. Pragmatism has influenced education, politics, and problem-solving methodologies significantly.", difficulty: 2, points: 5, keyWords: ["pragmatic", "utility", "workable", "methodologies"] },
          { id: "r4_m4_p7", content: "Phenomenological investigation examines the structures of consciousness and experience as they appear to awareness without presuppositions about external reality. This method focuses on describing rather than explaining phenomena. Phenomenology has influenced psychology, sociology, and literary criticism profoundly.", difficulty: 3, points: 5, keyWords: ["phenomenological", "consciousness", "presuppositions", "criticism"] },
          { id: "r4_m4_p8", content: "Teleological reasoning explains events or phenomena by reference to their purposes, goals, or end states rather than efficient causes. This approach raises questions about intentionality in nature and design. Contemporary debates examine teleology's role in biology, psychology, and ethics.", difficulty: 3, points: 5, keyWords: ["teleological", "phenomena", "intentionality", "contemporary"] },
          { id: "r4_m4_p9", content: "Epistemological analysis examines the nature, sources, limitations, and validity of human knowledge. This philosophical discipline addresses fundamental questions about truth, belief, and justification. Epistemological theories have profound implications for science, education, and rational discourse.", difficulty: 3, points: 5, keyWords: ["epistemological", "limitations", "justification", "implications"] },
          { id: "r4_m4_p10", content: "Ontological commitments involve fundamental assumptions about what kinds of entities exist and their essential properties. These philosophical positions influence theoretical frameworks and methodological approaches across disciplines. Ontological debates continue to shape contemporary academic and scientific discourse.", difficulty: 3, points: 5, keyWords: ["ontological", "entities", "methodological", "discourse"] }
        ] 
      }
    }
  }
};

// Helper Functions
export const getContentForLevel = (readerLevel: 1 | 2 | 3 | 4, macroLevel: 1 | 2 | 3 | 4) => {
  const levelData = GAME_CONTENT[`reader-level-${readerLevel}`];
  return levelData?.macroLevels[`macroLevel${macroLevel}` as keyof typeof levelData.macroLevels];
};

// Get sequential content for a specific micro-level (1-30)
// Micro-levels 1-10: words, 11-20: sentences, 21-30: paragraphs
export const getSequentialContent = (
  readerLevel: 1 | 2 | 3 | 4,
  macroLevel: 1 | 2 | 3 | 4,
  microLevel: number
): ContentItem | null => {
  const content = getContentForLevel(readerLevel, macroLevel);
  if (!content) return null;

  if (microLevel <= 10) return content.words[microLevel - 1] || null;
  if (microLevel <= 20) return content.sentences[microLevel - 11] || null;
  return content.paragraphs[microLevel - 21] || null;
};

// Get content type label for a given micro-level number
export const getContentTypeForMicroLevel = (microLevel: number): 'words' | 'sentences' | 'paragraphs' => {
  if (microLevel <= 10) return 'words';
  if (microLevel <= 20) return 'sentences';
  return 'paragraphs';
};