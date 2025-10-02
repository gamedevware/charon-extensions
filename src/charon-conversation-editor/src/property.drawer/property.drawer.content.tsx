import { DataDocument, DocumentControl } from "charon-extensions";
import { useEffect, useState } from "react";
import { useControlValue } from "../reactive";
import { formatDocumentDisplayText } from "../nodes/document.control.functions";

/**
 * Content component for displaying document properties in a property drawer
 * Shows document title and a form view with configurable property exclusion
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {DocumentControl<DataDocument>} props.documentControl - The document control to display and edit
 */
function PropertyDrawerContent({ documentControl }: { documentControl: DocumentControl<DataDocument> }) {

    const [documentTitle, setDocumentTitle] = useState('');
    const [dataDocument] = useControlValue(documentControl);

    useEffect(() => {
        setDocumentTitle(formatDocumentDisplayText(documentControl));
    }, [dataDocument, documentControl]);

    return <>
        <h2>{documentTitle}</h2>
        <div className="ext-ce-form-view-scroll-container">
            <charon-document-form-view
                documentControl={documentControl}
                excludeProperties={['Nodes', 'Specification', 'RootNode', 'NextNode', 'Responses']}
            />
        </div>
    </>
}

export default PropertyDrawerContent;