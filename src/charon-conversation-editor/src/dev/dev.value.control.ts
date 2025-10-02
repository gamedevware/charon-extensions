import {
    AsyncValueValidatorFn, ControlEventEmitOptions, ObservableLike, SchemaProperty,
    TeardownLogic, ValueControl, ValueValidatorFn, isDocumentCollectionControl, isDocumentControl,
    ValueControlType,
    DataType,
    DoExpandHandler,
    DoFocusHandler,
    OnFocusHandler,
    ValueControlStatus,
    Requirement
} from "charon-extensions";
import { Subject } from "rxjs";

export class DevValueControl<T = any> implements ValueControl<T> {
    private readonly _valueChanges: Subject<T>;
    private readonly _statusChanges: Subject<ValueControlStatus>;
    private readonly _validators: ValueValidatorFn[];
    private readonly _asyncValidators: AsyncValueValidatorFn[];

    private _doFocusHandlers?: { fn: DoFocusHandler; targetName?: string }[];
    private _onFocusHandlers?: OnFocusHandler[];
    private _doExpandHandlers?: DoExpandHandler[];

    public changeStatus: "unchanged" | "changed";
    public readOnly: boolean;
    public required: boolean;
    public startingValue: T;
    public parent: DevValueControl | null;
    public status: ValueControlStatus;
    public get root(): DevValueControl | null {
        if (this.parent) {
            return this.parent.root;
        } else {
            return this;
        }
    }
    public get valid(): boolean {
        return this.status !== 'INVALID';
    }
    public get invalid(): boolean {
        return this.status === 'INVALID';
    }
    public get pending(): boolean {
        return this.status === 'PENDING';
    }
    public get disabled(): boolean {
        return this.status === 'DISABLED';
    }
    public get enabled(): boolean {
        return this.status !== 'DISABLED';
    }
    public get pristine(): boolean {
        return this.changeStatus === 'unchanged';
    }
    public get dirty(): boolean {
        return this.changeStatus !== 'unchanged';
    }
    public touched: boolean;
    public get untouched(): boolean {
        return !this.touched;
    }
    public errors: object | null;
    public get valueChanges(): ObservableLike<T> {
        return this._valueChanges.asObservable() as unknown as ObservableLike<T>;
    }
    public get statusChanges(): ObservableLike<ValueControlStatus> {
        return this._statusChanges.asObservable() as unknown as ObservableLike<ValueControlStatus>;
    }
    public get path(): JsonPointer {
        if (this.parent) {
            return this.parent.getPathFor(this).append(this.schemaProperty.name);
        } else {
            return JsonPointer.root;
        }
    }
    public value: T;
    readonly type: ValueControlType;

    constructor(
        public baseValue: T,
        public readonly schemaProperty: SchemaProperty,
        type?: ValueControlType,
    ) {
        this.changeStatus = 'unchanged';
        this.readOnly = false;
        this.required = schemaProperty.requirement !== Requirement.None;
        this.startingValue = baseValue ?? null as T; // can't be undefined, but can be null regardless of T type 
        this.parent = null;
        this.status = 'VALID';
        this.touched = false;
        this.errors = null;
        this.value = this.baseValue
        this._statusChanges = new Subject();
        this._valueChanges = new Subject();
        this._validators = [];
        this._asyncValidators = [];

        this.type = type ?? this.getTypeFromProperty(schemaProperty);
    }

