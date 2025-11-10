import '@xyflow/react/dist/style.css';
import './styles/conversation.editor.css';
import './styles/control.buttons.css';
import './styles/dialog.tree.node.css';
import './styles/property.drawer.css';
import './styles/error.boundary.css';
import './styles/schema.validation.css';

import { useContext, useState } from 'react';
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant } from '@xyflow/react';
import { useControlToFlowSync, useSelectedContronMonitor } from './nodes';
import { nodeTypes, getNodeClassName } from './nodes/node.types';
import PropertyDrawer from './property.drawer/property.drawer';
import UndoButton from './controls/undo.button';
import RedoButton from './controls/redo.button';
import AutoLayoutButton from './controls/auto.layout.button';
import { UndoRedoContext } from './state';
import { useHotkeys } from 'react-hotkeys-hook';
import { useControlCopyPasteMonitor } from './nodes/use.control.copy.paste.monitor';
import { useDeleteControlHandler } from './nodes/use.delete.control.handler';
import { noop } from 'ts-essentials';

/**
 * Main conversation editor component with React Flow integration
 * Provides visual editing of conversation trees with keyboard shortcuts and property panel
 */
function ConversationEditor() {

  const [
    nodes, onNodesChange,
    edges, onEdgesChange,
    onConnect, onConnectEnd
  ] = useControlToFlowSync();

  const [interactive, setInteractive] = useState(true);
  const [focusedDocumentConntrol, focusHandler] = useSelectedContronMonitor();
  const [copyToClipboard, pasteFromClipboard, duplicate] = useControlCopyPasteMonitor(focusedDocumentConntrol);
  const { saveState: saveUndoRedoState, undo, redo } = useContext(UndoRedoContext);
  const deleteControl = useDeleteControlHandler(focusedDocumentConntrol);

  // Keyboard shortcuts for editor operations
  useHotkeys('ctrl+z, meta+z', undo, { preventDefault: true, enabled: interactive });
  useHotkeys('ctrl+y, meta+y, shift+z', redo, { preventDefault: true, enabled: interactive });
  useHotkeys('ctrl+c, meta+c', copyToClipboard, { preventDefault: false, enabled: interactive });
  useHotkeys('ctrl+d, meta+d', duplicate, { preventDefault: true, enabled: interactive });
  useHotkeys('ctrl+v, meta+v', pasteFromClipboard, { preventDefault: false, enabled: interactive });
  useHotkeys('delete, backspace', deleteControl, { preventDefault: true, enabled: interactive });

  return (
    <>
      <div className='ext-ce-flow-graph mat-elevation-z1'
        onFocus={focusHandler}
        tabIndex={0}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="top-right"
          onNodesChange={interactive ? onNodesChange : noop}
          onEdgesChange={interactive ? onEdgesChange : noop}
          onConnect={interactive ? onConnect : noop}
          onConnectEnd={interactive ? onConnectEnd : noop}
          onFocus={saveUndoRedoState}
          onBlur={saveUndoRedoState}
        />
        <MiniMap zoomable pannable nodeClassName={getNodeClassName} />
        <Controls onInteractiveChange={setInteractive} >
          <AutoLayoutButton onNodesChange={interactive ? onNodesChange : noop} enabled={interactive} />
        </Controls>
        <div className='ext-undo-redo-panel'>
          <UndoButton enabled={interactive} />
          <RedoButton enabled={interactive} />
        </div>
        <Background variant={BackgroundVariant.Dots} />
      </div>
      <PropertyDrawer documentControl={focusedDocumentConntrol} />
    </>
  );
}

export default ConversationEditor;