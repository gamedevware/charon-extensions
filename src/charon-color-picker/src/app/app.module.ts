import { Injector, NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ColorPickerEditorComponent } from './color.picker/color.picker.component';
import { ColorPickerModule } from './color.picker/color.picker.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    ColorPickerModule,
  ],
   // disable default zones.js and change detection
  providers: [provideExperimentalZonelessChangeDetection()],

  // remove default bootstrap component here
  bootstrap: [] 
})
export class AppModule {
  constructor(private readonly injector: Injector) {

  }

  // Required for webpack dynamic loading
  ngDoBootstrap() {
    // Convert Angular component to custom element
    const ngElement = createCustomElement(ColorPickerEditorComponent, { injector: this.injector });

    // Define the custom element in the browser registry
    // DO NOT USE original component's selector to avoid double initialization bugs etc.
    customElements.define('ext-color-picker-editor', ngElement);
  }
}
