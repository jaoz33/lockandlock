import * as XLSX from 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

export function parseSheet(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        resolve(rows);
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function previewRows(rows, max = 5) {
  return rows.slice(0, max);
}

export function autoMap(placeholders, headers) {
  const map = {};
  const used = new Set();
  for (const ph of placeholders) {
    const normalized = ph.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
    let best = null;
    for (const h of headers) {
      const hn = h.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
      if (hn === normalized && !used.has(h)) { best = h; break; }
    }
    if (best) { map[ph] = best; used.add(best); }
  }
  return map;
}
