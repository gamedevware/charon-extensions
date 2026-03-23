import { RootDocumentControl } from "./controls";

/** Interface that a custom schema editor Web Component must implement. Charon sets the {@link documentControl} when mounting the element. */
export declare interface CharonSchemaEditorElement {
    /** The root document control for the document being edited. Set by Charon before the element is connected. */
    documentControl: RootDocumentControl;
}
