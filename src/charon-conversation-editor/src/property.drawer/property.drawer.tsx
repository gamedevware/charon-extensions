import { DataDocument, DocumentControl } from "charon-extensions";
import { useRef } from "react";
import PropertyDrawerResizeBar from "./property.drawer.resize.bar";
import PropertyDrawerContent from './property.drawer.content';
import { useDeleteControlHandler } from "../nodes/use.delete.control.handler";

/**
 * Property drawer component for displaying and editing document properties
 * Provides a resizable panel with document details, form editing, and deletion capabilities
 */
function PropertyDrawer({ documentControl }: { documentControl: DocumentControl<DataDocument> | null | undefined }) {

    const containerRef = useRef<HTMLDivElement>(null);
    const deleteHandler = useDeleteControlHandler(documentControl);

    // Only show delete button for documents that have a parent (not root elements)
    const canBeDeleted = Boolean(documentControl?.parent);

    return <>
        <div className="ext-ce-property-drawer mat-elevation-z1" ref={containerRef}>
            <PropertyDrawerResizeBar containerRef={containerRef} />

            {documentControl && (
                <>
                    <PropertyDrawerContent documentControl={documentControl} />

                    {canBeDeleted &&
                        <button type='button' className="ext-ce-delete-button" onClick={deleteHandler}>
                            <svg width={16}
                                height={16}
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M3 18C3 19.103 3.897 20 5 20H15C16.103 20 17 19.103 17 18V6H19V4H15V2C15 0.897 14.103 0 13 0H7C5.897 0 5 0.897 5 2V4H1V6H3V18ZM7 2H13V4H7V2ZM6 6H15L15.001 18H5V6H6Z" />
                                <path d="M7 8H9V16H7V8ZM11 8H13V16H11V8Z" />
                            </svg>
                        </button>
                    }
                </>
            )}

            {!documentControl && (
                <p className="ext-ce-no-node-selected">Select a node to view its properties.</p>
            )}
        </div>
    </>
}

export default PropertyDrawer;