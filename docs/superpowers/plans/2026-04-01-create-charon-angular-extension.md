# create-charon-angular-extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `create-charon-angular-extension` npm initializer that scaffolds a ready-to-develop Angular 19 + Angular Elements extension skeleton for the Charon game data editor.

**Architecture:** A zero-dependency Node.js CLI package at `src/create-charon-angular-extension/` that accepts an extension name, derives all identifiers from it, and copies a stripped-down `charon-color-picker` template with placeholder substitution. Template dotfiles are stored with a `dot.` prefix to survive npm publish and renamed during scaffolding.

**Tech Stack:** Node.js ≥ 18 (built-ins only: `fs`, `path`, `readline`, `os`, `node:test`), Angular 19 + Angular Elements in template, `charon-extensions` 2.363.426 in template.

---

## File Map

**CLI package — `src/create-charon-angular-extension/`:**
- Create: `package.json` — CLI metadata, `bin` entry, `engines`, `files`
- Create: `scaffold.js` — `validateName`, `deriveNames`, `substitute`, `scaffoldProject`
- Create: `scaffold.test.js` — unit tests for all four functions above
- Create: `index.js` — CLI entry: parse arg / prompt, validate, call scaffold, print result

**Template config files — `src/create-charon-angular-extension/template/`:**
- Create: `package.json.tpl` — extension package.json with all `__PLACEHOLDERS__`
- Create: `angular.json.tpl` — Angular CLI config with project name placeholder
- Create: `tsconfig.json` — verbatim copy from `charon-color-picker`
- Create: `tsconfig.app.json` — verbatim copy
- Create: `tsconfig.spec.json` — verbatim copy
- Create: `dot.browserslistrc` — verbatim copy (renamed to `.browserslistrc` by scaffold)
- Create: `dot.editorconfig` — verbatim copy (renamed to `.editorconfig` by scaffold)
- Create: `dot.gitignore` — standard Angular gitignore (renamed to `.gitignore` by scaffold)

**Template source files — `src/create-charon-angular-extension/template/src/`:**
- Create: `index.html.tpl` — HTML shell with `__EDITOR_NAME__` in title
- Create: `main.ts` — verbatim copy from `charon-color-picker`
- Create: `polyfills.ts` — imports `@webcomponents/custom-elements` polyfill
- Create: `styles.scss` — imports editor component stylesheet
- Create: `app/app.module.ts.tpl` — zoneless module, ngDoBootstrap with `__CLASS_NAME__` / `__ELEMENT_NAME__`
- Create: `app/editor/editor.component.ts.tpl` — skeleton `CharonPropertyEditorElement` component
- Create: `app/editor/editor.component.html.tpl` — minimal placeholder template (output: `editor.component.html`)
- Create: `app/editor/editor.component.scss` — host flex styles
- Create: `app/editor/editor.module.ts.tpl` — NgModule declaring the editor component

**Docs:**
- Create: `template/README.md.tpl` — getting started, build, debug paths, versioning note

---

## Task 1: CLI package.json

**Files:**
- Create: `src/create-charon-angular-extension/package.json`

- [ ] **Step 1: Create the package.json**

```json
{
  "name": "create-charon-angular-extension",
  "version": "1.0.0",
  "description": "Scaffold a Charon Angular extension project",
  "bin": {
    "create-charon-angular-extension": "./index.js"
  },
  "engines": {
    "node": ">=18"
  },
  "files": [
    "index.js",
    "scaffold.js",
    "template/"
  ],
  "scripts": {
    "test": "node --test scaffold.test.js"
  },
  "license": "MIT"
}
```

Save to `src/create-charon-angular-extension/package.json`.

- [ ] **Step 2: Commit**

```bash
git add src/create-charon-angular-extension/package.json
git commit -m "feat: add create-charon-angular-extension CLI package"
```

---

## Task 2: scaffold.js — name validation and derivation (TDD)

**Files:**
- Create: `src/create-charon-angular-extension/scaffold.js`
- Create: `src/create-charon-angular-extension/scaffold.test.js`

- [ ] **Step 1: Write failing tests for `validateName` and `deriveNames`**

