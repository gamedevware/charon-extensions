import { ValueControl } from "./controls";

/** Interface that a custom property editor Web Component must implement. Charon sets the {@link valueControl} when mounting the element. */
export declare interface CharonPropertyEditorElement {
    /** The value control for the property being edited. Set by Charon before the element is connected. */
    valueControl: ValueControl;
}
