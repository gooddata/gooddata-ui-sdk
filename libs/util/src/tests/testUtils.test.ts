// (C) 2007-2020 GoodData Corporation
import { delay } from "../testUtils.js";
import { jest } from "@jest/globals";

jest.useFakeTimers();

describe("testUtils", () => {
    describe("delay", () => {
        it("should call doneFn after timeout", (doneFn) => {
            const pendingDelay = delay(2);

            jest.runAllTimers();

            pendingDelay.then(() => {
                doneFn();
            });
        });
    });
});
