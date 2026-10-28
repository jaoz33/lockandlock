function mergeRow(templateHtml, row, mapping, placeholders) {
  const container = document.createElement('div');
  container.innerHTML = templateHtml;
  const textNodes = getTextNodes(container);
  for (const ph of placeholders) {
    const col = mapping[ph];
    const value = col ? String(row[col] ?? '') : '';
    replacePlaceholderRuns(textNodes, ph, value);
  }
  return container.innerHTML;
}

function getTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) nodes.push(node);
  return nodes;
}

function replacePlaceholderRuns(textNodes, placeholder, value) {
  const regex = new RegExp('\{\{\s*' + placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\s*\}\}', 'gi');
  for (const node of textNodes) {
    if (!regex.test(node.textContent)) continue;
    node.textContent = node.textContent.replace(regex, value);
  }
}

export { mergeRow };
