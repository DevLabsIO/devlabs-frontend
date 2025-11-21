export function preprocessSearch(searchTerm: string): string {
  if (!searchTerm) return "";

  let processed = searchTerm.trim();

  processed = processed.replace(/\s+/g, " ");

  if (processed.length < 1) return "";

  processed = processed.replace(/[<>]/g, "");

  return processed;
}
