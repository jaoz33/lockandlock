import { detectPlaceholders, normalize } from '../public/js/editor/placeholders.js';

function assert(condition, message) {
  if (!condition) throw new Error('FAIL: ' + message);
  console.log('PASS: ' + message);
}

assert(detectPlaceholders('Hello {{Name}}').length === 1, 'detect simple placeholder');
assert(detectPlaceholders('{{ name }} and {{Name}}').length === 2, 'detect with spaces and case variation');
assert(normalize('{{  First Name  }}') === 'first name', 'normalize trims and lowercases');
assert(normalize('first_name') === 'first name', 'normalize replaces underscores');
