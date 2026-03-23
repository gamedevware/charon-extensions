# Charon Logical Toggle Extension (React)

A toggle switch field editor for [Charon](https://gamedevware.com/), replacing the default dropdown for `Logical` (boolean) properties. Built with React and [react-toggle](https://www.npmjs.com/package/react-toggle).

## Quick Start

```bash
npm install
npm run dev     # Vite dev server
npm run build   # Produces dist/*.tgz for publishing
npm run lint    # ESLint
```

## Try It in Charon

1. Go to **Project Settings > Extensions**, add `charon-logical-toggle`, click **Update**.
2. Create or edit a schema property with `Logical` data type.
3. In the property's specification, set `customEditor=ext-logical-toggle`.
4. Open a document — the toggle replaces the default dropdown.

To test a local build: **Project Settings > Extensions > Upload NPM Package**, select the `.tgz` from `dist/`.

## Architecture

```
Charon host application
  -> <ext-logical-toggle-editor>   (custom element, registered in main.tsx)
    -> React app                   (mounted via createRoot inside the custom element)
      -> LogicalToggle             (react-toggle component bound to ValueControl)
```

This is the simplest extension pattern — a good starting point for building your own property editors.

### Custom Element Bridge

`LogicalToggleElement` extends `HTMLElement` and implements `CharonPropertyEditorElement`. When Charon sets the `valueControl` property, the element mounts a React tree inside itself using `createRoot`. On disconnect, the React root is unmounted.

### Extension Registration (package.json)

```jsonc
{
  "config": {
    "customEditors": [{
      "id": "ext-logical-toggle",
      "selector": "ext-logical-toggle-editor",  // custom element tag name
      "name": "Logical Toggle",
      "type": ["Property", "Grid"],              // field-level editor
      "dataTypes": ["Logical"]                    // boolean values only
    }]
  }
}
```

## Project Structure

```
src/
  main.tsx                          # Entry point: registers custom element, dev mode bootstrap
  LogicalToggleElement.tsx          # Web Component bridge (HTMLElement -> React)
  LogicalToggle.tsx                 # React component: react-toggle bound to ValueControl
  focus.component.input.function.ts # Helper: finds and focuses the <input> inside a class component
  index.scss                        # Global styles
  react.toggle.scss                 # react-toggle style overrides

  reactive/                         # React hooks for charon-extensions reactive types
    use.observable.function.ts      #   Hook: subscribes to ObservableLike<T>
    use.control.value.function.ts   #   Hook: tracks ValueControl.value, returns [value, setter]
    use.control.disabled.status.function.ts
    use.control.read.only.status.function.ts
    use.debounce.function.ts
```

## Key Integration Points

### ValueControl Binding

`LogicalToggle` uses two custom hooks to stay in sync with Charon:

- `useControlValue(valueControl)` — returns `[checked, setChecked]`. Subscribes to `valueChanges` and calls `setValue()` on the control when the user toggles.
- `useControlDisabledStatus(valueControl)` — tracks the control's disabled state.

### Focus Handling

The component registers a focus handler via `valueControl.registerDoFocus()` so Charon can programmatically focus the toggle (e.g., when navigating validation errors). Since `react-toggle` is a class component, `focusComponentInput` uses `findDOMNode` to locate the underlying `<input>`.

### Development Mode

`npm run dev` renders the custom element directly into a `#root` div (no Charon needed). No mock `ValueControl` is provided in dev mode — the toggle renders in its default uncontrolled state.

## Resources

- [Creating a Custom Editor with React](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [Charon Extensions Overview](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [react-toggle](https://www.npmjs.com/package/react-toggle)
- [Charon Repository](https://github.com/gamedevware/charon)

## License

MIT
