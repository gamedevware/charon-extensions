import { ValueControl, CharonPropertyEditorElement } from "charon-extensions";
import { createRoot, Root } from 'react-dom/client';
import LogicalToggle from "./LogicalToggle";
import Toggle from "react-toggle";

class LogicalToggleElement extends HTMLElement implements CharonPropertyEditorElement {
  private _valueControl?: ValueControl<boolean>;
  private _root?: Root;

  // Define the getter
  get valueControl(): ValueControl<boolean> {
    return this._valueControl!;
  }

  // Define the setter
  set valueControl(value: ValueControl<boolean>) {
    this._valueControl = value;
    this.render();
  }

  public connectedCallback() {
    this.classList.add('ext-logical-toggle');
    this.render();
  }
  public disconnectedCallback() {
    // Clean up when element is removed from DOM
    this.unmount();
  }

  private render() {
    this._root ??= createRoot(this);

    if (this.valueControl) {
      this._root.render(<LogicalToggle valueControl={this.valueControl} />);
    } else {
      this._root.render(<Toggle />);
    }
  }

  private unmount() {
    if (this._root) {
      this._root.unmount();
      delete this._root;
    }
  }
}

export default LogicalToggleElement;