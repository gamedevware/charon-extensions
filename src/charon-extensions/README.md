# Charon Extensions – Type Definitions

TypeScript types and interfaces that define the [Charon](https://github.com/gamedevware/charon) extension API contract. Every other package in this repo (`charon-logical-toggle`, `charon-color-picker`, `charon-conversation-editor`, `charon-schema-graph`, and anything scaffolded by `create-charon-react-extension`/`create-charon-angular-extension`) depends on this package and implements one or more of the interfaces it declares. **Read this package before writing an extension** — it is the map of what a host-provided control/context looks like and what an extension must implement to be recognized by Charon.

📦 **Note:** This folder is source-of-truth for reference/editing. Consumers should install the published package, not depend on this folder directly:

```bash
npm install charon-extensions@latest -S
```

(Packages in this repo instead use `"charon-extensions": "file:../charon-extensions"` during development, pointing at this folder's `dist/`.)

## Build

```bash
npm install
npm run build   # esbuild (build.js) + tsc --emitDeclarationOnly -> dist/
```

## What's in Here

```
src/
  index.ts                        # Public entry point — re-exports everything below, plus global
                                   #   ambient declarations for Charon's built-in <charon-*-field> elements
                                   #   (HTMLElementTagNameMap) used by extensions that embed native fields.

  controls/                       # Interfaces an extension RECEIVES from Charon (do not implement — consume)
    value.control.ts              #   ValueControl<T> — the core interface: value, setValue/patchValue,
                                   #     valueChanges/statusChanges (ObservableLike), errors, addValidators,
                                   #     disabled/readOnly/dirty/touched, registerDoFocus. Given to every
                                   #     Property/Grid editor as `valueControl`.
    document.control.ts           #   DocumentControl — ValueControl for object/array values; adds property
                                   #     access (get/patchValue by path) and child control lookup.
    root.document.control.ts      #   RootDocumentControl — DocumentControl for a whole document; adds
                                   #     RootDocumentControlServices (gameData, undoRedo, uiState, translationLanguage).
                                   #     Given to Schema editors as `documentControl`.
    data.document.ts              #   Plain data-shape types (no behavior) mirroring stored document JSON.
    document.collection.ts        #   DocumentCollection — ordered list of child DocumentControls.
    reference.collection.ts       #   ReferenceCollection — list of Reference-typed document links.
    control.event.emit.options.ts #   Options for control mutation calls (e.g. emitEvent: false to stay silent).

  metadata/                       # Read-only project/schema description (from GameDataService.getMetadata())
    metadata.ts                  #   Metadata — root: project settings + all Schemas.
    schema.ts                    #   Schema — one document type: its SchemaProperty list, requirements.
    schema.property.ts           #   SchemaProperty — a field's DataType, uniqueness, referenced schema, spec dict.
    schema.document.ts           #   Schema-shaped document types.
    schema.reference.ts          #   Reference/ReferenceCollection resolution helpers.
    data.type.ts                 #   DataType enum: Text, LocalizedText, Logical, Time, Date, Number, Integer,
                                   #     PickList, MultiPickList, Document, DocumentCollection, Reference,
                                   #     ReferenceCollection, Formula — the same enum used in package.json's
                                   #     config.customEditors[].dataTypes.
                                   #     schema.type.ts / requirement.ts / uniqueness.ts / language.ts /
                                   #     project.settings.ts / specification.dictionary.ts / id.generator.type.ts
                                   #     round out the metadata model (formats, requiredness, per-property
                                   #     key-value specification strings, locales, generated-id rules).

  services/                       # Interfaces for host-injected capabilities, reached via a control's
                                   # `.services` or the context passed into custom actions/pages
    game.data.service.ts          #   GameDataService — find/query/list/bulkChange/import/export/getMetadata.
    extension.action.context.ts   #   ExtensionActionContext — passed to a config.customActions function
                                   #     (project/workspace/UI services + optional target document).
    extension.page.context.ts     #   ExtensionPageContext — passed to a config.customPages custom element
                                   #     as `.context` (services only, no document control).
    undo.redo.service.ts          #   UndoRedoService — push/batch undoable actions.
    ui.dialog.service.ts          #   UiDialogService — open host-styled dialogs/wizards from an extension.
    ui.snack.bar.service.ts       #   UiSnackBarService — host-styled toast notifications.
    preference.service.ts         #   ExtensionScopedUiStateService / DocumentScopedUiStateService — persisted
                                   #     UI state, layered by scope (browser session/local, project/workspace,
                                   #     personal/team — see PreferenceLayer).
    root.document.services.ts     #   RootDocumentControlServices — the bundle attached to RootDocumentControl.

  reactive/                       # RxJS-compatible interfaces (NOT RxJS itself — no hard dependency), so
                                   # both React (see each package's src/reactive/ hooks) and Angular
                                   # (subscribe in ngOnInit/detectChanges) can consume the same contracts
    observable.like.ts            #   ObservableLike<T> — subscribe(observer) -> TeardownLogic.
    observer.like.ts              #   ObserverLike<T> — next/error/complete.
    subscribable.like.ts / teardown.logic.ts

  property.editor.element.ts      # CharonPropertyEditorElement — interface a Property/Grid custom element
                                   #   must implement (a `valueControl` property setter).
  schema.editor.element.ts        # CharonSchemaEditorElement — interface a Schema custom element must
                                   #   implement (a `documentControl` property setter).
  json.pointer.ts                 # JSON Pointer (RFC 6901) helpers used for property paths.
  time.span.ts                    # TimeSpan value type for Time-typed fields.
  app.version.ts                  # Semver-ish version type/comparison used for extension version checks.
```

## Which Interface Do I Implement?

| Extension registers... | Element implements | Element receives |
|---|---|---|
| `config.customEditors` with `type: ["Property"\|"Grid"]` | `CharonPropertyEditorElement` | `valueControl: ValueControl<T>` |
| `config.customEditors` with `type: ["Schema"]` | `CharonSchemaEditorElement` | `documentControl: RootDocumentControl` |
| `config.customPages` | *(no fixed base interface — set the `context` property)* | `context: ExtensionPageContext` |

See the root [README](../../README.md) for the extension registration schema and each sibling package's README for a working example of each pattern.