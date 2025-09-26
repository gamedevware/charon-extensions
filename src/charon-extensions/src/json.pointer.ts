declare global {
    /**
     * Represents a JSON Pointer as defined in RFC 6901
     * JSON Pointers are used to identify specific values within a JSON document
     * @see https://tools.ietf.org/html/rfc6901
     */
    export class JsonPointer {
        /** The JSON Pointer pointing to root document. Same as new `JsonPointer('')`. */
        static readonly root: JsonPointer;

        /** Array of path segments that make up the JSON Pointer */
        readonly segments: readonly string[];

        /** Number of segments in the JSON Pointer */
        readonly length: number;

        /** Creates JSON Pointer from slash delimiter path or path segments. */
        constructor(value: string | string[]);

        /**
         * Returns a new JsonPointer containing a subset of segments
         * @param start - Zero-based index at which to start extraction (inclusive)
         * @param end - Zero-based index at which to end extraction (exclusive)
         * @returns New JsonPointer containing the extracted segments
         * @example
         * const ptr = JsonPointer.parse('/a/b/c/d');
         * ptr.slice(1, 3); // Returns JsonPointer for '/b/c'
         */
        slice(start?: number, end?: number): JsonPointer;

        /**
         * Appends segments to the current JSON Pointer and returns a new one
         * @param value - Segments to append (JsonPointer, string, or string array)
         * @returns New JsonPointer with appended segments
         * @example
         * const base = JsonPointer.parse('/a/b');
         * base.append('/c/d'); // Returns JsonPointer for '/a/b/c/d'
         * base.append('c');    // Returns JsonPointer for '/a/b/c'
         * base.append(['c', 'd']); // Returns JsonPointer for '/a/b/c/d'
         */
        append(value: JsonPointer | string | string[]): JsonPointer;

        /**
         * Retrieves the value at the pointer location from a target object
         * @param target - The object to retrieve the value from
         * @param throwOnFail - Whether to throw an error if the path doesn't exist
         * @returns The value at the pointer location, or undefined if not found
         * @throws {Error} When throwOnFail is true and the path doesn't exist
         * @example
         * const obj = { a: { b: { c: 42 } } };
         * const ptr = JsonPointer.parse('/a/b/c');
         * ptr.get(obj, false); // Returns 42
         * ptr.get(obj, true);  // Returns 42
         * ptr.get({}, true);   // Throws Error
         */
        get(target: object, throwOnFail: boolean): any;

        /**
         * Sets a value at the pointer location in a target object
         * @param target - The object to set the value in
         * @param value - The value to set
         * @param createIfNotExists - Whether to create missing path segments
         * @param throwOnFail - Whether to throw an error if the operation fails
         * @returns True if the value was successfully set, false otherwise
         * @throws {Error} When throwOnFail is true and the operation fails
         * @example
         * const obj = { a: { b: {} } };
         * const ptr = JsonPointer.parse('/a/b/c');
         * ptr.set(obj, 42, true, false); // Returns true, obj becomes { a: { b: { c: 42 } } }
         * ptr.set({}, 42, false, false); // Returns false, path doesn't exist and createIfNotExists is false
         */
        set(target: object, value: any, createIfNotExists: boolean, throwOnFail: boolean): boolean;

        /**
         * Gets a specific segment from the JSON Pointer
         * @param index - Zero-based index of the segment to retrieve
         * @returns The segment at the specified index
         * @throws {Error} When index is out of bounds
         * @example
         * const ptr = JsonPointer.parse('/a/b/c');
         * ptr.getSegment(0); // Returns 'a'
         * ptr.getSegment(1); // Returns 'b'
         * ptr.getSegment(5); // Throws Error
         */
        getSegment(index: number): string;

        /**
         * Compares this JSON Pointer with another for equality
         * @param value - The JSON Pointer to compare with
         * @returns True if both pointers have the same segments in the same order
         * @example
         * const ptr1 = JsonPointer.parse('/a/b/c');
         * const ptr2 = JsonPointer.parse('/a/b/c');
         * ptr1.equals(ptr2); // Returns true
         */
        equals(value: JsonPointer): boolean;

        /**
         * Returns the string representation of the JSON Pointer
         * @returns The JSON Pointer as a string (e.g., '/a/b/c')
         */
        valueOf(): string;

        /**
         * Returns the string representation of the JSON Pointer for JSON serialization
         * @returns The JSON Pointer as a string
         */
        toJSON(): string;

        /**
         * Returns the string representation of the JSON Pointer
         * @returns The JSON Pointer as a string (e.g., '/a/b/c')
         */
        toString(): string;
    }
}

export { };