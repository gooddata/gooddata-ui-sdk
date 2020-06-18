// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { withCaching } from "../index";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { IAttributeOrMeasure } from "@gooddata/sdk-model";

function createBackend(realBackend: IAnalyticalBackend = dummyBackendEmptyData()): IAnalyticalBackend {
    return withCaching(realBackend, {
        maxCatalogs: 1,
        maxCatalogOptions: 1,
        maxExecutions: 1,
        maxResultWindows: 1,
    });
}

function doExecution(backend: IAnalyticalBackend, items: IAttributeOrMeasure[]): Promise<IExecutionResult> {
    return backend.workspace("test").execution().forItems(items).execute();
}

describe("withCaching", () => {
    it("caches executions calls", () => {
        const backend = createBackend();

        const first = doExecution(backend, [ReferenceLdm.Won]);
        const second = doExecution(backend, [ReferenceLdm.Won]);

        expect(second).toBe(first);
    });

    it("evicts when execution cache limit hit", () => {
        const backend = createBackend();

        const first = doExecution(backend, [ReferenceLdm.Won]);
        doExecution(backend, [ReferenceLdm.Amount]);
        const second = doExecution(backend, [ReferenceLdm.Won]);

        expect(second).not.toBe(first);
    });

    it("caches readWindow calls", async () => {
        const backend = createBackend();

        const result = await doExecution(backend, [ReferenceLdm.Won]);
        const first = result.readWindow([0, 0], [1, 1]);
        const second = result.readWindow([0, 0], [1, 1]);

        expect(second).toBe(first);
    });

    it("evicts when readWindow limit hit", async () => {
        const backend = createBackend();

        const result = await doExecution(backend, [ReferenceLdm.Won]);
        const first = result.readWindow([0, 0], [1, 1]);
        result.readWindow([0, 0], [2, 2]);
        const second = result.readWindow([0, 0], [1, 1]);

        expect(second).not.toBe(first);
    });

    it("deletes from cache if error occurs", async () => {
        const backend = createBackend(dummyBackend());

        const result = await doExecution(backend, [ReferenceLdm.Won]);

        // backend will throw no data
        const first = result.readWindow([0, 0], [1, 1]);

        // as the promise completes, the catch should clean up anything that is cached
        try {
            await first;
        } catch (e) {
            // ignored
        }

        // and the second attempt will give new promise
        const second = result.readWindow([0, 0], [1, 1]);

        expect(second).not.toBe(first);
    });

    it("caches workspace catalogs", () => {
        const backend = createBackend();

        const first = backend.workspace("test").catalog().load();
        const second = backend.workspace("test").catalog().load();

        expect(second).toBe(first);
    });

    it("evicts workspace catalogs", () => {
        const backend = createBackend();

        const first = backend.workspace("test").catalog().load();
        backend.workspace("someOtherWorkspace").catalog().load();
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    it("evicts workspace catalogs options", () => {
        const backend = createBackend();

        // first call caches result when getting catalog with default options
        const first = backend.workspace("test").catalog().load();

        // second call done explicitly with different options => evict previous entry
        backend.workspace("test").catalog().forTypes(["attribute"]).load();

        // now back to default options, will be new promise
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });
});
