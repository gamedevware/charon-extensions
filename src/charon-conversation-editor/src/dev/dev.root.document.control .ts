import { DataDocument, RootDocumentControl, Schema, SchemaProperty } from "charon-extensions";
import { DevValueControl } from "./dev.value.control";
import { DevDocumentControl } from "./dev.document.control";
import { RootDocumentControlServices } from "charon-extensions/dist/controls/root.document.services.services";

export class DevRootDocumentControl<T extends DataDocument = DataDocument> extends DevDocumentControl<T> implements RootDocumentControl<T> {
    public declare type: 'document';
    public declare schemaProperty: SchemaProperty & undefined;
    public controls: RootDocumentControl<T>['controls'];

    public readonly services: Partial<RootDocumentControlServices>;

    constructor(
        public baseValue: T,
        public readonly schema: Schema,
    ) {
        super(baseValue, schema.getIdProperty());

        this.controls = Object.fromEntries(schema
            .properties
            .map(schemaProperty => [
                schemaProperty.name,
                DevValueControl.create(this, schemaProperty, baseValue instanceof Object ? baseValue[schemaProperty.name] : null)
            ])
        ) as any;

        this.services = {};
    }
}