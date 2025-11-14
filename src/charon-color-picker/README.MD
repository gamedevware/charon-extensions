# Charon Extension – Color Picker (Angular)

This is an example **Angular**-based UI extension for [Charon](https://github.com/gamedevware/charon), implemented as a **Web Component**.

## 🔧 What is This?

An Angular app that compiles to a custom element (`ext-color-picker-editor`) used as a field editor in Charon for `Text` data type values (e.g., HEX colors).

## 🛠️ Build

```bash
npm install
npm run build
```

The compiled output will be in the `dist/` folder.

## 📦 Package for NPM

```bash
npm run build
# > dist/browser/charon-color-picker-1.0.X.tgz
```

This generates a `.tgz` file that can be imported into Charon for testing.

## 📘 Full Guide

See step-by-step instructions here:  
[Creating Angular-based UI Extension](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
