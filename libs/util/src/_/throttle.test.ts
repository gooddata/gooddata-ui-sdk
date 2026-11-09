// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { _throttle } from "./throttle.js";

type Call = { time: number; args: unknown[]; self: unknown };

function createSpy() {
    const calls: Call[] = [];
    const fn = function (this: unknown, ...args: unknown[]): string {
        calls.push({ time: Date.now() - 1000, args, self: this });

        return `r${String(args[0])}`;
    };

    return { fn, calls };
}

/** Calls `throttled` with 1..count, advancing the clock by `gap` after each call. */
function stream(throttled: (value: number) => unknown, count: number, gap: number): void {
    for (let value = 1; value <= count; value++) {
        throttled(value);
        vi.advanceTimersByTime(gap);
    }
}

// Expected values match lodash-es@4.18.1 `throttle`, verified on a shared virtual clock; times are
// milliseconds since the throttled function was created.
describe("throttle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("leading and trailing edges", () => {
        it("invokes on the first call, then at most once per wait with the latest arguments", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            throttled(2);
            vi.advanceTimersByTime(20);
            throttled(3);
            expect(calls).toEqual([{ time: 0, args: [1], self: undefined }]);

            vi.advanceTimersByTime(40);
            expect(calls).toHaveLength(2);
            expect(calls[1]).toEqual({ time: 50, args: [3], self: undefined });

            throttled(4);
            vi.advanceTimersByTime(100);
            expect(calls[2]).toEqual({ time: 110, args: [4], self: undefined });
            expect(calls).toHaveLength(3);
        });

        it("does not add a trailing invocation after a single call", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            vi.advanceTimersByTime(100);

            expect(calls.map((call) => call.args)).toEqual([[1]]);
        });

        it("invokes every wait milliseconds during a steady stream of calls", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            stream(throttled, 12, 10);
            vi.advanceTimersByTime(100);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [50, 5],
                [100, 10],
                [150, 12],
            ]);
        });

        it("invokes every call when calls are further apart than the wait", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            stream(throttled, 4, 60);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [60, 2],
                [120, 3],
                [180, 4],
            ]);
        });

        it("invokes exactly on the window boundary when a call lands there", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            stream(throttled, 3, 50);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [50, 2],
                [100, 3],
            ]);
        });
    });

    describe("options", () => {
        it("skips the leading invocation when leading is false", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50, { leading: false });

            stream(throttled, 12, 10);
            vi.advanceTimersByTime(100);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [50, 5],
                [100, 10],
                [150, 12],
            ]);
        });

        it("skips the trailing invocation when trailing is false", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50, { trailing: false });

            stream(throttled, 12, 10);
            vi.advanceTimersByTime(100);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [50, 6],
                [100, 11],
            ]);
        });

        it("never invokes when both leading and trailing are false", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50, { leading: false, trailing: false });

            throttled(1);
            vi.advanceTimersByTime(20);
            throttled(2);
            vi.advanceTimersByTime(100);

            expect(calls).toHaveLength(0);
            expect(throttled.flush()).toBeUndefined();
        });

        it("treats the options as booleans and reads an explicit undefined as false", () => {
            const first = createSpy();
            const second = createSpy();
            const withStrings = _throttle(first.fn, 50, {
                leading: "" as unknown as boolean,
                trailing: "yes" as unknown as boolean,
            });
            const withUndefined = _throttle(second.fn, 50, { leading: undefined });

            withStrings(1);
            withStrings(2);
            withUndefined(1);
            withUndefined(2);
            vi.advanceTimersByTime(60);

            expect(first.calls.map((call) => [call.time, call.args[0]])).toEqual([[50, 2]]);
            expect(second.calls.map((call) => [call.time, call.args[0]])).toEqual([[50, 2]]);
        });

        it("ignores a non-object options argument and a maxWait option", () => {
            const first = createSpy();
            const second = createSpy();
            const withString = _throttle(first.fn, 50, "nope" as unknown as undefined);
            const withMaxWait = _throttle(second.fn, 50, { maxWait: 10 } as unknown as undefined);

            withString(1);
            withString(2);
            vi.advanceTimersByTime(60);
            expect(first.calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [50, 2],
            ]);

            stream(withMaxWait, 6, 10);
            vi.advanceTimersByTime(100);
            expect(second.calls.map((call) => [call.time, call.args[0]])).toEqual([
                [60, 1],
                [110, 5],
                [160, 6],
            ]);
        });
    });

    describe("wait", () => {
        it("invokes every call on the leading edge when wait is omitted, zero, NaN or negative", () => {
            for (const wait of [undefined, 0, NaN, -5]) {
                const { fn, calls } = createSpy();
                const throttled = _throttle(fn, wait);
                const results = [throttled(1), throttled(2)];

                vi.advanceTimersByTime(0);
                results.push(throttled(3));
                vi.advanceTimersByTime(1);

                expect(calls.map((call) => call.args[0])).toEqual([1, 2, 3]);
                expect(results).toEqual(["r1", "r2", "r3"]);
            }
        });

        it("defers a lone call to the next tick when wait is zero and leading is false", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 0, { leading: false });

            throttled(1);
            expect(calls).toHaveLength(0);

            vi.advanceTimersByTime(0);
            expect(calls.map((call) => call.args[0])).toEqual([1]);

            // a second call within the same tick is invoked at once, since the zero wait has already elapsed
            throttled(2);
            throttled(3);
            expect(calls.map((call) => call.args[0])).toEqual([1, 3]);

            vi.advanceTimersByTime(0);
            expect(calls).toHaveLength(2);
        });

        it("coerces a numeric string wait", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, "40" as unknown as number);

            throttled(1);
            throttled(2);
            vi.advanceTimersByTime(39);
            expect(calls).toHaveLength(1);

            vi.advanceTimersByTime(1);
            expect(calls.map((call) => call.args[0])).toEqual([1, 2]);
        });
    });

    describe("return value", () => {
        it("returns the result of the last invocation, so a leading call returns its own result", () => {
            const { fn } = createSpy();
            const throttled = _throttle(fn, 50);
            const results = [throttled(1), throttled(2)];

            vi.advanceTimersByTime(60);
            results.push(throttled(3), throttled(4));
            vi.advanceTimersByTime(60);
            results.push(throttled(5));

            expect(results).toEqual(["r1", "r1", "r3", "r3", "r5"]);
        });

        it("returns undefined until the first invocation when leading is false", () => {
            const { fn } = createSpy();
            const throttled = _throttle(fn, 50, { leading: false });
            const results = [throttled(1), throttled(2)];

            vi.advanceTimersByTime(60);
            results.push(throttled(3));

            expect(results).toEqual([undefined, undefined, "r2"]);
        });
    });

    describe("this binding", () => {
        it("invokes with the this of the call that triggered the invocation", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);
            const first = { id: 1 };
            const second = { id: 2 };
            const third = { id: 3 };

            throttled.call(first, 1);
            throttled.call(second, 2);
            vi.advanceTimersByTime(60);
            throttled.call(third, 3);
            vi.advanceTimersByTime(60);

            expect(calls.map((call) => call.self)).toEqual([first, second, third]);
        });
    });

    describe("cancel and flush", () => {
        it("cancel drops the pending trailing invocation and resets the window", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            throttled(2);
            vi.advanceTimersByTime(20);
            expect(throttled.cancel()).toBeUndefined();

            vi.advanceTimersByTime(100);
            expect(calls.map((call) => call.args[0])).toEqual([1]);

            throttled(3);
            vi.advanceTimersByTime(100);
            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [120, 3],
            ]);
        });

        it("cancel is a no-op when nothing is pending", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled.cancel();
            throttled(1);
            vi.advanceTimersByTime(100);

            expect(calls.map((call) => call.args[0])).toEqual([1]);
        });

        it("flush invokes the pending trailing call immediately and returns its result", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            throttled(2);
            vi.advanceTimersByTime(20);

            expect(throttled.flush()).toBe("r2");
            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [20, 2],
            ]);
            expect(throttled.flush()).toBe("r2");
            expect(calls).toHaveLength(2);
        });
    });

    describe("edge cases", () => {
        it("throws for a non-function", () => {
            expect(() => _throttle("nope" as unknown as () => void, 10)).toThrow(TypeError);
            expect(() => _throttle("nope" as unknown as () => void, 10)).toThrow("Expected a function");
            expect(() => _throttle(undefined as unknown as () => void)).toThrow(TypeError);
        });

        it("treats the system clock going backwards as the trailing edge", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            vi.advanceTimersByTime(20);
            vi.setSystemTime(Date.now() - 100);
            throttled(2);

            expect(calls.map((call) => call.args[0])).toEqual([1, 2]);
        });

        it("starts a fresh window after a long idle period", () => {
            const { fn, calls } = createSpy();
            const throttled = _throttle(fn, 50);

            throttled(1);
            vi.advanceTimersByTime(1000);
            throttled(2);
            vi.advanceTimersByTime(10);
            throttled(3);
            vi.advanceTimersByTime(10);
            throttled(4);
            vi.advanceTimersByTime(60);

            expect(calls.map((call) => [call.time, call.args[0]])).toEqual([
                [0, 1],
                [1000, 2],
                [1050, 4],
            ]);
        });
    });

    describe("typing", () => {
        it("types the throttled function, its result and its methods", () => {
            const throttled = _throttle((a: number, b: string) => `${a}${b}`, 10);
            const result: string = throttled(1, "x");
            const flushed: string | undefined = throttled.flush();
            const cancelled: void = throttled.cancel();

            expect(result).toBe("1x");
            expect(flushed).toBe("1x");
            expect(cancelled).toBeUndefined();
        });

        it("keeps undefined in the result when leading is false", () => {
            const throttled = _throttle((a: number) => a * 2, 10, { leading: false });
            const result: number | undefined = throttled(1);

            expect(result).toBeUndefined();
        });
    });
});
