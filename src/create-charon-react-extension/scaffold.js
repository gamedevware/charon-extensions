'use strict';
const fs = require('fs');
const path = require('path');

function validateName(name) {
  if (!name || name.length === 0) return 'Name cannot be empty.';
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/.test(name)) {
    return 'Name must start with a lowercase letter, contain only lowercase letters, digits, and hyphens, and cannot end with a hyphen.';
  }
  return null;
}

function deriveNames(packageName) {
  const words = packageName.split('-');
  const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return {
    packageName,
    elementName:   `ext-${packageName}-editor`,
    className:     `${pascal}Element`,
    componentName: pascal,
    editorId:      `ext-${packageName}`,
    editorName:    words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  };
}

function substitute(content, vars) {
  return Object.entries(vars).reduce(
    (str, [key, value]) => str.replaceAll(key, value),
    content
  );
}

function scaffoldProject(packageName, targetDir, templateDir) {
  const names = deriveNames(packageName);
  const vars = {
    '__PACKAGE_NAME__':   names.packageName,
    '__ELEMENT_NAME__':   names.elementName,
    '__CLASS_NAME__':     names.className,
    '__COMPONENT_NAME__': names.componentName,
    '__EDITOR_ID__':      names.editorId,
    '__EDITOR_NAME__':    names.editorName,
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
      fs.writeFileSync(destPath, substitute(fs.readFileSync(srcPath, 'utf8'), vars), 'utf8');
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { validateName, deriveNames, substitute, scaffoldProject };
