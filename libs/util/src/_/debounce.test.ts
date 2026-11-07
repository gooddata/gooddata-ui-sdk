// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _debounce } from "./debounce.js";

type Call = { time: number; args: unknown[]; self: unknown };

function createSpy() {
    const calls: Call[] = [];
    const fn = function (this: unknown, ...args: unknown[]): string {
        calls.push({ time: Date.now(), args, self: this });

        return `r${String(args[0])}`;
    };

    return { fn, calls };
}

// Expected values match lodash-es@4.18.1 `debounce`, verified on a shared virtual clock.
describe("debounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("trailing edge", () => {
        it("invokes once after the wait has passed since the last call, with the last arguments", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            debounced(1);
            vi.advanceTimersByTime(20);
            debounced(2);
            vi.advanceTimersByTime(20);
            debounced(3);

            expect(calls).toHaveLength(0);

            vi.advanceTimersByTime(49);
            expect(calls).toHaveLength(0);

            vi.advanceTimersByTime(1);
            expect(calls).toEqual([{ time: 1090, args: [3], self: undefined }]);
        });

        it("defers to the next tick when wait is omitted, zero, NaN or negative", () => {
            for (const wait of [undefined, 0, NaN, -5]) {
                const { fn, calls } = createSpy();
                const debounced = _debounce(fn, wait);

                debounced(1);
                debounced(2);
                expect(calls).toHaveLength(0);

                vi.advanceTimersByTime(0);
                expect(calls).toEqual([{ time: 1000, args: [2], self: undefined }]);
            }
        });

        it("coerces a numeric string wait", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, "40" as unknown as number);

            debounced(1);
            vi.advanceTimersByTime(39);
            expect(calls).toHaveLength(0);

            vi.advanceTimersByTime(1);
            expect(calls).toHaveLength(1);
        });

        it("does not invoke at all when trailing is false and leading is not set", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { trailing: false });

            debounced(1);
            vi.advanceTimersByTime(100);

            expect(calls).toHaveLength(0);
        });
    });

    describe("leading edge", () => {
        it("invokes immediately on the first call and swallows the rest of the burst", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { leading: true, trailing: false });

            debounced(1);
            debounced(2);
            vi.advanceTimersByTime(60);
            debounced(3);
            vi.advanceTimersByTime(60);

            expect(calls.map((c) => c.args[0])).toEqual([1, 3]);
            expect(calls.map((c) => c.time)).toEqual([1000, 1060]);
        });

        it("with trailing as well, invokes on the trailing edge only if called more than once in the window", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { leading: true });

            debounced(1);
            vi.advanceTimersByTime(100);
            expect(calls.map((c) => c.args[0])).toEqual([1]);

            debounced(2);
            debounced(3);
            vi.advanceTimersByTime(60);
            expect(calls.map((c) => c.args[0])).toEqual([1, 2, 3]);
        });

        it("treats any truthy leading and falsy trailing option as booleans", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, {
                leading: "yes" as unknown as true,
                trailing: 0 as unknown as false,
            });

            debounced(1);
            debounced(2);
            vi.advanceTimersByTime(60);

            expect(calls.map((c) => c.args[0])).toEqual([1]);
        });
    });

    describe("maxWait", () => {
        it("forces an invocation once maxWait has elapsed since the last one, even while calls keep coming", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { maxWait: 120 });

            for (let i = 1; i <= 5; i++) {
                debounced(i);
                vi.advanceTimersByTime(40);
            }

            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([[1120, 3]]);

            vi.advanceTimersByTime(60);
            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([
                [1120, 3],
                [1210, 5],
            ]);
        });

        it("raises a maxWait smaller than wait up to wait", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 100, { maxWait: 30 });

            debounced(1);
            vi.advanceTimersByTime(20);
            debounced(2);
            vi.advanceTimersByTime(20);
            debounced(3);
            vi.advanceTimersByTime(200);

            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([[1100, 3]]);
        });

        it("invokes from a tight loop when leading and maxWait coincide", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { leading: true, maxWait: 50 });

            debounced(1);
            debounced(2);
            vi.advanceTimersByTime(50);
            debounced(3);
            vi.advanceTimersByTime(50);
            debounced(4);
            vi.advanceTimersByTime(100);

            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([
                [1000, 1],
                [1050, 2],
                [1050, 3],
                [1100, 4],
            ]);
        });

        it("coerces a NaN maxWait to zero, which is then raised to wait", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { maxWait: NaN });

            debounced(1);
            vi.advanceTimersByTime(40);
            debounced(2);
            vi.advanceTimersByTime(40);
            debounced(3);
            vi.advanceTimersByTime(60);

            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([
                [1050, 2],
                [1130, 3],
            ]);
        });
    });

    describe("return value", () => {
        it("returns undefined until the first invocation, then the last result", () => {
            const { fn } = createSpy();
            const debounced = _debounce(fn, 50);

            expect(debounced(1)).toBeUndefined();
            vi.advanceTimersByTime(60);
            expect(debounced(2)).toBe("r1");
            expect(debounced(3)).toBe("r1");
            vi.advanceTimersByTime(60);
            expect(debounced(4)).toBe("r3");
        });

        it("returns the fresh result from a leading invocation", () => {
            const { fn } = createSpy();
            const debounced = _debounce(fn, 50, { leading: true });

            expect(debounced(1)).toBe("r1");
            expect(debounced(2)).toBe("r1");
        });
    });

    describe("this binding", () => {
        it("invokes with the this of the last call", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);
            const first = { id: 1 };
            const second = { id: 2 };

            debounced.call(first, "a");
            debounced.call(second, "b");
            vi.advanceTimersByTime(60);

            expect(calls).toEqual([{ time: 1050, args: ["b"], self: second }]);
        });
    });

    describe("cancel", () => {
        it("drops a pending invocation and resets the state", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            debounced(1);
            vi.advanceTimersByTime(20);
            debounced.cancel();
            vi.advanceTimersByTime(100);
            expect(calls).toHaveLength(0);

            debounced(2);
            vi.advanceTimersByTime(60);
            expect(calls.map((c) => c.args[0])).toEqual([2]);
        });

        it("is a no-op when nothing is pending", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            expect(() => debounced.cancel()).not.toThrow();
            debounced(1);
            vi.advanceTimersByTime(60);
            expect(calls).toHaveLength(1);
        });
    });

    describe("flush", () => {
        it("invokes a pending call immediately and returns its result", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            debounced(1);
            vi.advanceTimersByTime(20);
            expect(debounced.flush()).toBe("r1");
            expect(calls.map((c) => [c.time, c.args[0]])).toEqual([[1020, 1]]);

            vi.advanceTimersByTime(100);
            expect(calls).toHaveLength(1);
        });

        it("returns the last result when nothing is pending", () => {
            const { fn } = createSpy();
            const debounced = _debounce(fn, 50);

            expect(debounced.flush()).toBeUndefined();
            debounced(1);
            vi.advanceTimersByTime(60);
            expect(debounced.flush()).toBe("r1");
        });

        it("after a leading invocation, flushes nothing until a second call is pending", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, { leading: true });

            debounced(1);
            expect(debounced.flush()).toBe("r1");
            expect(calls).toHaveLength(1);

            debounced(2);
            vi.advanceTimersByTime(10);
            expect(debounced.flush()).toBe("r2");
            expect(calls.map((c) => c.args[0])).toEqual([1, 2]);
        });
    });

    describe("edge cases", () => {
        it("throws for a non-function", () => {
            expect(() => _debounce("nope" as unknown as () => void, 10)).toThrow(TypeError);
            expect(() => _debounce("nope" as unknown as () => void, 10)).toThrow("Expected a function");
        });

        it("ignores a non-object options argument", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50, "nope" as unknown as object);

            debounced(1);
            vi.advanceTimersByTime(60);
            expect(calls).toHaveLength(1);
        });

        it("treats the system clock going backwards as the trailing edge", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            debounced(1);
            vi.advanceTimersByTime(20);
            vi.setSystemTime(920);
            debounced(2);
            vi.advanceTimersByTime(60);

            expect(calls.map((c) => c.args[0])).toEqual([2]);
        });

        it("starts a fresh window after a long idle period", () => {
            const { fn, calls } = createSpy();
            const debounced = _debounce(fn, 50);

            debounced(1);
            vi.advanceTimersByTime(1000);
            debounced(2);
            vi.advanceTimersByTime(10);
            debounced(3);
            vi.advanceTimersByTime(60);

            expect(calls.map((c) => c.args[0])).toEqual([1, 3]);
        });
    });

    describe("typing", () => {
        it("types the debounced function, its result and its methods", () => {
            const debounced = _debounce((a: number, b: string) => `${a}${b}`, 10);
            const result: string | undefined = debounced(1, "x");
            const flushed: string | undefined = debounced.flush();
            const cancelled: void = debounced.cancel();

            expect(result).toBeUndefined();
            expect(flushed).toBe("1x");
            expect(cancelled).toBeUndefined();
        });

        it("drops undefined from the result when leading is true", () => {
            const debounced = _debounce((a: number) => a * 2, 10, { leading: true });
            const result: number = debounced(2);

            expect(result).toBe(4);
        });
    });
});
