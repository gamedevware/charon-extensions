# charon-conversation-editor Undo/Redo via Host Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `charon-conversation-editor`'s custom snapshot-based undo/redo with the host-provided `UndoRedoService` (`documentControl.services.undoRedo`), disabling undo/redo when the host doesn't provide it, and add a new `barrier()` method to `UndoRedoService` in `charon-extensions` so the extension can force undo-step boundaries the host's time-based auto-batching would otherwise merge.

**Architecture:** `UndoRedoService` (from `charon-extensions`) auto-tracks the bound `RootDocumentControl`'s value internally — the extension never calls `push()`. `charon-conversation-editor` becomes a pure consumer: a React context carries `UndoRedoService | undefined`, a hook (`useUndoRedo`) exposes `canUndo`/`canRedo`/`undo`/`redo`/`barrier` with safe no-op fallbacks when the service is absent. The dev harness (`npm run dev`, no real host) gets a self-contained `DevUndoRedoService` that reimplements the same auto-tracking behavior locally by watching `valueChanges`, so local development still exercises undo/redo.

**Tech Stack:** TypeScript, React 19, rxjs 7.8, Vite. No test runner configured in either package touched here (`charon-extensions`, `charon-conversation-editor`) — verification is `npm run build` + `npm run lint` (both must exit 0) plus, for the dev-harness task, manual verification via `npm run dev`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-conversation-editor-undo-redo-design.md`.
- No `push()` calls from `charon-conversation-editor` — the host (and the dev mock) auto-track the `RootDocumentControl`'s value; `push()` stays on the interface for other consumers only.
- `barrier()` doc comment must be present on the interface method (copied verbatim into Task 1 below) — this is the only public contract change in `charon-extensions`.
- `charon-conversation-editor`'s `package.json` already points `charon-extensions` at `file:../charon-extensions` (symlinked into `node_modules`) — `charon-extensions` must be rebuilt (`npm run build`, which regenerates `dist/`) before `charon-conversation-editor` can see the new `barrier()` type, since `charon-extensions`'s `package.json` `main`/`types` point at `dist/`.
- No automated test suite in either package — every task's verification is `npm run build` / `npm run lint` (exact commands and expected output given per task) plus, where noted, a manual `npm run dev` check.
- Preserve the existing filename `src/charon-conversation-editor/src/dev/dev.root.document.control .ts` exactly as-is (including the trailing space before `.ts`) — it's referenced by that exact literal path elsewhere (`create.dev.value.control.ts`).
- Match existing per-file style: dot-separated filenames, no comments beyond a short line explaining non-obvious *why*, `@typescript-eslint/no-explicit-any` disabled in this package.

---

## Task 1: `charon-extensions` — add `UndoRedoService.barrier()`

**Files:**
- Modify: `src/charon-extensions/src/services/undo.redo.service.ts`

**Interfaces:**
- Produces: `UndoRedoService.barrier(): void` — consumed by Task 2 (`useUndoRedo()` hook) and Task 3 (`DevUndoRedoService`).

- [ ] **Step 1: Add the `barrier()` method to the interface**

Open `src/charon-extensions/src/services/undo.redo.service.ts`. Insert a new method between `push(...)` and `clear()`:

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

The full file should read:

```ts
import { ObservableLike } from "../reactive";

/** Service for managing undo/redo history of the current document editor. */
export interface UndoRedoService {
    /** Emits when the undo/redo state changes (e.g., after push, undo, redo, or clear). */
    readonly stateChange: ObservableLike<void>

    /** Whether there are actions available to undo. */
    readonly canUndo: boolean;
    /** Whether there are actions available to redo. */
    readonly canRedo: boolean;

    /** Undoes the most recent action (or batch of actions). */
    undo(): void;
    /** Redoes the most recently undone action (or batch of actions). */
    redo(): void;

    /**
     * Records an undoable action onto the history stack.
     * @param action.redo - Function to apply the change.
     * @param action.undo - Function to reverse the change.
     * @param batcher - Optional function to coalesce the incoming action with the current top of the undo stack.
     *   Receives `prev` (the top entry) and `elapsedMs` (time since `prev` was pushed).
     *   Return `prev` by reference to replace the top entry with the merged result (e.g., to batch rapid edits into one undo step).
     *   Return any other object to push the incoming action as a new, separate undo step.
     *   Not called when the undo stack is empty.
     */
    push(action: { redo: () => void; undo: () => void }, batcher?: (prev: typeof action, elapsedMs: number) => typeof action): void;

