declare global {
    class TimeSpan {
        static readonly MAX_VALUE: TimeSpan;
        static readonly MIN_VALUE: TimeSpan;
        static readonly ZERO: TimeSpan;

        readonly ticks: bigint;
        readonly sign: number;
        readonly milliseconds: number;

        constructor(value: bigint | TimeSpan | number | string | boolean);

        static toNumber(x: TimeSpan): number;
        static compare(x: any, y: any): number;
        static parse(value: any): TimeSpan;
        static parseOrNull(value: any): TimeSpan | null;
        static fromTicks(value: bigint): TimeSpan;
        static fromSeconds(value: number): TimeSpan;
        static fromMinutes(value: number): TimeSpan;
        static fromMilliseconds(value: number): TimeSpan;
        static fromMicroseconds(value: number): TimeSpan;
        static fromHours(value: number): TimeSpan;
        static fromDays(value: number): TimeSpan;

        valueOf(): string;
        toString(): string;
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