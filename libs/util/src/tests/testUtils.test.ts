// (C) 2007-2020 GoodData Corporation
import { vi, describe, it } from "vitest";
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
