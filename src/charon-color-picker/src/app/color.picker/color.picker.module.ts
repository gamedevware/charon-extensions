import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ColorPickerEditorComponent } from './color.picker.component';
import { ColorPickerComponent, ColorPickerDirective, ColorPickerService } from 'ngx-color-picker';

@NgModule({
  declarations: [ColorPickerEditorComponent],
  imports: [BrowserModule, ColorPickerComponent, ColorPickerDirective],
  exports: [ColorPickerEditorComponent],
  providers: [ColorPickerService],
})
export class ColorPickerModule {

}
