/** Defines the requirement level for a schema property value. */
export enum Requirement {
    /** No requirement — value can be null or empty. */
    None = 0,
    /** Value must not be null. */
    NotNull = 2,
    /** Value must not be null or empty (e.g., non-empty string, non-empty collection). */
    NotEmpty = 3
}
