# Charon Color Picker Extension (Angular)

A color picker field editor for [Charon](https://gamedevware.com/), built with Angular and [ngx-color-picker](https://www.npmjs.com/package/ngx-color-picker). Supports HEX, RGBA, and HSLA output formats.

## Quick Start

```bash
npm install
npm start       # ng serve
npm run build   # Produces dist/browser/*.tgz for publishing
npm test        # Karma + Jasmine
```

## Try It in Charon

1. Go to **Project Settings > Extensions**, add `charon-color-picker`, click **Update**.
2. Create or edit a schema property with `Text` (or `Integer` for HEX) data type.
3. In the property's specification, set `customEditor=ext-color-picker-hex` (or `ext-color-picker-hsla` / `ext-color-picker-rgba`).
4. Open a document — the color picker replaces the default text field.

To test a local build: **Project Settings > Extensions > Upload NPM Package**, select the `.tgz` from `dist/browser/`.

## Architecture

```
Charon host application (Angular + zone.js)
  -> <ext-color-picker-editor>     (custom element, registered in AppModule.ngDoBootstrap)
    -> Angular app                 (zoneless, provideExperimentalZonelessChangeDetection)
      -> ColorPickerEditorComponent
        -> ngx-color-picker        (color swatch + popup)
        -> ValueControl            (two-way sync with Charon's data model)
```

### Zoneless Angular

Charon itself is an Angular application with zone.js. Extension Angular apps **must use zoneless change detection** (`provideExperimentalZonelessChangeDetection()`) to avoid conflicts with the host app's zone. The component uses `OnPush` change detection and calls `ChangeDetectorRef.detectChanges()` explicitly when reacting to `ValueControl` events.

### Custom Element Registration

`AppModule` has no bootstrap component. Instead, `ngDoBootstrap()` uses `@angular/elements` to create a custom element from `ColorPickerEditorComponent` and registers it as `ext-color-picker-editor`. The component selector (`ext-color-picker`) is intentionally different from the custom element tag to avoid double initialization.

### Extension Registration (package.json)

The extension registers three editor variants using the same custom element but different specification parameters:

```jsonc
{
  "config": {
    "customEditors": [
      {
        "id": "ext-color-picker-hex",
        "selector": "ext-color-picker-editor",
        "name": "Color Picker (Hex)",
        "specification": "format=hex",       // passed via SchemaProperty.getSpecification()
        "type": ["Property", "Grid"],         // field-level editor (not full document)
        "dataTypes": ["Text", "Integer"]      // Integer stores ARGB as int32
      },
      {
        "id": "ext-color-picker-hsla",
        "selector": "ext-color-picker-editor",
        "name": "Color Picker (HSLA)",
        "specification": "format=hsla",
        "type": ["Property", "Grid"],
        "dataTypes": ["Text"]
      },
      {
        "id": "ext-color-picker-rgba",
        "selector": "ext-color-picker-editor",
        "name": "Color Picker (RGBA)",
        "specification": "format=rgba",
        "type": ["Property", "Grid"],
        "dataTypes": ["Text"]
      }
    ]
  }
}
```

The `specification` field is how the same `<ext-color-picker-editor>` element serves multiple formats — the component reads `format` from the property's `SpecificationDictionary` at runtime via `determineOutputFormat()`.

## Project Structure

```
src/
  main.ts                       # Bootstrap: platformBrowser().bootstrapModule(AppModule)
  polyfills.ts                  # Polyfills (empty by default)
  styles.sass                   # Global styles
  index.html                    # Dev server HTML shell

  app/
    app.module.ts               # Root module: zoneless providers, ngDoBootstrap custom element registration
    color.picker/
      color.picker.module.ts    # Feature module: declares component, imports ngx-color-picker
      color.picker.component.ts # Main component implementing CharonPropertyEditorElement
      color.picker.component.html  # Template: color swatch trigger + text input
      color.picker.component.scss  # Component styles
      color.functions.ts        # Color conversion utilities (parse, format, encode ARGB int32)
```

## Key Integration Points

### CharonPropertyEditorElement

`ColorPickerEditorComponent` implements `CharonPropertyEditorElement`. Charon sets the `valueControl` input when mounting the element. The component:

1. Subscribes to `valueControl.valueChanges` and `statusChanges` to react to external changes
2. Calls `valueControl.setValue()` when the user picks a color
3. Registers a focus handler via `valueControl.registerDoFocus()`
4. Adds a custom validator that checks color format validity, reporting errors via `ERROR_CUSTOM`

### Color Format Handling

The output format (hex/rgba/hsla) is determined from the property's specification string at runtime. For `Integer` data type, colors are encoded/decoded as ARGB int32 values. All internal color math uses ngx-color-picker's HSVA representation.

| Format | DataType | Stored Value Example |
|--------|----------|---------------------|
| hex | Text | `#FF5733` |
| hex | Integer | `-10794317` (ARGB int32) |
| rgba | Text | `rgba(255, 87, 51, 1)` |
| hsla | Text | `hsla(13, 100%, 60%, 1)` |

### Subscription Management

All subscriptions (value changes, status changes, focus handler, validator cleanup) are collected into a single `Subscription` and torn down in `ngOnDestroy` or when `valueControl` is reassigned. This prevents leaks when Charon swaps the control (e.g., navigating between documents).

## Resources

- [Creating a Custom Editor with Angular](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [Charon Extensions Overview](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [ngx-color-picker](https://www.npmjs.com/package/ngx-color-picker)
- [Angular Elements](https://angular.dev/guide/elements)
- [Charon Repository](https://github.com/gamedevware/charon)

## License

MIT
