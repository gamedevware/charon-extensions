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
    getCustomEditor(): string | null;
    getFunctionParameters(): ReadonlyArray<readonly [string, string]> | null;
    getIcon(): string | null;
    getMenuVisibility(): 'visible' | 'hidden';
    getTypeName(): string | null;
    getDisplayTextTemplate(): string | null;
    getParsedDisplayTextTemplate(): { render(document: any, schema: any): string } | null;
    getPrecision(): number | null;
    getDisplayPrecision(): number | null;
    getMinRows(): number | null;
    getMaxRows(): number | null;
    getPickList(): ReadonlyArray<readonly [string, string, bigint]>;
    mapPickList(value: any): bigint | null;
    mapMultiPickList(value: any): bigint | null;
    formatPickList(value: bigint | number): string;
    formatMultiPickList(value: number | bigint): string;
    splitMultiPickList(value: number | bigint): bigint[];
    getAssetTypes(): readonly string[];
    getLocalOnly(): boolean;
    getPathFilter(): string | null;

    toString(): string;
}
