import { DataDocument, DataDocumentMeta, DataDocumentValue, GameDataDocument } from "../controls";
import { ObservableLike } from "../reactive";

/** Service for querying and modifying game data documents on the server. */
export interface GameDataService {
    /** Returns the current game data project identifier. */
    getId(): ObservableLike<string>;

    /** Finds a single document by a unique property value. */
    find(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>;
    /** Finds multiple documents by unique property values in a single batch request. */
    query(findRequests: FindRequest[]): ObservableLike<readonly FindResult[]>;
    /** Lists documents of a schema with optional filtering, sorting, and pagination. */
    list(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;

    /**
     * Creates, updates, or deletes multiple documents of a single schema in one operation.
     * @param dryRun - If true, validates without applying changes.
     */
    bulkChange(schemaNameOrId: string, documents: ReadonlyArray<DataDocument>,
        importMode: ImportMode, validationOptions?: ReadonlyArray<ValidationOption>, dryRun?: boolean): ObservableLike<BulkChangeResult>;
    /**
     * Imports a full game data document (multiple schemas) into the project.
     * @param dryRun - If true, validates without applying changes.
     */
    import(collections: GameDataDocument, importMode?: ImportMode, schemas?: ReadonlyArray<string>, languages?: ReadonlyArray<string>,
        validationOptions?: ReadonlyArray<ValidationOption>, dryRun?: boolean): ObservableLike<BulkChangeResult>;
    /** Exports game data documents from the project. */
    export(exportMode?: ExportMode, schemas?: ReadonlyArray<string>, properties?: ReadonlyArray<string>,
        languages?: ReadonlyArray<string>): ObservableLike<ExportResult>;
    /** Validates game data and returns any validation errors found. */
    validate(validationOptions: ReadonlyArray<ValidationOption>): ObservableLike<ValidateResult>;
}

/** Result of an export operation containing the exported game data. */
export interface ExportResult {
    /** The exported game data document. */
    readonly document: GameDataDocument,
    /** Hash of the metadata state at the time of export. */
    readonly metadataHash: string,
    /** Hash of the data revision at the time of export. */
    readonly revisionHash: string,
}

/** Result of a validation operation. */
export interface ValidateResult {
    /** Per-document validation records. */
    readonly records: ReadonlyArray<ValidationRecord>,
    /** Hash of the metadata state at the time of validation. */
    readonly metadataHash: string,
    /** Hash of the data revision at the time of validation. */
    readonly revisionHash: string,
}

/** Validation result for a single document. */
export interface ValidationRecord {
    /** The document's Id value. */
    readonly id: DataDocumentValue,
    /** Name of the schema this document belongs to. */
    readonly schemaName: string,
    /** Id of the schema this document belongs to. */
    readonly schemaId: string,
    /** Validation errors found in this document. */
    readonly errors: ReadonlyArray<ValidationError>,
}

/** Result of a bulk change (import/bulkChange) operation. */
export interface BulkChangeResult {
    /** Per-document change records. */
    readonly changes: ReadonlyArray<BulkChangeRecord>;
    /** Hash of the metadata state after the operation. */
    readonly metadataHash: string;
    /** Hash of the data revision after the operation. */
    readonly revisionHash: string;
}

/** Change record for a single document within a bulk change operation. */
export interface BulkChangeRecord {
    /** The original document Id. */
    readonly id: DataDocumentValue,
    /** The new document Id (may differ from id if the document was re-assigned). */
    readonly newId: DataDocumentValue,
    /** Name of the schema this document belongs to. */
    readonly schemaName: string,
    /** Id of the schema this document belongs to. */
    readonly schemaId: string,
    /** The outcome of the change operation for this document. */
    readonly status: BulkChangeRecordStatus,
    /** Human-readable description of what happened. */
    readonly comment: string,
    /** Validation errors encountered for this document. */
    readonly errors: ReadonlyArray<ValidationError>,
}

/** A single validation error on a document property. */
export interface ValidationError {
    /** JSON Pointer path to the property with the error. */
    readonly path: string;
    /** Human-readable error message. */
    readonly message: string;
    /** Machine-readable error code. */
    readonly code: string;
    [key: string]: any;
}

/** Status outcome for a document within a bulk change operation. */
export enum BulkChangeRecordStatus {
    /** Document was created. */
    created = 0,
    /** Document was updated. */
    updated = 1,
    /** Document was deleted. */
    deleted = 2,
    /** Document was skipped (no changes needed or not matched by import mode). */
    skipped = 3,
    /** Document was unchanged. */
    unchanged = 4,
    /** Document encountered an error during processing. */
    error = 5,
}

/** Validation checks and repair operations that can be performed on game data. */
export enum ValidationOption {
    /** Perform automatic repair of common data issues. */
    repair = 0,
    /** Validate localized text translations. */
    checkTranslations = 1,
    /** Detect and resolve duplicate Id values. */
    deduplicateIds = 2,
    /** Fill required properties with default values where missing. */
    repairRequiredWithDefaults = 3,
    /** Resolve conflicting union type selections. */
    resolveConflictingUnions = 4,
    /** Remove values that don't match the expected data type. */
    eraseInvalidValues = 5,
    /** Check that required property constraints are met. */
    checkRequirements = 6,
    /** Check that values conform to their expected format. */
    checkFormat = 7,
    /** Check that uniqueness constraints are met. */
    checkUniqueness = 8,
    /** Check that references point to existing documents. */
    checkReferences = 9,
    /** Check that specification constraints are met. */
    checkSpecification = 10,
    /** Check general data constraints. */
    checkConstraints = 11,
}

/** Determines how documents are matched and applied during import/bulkChange operations. */
export enum ImportMode {
    /** Create new documents and update existing ones. */
    createAndUpdate = 0,
    /** Only create new documents, skip existing ones. */
    create = 1,
    /** Only update existing documents, skip new ones. */
    update = 2,
    /** Update existing documents only if the incoming data doesn't break references. */
    safeUpdate = 3,
    /** Replace the entire collection with the imported documents. */
    replace = 4,
    /** Delete documents that match the imported data. */
    delete = 5,
}

/** Determines what data is included in an export. */
export enum ExportMode {
    /** Export all specified documents, automatically including referenced documents to maintain referential integrity. */
    normal = 0,
    /** Like normal, but strips non-essential data. Suitable for loading into games via generated code. */
    publication = 1,
    /** Export only LocalizedText properties. Suitable for translation workflows. */
    localization = 2,
    /** Export only the specified schemas without including referenced documents. May leave broken references. */
    extraction = 3,
}

/** Comparison operator for filtering documents in list queries. */
export enum FilterOperator {
    greaterThan = 0,
    greaterThanOrEqual = 1,
    lessThan = 2,
    lessThanOrEqual = 3,
    equal = 4,
    notEqual = 5,
    /** Pattern matching (wildcard or substring search). */
    like = 6,
    /** Value is contained in a set of values. */
    in = 7,
}

/** Sort direction for ordering documents in list queries. */
export enum SorterDirection {
    ascending = 0,
    descending = 1,
}

/** A filter condition applied to a document property in a list query. */
export interface Filter {
    /** Property name or path to filter on. */
    readonly property: string;
    /** Comparison operator. */
    readonly operator: FilterOperator;
    /** Value to compare against. */
    readonly value: any;
    /** Whether the comparison is case-sensitive (for string values). */
    readonly caseSensitive: boolean;
}

/** A sort specification applied to a document property in a list query. */
export interface Sorter {
    /** Property name or path to sort by. */
    readonly property: string;
    /** Sort direction. */
    readonly direction: SorterDirection;
}

/** Parameters for listing documents from a schema. */
export interface ListDocumentParameters {
    /** Filter documents by path prefix (for sub-documents). */
    readonly path: string;
    /** Number of documents to skip (for pagination). */
    readonly skip: number;
    /** Maximum number of documents to return. */
    readonly take: number;
    /** Full-text search query string. */
    readonly query: string;
    /** Property names to include in the result (projection). */
    readonly select: readonly string[];
    /** Filter conditions to apply. */
    readonly filters: readonly Filter[];
    /** Sort specifications to apply. */
    readonly sorters: readonly Sorter[];
}

/** Result of a document list query. */
export interface ListResult {
    /** The returned documents (may be a subset if paginated). */
    readonly documents: readonly Readonly<DataDocument>[];
    /** Metadata for each returned document (parallel to documents array). */
    readonly metas: readonly Readonly<DataDocumentMeta>[];
    /** Total number of documents matching the query (before pagination). */
    readonly total: number;
    /** Hash of the metadata state at the time of query. */
    readonly metadataHash: string;
    /** Hash of the data revision at the time of query. */
    readonly revisionHash: string;
}

/** Result of a single document find operation. */
export interface FindResult {
    /** The found document, or null if no match. */
    readonly document: Readonly<DataDocument> | null;
    /** Metadata about the found document. */
    readonly meta: Readonly<DataDocumentMeta>;
    /** Hash of the metadata state at the time of query. */
    readonly metadataHash: string;
    /** Hash of the data revision at the time of query. */
    readonly revisionHash: string;
}

/** Request parameters for finding a single document by a unique property value. */
export interface FindRequest {
    /** Schema name or id to search in. */
    readonly schemaNameOrId: string;
    /** Name or id of the unique property to match against. */
    readonly uniqueSchemaPropertyNameOrId: string;
    /** The value to search for. */
    readonly uniqueSchemaPropertyValue: string;
}