Create `src/create-charon-angular-extension/scaffold.test.js`:

```javascript
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateName, deriveNames } = require('./scaffold.js');

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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd src/create-charon-angular-extension
node --test scaffold.test.js
```

Expected: FAIL with `Cannot find module './scaffold.js'`

- [ ] **Step 3: Implement `validateName` and `deriveNames` in scaffold.js**

Create `src/create-charon-angular-extension/scaffold.js`:

```javascript
'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Validate an npm package name.
 * Returns null if valid, or an error string if not.
 */
function validateName(name) {
  if (!name || name.length === 0) return 'Name cannot be empty.';
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name)) {
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

module.exports = { validateName, deriveNames };
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
node --test scaffold.test.js
```

Expected: all 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/create-charon-angular-extension/scaffold.js src/create-charon-angular-extension/scaffold.test.js
git commit -m "feat: add validateName and deriveNames to scaffold.js"
```

---

## Task 3: scaffold.js — placeholder substitution and file copy (TDD)

**Files:**
- Modify: `src/create-charon-angular-extension/scaffold.js`
- Modify: `src/create-charon-angular-extension/scaffold.test.js`

- [ ] **Step 1: Add failing tests for `substitute` and `scaffoldProject`**

Append to `src/create-charon-angular-extension/scaffold.test.js`:

```javascript
const os = require('os');
const { substitute, scaffoldProject } = require('./scaffold.js');

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
  // Arrange: temp template dir with one verbatim and one .tpl file
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
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
node --test scaffold.test.js
```

Expected: new 4 tests FAIL with `substitute is not a function` or similar

- [ ] **Step 3: Implement `substitute` and `scaffoldProject`**

Replace `module.exports = ...` at the bottom of `scaffold.js` and add the two functions:

```javascript
/**
 * Replace all __PLACEHOLDER__ tokens in a string.
 * @param {string} content
 * @param {Record<string,string>} vars
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
 * @param {string} packageName
 * @param {string} targetDir  Absolute path to output directory (must already exist)
 * @param {string} templateDir  Absolute path to template directory
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

    // Determine output filename
    let outName = entry.name;
    const isTpl = outName.endsWith('.tpl');
    if (isTpl) outName = outName.slice(0, -4); // strip .tpl
    if (outName.startsWith('dot.')) outName = '.' + outName.slice(4); // dot. → .

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
```

- [ ] **Step 4: Run all tests — verify they pass**

```bash
node --test scaffold.test.js
```

Expected: all 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/create-charon-angular-extension/scaffold.js src/create-charon-angular-extension/scaffold.test.js
git commit -m "feat: add substitute and scaffoldProject to scaffold.js"
```

---

## Task 4: index.js — CLI entry point

**Files:**
- Create: `src/create-charon-angular-extension/index.js`

- [ ] **Step 1: Create index.js**

```javascript
#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { validateName, scaffoldProject } = require('./scaffold.js');

const TEMPLATE_DIR = path.join(__dirname, 'template');

async function promptName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Extension name (e.g. my-color-picker): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  let name = process.argv[2]?.trim() ?? '';

  if (!name) {
    name = await promptName();
  }

  const error = validateName(name);
  if (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), name);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory "${name}" already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  try {
    scaffoldProject(name, targetDir, TEMPLATE_DIR);
  } catch (err) {
    // Clean up partial output on error
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.error(`Error during scaffolding: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n✓ Created ${name}/\n`);
  console.log('Next steps:');
  console.log(`  cd ${name}`);
  console.log('  npm install');
  console.log('  npm start');
}

main();
```

- [ ] **Step 2: Make the file executable (Unix)**

```bash
chmod +x src/create-charon-angular-extension/index.js
```

(Windows: no action needed — npm handles this via `bin` entry.)

- [ ] **Step 3: Commit**

```bash
git add src/create-charon-angular-extension/index.js
git commit -m "feat: add index.js CLI entry point"
```

---

## Task 5: Template — verbatim config files

**Files:**
- Create: `src/create-charon-angular-extension/template/tsconfig.json`
- Create: `src/create-charon-angular-extension/template/tsconfig.app.json`
- Create: `src/create-charon-angular-extension/template/tsconfig.spec.json`
- Create: `src/create-charon-angular-extension/template/dot.browserslistrc`
- Create: `src/create-charon-angular-extension/template/dot.editorconfig`
- Create: `src/create-charon-angular-extension/template/dot.gitignore`

- [ ] **Step 1: Create tsconfig.json**

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "useDefineForClassFields": false,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Save to `src/create-charon-angular-extension/template/tsconfig.json`.

- [ ] **Step 2: Create tsconfig.app.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}
```

Save to `src/create-charon-angular-extension/template/tsconfig.app.json`.

- [ ] **Step 3: Create tsconfig.spec.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

Save to `src/create-charon-angular-extension/template/tsconfig.spec.json`.

- [ ] **Step 4: Create dot.browserslistrc**

```
chrome >= 93
last 2 versions
not dead
> 0.5%
```

Save to `src/create-charon-angular-extension/template/dot.browserslistrc`.

- [ ] **Step 5: Create dot.editorconfig**

```ini
# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
quote_type = single
ij_typescript_use_double_quotes = false

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```

Save to `src/create-charon-angular-extension/template/dot.editorconfig`.

- [ ] **Step 6: Create dot.gitignore**

```
# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Angular
/.angular/cache
.sass-cache/
/coverage

# System
.DS_Store
Thumbs.db
```

Save to `src/create-charon-angular-extension/template/dot.gitignore`.

- [ ] **Step 7: Commit**

```bash
git add src/create-charon-angular-extension/template/tsconfig.json \
        src/create-charon-angular-extension/template/tsconfig.app.json \
        src/create-charon-angular-extension/template/tsconfig.spec.json \
        src/create-charon-angular-extension/template/dot.browserslistrc \
        src/create-charon-angular-extension/template/dot.editorconfig \
        src/create-charon-angular-extension/template/dot.gitignore
git commit -m "feat: add template verbatim config files"
```

---

## Task 6: Template — angular.json.tpl

**Files:**
- Create: `src/create-charon-angular-extension/template/angular.json.tpl`

- [ ] **Step 1: Create angular.json.tpl**

This is the `charon-color-picker` `angular.json` with `charon-color-picker` replaced by `__PACKAGE_NAME__`, styles changed from `.sass` to `.scss`, and `inlineStyleLanguage` updated:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "__PACKAGE_NAME__": {
      "projectType": "library",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "standalone": false
        },
        "@schematics/angular:directive": {
          "standalone": false
        },
        "@schematics/angular:pipe": {
          "standalone": false
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": [
              "src/polyfills.ts"
            ],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "5MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "4kB",
                  "maximumError": "8kB"
                }
              ],
              "outputHashing": "none",
              "optimization": true
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "__PACKAGE_NAME__:build:production"
            },
            "development": {
              "buildTarget": "__PACKAGE_NAME__:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": [],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    }
  }
}
```

Save to `src/create-charon-angular-extension/template/angular.json.tpl`.

- [ ] **Step 2: Commit**

```bash
git add src/create-charon-angular-extension/template/angular.json.tpl
git commit -m "feat: add angular.json.tpl to template"
```

---

## Task 7: Template — package.json.tpl

**Files:**
- Create: `src/create-charon-angular-extension/template/package.json.tpl`

- [ ] **Step 1: Create package.json.tpl**

```json
{
  "$schema": "https://raw.githubusercontent.com/gamedevware/charon-extensions/refs/heads/main/package.json.schema.json",
  "name": "__PACKAGE_NAME__",
  "version": "1.0.0",
  "description": "__EDITOR_NAME__ editor extension for Charon",
  "keywords": [
    "charon",
    "extensions"
  ],
  "author": "",
  "license": "MIT",
  "config": {
    "customEditors": [
      {
        "id": "__EDITOR_ID__",
        "selector": "__ELEMENT_NAME__",
        "name": "__EDITOR_NAME__",
        "type": [
          "Property",
          "Grid"
        ],
        "dataTypes": [
          "Text"
        ]
      }
    ]
  },
  "main": "main.js",
  "files": [
    "styles.css"
  ],
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build && copy package.json dist\\browser\\package.json && cd dist\\browser && npm pack",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.2.5",
    "@angular/cli": "^19.2.5",
    "@angular/compiler-cli": "^19.2.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.7.2"
  },
  "dependencies": {
    "@angular/common": "^19.2.0",
    "@angular/compiler": "^19.2.0",
    "@angular/core": "^19.2.0",
    "@angular/elements": "^19.2.4",
    "@angular/forms": "^19.2.0",
    "@angular/platform-browser": "^19.2.0",
    "@angular/platform-browser-dynamic": "^19.2.0",
    "@webcomponents/custom-elements": "^1.6.0",
    "charon-extensions": "2.363.426",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  }
}
```

Save to `src/create-charon-angular-extension/template/package.json.tpl`.

- [ ] **Step 2: Commit**

```bash
git add src/create-charon-angular-extension/template/package.json.tpl
git commit -m "feat: add package.json.tpl to template"
```

---

## Task 8: Template — src/ base files

**Files:**
- Create: `src/create-charon-angular-extension/template/src/index.html.tpl`
- Create: `src/create-charon-angular-extension/template/src/main.ts`
- Create: `src/create-charon-angular-extension/template/src/polyfills.ts`
- Create: `src/create-charon-angular-extension/template/src/styles.scss`

- [ ] **Step 1: Create src/index.html.tpl**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>__EDITOR_NAME__</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <!-- Custom element is registered via ngDoBootstrap in app.module.ts.
       Add your element here for local dev testing: -->
  <!-- <__ELEMENT_NAME__></__ELEMENT_NAME__> -->
</body>
</html>
```

Save to `src/create-charon-angular-extension/template/src/index.html.tpl`.

- [ ] **Step 2: Create src/main.ts** (verbatim from charon-color-picker)

```typescript
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
```

Save to `src/create-charon-angular-extension/template/src/main.ts`.

- [ ] **Step 3: Create src/polyfills.ts**

```typescript
import '@webcomponents/custom-elements/custom-elements.min.js';
```

Save to `src/create-charon-angular-extension/template/src/polyfills.ts`.

- [ ] **Step 4: Create src/styles.scss**

```scss
@import './app/editor/editor.component';
```

Save to `src/create-charon-angular-extension/template/src/styles.scss`.

- [ ] **Step 5: Commit**

```bash
git add src/create-charon-angular-extension/template/src/
git commit -m "feat: add template src/ base files (index.html, main.ts, polyfills.ts, styles.scss)"
```

---

## Task 9: Template — Angular app files

**Files:**
- Create: `src/create-charon-angular-extension/template/src/app/app.module.ts.tpl`
- Create: `src/create-charon-angular-extension/template/src/app/editor/editor.module.ts.tpl`
- Create: `src/create-charon-angular-extension/template/src/app/editor/editor.component.ts.tpl`
- Create: `src/create-charon-angular-extension/template/src/app/editor/editor.component.html.tpl`
- Create: `src/create-charon-angular-extension/template/src/app/editor/editor.component.scss`

- [ ] **Step 1: Create app/app.module.ts.tpl**

```typescript
import { Injector, NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { __CLASS_NAME__ } from './editor/editor.component';
import { EditorModule } from './editor/editor.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    EditorModule,
  ],
  // Disable zone.js to avoid conflicts with Charon's zone
  providers: [provideExperimentalZonelessChangeDetection()],
  // No bootstrap component — custom element registered in ngDoBootstrap
  bootstrap: []
})
export class AppModule {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap() {
    const ngElement = createCustomElement(__CLASS_NAME__, { injector: this.injector });
    // IMPORTANT: Do NOT use the Angular component's selector here.
    // The custom element tag and the component selector must be different.
    customElements.define('__ELEMENT_NAME__', ngElement);
  }
}
```

Save to `src/create-charon-angular-extension/template/src/app/app.module.ts.tpl`.

- [ ] **Step 2: Create app/editor/editor.module.ts.tpl**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { __CLASS_NAME__ } from './editor.component';

@NgModule({
  declarations: [__CLASS_NAME__],
  imports: [BrowserModule],
  exports: [__CLASS_NAME__],
})
export class EditorModule {}
```

Save to `src/create-charon-angular-extension/template/src/app/editor/editor.module.ts.tpl`.

- [ ] **Step 3: Create app/editor/editor.component.ts.tpl**

```typescript
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import { CharonPropertyEditorElement, ValueControl } from 'charon-extensions';
import { Subscription } from 'rxjs';

@Component({
  // IMPORTANT: This selector must be different from the custom element tag name ('__ELEMENT_NAME__').
  // Using the same name causes double-initialization bugs.
  selector: 'ext-__PACKAGE_NAME__',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  standalone: false,
  // OnPush required for performance — Charon manages change detection externally
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': '__ELEMENT_NAME__'
  }
})
export class __CLASS_NAME__ implements CharonPropertyEditorElement, OnDestroy {
  private _valueControl!: ValueControl<any>;
  private _subscription: Subscription | undefined;

  public get readOnly(): boolean { return this._valueControl?.readOnly ?? false; }
  public get disabled(): boolean { return this._valueControl?.disabled ?? false; }
  public get required(): boolean { return this._valueControl?.required ?? false; }

  @Input()
  public get valueControl(): ValueControl<any> {
    return this._valueControl;
  }
  public set valueControl(value: ValueControl<any>) {
    if (Object.is(this._valueControl, value)) {
      return;
    }
    this._valueControl = value;
    this.onValueControlChanged();
  }

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
    delete this._subscription;
  }

  /**
   * Called when Charon assigns a new valueControl.
   * Set up subscriptions to value/status changes here.
   */
  private onValueControlChanged(): void {
    this._subscription?.unsubscribe();
    this._subscription = new Subscription();

    // TODO: Subscribe to value changes. Example:
    // this._subscription.add(
    //   from(this._valueControl.valueChanges).subscribe(value => {
    //     // Update local state from valueControl
    //     this.changeDetector.detectChanges();
    //   })
    // );
    //
    // TODO: Subscribe to status changes. Example:
    // this._subscription.add(
    //   from(this._valueControl.statusChanges).subscribe(() => {
    //     this.changeDetector.detectChanges();
    //   })
    // );
    //
    // TODO: Register focus handler. Example:
    // this._subscription.add(
    //   this._valueControl.registerDoFocus((options?: FocusOptions) => {
    //     this.inputEl?.nativeElement?.focus(options);
    //   })
    // );

    this.changeDetector.detectChanges();
  }
}
```

Save to `src/create-charon-angular-extension/template/src/app/editor/editor.component.ts.tpl`.

- [ ] **Step 4: Create app/editor/editor.component.html.tpl**

The `.tpl` suffix ensures the scaffold substitutes `__EDITOR_NAME__`; output filename will be `editor.component.html`.

```html
<!-- Replace this placeholder with your actual editor UI -->
<p class="placeholder-label">__EDITOR_NAME__</p>
<input
  class="placeholder-input"
  [value]="valueControl?.value ?? ''"
  [disabled]="disabled"
  [readOnly]="readOnly"
  [required]="required"
