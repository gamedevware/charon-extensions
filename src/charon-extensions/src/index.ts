export declare interface CharonPropertyEditorElement {
    formControl: ValueControl;
}

export declare interface CharonSchemaEditorElement {
    formControl: DocumentControl;
}

export declare interface DocumentControl<TValue = any> extends Omit<ValueControl, 'schemaProperty'> {
    readonly schema: Schema;
}
export declare interface ValueControl<TValue = any> {
    readonly schemaProperty: SchemaProperty;
    readonly changeStatus: 'unchanged' | 'changed';
    readonly path: JsonPointer;
    readonly readOnly: boolean;
    readonly required: boolean;
    readonly baseValue: TValue;
    readonly startingValue: TValue;
    readonly parent: ValueControl | null;
    readonly root: ValueControl | null;
    readonly status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
    readonly valid: boolean;
    readonly invalid: boolean;
    readonly pending: boolean;
    readonly disabled: boolean;
    readonly enabled: boolean;
    readonly pristine: boolean;
    readonly dirty: boolean;
    readonly touched: boolean;
    readonly untouched: boolean;
    readonly errors: Object | null;
    readonly valueChanges: ObservableLike<TValue>;
    readonly statusChanges: ObservableLike<string>;
    readonly value: TValue;

    getByPath(path: JsonPointer | string): ValueControl | null;

    toggle(expand: boolean, onlySelf: boolean): Promise<never>;
    focus(options?: FocusOptions, targetName?: string): void;

    onFocus(focused: boolean, focusTargetValueControl?: ValueControl): void;
    registerDoToggle(fn: (expand: boolean) => Promise<any>): TeardownLogic;
    registerDoFocus(fn: (options?: FocusOptions) => void, targetName?: string): TeardownLogic;

    addValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;
    addAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;
    removeValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;
    removeAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;
    hasValidator(validator: ValueValidatorFn): boolean;
    hasAsyncValidator(validator: AsyncValueValidatorFn): boolean;

    markAsTouched(opts?: ControlEventEmitOptions): void;
    markAllAsTouched(opts?: ControlEventEmitOptions): void
    markAsUntouched(opts?: ControlEventEmitOptions): void;
    markAsDirty(opts?: ControlEventEmitOptions): void;
    markAllAsDirty(opts?: ControlEventEmitOptions): void;
    markAsPristine(opts?: ControlEventEmitOptions): void;
    markAsPending(opts?: ControlEventEmitOptions): void;

    disable(opts?: ControlEventEmitOptions): void;
    enable(opts?: ControlEventEmitOptions): void;

    setValue(value: TValue, options?: ControlEventEmitOptions): void;
    patchValue(value: TValue, options?: ControlEventEmitOptions): void;
    reset(value?: TValue, options?: ControlEventEmitOptions): void;

    getRawValue(): any;
    updateValueAndValidity(opts?: ControlEventEmitOptions): void;
    updateAllValueAndValidity(options?: ControlEventEmitOptions): void;

    setErrors(errors: Object | null, opts?: ControlEventEmitOptions): void;
    getError(errorCode: string, path?: Array<string | number> | string): any;
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
}

export const ERROR_CUSTOM_PROPERTY = 'custom';

export type TeardownLogic = () => void;

export declare interface ValueValidatorFn {
    (control: ValueControl): Object | null;
}

export declare interface AsyncValueValidatorFn {
    (control: ValueControl): Promise<Object | null>;
}

declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}

export declare interface ObserverLike<T> {
    next: (value: T) => void;
    error: (err: any) => void;
    complete: () => void;
}
1
export declare interface SubscribableLike<T> {
    subscribe(observer?: Partial<ObserverLike<T>>): { unsubscribe(): void; };
}

export declare interface ObservableLike<T> extends SubscribableLike<T> {
    [Symbol.observable]: () => SubscribableLike<T>
}

export declare interface ControlEventEmitOptions {
    onlySelf?: boolean;
    emitEvent?: boolean;
}

export declare interface JsonPointer {
    readonly segments: readonly string[];
    readonly length: number;

    slice(start?: number, end?: number): JsonPointer;
    append(value: JsonPointer | string | string[]): JsonPointer;
    get(target: object, throwOnFail: boolean): any;
    set(target: object, value: any, createIfNotExists: boolean, throwOnFail: boolean): boolean;
    getSegment(index: number): string;

    equals(value: JsonPointer): boolean;
    valueOf(): string;
    toJSON(): string;
    toString(): string;
}

export declare interface Metadata {
    readonly projectSettings: ProjectSettings;

    getSchemas(): IterableIterator<Schema>;
    getSchema(schemaNameOrId: string): Schema;
    findSchema(schemaNameOrId: string): Schema | null;
    hasSchema(schemaNameOrId: string): boolean;
    getSharedSchemaProperties(): IterableIterator<SchemaProperty>;
    getSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty;
    findSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty | null;
    hasSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): boolean;

    getHashCode(): number
}

