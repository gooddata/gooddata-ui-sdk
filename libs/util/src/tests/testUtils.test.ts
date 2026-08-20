// (C) 2007-2026 GoodData Corporation

import { afterEach, beforeEach, describe, it, vi } from "vitest";

import { delay } from "../testUtils.js";

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
});
