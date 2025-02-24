// (C) 2019-2025 GoodData Corporation
import { makeCancelable, CancelError } from "../CancelablePromise.js";
import { createDummyPromise } from "./toolkit.js";
import { describe, expect, it } from "vitest";

describe("CancelablePromise", () => {
    it("should throw instanceof CancelError with correct message when cancel was invoked before promise resolution", async () => {
        const CANCEL_REASON = "Canceled before promise resolution";
        const dummyPromise = createDummyPromise({ delay: 100 });
        const cancelableDummyPromise = makeCancelable(() => dummyPromise);

        cancelableDummyPromise.cancel(CANCEL_REASON);

        let error: CancelError | undefined;
        try {
            await cancelableDummyPromise.promise;
        } catch (err: any) {
            error = err;
        }

        expect(error).toBeInstanceOf(CancelError);
        expect(error!.getReason()).toBe(CANCEL_REASON);
    });

    it("should return original promise result when cancel was invoked after promise resolution", async () => {
        const RESULT = "RESULT";
        const dummyPromise = createDummyPromise({
            result: RESULT,
            delay: 100,
        });
        const cancelableDummyPromise = makeCancelable(() => dummyPromise);
        const result = await cancelableDummyPromise.promise;

        cancelableDummyPromise.cancel();

        expect(result).toBe(RESULT);
    });

    it("getHasFulfilled should return false before promise resolution", async () => {
        const RESULT = "RESULT";
        const dummyPromise = createDummyPromise({
            result: RESULT,
            delay: 100,
        });
        const cancelableDummyPromise = makeCancelable(() => dummyPromise);
        const hasFulfilled = cancelableDummyPromise.getHasFulfilled();

        expect(hasFulfilled).toBe(false);
    });

    it("getHasFulfilled should return true after promise resolution", async () => {
        const RESULT = "RESULT";
        const dummyPromise = createDummyPromise({
            result: RESULT,
            delay: 100,
        });
        const cancelableDummyPromise = makeCancelable(() => dummyPromise);
        await cancelableDummyPromise.promise;
        const hasFulfilled = cancelableDummyPromise.getHasFulfilled();

        expect(hasFulfilled).toBe(true);
    });

    it("should throw original promise error when cancel was invoked after promise resolution", async () => {
        const ERROR = new Error("ORIGINAL ERROR");
        const dummyPromise = createDummyPromise({
            error: ERROR,
            willResolve: false,
            delay: 100,
        });
        const cancelableDummyPromise = makeCancelable(() => dummyPromise);
        let error;
        try {
            await cancelableDummyPromise.promise;
        } catch (err) {
            error = err;
        }

        cancelableDummyPromise.cancel();

        expect(error).toBe(ERROR);
    });
});
