import { createRoot } from 'react-dom/client'
import ConversationEditorElement from './conversation.editor.element.tsx';
import { defineJsonPointer, createDevValueControl, defineStubElements, defineTimeSpan, persistToLocalStorage } from './dev/index.ts';
import { initialConversation } from './dev/initial.conversation.ts';
import { createConversationSchema } from './schema.validation/migrate.schema.ts';
export { createConversationSchema } from './schema.validation/migrate.schema.ts';
import type { ExtensionActionContext, ExtensionPageContext } from 'charon-extensions';

export function logDocumentContext(context: ExtensionActionContext) {
    if (context.location !== 'document-action-menu') {
        return;
    }
    console.log('document-action-menu fired', context.documentControl);
}

export function logListContext(context: ExtensionActionContext) {
    if (context.location !== 'document-list-action-menu') {
        return;
    }
    console.log('document-list-action-menu fired', context.schema, context.selection);
}

class SampleDialogElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div style="padding: 16px;">
            <p id="data-readout"></p>
            <button id="close-with-result">Close with result</button>
        </div>`;
        const dataReadout = this.querySelector('#data-readout')!;
        dataReadout.textContent = 'data received: ' + JSON.stringify((this as any).data);
        this.querySelector('#close-with-result')!.addEventListener('click', () => {
            (this as any).dialogRef.close({ confirmed: true });
        });
    }
}
customElements.define('ext-sample-dialog', SampleDialogElement);

export function openCustomDialog(context: ExtensionActionContext) {
    const ref = context.services.ui?.dialog?.showCustom<{ confirmed: boolean }>('ext-sample-dialog', { foo: 'bar' }, { title: 'Sample Dialog' });
    ref?.afterClosed().subscribe({ next: result => console.log('custom dialog closed with', result) });
}

class SamplePageElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div style="padding: 16px;">
            <p id="context-readout"></p>
            <button id="go-deeper">Go deeper (push restOfRoute)</button>
            <button id="go-back">Back</button>
        </div>`;
        const context = (this as any).context as ExtensionPageContext;
        this.querySelector('#context-readout')!.textContent =
            'params: ' + JSON.stringify(context.params) + ' | restOfRoute: ' + JSON.stringify(context.restOfRoute);
        this.querySelector('#go-deeper')!.addEventListener('click', () => {
            context.services.navigation?.customPage('charon-conversation-editor', 'ext-sample-page', ['tab', 'general'], { foo: 'bar' });
        });
        this.querySelector('#go-back')!.addEventListener('click', () => {
            context.services.navigation?.back();
        });
    }
}
customElements.define('ext-sample-page-element', SamplePageElement);

export function openCustomPage(context: ExtensionActionContext) {
    context.services.navigation?.customPage('charon-conversation-editor', 'ext-sample-page');
}

export function pingFromNav(context: ExtensionActionContext) {
    if (context.location !== 'side-navigation-menu') {
        return;
    }
    console.log('side-navigation-menu fired', context);
}

/**
 * Register the conversation editor as a custom HTML element
 * This enables usage as <ext-conversation-editor> in HTML
 */
customElements.define("ext-conversation-editor", ConversationEditorElement);

/**
 * TypeScript declaration for custom HTML elements used in React JSX
 * Informs TypeScript that these custom elements are valid JSX tags
 */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ext-conversation-editor': any; // Conversation editor custom element
      'charon-asset-preview': any;    // Asset preview component for character images
      'charon-document-form-view': any; // Form view for document property editing
    }
  }
}

/**
 * Development environment setup with mock data and utilities
 * This section only runs in development mode and provides:
 * - Stub implementations for hosting application dependencies
 * - Persistent data storage for testing conversation flows
 * - Predefined conversation data for development
 */
const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  /**
   * Define stub custom elements that are normally provided by the hosting application
   * These include charon-asset-preview and charon-document-form-view elements
   * that handle asset display and document property editing respectively
   */
  defineStubElements();

  /**
   * Define ambient types for JSON pointers and time spans
   * These types are typically provided by the Charon framework in production
   * but need to be mocked for standalone development
   */
  defineJsonPointer();
  defineTimeSpan();

  /**
   * Create a development ValueControl instance with predefined conversation data
   * ValueControl provides reactive state management similar to Angular FormControl
   * but adapted for React with undo/redo capabilities and change tracking
   */
  const devValueControl = createDevValueControl(initialConversation);

  /**
   * Enable persistent storage of conversation state in browser localStorage
   * This allows conversation edits to survive page refreshes during development
   * and maintains the undo/redo history across development sessions
   */
  persistToLocalStorage(devValueControl);

  /**
   * Render the conversation editor component with development ValueControl
   * The custom element wraps the React application with proper context providers
   * for conversation state management, undo/redo functionality, and React Flow integration
   */
  createRoot(document.getElementById('root')!).render(
    <ext-conversation-editor documentControl={devValueControl} />
  )
}

// this will keep function from tree-shaking
(window as any).createConversationSchema = createConversationSchema;
(window as any).logDocumentContext = logDocumentContext;
(window as any).logListContext = logListContext;
(window as any).openCustomDialog = openCustomDialog;
(window as any).openCustomPage = openCustomPage;
(window as any).pingFromNav = pingFromNav;