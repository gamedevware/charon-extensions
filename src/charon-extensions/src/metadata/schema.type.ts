/** Defines the structural type of a schema, determining how its documents are stored, displayed, and managed. */
export enum SchemaType {
    /** Default type for independent entities. Documents are standalone root-level entries visible in the navigation menu. */
    Normal = 0,
    /** Sub-object that exists exclusively embedded within other documents via Document/DocumentCollection properties. Never appears as a standalone entry. */
    Component = 1,
    /** Singleton schema — exactly one document may exist. Created automatically on first access, cannot be deleted. Suitable for project-wide configuration. */
    Settings = 2,
    /** Tagged union enabling a single property slot to hold different document shapes. Uses property-key presence as discriminator with sparse storage. */
    Union = 3,
}
