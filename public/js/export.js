export async function exportDocx(html, filename) {
  const { default: docx } = await import('https://cdn.jsdelivr.net/npm/docx@9.1.1/build/index.umd.min.js');
  const doc = new docx.Document({
    sections: [{ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: html, break: 1 })] })] }]
  });
  const blob = await docx.Packer.toBlob(doc);
  downloadBlob(blob, filename + '.docx');
}

export async function exportPdf(html, filename) {
  const win = window.open('', '_blank');
  win.document.write('<html><head><title>' + filename + '</title><style>body{font-family:sans-serif;padding:40px}</style></head><body>' + html + '</body></html>');
  win.document.close();
  await new Promise(r => setTimeout(r, 500));
  win.print();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadZip(files, zipName) {
  const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  const zip = new JSZip();
  for (const [name, blob] of Object.entries(files)) zip.file(name, blob);
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipName + '.zip');
}