    public getByPath(path: JsonPointer | string): ValueControl | null {
        const segments = (typeof path === 'string') ? path.split('/') : [...path.segments];
        if (segments[0] === '') {
            segments.unshift();
        }

        let target: ValueControl | null = this as ValueControl;
        for (const pathSection of segments) {
            if (!target) {
                break;
            }

            if (pathSection === '') {
                continue;
            } else if (isDocumentCollectionControl(target)) {
                const index = Number(pathSection);
                if (Number.isNaN(index)) {
                    return null;
                }
                target = target.controls[index] ?? null;
            } else if (isDocumentControl(target)) {
                target = target.controls[pathSection] ?? null;
            } else {
                target = null;
            }
        }

        return target;
    }
    public toggle(expand: boolean, opts?: ControlEventEmitOptions): Promise<void> {
        const promises = [];
        if (this._doExpandHandlers) {
            for (const _doExpandHandler of this._doExpandHandlers) {
                promises.push(_doExpandHandler(expand));
            };
        }

        if (opts?.onlySelf !== true) {
            let parent = this.parent;
            while (parent && 'toggle' in parent) {
                promises.push(parent.toggle(expand, { ...(opts ?? {}), onlySelf: true }));
                parent = parent.parent;
            }
        }

        if (!promises.length) {
            return Promise.resolve();
        }
        return Promise.allSettled(promises) as Promise<any>;
    }
    public focus(opts?: FocusOptions, targetName?: string): void {
        if (this._doFocusHandlers) {
            for (const _doFocusHandler of this._doFocusHandlers) {
                if (targetName && targetName !== _doFocusHandler.targetName) {
                    continue;
                }
                _doFocusHandler.fn(opts);
            };
        }
    }
    public onFocus(focused: boolean, focusTargetValueControl?: ValueControl): void {
        focusTargetValueControl = focusTargetValueControl ?? this;

        if (this._onFocusHandlers) {
            for (const _onFocus of this._onFocusHandlers) {
                _onFocus(focusTargetValueControl, focused);
            };
        }

        if (this.parent) {
            this.parent.onFocus(focused, focusTargetValueControl);
        }
    }
    public registerOnFocus(fn: OnFocusHandler): TeardownLogic {
        if (typeof fn !== 'function') {
            return;
        }
        if (!this._onFocusHandlers) {
            this._onFocusHandlers = [];
        }
        this._onFocusHandlers.push(fn);

        return () => {
            if (!this._onFocusHandlers) {
                return;
            }
            const index = this._onFocusHandlers.indexOf(fn);
            if (index >= 0) {
                this._onFocusHandlers.splice(index, 1);
            }
        };
    }
    public registerDoToggle(fn: DoExpandHandler): TeardownLogic {
        if (typeof fn !== 'function') {
            return;
        }
        if (!this._doExpandHandlers) {
            this._doExpandHandlers = [];
        }
        this._doExpandHandlers.push(fn);

        return () => {
            if (!this._doExpandHandlers) {
                return;
            }
            const index = this._doExpandHandlers.indexOf(fn);
            if (index >= 0) {
                this._doExpandHandlers.splice(index, 1);
            }
        };
    }
    public registerDoFocus(fn: DoFocusHandler, targetName?: string): TeardownLogic {
        if (typeof fn !== 'function') {
            return;
        }
        if (!this._doFocusHandlers) {
            this._doFocusHandlers = [];
        }
        const handler = { fn, targetName };
        this._doFocusHandlers.push(handler);

        return () => {
            if (!this._doFocusHandlers) {
                return;
            }
            const index = this._doFocusHandlers.indexOf(handler);
            if (index >= 0) {
                this._doFocusHandlers.splice(index, 1);
            }
        };
    }
    public addValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void {
        if (Array.isArray(validators)) {
            for (const validator of validators) {
                this._validators.push(validator);
            }
        } else if (validators) {
            this._validators.push(validators);
        }
    }
    public addAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void {
        if (Array.isArray(validators)) {
            for (const validator of validators) {
                this._asyncValidators.push(validator);
            }
        } else if (validators) {
            this._asyncValidators.push(validators);
        }
    }
    public removeValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void {
        if (Array.isArray(validators)) {
            for (const validator of validators) {
                const index = this._validators.indexOf(validator);
                if (index >= 0) {
                    this._validators.splice(index, 1);
                }
            }
        } else if (validators) {
            const index = this._validators.indexOf(validators);
            if (index >= 0) {
                this._validators.splice(index, 1);
            }
        }
    }
    public removeAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void {
        if (Array.isArray(validators)) {
            for (const validator of validators) {
                const index = this._asyncValidators.indexOf(validator);
                if (index >= 0) {
                    this._asyncValidators.splice(index, 1);
                }
            }
        } else if (validators) {
            const index = this._asyncValidators.indexOf(validators);
            if (index >= 0) {
                this._asyncValidators.splice(index, 1);
            }
        }
    }
    public hasValidator(validator: ValueValidatorFn): boolean {
        return this._validators.indexOf(validator) >= 0;
    }
    public hasAsyncValidator(validator: AsyncValueValidatorFn): boolean {
        return this._asyncValidators.indexOf(validator) >= 0;
    }
    public markAsTouched(opts?: ControlEventEmitOptions): void {
        this.touched = true;
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.markAsTouched(opts);
        }
    }
    public markAllAsTouched(opts?: ControlEventEmitOptions): void {
        this.markAsTouched(opts);
    }
    public markAsUntouched(opts?: ControlEventEmitOptions): void {
        this.touched = false;
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.markAsUntouched(opts);
        }
    }
    public markAsDirty(opts?: ControlEventEmitOptions): void {
        this.changeStatus = 'changed';
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.markAsDirty(opts);
        }
    }
    public markAllAsDirty(opts?: ControlEventEmitOptions): void {
        this.markAsDirty(opts);
    }
    public markAsPristine(opts?: ControlEventEmitOptions): void {
        this.changeStatus = 'unchanged';
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.markAsDirty(opts);
        }
    }
    public markAsPending(opts?: ControlEventEmitOptions): void {
        this.status = 'PENDING';
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.markAsPending(opts);
        }
    }
    public makeWriteable(opts?: ControlEventEmitOptions): void {
        this.readOnly = false;
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.makeWriteable(opts);
        }
    }
    public makeAllWriteable(opts?: ControlEventEmitOptions): void {
        this.makeWriteable(opts);
    }
    public makeReadOnly(opts?: ControlEventEmitOptions): void {
        this.readOnly = true;
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.makeReadOnly(opts);
        }
    }
    public makeAllReadOnly(opts?: ControlEventEmitOptions): void {
        this.makeReadOnly(opts);
    }
    public disable(opts?: ControlEventEmitOptions): void {
        this.status = 'DISABLED';
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.disable(opts);
        }
    }
    public enable(opts?: ControlEventEmitOptions): void {
        this.status = 'VALID';
        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.disable(opts);
        }
    }
    public setValue(value: T, opts?: ControlEventEmitOptions): void {
        this.value = value;
        if (opts?.emitEvent !== false) {
            this._valueChanges.next(this.value);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.updateValueAndValidity(opts);
        }
    }
    public patchValue(value: T, opts?: ControlEventEmitOptions): void {
        if (this.value instanceof Object && value instanceof Object) {
            this.setValue({ ...this.value, ...value }, opts);
        }
    }
    public reset(value?: T | undefined, opts?: ControlEventEmitOptions): void {
        if (value === undefined) {
            value = this.baseValue;
        }
        this.baseValue = value;
        this.setValue(this.baseValue, opts);

    }
    public getRawValue() {
        return this.value;
    }
    public updateValueAndValidity(opts?: ControlEventEmitOptions): void {
        /* no validation logic implemented */

        if (opts?.emitEvent !== false) {
            this._valueChanges.next(this.value);
        }
        if (opts?.onlySelf !== true && this.parent) {
            this.parent.updateValueAndValidity(opts);
        }
    }
    public updateAllValueAndValidity(opts?: ControlEventEmitOptions): void {
        /* no validation logic implemented */
        this.updateValueAndValidity(opts);
    }
    public setErrors(errors: object | null, opts?: ControlEventEmitOptions): void {
        if (!errors) {
            this.errors = null;
            this.status = this.status == 'DISABLED' ? 'DISABLED' : 'VALID';
        } else {
            this.errors = errors;
            this.status = this.status == 'DISABLED' ? 'DISABLED' : 'INVALID';
        }

        if (opts?.emitEvent !== false) {
            this._statusChanges.next(this.status);
        }
    }
    public getError(errorCode: string, path?: Array<string | number> | string): any {
        let valueControl: ValueControl | null = null;
        if (Array.isArray(path)) {
            valueControl = this.getByPath('/' + path.join('/'));
        } else if (path) {
            valueControl = this.getByPath(path);
        }

        const errors = valueControl?.errors ?? this.errors
        if (errors && errorCode in errors) {
            return (<any>errors)[errorCode];
        } else {
            return undefined;
        }
    }
    public hasError(errorCode: string, path?: Array<string | number> | string): boolean {
        return !!this.getError(errorCode, path);
    }
    public waitForValidationCompletion(): Promise<ValueControlStatus> {
        return Promise.resolve(this.status);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getPathFor(_childControl?: DevValueControl): JsonPointer {
        return this.path;
    }

    private getTypeFromProperty(schemaProperty: SchemaProperty): ValueControlType {
        switch (schemaProperty.dataType) {
            case DataType.Text: return 'text';
            case DataType.LocalizedText: return 'localized-text';
            case DataType.Logical: return 'logical';
            case DataType.Time: return 'time';
            case DataType.Date: return 'date';
            case DataType.Number: return 'number';
            case DataType.Integer: return 'integer';
            case DataType.PickList: return 'pick-list';
            case DataType.MultiPickList: return 'multi-pick-list';
            case DataType.Document: return 'document';
            case DataType.DocumentCollection: return 'document-collection';
            case DataType.Reference: return 'reference';
            case DataType.ReferenceCollection: return 'reference-collection';
            case DataType.Formula: return 'formula';
        }
    }

    public static create(parent: DevValueControl | null, schemaProperty: SchemaProperty, value: any): DevValueControl {
        const dataTypeName = DataType[schemaProperty.dataType] as keyof typeof DataType;
        const valueControl = new (valueControlByDataType[dataTypeName] ?? valueControlByDataType['Text'])(value, schemaProperty);
        valueControl.parent = parent;
        return valueControl;
    }
}

export const valueControlByDataType: Record<keyof typeof DataType, new (value: any, schemaProperty: SchemaProperty) => DevValueControl> = {
    'Date': DevValueControl,
    'Document': DevValueControl,  /** actual @type {DevDocumentControl} */
    'DocumentCollection': DevValueControl,  /** actual @type {DevDocumentCollectionControl} */
    'ReferenceCollection': DevValueControl, /** actual @type {DevReferenceCollectionControl} */
    'Text': DevValueControl,
    'LocalizedText': DevValueControl,
    'Logical': DevValueControl,
    'Time': DevValueControl,
    'Number': DevValueControl,
    'Integer': DevValueControl,
    'PickList': DevValueControl,
    'MultiPickList': DevValueControl,
    'Reference': DevValueControl,
    'Formula': DevValueControl,
};