
export declare interface ObserverLike<T> {
    next: (value: T) => void;
    error: (err: any) => void;
    complete: () => void;
}
