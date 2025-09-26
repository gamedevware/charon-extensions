import { RootDocumentControl, ValueControl } from './controls';

export * from './reactive';
export * from './controls';
export * from './metadata';
export * from './time.span';
export * from './json.pointer';

export const ERROR_CUSTOM_PROPERTY = 'custom';

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    type WithProperties<P> = {
        [property in keyof P]: P[property];
    };

    interface DocumentViewComponent { documentControl: RootDocumentControl }

    interface DocumentFieldComponent { valueControl: ValueControl }
    interface DocumentFormViewComponent extends DocumentViewComponent { excludeProperties?: string[], includeProperties?: string[] }
    interface DocumentNumbersFieldComponent extends DocumentFieldComponent { components: string[]; isInteger: boolean }
    interface DocumentAllowMultipleFieldComponent extends DocumentFieldComponent { allowMultiple: boolean }
    interface AssetPreviewComponent { valueControl: ValueControl; value: string; size: number }

    interface HTMLElementTagNameMap {
        // views
        'charon-document-form-view': HTMLElement & WithProperties<DocumentFormViewComponent>;
        'charon-document-json-view': HTMLElement & WithProperties<DocumentViewComponent>;

        // fields
        'charon-text-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-multiline-text-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-localized-text-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-multiline-localized-text-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-dropdown-logical-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-time-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-date-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-number-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-integer-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-dropdown-picklist-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-dropdown-multi-picklist-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-document-collection-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-reference-collection-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-formula-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-id-field': HTMLElement & WithProperties<DocumentFieldComponent>;
        'charon-asset-field': HTMLElement & WithProperties<DocumentAllowMultipleFieldComponent>;
        'charon-asset-preview': HTMLElement & WithProperties<AssetPreviewComponent>;
        'charon-numbers-field': HTMLElement & WithProperties<DocumentNumbersFieldComponent>;
        'charon-tags-field': HTMLElement & WithProperties<DocumentAllowMultipleFieldComponent>;
    }
}
/* eslint-enable @typescript-eslint/naming-convention */