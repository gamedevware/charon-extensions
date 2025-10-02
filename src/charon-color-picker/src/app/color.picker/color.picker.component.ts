import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CharonPropertyEditorElement, ERROR_CUSTOM_PROPERTY as ERROR_CUSTOM, ValueControl, ValueValidatorFn } from 'charon-extensions';
import { ColorPickerService, Hsva, Rgba } from 'ngx-color-picker';
import { debounceTime, from, startWith, Subscription } from 'rxjs';
import { ColorOutputFormat, determineOutputFormat, encodeColor, formatColor, parseColorOrNull } from './color.functions';

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
  private _valueControl!: ValueControl<any>;
  private _subscription: Subscription | undefined;

  public get color(): string {
    return this._color;
  }

  public get readOnly(): boolean {
    return this._valueControl?.readOnly ?? false;
  }

  public get disabled(): boolean {
    return this._valueControl?.disabled ?? false;
  }

  public get required(): boolean {
    return this._valueControl?.required ?? false;
  }
  public get value(): string {
    return this._valueControl?.value ?? '';
  }

  public outputFormat: ColorOutputFormat;

  @Input()
  public get valueControl(): ValueControl<any> {
    return this._valueControl;
  }
  public set valueControl(value: ValueControl<any>) {
    if (Object.is(this._valueControl, value)) {
      return;
    }
    this._valueControl = value;
    this.onValueControlChanged();
  }

  @ViewChild('colorInput')
  public readonly colorInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private readonly colorPickerService: ColorPickerService,
    private readonly changeDetector: ChangeDetectorRef
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
   * Try to parse or decode the specified value and set it to `valueControl`.
   * Do nothing if the value is the same as the current one.
   */
  public updateFormControlValue(value: string): void {
    if (!this.valueControl) {
      return; // No form control is set
    }

    const hsva = this.colorPickerService.stringToHsva(value, true);
    const schemaProperty = this.valueControl.schemaProperty;

    let newFormControlValue = this.valueControl.value;
    let newColorValue = this._color;
    if (!hsva) {
      // Color parsing failed 

      newFormControlValue = value;
      newColorValue = '';

    } else if (typeof value === 'number') {
      newColorValue = formatColor(hsva, this.outputFormat, this.colorPickerService);
      newFormControlValue = encodeColor(hsva, this.colorPickerService);
    } else {
      newColorValue = formatColor(hsva, this.outputFormat, this.colorPickerService);
      newFormControlValue = newColorValue;
    }

    if (!schemaProperty.valuesAreEquals(this.valueControl.value, newFormControlValue)) {
      this.valueControl.setValue(newFormControlValue);
    }
    if (this._color !== newColorValue) {
      this._color = newColorValue;
    }

    this.changeDetector.detectChanges();
  }

  /**
   * Event handler when `valueControl` is changed.
   * In this handler, we subscribe to value/state change events and dispose of the previous `valueControl` subscription.
   */
  private onValueControlChanged(): void {

    this.outputFormat = determineOutputFormat(this.valueControl.schemaProperty.getSpecification());

    this._subscription?.unsubscribe();
    this._subscription = new Subscription();

    const newValueControl = this.valueControl;

    // React to value changes
    this._subscription.add(
      from(newValueControl.valueChanges).pipe(
        startWith(newValueControl.value),
        debounceTime(100),
      ).subscribe((value: any) => {
        const valueHsva = parseColorOrNull(value, this.colorPickerService);
        const newColor = formatColor(valueHsva, this.outputFormat, this.colorPickerService);
        if (this.color == newColor) {
          return; // not changed
        }

        this.updateFormControlValue(newColor)
      })
    )

    // React to validation or disable/enable changes
    this._subscription.add(
      from(newValueControl.statusChanges)
        .subscribe(_ => this.changeDetector.detectChanges())
    )

    // React to focus request
    this._subscription.add(newValueControl.registerDoFocus((options?: FocusOptions) => {
      const colorInputEl = this.colorInput?.nativeElement;
      setTimeout(() => colorInputEl?.focus(options), 0);
    }));

    // Add custom color validation
    const colorValidator: ValueValidatorFn = this.validateValue.bind(this);
    newValueControl.addValidators(colorValidator)
    // trigger `colorValidator` after addition
    newValueControl.updateAllValueAndValidity({ onlySelf: true });
    // Remove validator on `valueControl` change
    this._subscription.add(() => newValueControl.removeValidators(colorValidator));

    this.changeDetector.detectChanges();
  }

  /**
   * Validate color value
   */
  private validateValue(control: ValueControl): Object | null {
    if (parseColorOrNull(control.value, this.colorPickerService)) {
      return null; // valid
    }
    return {
      // ERROR_CUSTOM errors displayed as-is
      [ERROR_CUSTOM]: `Invalid value for color in ${this.outputFormat.toUpperCase()} format.`
    };
  }
}