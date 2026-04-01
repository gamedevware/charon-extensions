'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Validate an npm package name.
 * Returns null if valid, or an error string if not.
 */
function validateName(name) {
  if (!name || name.length === 0) return 'Name cannot be empty.';
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/.test(name)) {
    return 'Name must be lowercase letters, digits, and hyphens only, and cannot start or end with a hyphen.';
  }
  return null;
}

/**
 * Derive all template identifiers from the package name.
 */
function deriveNames(packageName) {
  const words = packageName.split('-');
  const titleCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));

  return {
    packageName,
    elementName: `ext-${packageName}-editor`,
    className: titleCase.join('') + 'EditorComponent',
    editorId: `ext-${packageName}`,
    editorName: titleCase.join(' '),
  };
}

/**
 * Replace all __PLACEHOLDER__ tokens in a string.
 */
function substitute(content, vars) {
  return Object.entries(vars).reduce(
    (str, [key, value]) => str.replaceAll(key, value),
    content
  );
}

/**
 * Scaffold a project from templateDir into targetDir.
 * - Files ending in .tpl: process with placeholder substitution, strip .tpl suffix
 * - Files starting with dot.: rename to start with .
 * - All other files: copy verbatim
 */
function scaffoldProject(packageName, targetDir, templateDir) {
  const names = deriveNames(packageName);
  const vars = {
    '__PACKAGE_NAME__': names.packageName,
    '__ELEMENT_NAME__': names.elementName,
    '__CLASS_NAME__':   names.className,
    '__EDITOR_ID__':    names.editorId,
    '__EDITOR_NAME__':  names.editorName,
  };
  copyDir(templateDir, targetDir, vars);
}

function copyDir(srcDir, destDir, vars) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, path.join(destDir, entry.name), vars);
      continue;
    }
    let outName = entry.name;
    const isTpl = outName.endsWith('.tpl');
    if (isTpl) outName = outName.slice(0, -4);
    if (outName.startsWith('dot.')) outName = '.' + outName.slice(4);
    const destPath = path.join(destDir, outName);
    if (isTpl) {
      const content = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, substitute(content, vars), 'utf8');
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { validateName, deriveNames, substitute, scaffoldProject };
