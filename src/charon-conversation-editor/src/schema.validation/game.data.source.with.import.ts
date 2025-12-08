import { DataDocumentValue, ObservableLike, RootDocumentControl } from "charon-extensions";

type DataSource = Required<RootDocumentControl['services']['dataService']>;

// this ADHOC usage of internal API, do not use this code in your project

export type DataSourceWithImport = DataSource & {
    import(schemas: ReadonlyArray<string>, languages: ReadonlyArray<string>, collections: object,
        importMode: ImportMode, validationOptions?: ReadonlyArray<ValidationOption>, dryRun?: boolean): ObservableLike<BulkChangeResult>;
};

export interface BulkChangeResult {
    readonly changes: ReadonlyArray<BulkChangeRecord>;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface BulkChangeRecord {
    readonly id: DataDocumentValue;
    readonly newId: DataDocumentValue;
    readonly schemaName: string;
    readonly schemaId: string;
    readonly status: BulkChangeRecordStatus;
    readonly comment: string,
    readonly errors: ReadonlyArray<ValidationError>;
}

export interface ValidationError {
    readonly path: string;
    readonly message: string;
    readonly code: number;
}

export enum ImportMode {
    createAndUpdate = 0,
    create = 1,
    update = 2,
    safeUpdate = 3,
    replace = 4,
    delete = 5,
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

export enum BulkChangeRecordStatus {
    created = 0,
    updated = 1,
    deleted = 2,
    skipped = 3,
    unchanged = 4,
    error = 5,
}