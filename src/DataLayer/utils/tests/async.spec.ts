// (C) 2007-2018 GoodData Corporation
import { createSubject } from "../async";

function delay(timeout = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

describe("createSubject", () => {
    it("should keep stream opened after error", done => {
        const error = jest.fn();
        let successCalls = 0;
        const subject = createSubject(() => {
            successCalls++;
            if (successCalls === 2) {
                expect(error).toHaveBeenCalledTimes(1);
                subject.unsubscribe();
                done();
            }
        }, error);

        subject.next(Promise.resolve("a"));
        delay().then(() => {
            subject.next(Promise.reject("b"));
            return delay().then(() => {
                subject.next(Promise.resolve("c"));
            });
        });
    });
});
