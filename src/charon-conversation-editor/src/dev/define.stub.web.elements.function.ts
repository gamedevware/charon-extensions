export function defineStubElements() {
    [
        'charon-text-field', 'charon-multiline-text-field', 'charon-localized-text-field',
        'charon-multiline-localized-text-field', 'charon-dropdown-logical-field', 'charon-time-field',
        'charon-date-field', 'charon-number-field', 'charon-integer-field', 'charon-dropdown-picklist-field',
        'charon-dropdown-multi-picklist-field', 'charon-document-collection-field',
        'charon-reference-collection-field', 'charon-formula-field', 'charon-id-field', 'charon-asset-field',
        'charon-numbers-field', 'charon-tags-field',

    ].forEach(elementTag => {
        if (customElements.get(elementTag)) {
            return;
        }
        customElements.define(elementTag, class extends HTMLElement {
            connectedCallback() {
                this.classList.add('x-charon-field-stub');
                this.classList.add(elementTag);
            }
        });
    });

    [
        'charon-document-form-view',
        'charon-document-json-view',
    ].forEach(elementTag => {
        if (customElements.get(elementTag)) {
            return;
        }
        customElements.define(elementTag, class extends HTMLElement {
            connectedCallback() {
                this.classList.add('x-charon-view-stub')
                this.classList.add(elementTag);
            }
        });
    });

    [
        'charon-asset-preview',
    ].forEach(elementTag => {
        if (customElements.get(elementTag)) {
            return;
        }
        customElements.define(elementTag, class extends HTMLElement {
            connectedCallback() {
                this.classList.add('x-charon-asset-preview-stub');
                this.classList.add(elementTag);
            }
        });
    });
}

