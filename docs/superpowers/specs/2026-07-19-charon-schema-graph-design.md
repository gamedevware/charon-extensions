# charon-schema-graph — Design

Date: 2026-07-19

## Summary

New example extension package, `charon-schema-graph`, sibling to `charon-conversation-editor` and
`charon-logical-toggle` under `src/`. It demonstrates two host contracts that have no existing
example yet in this repo: a **Custom Page** (`config.customPages`) and a **side-navigation Custom
Action** (`config.customActions`, `location: "side-navigation-menu"`) that links straight to that
page via `pageId`. The page itself renders a read-only, auto-laid-out graph of the current
project's schemas (nodes) and their `Reference`/`ReferenceCollection` properties (edges), sourced
from `GameDataService.getMetadata()` on `ExtensionPageContext`.

This is a **minimal demo**, not a full data-modeling tool: static render, pan/zoom/minimap only, no
click-to-navigate, no filtering/search.

## Non-Goals

- No click-through from a graph node to that schema's document collection.
- No edges for `Document`/`DocumentCollection` (embedding) — references only.
- No search, filtering, or layout controls exposed to the user.
- No automated test suite beyond what conversation-editor itself already has (none) — manual
  verification only, matching that precedent.

## 1. Package Scaffolding

`src/charon-schema-graph/`, hand-built on `charon-conversation-editor`'s Vite + React + TS
skeleton (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`) — not generated via
`create-charon-react-extension`, which only scaffolds `ValueControl`-based property/grid editors
and doesn't fit a context-based page.

Trimmed relative to conversation-editor: no undo/redo, no `ValueControl`/document-editing
machinery, no schema-validation module — this page only reads `Metadata`, it never edits a
document.

### File layout

```
src/charon-schema-graph/
  package.json
  vite.config.ts
  tsconfig.json / tsconfig.app.json / tsconfig.node.json
  eslint.config.js
  index.html
  src/
    main.tsx                          — registers ext-schema-graph-page, dev-mode bootstrap
    schema.graph.page.element.tsx     — HTMLElement wrapper; `context` setter mounts React root
    schema.graph.page.tsx             — subscribes to context.gameData.getMetadata(), renders <SchemaGraph>
    schema.graph.tsx                  — presentational: nodes/edges -> <ReactFlow>
    schema.to.graph.function.ts       — pure: Metadata -> { nodes, edges }
    layout.with.dagre.function.ts     — pure: raw nodes/edges -> dagre-positioned nodes
    error.boundary.tsx                — copied from conversation-editor
    reactive/
      use.observable.function.ts      — copied from conversation-editor
    dev/
      dev.metadata.ts                 — DevMetadata/DevSchema/DevSchemaProperty, copied from conversation-editor
      dev.page.context.ts             — mock ExtensionPageContext for local `npm run dev`
      index.ts
    index.scss                        — minimal page/node styling
```

## 2. `package.json` Declarations

```json
"config": {
  "customPages": [
    {
      "id": "ext-schema-graph",
      "selector": "ext-schema-graph-page",
      "title": "Schema Graph",
      "breadcrumb": "Schema Graph"
    }
  ],
  "customActions": [
    {
      "name": "Schema Graph",
      "location": "side-navigation-menu",
      "pageId": "ext-schema-graph",
      "icon": "emoji/spider_web"
    }
  ]
}
```

The nav action has no `functionName` — it's a pure navigation link (`pageId` only), per the
side-navigation-actions contract (`ext-conventions/mutually exclusive functionName/pageId`).

### Dependencies

```json
"dependencies": {
  "@xyflow/react": "^12.11.2",
  "charon-extensions": "file:../charon-extensions",
  "dagre": "^0.8.5",
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "sass": "^1.101.0"
},
"devDependencies": {
  "@eslint/js": "^10.0.1",
  "@types/dagre": "^0.7.54",
  "@types/react": "^19.2.17",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.3",
  "eslint": "^10.7.0",
  "eslint-plugin-react-hooks": "^7.1.1",
  "eslint-plugin-react-refresh": "^0.5.3",
  "globals": "^17.7.0",
  "typescript": "^5.9.3",
  "typescript-eslint": "^8.64.0",
  "vite": "^8.1.5"
}
```

`charon-extensions` points at `file:../charon-extensions` **as a real, ongoing dependency, not a
temporary test swap** — `customPages`/`customActions`/`ExtensionPageContext`/`navigation` are new
contract shapes that exist locally but not yet in a published npm release of `charon-extensions`.
This is different from the earlier, deliberately-temporary `file:` swap done on the three existing
packages purely to verify they still compile — here there is no published version to fall back to
yet. Revisit once `charon-extensions` cuts a release containing these types.

Versions otherwise match what was just verified to build cleanly across the other two React
packages in this repo (React 19.2.7 / Vite 8.1.5 / TS 5.9.3 — TS capped below 7.0 because
`typescript-eslint`'s own latest release doesn't support it yet).

## 3. Data Flow

1. Host mounts `<ext-schema-graph-page>` (per the custom-routed-pages contract:
   `Renderer2.createElement('ext-schema-graph-page')`, then `setProperty('context', pageContext)`).
2. `SchemaGraphPageElement extends HTMLElement` exposes a `context: ExtensionPageContext` setter
   (mirrors `ConversationEditorElement`'s `documentControl` setter). On set, lazily creates a
   `react-dom/client` root over itself and renders:
   ```tsx
   <ErrorBoundary>
     <SchemaGraphPage context={context} />
   </ErrorBoundary>
   ```
3. `SchemaGraphPage` calls `useObservable(context.gameData.getMetadata())` — the hook ported as-is
   from conversation-editor (`[value, error, completed]` tuple over any `ObservableLike<T>`).
   - No value yet → renders a "Loading…" placeholder.
   - `error` set → renders an inline error message.
4. Once `Metadata` arrives, pure function `schemaToGraph(metadata: Metadata)`:
   - One node per `Schema` in `metadata.schemas` (**all** schemas, including ones with zero
     references — the graph is meant to show the full data model, not just connected schemas).
     Node label = `schema.displayName || schema.name`.
   - One edge per property, across all schemas, where `property.dataType` is `DataType.Reference`
     or `DataType.ReferenceCollection`: source = `property.schema`, target =
     `property.getReferencedSchema()`. Guarded the same way `DevSchemaProperty` guards itself
     (skip if `referenceType` is null even though `dataType` matches — shouldn't happen per
     contract, but cheap to guard).
5. Pure function `layoutWithDagre(nodes, edges)` — same technique as conversation-editor's
   `AutoLayoutButton` (a fresh `dagre.graphlib.Graph()`, `rankdir: 'LR'`, `ranksep`/`nodesep: 50`,
   default node size since these are simple label-only cards, no `measured` dimensions to read
   pre-render), but as a plain function computed once when nodes/edges are derived — no
   `useReactFlow`/button, because this graph is never user-rearranged.
6. `<SchemaGraph nodes={laidOutNodes} edges={edges} />` renders:
   ```tsx
   <ReactFlowProvider>
     <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} edgesFocusable={false} />
   </ReactFlowProvider>
   ```
   Pan/zoom/minimap only — no selection, no click-to-navigate (per chosen scope).

## 4. Dev Harness

`src/dev/dev.metadata.ts` copies conversation-editor's generic `DevMetadata`/`DevSchema`/
`DevSchemaProperty`/`DevSchemaReference` builder classes verbatim (they're not conversation-editor
specific). `src/dev/dev.page.context.ts` hand-builds ~4-5 sample schemas with a handful of
`Reference`/`ReferenceCollection` properties between them (e.g. `Player → Item`,
`Player → Guild`, `Recipe → Item` (collection)), then assembles a mock `ExtensionPageContext`:
`gameData.getMetadata()` returns an `ObservableLike` wrapping that `DevMetadata`; `navigation`,
`ui`, `userService`, `projectService`, `workspaceService`, `serverApiClient` get minimal stubs
(unused by this page, but required by the type). `params`/`restOfRoute` default to `{}`/`[]`.

`main.tsx`'s `isDev` block mounts `<ext-schema-graph-page>` with that mock context set directly on
the element (same pattern as conversation-editor's `<ext-conversation-editor documentControl={...}
/>` dev bootstrap), so `npm run dev` renders the graph standalone without a running Charon host.

## 5. Error Handling

- No metadata yet (`useObservable` hasn't emitted) → "Loading…" text.
- `useObservable`'s error channel set → inline error message in place of the graph.
- Unexpected render-time exception → caught by `ErrorBoundary` (copied from conversation-editor),
  same "Something went wrong 😢" card.
- Zero schemas in metadata → `<ReactFlow>` renders an empty canvas; no special-cased empty state,
  consistent with the minimal-demo scope.

## 6. Testing

- Manual, `npm run dev`: confirm the graph renders with the dev schemas/edges, dagre-positioned
  left-to-right, pan/zoom functional.
- Manual, in a running Charon host with this package installed: confirm the "Schema Graph" entry
  appears in the left sidebar, confirm clicking it navigates to
  `/ext/charon-schema-graph/ext-schema-graph`, confirm the rendered graph matches the real
  project's schemas and reference properties.
- No automated test suite — matches conversation-editor's existing precedent (no test tooling
  configured there either).
