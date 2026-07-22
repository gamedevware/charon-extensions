{
  "$schema": "https://raw.githubusercontent.com/gamedevware/charon-extensions/refs/heads/main/package.json.schema.json",
  "name": "__PACKAGE_NAME__",
  "version": "1.0.0",
  "description": "__EDITOR_NAME__ editor extension for Charon",
  "keywords": [
    "charon",
    "extensions"
  ],
  "author": "",
  "license": "MIT",
  "config": {
    "customEditors": [
      {
        "id": "__EDITOR_ID__",
        "selector": "__ELEMENT_NAME__",
        "name": "__EDITOR_NAME__",
        "type": [
          "Property",
          "Grid"
        ],
        "dataTypes": [
          "Text"
        ]
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
    "build": "tsc -b && vite build && cd dist && npm pack",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "charon-extensions": "2.378.450",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "rxjs": "^7.8.0",
    "sass": "^1.86.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^18.3.28",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  }
}
