# charon-schema-graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `charon-schema-graph`, a new example extension package under `src/` that demonstrates a Custom Page and a `side-navigation-menu` Custom Action, rendering a read-only, auto-laid-out graph of the current project's schemas and their `Reference`/`ReferenceCollection` properties.

**Architecture:** A Vite + React 19 + TypeScript package (hand-built on `charon-conversation-editor`'s skeleton, trimmed of anything document-editing-specific). A `<ext-schema-graph-page>` custom element bridges the host's `ExtensionPageContext` into a React tree; the tree subscribes to `context.gameData.getMetadata()`, converts `Metadata` into `@xyflow/react` nodes/edges, lays them out with `dagre`, and renders a pannable/zoomable read-only graph.

**Tech Stack:** React 19.2.7, Vite 8.1.5, TypeScript 5.9.3, `@xyflow/react` ^12.11.2, `dagre` ^0.8.5, `rxjs` ^7.8.2 (dev-harness mocks only).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-19-charon-schema-graph-design.md`.
- **Minimal demo scope** — static render only, no click-to-navigate, no filtering/search (per spec §Non-Goals).
- **Edges = `Reference`/`ReferenceCollection` properties only** — no `Document`/`DocumentCollection` embedding edges (per spec §Non-Goals).
- **Nodes = every schema** in `metadata.schemas`, including ones with zero references (per spec §3).
- `charon-extensions` dependency is `file:../charon-extensions` **permanently for now** (not a temporary test swap) — `customPages`/`customActions`/`ExtensionPageContext`/`navigation` aren't in a published npm release yet (per spec §2).
- No automated test suite — matches `charon-conversation-editor`'s existing precedent. Every task's deliverable is verified by running `npm run dev` and observing the browser, or `npm run build`/`npm run lint` for toolchain checks (per spec §6).
- Dependency versions are pinned to what was just verified to build cleanly across the repo's other two React packages: React 19.2.7 / Vite 8.1.5 / TS 5.9.3 (TS capped below 7.0 because `typescript-eslint`'s own latest release doesn't support it yet).

---

### Task 1: Scaffold the package and verify the toolchain

**Files:**
- Create: `src/charon-schema-graph/package.json`
- Create: `src/charon-schema-graph/tsconfig.json`
- Create: `src/charon-schema-graph/tsconfig.app.json`
- Create: `src/charon-schema-graph/vite.config.ts`
- Create: `src/charon-schema-graph/eslint.config.js`
- Create: `src/charon-schema-graph/index.html`
- Create: `src/charon-schema-graph/.gitignore`
- Create: `src/charon-schema-graph/src/vite-env.d.ts`
- Create: `src/charon-schema-graph/src/index.scss`
- Create: `src/charon-schema-graph/src/main.tsx`

**Interfaces:**
- Produces: the custom element tag `ext-schema-graph-page` registered in `main.tsx` (placeholder implementation in this task — Task 2 replaces the class body with the real Web Component wrapper, same tag name, same registration call site).

- [ ] **Step 1: Create `package.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/gamedevware/charon-extensions/refs/heads/main/package.json.schema.json",
  "name": "charon-schema-graph",
  "version": "1.0.0",
  "description": "Read-only schema reference graph example extension for Charon, demonstrating custom pages and side-navigation custom actions.",
  "keywords": [
    "charon",
    "extensions",
    "schema graph",
    "custom page"
  ],
  "homepage": "https://github.com/gamedevware/charon-extensions",
  "bugs": "https://github.com/gamedevware/charon-extensions/issues",
  "author": "GameDevWare, Denis Zykov",
  "license": "MIT",
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
  },
  "main": "index.js",
  "files": [
    "assets/index.css"
  ],
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && copy package.json dist\\package.json && cd dist && npm pack",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@xyflow/react": "^12.11.2",
    "charon-extensions": "file:../charon-extensions",
    "dagre": "^0.8.5",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "rxjs": "^7.8.2",
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
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 3: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
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

