export * from './observable.like';
export * from './observer.like';
export * from './subscribable.like';
export * from './teardown.logic';

declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}
