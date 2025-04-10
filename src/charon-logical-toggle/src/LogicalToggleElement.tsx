import { ValueControl } from "charon-extensions";
import { createRoot } from 'react-dom/client';
import { LogicalToggle } from "./LogicalToggle";
import { BehaviorSubject, filter, from, map, startWith, Subscription } from "rxjs";


class LogicalToggleElement extends HTMLElement {
  private _valueControl?: ValueControl;
  private _subscription?: Subscription;

  public logicalValue$: BehaviorSubject<boolean>;
  public disabledState$: BehaviorSubject<boolean>;

  // Define the getter
  get valueControl() {
    return this._valueControl;
  }

  // Define the setter
  set valueControl(value) {
    this._valueControl = value;
    this.onValueControlChanged();
  }

  constructor() {
    super();
    this.logicalValue$ = new BehaviorSubject(false);
    this.disabledState$ = new BehaviorSubject(false);
  }

  public connectedCallback() {
    this.classList.add('ext-logical-toggle');
    const root = createRoot(this);
    root.render(<LogicalToggle value$={this.logicalValue$} disabledState$={this.disabledState$} onValueChange={this.onLogicalValueChange.bind(this)} />);
  }

  private onLogicalValueChange(newValue: boolean) {
    if (this._valueControl && this._valueControl.value !== newValue) {
      this._valueControl.setValue(newValue);
    }
    if (this.logicalValue$.value !== newValue) {
      this.logicalValue$.next(newValue);
    }
  }

  private onValueControlChanged() {
    this._subscription?.unsubscribe();
    delete this._subscription;

    const newValueControl = this._valueControl;
    if (!newValueControl) {
      return;
    }

    // React to value changes
    this._subscription = from(newValueControl.valueChanges)
      .pipe(
        startWith(!!newValueControl.value), // BUG: this example will not properly handle `null` value, erasing it with `false`
        filter(logicalValue => logicalValue !== this.logicalValue$.value))
      .subscribe(this.logicalValue$);

    // React to validation or disable/enable changes
    this._subscription.add(
      from(newValueControl.statusChanges)
        .pipe(
          map(() => newValueControl.disabled),
          startWith(newValueControl.disabled),
          filter(disabled => disabled !== this.disabledState$.value))
        .subscribe(this.disabledState$)
    )

    // React to focus request
    this._subscription.add(newValueControl.registerDoFocus((options?: FocusOptions) => {
      const input = this.shadowRoot?.querySelector("input, [tabindex]:not([tabindex='-1'])") as HTMLElement | null;
      setTimeout(() => input?.focus(options), 0);
    }));
  }
}

export default LogicalToggleElement;