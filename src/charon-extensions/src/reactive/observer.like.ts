
/**
 * Represents an object that can receive notifications from an Observable
 * Similar to RxJS Observer interface
 * @template T The type of values the observer can receive
 */
export declare interface ObserverLike<T> {
    /**
     * Callback function for receiving next values from the observable
     * @param value The value emitted by the observable
     */
    next: (value: T) => void;

    /**
     * Callback function for receiving error notifications from the observable
     * @param err The error that occurred in the observable sequence
     */
    error: (err: any) => void;

    /**
     * Callback function for receiving completion notifications
     * Called when the observable completes successfully
     */
    complete: () => void;
}
