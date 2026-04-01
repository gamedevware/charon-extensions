import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import { CharonPropertyEditorElement, ValueControl } from 'charon-extensions';
import { Subscription } from 'rxjs';

@Component({
  // IMPORTANT: This selector must be different from the custom element tag name ('__ELEMENT_NAME__').
  // Using the same name causes double-initialization bugs.
  selector: 'ext-__PACKAGE_NAME__',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  standalone: false,
  // OnPush required for performance — Charon manages change detection externally
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': '__ELEMENT_NAME__'
  }
})
export class __CLASS_NAME__ implements CharonPropertyEditorElement, OnDestroy {
  private _valueControl!: ValueControl<any>;
  private _subscription: Subscription | undefined;

  public get readOnly(): boolean { return this._valueControl?.readOnly ?? false; }
  public get disabled(): boolean { return this._valueControl?.disabled ?? false; }
  public get required(): boolean { return this._valueControl?.required ?? false; }

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

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
    delete this._subscription;
  }

  /**
   * Called when Charon assigns a new valueControl.
   * Set up subscriptions to value/status changes here.
   */
  private onValueControlChanged(): void {
    this._subscription?.unsubscribe();
    this._subscription = new Subscription();

    // TODO: Subscribe to value changes. Example:
    // this._subscription.add(
    //   from(this._valueControl.valueChanges).subscribe(value => {
    //     // Update local state from valueControl
    //     this.changeDetector.detectChanges();
    //   })
    // );
    //
    // TODO: Subscribe to status changes. Example:
    // this._subscription.add(
    //   from(this._valueControl.statusChanges).subscribe(() => {
    //     this.changeDetector.detectChanges();
    //   })
    // );
    //
    // TODO: Register focus handler. Example:
    // this._subscription.add(
    //   this._valueControl.registerDoFocus((options?: FocusOptions) => {
    //     this.inputEl?.nativeElement?.focus(options);
    //   })
    // );

    this.changeDetector.detectChanges();
  }
}
