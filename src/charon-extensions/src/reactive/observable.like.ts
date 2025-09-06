import { SubscribableLike } from "./subscribable.like";

export declare interface ObservableLike<T> extends SubscribableLike<T> {
    [Symbol.observable]: () => SubscribableLike<T>;
}