    /**
     * Marks a hard boundary in the undo/redo history: the next auto-tracked or pushed change
     * will always start a new undo step, even if it would otherwise be merged into the current
     * top-of-stack entry by the service's default time-based auto-batching (e.g. several rapid
     * edits within the same short window normally coalesce into one step). Has no effect on
     * changes already recorded — it only affects the next one. Safe to call at any time,
     * including when the history is empty.
     */
    barrier(): void;

    /** Clears all undo/redo history. */
    clear(): void;
}
```

- [ ] **Step 2: Build `charon-extensions`**

Run:
```bash
cd src/charon-extensions
npm run build
```
Expected: exits 0, no TypeScript errors (this is an interface-only change — nothing in `charon-extensions` itself implements `UndoRedoService`, so nothing else can break).

- [ ] **Step 3: Verify the declaration output picked up the new method**

Run:
```bash
grep -n "barrier" src/charon-extensions/dist/services/undo.redo.service.d.ts
```
Expected: one line showing `barrier(): void;` in the emitted `.d.ts`. This confirms `charon-conversation-editor` (which consumes `charon-extensions` via a `file:` dependency resolving to `dist/`) will see the new method once Task 2 starts.

- [ ] **Step 4: Commit**

```bash
git add src/charon-extensions/src/services/undo.redo.service.ts
git commit -m "feat(charon-extensions): add UndoRedoService.barrier() to opt out of time-based auto-batching"
```

Note: `dist/` is build output — check whether it's gitignored before staging anything else; only stage the source file above.

---

## Task 2: `charon-conversation-editor` — consume the host `UndoRedoService`, remove custom undo/redo

**Files:**
- Modify: `src/charon-conversation-editor/src/state/undo.redo.context.ts`
- Modify: `src/charon-conversation-editor/src/state/use.undo.redo.function.ts`
- Modify: `src/charon-conversation-editor/src/state/index.ts`
- Delete: `src/charon-conversation-editor/src/state/undo.redo.state.ts`
- Modify: `src/charon-conversation-editor/src/conversation.editor.element.tsx`
- Modify: `src/charon-conversation-editor/src/conversation.editor.tsx`
- Modify: `src/charon-conversation-editor/src/controls/auto.layout.button.tsx`

**Interfaces:**
- Consumes: `UndoRedoService` from `charon-extensions` (`stateChange: ObservableLike<void>`, `canUndo: boolean`, `canRedo: boolean`, `undo(): void`, `redo(): void`, `barrier(): void`) — produced by Task 1.
- Produces: `useUndoRedo(): { canUndo: boolean; canRedo: boolean; undo: () => void; redo: () => void; barrier: () => void }` — consumed by `undo.button.tsx`/`redo.button.tsx` (unchanged call sites) and by this task's own edits to `conversation.editor.tsx`/`auto.layout.button.tsx`.

- [ ] **Step 1: Rewrite `undo.redo.context.ts`**

Replace the entire contents of `src/charon-conversation-editor/src/state/undo.redo.context.ts` with:

```ts
import { createContext } from "react";
import { UndoRedoService } from "charon-extensions";

/** The host-provided undo/redo service for the current document, or undefined if the host didn't provide one. */
export const UndoRedoContext = createContext<UndoRedoService | undefined>(undefined);
```

- [ ] **Step 2: Rewrite `use.undo.redo.function.ts`**

Replace the entire contents of `src/charon-conversation-editor/src/state/use.undo.redo.function.ts` with:

```ts
import { useContext, useEffect, useState } from "react";
import { UndoRedoContext } from "./undo.redo.context";

export interface UseUndoRedoResult {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    barrier: () => void;
}

/**
 * Custom hook to read and react to the host UndoRedoService's state
 * Re-renders when the service reports a state change; degrades to disabled no-ops when the
 * host didn't provide an undoRedo service at all (documentControl.services is Partial).
 *
 * @example
 * const { canUndo, undo } = useUndoRedo();
 *
 * <button disabled={!canUndo} onClick={undo}>Undo</button>
 */
