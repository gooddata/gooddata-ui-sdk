// (C) 2007-2019 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { newMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "../../dummyBackend";
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

    it("emits successfulResultReadAll", async () => {
        const successfulResultReadAll = jest.fn();
        const backend = withEventing(dummyBackend(), { successfulResultReadAll });

        await (await prepareExecution(backend).execute()).readAll();

        expect(successfulResultReadAll).toHaveBeenCalled();
    });
});
