# charon-conversation-editor — Undo/Redo via Host Service — Design

Date: 2026-07-20

## Summary

`charon-extensions` now provides `RootDocumentControlServices.undoRedo: UndoRedoService`
(`Partial` — may be absent), which auto-tracks the bound `RootDocumentControl`'s value internally.
`charon-conversation-editor` currently has its own snapshot-based undo/redo (`UndoRedoState`,
manually triggered via `saveState()` on canvas focus/blur and after auto-layout). This removes
that custom implementation and consumes the host's service instead, disabling undo/redo when the
service isn't provided. It also adds one new method, `barrier()`, to `UndoRedoService` in
`charon-extensions` to let the extension mark hard undo-step boundaries, since the host service
auto-batches rapid changes by elapsed time and the extension has no other way to opt a specific
change out of that batching.

## Non-Goals

- No change to how the document model itself (`ConversationTree`) is edited — only how undo/redo
  history is recorded and replayed.
- No `push()` calls from conversation-editor — per the host's auto-tracking contract, the service
  observes `RootDocumentControl` changes itself; `push()` remains part of the interface for other
  consumers/action types but conversation-editor doesn't need it.
- No automated test suite — matches existing precedent for this package (manual verification via
  `npm run build` / `npm run lint` / `npm run dev`).

## 1. `charon-extensions` — `UndoRedoService.barrier()`

`src/charon-extensions/src/services/undo.redo.service.ts` gains one new method:

```ts
/**
 * Marks a hard boundary in the undo/redo history: the next auto-tracked or pushed change
 * will always start a new undo step, even if it would otherwise be merged into the current
 * top-of-stack entry by the service's default time-based auto-batching (e.g. several rapid
 * edits within the same short window normally coalesce into one step). Has no effect on
 * changes already recorded — it only affects the next one. Safe to call at any time,
 * including when the history is empty.
 */
barrier(): void;
```

## 2. Production Runtime (real host)

- `UndoRedoContext` (`src/state/undo.redo.context.ts`) changes from providing a custom
  `UndoRedoState` instance to providing `UndoRedoService | undefined`, sourced from
  `documentControl.services.undoRedo` in `conversation.editor.element.tsx`. Default context value
  becomes `undefined`.
- `useUndoRedo()` (`src/state/use.undo.redo.function.ts`) rewritten: reads the service from
  context, subscribes to `service?.stateChange` (falling back to an empty observable when the
  service is absent, same `?? fallback` pattern already used in `charon-schema-graph`'s
  `schema.graph.page.tsx`) to trigger re-render, and returns:
  ```ts
  { canUndo: boolean; canRedo: boolean; undo: () => void; redo: () => void; barrier: () => void }
  ```
  `canUndo`/`canRedo` are `false` and `undo`/`redo`/`barrier` are no-ops when the service is
  absent — consumers don't need their own presence checks.
- `undo.button.tsx` / `redo.button.tsx`: **no changes** — they already just read `canUndo`/`undo`
  (or `canRedo`/`redo`) from the hook and disable on `!canUndo`/`!canRedo`; a no-op `undo`/`redo`
  and `false` `canUndo`/`canRedo` naturally disables them when the service is absent.
- `conversation.editor.tsx`: switch from `useContext(UndoRedoContext)` (destructuring
  `saveState`/`undo`/`redo` directly off the old class instance) to `useUndoRedo()`. Replace
  `onFocus={saveUndoRedoState} onBlur={saveUndoRedoState}` on `<ReactFlow>` with
  `onFocus={barrier} onBlur={barrier}` — seals off whatever was just edited during a canvas focus
  session so it doesn't merge with the next one. `undo`/`redo` hotkey bindings unchanged.
- `auto.layout.button.tsx`: switch from `useContext(UndoRedoContext)` (`saveState`) to
  `useUndoRedo()` (`barrier`). Replace the `saveState()` call at the end of the layout handler with
  `barrier()`, in the same place — after `onNodesChange(changes)` applies all repositioning — so
  the bulk auto-layout writes as one sealed step, not merged with whatever edit comes next.
- Delete `src/state/undo.redo.state.ts` (the custom snapshot class) — fully replaced.
- `src/state/index.ts`: drop `export * from './undo.redo.state'`.

## 3. Dev Harness (`npm run dev`)

`DevRootDocumentControl.services` (`src/dev/dev.root.document.control .ts`) is currently `{}`.
Per the schema-graph precedent (`dev.page.context.ts`'s fully-populated
`ExtensionContextServices` mock), it becomes a fully-populated `RootDocumentControlServices` mock:

- **`undoRedo`**: new `DevUndoRedoService` class (dev-only, `src/dev/dev.undo.redo.service.ts`),
  implementing `UndoRedoService` by watching the bound `RootDocumentControl`'s `valueChanges`:
  - Snapshots (`JSON.parse(JSON.stringify(value))`, matching the old `UndoRedoState`'s clone
    approach) on each `valueChanges` emission.
  - Coalesces a new snapshot into the current top-of-stack entry if it arrives within an 800ms
    window of the previous one — a dev-harness approximation of the real host's own time-based
    auto-batching (the exact window is a host implementation detail we can't observe; 800ms is a
    reasonable stand-in for interactive editing).
  - `barrier()` sets a flag forcing the *next* snapshot to start a fresh entry regardless of
    elapsed time, then clears the flag.
  - `undo()`/`redo()` move the index and replay via `control.setValue(snapshot, { emitEvent:
    false })` — verified `DevValueControl.setValue` already honors `emitEvent: false` to suppress
    `valueChanges`, so replay doesn't get re-recorded as a new step (no separate re-entrancy guard
    needed).
  - `push()`: since this dev service tracks the control directly rather than via explicit
    action-pairs, `push()` just invokes `action.redo()` immediately and calls `barrier()` — good
    enough for interface completeness given conversation-editor never calls it after this refactor.
  - `clear()`: resets history to a single entry holding the control's current value.
- **`gameData`, `validationProvider`, `translationLanguage`, `serverApiClient`**: stub methods that
  `throw new Error('... not implemented in dev harness')`, matching schema-graph's unused
  `GameDataService` methods — conversation-editor's dev flow doesn't call these today.
- **`uiState` / `ui.state`**: no-op `load`/`save` (matches schema-graph).
- **`ui.dialog`**: throwing stubs (matches schema-graph — `main.tsx`'s `openCustomDialog` is
  exercised via `ExtensionActionContext`, a separate path, not this one).
- **`ui.snackBar`**: `console.log` stubs, all methods (matches schema-graph).
- **`navigation`**: `console.log` stubs, all methods (matches schema-graph).

## 4. Testing

- `npm run build` and `npm run lint` in `src/charon-extensions` (new `barrier()` method compiles,
  no interface-implementation breaks elsewhere in that package) and in
  `src/charon-conversation-editor`.
- Manual, `npm run dev`: confirm undo/redo buttons and `Ctrl+Z`/`Ctrl+Y` hotkeys work against
  `DevUndoRedoService` — edit a node, undo, redo; run auto-layout, confirm it's undoable as one
  step; confirm rapid edits within ~800ms coalesce into one undo step and edits further apart don't.
- No automated test suite — matches existing precedent for this package.
