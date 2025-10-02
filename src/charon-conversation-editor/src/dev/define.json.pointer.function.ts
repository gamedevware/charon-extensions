export function defineJsonPointer() {

    if (!('JsonPointer' in window)) {
        (<any>window).JsonPointer = class JsonPointer implements globalThis.JsonPointer {
            public static readonly root = new JsonPointer('');

            private readonly _segments: string[];
            private path?: string;

            public get segments(): readonly string[] {
                return this._segments;
            }
            public get length(): number {
                return this._segments.length;
            }

            public constructor(value: string | string[]) {
                if (value instanceof Array) {
                    const endsWithEmptyString = value[value.length - 1] === '';
                    this._segments = value.map(v => String(v)).filter(v => v !== '');
                    if (endsWithEmptyString) {
                        this._segments.push('');
                    }
                } else if (value === '/') {
                    this._segments = [''];
                } else if (value === '') {
                    this._segments = [];
                } else if (value[0] !== '/') {
                    throw new Error('JsonPointer should start from "/".');
                } else {
                    this._segments = value.split('/');
                    this._segments.shift(); // remove empty segment at beggining
                    if (value[value.length - 1] === '/') {
                        this._segments.push('');
                    }
                }
                for (let i = 0; i < this._segments.length; i++) {
                    this._segments[i] = JsonPointer.decodeSegment(this._segments[i]);
                }
            }

            private static encodeSegment(value: string): string {
                if (!value) {
                    return value;
                }
                if (value.indexOf('~') < 0 && value.indexOf('/') < 0) {
                    return value;
                }
                return value
                    .replace(/~/g, '~2')  // Replace all ~ with ~2
                    .replace(/\//g, '~1'); // Replace all / with ~1
            }
            private static decodeSegment(value: string): string {
                if (!value) {
                    return value;
                }
                if (value.indexOf('~') < 0) {
                    return value;
                }
                return value
                    .replace(/~1/g, '/')  // Replace all ~1 with /
                    .replace(/~2/g, '~'); // Replace all ~2 with ~
            }

            public slice(start?: number, end?: number): JsonPointer {
                return new JsonPointer(this._segments.slice(start, end));
            }
            public append(value: JsonPointer | string | string[]): JsonPointer {
                if (value instanceof JsonPointer) {
                    value = value._segments;
                } else if (typeof value === 'string') {
                    value = value.split('/');
                }
                return new JsonPointer([...this._segments, ...value]);
            }

            public get(target: object, throwOnFail = false): any {
                try {
                    let result: any = target;
                    let intermediateTarget: any = target;
                    for (let i = 0; i < this._segments.length; i++) {
                        const pathSegment = this._segments[i];
                        if (target instanceof Array) {
                            const index = Number(pathSegment);
                            if (isNaN(index)) {
                                throw new Error(`Invalid array index value '${pathSegment}'.`);
                            }
                            result = intermediateTarget[index];
                        } else if (pathSegment.length === 0) {
                            result = intermediateTarget;
                        } else {
                            result = intermediateTarget[pathSegment];
                        }
                        if (result instanceof Object) {
                            intermediateTarget = result;
                        }
                    }
                    return result;
                } catch (error) {
                    if (throwOnFail) {
                        throw error;
                    } else {
                        return undefined;
                    }
                }
            }

            public set(target: object, value: any, createIfNotExists = true, throwOnFail = false): boolean {
                try {
                    let result: any = target;
                    let intermediateTarget: any = target;
                    const lastSegment = this._segments[this._segments.length - 1];
                    for (let i = 0; i < this._segments.length - 1; i++) {
                        const pathSegment = this._segments[i];
                        if (intermediateTarget instanceof Array) {
                            if (pathSegment === '-') {
                                intermediateTarget.push(result = {});
                            } else {
                                const index = Number(pathSegment);
                                if (isNaN(index)) {
                                    throw new Error(`Invalid array index value '${pathSegment}'.`);
                                }
                                result = intermediateTarget[index];
                            }
                        } else if (pathSegment.length === 0) {
                            result = intermediateTarget;
                        } else {
                            result = intermediateTarget[pathSegment];
                            if (createIfNotExists && (result === null || result === undefined)) {
                                intermediateTarget[pathSegment] = result = {};
                            }
                        }
                        if (result instanceof Object) {
                            intermediateTarget = result;
                        }
                    }
                    intermediateTarget[lastSegment] = value;
                    return true;
                } catch (error) {
                    if (throwOnFail) {
                        throw error;
                    } else {
                        return false;
                    }
                }
            }

            public getSegment(index: number): string {
                return this._segments[index];
            }

            public equals(value: JsonPointer) {
                if (!value || !(value instanceof JsonPointer)) {
                    return false;
                }
                if (value.length !== this.length) {
                    return false;
                }
                for (let i = 0; i < this._segments.length; i++) {
                    const segment1 = this._segments[i];
                    const segment2 = value._segments[i];
                    if (segment1 !== segment2) {
                        return false;
                    }
                }
                return true;
            }

            public valueOf(): string {
                return this.toString();
            }

            public toJSON(): string {
                return this.toString();
            }

            public toString(): string {
                if (typeof (this.path) === 'string') {
                    return this.path;
                }
                if (this._segments.length === 0) {
                    return this.path = '';
                } else {
                    return this.path = '/' + this._segments.map(JsonPointer.encodeSegment).join('/');
                }
            }
        }

    }

}