- [ ] **Step 5: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": ["off"],
    },
  },
)
```

- [ ] **Step 6: Create `index.html`**

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <title>Schema Graph</title>
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body>
  <div id="root" style="width: 100vw; height: 100vh; display: flex; flex-direction: column;"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

- [ ] **Step 7: Create `.gitignore`**

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

- [ ] **Step 8: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 9: Create `src/index.scss`**

```scss
:root {
  font-family: 'Inter', sans-serif;
  line-height: 115%;
  font-size: 15px;

  --app-color-text-default: black;
  --app-color-light-gray: #EBEBEB;
  --app-color-gray: #B2B2B2;
  --app-color-dark-gray: #666666;
  --app-color-warn: #FF6E6E;
}

body {
  margin: 0;
  padding: 0;
}

.ext-schema-graph-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 10: Create `src/main.tsx`** (placeholder custom element — Task 2 replaces the class body)

```tsx
import { createRoot } from 'react-dom/client';
import './index.scss';

// Placeholder — Task 2 replaces this with the real SchemaGraphPageElement Web Component wrapper.
class SchemaGraphPagePlaceholder extends HTMLElement {
  connectedCallback() {
    this.textContent = 'charon-schema-graph scaffold OK';
  }
}
customElements.define('ext-schema-graph-page', SchemaGraphPagePlaceholder);

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ext-schema-graph-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  createRoot(document.getElementById('root')!).render(
    <ext-schema-graph-page />
  );
}
```

- [ ] **Step 11: Build local `charon-extensions` (dependency for the next step)**

Run: `cd src/charon-extensions && npm install && npm run build`
Expected: exits 0, `dist/` contains built output.

- [ ] **Step 12: Install dependencies**

Run: `cd src/charon-schema-graph && npm install`
Expected: exits 0, no `ERESOLVE` errors (all pinned versions were already verified compatible together in the prior dependency-upgrade pass on the sibling React packages).

- [ ] **Step 13: Verify the dev server**

Run: `cd src/charon-schema-graph && npm run dev`
Open the printed local URL (e.g. `http://localhost:5173`) in a browser.
Expected: page shows the text `charon-schema-graph scaffold OK`.
Stop the dev server (Ctrl+C).

- [ ] **Step 14: Verify the production build**

Run: `cd src/charon-schema-graph && npm run build`
Expected: exits 0; `dist/index.js`, `dist/index.html`, `dist/package.json` exist; `dist/charon-schema-graph-1.0.0.tgz` exists (from `npm pack`).

- [ ] **Step 15: Verify lint**

Run: `cd src/charon-schema-graph && npm run lint`
Expected: exits 0, no errors.

- [ ] **Step 16: Commit**

```bash
git add src/charon-schema-graph
git commit -m "feat: scaffold charon-schema-graph example extension"
```

---

### Task 2: Web Component wrapper, page component, and dev harness

**Files:**
- Create: `src/charon-schema-graph/src/error.boundary.tsx`
- Create: `src/charon-schema-graph/src/reactive/use.observable.function.ts` (copied verbatim)
- Create: `src/charon-schema-graph/src/reactive/index.ts`
- Create: `src/charon-schema-graph/src/schema.graph.page.element.tsx`
- Create: `src/charon-schema-graph/src/schema.graph.page.tsx`
- Create: `src/charon-schema-graph/src/dev/dev.metadata.ts` (copied verbatim)
- Create: `src/charon-schema-graph/src/dev/dev.page.context.ts`
- Create: `src/charon-schema-graph/src/dev/index.ts`
- Modify: `src/charon-schema-graph/src/main.tsx`

**Interfaces:**
- Consumes: `ExtensionPageContext`, `GameDataService`, `Metadata`, `ObservableLike<T>`, `User`, `Project`, `Branch`, `Workspace`, `ExtensionActionContextBase`, `DataType` — all from `charon-extensions` (already available via the `file:../charon-extensions` dependency from Task 1).
- Produces:
  - `useObservable<T>(observable: ObservableLike<T>): [value: T | undefined, error: Error | undefined, completed: boolean]` from `./reactive`.
  - `ErrorBoundary` (React component, wraps `children`) from `./error.boundary`.
  - `SchemaGraphPageElement` (default export, `HTMLElement` subclass with a `context: ExtensionPageContext` setter) from `./schema.graph.page.element`.
  - `SchemaGraphPage` (default export, `(props: { context: ExtensionPageContext }) => JSX.Element`) from `./schema.graph.page` — Task 3 modifies this file's body but keeps this same signature.
  - `createDevPageContext(): ExtensionPageContext` from `./dev`.

