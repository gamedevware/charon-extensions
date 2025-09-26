import { SchemaProperty } from "../metadata";
import { ObservableLike, TeardownLogic } from "../reactive";
import { ControlEventEmitOptions } from "./control.event.emit.options";
import { ValueControlType } from "./value.control.type";

/**
 * Handler function for programmatically focusing a control
 * @param options - Optional focus options (like preventScroll)
 */
export type DoFocusHandler = (options?: FocusOptions) => void;

/**
 * Handler function called when focus state changes
 * @param valueControl - The control whose focus state changed
 * @param focused - Whether the control is now focused
 */
export type OnFocusHandler = (valueControl: ValueControl, focused: boolean) => void;

/**
 * Handler function for programmatically expanding/collapsing a control
 * @param expand - True to expand, false to collapse
 * @returns Promise that resolves when expansion is complete
 */
export type DoExpandHandler = (expand: boolean) => Promise<void>;

/**
 * Represents a form control that tracks value, validation, and state changes
 * @template TValue - The type of value this control holds
 */
export declare interface ValueControl<TValue = any> {
    /** Schema definition for this control's property */
    readonly schemaProperty: SchemaProperty;

    /** Whether the value has changed from its original state */
    readonly changeStatus: 'unchanged' | 'changed';

    /** JSON pointer path to this control in the form hierarchy */
    readonly path: JsonPointer;

    /** Whether the control is read-only */
    readonly readOnly: boolean;

    /** Whether the control is required */
    readonly required: boolean;

    /** The base/original value of the control */
    readonly baseValue: TValue;

    /** The initial value when the control was created */
    readonly startingValue: TValue;

    /** Parent control in the form hierarchy, null if root */
    readonly parent: ValueControl | null;

    /** Root control of the form hierarchy */
    readonly root: ValueControl | null;

    /** Current validation status of the control */
    readonly status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

    /** True if the control is valid */
    readonly valid: boolean;

    /** True if the control is invalid */
    readonly invalid: boolean;

    /** True if async validation is pending */
    readonly pending: boolean;

    /** True if the control is disabled */
    readonly disabled: boolean;

    /** True if the control is enabled */
    readonly enabled: boolean;

    /** True if the control's value has not been changed */
    readonly pristine: boolean;

    /** True if the control's value has been changed */
    readonly dirty: boolean;

    /** True if the control has been touched (focused and blurred) */
    readonly touched: boolean;

    /** True if the control has never been touched */
    readonly untouched: boolean;

    /** Validation errors object, null if no errors */
    readonly errors: Object | null;

    /** Observable that emits when the control's value changes */
    readonly valueChanges: ObservableLike<TValue>;

    /** Observable that emits when the control's status changes */
    readonly statusChanges: ObservableLike<string>;

    /** Current value of the control */
    readonly value: TValue;

    /** Type of the value control */
    readonly type: ValueControlType;

    /**
     * Retrieves a child control by its JSON pointer path
     * @param path - JSON pointer path to the child control
     * @returns The child control or null if not found
     */
    getByPath(path: JsonPointer | string): ValueControl | null;

    /**
     * Expands or collapses the control
     * @param expand - True to expand, false to collapse
     * @param opts - Options for emitting control events
     * @returns Promise that resolves when operation completes
     */
    toggle(expand: boolean, opts?: ControlEventEmitOptions): Promise<void>;

    /**
     * Focuses the control
     * @param options - Focus options
     * @param targetName - Optional target name for focus
     */
    focus(options?: FocusOptions, targetName?: string): void;

    /**
     * Called when focus state changes
     * @param focused - Whether the control is focused
     * @param focusTargetValueControl - The control that received focus
     */
    onFocus(focused: boolean, focusTargetValueControl?: ValueControl): void;

    /**
     * Registers a handler for toggle operations
     * @param fn - Handler function for toggle operations
     * @returns Teardown logic to unregister the handler
     */
    registerDoToggle(fn: DoExpandHandler): TeardownLogic;

    /**
     * Registers a handler for focus operations
     * @param fn - Handler function for focus operations
     * @param targetName - Optional target name for the handler
     * @returns Teardown logic to unregister the handler
     */
    registerDoFocus(fn: DoFocusHandler, targetName?: string): TeardownLogic;

    /**
     * Registers a handler for focus state changes
     * @param fn - Handler function for focus changes
     * @returns Teardown logic to unregister the handler
     */
    registerOnFocus(fn: OnFocusHandler): TeardownLogic;

