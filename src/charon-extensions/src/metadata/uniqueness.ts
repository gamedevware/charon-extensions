/** Defines the uniqueness constraint for a schema property value. */
export enum Uniqueness {
    /** No uniqueness constraint. */
    None = 0,
    /** Value must be unique across all documents of this schema. */
    Unique = 1,
    /** Value must be unique within the containing document collection (for sub-documents). */
    UniqueInCollection = 2
}
