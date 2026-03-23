import type { DocumentControl, ValueControl } from './controls';

export * from './reactive';
export * from './controls';
export * from './metadata';
export * from './services';
export * from './property.editor.element';
export * from './schema.editor.element';
export * from './time.span';
export * from './json.pointer';
export * from './app.version';


/** Error code key used for custom validation errors set via {@link ValueControl.setErrors}. */
export const ERROR_CUSTOM_PROPERTY = 'custom';

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    /** Utility type that maps an interface's properties onto an object type. Used for typing Web Component property bags. */
    type WithProperties<P> = {
        [property in keyof P]: P[property];
    };

    /** Props for a Charon built-in document view component (e.g., form view, JSON view). */
    interface DocumentViewComponent { documentControl: DocumentControl }
    /** Props for a Charon built-in field component. */
    interface DocumentFieldComponent { valueControl: ValueControl }
    /** Props for the document form view, with optional property inclusion/exclusion filters. */
    interface DocumentFormViewComponent extends DocumentViewComponent { excludeProperties?: string[], includeProperties?: string[] }
    /** Props for the compound numbers field (e.g., Vector2, Vector3), specifying component names and integer mode. */
    interface DocumentNumbersFieldComponent extends DocumentFieldComponent { components: string[]; isInteger: boolean }
    /** Props for field components that support multi-value selection (e.g., asset fields, tags). */
    interface DocumentAllowMultipleFieldComponent extends DocumentFieldComponent { allowMultiple: boolean }
    /** Props for the asset preview component. */
    interface AssetPreviewComponent { valueControl: DocumentControl | ValueControl; value: string; size: number }

    /** Type-safe mapping of Charon's built-in custom HTML element tag names to their typed interfaces. */
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