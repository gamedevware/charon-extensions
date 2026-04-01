import { ValueControl, CharonPropertyEditorElement } from 'charon-extensions';
import { createRoot, Root } from 'react-dom/client';
import __COMPONENT_NAME__ from './Editor';

class __CLASS_NAME__ extends HTMLElement implements CharonPropertyEditorElement {
  private _valueControl?: ValueControl<any>;
  private _root?: Root;

  get valueControl(): ValueControl<any> {
    return this._valueControl!;
  }

  set valueControl(value: ValueControl<any>) {
    this._valueControl = value;
    this.render();
  }

  public connectedCallback() {
    this.classList.add('__EDITOR_ID__');
    this.render();
  }

  public disconnectedCallback() {
    this.unmount();
  }

  private render() {
    this._root ??= createRoot(this);
    if (this._valueControl) {
      this._root.render(<__COMPONENT_NAME__ valueControl={this._valueControl} />);
    }
  }

  private unmount() {
    if (this._root) {
      this._root.unmount();
      delete this._root;
    }
  }
}

export default __CLASS_NAME__;
