import { Injector, NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { __CLASS_NAME__ } from './editor/editor.component';
import { EditorModule } from './editor/editor.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    EditorModule,
  ],
  // Disable zone.js to avoid conflicts with Charon's zone
  providers: [provideExperimentalZonelessChangeDetection()],
  // No bootstrap component — custom element registered in ngDoBootstrap
  bootstrap: []
})
export class AppModule {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap() {
    const ngElement = createCustomElement(__CLASS_NAME__, { injector: this.injector });
    // IMPORTANT: Do NOT use the Angular component's selector here.
    // The custom element tag and the component selector must be different.
    customElements.define('__ELEMENT_NAME__', ngElement);
  }
}