export function useUndoRedo(): UseUndoRedoResult {
    const service = useContext(UndoRedoContext);

    const [, mutateState] = useState(0);
    useEffect(() => {
        if (!service) {
            return;
        }
        const subscription = service.stateChange.subscribe({
            next: () => mutateState(old => old + 1) // force re-render when canUndo/canRedo change, counter value is not used, only used to trigger re-render
        });
        return subscription.unsubscribe.bind(subscription);

    }, [service])

    return {
        canUndo: service?.canUndo ?? false,
        canRedo: service?.canRedo ?? false,
        undo: () => service?.undo(),
        redo: () => service?.redo(),
        barrier: () => service?.barrier(),
    };
}
```

- [ ] **Step 3: Update `state/index.ts`**

In `src/charon-conversation-editor/src/state/index.ts`, remove the line:
```ts
export * from './undo.redo.state';
```
The file should read:
```ts
export * from './conversation.state';
export * from './x.y.position';
export * from './use.undo.redo.function';
export * from './conversation.context';
export * from './undo.redo.context';
export * from './use.localized.text';
export * from './bind.instance.methods.function';
```

- [ ] **Step 4: Delete `undo.redo.state.ts`**

```bash
git rm src/charon-conversation-editor/src/state/undo.redo.state.ts
```

- [ ] **Step 5: Update `conversation.editor.element.tsx`**

In `src/charon-conversation-editor/src/conversation.editor.element.tsx`:

Remove this import:
```ts
import { UndoRedoState } from "./state/undo.redo.state";
```

Change:
```tsx
<UndoRedoContext value={new UndoRedoState(this._documentControl)}>
```
to:
```tsx
<UndoRedoContext value={this._documentControl.services.undoRedo}>
```

The full `render()` method should read:
```tsx
  private render() {
    this._root ??= createRoot(this);

    if (this._documentControl) {
      const isValidSchema = !validateSchema(this._documentControl.schema).length;

      this._root.render(
        <ErrorBoundary>
          <ReactFlowProvider>
            <ConversationContext value={new ConversationState(this._documentControl)}>
              <UndoRedoContext value={this._documentControl.services.undoRedo}>
                {isValidSchema ? <ConversationEditor /> : <SchemaValidationResult documentControl={this._documentControl} />}
              </UndoRedoContext>
            </ConversationContext>
          </ReactFlowProvider>
        </ErrorBoundary>);
    }
  }
```

- [ ] **Step 6: Update `conversation.editor.tsx`**

In `src/charon-conversation-editor/src/conversation.editor.tsx`:

Change the React import from:
```ts
import { useContext, useState } from 'react';
```
to:
```ts
import { useState } from 'react';
```
(`useContext` becomes unused in this file once the direct `UndoRedoContext` read below is replaced by the hook.)

Change:
```ts
import { UndoRedoContext } from './state';
```
to:
```ts
import { useUndoRedo } from './state';
```

Change:
```ts
  const { saveState: saveUndoRedoState, undo, redo } = useContext(UndoRedoContext);
```
to:
```ts
  const { undo, redo, barrier } = useUndoRedo();
```

Change:
```tsx
          onFocus={saveUndoRedoState}
          onBlur={saveUndoRedoState}
```
to:
```tsx
          onFocus={barrier}
          onBlur={barrier}
```

`useHotkeys('ctrl+z, meta+z', undo, ...)` and `useHotkeys('ctrl+y, meta+y, shift+z', redo, ...)` stay unchanged — `undo`/`redo` still have the same names and signatures.

- [ ] **Step 7: Update `auto.layout.button.tsx`**

In `src/charon-conversation-editor/src/controls/auto.layout.button.tsx`:

Change:
```ts
import { UndoRedoContext } from '../state';
```
to:
```ts
import { useUndoRedo } from '../state';
```
(keep the existing `import { MouseEventHandler, useCallback, useContext, useEffect, useState } from "react";` unchanged — `useContext` is still used for `ConversationContext` in this file.)

Change:
```ts
    const { saveState } = useContext(UndoRedoContext);
```
to:
```ts
    const { barrier } = useUndoRedo();
```

Change the callback's dependency array from:
```ts
    }, [fitView, getEdges, getNodes, onNodesChange, saveState]);
```
to:
```ts
    }, [fitView, getEdges, getNodes, onNodesChange, barrier]);
```

Change:
```ts
        // Step 8: Save state for undo/redo functionality
        saveState();
