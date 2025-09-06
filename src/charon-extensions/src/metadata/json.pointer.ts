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
