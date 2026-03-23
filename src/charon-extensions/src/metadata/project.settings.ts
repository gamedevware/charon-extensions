import { Language } from "./language";

/** Project-wide settings and configuration. */
export declare interface ProjectSettings {
    /** Unique project identifier. */
    readonly id: string;
    /** Project name. */
    readonly name: string;
    /** Project version string. */
    readonly version: string;
    /** Copyright notice text. */
    readonly copyright: string;
    /** Raw languages configuration string. */
    readonly languages: string;
    /** IETF language tag of the primary (source) language. */
    readonly primaryLanguage: string;
    /** Raw extensions configuration string. */
    readonly extensions: string;

    /** Returns all configured languages as parsed {@link Language} objects. */
    getLanguages(): ReadonlyArray<Language>;
    /** Returns the IETF language tag ids of all configured languages. */
    getLanguageIds(): ReadonlyArray<string>;
    /** Returns the primary (source) {@link Language}. */
    getPrimaryLanguage(): Language;
    /** Returns installed extensions as a map of package name to version. */
    getExtensions(): ReadonlyMap<string, string>;

    getHashCode(): number;
    toString(): string;
}
