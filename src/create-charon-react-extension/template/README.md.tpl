# __EDITOR_NAME__

A custom property editor extension for [Charon](https://github.com/gamedevware/charon) built with React 18 and Vite.

## Getting Started

```bash
npm install
npm run dev     # Vite dev server at http://localhost:5173
```

## Building

```bash
npm run build
```

Produces `dist/index.js`, `dist/assets/index.css`, and `dist/__PACKAGE_NAME__-1.0.0.tgz`.

> **Tip for debugging:** Add `minify: false` to `vite.config.ts` under `build:` to get readable output.
> Remember to remove it before publishing.

## Testing in Charon (without publishing to npm)

Place the `.tgz` file from `dist/` in the Charon extensions folder for your platform:

| Platform       | Path |
|----------------|------|
| Windows        | `%PROGRAMDATA%\Charon\extensions\` |
| macOS          | `/Users/<username>/.config/Charon/extensions/` |
| Linux          | `/home/<username>/.config/Charon/extensions/` |
| Unity          | `<project-directory>/Library/Charon/extensions/` |
| Unreal Engine  | `<project-directory>/Intermediate/Charon/extensions/` |

> **Important:** Always increment the `version` field in `package.json` between builds.
> Charon uses the version to detect updates — if the version stays the same, the extension will not be reloaded.

## Publishing

1. Increment `version` in `package.json`
2. Run `npm run build`
3. `cd dist && npm publish`
4. Add the package name to `Project Settings → Extensions` in Charon

## Customising the Editor

1. Replace the `<input>` in `src/Editor.tsx` with your actual UI
2. `useControlValue(valueControl)` — reactive read/write of the Charon field value
3. `useControlDisabledStatus(valueControl)` — reactive disabled state
4. `useControlReadOnlyStatus(valueControl)` — import from `./reactive` if needed
5. `valueControl.registerDoFocus(fn)` — wire keyboard focus in a `useEffect`
6. Update `config.customEditors[0].dataTypes` in `package.json` to match your target field type

## References

- [Charon Extension Guide (React)](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [charon-extensions API](https://www.npmjs.com/package/charon-extensions)
- [Vite docs](https://vite.dev)
