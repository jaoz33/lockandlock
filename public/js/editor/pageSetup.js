export const PAGE_SIZES = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
  legal: { width: 8.5, height: 14 }
};

export function applyPageSetup(setup) {
  const editor = document.getElementById('editor');
  if (!editor) return;
  const size = PAGE_SIZES[setup.size] || PAGE_SIZES.letter;
  const width = setup.orientation === 'landscape' ? size.height : size.width;
  const height = setup.orientation === 'landscape' ? size.width : size.height;
  editor.style.width = width + 'in';
  editor.style.minHeight = height + 'in';
  editor.style.padding = (setup.margins?.top ?? 1) + 'in ' + (setup.margins?.right ?? 1) + 'in ' + (setup.margins?.bottom ?? 1) + 'in ' + (setup.margins?.left ?? 1) + 'in';
}
