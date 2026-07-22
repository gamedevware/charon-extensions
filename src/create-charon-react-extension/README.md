# create-charon-react-extension

Node CLI that scaffolds a minimal, already-wired **React** [Charon](https://github.com/gamedevware/charon) **Property/Grid** field editor extension — the `charon-logical-toggle` pattern, without the toggle-specific code. No production dependencies; only uses Node's `fs`/`path`/`readline`.

For **Schema** editors (full-document) or **Custom Pages**, there is no scaffolder — copy `../charon-conversation-editor` or `../charon-schema-graph` instead and adapt.

## Usage

```bash
node index.js my-extension        # name as an argument
node index.js                     # or omit it — prompted interactively
```

This creates `./my-extension/` (relative to the current working directory, **not** this package's directory) and prints next steps (`cd my-extension && npm install && npm run dev`).

This package is not published to npm. To use the bare `create-charon-react-extension <name>` command form (instead of `node index.js <name>`), run `npm link` from within this folder.

Name rules (enforced by `validateName` in `scaffold.js`): lowercase letters, digits, and hyphens only; must start with a letter; no leading/trailing/consecutive hyphens (e.g. `my-extension`, `tooltip`, `color-picker-hex`).

## How Scaffolding Works

`index.js` is the CLI shell (arg parsing, prompting, target-directory creation/cleanup). `scaffold.js` is the pure logic, unit-tested by `scaffold.test.js` (`npm test`):

1. `deriveNames(packageName)` derives every identifier the template needs from the one name the user gives, e.g. for `my-extension`:
   | Placeholder | Value | Used for |
   |---|---|---|
   | `__PACKAGE_NAME__` | `my-extension` | npm package name |
   | `__ELEMENT_NAME__` | `ext-my-extension-editor` | custom element tag (`customElements.define`) |
   | `__CLASS_NAME__` | `MyExtensionElement` | the `HTMLElement` subclass |
   | `__COMPONENT_NAME__` | `MyExtension` | the React component |
   | `__EDITOR_ID__` | `ext-my-extension` | `config.customEditors[].id` |
   | `__EDITOR_NAME__` | `My Extension` | display name shown in Charon's UI |
2. `copyDir(templateDir, targetDir, vars)` walks `template/` recursively:
   - `*.tpl` files: read, replace every `__PLACEHOLDER__` token, write without the `.tpl` suffix.
   - `dot.*` files/dirs (e.g. `dot.gitignore`): renamed to start with `.` (npm refuses to publish literal dotfiles inside a package's `files`, so the template stores them escaped).
   - Everything else: copied byte-for-byte.

If you need a new placeholder, add it to both `deriveNames` and the `vars` map in `scaffoldProject`, then reference it in any `.tpl` file.

## Template Contents (`template/`)

```
README.md.tpl              # Generated project's README — build/publish/customize instructions
package.json.tpl            # config.customEditors entry pre-filled with type: ["Property","Grid"], dataTypes: ["Text"]
index.html.tpl, vite.config.ts, tsconfig*.json, eslint.config.js, dot.gitignore
src/
  main.tsx.tpl              # Registers the custom element; dev-mode bootstrap when not running inside Charon
  EditorElement.tsx.tpl     # HTMLElement subclass implementing CharonPropertyEditorElement — mounts React via createRoot
  Editor.tsx.tpl            # The React component: a placeholder <input> bound via useControlValue/useControlDisabledStatus
  focus.component.input.function.ts
  index.scss.tpl
  vite-env.d.ts
  reactive/                 # Copied verbatim — same hook set used by every React package in this repo
    use.observable.function.ts, use.control.value.function.ts,
    use.control.disabled.status.function.ts, use.control.read.only.status.function.ts,
    use.debounce.function.ts, index.ts
```

The generated project targets **field-level editors only** — `config.customEditors[].type: ["Property", "Grid"]`. After scaffolding, the generated project's own README walks through customizing `Editor.tsx`, changing `dataTypes` to match the target field type, and the build/publish/local-testing flow (`.tgz` output, dropping it into Charon's platform-specific extensions folder, version bumping).

## Testing This Tool

```bash
npm test   # node --test scaffold.test.js — unit tests for validateName/deriveNames/substitute/scaffoldProject
```

## Resources

- [Creating a Custom Editor with React](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [charon-extensions API](../charon-extensions/README.md)
- [Charon Repository](https://github.com/gamedevware/charon)

## License

MIT
