// (C) 2007-2025 GoodData Corporation
import { describe, it, vi } from "vitest";

import { delay } from "../testUtils.js";

vi.useFakeTimers();

describe("testUtils", () => {
    describe("delay", () => {
        it("should call doneFn after timeout", async () => {
            const pendingDelay = delay(2);

            vi.runAllTimers();

            await pendingDelay;
        });
    });
});