```
to:
```ts
        // Step 8: Seal the auto-layout as its own undo step, so it doesn't merge with
        // whatever edit comes next (the host auto-batches rapid changes by elapsed time).
        barrier();
```

- [ ] **Step 8: Build**

Run:
```bash
cd src/charon-conversation-editor
npm run build
```
Expected: exits 0. (If it fails with "Property 'barrier' does not exist on type 'UndoRedoService'", `charon-extensions` wasn't rebuilt — go back and run Task 1 Step 2.)

- [ ] **Step 9: Lint**

Run:
```bash
npm run lint
```
Expected: exits 0, no errors (in particular, no `no-unused-vars` on the `useContext` import removed from `conversation.editor.tsx`, and no unresolved-import errors for the deleted `undo.redo.state.ts`).

- [ ] **Step 10: Commit**

```bash
git add src/charon-conversation-editor/src/state/undo.redo.context.ts \
        src/charon-conversation-editor/src/state/use.undo.redo.function.ts \
        src/charon-conversation-editor/src/state/index.ts \
        src/charon-conversation-editor/src/conversation.editor.element.tsx \
        src/charon-conversation-editor/src/conversation.editor.tsx \
        src/charon-conversation-editor/src/controls/auto.layout.button.tsx
git commit -m "refactor(charon-conversation-editor): consume host UndoRedoService, remove custom undo/redo"
```

(`undo.redo.state.ts`'s removal was already staged by `git rm` in Step 4 — it'll be included in this commit too since it's still in the index.)

**Note:** After this task, `npm run dev` will show undo/redo buttons permanently disabled — `DevRootDocumentControl.services` is still `{}` until Task 3. This is expected and matches the documented fallback behavior (service absent → disabled).

---

## Task 3: `charon-conversation-editor` — dev-harness `DevUndoRedoService` and full services mock

**Files:**
- Create: `src/charon-conversation-editor/src/dev/dev.undo.redo.service.ts`
- Modify: `src/charon-conversation-editor/src/dev/dev.root.document.control .ts` (note the trailing space in the filename — preserve exactly)

**Interfaces:**
- Consumes: `UndoRedoService` (Task 1), `ValueControl<T>.value`/`valueChanges`/`setValue` (existing `charon-extensions` contract, already used by the deleted `UndoRedoState`).
- Produces: `DevUndoRedoService<StateT extends object>` class implementing `UndoRedoService`, constructed as `new DevUndoRedoService(control: ValueControl<StateT>)` — consumed only by `dev.root.document.control .ts` in this task.

- [ ] **Step 1: Create `dev.undo.redo.service.ts`**

Write `src/charon-conversation-editor/src/dev/dev.undo.redo.service.ts`:

```ts
import { ObservableLike, UndoRedoService, ValueControl } from "charon-extensions";
import { Subject } from "rxjs";

const BATCH_WINDOW_MS = 800;

/**
 * Dev-harness stand-in for the host-provided UndoRedoService. Watches a ValueControl's
 * `valueChanges` and snapshots on every emission, coalescing snapshots that arrive within
 * BATCH_WINDOW_MS of each other into the current top-of-stack entry — a local approximation
 * of the real host's own time-based auto-batching (its exact window isn't observable from
 * here). `barrier()` forces the next snapshot to start a fresh entry regardless of elapsed
 * time. `undo()`/`redo()` replay via `setValue(snapshot, { emitEvent: false })`, which
 * DevValueControl/DevDocumentControl already honor to suppress `valueChanges` — so replaying
 * history doesn't get re-recorded as a new step.
 */
export class DevUndoRedoService<StateT extends object> implements UndoRedoService {
    private readonly states: StateT[];
    private stateIndex: number;
    private lastRecordedAt: number;
    private forceNewEntry: boolean;
    private readonly stateChangeSubject: Subject<void>;

    public readonly stateChange: ObservableLike<void>;

    public get canUndo(): boolean {
        return this.stateIndex > 0;
    }
    public get canRedo(): boolean {
        return this.stateIndex < this.states.length - 1;
    }

    constructor(private readonly valueControl: ValueControl<StateT>) {
        this.states = [this.clone(this.valueControl.value)];
        this.stateIndex = 0;
        this.lastRecordedAt = Date.now();
        this.forceNewEntry = false;
        this.stateChangeSubject = new Subject();
        this.stateChange = this.stateChangeSubject.asObservable() as unknown as ObservableLike<void>;

        this.valueControl.valueChanges.subscribe({
            next: value => this.record(value)
        });
    }

