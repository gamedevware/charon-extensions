import { createRoot } from 'react-dom/client'
import ConversationEditorElement from './conversation.editor.element.tsx';
import { defineJsonPointer, createDevValueControl, defineStubElements, defineTimeSpan, persistToLocalStorage } from './dev/index.ts';
import { initialConversation } from './dev/initial.conversation.ts';
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