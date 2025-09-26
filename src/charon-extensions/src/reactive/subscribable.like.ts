import { ObserverLike } from "./observer.like";

/**
 * Represents an object that can be subscribed to
 * This is the core interface for receiving values from observables
 * @template T The type of values emitted by the subscribable
 */
export declare interface SubscribableLike<T> {
    /**
     * Subscribes to the observable sequence
     * @param observer Optional observer object with next, error, and complete methods
     * @returns A subscription object with an unsubscribe method
     * 
     * @example
     * // Subscribe with full observer object
     * const subscription = observable.subscribe({
     *   next: value => console.log(value),
     *   error: err => console.error(err),
     *   complete: () => console.log('Completed')
     * });
     * 
     * @example
     * // Subscribe with just next handler
     * const subscription = observable.subscribe({
     *   next: value => console.log(value)
     * });
     * 
     * @example
     * // Clean up subscription
     * subscription.unsubscribe();
     */
    subscribe(observer?: Partial<ObserverLike<T>>): {
        /**
         * Unsubscribes from the observable sequence
         * Stops receiving notifications and cleans up resources
         */
        unsubscribe(): void;
    };
}
