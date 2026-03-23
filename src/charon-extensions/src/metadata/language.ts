/** Describes a language configured in the project, used for LocalizedText translations. */
export declare interface Language {
    /** Unique identifier (IETF language tag, e.g., "en-US"). */
    readonly id: string;
    /** Locale identifier (LCID) string. */
    readonly lcid: string;
    /** Human-readable language name (e.g., "English (United States)"). */
    readonly name: string;
    /** Two-letter ISO 639-1 language code (e.g., "en"). */
    readonly twoLetterIsoName: string;
}
