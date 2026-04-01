# Design: create-charon-angular-extension

**Date:** 2026-04-01
**Status:** Approved

## Context

The `charon-color-picker` package is the Angular example extension in this repo. External developers who want to build Angular-based Charon extensions currently have no starting point — they must manually strip `charon-color-picker` down to a skeleton and rename everything.

This spec describes a `create-charon-angular-extension` npm initializer that scaffolds a ready-to-develop Angular extension skeleton, named after the user's input, in seconds.

A React equivalent (`create-charon-react-extension`) is out of scope for this spec but the naming convention leaves room for it.

---

## Package Location & Identity

- **Directory:** `src/create-charon-angular-extension/`
- **npm name:** `create-charon-angular-extension`
- **Invoked via:**
  ```bash
  npm create charon-angular-extension my-color-picker
  npx create-charon-angular-extension my-color-picker
  ```
- **No runtime npm dependencies** — pure Node.js (`fs`, `path`, `readline`)
- **`package.json` `bin` field:** `{ "create-charon-angular-extension": "./index.js" }`
- **Node.js engine requirement:** `>=18` (uses `fs.cpSync`, `fs.mkdirSync` with `recursive`)
- **`charon-extensions` version in template:** pin to the same version as `charon-color-picker` at time of authoring (currently `2.363.426`); update when cutting new releases. Note: the official guide contains a typo (`charon-extension` without `s`) — the correct npm package name is `charon-extensions`.

---

## CLI Behavior

### Input
1. If a positional argument is provided (`npm create charon-angular-extension <name>`), use it directly.
2. Otherwise, prompt interactively: `Extension name (e.g. my-color-picker):`

### Validation
- Name must be a valid npm package name: lowercase letters, digits, hyphens only. No spaces, no uppercase.
- Error and exit if the target directory `<cwd>/<name>/` already exists.

### Name Derivations (all automatic, no extra prompts)

| Placeholder        | Derived from `my-color-picker`         |
|--------------------|----------------------------------------|
| `__PACKAGE_NAME__` | `my-color-picker`                      |
| `__ELEMENT_NAME__` | `ext-my-color-picker-editor`           |
| `__CLASS_NAME__`   | `MyColorPickerEditorComponent`         |
| `__EDITOR_ID__`    | `ext-my-color-picker`                  |
| `__EDITOR_NAME__`  | `My Color Picker`                      |

Derivation rules:
- `__ELEMENT_NAME__`: prefix `ext-`, suffix `-editor`
- `__CLASS_NAME__`: split on `-`, PascalCase each word, append `EditorComponent`
- `__EDITOR_ID__`: prefix `ext-`
- `__EDITOR_NAME__`: split on `-`, title-case each word, join with spaces

### Output
- Creates `<cwd>/<name>/` with all scaffolded files
- Prints next steps:
  ```
  ✓ Created my-color-picker/

  Next steps:
    cd my-color-picker
    npm install
    npm start
  ```

---

## Package Structure

```
src/create-charon-angular-extension/
├── package.json          ← bin entry, no runtime deps
├── index.js              ← CLI: parse args, prompt, call scaffold
├── scaffold.js           ← copy template files, substitute placeholders
└── template/
    ├── package.json.tpl
    ├── angular.json.tpl
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.spec.json
    ├── .browserslistrc
    ├── .editorconfig
    ├── .gitignore
    ├── README.md.tpl
    └── src/
        ├── index.html
        ├── main.ts
        ├── polyfills.ts
        ├── styles.scss
        └── app/
            ├── app.module.ts.tpl
            └── editor/
                ├── editor.component.ts.tpl
                ├── editor.component.html
                └── editor.component.scss
```

Files with `.tpl` suffix contain placeholders and are processed at scaffold time. All other files are copied verbatim. The `.tpl` suffix is stripped from output filenames.

---

## Angular Template Contents

### What's included (boilerplate from charon-color-picker)

