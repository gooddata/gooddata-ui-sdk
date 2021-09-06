// (C) 2007-2021 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { newMeasure } from "@gooddata/sdk-model";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend";
import { withEventing } from "../index";

function prepareExecution(backend: IAnalyticalBackend): IPreparedExecution {
    return backend
        .workspace("test")
        .execution()
        .forItems([newMeasure("testMeasure")]);
}

describe("withEventing backend", () => {
    it("emits beforeExecute", () => {
        const beforeExecute = jest.fn();
        const backend = withEventing(dummyBackend(), { beforeExecute });

        prepareExecution(backend).execute();

        expect(beforeExecute).toHaveBeenCalled();
    });

    it("emits successfulExecute", async () => {
        const successfulExecute = jest.fn();
        const backend = withEventing(dummyBackend(), { successfulExecute });

        await prepareExecution(backend).execute();

        expect(successfulExecute).toHaveBeenCalled();
    });

    it("emits successfulExecute even if no data", async () => {
        const successfulExecute = jest.fn();
        const backend = withEventing(dummyBackend(), { successfulExecute });

        await prepareExecution(backend).execute();

        expect(successfulExecute).toHaveBeenCalled();
    });

    it("emits successfulResultReadAll", async () => {
        const successfulResultReadAll = jest.fn();
        const backend = withEventing(dummyBackendEmptyData(), { successfulResultReadAll });

        await (await prepareExecution(backend).execute()).readAll();

        expect(successfulResultReadAll).toHaveBeenCalled();
    });

    it("emits successfulResultReadWindow", async () => {
        const successfulResultReadWindow = jest.fn();
        const backend = withEventing(dummyBackendEmptyData(), { successfulResultReadWindow });

        await (await prepareExecution(backend).execute()).readWindow([1, 2], [100, 1000]);

        expect(successfulResultReadWindow).toHaveBeenCalledWith(
            [1, 2],
            [100, 1000],
            expect.any(Object),
            expect.any(String),
        );
    });

    it("emits failedResultReadAll", async () => {
        const failedResultReadAll = jest.fn();
        const backend = withEventing(dummyBackend(), { failedResultReadAll });

        try {
            await (await prepareExecution(backend).execute()).readAll();
        } catch (e) {
            // expected to throw
        }

        expect(failedResultReadAll).toHaveBeenCalled();
    });

    it("emits failedResultReadWindow", async () => {
        const failedResultReadWindow = jest.fn();
        const backend = withEventing(dummyBackend(), {
            failedResultReadWindow,
        });

        try {
            await (await prepareExecution(backend).execute()).readWindow([1, 2], [100, 1000]);
        } catch (e) {
            // expected to throw
        }

        expect(failedResultReadWindow).toHaveBeenCalledWith(
            [1, 2],
            [100, 1000],
            expect.any(Object),
            expect.any(String),
        );
    });
});
