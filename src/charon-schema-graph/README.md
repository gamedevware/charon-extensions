# Charon Schema Graph Extension (React)

A read-only, auto-laid-out graph of the current project's schemas and their `Reference`/`ReferenceCollection` properties, for [Charon](https://gamedevware.com/). Demonstrates two host contracts: a **Custom Page** and a **side-navigation Custom Action** that links to it. Built with React, [@xyflow/react](https://www.npmjs.com/package/@xyflow/react), and [dagre](https://www.npmjs.com/package/dagre) for layout.

This is a minimal demo, not a data-modeling tool: static render, pan/zoom/minimap only — no click-to-navigate, no filtering.

## Quick Start

```bash
npm install
npm run dev     # Vite dev server, renders against mock sample schemas
npm run build   # Produces dist/*.tgz for publishing
npm run lint    # ESLint
```

## Try It in Charon

1. Go to **Project Settings > Extensions**, add `charon-schema-graph`, click **Update**.
2. Open the left sidebar — a **Schema Graph** entry appears (registered via a `side-navigation-menu` custom action with `pageId`, no function call involved).
3. Click it — navigates to `/ext/charon-schema-graph/ext-schema-graph`, rendering the graph for the current project's actual schemas.

To test a local build: **Project Settings > Extensions > Upload NPM Package**, select the `.tgz` from `dist/`.

## Architecture

```
Charon host application
  -> ExtensionPageHostComponent          (host-side; resolves the page by packageName+pageId)
    -> <ext-schema-graph-page>           (custom element, registered in main.tsx)
      .context = pageContext             (host sets this property directly, no JSX involved)
        -> React app                     (mounted via createRoot inside the custom element)
          -> SchemaGraphPage             (subscribes to context.services.gameData?.getMetadata())
            -> SchemaGraph               (Metadata -> nodes/edges -> dagre layout -> <ReactFlow>)
```

### Custom Page vs Custom Editor

Unlike `charon-conversation-editor` (a Custom Editor bound to a document's `ValueControl`), this package registers a **Custom Page** — a routed, bookmarkable page that receives an `ExtensionPageContext` instead of a document control. See `package.json`'s `config.customPages`.

### Custom Element Bridge

`SchemaGraphPageElement` extends `HTMLElement`. When Charon sets the `context` property, the element mounts a React tree inside itself via `createRoot`, wrapped in an `ErrorBoundary`. On disconnect, the React root is unmounted. This mirrors `charon-conversation-editor`'s `ConversationEditorElement`, just keyed on `context` instead of `documentControl`.

### Extension Registration (package.json)

```jsonc
{
  "config": {
    "customPages": [{
      "id": "ext-schema-graph",
      "selector": "ext-schema-graph-page",   // custom element tag name
      "title": "Schema Graph",
      "breadcrumb": "Schema Graph"
    }],
    "customActions": [{
      "name": "Schema Graph",
      "location": "side-navigation-menu",
      "pageId": "ext-schema-graph",          // links straight to the page, no functionName
      "icon": "emoji/spider_web"
    }]
  }
}
```

## Project Structure

```
src/
  main.tsx                          # Entry point: registers custom element, dev mode bootstrap
  schema.graph.page.element.tsx     # Web Component bridge (HTMLElement -> React), keyed on `context`
  schema.graph.page.tsx             # Subscribes to context.services.gameData?.getMetadata(), shows loading/error/graph
  schema.graph.tsx                  # Presentational: nodes/edges -> <ReactFlow>
  schema.to.graph.function.ts       # Pure: Metadata -> { nodes, edges } (Reference/ReferenceCollection only)
  layout.with.dagre.function.ts     # Pure: raw nodes/edges -> dagre-positioned nodes
  error.boundary.tsx                # Catches render errors, shows a fallback card
  index.scss                        # Global styles
  schema.graph.scss                 # Graph/message styles

  reactive/
    use.observable.function.ts      #   Hook: subscribes to ObservableLike<T>

  dev/
    dev.metadata.ts                 #   DevMetadata/DevSchema/DevSchemaProperty builder classes
    dev.page.context.ts             #   Mock ExtensionPageContext with sample schemas, for `npm run dev`
```

## Key Integration Points

### Reading Metadata

`SchemaGraphPage` calls `useObservable(context.services.gameData?.getMetadata() ?? ...)`. `context.services` is `Partial<ExtensionContextServices>` — only the fields the host actually populated are present — so `gameData` is optional; when it's absent the page falls back to an error observable and shows the same "failed to load" state as a real load failure. `GameDataService.getMetadata()` returns an `ObservableLike<Metadata>` — the same hook pattern `charon-conversation-editor` uses for any host-provided observable.

### Graph Construction

`schemaToGraph(metadata)` walks every schema and every property; for each `Reference`/`ReferenceCollection` property it adds one edge from the owning schema to `property.getReferencedSchema()`. Every schema becomes a node, even ones with no references — the graph is meant to show the full data model, not just connected schemas.

### Development Mode

`npm run dev` builds a `DevMetadata` instance with five sample schemas (`Item`, `Guild`, `Player`, `Recipe`, `Achievement`) wired with a handful of references, wraps it in a mock `ExtensionPageContext` (see `src/dev/dev.page.context.ts`), and sets it on a real `<ext-schema-graph-page>` element the same way the Charon host would — no mock UI framework needed.

## Resources

- [Creating a Custom Page](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [Charon Extensions Overview](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [@xyflow/react](https://www.npmjs.com/package/@xyflow/react)
- [dagre](https://www.npmjs.com/package/dagre)
- [Charon Repository](https://github.com/gamedevware/charon)

## License

MIT
