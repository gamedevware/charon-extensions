import { ControlEventEmitOptions, DataDocumentId, DataDocumentReference, ReferenceCollectionControl, Schema, SchemaProperty } from "charon-extensions";
import { DevValueControl, valueControlByDataType } from "./dev.value.control";

export class DevReferenceCollectionControl<T extends DataDocumentReference = DataDocumentReference> extends DevValueControl<T[]> implements ReferenceCollectionControl<T> {

    private readonly schema: Schema;

    public declare type: 'reference-collection';

    constructor(
        public baseValue: T[],
        public readonly schemaProperty: SchemaProperty,
    ) {
        super(baseValue, schemaProperty);

        this.schema = schemaProperty.getReferencedSchema();

        if (Array.isArray(baseValue)) {
            for (const document of baseValue) {
                if (document instanceof Object) {
                    this.append(document);
                }
            }
        }
    }

    public containsId(id: DataDocumentId): boolean {
        return this.value.some(documentReference => this.compareIds(documentReference.Id, id));
    }
    public append(documentReference: T, opts?: ControlEventEmitOptions): void {
        this.insertAt(this.value.length, documentReference, opts);
    }
    public insertAt(index: number, documentReference: T, opts?: ControlEventEmitOptions): void {
        if (!(documentReference instanceof Object)) {
            throw new Error('Invalid document reference object.');
        }
        const newValues = [...this.value];
        if (index >= newValues.length) {
            newValues.push(documentReference);
        } else {
            newValues.splice(index, 0, documentReference);
        }
        this.setValue(newValues, opts);
    }
    public swap(fromIndex: number, toIndex: number, opts?: ControlEventEmitOptions): void {
        if (fromIndex >= this.value.length && toIndex >= this.value.length) {
            return; // both indexes out of range
        } else if (fromIndex > toIndex) { // `from` should be less than `to`
            [fromIndex, toIndex] = [toIndex, fromIndex];
        } else if (fromIndex === toIndex) {
            return; // replace into same place
        }

        const newValues = [...this.value];
        if (toIndex >= newValues.length) {
            // move fromIndex to end of array
            newValues.push(
                newValues.splice(fromIndex, 1)[0]
            );
        } else {
            // swap values
            [newValues[fromIndex], newValues[toIndex]] = [newValues[toIndex], newValues[fromIndex]]
        }
        this.setValue(newValues, opts);
    }
    public removeAt(index: number, opts?: ControlEventEmitOptions): void {
        if (index >= this.value.length) {
            return;
        }
        const newValues = [...this.value];
        newValues.splice(index, 1);
        this.setValue(newValues, opts);
    }
    public remove(documentReference: T, opts?: ControlEventEmitOptions): boolean {
        if (!(documentReference instanceof Object)) {
            throw new Error('Invalid document reference object.');
        }

        const indexOf = this.value.findIndex(item => this.compareIds(documentReference.Id, item.Id));
        if (indexOf >= 0) {
            this.removeAt(indexOf, opts);
            return true;
        }
        return false;
    }
    private compareIds(id1: any, id2: any) {
        const schemaIdProperty = this.schema.getIdProperty();
        return id1 === id2 || schemaIdProperty.convertToString(id1) ===
            schemaIdProperty.convertToString(id2);
    }
}

valueControlByDataType['ReferenceCollection'] = DevReferenceCollectionControl;