export function applyFont(fontFamily) {
  document.execCommand('fontName', false, fontFamily);
}

export function applyFontSize(size) {
  document.execCommand('fontSize', false, size);
}

export function applyColor(command, color) {
  document.execCommand(command, false, color);
}

export function clearFormat() {
  document.execCommand('removeFormat', false, null);
}

export function toggleBold() { document.execCommand('bold'); }
export function toggleItalic() { document.execCommand('italic'); }
export function toggleUnderline() { document.execCommand('underline'); }
export function toggleStrike() { document.execCommand('strikeThrough'); }
export function toggleSub() { document.execCommand('subscript'); }
export function toggleSuper() { document.execCommand('superscript'); }
export function justifyLeft() { document.execCommand('justifyLeft'); }
export function justifyCenter() { document.execCommand('justifyCenter'); }
export function justifyRight() { document.execCommand('justifyRight'); }
export function justifyFull() { document.execCommand('justifyFull'); }
export function insertBullet() { document.execCommand('insertUnorderedList'); }
export function insertNumber() { document.execCommand('insertOrderedList'); }
export function indent() { document.execCommand('indent'); }
export function outdent() { document.execCommand('outdent'); }