/>
```

Save to `src/create-charon-angular-extension/template/src/app/editor/editor.component.html.tpl`.

- [ ] **Step 5: Create app/editor/editor.component.scss**

```scss
/* Include this file in src/styles.scss: @import './app/editor/editor.component'; */

:host {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 4px;
  gap: 4px;
}

.placeholder-label {
  font-size: 0.75rem;
  color: var(--mat-card-subtitle-text-color, #888);
  margin: 0;
}

.placeholder-input {
  flex: 1;
  border: 1px solid var(--mat-card-subtitle-text-color, #ccc);
  padding: 2px 4px;
  outline: none;
}
```

Save to `src/create-charon-angular-extension/template/src/app/editor/editor.component.scss`.

- [ ] **Step 6: Commit**

```bash
git add src/create-charon-angular-extension/template/src/app/
git commit -m "feat: add Angular app template files (module, component)"
```

---

## Task 10: Template — README.md.tpl

**Files:**
- Create: `src/create-charon-angular-extension/template/README.md.tpl`

- [ ] **Step 1: Create README.md.tpl**

```markdown
# __EDITOR_NAME__

A custom property editor extension for [Charon](https://github.com/gamedevware/charon) built with Angular 19 and Angular Elements.

## Getting Started

```bash
npm install
npm start       # ng serve — launches dev server at http://localhost:4200
```

## Building

```bash
npm run build
```

Produces `dist/browser/main.js` and a packed `__PACKAGE_NAME__-1.0.0.tgz`.

> **Tip for debugging:** Set `"optimization": false` in `angular.json` under `configurations.production`
> to get readable source maps. Remember to re-enable it before publishing.

## Testing in Charon (without publishing to npm)

Place the `.tgz` file from `dist/browser/` in the Charon extensions folder for your platform:

| Platform       | Path |
|----------------|------|
| Windows        | `%PROGRAMDATA%\Charon\extensions\` |
| macOS          | `/Users/<username>/.config/Charon/extensions/` |
| Linux          | `/home/<username>/.config/Charon/extensions/` |
| Unity          | `<project-directory>/Library/Charon/extensions/` |
| Unreal Engine  | `<project-directory>/Intermediate/Charon/extensions/` |

> **Important:** Always increment the `version` field in `package.json` between builds.
> Charon uses the version to detect updates — if the version stays the same, the extension will not be reloaded.

## Publishing

1. Increment `version` in `package.json`
2. Run `npm run build`
3. `cd dist/browser && npm publish`
4. Add the package name to `Project Settings → Extensions` in Charon

## Customising the Editor

1. Replace `src/app/editor/editor.component.html` with your UI
2. Subscribe to `valueControl.valueChanges` in `onValueControlChanged()` to react to Charon data changes
3. Call `this.valueControl.setValue(newValue)` to write values back to Charon
4. Update `config.customEditors[0].dataTypes` in `package.json` to match your target field types

## References

- [Charon Extension Guide (Angular)](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [charon-extensions API](https://www.npmjs.com/package/charon-extensions)
- [Angular Elements Guide](https://angular.dev/guide/elements)
```

Save to `src/create-charon-angular-extension/template/README.md.tpl`.

- [ ] **Step 2: Commit**

```bash
git add src/create-charon-angular-extension/template/README.md.tpl
git commit -m "feat: add README.md.tpl to template"
```

---

## Task 11: Smoke Test

Verify the scaffolder produces a buildable Angular project.

- [ ] **Step 1: Run unit tests one final time**

```bash
cd src/create-charon-angular-extension
node --test scaffold.test.js
```

Expected: all 11 tests PASS

- [ ] **Step 2: Scaffold a test project**

```bash
cd /tmp        # or any temp location outside the repo
node d:/dev/projects/charon-extensions/src/create-charon-angular-extension/index.js my-test-editor
```

Expected output:
```
✓ Created my-test-editor/

Next steps:
  cd my-test-editor
  npm install
  npm start
```

- [ ] **Step 3: Verify no placeholder tokens remain**

```bash
cd /tmp/my-test-editor
grep -r "__PACKAGE_NAME__\|__ELEMENT_NAME__\|__CLASS_NAME__\|__EDITOR_ID__\|__EDITOR_NAME__" --include="*.ts" --include="*.json" --include="*.html" --include="*.md" .
```

Expected: no output (all placeholders substituted)

- [ ] **Step 4: Verify key file contents**

```bash
# package.json has correct name
node -e "const p = require('./package.json'); console.log(p.name, p.config.customEditors[0].selector)"
```

Expected: `my-test-editor  ext-my-test-editor-editor`

```bash
# angular.json references correct project name
grep "my-test-editor" angular.json
```

Expected: 3 occurrences (project key + 2 buildTarget references)

```bash
# dotfiles exist
ls -la | grep "^\."
```

Expected: `.browserslistrc`, `.editorconfig`, `.gitignore` visible

- [ ] **Step 5: Install and build**

```bash
npm install
npm run build
```

Expected: build succeeds, `dist/browser/main.js` and `dist/browser/*.tgz` exist

- [ ] **Step 6: Final commit**

```bash
cd d:/dev/projects/charon-extensions
git add src/create-charon-angular-extension/
git commit -m "feat: complete create-charon-angular-extension scaffolder with full Angular template"
```
