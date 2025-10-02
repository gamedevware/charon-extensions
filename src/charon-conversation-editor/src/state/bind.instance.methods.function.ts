/**
 * Binds all instance methods to the class instance to maintain proper `this` context
 * Enables safe use of object destructuring without losing method context
  * @description
 * This function iterates through all methods on the instance's prototype and
 * binds them to the instance itself. This ensures that when methods are
 * destructured or passed as callbacks, they maintain their original `this` context.
 */
export function bindInstanceMethods<T>(instance: T) {
    const prototype = Object.getPrototypeOf(instance);
    const propertyNames = Object.getOwnPropertyNames(prototype);
    for (const key of propertyNames) {
        if (key === 'constructor') continue;

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (descriptor && typeof descriptor.value === 'function') {
            (instance as any)[key] = (instance as any)[key].bind(instance);
        }
    }
}