    /**
     * Adds synchronous validators to the control
     * @param validators - Validator function or array of validator functions
     */
    addValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;

    /**
     * Adds asynchronous validators to the control
     * @param validators - Async validator function or array of validator functions
     */
    addAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;

    /**
     * Removes synchronous validators from the control
     * @param validators - Validator function or array of validator functions to remove
     */
    removeValidators(validators: ValueValidatorFn | ValueValidatorFn[]): void;

    /**
     * Removes asynchronous validators from the control
     * @param validators - Async validator function or array of validator functions to remove
     */
    removeAsyncValidators(validators: AsyncValueValidatorFn | AsyncValueValidatorFn[]): void;

    /**
     * Checks if a synchronous validator is present
     * @param validator - Validator function to check for
     * @returns True if the validator is present
     */
    hasValidator(validator: ValueValidatorFn): boolean;

    /**
     * Checks if an asynchronous validator is present
     * @param validator - Async validator function to check for
     * @returns True if the async validator is present
     */
    hasAsyncValidator(validator: AsyncValueValidatorFn): boolean;

    /**
     * Marks the control as touched
     * @param opts - Options for emitting control events
     */
    markAsTouched(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control and all descendants as touched
     * @param opts - Options for emitting control events
     */
    markAllAsTouched(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control as untouched
     * @param opts - Options for emitting control events
     */
    markAsUntouched(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control as dirty
     * @param opts - Options for emitting control events
     */
    markAsDirty(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control and all descendants as dirty
     * @param opts - Options for emitting control events
     */
    markAllAsDirty(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control as pristine
     * @param opts - Options for emitting control events
     */
    markAsPristine(opts?: ControlEventEmitOptions): void;

    /**
     * Marks the control as pending (async validation in progress)
     * @param opts - Options for emitting control events
     */
    markAsPending(opts?: ControlEventEmitOptions): void;

    /**
     * Disables the control
     * @param opts - Options for emitting control events
     */
    disable(opts?: ControlEventEmitOptions): void;

    /**
     * Enables the control
     * @param opts - Options for emitting control events
     */
    enable(opts?: ControlEventEmitOptions): void;

    /**
     * Sets the control's value
     * @param value - The new value
     * @param opts - Options for emitting control events
     */
    setValue(value: TValue, opts?: ControlEventEmitOptions): void;

    /**
     * Patches the control's value (partial update)
     * @param value - The value to patch
     * @param opts - Options for emitting control events
     */
    patchValue(value: TValue, opts?: ControlEventEmitOptions): void;

    /**
     * Resets the control to its initial state
     * @param value - Optional value to reset to (defaults to startingValue)
     * @param opts - Options for emitting control events
     */
    reset(value?: TValue, opts?: ControlEventEmitOptions): void;

    /**
     * Gets the raw value of the control (including disabled controls)
     * @returns The raw value
     */
    getRawValue(): any;

    /**
     * Updates the control's value and validation status
     * @param opts - Options for emitting control events
     */
    updateValueAndValidity(opts?: ControlEventEmitOptions): void;

    /**
     * Updates this control and all descendants' values and validation status
     * @param opts - Options for emitting control events
     */
    updateAllValueAndValidity(opts?: ControlEventEmitOptions): void;

    /**
     * Manually sets validation errors on the control
     * @param errors - Validation errors object, or null to clear errors
     * @param opts - Options for emitting control events
     */
    setErrors(errors: Object | null, opts?: ControlEventEmitOptions): void;

    /**
     * Retrieves a specific validation error
     * @param errorCode - The error code to retrieve
     * @param path - Optional path for nested errors
     * @returns The error value, or null if not found
     */
    getError(errorCode: string, path?: Array<string | number> | string): any;

    /**
     * Checks if a specific validation error exists
     * @param errorCode - The error code to check for
     * @param path - Optional path for nested errors
     * @returns True if the error exists
     */
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
}

/**
 * Asynchronous validator function interface
 * @param control - The control to validate
 * @returns Promise that resolves to validation errors or null if valid
 */
export declare interface AsyncValueValidatorFn {
    (control: ValueControl): Promise<Object | null>;
}

/**
 * Synchronous validator function interface
 * @param control - The control to validate
 * @returns Validation errors object or null if valid
 */
export declare interface ValueValidatorFn {
    (control: ValueControl): Object | null;
}