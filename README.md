# Charon UI Extensions

Example projects and shared type definitions for building custom UI extensions for [Charon](https://github.com/gamedevware/charon), a game data editor. Extensions are **Web Components** packaged as **NPM modules**.

## Repository Structure

```
src/
  charon-extensions/                 TypeScript types and interfaces (the extension API contract) — read this first
  charon-logical-toggle/             React property editor    — simplest example, good starting point
  charon-color-picker/                Angular property editor  — demonstrates Angular zoneless setup
  charon-conversation-editor/        React schema editor      — full-document editor with React Flow
  charon-schema-graph/               React custom page        — routed page + side-nav action, not bound to a document
  create-charon-react-extension/     CLI scaffolder — generates a new React property-editor package
  create-charon-angular-extension/   CLI scaffolder — generates a new Angular property-editor package
```

Each package builds independently and has its own `node_modules`/lockfile — `cd` into the package directory and run `npm install && npm run build`. There is no monorepo tooling (no workspaces, no shared build).

Every package folder has its own README with an architecture diagram, project-structure map, and integration-points section — read the target package's README before modifying it.

## Choosing a Starting Point

| You want to...                          | Start with                       |
|------------------------------------------|-----------------------------------|
| Scaffold a new field editor (React)      | `node src/create-charon-react-extension/index.js my-extension` |
| Scaffold a new field editor (Angular)    | `node src/create-charon-angular-extension/index.js my-extension` |
| Study a simple field editor (React)      | `charon-logical-toggle`          |
| Study a simple field editor (Angular)    | `charon-color-picker`            |
| Build a full document editor             | `charon-conversation-editor`     |
| Build a routed page (not document-bound) | `charon-schema-graph`            |
| Understand the extension API             | `charon-extensions`              |

## Extension Types

Extensions declare what they provide in `package.json` under `config` (`customEditors`, `customActions`, `customPages` — schema at [`package.json.schema.json`](package.json.schema.json)):

- **Property** / **Grid** editors (`config.customEditors`, `type: ["Property"|"Grid"]`) replace individual field inputs. They implement `CharonPropertyEditorElement` and receive a `ValueControl` for a single property. See `charon-logical-toggle` or `charon-color-picker`.
- **Schema** editors (`config.customEditors`, `type: ["Schema"]`) replace the entire document editing view. They implement `CharonSchemaEditorElement` and receive a `RootDocumentControl` for the full document. See `charon-conversation-editor`.
- **Custom Pages** (`config.customPages`) are routed, bookmarkable pages unrelated to any single document. They receive an `ExtensionPageContext` instead of a control. See `charon-schema-graph`.
- **Custom Actions** (`config.customActions`) are menu entries invoked from Charon's UI (new-schema menu, document action menu, side navigation, etc.). Each one either calls an exported function (`functionName`) or navigates to one of the package's own custom pages (`pageId`) — mutually exclusive.

## Scaffolding a New Extension

The fastest way to start a new **Property**/**Grid** editor is the scaffold CLIs rather than copying an example by hand — they generate an already-wired minimal package (custom element bridge, reactive hooks, `package.json` with the `config.customEditors` entry pre-filled):

```bash
# from anywhere, no publish required:
node src/create-charon-react-extension/index.js my-extension     # React
node src/create-charon-angular-extension/index.js my-extension   # Angular
```

See [`create-charon-react-extension/README.md`](src/create-charon-react-extension/README.md) / [`create-charon-angular-extension/README.md`](src/create-charon-angular-extension/README.md) for details on what gets generated and how to customize it. For a **Schema** editor or **Custom Page**, there's no scaffolder yet — copy `charon-conversation-editor` or `charon-schema-graph` as a starting point instead.

## How Extensions Work

```
Charon (host app)
  1. Reads package.json → discovers custom editors/actions/pages
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
