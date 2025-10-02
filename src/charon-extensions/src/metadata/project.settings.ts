import { Language } from "./language";

export declare interface ProjectSettings {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly copyright: string;
    readonly languages: string;
    readonly primaryLanguage: string;
    readonly extensions: string;

    getLanguages(): ReadonlyArray<Language>;
    getLanguageIds(): ReadonlyArray<string>;
    getPrimaryLanguage(): Language;
    getExtensions(): ReadonlyMap<string, string>;

    getHashCode(): number;
    toString(): string;
}