import type { DataDocumentReference } from "charon-extensions";

/**
 * Reference to a dialog node within a conversation tree
 * @extends DataDocumentReference
 */
export interface DialogNodeReference extends DataDocumentReference {
    Id: string | number | bigint;
    DisplayName: string;
}