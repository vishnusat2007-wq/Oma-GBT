import type { AiProvider, AiRequest } from "./types";

const SPACE_FACTS = [
  "The Sun is so big that about 1.3 million Earths could fit inside it! ☀️",
  "A day on Venus is longer than a whole year on Venus — it spins super slowly. 🪐",
  "There are more stars in the sky than grains of sand on all the beaches on Earth. ✨",
  "Astronauts can grow up to 5 cm taller in space because their spines stretch! 🚀",
];

const ANIMAL_FACTS = [
  "A group of flamingos is called a 'flamboyance'. So fancy! 🦩",
  "Octopuses have three hearts and blue blood. 🐙",
  "Sea otters hold hands while they sleep so they don't drift apart. 🦦",
  "A snail can sleep for up to three years. That's a long nap! 🐌",
];

const JOKES = [
  "Why did the cookie go to the doctor? Because it felt crumbly! 🍪",
  "What do you call a dinosaur that loves naps? A dino-snore! 🦕",
  "Why did the star do so well in school? Because it was a bright one! ⭐",
];

/** Deterministic, offline reply used in demo mode and when no AI key is set. */
export function mockReply(req: AiRequest): string {
  const last =
    [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const text = last.toLowerCase();
  const name = req.context.childName || "friend";
  const companion = req.context.companionName || "your companion";

  const pick = (arr: string[]) => arr[Math.floor((last.length + arr.length) % arr.length)];

  if (!text.trim()) {
    return `Hi ${name}! I'm ${companion}. What would you like to do — chat, a game, a story, or a fun fact? 🌟`;
  }
  // Answer wellbeing questions before hi/hello so "how are you?" is not treated as a topic change.
  if (
    /\bhow(?:'s|s| are) (?:you|it going)\b|\bwhat(?:'s|s) up\b|\bhow do you feel\b/.test(
      text,
    )
  ) {
    return `I'm great — how are you?`;
  }
  if (/\b(hi|hello|hey|hiya|yo)\b/.test(text)) {
    return `Hi ${name}! So happy to see you. What do you want to talk about?`;
  }
  if (text.includes("your name") || text.includes("who are you")) {
    return `I'm ${companion}, your friendly AI companion! I'm not a real person, but I love chatting, playing, and imagining stories with you. 🤖💜`;
  }
  if (/\bsunflower/.test(text)) {
    return `A sunflower is a tall plant with a big yellow flower that turns to face the sun. 🌻`;
  }
  if (text.includes("space") || text.includes("planet") || text.includes("star")) {
    return `Ooh, space! 🚀 ${pick(SPACE_FACTS)}\n\nWant another space fact, or should we invent a story about an astronaut?`;
  }
  if (text.includes("animal") || text.includes("dog") || text.includes("cat") || text.includes("dino")) {
    return `Animals are the best! 🐾 ${pick(ANIMAL_FACTS)}\n\nWould you like to play *Guess What* and I'll think of an animal?`;
  }
  if (text.includes("joke") || text.includes("funny")) {
    return `${pick(JOKES)}\n\nHehe! Want to hear another one? 😆`;
  }
  if (text.includes("story") || text.includes("tell me a tale")) {
    const hero = req.context.interests[0] ?? "a brave little fox";
    return `Once upon a time, there was ${hero} who discovered a glowing door in the forest. 🌲✨ Behind it was a world made of your favourite things!\n\nWhat should happen next — do they **step through the door** or **call a friend to come along**?`;
  }
  if (/\b(\d+)\s*[x*+\-]\s*(\d+)\b/.test(text)) {
    return `Let's figure it out together! 🧮 Try counting it in groups — for example, 3 × 4 means four groups of three: 3, 6, 9, 12. Want me to make it into a fun quiz?`;
  }
  if (text.includes("help") || text.includes("homework") || text.includes("learn")) {
    return `I'd love to help you learn, ${name}! 📚 Tell me the topic, and I'll explain it in a simple way — then we can do a little quiz so it really sticks. What are we learning today?`;
  }
  if (text.includes("weather")) {
    return `I can't peek outside on my own, but I can ask a grown-up for permission to check the weather using our safe tools. Want me to request that? ☀️🌧️`;
  }
  if (text.includes("sad") || text.includes("scared") || text.includes("angry")) {
    return `I'm here for you, ${name}. 💜 Big feelings are okay. Take a slow breath with me — in… and out. If you want, tell a trusted grown-up how you feel too. Want to do something cozy, like a calm story?`;
  }
  if (text.includes("thank")) {
    return `Aww, you're so welcome! You're a wonderful friend, ${name}. 🌈`;
  }
  return `That's interesting, ${name}! 😊 Tell me more, or we could turn it into a story, a quiz, or a game. What sounds fun?`;
}

async function textToStream(text: string): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const tokens = text.match(/\S+\s*/g) ?? [text];
  return new ReadableStream({
    async start(controller) {
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
}

export const mockProvider: AiProvider = {
  id: "mock",
  async stream(req) {
    return textToStream(mockReply(req));
  },
};