    public undo(): void {
        if (!this.canUndo) {
            return;
        }
        this.stateIndex--;
        this.valueControl.setValue(this.clone(this.states[this.stateIndex]), { emitEvent: false });
        this.forceNewEntry = true;
        this.stateChangeSubject.next();
    }

    public redo(): void {
        if (!this.canRedo) {
            return;
        }
        this.stateIndex++;
        this.valueControl.setValue(this.clone(this.states[this.stateIndex]), { emitEvent: false });
        this.forceNewEntry = true;
        this.stateChangeSubject.next();
    }

    public push(action: { redo: () => void; undo: () => void }): void {
        // This dev harness tracks the bound ValueControl directly via `valueChanges` rather
        // than explicit action-pairs; apply immediately and seal it off as its own step.
        action.redo();
        this.barrier();
    }

    public clear(): void {
        this.states.splice(0, this.states.length, this.clone(this.valueControl.value));
        this.stateIndex = 0;
        this.stateChangeSubject.next();
    }

    public barrier(): void {
        this.forceNewEntry = true;
    }

    private record(value: StateT): void {
        const now = Date.now();
        const coalesce = !this.forceNewEntry && (now - this.lastRecordedAt) < BATCH_WINDOW_MS;
        this.lastRecordedAt = now;
        this.forceNewEntry = false;

        if (coalesce) {
            this.states[this.stateIndex] = this.clone(value);
        } else {
            this.states.splice(this.stateIndex + 1);
            this.states.push(this.clone(value));
            this.stateIndex++;
        }
        this.stateChangeSubject.next();
    }

    private clone(value: StateT): StateT {
        return JSON.parse(JSON.stringify(value));
    }
}
```

- [ ] **Step 2: Rewrite `dev.root.document.control .ts` with a fully-populated services mock**

Replace the entire contents of `src/charon-conversation-editor/src/dev/dev.root.document.control .ts` with:

```ts
import {
    DataDocument, Language, ObservableLike, RootDocumentControl,
    RootDocumentControlServices, Schema, SchemaProperty
} from "charon-extensions";
import { NEVER } from "rxjs";
import { DevValueControl } from "./dev.value.control";
import { DevDocumentControl } from "./dev.document.control";
import { DevUndoRedoService } from "./dev.undo.redo.service";

function notImplemented(methodName: string): () => never {
    return () => { throw new Error(`${methodName}() not implemented in dev harness`); };
}

export class DevRootDocumentControl<T extends DataDocument = DataDocument> extends DevDocumentControl<T> implements RootDocumentControl<T> {
    public declare type: 'document';
    public declare schemaProperty: SchemaProperty & undefined;
    public controls: RootDocumentControl<T>['controls'];

    public readonly services: Partial<RootDocumentControlServices>;

