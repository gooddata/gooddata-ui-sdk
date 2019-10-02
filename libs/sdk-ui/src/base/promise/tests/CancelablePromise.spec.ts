// (C) 2019 GoodData Corporation
import { makeCancelable, CancelError } from "../CancelablePromise";

interface IDummyPromise<R, E> {
    willResolve?: boolean;
    result?: R;
    error?: E;
}

const createDummyPromise = <R, E>({ willResolve = true, result, error }: IDummyPromise<R, E> = {}) =>
    new Promise<R>((resolve, reject) => {
        setTimeout(() => {
            if (willResolve) {
                resolve(result);
            } else {
                reject(error);
            }
        }, 100);
    });

describe("CancelablePromise", () => {
    it("should throw instanceof CancelError with correct message when cancel was invoked before promise resolution", async () => {
        const CANCEL_REASON = "Canceled before promise resolution";
        const dummyPromise = createDummyPromise();
        const cancelableDummyPromise = makeCancelable(dummyPromise);

        cancelableDummyPromise.cancel(CANCEL_REASON);

        let error: CancelError;
        try {
            await cancelableDummyPromise.promise;
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(CancelError);
        expect(error.message).toBe(CANCEL_REASON);
    });

    it("should return original promise result when cancel was invoked after promise resolution", async () => {
        const RESULT = "RESULT";
        const dummyPromise = createDummyPromise({
            result: RESULT,
        });
        const cancelableDummyPromise = makeCancelable(dummyPromise);
        const result = await cancelableDummyPromise.promise;

        cancelableDummyPromise.cancel();

        expect(result).toBe(RESULT);
    });

    it("should throw original promise error when cancel was invoked after promise resolution", async () => {
        const ERROR = new Error("ORIGINAL ERROR");
        const dummyPromise = createDummyPromise({
            error: ERROR,
            willResolve: false,
        });
        const cancelableDummyPromise = makeCancelable(dummyPromise);
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
