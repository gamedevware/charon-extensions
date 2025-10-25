import { CharonSchemaEditorElement, RootDocumentControl } from "charon-extensions";
import { createRoot, Root } from 'react-dom/client';
import ConversationEditor from "./conversation.editor";
import { ConversationTree } from "./models";
import { ReactFlowProvider } from "@xyflow/react";
import { ConversationContext } from "./state/conversation.context";
import { ConversationState } from "./state";
import { UndoRedoContext } from "./state/undo.redo.context";
import { UndoRedoState } from "./state/undo.redo.state";
import { ErrorBoundary } from "./error.boundary";

/**
 * Custom HTML Element for editing conversation trees in a visual flow editor
 * Implements the Charon schema editor interface and manages React integration
 * 
 * @element ext-conversation-editor
 * @implements {CharonSchemaEditorElement}
 * 
 * @example
 * <ext-conversation-editor documentControl="{conversationControl}"></ext-conversation-editor>
 */
export default class ConversationEditorElement extends HTMLElement implements CharonSchemaEditorElement {
  private _documentControl?: RootDocumentControl<ConversationTree>;
  private _root?: Root;

  /**
   * Gets the current document control for the conversation tree
   * @returns {RootDocumentControl<ConversationTree>} The root document control instance
   */
  get documentControl(): RootDocumentControl<ConversationTree> {
    return this._documentControl!;
  }

  /**
   * Sets the document control and triggers re-render when changed
   * @param {RootDocumentControl<ConversationTree>} value - The new document control to use
   */
  set documentControl(value: RootDocumentControl<ConversationTree>) {
    if (Object.is(value, this._documentControl)) {
      return; // same value
    }
    this._documentControl = value;
    this.render();
  }

  /**
   * Custom Element lifecycle method: Called when element is added to DOM
   * Sets up CSS classes and initial rendering
   */
  public connectedCallback() {
    this.classList.add('ext-conversation-editor');
    this.render();
  }

  /**
   * Custom Element lifecycle method: Called when element is removed from DOM
   * Performs cleanup by unmounting React root to prevent memory leaks
   */
  public disconnectedCallback() {
    // Clean up when element is removed from DOM
    this.unmount();
  }

  /**
   * Renders the React application into the custom element
   * Creates React root on first call and renders with proper context providers
   * @private
   */
  private render() {
    this._root ??= createRoot(this);

    if (this._documentControl) {
      this._root.render(
        <ErrorBoundary>
          <ReactFlowProvider>
            <ConversationContext value={new ConversationState(this._documentControl)}>
              <UndoRedoContext value={new UndoRedoState(this._documentControl)}>
                <ConversationEditor />
              </UndoRedoContext>
            </ConversationContext>
          </ReactFlowProvider>
        </ErrorBoundary>);
    }
  }

  /**
   * Unmounts the React application and cleans up resources
   * @private
   */
  private unmount() {
    if (this._root) {
      this._root.unmount();
      delete this._root;
    }
  }
}