export declare interface ProjectSettings {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly copyright: string;
    readonly languages: string;
    readonly primaryLanguage: string;
    readonly extensions: string;

    getLanguages(): ReadonlyArray<Language>;
    getLanguageIds(): ReadonlyArray<string>;
    getPrimaryLanguage(): Language;
    getExtensions(): ReadonlyMap<string, string>;

    getHashCode(): number;
    toString(): string;
}

export declare interface Language {
    readonly id: string,
    readonly lcid: string,
    readonly name: string,
    readonly twoLetterIsoName: string
}

export declare interface Schema {
    readonly metadata: Metadata;

    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly type: SchemaType;
    readonly idGenerator: IdGeneratorType;
    readonly specification: string;
    readonly properties: readonly SchemaProperty[];
    readonly group: string;

    getSpecification(): SpecificationDictionary;
    hasSchemaProperty(schemaPropertyIdOrName: string): boolean;
    findSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty | null;
    getSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty;
    getReferencedBySchemas(): ReadonlySet<Schema>;
    getReferencedBySchemaProperty(): ReadonlySet<SchemaProperty>;
    getContainedBySchemas(): ReadonlySet<Schema>;
    getSchemaPropertyOrder(): ReadonlyArray<string>;
    getSchemaPropertyNames(): ReadonlySet<string>;
    getUniqueSchemaProperties(): ReadonlySet<SchemaProperty>;
    getIdProperty(): SchemaProperty;
    convertIdToString(id: any): string;
    formatDisplayName(document: object, specificationOverride?: SpecificationDictionary): string;

    getHashCode(): number;
    toString(): string;
}

export declare interface SchemaProperty {
    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly dataType: DataType;
    readonly defaultValue: string | null;
    readonly uniqueness: Uniqueness;
    readonly requirement: Requirement;
    readonly referenceType: SchemaReference | null;
    readonly sharedProperty: SchemaReference | null;
    readonly size: number;
    readonly specification: string;

    readonly metadata: Metadata;
    readonly schema: Schema;

    getReferencedSchema(): Schema;
    getSpecification(): SpecificationDictionary;
    getTypedDefaultValue(): any;
    getValueForNewDocument(): any;
    convertFrom(value: any): any;
    convertToString(value: any): string | null;
    convertToDisplayString(value: any): string;
    valuesAreEquals(left: any, right: any): boolean;
    getMinValue(): bigint | undefined;
    getMaxValue(): bigint | undefined;

    getHashCode(): number;
    toString(): string;
}

export declare interface SpecificationDictionary {
    is(key: string, value: string | readonly string[]): boolean;
    has(key: string): boolean;
    get(key: string): ReadonlySet<string> | null;
    tuples(): ReadonlyArray<readonly [string, string]>;

    isPickList(): boolean;
    getLayoutRowName(): string | null;
    getLayoutOrder(): number | null;
    getGroup(): string;
    isDisplayHidden(): boolean;
    getCustomFormEditor(): string | null;
    getCustomGridEditor(): string | null;
    getFunctionParameters(): ReadonlyArray<readonly [string, string]> | null;
    getIcon(): string | null;
    getMenuVisibility(): 'visible' | 'hidden';
    getTypeName(): string | null;
    getDisplayNameTemplate(): string | null;
    getHelpLink(): string | null;
    getPrecision(): number | null;
    getDisplayPrecision(): number | null;
    getMinRows(): number | null;
    getMaxRows(): number | null;
    getPickList(): ReadonlyArray<readonly [string, string]>;
    getMultiPickList(): ReadonlyArray<readonly [string, string]>;
    mapPickList(value: any): bigint | null;
    mapMultiPickList(value: any): bigint | null;
    formatPickList(value: bigint | number): string;
    formatMultiPickList(value: number | bigint): string;
    splitMultiPickList(value: number | bigint): bigint[];

    toString(): string;
}

export declare interface SchemaReference {
    readonly id: string;
    readonly displayName: string;

    getSchema(): Schema;

    toString(): string;
}


export const enum IdGeneratorType {
    None = 0,
    ObjectId = 1,
    Guid = 2,
    Sequence = 3,
    GlobalSequence = 4
}

export const enum SchemaType {
    Normal = 0,
    Component = 1,
    Settings = 2,
}

export const enum Uniqueness {
    None = 0,
    Unique = 1,
    UniqueInCollection = 2,
}

export const enum Requirement {
    None = 0,
    NotNull = 2,
    NotEmpty = 3,
}

export const enum DataType {
    Text = 0,
    LocalizedText = 1,
    Logical = 5,
    Time = 8,
    Date = 9,
    Number = 12,
    Integer = 13,
    PickList = 18,
    MultiPickList = 19,
    Document = 22,
    DocumentCollection = 23,
    Reference = 28,
    ReferenceCollection = 29,
    Formula = 35
}