import type { SafetyCategory } from "@/lib/data/types";

export type SafetyAction = "allow" | "redirected" | "refused" | "encouraged-adult";

export interface SafetyResult {
  safe: boolean;
  category: SafetyCategory | null;
  action: SafetyAction;
  /** Child-friendly, non-frightening message to show instead of a model response. */
  response: string | null;
  /** True for urgent situations where immediate adult/emergency help is advised. */
  urgent: boolean;
}

const ALLOW: SafetyResult = {
  safe: true,
  category: null,
  action: "allow",
  response: null,
  urgent: false,
};

interface Rule {
  category: SafetyCategory;
  patterns: RegExp[];
  action: SafetyAction;
  urgent?: boolean;
  response: string;
}

// Rules are intentionally conservative. Ordering matters: the most protective
// categories are checked first.
const RULES: Rule[] = [
  {
    category: "self-harm",
    action: "encouraged-adult",
    urgent: true,
    patterns: [
      /\bkill myself\b/i,
      /\bhurt myself\b/i,
      /\bhurting myself\b/i,
      /\bend my life\b/i,
      /\bself[-\s]?harm\b/i,
      /\bwant to die\b/i,
      /\bcut myself\b/i,
    ],
    response:
      "I'm really glad you told me, and I care about you. Please talk to a trusted grown-up nearby right now — like a parent, family member, or teacher. If you ever feel in danger, tell an adult immediately or call your local emergency number. You are not alone. 💜",
  },
  {
    category: "grooming",
    action: "encouraged-adult",
    urgent: true,
    patterns: [
      /\bkeep\b.{0,24}\bsecret\b/i,
      /\b(it'?s|its|our|a)\s+secret\b/i,
      /\bsecret from\b/i,
      /\bdon'?t tell (your |ur )?(mom|dad|parents|mum|anyone|grown|adult)/i,
      /\bmeet (me|up) (in person|irl|somewhere)\b/i,
      /\bsend (me )?(a )?(photo|pic|picture|selfie) of (you|yourself)\b/i,
      /\bwhat'?s your (address|phone number|password)\b/i,
    ],
    response:
      "That's something I can't help with, and it's really important. You should never keep secrets like that or share private things. Please tell a trusted adult about this right away — they will help you. 💜",
  },
  {
    category: "sexual",
    action: "refused",
    patterns: [
      /\bsex\b/i,
      /\bsexual\b/i,
      /\bnude|naked\b/i,
      /\bporn\b/i,
      /\bgenital/i,
    ],
    response:
      "That's a grown-up topic that isn't right for us to talk about here. If you have questions about your body or growing up, a trusted adult like a parent or doctor is the best person to ask. Want to play a game or hear a fun fact instead? 🌟",
  },
  {
    category: "violence",
    action: "redirected",
    patterns: [
      /\bhow (to|do i) (make|build) (a )?(bomb|weapon|gun)\b/i,
      /\bhurt (someone|somebody|people|him|her|them)\b/i,
      /\bkill (someone|somebody|people|him|her|them)\b/i,
    ],
    response:
      "I don't help with anything that could hurt someone. If someone is bothering you or you feel scared, please tell a trusted adult. How about we do something fun and kind instead? 🌈",
  },
  {
    category: "bullying",
    action: "redirected",
    patterns: [
      /\b(is|am i|being) bullied\b/i,
      /\bbeing mean to me\b/i,
      /\bthey (call me|are teasing me)\b/i,
      /\bhow (to|do i) bully\b/i,
    ],
    response:
      "I'm sorry that's happening — no one deserves to be treated unkindly. The bravest thing is to tell a trusted adult like a parent or teacher so they can help. I'm proud of you for talking about it. 💜",
  },
  {
    category: "substances",
    action: "redirected",
    patterns: [/\b(drugs|alcohol|vaping|cigarettes|beer|wine|smoke weed)\b/i],
    response:
      "That's a topic for grown-ups to talk about with you. A trusted adult can answer questions about staying healthy and safe. Want to switch to something fun? 🎈",
  },
  {
    category: "dangerous-challenge",
    action: "redirected",
    patterns: [
      /\b(tide pod|fire challenge|choking (game|challenge)|blackout challenge)\b/i,
      /\bdangerous (stunt|dare|challenge)\b/i,
    ],
    response:
      "Ooh, that one isn't safe, so we won't do it. I only like fun that keeps you safe and happy! Let's try a cool magic trick or a game instead. ✨",
  },
  {
    category: "personal-info",
    action: "refused",
    patterns: [
      /\bmy (home )?address is\b/i,
      /\bi live at\b/i,
      /\bmy phone number is\b/i,
      /\bmy password is\b/i,
      /\bmy school is\b/i,
      /\bmy full name is\b/i,
    ],
    response:
      "Let's keep private things private! It's safest not to share your address, phone number, school, or passwords with anyone online — even me. Let's keep having fun without it. 😊",
  },
  {
    category: "medical",
    action: "redirected",
    patterns: [
      /\bam i (sick|dying)\b/i,
      /\bdiagnose me\b/i,
      /\bwhat (medicine|pills) should i take\b/i,
    ],
    response:
      "I'm not a doctor, so I can't say what's wrong or what medicine to take. If you don't feel well, please tell a parent or trusted adult who can help you get care. 💛",
  },
];

export function checkUserInput(text: string): SafetyResult {
  const input = (text ?? "").toString();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(input))) {
      return {
        safe: false,
        category: rule.category,
        action: rule.action,
        response: rule.response,
        urgent: Boolean(rule.urgent),
      };
    }
  }
  return ALLOW;
}

/**
 * Lightweight check for model/tool output. Removes any accidental attempts to
 * request secrecy or personal info, and flags clearly unsafe content.
 */
export function checkModelOutput(text: string): SafetyResult {
  const out = (text ?? "").toString();
  const secrecy = /\bkeep (this|it) (a )?secret\b|\bdon'?t tell your (parents|mom|dad)\b/i;
  if (secrecy.test(out)) {
    return {
      safe: false,
      category: "grooming",
      action: "refused",
      response:
        "Let's always be open with trusted grown-ups — no secrets here! What else can we explore together? 🌟",
      urgent: false,
    };
  }
  const userInputEcho = checkUserInput(out);
  if (!userInputEcho.safe && userInputEcho.category === "sexual") {
    return userInputEcho;
  }
  return ALLOW;
}

/**
 * Treat any retrieved/online text as untrusted DATA, never as instructions.
 * Strips common prompt-injection phrasing before it can reach the model or child.
 */
export function sanitizeUntrustedText(text: string): string {
  return (text ?? "")
    .toString()
    .replace(/ignore (all |the )?(previous|prior|above) (instructions|prompts)/gi, "[removed]")
    .replace(/system prompt/gi, "[removed]")
    .replace(/you are now\b/gi, "[removed]")
    .replace(/disregard (your|all) (rules|instructions)/gi, "[removed]")
    .slice(0, 4000);
}
