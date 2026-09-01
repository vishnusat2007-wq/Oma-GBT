export interface DailySurprise {
  kind: "fact" | "joke" | "challenge" | "wonder";
  emoji: string;
  text: string;
}

const SURPRISES: DailySurprise[] = [
  { kind: "fact", emoji: "🐙", text: "Octopuses have three hearts! Can you make your heartbeat go fast by jumping?" },
  { kind: "joke", emoji: "😆", text: "What do you call a bear with no teeth? A gummy bear!" },
  { kind: "challenge", emoji: "🎨", text: "Today's mini-quest: draw a creature that is half your favourite animal, half robot." },
  { kind: "wonder", emoji: "🌈", text: "Did you know rainbows are actually full circles? We usually only see half from the ground." },
  { kind: "fact", emoji: "🍯", text: "Honey never spoils. Explorers found 3,000-year-old honey that was still good!" },
  { kind: "challenge", emoji: "🤸", text: "Today's mini-quest: teach your companion three fun facts about YOU." },
  { kind: "joke", emoji: "🦕", text: "Why can't dinosaurs clap? Because they're extinct... but we can clap for them!" },
];

/** Deterministic per calendar day, so the surprise is stable within a day. */
export function getDailySurprise(date = new Date()): DailySurprise {
  const dayNumber = Math.floor(date.getTime() / 86400000);
  return SURPRISES[dayNumber % SURPRISES.length];
}

export function greetingForTime(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
