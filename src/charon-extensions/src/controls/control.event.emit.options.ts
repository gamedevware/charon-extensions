/**
 * Options for controlling how control events are emitted during operations
 */
export declare interface ControlEventEmitOptions {
    /**
     * When true, only marks this control and not its ancestors
     * @defaultValue false
     */
    onlySelf?: boolean;
    
    /**
     * When true (or undefined), emits events; when false, suppresses events
     * @defaultValue true
     */
    emitEvent?: boolean;
}
