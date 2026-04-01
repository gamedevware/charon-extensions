# __EDITOR_NAME__

A custom property editor extension for [Charon](https://github.com/gamedevware/charon) built with Angular 19 and Angular Elements.

## Getting Started

```bash
npm install
npm start       # ng serve — launches dev server at http://localhost:4200
```

## Building

```bash
npm run build
```

Produces `dist/browser/main.js` and a packed `__PACKAGE_NAME__-1.0.0.tgz`.

> **Tip for debugging:** Set `"optimization": false` in `angular.json` under `configurations.production`
> to get readable source maps. Remember to re-enable it before publishing.

## Testing in Charon (without publishing to npm)

Place the `.tgz` file from `dist/browser/` in the Charon extensions folder for your platform:

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
3. `cd dist/browser && npm publish`
4. Add the package name to `Project Settings → Extensions` in Charon

## Customising the Editor

1. Replace `src/app/editor/editor.component.html` with your UI
2. Subscribe to `valueControl.valueChanges` in `onValueControlChanged()` to react to Charon data changes
3. Call `this.valueControl.setValue(newValue)` to write values back to Charon
4. Update `config.customEditors[0].dataTypes` in `package.json` to match your target field types

## References

- [Charon Extension Guide (Angular)](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [charon-extensions API](https://www.npmjs.com/package/charon-extensions)
- [Angular Elements Guide](https://angular.dev/guide/elements)
