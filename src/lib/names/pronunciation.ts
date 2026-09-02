/** Common AI/TTS misspellings → the child's correct display name. */
const NAME_MISSPELLINGS: Record<string, string[]> = {
  jesvitha: [
    "jeevotha",
    "jeeevotha",
    "jevotha",
    "jesvotha",
    "jeshvotha",
    "geevotha",
    "jesveetha",
  ],
};

/**
 * Phonetic spellings for browser text-to-speech. Display text stays unchanged;
 * only the spoken form is substituted.
 */
const SPEECH_PRONUNCIATIONS: Record<string, string> = {
  jesvitha: "Jess-VEE-tha",
};

export interface NameContext {
  /** The child's profile display name (canonical spelling). */
  childName?: string;
  /** Other names that may appear in chat (e.g. family members from memories). */
  extraNames?: string[];
}

/** Fix known wrong spellings of the child's name in AI replies. */
export function fixNameMisspellings(text: string, canonicalName: string): string {
  const key = canonicalName.trim().toLowerCase();
  if (!key) return text;

  const variants = NAME_MISSPELLINGS[key] ?? [];
  let result = text;
  for (const wrong of variants) {
    result = result.replace(new RegExp(`\\b${wrong}\\b`, "gi"), canonicalName);
  }
  return result;
}

function speechFormForName(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  return SPEECH_PRONUNCIATIONS[key] ?? null;
}

/** Replace written names with phonetic forms so TTS reads them correctly. */
export function prepareTextForSpeech(text: string, ctx: NameContext = {}): string {
  const names = new Set<string>();
  if (ctx.childName?.trim()) names.add(ctx.childName.trim());
  for (const n of ctx.extraNames ?? []) {
    if (n.trim()) names.add(n.trim());
  }

  let result = text;
  for (const name of names) {
    const spoken = speechFormForName(name);
    if (!spoken) continue;
    result = result.replace(new RegExp(escapeRegExp(name), "gi"), spoken);
  }
  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
