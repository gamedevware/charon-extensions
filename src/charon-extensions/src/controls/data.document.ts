
export interface DataDocument {
    [index: string]: DataDocumentValue | undefined;
    'Id': DataDocumentId;
}

export interface DataDocumentReference {
    'Id': DataDocumentId;
    'Icon'?: string;
    'DisplayName'?: DataDocumentValue;
}

export type IetfLanguageTag = string;

export type DataLocalizationDocument = { [key in IetfLanguageTag]?: string | null; } &
{
    'notes'?: string | DataLocalizationNotesDocument | null;
};

export interface DataLocalizationNotesDocument {
    'comment'?: string | null;
    'stale'?: StaleTranslationList | null;
};

export type StaleTranslationList = { [key in IetfLanguageTag]?: boolean | null; };

export type DataDocumentId = string | number | boolean | Date | bigint | TimeSpan;

export type DataDocumentById = { [id: string]: DataDocument | null | undefined } & object;

export interface DataFormulaDocument {
    expressionType: string;
    _pos?: string;
    [index: string]: any | undefined;
}

export type DataDocumentValue = DataDocument | Array<DataDocument> | DataDocumentById | DataDocumentId | DataFormulaDocument |
    DataDocumentReference | DataLocalizationDocument | object | null;