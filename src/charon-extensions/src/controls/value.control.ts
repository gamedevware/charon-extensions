import { SchemaProperty, JsonPointer } from "../metadata";
import { ObservableLike, TeardownLogic } from "../reactive";
import { ControlEventEmitOptions } from "./control.event.emit.options";
import { ValueControlType } from "./value.control.type";

export declare interface ValueControl<TValue = any> {
    readonly schemaProperty: SchemaProperty;
    readonly changeStatus: 'unchanged' | 'changed';
    readonly path: JsonPointer;
    readonly readOnly: boolean;
    readonly required: boolean;
    readonly baseValue: TValue;
    readonly startingValue: TValue;
    readonly parent: ValueControl | null;
    readonly root: ValueControl | null;
    readonly status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
    readonly valid: boolean;
    readonly invalid: boolean;
    readonly pending: boolean;
    readonly disabled: boolean;
    readonly enabled: boolean;
    readonly pristine: boolean;
    readonly dirty: boolean;
    readonly touched: boolean;
    readonly untouched: boolean;
    readonly errors: Object | null;
    readonly valueChanges: ObservableLike<TValue>;
    readonly statusChanges: ObservableLike<string>;
    readonly value: TValue;
    readonly type: ValueControlType;

    getByPath(path: JsonPointer | string): ValueControl | null;

    toggle(expand: boolean, onlySelf: boolean): Promise<never>;
    focus(options?: FocusOptions, targetName?: string): void;

    onFocus(focused: boolean, focusTargetValueControl?: ValueControl): void;
    registerDoToggle(fn: (expand: boolean) => Promise<any>): TeardownLogic;
    registerDoFocus(fn: (options?: FocusOptions) => void, targetName?: string): TeardownLogic;

    addValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;
    addAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;
    removeValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;
    removeAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;
    hasValidator(validator: ValueValidatorFn): boolean;
    hasAsyncValidator(validator: AsyncValueValidatorFn): boolean;

    markAsTouched(opts?: ControlEventEmitOptions): void;
    markAllAsTouched(opts?: ControlEventEmitOptions): void;
    markAsUntouched(opts?: ControlEventEmitOptions): void;
    markAsDirty(opts?: ControlEventEmitOptions): void;
    markAllAsDirty(opts?: ControlEventEmitOptions): void;
    markAsPristine(opts?: ControlEventEmitOptions): void;
    markAsPending(opts?: ControlEventEmitOptions): void;

    disable(opts?: ControlEventEmitOptions): void;
    enable(opts?: ControlEventEmitOptions): void;

    setValue(value: TValue, options?: ControlEventEmitOptions): void;
    patchValue(value: TValue, options?: ControlEventEmitOptions): void;
    reset(value?: TValue, options?: ControlEventEmitOptions): void;

    getRawValue(): any;
    updateValueAndValidity(opts?: ControlEventEmitOptions): void;
    updateAllValueAndValidity(options?: ControlEventEmitOptions): void;

    setErrors(errors: Object | null, opts?: ControlEventEmitOptions): void;
    getError(errorCode: string, path?: Array<string | number> | string): any;
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
}

export declare interface AsyncValueValidatorFn {
    (control: ValueControl): Promise<Object | null>;
}

export declare interface ValueValidatorFn {
    (control: ValueControl): Object | null;
}