- **`src/main.ts`** — `platformBrowser().bootstrapModule(AppModule, { ngZoneEventCoalescing: true })`
- **`src/polyfills.ts`** — imports `@webcomponents/custom-elements` polyfill (required per official guide)
- **`src/app/app.module.ts`** — `provideExperimentalZonelessChangeDetection()`, `ngDoBootstrap()` registering the custom element via `createCustomElement`
- **`src/app/editor/editor.component.ts`** — Angular component implementing `CharonPropertyEditorElement`:
  - Selector is `ext-__PACKAGE_NAME__` (intentionally different from the custom element tag `__ELEMENT_NAME__` — these must not be the same, per the official guide)
  - `@Input() valueControl` setter with `onValueControlChanged()` stub
  - `ChangeDetectionStrategy.OnPush`
  - `host: { 'class': '__ELEMENT_NAME__' }`
  - `OnDestroy` cleanup for subscriptions
- **`angular.json`** — build/serve/test targets with required changes per official guide:
  - `"outputHashing": "none"` — output filenames must be stable (e.g. `main.js`, not `main.abc123.js`)
  - `"projectType": "library"` — correct project type for a Web Component package
  - `"optimizations": false` in production configuration — simplifies source maps for debugging
- **`package.json`** — single `customEditors` entry with all placeholders, Angular + charon-extensions + `@webcomponents/custom-elements` dependencies; no `"private": true`; includes `author`, `description`, `license` fields

### What's excluded (charon-color-picker specific)

- `ngx-color-picker` dependency and all color parsing/formatting logic
- `color.functions.ts`
- Multi-variant `customEditors` entries
- `specification` field in the editor config (template registers one generic `Property`/`Grid` editor for `Text` data type)

### `package.json` template (config section)

```json
"config": {
  "customEditors": [{
    "id": "__EDITOR_ID__",
    "selector": "__ELEMENT_NAME__",
    "name": "__EDITOR_NAME__",
    "type": ["Property", "Grid"],
    "dataTypes": ["Text"]
  }]
}
```

---

## Key Angular Patterns to Preserve

These patterns are critical for Charon compatibility and must be present in the template:

1. **Zoneless change detection** — `provideExperimentalZonelessChangeDetection()` in `AppModule` providers. Avoids conflicts with Charon's zone.js.
2. **No bootstrap component** — `bootstrap: []` in `@NgModule`; bootstrapping happens in `ngDoBootstrap()` via Angular Elements.
3. **Custom element via `createCustomElement`** — `customElements.define('__ELEMENT_NAME__', ngElement)` in `ngDoBootstrap()`.
4. **OnPush change detection** — `ChangeDetectionStrategy.OnPush` on the editor component.
5. **`CharonPropertyEditorElement` interface** — component implements it and accepts `valueControl` as an `@Input()`.

---

## Local Debugging (without npm publish)

To test the extension before publishing, place the built `.tgz` file in the Charon extensions folder for your platform:

| Platform | Path |
|---|---|
| Windows | `%PROGRAMDATA%\Charon\extensions\` (`C:\ProgramData\Charon\extensions\`) |
| macOS | `/Users/<username>/.config/Charon/extensions/` |
| Linux | `/home/<username>/.config/Charon/extensions/` |
| Unity | `<project-directory>/Library/Charon/extensions/` |
| Unreal Engine | `<project-directory>/Intermediate/Charon/extensions/` |

**Important:** Always increment the `version` field in `package.json` between builds — Charon uses the version to detect updates. If the version doesn't change, Charon will not reload the extension.

The README generated by the template should include these paths and the versioning reminder.

---

## Verification

After scaffolding `my-color-picker`:
1. `cd my-color-picker && npm install` — installs without errors
2. `npm start` — `ng serve` launches dev server, browser opens with placeholder component
3. `npm run build` — produces `dist/browser/` with `main.js` and a `.tgz` pack file
4. `npm test` — Karma tests pass (skeleton has no test failures)
5. Manually verify placeholder substitution: `grep -r "my-color-picker" src/` finds the right occurrences; `grep -r "__PACKAGE_NAME__"` finds nothing
