# Charon UI Extensions

This repository contains example projects for building **custom UI extensions** for [Charon](https://github.com/gamedevware/charon), a data modeling and game data editing tool.  
Charon supports a plugin architecture using **Web Components** packaged as **NPM modules**, allowing developers to integrate custom field, grid, or schema editors.

## 📦 Repository Structure

This repository includes both **React** and **Angular** implementations of custom field editors, along with shared type definitions:

```
/src
├── charon-extensions/           # 🛠️ Base types and utilities for building extensions
├── charon-logical-toggle/       # ⚛️ React-based Logical Toggle field editor
└── charon-color-picker/         # 🅰️ Angular-based Color Picker (HEX) editor
```

---

## 🧩 Available Examples

### 🔘 Logical Toggle (React)

A toggle button field editor for Boolean values (`Logical` type), written in **React** and compiled as a Web Component.

📁 [View Source Code](https://github.com/gamedevware/charon-extensions/tree/main/src/charon-logical-toggle)

### 🎨 Color Picker (Angular)

A color input component supporting HEX and RGBA values, written in **Angular**, registered as a custom field editor for the `Text` data type.

📁 [View Source Code](https://github.com/gamedevware/charon-extensions/tree/main/src/charon-color-picker)

### 🔧 Extension Base Types

Shared TypeScript interfaces and helper definitions for implementing Charon-compatible extensions.

📁 [View Source Code](https://github.com/gamedevware/charon-extensions/tree/main/src/charon-extensions)

---

## 📤 Building and Publishing

To build and publish an extension as an NPM package:

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

cd dist/browser # Angular
# or
cd dist # React

npm publish
```

Once packaged and Published to NPM, extensions can be added in Charon in:
```
Project Settings → Extensions
```

---

## 📚 Learn More

- [Creating a Custom Editor with React](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [Creating a Custom Editor with Angular](https://gamedevware.github.io/charon/advanced/extensions/creating_angular_extension.html)
- [Charon UI Extensions Documentation](https://gamedevware.github.io/charon/advanced/extensions/overview.html)
- [Charon Main Repository](https://github.com/gamedevware/charon)

---

## 🧑‍💻 Contributing

Feel free to fork this repository or open pull requests with improvements, new example editors, or bug fixes.

---

## 📝 License

[MIT](LICENSE)

---