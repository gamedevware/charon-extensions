# Charon Conversation Editor Extension

A visual node-based conversation/dialog editor extension for [Charon](https://gamedevware.com/) game data editor, built with React and React Flow.

## Overview

This extension demonstrates how to create a custom document editor for Charon using Web Components and React. 
It provides a visual, node-based interface for designing branching conversations and dialogs, making it easy for 
game designers to create complex narrative structures without writing code.

## What is This Example?

The Conversation Editor is a fully functional Charon extension that:
- Provides a visual graph-based editor for dialog trees
- Allows drag-and-drop node creation and connection
- Supports different dialog node types (conversations, response choices)
- Automatically saves changes back to your Charon game data
- Demonstrates best practices for building custom Charon editors

## Architecture: Web Components + React

This extension uses **Web Components** as a wrapper around a **React application**. This architecture allows:

1. **Framework Agnostic Integration**: Charon can load the extension without knowing it's built with React
2. **Encapsulation**: Logic is isolated from the main Charon application
3. **Reusability**: The component can be distributed via NPM and used across projects

### How It Works

```
Charon Application
    ↓
Custom Element (<ext-conversation-editor>)
    ↓
React Application (with React Flow)
    ↓
Your Game Data
```

The Web Component acts as a bridge, implementing the `CharonSchemaEditorElement` interface to receive data from Charon and sending updates back when the user makes changes.

## Key Files for Customization

### Core Extension Files

#### `src/main.tsx`
**Purpose**: Entry point that registers the Web Component with the browser.
- Defines the custom element tag name (e.g., `ext-conversation-editor`)
- Bootstraps the React application
- **Customize**: Change the element name or registration logic here, don't forget to update `src/package.json` to reflect new element name

#### `src/schema.validation/validate.schema.ts`
**Purpose**: Logic for validating the schema for compliance with the structure required by the editor
- Checks that the `Schema` contains the required properties.
- **Customize**: Change if you require additional required schema properties

#### `src/conversation.editor.element.tsx`
**Purpose**: The Web Component wrapper that interfaces with Charon.
- Implements `CharonSchemaEditorElement` interface
- Manages subscriptions to `documentControl` from Charon
- Handles data serialization/deserialization
- **Customize**: Modify how data is passed between Charon and React, add validation logic

#### `src/dev/
**Purpose**: A folder containing a set of mocks simulating the extension's harness during development

#### `src/reactive/
**Purpose**: A folder containing a set of **React** state system adapters for **Rx.js**

#### `package.json`
**Purpose**: Defines the extension metadata and Charon integration.
- Contains the `config.customEditors` section that tells Charon about your extension
- Specifies which data types and contexts the editor supports
- **Customize**: Update editor name, Web Component name, styles, and other metadata

```json
  "config": {
    "customEditors": [
      {
        "id": "ext-conversation-editor",
        "selector": "ext-conversation-editor",
        "name": "Conversation Editor",
        "type": [
          "Schema"
        ]
      }
    ]
  }
```

### UI Components

#### `src/conversation.editor.tsx`
**Purpose**: Main React component that renders the React Flow editor.
- Sets up the React Flow instance
- Manages node and edge state
- Handles user interactions (add node, delete, connect)
- **Customize**: Modify editor layout, add toolbar buttons, change default behaviors

#### `src/components/nodes/`
**Purpose**: Custom node components for different dialog types.
- `DialogueNode.tsx`: Standard conversation line
- `ChoiceNode.tsx`: Branching decision points  
- `ConditionNode.tsx`: Logic gates for conditional flow
- **Customize**: Create new node types, modify appearance, add custom fields

#### `src/components/property.drawer/property.drawer.tsx`
**Purpose**: A panel for displaying the properties of the selected dialog node.
- **Customize**: Add new controls, modify layout, create custom tools for dialog nodes.

### Data & State Management

#### `src/state/use.control.to.flow.sync.ts`
**Purpose**: Custom React hook for managing conversation data.
- Converts between Charon's data format and React Flow's node/edge format (see `src/state/conversation.state.ts`)
- Handles data transformations
- **Customize**: Modify data structure, add new fields, change serialization

#### `src/models/conversation.tree .ts`
**Purpose**: TypeScript type definitions for expected conversation data model
- Defines the shape of conversation data
- Node types, edge types, and editor state
- **Customize**: Extend types for new features, don't forget to check for new properties in `src/schema.validation/validate.schema.ts`

## React Flow Integration

### What is React Flow?

[React Flow](https://reactflow.dev/) is a library for building node-based editors and interactive diagrams. It handles:
- Node rendering and positioning
- Edge (connection) drawing and routing
- Drag-and-drop interactions
- Zoom and pan controls
- Selection and multi-selection

### How It's Used in This Editor

#### 1. **Node Layout**
```tsx
<ReactFlow
  nodes={nodes}              // Array of conversation nodes
  edges={edges}              // Connections between nodes
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes} // Your custom node components
/>
```

#### 2. **Custom Node Types**
Each node type is a React component:
```tsx
const nodeTypes = {
  dialogue: DialogueNode,    // Character speech
  choice: ChoiceNode,        // Player options (not implemented)
  condition: ConditionNode   // Logic branches (not implemented)
};
```

#### 3. **Node Structure**
Each node in React Flow contains:
```typescript
{
  id: string,              // Unique identifier
  type: 'dialogue' | 'choice' | 'condition',
  position: { x: number, y: number },
  data: {                  // Your custom data
    valueControl: ValueControl<DialogueNode> | ValueControl<ChoiceNode> | ValueControl<ConditionNode>,
    // ... other fields
  }
}
```

#### 4. **Edges (Connections)**
Edges connect nodes:
```typescript
{
  id: string,
  source: string,          // Source node ID
  target: string,          // Target node ID
  label?: string           // Optional label on connection
}
```

### Visual Layout Strategy

The editor uses React Flow's built-in layout features:
- **Dagre Layout**: Hierarchical tree layout for conversation flow
- **Auto-layout**: Automatically arranges nodes to avoid overlaps
- **Manual Layout**: Users can drag nodes to customize positioning

## Main Components Explained

### `ConversationEditorElement` (Web Component Wrapper)
**Responsibility**: Bridge between Charon and React
- Receives updates from Charon when data changes
- Sends updates to Charon when user edits conversation
- Manages component lifecycle (mount/unmount)
- Prevents memory leaks by properly unsubscribing from Charon observables

### ConversationEditor` (Main UI)
**Responsibility**: Orchestrate the entire editor experience
- Renders the React Flow canvas
- Manages toolbar and sidebar
- Handles global editor state (zoom level, selected nodes)
- Coordinates between different UI components

### Custom Node Components
**Responsibility**: Render individual conversation elements
- Display node-specific data (text, character name, etc.)
- Provide handles for connecting nodes
- Show node-specific controls (delete, edit)
- Style based on node type and state (selected, error, etc.)

## Getting Started

### Prerequisites
- Node.js 21+
- npm or yarn
- Basic knowledge of React and TypeScript

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

### Building
```bash
npm run build
```

This generates a `.tgz` file that can be installed in Charon.

### Testing in Charon

1. Build the extension: `npm run build`
2. In Charon's **Project Settings → Extensions** use **Upload NPM Package...** button to upload newly build package from `src\charon-conversation-editor\dist\` folder
3. Add your extension to the project's extension list
4. Create or edit a document schema and select "Conversation Editor" as the custom editor

## Customization Ideas

### Add New Node Types
1. Create a new component in `src/nodes/NewNodeType.tsx`
2. Register it in `nodeTypes: NodeTypes` in `src\nodes\node.types.ts`
3. Add the new node type to your sidebar drawer or to some toolbar

### Integrate with AI
- Add a button to generate dialogue using GPT API
- Auto-suggest character responses
- Validate grammar and style

### Implement Version Control
- Save conversation snapshots
- Add diff view to compare versions
- Allow branching and merging of conversation trees

## Resources

- [Charon Documentation](https://gamedevware.github.io/charon/)
- [Creating Charon Extensions Guide](https://gamedevware.github.io/charon/advanced/extensions/creating_react_extension.html)
- [React Flow Documentation](https://reactflow.dev/)
- [Web Components Specification](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## License

MIT

## Contributing

Contributions are welcome! This example serves as a template for building custom Charon editors. Feel free to fork and modify for your own game's needs.

---

**Need Help?** Check the [Charon Discord](https://discord.gg/gamedevware) or [GitHub Issues](https://github.com/gamedevware/charon-extensions/issues).