import { ControlEventEmitOptions, DataDocument, DocumentCollectionControl, Schema, SchemaProperty } from "charon-extensions";
import { DevValueControl, valueControlByDataType } from "./dev.value.control";
import { DevDocumentControl } from "./dev.document.control";

export class DevDocumentCollectionControl<T extends DataDocument = DataDocument> extends DevValueControl<T[]> implements DocumentCollectionControl<T> {

    private readonly schema: Schema;

    public declare type: 'document-collection';

    public controls: DevDocumentControl<T>[];

    constructor(
        public baseValue: T[],
        public readonly schemaProperty: SchemaProperty
    ) {
        super(baseValue, schemaProperty);

        this.controls = [];
        this.schema = schemaProperty.getReferencedSchema();

        if (Array.isArray(baseValue)) {
            for (const document of baseValue) {
                if (document instanceof Object) {
                    this.append(document);
                }
            }
        } else {
            this.setValue([], { emitEvent: false, onlySelf: true });
        }
    }

    public append(document: T, opts?: ControlEventEmitOptions): DevDocumentControl<T> {
        return this.insertAt(this.controls.length, document, opts);
    }

    public insertAt(index: number, document: T, opts?: ControlEventEmitOptions): DevDocumentControl<T> {
        if (!(document instanceof Object)) {
            throw new Error('Invalid document object.');
        }

        const control = new DevDocumentControl(document as T, this.schemaProperty.getReferencedSchema().getIdProperty());
        control.parent = this;
        if (index >= this.controls.length) {
            this.controls.push(control);
        } else {
            this.controls.splice(index, 0, control);
        }
        this.updateValueAndValidity(opts);
        return control;
    }
    public swap(fromIndex: number, toIndex: number, opts?: ControlEventEmitOptions): void {
        if (fromIndex >= this.controls.length && toIndex >= this.controls.length) {
            return; // both indexes out of range
        } else if (fromIndex > toIndex) { // `from` should be less than `to`
            [fromIndex, toIndex] = [toIndex, fromIndex];
        } else if (fromIndex === toIndex) {
            return; // replace into same place
        }


        if (toIndex >= this.controls.length) {
            // move fromIndex to end of array
            this.controls.push(
                this.controls.splice(fromIndex, 1)[0]
            );
        } else {
            // swap values
            [this.controls[fromIndex], this.controls[toIndex]] = [this.controls[toIndex], this.controls[fromIndex]]
        }
        this.updateValueAndValidity(opts);
    }
    public removeAt(index: number, opts?: ControlEventEmitOptions): void {
        if (index >= this.controls.length) {
            return;
        }
        const removedControl = this.controls.splice(index, 1)[0];
        if (removedControl) {
            removedControl.parent = null;
        }
        this.updateValueAndValidity(opts);
    }
    public remove(document: T, opts?: ControlEventEmitOptions): boolean {
        if (!(document instanceof Object)) {
            throw new Error('Invalid document object.');
        }

        const indexOf = this.controls.findIndex(control => this.compareIds(control.value?.Id, document.Id));
        if (indexOf >= 0) {
            this.removeAt(indexOf, opts);
            return true;
        }
        return false;
    }

    public markAllAsTouched(opts?: ControlEventEmitOptions): void {
        this.markAsDirty(opts);
        this.forEachControl(control => control.markAllAsTouched({ ...(opts ?? {}), onlySelf: true }));
    }

    public markAllAsDirty(opts?: ControlEventEmitOptions): void {
        this.markAsDirty(opts);
        this.forEachControl(control => control.markAllAsDirty({ ...(opts ?? {}), onlySelf: true }));
    }

    public makeAllWriteable(opts?: ControlEventEmitOptions): void {
        this.makeWriteable(opts);
        this.forEachControl(control => control.makeAllWriteable({ ...(opts ?? {}), onlySelf: true }));
    }

    public makeAllReadOnly(opts?: ControlEventEmitOptions): void {
        this.makeReadOnly(opts);
        this.forEachControl(control => control.makeAllReadOnly({ ...(opts ?? {}), onlySelf: true }));
    }

    public setValue(value: T[], opts?: ControlEventEmitOptions): void {
        if (!Array.isArray(value)) {
            value = [];
        }

        // update/push control values
        for (let index = 0; index < value.length; index++) {
            const document = value[index];
            let control: DevDocumentControl<T>;
            if (index < this.controls.length) {
                control = this.controls[index];
            } else {
                control = new DevDocumentControl(document, this.schemaProperty);
                control.parent = this;
                this.controls.push(control);
            }
            if (control.value !== document) {
                control.setValue(document, { ...(opts ?? {}), onlySelf: true });
            }
        }

        // remove extra controls
        while (this.controls.length > value.length) {
            const removedControl = this.controls.pop();
            if (removedControl) {
                removedControl.parent = null;
            }
        }

        const newValue = this.mapEachControl(control => control.value);
        if (JSON.stringify(this.value) === JSON.stringify(newValue)) {
            return; // not changed
        }
        super.setValue(newValue, opts);
    }

    public patchValue(value: T[], opts?: ControlEventEmitOptions): void {
        if (!Array.isArray(value)) {
            return;
        }
        const newValue: T[] = [];
        for (let index = 0; index < Math.max(value.length, this.value.length); index++) {
            let newItem: T | undefined = value[index];
            const currentItem: T | undefined = this.value[index];
            if (!(newItem instanceof Object)) {
                newItem = undefined;
            }
            if (newItem != undefined || currentItem != undefined) {
                newValue.push(newItem ?? currentItem);
            }
        }
        this.setValue(newValue, opts);
    }

    public updateValueAndValidity(opts?: ControlEventEmitOptions): void {
        const newValue = this.mapEachControl((control) => control.value);
        this.setValue(newValue, opts);
    }

    public updateAllValueAndValidity(opts?: ControlEventEmitOptions): void {
        this.forEachControl(control => control.updateAllValueAndValidity({ ...(opts ?? {}), onlySelf: true }));
        this.updateValueAndValidity(opts);
    }
    public getPathFor(childControl?: DevValueControl): JsonPointer {
        const basePath = this.path;
        let index = 0;
        for (const control of this.controls) {
            if (Object.is(childControl, control)) {
                return basePath.append(String(index));
            }
            index++;
        }
        return basePath;
    }
    private forEachControl(fn: (control: DevValueControl, index: number) => void): void {
        let index = 0;
        for (const control of this.controls) {
            fn(control, index);
            index++;
        }
    }
    private mapEachControl<T>(fn: (control: DevValueControl, index: number) => T): T[] {
        const results = [];
        let index = 0;
        for (const control of this.controls) {
            const value = fn(control, index);
            results.push(value);
            index++;
        }
        return results;
    }
    private compareIds(id1: any, id2: any) {
        const schemaIdProperty = this.schema.getIdProperty();
        return id1 === id2 || schemaIdProperty.convertToString(id1) ===
            schemaIdProperty.convertToString(id2);
    }
}

valueControlByDataType['DocumentCollection'] = DevDocumentCollectionControl;