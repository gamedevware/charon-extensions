'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateName, deriveNames } = require('./scaffold.js');

test('validateName: accepts valid lowercase-hyphen names', () => {
  assert.equal(validateName('my-extension'), null);
  assert.equal(validateName('foo'), null);
  assert.equal(validateName('my-ext-2'), null);
});

test('validateName: rejects empty string', () => {
  assert.notEqual(validateName(''), null);
});

test('validateName: rejects uppercase letters', () => {
  assert.notEqual(validateName('MyExtension'), null);
});

test('validateName: rejects spaces', () => {
  assert.notEqual(validateName('my extension'), null);
});

test('validateName: rejects leading/trailing hyphens', () => {
  assert.notEqual(validateName('-foo'), null);
  assert.notEqual(validateName('foo-'), null);
});

test('validateName: rejects names starting with a digit', () => {
  assert.notEqual(validateName('123'), null);
  assert.notEqual(validateName('1ext'), null);
});

test('deriveNames: derives all 6 identifiers from my-extension', () => {
  const n = deriveNames('my-extension');
  assert.equal(n.packageName,   'my-extension');
  assert.equal(n.elementName,   'ext-my-extension-editor');
  assert.equal(n.className,     'MyExtensionElement');
  assert.equal(n.componentName, 'MyExtension');
  assert.equal(n.editorId,      'ext-my-extension');
  assert.equal(n.editorName,    'My Extension');
});

test('deriveNames: works for single-word name', () => {
  const n = deriveNames('tooltip');
  assert.equal(n.elementName,   'ext-tooltip-editor');
  assert.equal(n.className,     'TooltipElement');
  assert.equal(n.componentName, 'Tooltip');
  assert.equal(n.editorId,      'ext-tooltip');
  assert.equal(n.editorName,    'Tooltip');
});

test('deriveNames: works for three-word name', () => {
  const n = deriveNames('color-picker-hex');
  assert.equal(n.className,     'ColorPickerHexElement');
  assert.equal(n.componentName, 'ColorPickerHex');
  assert.equal(n.editorName,    'Color Picker Hex');
});

const fs = require('fs');
const path = require('path');
const os = require('os');
const { substitute, scaffoldProject } = require('./scaffold.js');

test('substitute: replaces all placeholder tokens', () => {
  const vars = { '__NAME__': 'World', '__LANG__': 'JS' };
  assert.equal(substitute('Hello __NAME__ from __LANG__!', vars), 'Hello World from JS!');
});

test('substitute: replaces multiple occurrences', () => {
  assert.equal(substitute('__X__ and __X__', { '__X__': 'Y' }), 'Y and Y');
});

test('substitute: unchanged when no tokens match', () => {
  assert.equal(substitute('hello world', {}), 'hello world');
});

test('scaffoldProject: verbatim copy, .tpl substitution, dot. rename', () => {
  const templateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tpl-'));
  fs.writeFileSync(path.join(templateDir, 'config.json'), '{"ok":true}');
  fs.writeFileSync(path.join(templateDir, 'readme.md.tpl'), 'Pkg: __PACKAGE_NAME__');
  fs.writeFileSync(path.join(templateDir, 'dot.gitignore'), 'node_modules/');

  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'out-'));
  scaffoldProject('my-ext', outDir, templateDir);

  assert.equal(fs.readFileSync(path.join(outDir, 'config.json'), 'utf8'), '{"ok":true}');
  assert.equal(fs.readFileSync(path.join(outDir, 'readme.md'), 'utf8'), 'Pkg: my-ext');
  assert.ok(fs.existsSync(path.join(outDir, '.gitignore')));
  assert.ok(!fs.existsSync(path.join(outDir, 'dot.gitignore')));
});
