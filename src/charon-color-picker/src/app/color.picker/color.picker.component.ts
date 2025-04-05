import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CharonPropertyEditorElement, ERROR_CUSTOM_PROPERTY as ERROR_CUSTOM, ValueControl, ValueValidatorFn } from 'charon-extensions';
import { ColorPickerService, Hsva, Rgba } from 'ngx-color-picker';
import { debounceTime, from, startWith, Subscription } from 'rxjs';

@Component({
  // Use 'ext' prefix for your components to avoid collisions with the original app
  selector: 'ext-color-picker',
  templateUrl: './color.picker.component.html',
  standalone: false,
  // Disable auto change detection to increase performance
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ext-color-picker'
  }
})
export class ColorPickerEditorComponent implements CharonPropertyEditorElement, OnDestroy {
  private _color: string;
  private _formControl!: ValueControl<any>;
  private _subscription: Subscription | undefined;

  public get color(): string {
    return this._color;
  }

  public get readOnly(): boolean {
    return this._formControl?.readOnly ?? false;
  }

  public get disabled(): boolean {
    return this._formControl?.disabled ?? false;
  }

  public get required(): boolean {
    return this._formControl?.required ?? false;
  }
  public get value(): string {
    return this._formControl?.value ?? '';
  }

  public outputFormat: 'rgba' | 'hsla' | 'hex';

  @Input()
  public get formControl(): ValueControl<any> {
    return this._formControl;
  }
  public set formControl(value: ValueControl<any>) {
    if (Object.is(this._formControl, value)) {
      return;
    }
    this._formControl = value;
    this.onFormControlChanged();
  }

