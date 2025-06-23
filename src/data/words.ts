export type Word = {
    word: string
    translation: string
    partOfSpeech: "noun" | "verb" | "adjective" | "adverb"
    examples: string[]
  }
  
  export const words: Word[] = [
    {
      word: "apple",
      translation: "яблуко",
      partOfSpeech: "noun",
      examples: [
        "She ate an apple for lunch.",
        "I like apple juice."
      ]
    },
    {
      word: "run",
      translation: "бігти",
      partOfSpeech: "verb",
      examples: [
        "I run every morning.",
        "She can run fast."
      ]
    },
    {
      word: "beautiful",
      translation: "гарний",
      partOfSpeech: "adjective",
      examples: [
        "What a beautiful sunset.",
        "She has a beautiful smile."
      ]
    }
  ]
  