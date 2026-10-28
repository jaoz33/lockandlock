export function execCmd(command, value = null) {
  document.execCommand(command, false, value);
}

export function formatBlock(tag) {
  document.execCommand('formatBlock', false, tag);
}

export function insertPlaceholder(name) {
  const text = '{{' + name + '}}';
  document.execCommand('insertText', false, text);
}

export function insertTable(rows, cols) {
  const html = '<table><tbody>' + Array.from({length: rows}, () => '<tr>' + Array.from({length: cols}, () => '<td><br></td>').join('') + '</tr>').join('') + '</tbody></table><p><br></p>';
  document.execCommand('insertHTML', false, html);
}

export function insertPageBreak() {
  document.execCommand('insertHTML', false, '<div class="page-break" style="break-after:page"></div><p><br></p>');
}
