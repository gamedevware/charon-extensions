/** Top-level game data container holding all document collections keyed by schema name. */
export interface GameDataDocument {
    ['Collections']: { [schemaName: string]: Array<DataDocument> };
}

/** A single game data document — a key-value record with at minimum an 'Id' field. */
export interface DataDocument {
    [index: string]: DataDocumentValue | undefined;
    'Id': DataDocumentId;
}

/** Server-side metadata about a document's location and validation state. */
export interface DataDocumentMeta {
    /** Id of the schema this document belongs to. */
    schemaId: string;
    /** Path within the document hierarchy (for sub-documents), or null for root documents. */
    path: string | null;
    /** Schema id of the parent document that contains this sub-document, or null for root documents. */
    containingDocumentSchemaId: string | null;
    /** Id of the parent document that contains this sub-document, or null for root documents. */
    containingDocumentId: string | null;
    /** Number of validation errors on this document. */
    errorCount: number;
}

/** A lightweight reference to a document, containing its Id and display information. */
export interface DataDocumentReference {
    'Id': DataDocumentId;
    'Icon'?: string;
    'DisplayName': string;
}

/** IETF language tag string (e.g., "en-US", "fr-FR"). */
export type IetfLanguageTag = string;

/** A localized text value — a dictionary of language tag to translated string, with optional translation notes. */
export type DataLocalizationDocument = { [key in IetfLanguageTag]?: string | null; } &
{
    'notes'?: string | DataLocalizationNotesDocument | null;
};

/** Translation notes for a localized text value. */
export interface DataLocalizationNotesDocument {
    /** Translator comment or context note. */
    'comment'?: string | null;
    /** Tracks which translations are stale (outdated relative to the source language). */
    'stale'?: StaleTranslationList | null;
};

/** Dictionary of language tags to boolean flags indicating whether a translation is stale. */
export type StaleTranslationList = { [key in IetfLanguageTag]?: boolean | null; };

/** Union of types that can serve as a document Id value. */
export type DataDocumentId = string | number | boolean | Date | bigint | TimeSpan;

/** A dictionary of documents indexed by their string-converted Id. */
export type DataDocumentById = { [id: string]: DataDocument | null | undefined } & object;

/** A parsed formula expression represented as an AST node. */
export interface DataFormulaDocument {
    /** The type of this expression node (e.g., operator, function call, literal). */
    expressionType: string;
    /** Original source position of this AST node, formatted as "line:col+length" (e.g., "10:1+5"). */
    _pos?: string;
    [index: string]: any | undefined;
}

/** Union of all possible values a document property can hold. */
export type DataDocumentValue = DataDocument | Array<DataDocument> | DataDocumentById | DataDocumentId | DataFormulaDocument |
    DataDocumentReference | DataLocalizationDocument | object | null;