  @ViewChild('colorInput')
  public readonly colorInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private readonly colorPickerService: ColorPickerService,
    private readonly сhangeDetector: ChangeDetectorRef
  ) {
    this._color = '';
    this.outputFormat = 'hex';
    this._subscription = new Subscription();
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
    delete this._subscription;
  }

  /**
   * Try to parse or decode the specified value and set it to `formControl`.
   * Do nothing if the value is the same as the current one.
   */
  public updateFormControlValue(value: string): void {
    if (!this.formControl) {
      return; // No form control is set
    }

    const hsva = this.colorPickerService.stringToHsva(value, true);
    const schemaProperty = this.formControl.schemaProperty;

    let newFormControlValue = this.formControl.value;
    let newColorValue = this._color;
    if (!hsva) {
      // Color parsing failed 

      newFormControlValue = value;
      newColorValue = '';

    } else if (typeof value === 'number') {
      newColorValue = this.formatColor(hsva);
      newFormControlValue = this.encodeColor(hsva);
    } else {
      newColorValue = this.formatColor(hsva);
      newFormControlValue = newColorValue;

    }

    if (!schemaProperty.valuesAreEquals(this.formControl.value, newFormControlValue)) {
      this.formControl.setValue(newFormControlValue);
    }
    if (this._color !== newColorValue) {
      this._color = newColorValue;
    }

    this.сhangeDetector.detectChanges();
  }

  /**
   * Event handler when `formControl` is changed.
   * In this handler, we subscribe to value/state change events and dispose of the previous `formControl` subscription.
   */
  private onFormControlChanged(): void {

    this.outputFormat = this.determineOutputFormat();

    this._subscription?.unsubscribe();
    this._subscription = new Subscription();

    const newFormControl = this.formControl;

    // React to value changes
    this._subscription.add(
      from(newFormControl.valueChanges).pipe(
        startWith(newFormControl.value),
        debounceTime(100),
      ).subscribe((value: any) => {
        const valueHsva = this.parseColorOrNull(value);
        const newColor = this.formatColor(valueHsva);
        if (this.color == newColor) {
          return; // not changed
        }

        this.updateFormControlValue(newColor)
      })
    )

    // React to validation or disable/enable changes
    this._subscription.add(
      from(newFormControl.statusChanges)
        .subscribe(_ => this.сhangeDetector.detectChanges())
    )

    // React to focus request
    this._subscription.add(newFormControl.registerDoFocus((options?: FocusOptions) => {
      const colorInputEl = this.colorInput?.nativeElement;
      if (!colorInputEl) {
        return;
      }
      setTimeout(() => {
        colorInputEl.focus(options);

        if (!options?.preventScroll) {
          colorInputEl.selectionStart = 0;
          colorInputEl.selectionEnd = colorInputEl.value?.length ?? 0;
          colorInputEl.scrollIntoView({
            block: 'center',
            inline: 'center',
          });
        }
      }, 0);
    }));

    // Add custom color validation
    const colorValidator: ValueValidatorFn = this.validateValue.bind(this);
    newFormControl.addValidators(colorValidator)
    // trigger `colorValidator` after addition
    newFormControl.updateAllValueAndValidity({ onlySelf: true });
    // Remove validator on `formControl` change
    this._subscription.add(() => newFormControl.removeValidators(colorValidator));

    this.сhangeDetector.detectChanges();
  }

  /**
   * Take HSVA color value and encode it into int32 (ARGB)
   * @returns ARGB value of color
   */
  private encodeColor(value: Hsva | null): number {
    if (!value) {
      return 0;
    }
    var rgba = this.colorPickerService.hsvaToRgba(value);
    const a = Math.max(0, Math.min(Math.round(rgba.a * 255), 255)) << 24; // Alpha (shifted to the highest byte)
    const r = rgba.r << 16; // Red (shifted to second-highest byte)
    const g = rgba.g << 8;  // Green (shifted to second-lowest byte)
    const b = rgba.b;       // Blue (lowest byte)
    return (a | r | g | b) | 0;
  }
  /**
   * Take HSVA color value and format it as a string in `outputFormat` format
   * @returns String formatted color value
   */
  private formatColor(value: Hsva | null): string {
    return value ? this.colorPickerService.outputFormat(value, this.outputFormat, null) : ''
  }
  /**
   * Try to parse a string color value or decode an int32 ARGB color value and return an HSVA color.
   * @returns HSVA color value or null if parsing failed.
   */
  private parseColorOrNull(value: any): Hsva | null {
    let parsedHsva: Hsva | null = null;
    if (typeof value === 'number') {
      const argbInteger = this.formControl.schemaProperty.convertFrom(value) | 0;
      var rgba: Rgba = {
        r: (argbInteger >> 16) & 0xFF,         // Extract red
        g: (argbInteger >> 8) & 0xFF,          // Extract green
        b: argbInteger & 0xFF,                 // Extract blue
        a: ((argbInteger >> 24) & 0xFF) / 255, // Extract alpha and normalize to [0,1]
      };
      parsedHsva = this.colorPickerService.rgbaToHsva(rgba);
    } else {
      parsedHsva = this.colorPickerService.stringToHsva(value + '', true);
    }
    return parsedHsva;
  }

  /**
   * Validate color value
   */
  private validateValue(control: ValueControl): Object | null {
    if (this.parseColorOrNull(control.value)) {
      return null; // valid
    }
    return {
      // ERROR_CUSTOM errors displayed as-is
      [ERROR_CUSTOM]: `Invalid value for color in ${this.outputFormat.toUpperCase()} format.`
    };
  }

  /**
   * Determine output format for current `formControl` or return default `hex` format.
   */
  private determineOutputFormat() {
    let outputFormat: typeof this.outputFormat = 'hex';
    for (const format of this.formControl.schemaProperty.getSpecification().get('format') ?? []) {
      switch (format) {
        case 'rgba':
          outputFormat = 'rgba';
          break;
        case 'hsla':
          outputFormat = 'hsla';
          break;
        case 'hex':
        default:
          outputFormat = 'hex';
          break;
      }
    }
    return outputFormat;
  }
}