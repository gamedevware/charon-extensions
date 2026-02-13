import { DataDocument, DataDocumentMeta, DataDocumentValue, GameDataDocument } from "../controls";
import { ObservableLike } from "../reactive";

export interface GameDataService {
    getId(): ObservableLike<string>;

    find(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>;
    query(findRequests: FindRequest[]): ObservableLike<readonly FindResult[]>;
    list(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;

    bulkChange(schemaNameOrId: string, documents: ReadonlyArray<DataDocument>,
        importMode: ImportMode, validationOptions?: ReadonlyArray<ValidationOption>, dryRun?: boolean): ObservableLike<BulkChangeResult>;
    import(collections: GameDataDocument, importMode?: ImportMode, schemas?: ReadonlyArray<string>, languages?: ReadonlyArray<string>,
        validationOptions?: ReadonlyArray<ValidationOption>, dryRun?: boolean): ObservableLike<BulkChangeResult>;
    export(exportMode?: ExportMode, schemas?: ReadonlyArray<string>, properties?: ReadonlyArray<string>,
        languages?: ReadonlyArray<string>): ObservableLike<ExportResult>;
    validate(validationOptions: ReadonlyArray<ValidationOption>): ObservableLike<ValidateResult>;
}

export interface ExportResult {
    readonly document: GameDataDocument,
    readonly metadataHash: string,
    readonly revisionHash: string,
}

export interface ValidateResult {
    readonly records: ReadonlyArray<ValidationRecord>,
    readonly metadataHash: string,
    readonly revisionHash: string,
}

export interface ValidationRecord {
    readonly id: DataDocumentValue,
    readonly schemaName: string,
    readonly schemaId: string,
    readonly errors: ReadonlyArray<ValidationError>,
}

export interface BulkChangeResult {
    readonly changes: ReadonlyArray<BulkChangeRecord>;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface BulkChangeRecord {
    readonly id: DataDocumentValue,
    readonly newId: DataDocumentValue,
    readonly schemaName: string,
    readonly schemaId: string,
    readonly status: BulkChangeRecordStatus,
    readonly comment: string,
    readonly errors: ReadonlyArray<ValidationError>,
}

export interface ValidationError {
    readonly path: string;
    readonly message: string;
    readonly code: string;
    [key: string]: any;
}

export enum BulkChangeRecordStatus {
    created = 0,
    updated = 1,
    deleted = 2,
    skipped = 3,
    unchanged = 4,
    error = 5,
}

export enum ValidationOption {
    repair = 0,
    checkTranslations = 1,
    deduplicateIds = 2,
    repairRequiredWithDefaults = 3,
    resolveConflictingUnions = 4,
    eraseInvalidValues = 5,
    checkRequirements = 6,
    checkFormat = 7,
    checkUniqueness = 8,
    checkReferences = 9,
    checkSpecification = 10,
    checkConstraints = 11,
}

export enum ImportMode {
    createAndUpdate = 0,
    create = 1,
    update = 2,
    safeUpdate = 3,
    replace = 4,
    delete = 5,
}

export enum ExportMode {
    normal = 0,
    publication = 1,
    localization = 2,
    extraction = 3,
}

export enum FilterOperator {
    greaterThan = 0,
    greaterThanOrEqual = 1,
    lessThan = 2,
    lessThanOrEqual = 3,
    equal = 4,
    notEqual = 5,
    like = 6,
    in = 7,
}

export enum SorterDirection {
    ascending = 0,
    descending = 1,
}

export interface Filter {
    readonly property: string;
    readonly operator: FilterOperator;
    readonly value: any;
    readonly caseSensitive: boolean;
}

export interface Sorter {
    readonly property: string;
    readonly direction: SorterDirection;
}

export interface ListDocumentParameters {
    readonly path: string;
    readonly skip: number;
    readonly take: number;
    readonly query: string;
    readonly select: readonly string[];
    readonly filters: readonly Filter[];
    readonly sorters: readonly Sorter[];
}

export interface ListResult {
    readonly documents: readonly Readonly<DataDocument>[];
    readonly metas: readonly Readonly<DataDocumentMeta>[];
    readonly total: number;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface FindResult {
    readonly document: Readonly<DataDocument> | null;
    readonly meta: Readonly<DataDocumentMeta>;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface FindRequest {
    readonly schemaNameOrId: string;
    readonly uniqueSchemaPropertyNameOrId: string;
    readonly uniqueSchemaPropertyValue: string;
}