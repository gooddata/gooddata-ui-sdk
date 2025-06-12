// (C) 2019-2020 GoodData Corporation
import { invariant } from "ts-invariant";

/**
 * Lazy array initializer - this function is called to construct the actual value.
 */
export type LazyArrayInitializer<TValue> = (idx: number) => TValue;

/**
 * Simple implementation of fixed-size arrays with lazily initialized elements.
 */
export class LazyInitArray<T> implements Iterable<T> {
    private readonly data: Array<T | undefined>;
    private readonly initializer: LazyArrayInitializer<T>;

    constructor(size: number, initializer: LazyArrayInitializer<T>) {
        invariant(size >= 0, `array size must be non-negative, got: ${size}`);

        this.data = new Array(size);
        this.initializer = initializer;
    }

    public get = (idx: number): T => {
        invariant(idx >= 0 && idx < this.data.length, `array index out of bounds: ${idx}`);

        if (!this.data[idx]) {
            this.data[idx] = this.initializer(idx);
        }

        return this.data[idx]!;
    };

    public [Symbol.iterator] = (): Iterator<T> => {
        let idx: number = 0;
        const length = this.data.length;
        const get = this.get;

        return {
            next(): IteratorYieldResult<T> | IteratorReturnResult<any> {
                if (idx >= length) {
                    return {
                        done: true,
                        value: undefined,
                    };
                }

                const value = get(idx);
                idx += 1;

                return {
                    done: false,
                    value,
                };
            },
        };
    };
}
