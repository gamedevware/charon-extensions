import { SubscribableLike } from "./subscribable.like";

/**
 * Represents an object that can be observed, similar to RxJS Observable
 * This is a minimal observable interface that follows the Observable spec
 * @template T The type of values emitted by the observable
 * @see https://github.com/tc39/proposal-observable
 */
export declare interface ObservableLike<T> extends SubscribableLike<T> {
    /**
     * Symbol.observable method that returns the observable itself
     * This enables interoperability with other observable libraries
     * @returns A subscribable object
     * @see https://github.com/tc39/proposal-observable#symbolobservable
     */
    [Symbol.observable]: () => SubscribableLike<T>;
}
