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
  "main": "main.js",
  "files": [
    "styles.css"
  ],
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build && node -e \"require('fs').copyFileSync('package.json','dist/browser/package.json')\" && cd dist/browser && npm pack",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.2.5",
    "@angular/cli": "^19.2.5",
    "@angular/compiler-cli": "^19.2.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.7.2"
  },
  "dependencies": {
    "@angular/common": "^19.2.0",
    "@angular/compiler": "^19.2.0",
    "@angular/core": "^19.2.0",
    "@angular/elements": "^19.2.4",
    "@angular/forms": "^19.2.0",
    "@angular/platform-browser": "^19.2.0",
    "@angular/platform-browser-dynamic": "^19.2.0",
    "@webcomponents/custom-elements": "^1.6.0",
    "charon-extensions": "2.416.496",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  }
}
