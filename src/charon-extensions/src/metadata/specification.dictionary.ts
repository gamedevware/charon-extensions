/**
 * Parsed specification dictionary providing access to UI hints and behavioral flags
 * configured on a schema or schema property via key=value specification strings.
 */
export declare interface SpecificationDictionary {
    /** Checks if the specification contains a key with the given value(s). */
    is(key: string, value: string | readonly string[]): boolean;
    /** Checks if the specification contains the given key. */
    has(key: string): boolean;
    /** Returns all values for the given key as a set, or null if key not present. */
    get(key: string): ReadonlySet<string> | null;
    /** Returns all key-value pairs as an array of tuples. */
    tuples(): ReadonlyArray<readonly [string, string]>;

    /** Whether this property is a pick list (PickList or MultiPickList with defined values). */
    isPickList(): boolean;
    /** Returns the UI layout row group name for this property, or null. Properties sharing the same row name are displayed in a single row. */
    getLayoutRowName(): string | null;
    /** Returns the display order within a layout row, or null. Controls field ordering when multiple properties share a layout row. */
    getLayoutOrder(): number | null;
    /** Returns the navigation menu folder path for this schema (e.g., "Economy/Shop"), or empty string. */
    getGroup(): string;
    /** Whether this property is hidden from the document form UI. */
    isDisplayHidden(): boolean;
    /** Returns the custom editor selector name for this property, or null. */
    getCustomEditor(): string | null;
    /** For Formula data type — returns parameter definitions as [name, typeName] tuples, or null. */
    getFunctionParameters(): ReadonlyArray<readonly [string, string]> | null;
    /** Returns the icon identifier for this schema, or null. */
    getIcon(): string | null;
    /** Returns the menu visibility for this schema ('visible' or 'hidden'). */
    getMenuVisibility(): 'visible' | 'hidden';
    /** Returns the generated code type name for Formula/PickList/MultiPickList properties, or null. Used as class/struct name in code generation. */
    getTypeName(): string | null;
    /** Returns the display text template string for formatting document labels, or null. */
    getDisplayTextTemplate(): string | null;
    /** Returns the parsed display text template with a render function, or null. */
    getParsedDisplayTextTemplate(): { render(document: any, schema: any): string } | null;
    /** Returns the numeric precision (decimal places) for Number data type, or null. */
    getPrecision(): number | null;
    /** Returns the display precision (visible decimal places) for Number data type, or null. */
    getDisplayPrecision(): number | null;
    /** Returns the minimum number of visible rows for collection/multiline properties, or null. */
    getMinRows(): number | null;
    /** Returns the maximum number of visible rows for collection/multiline properties, or null. */
    getMaxRows(): number | null;
    /** Returns pick list entries as [displayName, value, numericValue] tuples. */
    getPickList(): ReadonlyArray<readonly [string, string, bigint]>;
    /** Maps a pick list display value to its numeric representation, or null if not found. */
    mapPickList(value: any): bigint | null;
    /** Maps a multi-pick list display value to its numeric (flags) representation, or null if not found. */
    mapMultiPickList(value: any): bigint | null;
    /** Formats a numeric pick list value to its display string. */
    formatPickList(value: bigint | number): string;
    /** Formats a numeric multi-pick list (flags) value to its display string. */
    formatMultiPickList(value: number | bigint): string;
    /** Splits a multi-pick list (flags) value into individual flag values. */
    splitMultiPickList(value: number | bigint): bigint[];
    /** Returns the allowed asset type filter (e.g., "Texture", "Material") for asset fields. */
    getAssetTypes(): readonly string[];
    /** For Reference/ReferenceCollection — whether to show only local (sub-document) references in the suggestion dropdown. */
    getLocalOnly(): boolean;
    /** Returns the document path filter for reference fields, or null. */
    getPathFilter(): string | null;

    toString(): string;
}
