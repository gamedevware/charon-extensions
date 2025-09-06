import { ObserverLike } from "./observer.like";

export declare interface SubscribableLike<T> {
    subscribe(observer?: Partial<ObserverLike<T>>): { unsubscribe(): void; };
}
