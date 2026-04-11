export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

export function cleanText(text: string): string {
  // Remove known common ad texts or generic strings if needed, 
  // for now just basic normalization
  return normalizeWhitespace(text);
}