    constructor(
        public baseValue: T,
        public readonly schema: Schema,
    ) {
        super(baseValue, schema.getIdProperty());

        this.controls = Object.fromEntries(schema
            .properties
            .map(schemaProperty => [
                schemaProperty.name,
                DevValueControl.create(this, schemaProperty, baseValue instanceof Object ? baseValue[schemaProperty.name] : null)
            ])
        ) as any;

        this.services = {
            validationProvider: {
                getDocumentValue: notImplemented('getDocumentValue'),
                listDocuments: notImplemented('listDocuments'),
                listLocalDocuments: notImplemented('listLocalDocuments'),
                findDocument: notImplemented('findDocument'),
            },
            translationLanguage: {
                primaryLanguage$: NEVER as unknown as ObservableLike<Language>,
                languages$: NEVER as unknown as ObservableLike<readonly Language[]>,
                currentLanguage$: NEVER as unknown as ObservableLike<Language>,
                selectLanguage: notImplemented('selectLanguage'),
            },
            gameData: {
                getId: notImplemented('getId'),
                getMetadata: notImplemented('getMetadata'),
                find: notImplemented('find'),
                query: notImplemented('query'),
                list: notImplemented('list'),
                bulkChange: notImplemented('bulkChange'),
                import: notImplemented('import'),
                export: notImplemented('export'),
                validate: notImplemented('validate'),
            },
            undoRedo: new DevUndoRedoService<T>(this),
            uiState: {
                load: () => undefined,
                save: () => { },
            },
            ui: {
                state: {
                    load: () => undefined,
                    save: () => { },
                },
                dialog: {
                    showProgress: notImplemented('showProgress'),
                    showCustom: notImplemented('showCustom'),
                    showCodeSnippet: notImplemented('showCodeSnippet'),
                    showBackupWizard: notImplemented('showBackupWizard'),
                    showExportLocalizationWizard: notImplemented('showExportLocalizationWizard'),
                    showExportWizard: notImplemented('showExportWizard'),
                    showImportLocalizationWizard: notImplemented('showImportLocalizationWizard'),
                    showImportWizard: notImplemented('showImportWizard'),
                    showPublicationWizard: notImplemented('showPublicationWizard'),
                    showRestoreWizard: notImplemented('showRestoreWizard'),
                    showSourceCodeGenerationWizard: notImplemented('showSourceCodeGenerationWizard'),
                },
                snackBar: {
                    loadStarted: () => console.log('[dev] snackBar.loadStarted()'),
                    loadFailed: (error: any) => console.log('[dev] snackBar.loadFailed()', error),
                    loadSucceed: () => console.log('[dev] snackBar.loadSucceed()'),
                    saveStarted: () => console.log('[dev] snackBar.saveStarted()'),
                    saveFailed: (error: any) => console.log('[dev] snackBar.saveFailed()', error),
                    saveSucceed: () => console.log('[dev] snackBar.saveSucceed()'),
                    reloadStarted: () => console.log('[dev] snackBar.reloadStarted()'),
                    reloadFailed: (error: any) => console.log('[dev] snackBar.reloadFailed()', error),
                    reloadSucceed: () => console.log('[dev] snackBar.reloadSucceed()'),
                    deleteStarted: () => console.log('[dev] snackBar.deleteStarted()'),
                    deleteFailed: (error: any) => console.log('[dev] snackBar.deleteFailed()', error),
                    deleteSucceed: () => console.log('[dev] snackBar.deleteSucceed()'),
                },
            },
            serverApiClient: undefined,
        };
    }
}
```

Note: `RootDocumentControlServices` has no `navigation` field (that's only on `ExtensionActionContextBase`/`ExtensionContextServices`, a different interface used for actions/pages, not document controls) — don't add one here.

- [ ] **Step 3: Build**

Run:
```bash
cd src/charon-conversation-editor
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Lint**

Run:
```bash
npm run lint
```
Expected: exits 0.

- [ ] **Step 5: Manual verification via `npm run dev`**

Run:
```bash
npm run dev
```
Open the printed local URL in a browser. Verify:
1. Undo/redo buttons start disabled (no history beyond the initial state).
2. Edit a dialog node's text in the property drawer — the undo button becomes enabled.
3. Click undo — the edit reverts; redo becomes enabled.
4. Click redo — the edit re-applies.
5. Trigger the auto-layout button (network-graph icon in the React Flow controls) — nodes rearrange, and a single undo reverts the entire rearrangement (not one node at a time).
6. Make two edits more than ~1 second apart, then undo twice — each edit reverts separately (not merged).
7. `Ctrl+Z`/`Ctrl+Y` (or `Cmd+Z`/`Cmd+Y`) hotkeys work the same as the buttons.

Stop the dev server (`Ctrl+C`) once verified.

- [ ] **Step 6: Commit**

```bash
git add src/charon-conversation-editor/src/dev/dev.undo.redo.service.ts \
        "src/charon-conversation-editor/src/dev/dev.root.document.control .ts"
git commit -m "feat(charon-conversation-editor): add DevUndoRedoService and full dev-harness services mock"
```

---

## Post-Plan Note (not a task — informational)

While investigating `RootDocumentControlServices`/`ExtensionContextServices` mock shapes for Task 3, running `npm run build` in the sibling `charon-schema-graph` package surfaced a **pre-existing, unrelated build failure**: `src/charon-schema-graph/src/dev/dev.page.context.ts`'s `ui.dialog` mock only implements 2 of `UiDialogService`'s 11 methods (`showProgress`, `showCustom`), causing `TS2740`. This is out of scope for this plan (different package, different feature) — flag it to the user after this plan completes; don't fix it here unless asked.
