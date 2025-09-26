declare global {
    /**
     * Represents a time interval.
     */
    class TimeSpan {
        /**
         * Gets the maximum TimeSpan value.
         */
        static readonly MAX_VALUE: TimeSpan;

        /**
         * Gets the minimum TimeSpan value.
         */
        static readonly MIN_VALUE: TimeSpan;

        /**
         * Gets a TimeSpan representing zero time interval.
         */
        static readonly ZERO: TimeSpan;

        /**
         * Gets the number of ticks that represent the value of the current TimeSpan.
         */
        readonly ticks: bigint;

        /**
         * Gets an integer that indicates whether the TimeSpan is positive, negative, or zero.
         * Returns 1 for positive, -1 for negative, and 0 for zero.
         */
        readonly sign: number;

        /**
         * Gets the milliseconds component of the time interval represented by the current TimeSpan.
         */
        readonly milliseconds: number;

        /**
         * Initializes a new instance of the TimeSpan class.
         * @param value - The value to create the TimeSpan from. Can be bigint, TimeSpan, number, string, or boolean.
         */
        constructor(value: bigint | TimeSpan | number | string | boolean);

        /**
         * Converts a TimeSpan to a number representing the total milliseconds.
         * @param x - The TimeSpan to convert.
         * @returns The total number of milliseconds represented by the TimeSpan.
         */
        static toNumber(x: TimeSpan): number;

        /**
         * Compares two TimeSpan values and returns an integer that indicates their relationship.
         * @param x - The first TimeSpan to compare.
         * @param y - The second TimeSpan to compare.
         * @returns A signed integer that indicates the relative values of x and y:
         * - Less than 0: x is less than y
         * - 0: x equals y
         * - Greater than 0: x is greater than y
         */
        static compare(x: any, y: any): number;

        /**
         * Converts the string representation of a time interval to its TimeSpan equivalent.
         * @param value - A string that specifies the time interval to convert.
         * @returns A TimeSpan that corresponds to the specified value.
         * @throws Error if the value parameter is not a valid time interval.
         */
        static parse(value: any): TimeSpan;

        /**
         * Converts the string representation of a time interval to its TimeSpan equivalent.
         * Returns null if the conversion fails.
         * @param value - A string that specifies the time interval to convert.
         * @returns A TimeSpan equivalent to the value specified, or null if the conversion failed.
         */
        static parseOrNull(value: any): TimeSpan | null;

        /**
         * Returns a TimeSpan that represents a specified number of ticks.
         * @param value - A number of ticks.
         * @returns A TimeSpan that represents the specified number of ticks.
         */
        static fromTicks(value: bigint): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of seconds.
         * @param value - A number of seconds.
         * @returns A TimeSpan that represents the specified number of seconds.
         */
        static fromSeconds(value: number): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of minutes.
         * @param value - A number of minutes.
         * @returns A TimeSpan that represents the specified number of minutes.
         */
        static fromMinutes(value: number): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of milliseconds.
         * @param value - A number of milliseconds.
         * @returns A TimeSpan that represents the specified number of milliseconds.
         */
        static fromMilliseconds(value: number): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of microseconds.
         * @param value - A number of microseconds.
         * @returns A TimeSpan that represents the specified number of microseconds.
         */
        static fromMicroseconds(value: number): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of hours.
         * @param value - A number of hours.
         * @returns A TimeSpan that represents the specified number of hours.
         */
        static fromHours(value: number): TimeSpan;

        /**
         * Returns a TimeSpan that represents a specified number of days.
         * @param value - A number of days.
         * @returns A TimeSpan that represents the specified number of days.
         */
        static fromDays(value: number): TimeSpan;

        /**
         * Returns a string that represents the current TimeSpan.
         * @returns A string representation of the current TimeSpan.
         */
        valueOf(): string;

        /**
         * Returns a string that represents the current TimeSpan.
         * @returns A string representation of the current TimeSpan.
         */
        toString(): string;

        /**
         * Returns a string that represents the current TimeSpan for JSON serialization.
         * @returns A string representation of the current TimeSpan suitable for JSON.
         */
        toJSON(): string;
    }

    // For browsers
    interface Window {
        TimeSpan: typeof TimeSpan;
    }

    // For Node.js
    namespace NodeJS {
        interface Global {
            TimeSpan: typeof TimeSpan;
        }
    }
}

export { };