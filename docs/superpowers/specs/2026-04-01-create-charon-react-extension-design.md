# Design: create-charon-react-extension

**Date:** 2026-04-01
**Status:** Approved

## Context

The `charon-logical-toggle` package is the React example extension in this repo. External developers who want to build React-based Charon extensions currently have no starting point — they must manually strip it down to a skeleton and rename everything.

This spec describes a `create-charon-react-extension` npm initializer that scaffolds a ready-to-develop React 18 + Vite extension skeleton. It follows the same pattern as `create-charon-angular-extension` (already implemented) but targets React + Vite.

---

## Package Location & Identity

- **Directory:** `src/create-charon-react-extension/`
- **npm name:** `create-charon-react-extension`
- **Invoked via:**
  ```bash
  npm create charon-react-extension my-extension
  npx create-charon-react-extension my-extension
  ```
- **No runtime npm dependencies** — pure Node.js (`fs`, `path`, `readline`)
- **`package.json` `bin` field:** `{ "create-charon-react-extension": "./index.js" }`
- **Node.js engine requirement:** `>=18`
- **`charon-extensions` version in template:** `2.363.426` (matches `charon-logical-toggle`)
- Note: official guide mentions `charon-extension` (without `s`) — correct package name is `charon-extensions`

---

## CLI Behavior

### Input
1. Positional argument `npm create charon-react-extension <name>` used directly if provided.
2. Otherwise prompt: `Extension name (e.g. my-extension):`

### Validation
- Lowercase letters, digits, hyphens only; no leading/trailing hyphens; must start with a letter.
- Error and exit if target directory `<cwd>/<name>/` already exists.

### Name Derivations (all automatic)

| Placeholder | Derived from `my-extension` | Rule |
|---|---|---|
| `__PACKAGE_NAME__` | `my-extension` | as-is |
| `__ELEMENT_NAME__` | `ext-my-extension-editor` | `ext-` prefix + `-editor` suffix |
| `__CLASS_NAME__` | `MyExtensionElement` | PascalCase + `Element` |
| `__COMPONENT_NAME__` | `MyExtension` | PascalCase only |
| `__EDITOR_ID__` | `ext-my-extension` | `ext-` prefix |
| `__EDITOR_NAME__` | `My Extension` | title-case, space-separated |

### Output
```
✓ Created my-extension/

Next steps:
  cd my-extension
  npm install
  npm run dev
```

---

## Package Structure

```
src/create-charon-react-extension/
├── package.json          ← bin entry, no runtime deps, engines >=18
├── index.js              ← CLI: parse arg / prompt, validate, scaffold, print result
├── scaffold.js           ← validateName, deriveNames, substitute, scaffoldProject
├── scaffold.test.js      ← unit tests (node:test)
└── template/
    ├── package.json.tpl
    ├── vite.config.ts            ← verbatim from charon-logical-toggle
    ├── tsconfig.json             ← verbatim
    ├── tsconfig.app.json         ← verbatim
    ├── eslint.config.js          ← verbatim
    ├── dot.gitignore             ← renamed to .gitignore by scaffold
    ├── index.html.tpl
    ├── README.md.tpl
    └── src/
        ├── main.tsx.tpl
        ├── EditorElement.tsx.tpl
        ├── Editor.tsx.tpl
        ├── index.scss.tpl
        ├── vite-env.d.ts                           ← verbatim
        ├── focus.component.input.function.ts      ← verbatim
        └── reactive/
            ├── index.ts                                ← verbatim
            ├── use.control.value.function.ts           ← verbatim
            ├── use.control.disabled.status.function.ts ← verbatim
            ├── use.control.read.only.status.function.ts← verbatim
            ├── use.debounce.function.ts                ← verbatim
            └── use.observable.function.ts              ← verbatim
```

Files with `.tpl` suffix contain placeholders, processed at scaffold time with suffix stripped. Files starting with `dot.` are renamed to start with `.`.

---

## scaffold.js

Same structure as `create-charon-angular-extension/scaffold.js` with a React-specific `deriveNames`:

```javascript
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
```

Placeholder vars map:
- `__PACKAGE_NAME__` → `packageName`
- `__ELEMENT_NAME__` → `elementName`
- `__CLASS_NAME__` → `className`
- `__COMPONENT_NAME__` → `componentName`
- `__EDITOR_ID__` → `editorId`
- `__EDITOR_NAME__` → `editorName`

---

## Template File Contents

### `package.json.tpl`

