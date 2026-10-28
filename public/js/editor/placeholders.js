export function detectPlaceholders(html) {
  const matches = new Set();
  const regex = /\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.add(m[1].trim().toLowerCase().replace(/\s+/g, ' '));
  }
  return Array.from(matches);
}

export function normalize(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/_/g, ' ');
}
