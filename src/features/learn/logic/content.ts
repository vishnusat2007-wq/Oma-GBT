export interface Flashcard {
  front: string;
  back: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  simple: string;
  deeper: string;
  flashcards: Flashcard[];
}

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: "space",
    title: "Our Solar System",
    emoji: "🪐",
    summary: "The Sun and the planets that travel around it.",
    simple:
      "The Sun is a giant star. Eight planets go around it in big circles, like a cosmic merry-go-round!",
    deeper:
      "The eight planets in order from the Sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The four closest are rocky, and the four farthest are big balls of gas and ice.",
    flashcards: [
      { front: "Which planet do we live on?", back: "Earth 🌍" },
      { front: "Which planet is the biggest?", back: "Jupiter" },
      { front: "What is the Sun?", back: "A star!" },
      { front: "Which planet has beautiful rings?", back: "Saturn" },
    ],
  },
  {
    id: "math",
    title: "Times Tables",
    emoji: "✖️",
    summary: "Multiplication is just fast adding of groups.",
    simple:
      "3 × 4 means 'four groups of three'. Count: 3, 6, 9, 12. That's it — 12!",
    deeper:
      "Multiplication tables help you add equal groups quickly. Skip-counting (2, 4, 6, 8…) is a great way to practise, and it makes division easier later too.",
    flashcards: [
      { front: "6 × 7", back: "42" },
      { front: "8 × 8", back: "64" },
      { front: "9 × 3", back: "27" },
      { front: "5 × 6", back: "30" },
    ],
  },
  {
    id: "nature",
    title: "Life Cycle of a Butterfly",
    emoji: "🦋",
    summary: "How a caterpillar becomes a butterfly.",
    simple:
      "Egg → caterpillar → chrysalis → butterfly. It's like a magical costume change!",
    deeper:
      "This amazing change is called metamorphosis. A caterpillar eats and grows, forms a chrysalis, and its body reorganises into a beautiful butterfly with wings.",
    flashcards: [
      { front: "What hatches from a butterfly egg?", back: "A caterpillar" },
      { front: "What is the big change called?", back: "Metamorphosis" },
      { front: "Where does the caterpillar transform?", back: "In a chrysalis" },
      { front: "What comes out at the end?", back: "A butterfly 🦋" },
    ],
  },
  {
    id: "words",
    title: "Fun With Words",
    emoji: "📚",
    summary: "Synonyms, antonyms, and rhymes.",
    simple:
      "Synonyms mean the same (big/large). Antonyms are opposites (hot/cold). Rhymes sound alike (cat/hat).",
    deeper:
      "Building a bigger vocabulary helps you read and tell stories. Try to find one new word each day and use it in a sentence!",
    flashcards: [
      { front: "A synonym for 'happy'?", back: "Joyful / glad" },
      { front: "An antonym for 'up'?", back: "Down" },
      { front: "A word that rhymes with 'star'?", back: "Car / far / jar" },
      { front: "A synonym for 'fast'?", back: "Quick / speedy" },
    ],
  },
];

export function getTopic(id: string): LearningTopic | undefined {
  return LEARNING_TOPICS.find((t) => t.id === id);
}