Key fields per official guide + working source:
- `"$schema"` — charon-extensions GitHub schema URL
- `"name": "__PACKAGE_NAME__"`
- `"type": "module"` — Vite ESM output
- `"main": "index.js"` — matches Vite `entryFileNames: '[name].js'`
- `"files": ["assets/index.css"]` — matches `assetFileNames: 'assets/[name].[ext]'`
- `config.customEditors` with `__EDITOR_ID__`, `__ELEMENT_NAME__`, `__EDITOR_NAME__`
- `dataTypes: ["Text"]` (generic starter — developer changes to their target type)
- Cross-platform build script:
  ```
  "tsc -b && vite build && node -e \"require('fs').copyFileSync('package.json','dist/package.json')\" && cd dist && npm pack"
  ```
- No `"private": true`; includes `author`, `description`, `license`
- Dependencies: `charon-extensions`, `react`, `react-dom`, `sass`
- Dev dependencies: Vite, TypeScript, ESLint, React types

### `vite.config.ts` (verbatim)

Exact copy from `charon-logical-toggle` — stable output filenames required:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  }
})
```

### `index.html.tpl`

- `<title>__EDITOR_NAME__</title>`
- `<div id="root"></div>` in body (for dev-mode React render)
- Comment explaining custom element is registered in `main.tsx`

### `src/main.tsx.tpl`

- `import './index.scss'`
- `import __CLASS_NAME__ from './EditorElement'`
- `customElements.define('__ELEMENT_NAME__', __CLASS_NAME__)`
- `declare global { namespace JSX { interface IntrinsicElements { '__ELEMENT_NAME__': ... } } }`
- Dev-mode render: `createRoot(document.getElementById('root')!).render(<__ELEMENT_NAME__ />)`

### `src/EditorElement.tsx.tpl`

Web component wrapper — stripped of `react-toggle` specifics:
- `class __CLASS_NAME__ extends HTMLElement implements CharonPropertyEditorElement`
- `connectedCallback`: `this.classList.add('__EDITOR_ID__')`
- `valueControl` getter/setter — setter calls `this.render()`
- `render()`: `createRoot` + `<__COMPONENT_NAME__ valueControl={valueControl} />`
- `disconnectedCallback`: `unmount()`

### `src/Editor.tsx.tpl`

Minimal React component stub:
- Props: `{ valueControl: ValueControl<any> }`
- Uses `useControlValue` and `useControlDisabledStatus` from `./reactive`
- Renders `<input>` with `value`, `disabled`, `onChange` wired to `valueControl`
- Wrapped in `memo()`

### `src/index.scss.tpl`

```scss
.__EDITOR_ID__ {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px;
  gap: 4px;
}

.__EDITOR_ID__ .placeholder-input {
  flex: 1;
  border: 1px solid #ccc;
  padding: 2px 4px;
  outline: none;
}
```

### `reactive/` (all verbatim)

All 6 files copied verbatim from `charon-logical-toggle/src/reactive/`. These hooks form the reusable Charon ↔ React binding layer and need no modifications.

---

## Key React Patterns to Preserve

1. **`"type": "module"`** in `package.json` — Vite builds ESM output
2. **Stable filenames** — `entryFileNames: '[name].js'` in `vite.config.ts`, must match `"main": "index.js"`
3. **`customElements.define` in `main.tsx`** — not inside the component file
4. **`createRoot` per element instance** — created lazily in `render()`, unmounted in `disconnectedCallback`
5. **`memo()`** on the React component — prevents unnecessary re-renders
6. **`useControlValue` / `useControlDisabledStatus`** from `./reactive` — subscribes to Charon's observable stream
7. **`registerDoFocus`** — optional focus handler pattern shown in `LogicalToggle.tsx` as a comment in the stub

---

## Local Debugging (without npm publish)

Place the `.tgz` from `dist/` in the Charon extensions folder:

| Platform | Path |
|---|---|
| Windows | `%PROGRAMDATA%\Charon\extensions\` |
| macOS | `/Users/<username>/.config/Charon/extensions/` |
| Linux | `/home/<username>/.config/Charon/extensions/` |
| Unity | `<project-directory>/Library/Charon/extensions/` |
| Unreal Engine | `<project-directory>/Intermediate/Charon/extensions/` |

**Versioning:** Always increment `version` in `package.json` between builds — Charon uses it to detect updates.

---

## Verification

After scaffolding `my-test-ext`:
1. `npm install` — completes without errors
2. `npm run dev` — Vite dev server starts, browser shows placeholder input
3. `npm run build` — produces `dist/index.js`, `dist/assets/index.css`, `dist/my-test-ext-1.0.0.tgz`
4. No `__PLACEHOLDER__` tokens remain in any output file
5. `jq '.name, .config.customEditors[0].selector' dist/package.json` → `"my-test-ext"` and `"ext-my-test-ext-editor"`
