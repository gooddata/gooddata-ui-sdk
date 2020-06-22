// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { withCaching } from "../index";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { IAttributeOrMeasure, IBucket, newInsightDefinition, newBucket } from "@gooddata/sdk-model";

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

function doInsightExecution(backend: IAnalyticalBackend, buckets: IBucket[]): Promise<IExecutionResult> {
    const insight = newInsightDefinition("foo", (i) => i.buckets(buckets));
    return backend.workspace("test").execution().forInsight(insight).execute();
}

describe("withCaching", () => {
    it("caches executions calls", async () => {
        const backend = createBackend();

        const first = await doExecution(backend, [ReferenceLdm.Won]);
        const second = await doExecution(backend, [ReferenceLdm.Won]);

        expect(await second.readAll()).toBe(await first.readAll());
    });

    it("caches insight executions calls with different buckets with the same measures and sanitizes the definition", async () => {
        const backend = createBackend();

        const firstBuckets = [newBucket("measures", ReferenceLdm.Won, ReferenceLdm.WinRate)];

        const secondBuckets = [
            newBucket("measures", ReferenceLdm.Won),
            newBucket("secondary_measures", ReferenceLdm.WinRate),
        ];

        const first = await doInsightExecution(backend, firstBuckets);
        const second = await doInsightExecution(backend, secondBuckets);

        // they have the same fingerprint...
        expect(second.equals(first)).toBe(true);
        // ... but different definitions (as the buckets are different)...
        expect(second.definition).not.toEqual(first.definition);

        const firstAll = await first.readAll();
        const secondAll = await second.readAll();

        // ...yet still result in equal data views...
        expect(secondAll.equals(firstAll)).toBe(true);
        // ... with different definitions
        expect(secondAll.definition).not.toEqual(firstAll.definition);
        expect(firstAll.definition).toBe(first.definition);
        expect(secondAll.definition).toBe(second.definition);
    });

    it("caches insight executions calls with same buckets with the same measures and returns the same object", async () => {
        const backend = createBackend();

        const buckets = [newBucket("measures", ReferenceLdm.Won, ReferenceLdm.WinRate)];
        const result = await doInsightExecution(backend, buckets);

        const first = await result.readWindow([0, 0], [1, 1]);
        const second = await result.readWindow([0, 0], [1, 1]);

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
        const first = await result.readWindow([0, 0], [1, 1]);
        const second = await result.readWindow([0, 0], [1, 1]);

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
