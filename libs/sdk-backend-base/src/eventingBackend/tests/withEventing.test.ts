// (C) 2007-2021 GoodData Corporation
import { describe, it, expect, vi } from "vitest";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { newMeasure } from "@gooddata/sdk-model";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend/index.js";
import { withEventing } from "../index.js";

function prepareExecution(backend: IAnalyticalBackend): IPreparedExecution {
    return backend
        .workspace("test")
        .execution()
        .forItems([newMeasure("testMeasure")]);
}

describe("withEventing backend", () => {
    it("emits beforeExecute", () => {
        const beforeExecute = vi.fn();
        const backend = withEventing(dummyBackend(), { beforeExecute });

        prepareExecution(backend).execute();

        expect(beforeExecute).toHaveBeenCalled();
    });

    it("emits successfulExecute", async () => {
        const successfulExecute = vi.fn();
        const backend = withEventing(dummyBackend(), { successfulExecute });

        await prepareExecution(backend).execute();

        expect(successfulExecute).toHaveBeenCalled();
    });

    it("emits successfulExecute even if no data", async () => {
        const successfulExecute = vi.fn();
        const backend = withEventing(dummyBackend(), { successfulExecute });

        await prepareExecution(backend).execute();

        expect(successfulExecute).toHaveBeenCalled();
    });

    it("emits successfulResultReadAll", async () => {
        const successfulResultReadAll = vi.fn();
        const backend = withEventing(dummyBackendEmptyData(), { successfulResultReadAll });

        await (await prepareExecution(backend).execute()).readAll();

        expect(successfulResultReadAll).toHaveBeenCalled();
    });

    it("emits successfulResultReadWindow", async () => {
        const successfulResultReadWindow = vi.fn();
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
        const failedResultReadAll = vi.fn();
        const backend = withEventing(dummyBackend(), { failedResultReadAll });

        try {
            await (await prepareExecution(backend).execute()).readAll();
        } catch (e) {
            // expected to throw
        }

        expect(failedResultReadAll).toHaveBeenCalled();
    });

    it("emits failedResultReadWindow", async () => {
        const failedResultReadWindow = vi.fn();
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