- [ ] **Step 1: Copy `error.boundary.tsx` from conversation-editor, renaming its CSS class**

Run:
```bash
cp src/charon-conversation-editor/src/error.boundary.tsx src/charon-schema-graph/src/error.boundary.tsx
```

Then edit `src/charon-schema-graph/src/error.boundary.tsx`, replacing `ext-ce-error-container` with `ext-sg-error-container` (the source file's only extension-specific detail):

```tsx
import { Component, ErrorInfo, PropsWithChildren } from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<
    PropsWithChildren,
    ErrorBoundaryState
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error in SchemaGraph:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="ext-sg-error-container">
                    <h1>Something went wrong 😢</h1>
                    <p>We're sorry, but the schema graph failed to load.</p>
                    <pre>
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
```

(This also fixes the `"Error in ConversationEditor:"` console label and the user-facing copy to match this package.)

- [ ] **Step 2: Copy `use.observable.function.ts` verbatim**

Run:
```bash
mkdir -p src/charon-schema-graph/src/reactive
cp src/charon-conversation-editor/src/reactive/use.observable.function.ts src/charon-schema-graph/src/reactive/use.observable.function.ts
```

No edits needed — this hook is generic (`ObservableLike<T>` in, `[value, error, completed]` out), not conversation-editor-specific.

- [ ] **Step 3: Create `src/reactive/index.ts`**

```ts
export * from './use.observable.function';
```

- [ ] **Step 4: Create `src/schema.graph.page.tsx`** (temporary rendering — Task 3 replaces the list with the real graph)

```tsx
import { ExtensionPageContext } from 'charon-extensions';
import { useObservable } from './reactive';

function SchemaGraphPage({ context }: { context: ExtensionPageContext }) {
    const [metadata, error] = useObservable(context.gameData.getMetadata());

    if (error) {
        return <div className="ext-sg-message ext-sg-error">Failed to load schema metadata: {error.message}</div>;
    }
    if (!metadata) {
        return <div className="ext-sg-message">Loading schema graph…</div>;
    }
    return (
        <ul className="ext-sg-schema-list">
            {metadata.schemas.map(schema => (
                <li key={schema.id}>{schema.displayName || schema.name}</li>
            ))}
        </ul>
    );
}

export default SchemaGraphPage;
```

- [ ] **Step 5: Create `src/schema.graph.page.element.tsx`**

```tsx
import { ExtensionPageContext } from "charon-extensions";
import { createRoot, Root } from "react-dom/client";
import SchemaGraphPage from "./schema.graph.page";
import { ErrorBoundary } from "./error.boundary";

/**
 * Custom HTML Element hosting the schema graph page.
 * Charon sets the `context` property when mounting the element (per the
 * custom-routed-pages contract: the host calls `setProperty('context', pageContext)`
 * after `Renderer2.createElement('ext-schema-graph-page')`).
 *
 * @element ext-schema-graph-page
 */
export default class SchemaGraphPageElement extends HTMLElement {
    private _context?: ExtensionPageContext;
    private _root?: Root;

    get context(): ExtensionPageContext {
        return this._context!;
    }

    set context(value: ExtensionPageContext) {
        if (Object.is(value, this._context)) {
            return; // same value
        }
        this._context = value;
        this.render();
    }

    public connectedCallback() {
        this.classList.add('ext-schema-graph-page');
        this.render();
    }

    public disconnectedCallback() {
        this.unmount();
    }

    private render() {
        this._root ??= createRoot(this);

        if (this._context) {
            this._root.render(
                <ErrorBoundary>
                    <SchemaGraphPage context={this._context} />
                </ErrorBoundary>
            );
        }
    }

    private unmount() {
        if (this._root) {
            this._root.unmount();
            delete this._root;
        }
    }
}
```

- [ ] **Step 6: Copy `dev.metadata.ts` verbatim from conversation-editor**

Run:
```bash
mkdir -p src/charon-schema-graph/src/dev
cp src/charon-conversation-editor/src/dev/dev.metadata.ts src/charon-schema-graph/src/dev/dev.metadata.ts
```

No edits needed — `DevMetadata`/`DevSchema`/`DevSchemaProperty`/`DevSchemaReference`/`DevProjectSettings`/`DevSpecificationDictionary` are generic builders, not conversation-editor-specific. This file exports `DevMetadata`, `DevSchema`, `DevSchemaProperty` among others.

- [ ] **Step 7: Create `src/dev/dev.page.context.ts`**

```ts
import {
    Branch, DataType, ExtensionActionContextBase, ExtensionPageContext, ObservableLike,
    Project, User, Workspace
} from "charon-extensions";
import { delay, of } from "rxjs";
import { DevMetadata } from "./dev.metadata";

function buildDevMetadata(): DevMetadata {
    const metadata = new DevMetadata();

    metadata.defineSchema('Item', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    metadata.defineSchema('Guild', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    metadata.defineSchema('Player', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
        schema.defineSchemaProperty('Guild', DataType.Reference, property => {
            property.referenceType = metadata.referenceSchema('Guild');
        });
        schema.defineSchemaProperty('Inventory', DataType.ReferenceCollection, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
    });

    metadata.defineSchema('Recipe', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
        schema.defineSchemaProperty('Ingredients', DataType.ReferenceCollection, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
        schema.defineSchemaProperty('Result', DataType.Reference, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
    });

    // Isolated schema — no references in or out. Demonstrates that unconnected
    // schemas still render as nodes (nodes = every schema, not just connected ones).
    metadata.defineSchema('Achievement', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    return metadata;
}

const devUser: User = { id: 'dev-user', name: 'Dev User', pictureUrl: undefined };
const devWorkspace: Workspace = { id: 'dev-workspace', name: 'Dev Workspace', pictureUrl: undefined, projects: ['dev-project'] };
const devBranch: Branch = { id: 'dev-branch', name: 'main', isPrimary: true };
const devProject: Project = {
    id: 'dev-project', name: 'Dev Project', pictureUrl: undefined,
    workspaceId: devWorkspace.id, branches: [devBranch]
};

function createDevActionContextBase(): ExtensionActionContextBase {
    const devMetadata = buildDevMetadata();

    return {
        userService: {
            currentUser$: of(devUser) as unknown as ObservableLike<User>,
        },
        projectService: {
            currentProject$: of(devProject) as unknown as ObservableLike<Project>,
            currentBranch$: of(devBranch) as unknown as ObservableLike<Branch>,
        },
        workspaceService: {
            currentWorkspace$: of(devWorkspace) as unknown as ObservableLike<Workspace>,
        },
        gameData: {
            getId: () => of('dev-project') as unknown as ObservableLike<string>,
            // 300ms delay so the page's "Loading…" state is actually visible during manual verification.
            getMetadata: () => of(devMetadata).pipe(delay(300)) as unknown as ObservableLike<DevMetadata>,
            find: () => { throw new Error('find() not implemented in dev harness'); },
            query: () => { throw new Error('query() not implemented in dev harness'); },
            list: () => { throw new Error('list() not implemented in dev harness'); },
            bulkChange: () => { throw new Error('bulkChange() not implemented in dev harness'); },
            import: () => { throw new Error('import() not implemented in dev harness'); },
            export: () => { throw new Error('export() not implemented in dev harness'); },
            validate: () => { throw new Error('validate() not implemented in dev harness'); },
        },
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
                showProgress: () => { throw new Error('showProgress() not implemented in dev harness'); },
                showCustom: () => { throw new Error('showCustom() not implemented in dev harness'); },
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
        navigation: {
            dashboard: () => console.log('[dev] navigation.dashboard()'),
            settings: (section) => console.log('[dev] navigation.settings()', section),
            documentCollection: (schemaName) => console.log('[dev] navigation.documentCollection()', schemaName),
            documentForm: (schemaName, id) => console.log('[dev] navigation.documentForm()', schemaName, id),
            customPage: (packageName, pageId, restOfRoute, params) =>
                console.log('[dev] navigation.customPage()', packageName, pageId, restOfRoute, params),
            errorPage: (error, retryRoute) => console.log('[dev] navigation.errorPage()', error, retryRoute),
            back: () => console.log('[dev] navigation.back()'),
        },
    };
}

export function createDevPageContext(): ExtensionPageContext {
    return {
        ...createDevActionContextBase(),
        params: {},
        restOfRoute: [],
    };
}
```

- [ ] **Step 8: Create `src/dev/index.ts`**

```ts
export * from './dev.metadata';
export * from './dev.page.context';
```

- [ ] **Step 9: Modify `src/main.tsx`** — replace the placeholder element with the real one and wire the dev harness

Replace the entire file with:

```tsx
import { createRoot } from 'react-dom/client';
import './index.scss';
import SchemaGraphPageElement from './schema.graph.page.element';
import { createDevPageContext } from './dev';

customElements.define('ext-schema-graph-page', SchemaGraphPageElement);

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ext-schema-graph-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  const element = document.createElement('ext-schema-graph-page') as SchemaGraphPageElement;
  element.context = createDevPageContext();
  document.getElementById('root')!.replaceChildren(element);
}
```

(Setting `context` via a plain DOM property assignment — not JSX — mirrors exactly how the real Charon host mounts the page: `Renderer2.createElement` + `setProperty('context', pageContext)`, both of which are just "create the element, then set a property on it.")

- [ ] **Step 10: Verify — loading then list**

Run: `cd src/charon-schema-graph && npm run dev`
Open the printed local URL in a browser.
Expected: briefly shows "Loading schema graph…", then a bullet list: `Item`, `Guild`, `Player`, `Recipe`, `Achievement`.
Stop the dev server (Ctrl+C).

- [ ] **Step 11: Verify — error state (temporary edit, then revert)**

Temporarily edit `src/dev/dev.page.context.ts`, changing the `getMetadata` line to:

```ts
            getMetadata: () => new Observable(subscriber => { subscriber.error(new Error('dev-forced error')); }) as unknown as ObservableLike<DevMetadata>,
```

Change the `import { delay, of } from "rxjs";` line to `import { delay, Observable, of } from "rxjs";`.

Run: `cd src/charon-schema-graph && npm run dev`
Open the printed local URL.
Expected: shows `Failed to load schema metadata: dev-forced error`.
Stop the dev server (Ctrl+C).

Revert the temporary edit — restore `getMetadata` to `() => of(devMetadata).pipe(delay(300)) as unknown as ObservableLike<DevMetadata>` and the import line back to `import { delay, of } from "rxjs";`.

- [ ] **Step 12: Verify build and lint still pass**

Run: `cd src/charon-schema-graph && npm run build`
Expected: exits 0.

Run: `cd src/charon-schema-graph && npm run lint`
Expected: exits 0.

- [ ] **Step 13: Commit**

```bash
git add src/charon-schema-graph
git commit -m "feat: wire ExtensionPageContext plumbing and dev harness for schema graph page"
```

---

### Task 3: Render the actual schema graph

**Files:**
- Create: `src/charon-schema-graph/src/schema.to.graph.function.ts`
- Create: `src/charon-schema-graph/src/layout.with.dagre.function.ts`
- Create: `src/charon-schema-graph/src/schema.graph.tsx`
- Create: `src/charon-schema-graph/src/schema.graph.scss`
- Modify: `src/charon-schema-graph/src/schema.graph.page.tsx`

**Interfaces:**
- Consumes: `SchemaGraphPage({ context }: { context: ExtensionPageContext })` from Task 2 (same file, same signature, body changes); `useObservable` from `./reactive` (Task 2).
- Produces:
  - `SchemaGraphNode = Node<{ label: string }>`, `SchemaGraphEdge = Edge<Record<string, never>>`, `schemaToGraph(metadata: Metadata): { nodes: SchemaGraphNode[]; edges: SchemaGraphEdge[] }` from `./schema.to.graph.function`.
  - `layoutWithDagre(nodes: readonly SchemaGraphNode[], edges: readonly SchemaGraphEdge[]): SchemaGraphNode[]` from `./layout.with.dagre.function`.
  - `SchemaGraph` (default export, `(props: { metadata: Metadata }) => JSX.Element`) from `./schema.graph`.

- [ ] **Step 1: Create `src/schema.to.graph.function.ts`**

```ts
import { DataType, Metadata } from "charon-extensions";
import { Edge, Node } from "@xyflow/react";

/** React Flow node type for the schema graph — just a label, nothing editable. */
export type SchemaGraphNode = Node<{ label: string }>;

/** React Flow edge type for the schema graph — a plain reference link, no extra data. */
export type SchemaGraphEdge = Edge<Record<string, never>>;

/**
 * Converts project metadata into a graph: one node per schema, one edge per
 * Reference/ReferenceCollection property (Document/DocumentCollection embedding
 * is intentionally not represented — see design spec §Non-Goals).
 */
export function schemaToGraph(metadata: Metadata): { nodes: SchemaGraphNode[]; edges: SchemaGraphEdge[] } {
    const nodes: SchemaGraphNode[] = metadata.schemas.map(schema => ({
        id: schema.id,
        position: { x: 0, y: 0 },
        data: { label: schema.displayName || schema.name },
    }));

    const edges: SchemaGraphEdge[] = [];
    for (const schema of metadata.schemas) {
        for (const property of schema.properties) {
            if (property.dataType !== DataType.Reference && property.dataType !== DataType.ReferenceCollection) {
                continue;
            }
            if (!property.referenceType) {
                continue; // shouldn't happen per contract, but cheap to guard
            }
            const targetSchema = property.getReferencedSchema();
            edges.push({
                id: `${schema.id}:${property.id}`,
                source: schema.id,
                target: targetSchema.id,
            });
        }
    }

    return { nodes, edges };
}
```

- [ ] **Step 2: Create `src/layout.with.dagre.function.ts`**

```ts
import dagre from 'dagre';
import { SchemaGraphEdge, SchemaGraphNode } from './schema.to.graph.function';

// Fixed estimate — this graph is read-only and laid out once before the first
// render, so there are no `measured` dimensions from a prior render to read
// (unlike conversation-editor's AutoLayoutButton, which re-lays-out already-mounted nodes).
const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;

/** Computes a left-to-right hierarchical layout for the given nodes/edges using dagre. */
export function layoutWithDagre(nodes: readonly SchemaGraphNode[], edges: readonly SchemaGraphEdge[]): SchemaGraphNode[] {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 80, nodesep: 40 });

    for (const node of nodes) {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of edges) {
        dagreGraph.setEdge(edge.source, edge.target);
    }

    dagre.layout(dagreGraph);

    return nodes.map(node => {
        const { x, y } = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: x - NODE_WIDTH / 2,
                y: y - NODE_HEIGHT / 2,
            },
        };
    });
}
```

- [ ] **Step 3: Create `src/schema.graph.scss`**

```scss
.ext-sg-graph {
  flex: 1;
  width: 100%;
  height: 100%;
}

.ext-sg-message {
  padding: 16px;
  font-size: 14px;
  color: var(--app-color-dark-gray, #666666);
}

.ext-sg-message.ext-sg-error {
  color: var(--app-color-warn, #FF6E6E);
}

.ext-sg-error-container {
  padding: 16px;
}
```

- [ ] **Step 4: Create `src/schema.graph.tsx`**

```tsx
import '@xyflow/react/dist/style.css';
import './schema.graph.scss';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { Metadata } from 'charon-extensions';
import { useMemo } from 'react';
import { schemaToGraph } from './schema.to.graph.function';
import { layoutWithDagre } from './layout.with.dagre.function';

function SchemaGraph({ metadata }: { metadata: Metadata }) {
    const { nodes, edges } = useMemo(() => {
        const graph = schemaToGraph(metadata);
        return { nodes: layoutWithDagre(graph.nodes, graph.edges), edges: graph.edges };
    }, [metadata]);

    return (
        <div className="ext-sg-graph">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    edgesFocusable={false}
                    elementsSelectable={false}
                    attributionPosition="top-right"
                >
                    <MiniMap zoomable pannable />
                    <Controls showInteractive={false} />
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}

export default SchemaGraph;
```

- [ ] **Step 5: Modify `src/schema.graph.page.tsx`** — replace the temporary list with the real graph

Replace the entire file with:

```tsx
import { ExtensionPageContext } from 'charon-extensions';
import { useObservable } from './reactive';
import SchemaGraph from './schema.graph';

function SchemaGraphPage({ context }: { context: ExtensionPageContext }) {
    const [metadata, error] = useObservable(context.gameData.getMetadata());

    if (error) {
        return <div className="ext-sg-message ext-sg-error">Failed to load schema metadata: {error.message}</div>;
    }
    if (!metadata) {
        return <div className="ext-sg-message">Loading schema graph…</div>;
    }
    return <SchemaGraph metadata={metadata} />;
}

export default SchemaGraphPage;
```

- [ ] **Step 6: Verify — real graph renders**

Run: `cd src/charon-schema-graph && npm run dev`
Open the printed local URL.
Expected: after the brief loading state, a graph renders with 5 boxes labeled `Item`, `Guild`, `Player`, `Recipe`, `Achievement`; arrows from `Player` to `Guild` and from `Player` to `Item`; arrows from `Recipe` to `Item` (two edges: `Ingredients` and `Result`); `Achievement` sits with no edges. Layout flows left-to-right. Mouse wheel zooms, drag pans, the minimap (bottom-right by default) reflects the same layout.
Stop the dev server (Ctrl+C).

- [ ] **Step 7: Verify build and lint still pass**

Run: `cd src/charon-schema-graph && npm run build`
Expected: exits 0.

Run: `cd src/charon-schema-graph && npm run lint`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/charon-schema-graph
git commit -m "feat: render schema reference graph with dagre auto-layout"
```

---

### Task 4: README and final verification

**Files:**
- Create: `src/charon-schema-graph/README.md`

**Interfaces:**
- None — documentation-only task, plus a final end-to-end verification pass over everything Tasks 1–3 produced.

- [ ] **Step 1: Create `README.md`**

```markdown
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
          -> SchemaGraphPage             (subscribes to context.gameData.getMetadata())
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
  schema.graph.page.tsx             # Subscribes to context.gameData.getMetadata(), shows loading/error/graph
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

`SchemaGraphPage` calls `useObservable(context.gameData.getMetadata())`. `GameDataService.getMetadata()` returns an `ObservableLike<Metadata>` — the same hook pattern `charon-conversation-editor` uses for any host-provided observable.

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
```

- [ ] **Step 2: Full clean-install verification**

Run:
```bash
cd src/charon-schema-graph
rm -rf node_modules package-lock.json dist
npm install
```
Expected: exits 0, no `ERESOLVE` errors.

- [ ] **Step 3: Full build verification**

Run: `npm run build`
Expected: exits 0. Confirm `dist/package.json` contains the `config.customPages`/`config.customActions` block unchanged:

Run: `grep -A 15 '"customPages"' dist/package.json`
Expected: shows the `ext-schema-graph` page and the `side-navigation-menu` action with `pageId`, matching Task 1 Step 1's `package.json`.

- [ ] **Step 4: Full lint verification**

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 5: Final manual smoke test**

Run: `npm run dev`, open the printed URL.
Expected: loading state, then the 5-node graph, exactly as verified in Task 3 Step 6 — confirms nothing in Task 4 broke the running app.
Stop the dev server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add src/charon-schema-graph
git commit -m "docs: add charon-schema-graph README"
```
