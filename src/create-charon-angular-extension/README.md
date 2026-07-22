# create-charon-angular-extension

Node CLI that scaffolds a minimal, already-wired **Angular** [Charon](https://github.com/gamedevware/charon) **Property/Grid** field editor extension — the `charon-color-picker` pattern (zoneless Angular Elements bridge), without the color-picker-specific code. No production dependencies; only uses Node's `fs`/`path`/`readline`.

For **Schema** editors (full-document) or **Custom Pages**, there is no scaffolder — copy `../charon-conversation-editor` or `../charon-schema-graph` instead and adapt (both are React; there is no Angular Schema/Custom-Page example in this repo yet).

## Usage

```bash
node index.js my-color-picker      # name as an argument
node index.js                      # or omit it — prompted interactively
```

This creates `./my-color-picker/` (relative to the current working directory, **not** this package's directory) and prints next steps (`cd my-color-picker && npm install && npm start`).

This package is not published to npm. To use the bare `create-charon-angular-extension <name>` command form (instead of `node index.js <name>`), run `npm link` from within this folder.

Name rules (enforced by `validateName` in `scaffold.js`): lowercase letters, digits, and hyphens only; cannot start or end with a hyphen (e.g. `my-color-picker`, `tooltip`).

## How Scaffolding Works

`index.js` is the CLI shell (arg parsing, prompting, target-directory creation/cleanup). `scaffold.js` is the pure logic, unit-tested by `scaffold.test.js` (`npm test`):

1. `deriveNames(packageName)` derives every identifier the template needs from the one name the user gives, e.g. for `my-color-picker`:
   | Placeholder | Value | Used for |
   |---|---|---|
   | `__PACKAGE_NAME__` | `my-color-picker` | npm package name |
   | `__ELEMENT_NAME__` | `ext-my-color-picker-editor` | custom element tag, registered via `customElements.define` in `ngDoBootstrap` |
   | `__CLASS_NAME__` | `MyColorPickerEditorComponent` | the Angular component class |
   | `__EDITOR_ID__` | `ext-my-color-picker` | `config.customEditors[].id` |
   | `__EDITOR_NAME__` | `My Color Picker` | display name shown in Charon's UI |
2. `copyDir(templateDir, targetDir, vars)` walks `template/` recursively:
   - `*.tpl` files: read, replace every `__PLACEHOLDER__` token, write without the `.tpl` suffix.
   - `dot.*` files (e.g. `dot.gitignore`, `dot.editorconfig`, `dot.browserslistrc`): renamed to start with `.` (npm refuses to publish literal dotfiles inside a package's `files`, so the template stores them escaped).
   - Everything else: copied byte-for-byte.

If you need a new placeholder, add it to both `deriveNames` and the `vars` map in `scaffoldProject`, then reference it in any `.tpl` file.

## Template Contents (`template/`)

```
README.md.tpl               # Generated project's README — build/publish/customize instructions
package.json.tpl             # config.customEditors entry pre-filled with type: ["Property","Grid"]
angular.json.tpl, tsconfig*.json, dot.editorconfig, dot.browserslistrc, dot.gitignore
src/
  main.ts                    # platformBrowser().bootstrapModule(AppModule)
  polyfills.ts, styles.scss, index.html.tpl
  app/
    app.module.ts.tpl        # No bootstrap component. Zoneless providers
                              #   (provideExperimentalZonelessChangeDetection). ngDoBootstrap() calls
                              #   createCustomElement(__CLASS_NAME__, ...) and customElements.define(__ELEMENT_NAME__, ...)
    editor/
      editor.module.ts.tpl   # Declares/exports the editor component
      editor.component.ts.tpl    # Implements CharonPropertyEditorElement (@Input valueControl),
                                  #   OnPush change detection, host class __ELEMENT_NAME__, manual
                                  #   ChangeDetectorRef.detectChanges() calls, TODO-commented
                                  #   subscription/focus-handler wiring
      editor.component.html.tpl  # Placeholder template
      editor.component.scss
```

**Component selector vs. custom element tag are intentionally different** (`ext-__PACKAGE_NAME__` vs `__ELEMENT_NAME__` = `ext-__PACKAGE_NAME__-editor`) — using the same string for both causes double-initialization. Both `app.module.ts.tpl` and `editor.component.ts.tpl` have comments calling this out; don't remove the distinction when customizing.

The generated project targets **field-level editors only** — `config.customEditors[].type: ["Property", "Grid"]`. After scaffolding, the generated project's own README walks through wiring `valueControl.valueChanges`, calling `setValue()`, changing `dataTypes` to match the target field type, and the build/publish/local-testing flow (`.tgz` from `dist/browser/`, dropping it into Charon's platform-specific extensions folder, version bumping).

## Testing This Tool

```bash
npm test   # node --test scaffold.test.js — unit tests for validateName/deriveNames/substitute/scaffoldProject
```

## Resources

- [Creating a Custom Editor with Angular](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [charon-extensions API](../charon-extensions/README.md)
- [Angular Elements](https://angular.dev/guide/elements)
- [Charon Repository](https://github.com/gamedevware/charon)

## License

MIT
