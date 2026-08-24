// (C) 2007-2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTightWaitFor, delay } from "./testUtils.js";

type PollOptions = { interval?: number };

/**
 * A stand-in for testing-library's `waitFor` that runs the callback once and records the options it
 * was handed, so the wrapper's own contract can be asserted without pulling in testing-library.
 */
function recordingWaitFor(calls: Array<PollOptions | undefined>) {
    return <T>(callback: () => T | Promise<T>, options?: PollOptions): Promise<T> => {
        calls.push(options);
        return Promise.resolve(callback());
    };
}

describe("testUtils", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("delay", () => {
        it("should call doneFn after timeout", async () => {
            const pendingDelay = delay(2);

            vi.runAllTimers();

            await pendingDelay;
        });
    });

    describe("createTightWaitFor", () => {
        it("polls every millisecond by default and passes the result through", async () => {
            const calls: Array<PollOptions | undefined> = [];
            const settle = createTightWaitFor(recordingWaitFor(calls));

            await expect(settle(() => "settled")).resolves.toBe("settled");

            expect(calls).toEqual([{ interval: 1 }]);
        });

        it("polls at a caller-provided interval instead", async () => {
            const calls: Array<PollOptions | undefined> = [];
            const settle = createTightWaitFor(recordingWaitFor(calls), 5);

            await settle(() => undefined);

            expect(calls).toEqual([{ interval: 5 }]);
        });
    });
});
