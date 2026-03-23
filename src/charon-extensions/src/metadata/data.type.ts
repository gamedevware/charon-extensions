/** Defines the data type of a schema property, determining how values are stored, validated, and presented. */
export enum DataType {
    /** Plain text string. */
    Text = 0,
    /** Text string with per-language translations. */
    LocalizedText = 1,
    /** Boolean value (true/false). */
    Logical = 5,
    /** Time-of-day value (TimeSpan). */
    Time = 8,
    /** Calendar date value. */
    Date = 9,
    /** Floating-point number. */
    Number = 12,
    /** Whole number (integer). */
    Integer = 13,
    /** Single selection from a predefined list of values. */
    PickList = 18,
    /** Multiple selections from a predefined list of values (flags). */
    MultiPickList = 19,
    /** Embedded sub-document (Component or Union schema). */
    Document = 22,
    /** Collection of embedded sub-documents (Component or Union schema). */
    DocumentCollection = 23,
    /** Reference to a document in another schema by its Id. */
    Reference = 28,
    /** Collection of references to documents in another schema. */
    ReferenceCollection = 29,
    /** Computed expression with a parsed AST representation. */
    Formula = 35
}
