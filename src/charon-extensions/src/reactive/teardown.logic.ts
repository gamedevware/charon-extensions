/**
 * Represents cleanup logic for subscriptions and observables
 * Similar to RxJS TeardownLogic type
 * 
 * @example
 * // Void teardown (no cleanup needed)
 * function noCleanup(): TeardownLogic {
 *   // No return value means no cleanup
 * }
 * 
 * @example
 * // Function teardown (cleanup function)
 * function withCleanup(): TeardownLogic {
 *   return () => {
 *     console.log('Cleaning up...');
 *     // Perform cleanup operations
 *   };
 * }
 */
export type TeardownLogic = void | (() => void);