export function defineTimeSpan() {

    const ticksPerMillisecond = 10000n;
    const ticksPerSecond = 10000000n;
    const ticksPerMinute = 600000000n;
    const ticksPerHour = 36000000000n;
    const ticksPerDay = 864000000000n;

    if (!('TimeSpan' in window)) {
        (<any>window).TimeSpan = class TimeSpan implements globalThis.TimeSpan {

            public static readonly MAX_VALUE: TimeSpan = new TimeSpan(9223372036854775807n);
            public static readonly MIN_VALUE: TimeSpan = new TimeSpan(-9223372036854775808n);
            public static readonly ZERO: TimeSpan = new TimeSpan(0n);

            private readonly _value: bigint;

            public get ticks(): bigint {
                return this._value;
            }
            public get sign(): number {
                return Number(this._value === 0n ? 0 : this._value > 0n ? 1 : -1);
            }
            public get milliseconds(): number {
                return Number(this._value / ticksPerMillisecond);
            }

            constructor(value: bigint | TimeSpan | number | string | boolean) {
                if (value instanceof TimeSpan) {
                    this._value = value._value;
                } else if (typeof value === 'bigint') {
                    this._value = value;
                } else if (typeof value === 'string') {
                    this._value = TimeSpan.parseOrNull(value)?._value ?? 0n;
                } else if (!value) {
                    this._value = 0n;
                } else {
                    this._value = BigInt(value);
                }
            }

            public static fromDays(value: number): TimeSpan {
                return this.interval(value, 864000000000);
            }
            public static fromHours(value: number): TimeSpan {
                return this.interval(value, 36000000000);
            }
            public static fromMicroseconds(value: number): TimeSpan {
                return this.interval(value, 10);
            }
            public static fromMilliseconds(value: number): TimeSpan {
                return this.interval(value, 10000);
            }
            public static fromMinutes(value: number): TimeSpan {

                return this.interval(value, 600000000);
            }
            public static fromSeconds(value: number): TimeSpan {

                return this.interval(value, 10000000);
            }
            public static fromTicks(value: bigint): TimeSpan {

                return new TimeSpan(value);
            }
            public static interval(value: number, scale: number): TimeSpan {
                return new TimeSpan(BigInt(Math.round(value * scale)));
            }

            public static parseOrNull(value: any): TimeSpan | null {
                if (typeof value === 'bigint' || typeof value === 'number') {
                    return new TimeSpan(value);
                } else if (value instanceof TimeSpan) {
                    return value;
                }
                if (typeof value !== 'string' ||
                    (/^[-\d:.]+$/).test(value) === false) {
                    return null;
                }

                return TimeSpan.parse(value);
            }
            public static parse(value: any): TimeSpan {
                if (typeof value === 'bigint' || typeof value === 'number') {
                    return new TimeSpan(value);
                } else if (value instanceof TimeSpan) {
                    return value;
                }

                if (typeof value !== 'string' ||
                    (/^[-\d:.]+$/).test(value) === false) {
                    throw new Error(`Value is not valid time span "${value}"(${typeof value}).`);
                }

                let isNegative = false;
                if (value.startsWith('-')) {
                    value = value.substr(1);
                    isNegative = true;
                }

                if (!isNaN(Number(value))) {
                    const ticksFromSeconds = BigInt(value) * ticksPerSecond;
                    return new TimeSpan(isNegative ? ticksFromSeconds * -1n : ticksFromSeconds);
                }

                let ticks = 0n;
                if (value.lastIndexOf('.') >= value.indexOf('.') && value.lastIndexOf('.') > value.indexOf(':')) {
                    const spltIndex = value.lastIndexOf('.');
                    const tickStr = value.substr(spltIndex + 1);
                    value = value.substr(0, spltIndex);
                    ticks = ticks + BigInt(tickStr);
                }

                const parts = value.split(/[:.]/);
                while (parts.length < 4) {
                    parts.unshift('0');
                }

                ticks = ticks + BigInt(parts[0]) * ticksPerDay;
                ticks = ticks + BigInt(parts[1]) * ticksPerHour;
                ticks = ticks + BigInt(parts[2]) * ticksPerMinute;
                ticks = ticks + BigInt(parts[3]) * ticksPerSecond;

                return new TimeSpan(isNegative ? ticks * -1n : ticks);
            }

            public static compare(x: any, y: any): number {
                const xIsNull = (x === undefined || x === null);
                const yIsNull = (y === undefined || y === null);
                if (xIsNull && yIsNull) {
                    return 0;
                } else if (!xIsNull && yIsNull) {
                    return 1;
                } else if (xIsNull && !yIsNull) {
                    return -1;
                }

                return Math.sign(Number(this.parse(x)._value - this.parse(y)._value));
            }

            public static toNumber(x: TimeSpan): number {
                return Number(x._value);
            }

            private static padNumber(value: bigint, total: number): string {
                let valueStr = value.toString();
                while (valueStr.length < total) {
                    valueStr = '0' + valueStr;
                }
                return valueStr;
            }

            public valueOf() {
                return this.toJSON();
            }

            public toString(): string {
                const ticks = this._value % ticksPerSecond;
                const seconds = (this._value / ticksPerSecond) % 60n;
                const minutes = (this._value / ticksPerMinute) % 60n;
                const hours = (this._value / ticksPerHour) % 24n;
                const days = (this._value / ticksPerDay);

                let result = TimeSpan.padNumber(hours, 2) + ':' + TimeSpan.padNumber(minutes, 2) + ':' + TimeSpan.padNumber(seconds, 2);
                if (ticks > 0n) {
                    result = result + '.' + TimeSpan.padNumber(ticks, 7);
                }
                if (days > 0n) {
                    result = days + '.' + result;
                }
                return result;
            }

            public toJSON(): string {
                return this.toString();
            }
        }
    }
}