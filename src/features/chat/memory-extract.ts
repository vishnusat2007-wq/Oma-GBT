import type { Memory, MemoryCategory } from "@/lib/data/types";

export interface ExtractedMemory {
  key: string;
  value: string;
  category: MemoryCategory;
}

const STOP = /[.!?,]/g;

function clean(v: string): string {
  return v.replace(STOP, "").trim().slice(0, 80);
}

/**
 * Extracts safe, non-sensitive preferences from a child's message. It never
 * captures names, addresses, schools, or other private identifiers.
 */
export function extractMemories(text: string): ExtractedMemory[] {
  const found: ExtractedMemory[] = [];
  const t = text.toLowerCase();

  const favColor = t.match(/favou?rite colou?r is ([a-z ]{2,20})/);
  if (favColor) found.push({ key: "Favorite color", value: clean(favColor[1]), category: "favorite" });

  const favThing = t.match(/favou?rite (animal|food|game|book|movie|show|sport|subject) is ([a-z0-9 ]{2,40})/);
  if (favThing) {
    found.push({
      key: `Favorite ${favThing[1]}`,
      value: clean(favThing[2]),
      category: favThing[1] === "book" || favThing[1] === "movie" || favThing[1] === "show" ? "character" : "favorite",
    });
  }

  const favChar = t.match(/favou?rite character is ([a-z0-9 ]{2,40})/);
  if (favChar) found.push({ key: "Favorite character", value: clean(favChar[1]), category: "character" });

  const likes = t.match(/\bi (?:really )?(?:like|love) ([a-z0-9 ]{2,40})/);
  if (likes) found.push({ key: "Likes", value: clean(likes[1]), category: "hobby" });

  const learning = t.match(/\bi(?:'m| am)? (?:learning|practi[cs]ing|studying) ([a-z0-9 ]{2,40})/);
  if (learning) found.push({ key: "Learning", value: clean(learning[1]), category: "learning" });

  return found.filter((m) => m.value.length >= 2);
}

export function memoryExists(memories: Memory[], candidate: ExtractedMemory): boolean {
  return memories.some(
    (m) => m.key.toLowerCase() === candidate.key.toLowerCase() && m.value.toLowerCase() === candidate.value.toLowerCase(),
  );
}
