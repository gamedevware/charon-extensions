/** Defines the strategy used to auto-generate document Id values. */
export enum IdGeneratorType {
    /** No auto-generation — Id must be provided manually. */
    None = 0,
    /** Generates a MongoDB-style ObjectId (24-char hex string). */
    ObjectId = 1,
    /** Generates a GUID/UUID string. */
    Guid = 2,
    /** Generates a sequential integer, unique within this schema. */
    Sequence = 3,
    /** Generates a sequential integer, unique across all schemas in the project. */
    GlobalSequence = 4
}
