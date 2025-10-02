import { ControlEventEmitOptions, DataDocument, DocumentControl, Schema, SchemaProperty, ValueControl } from "charon-extensions";
import { DevValueControl, valueControlByDataType } from "./dev.value.control";

export class DevDocumentControl<T extends DataDocument = DataDocument> extends DevValueControl<T> implements DocumentControl<T> {
    public declare type: 'document';

    public readonly controls: DocumentControl<T>['controls'];

    public readonly schema: Schema;

    private get isValidDocument(): boolean {
        return this.value instanceof Object;
    }

    constructor(
        public baseValue: T,
        public readonly schemaProperty: SchemaProperty,
    ) {
        super(baseValue, schemaProperty, 'document');

        this.schema = schemaProperty.name === 'Id' ? schemaProperty.schema! : schemaProperty.getReferencedSchema();
        this.controls = Object.fromEntries(this.schema
            .properties
            .map(schemaProperty => [
                schemaProperty.name,
                DevValueControl.create(this, schemaProperty, baseValue instanceof Object ? baseValue[schemaProperty.name] : null)
            ])
        ) as any;
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

    public setValue(value: T, opts?: ControlEventEmitOptions): void {
        if (value instanceof Object) {
            for (const properptyName in value) {
                if (!Object.getOwnPropertyDescriptor(this.value, properptyName)) continue;

                const propertyValue = value[properptyName];
                const propertyControl = this.controls[properptyName] as ValueControl;
                if (!propertyControl || propertyControl.value === propertyValue) {
                    continue; // wrong or same value
                }
                propertyControl.setValue(propertyValue, { ...(opts ?? {}), onlySelf: true });
            }
            const newValue = Object.fromEntries(this.mapEachControl((control, controlName) => [controlName, control.value])) as T;
            if (JSON.stringify(this.value) === JSON.stringify(newValue)) {
                return; // not changed
            }
            super.setValue(newValue, opts);
        }
        else {
            super.setValue(value, opts);
            return;
        }
    }

    public patchValue(value: T, opts?: ControlEventEmitOptions): void {
        if (!(value instanceof Object)) {
            return;
        }
        const newValue = { ...Object.fromEntries(this.mapEachControl((control, controlName) => [controlName, control.value])), ...value };
        this.setValue(newValue, opts);
    }

    public updateValueAndValidity(opts?: ControlEventEmitOptions): void {
        if (!this.isValidDocument) {
            return;
        }

        const newValue = Object.fromEntries(this.mapEachControl((control, controlName) => [controlName, control.value]));
        this.setValue(newValue as T, opts);
    }

    public updateAllValueAndValidity(opts?: ControlEventEmitOptions): void {
        this.forEachControl(control => control.updateAllValueAndValidity({ ...(opts ?? {}), onlySelf: true }));
        this.updateValueAndValidity(opts);
    }

    public getPathFor(childControl?: DevValueControl): JsonPointer {
        const basePath = this.path;
        for (const controlName in this.controls) {
            if (!Object.getOwnPropertyDescriptor(this.controls, controlName)) continue;

            const control = this.controls[controlName] as DevValueControl;
            if (Object.is(childControl, control)) {
                return basePath.append(controlName);
            }
        }
        return basePath;
    }

    private forEachControl(fn: (control: DevValueControl, controlName: string) => void): void {
        for (const controlName in this.controls) {
            if (!Object.getOwnPropertyDescriptor(this.controls, controlName)) continue;

            const control = this.controls[controlName] as DevValueControl;
            fn(control, controlName);
        }
    }
    private mapEachControl<T>(fn: (control: DevValueControl, controlName: string) => T): T[] {
        const results = [];
        for (const controlName in this.controls) {
            if (!Object.getOwnPropertyDescriptor(this.controls, controlName)) continue;

            const control = this.controls[controlName] as DevValueControl;
            const value = fn(control, controlName);
            results.push(value);
        }
        return results;
    }
}

valueControlByDataType['Document'] = DevDocumentControl;