'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateName, deriveNames, substitute, scaffoldProject } = require('./scaffold.js');

// validateName
test('validateName: accepts valid lowercase-hyphen names', () => {
  assert.equal(validateName('my-color-picker'), null);
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

// deriveNames
test('deriveNames: derives all identifiers from my-color-picker', () => {
  const names = deriveNames('my-color-picker');
  assert.equal(names.packageName, 'my-color-picker');
  assert.equal(names.elementName, 'ext-my-color-picker-editor');
  assert.equal(names.className, 'MyColorPickerEditorComponent');
  assert.equal(names.editorId, 'ext-my-color-picker');
  assert.equal(names.editorName, 'My Color Picker');
});

test('deriveNames: works for single-word name', () => {
  const names = deriveNames('tooltip');
  assert.equal(names.elementName, 'ext-tooltip-editor');
  assert.equal(names.className, 'TooltipEditorComponent');
  assert.equal(names.editorId, 'ext-tooltip');
  assert.equal(names.editorName, 'Tooltip');
});

// substitute
test('substitute: replaces all placeholder tokens', () => {
  const vars = { '__NAME__': 'World', '__LANG__': 'JS' };
  assert.equal(substitute('Hello __NAME__ from __LANG__!', vars), 'Hello World from JS!');
});

test('substitute: replaces multiple occurrences of the same token', () => {
  const vars = { '__X__': 'Y' };
  assert.equal(substitute('__X__ and __X__', vars), 'Y and Y');
});

test('substitute: leaves content unchanged when no tokens match', () => {
  assert.equal(substitute('hello world', {}), 'hello world');
});

// scaffoldProject integration
test('scaffoldProject: copies verbatim file and processes .tpl file', () => {
  const templateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tpl-'));
  fs.writeFileSync(path.join(templateDir, 'config.json'), '{"stable": true}');
  fs.writeFileSync(path.join(templateDir, 'readme.md.tpl'), 'Project: __PACKAGE_NAME__');
  // dotfile rename
  fs.writeFileSync(path.join(templateDir, 'dot.gitignore'), 'node_modules/');

  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'out-'));

  scaffoldProject('my-ext', outDir, templateDir);

  // Verbatim copy
  assert.equal(
    fs.readFileSync(path.join(outDir, 'config.json'), 'utf8'),
    '{"stable": true}'
  );
  // .tpl processed and suffix stripped
  assert.equal(
    fs.readFileSync(path.join(outDir, 'readme.md'), 'utf8'),
    'Project: my-ext'
  );
  // dot. prefix renamed
  assert.ok(fs.existsSync(path.join(outDir, '.gitignore')));
  assert.ok(!fs.existsSync(path.join(outDir, 'dot.gitignore')));
});
