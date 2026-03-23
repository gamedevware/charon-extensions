# Charon UI Extensions

Example projects and shared type definitions for building custom UI extensions for [Charon](https://github.com/gamedevware/charon), a game data editor. Extensions are **Web Components** packaged as **NPM modules**.

## Repository Structure

```
src/
  charon-extensions/           TypeScript types and interfaces (the extension API contract)
  charon-logical-toggle/       React property editor   — simplest example, good starting point
  charon-color-picker/         Angular property editor  — demonstrates Angular zoneless setup
  charon-conversation-editor/  React schema editor      — full-document editor with React Flow
```

Each package builds independently — `cd` into the package directory and run `npm install && npm run build`.

## Choosing a Starting Point

| You want to...                         | Start with                  |
|----------------------------------------|-----------------------------|
| Build a simple field editor (React)    | `charon-logical-toggle`     |
| Build a simple field editor (Angular)  | `charon-color-picker`       |
| Build a full document editor           | `charon-conversation-editor`|
| Understand the extension API           | `charon-extensions`         |

## Extension Types

Extensions register editors via `config.customEditors` in `package.json`:

- **Property** / **Grid** editors replace individual field inputs. They implement `CharonPropertyEditorElement` and receive a `ValueControl` for a single property.
- **Schema** editors replace the entire document editing view. They implement `CharonSchemaEditorElement` and receive a `RootDocumentControl` for the full document.

Extensions can also register **Custom Actions** via `config.customActions` — functions invoked from Charon's menus (e.g., "Create Conversation Schema" in the new-schema menu).

## How Extensions Work

```
Charon (host app)
  1. Reads package.json → discovers custom editors/actions
  2. Loads the extension's JS entry point
  3. Creates the custom element (e.g., <ext-logical-toggle-editor>)
  4. Sets valueControl (property editor) or documentControl (schema editor) on the element
  5. The element mounts its framework (React/Angular) and binds to the control
```

The control objects (`ValueControl`, `DocumentControl`, `RootDocumentControl`) provide:
- Two-way data binding (`value`, `setValue`, `valueChanges`)
- Validation state (`errors`, `status`, `addValidators`)
- UI state (`disabled`, `readOnly`, `dirty`, `touched`)
- Services (`gameData`, `undoRedo`, `uiState`, `translationLanguage`)

All control interfaces are defined in `charon-extensions`.

## Building & Publishing

```bash
cd src/<package-name>
npm install
npm run build
# Output: dist/*.tgz (React) or dist/browser/*.tgz (Angular)
```

Install in Charon:
- **From NPM**: Add the package name in **Project Settings > Extensions**, click **Update**.
- **From local build**: Click **Upload NPM Package** in the extensions settings and select the `.tgz` file.

## Key Differences: React vs Angular

| Aspect | React extensions | Angular extensions |
|--------|------------------|--------------------|
| Build tool | Vite | Angular CLI |
| Custom element | Class extending `HTMLElement`, mounts React via `createRoot` | `@angular/elements` `createCustomElement` in `ngDoBootstrap` |
| Change detection | React's own (hooks, state) | **Must be zoneless** (`provideExperimentalZonelessChangeDetection`) to avoid conflicts with Charon's zone.js |
| Output directory | `dist/` | `dist/browser/` |

## Documentation

- [Charon Extensions Overview](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [Creating a Custom Editor with React](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [Creating a Custom Editor with Angular](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [Charon Repository](https://github.com/gamedevware/charon)

## Contributing

Fork this repository or open pull requests with improvements, new example editors, or bug fixes.

## License

[MIT](LICENSE)
