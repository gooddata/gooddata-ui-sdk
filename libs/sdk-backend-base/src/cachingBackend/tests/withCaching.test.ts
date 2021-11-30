// (C) 2007-2021 GoodData Corporation

import {
    IAnalyticalBackend,
    IAttributeDisplayFormMetadataObject,
    IExecutionResult,
} from "@gooddata/sdk-backend-spi";
import { CacheControl, withCaching } from "../index";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { IAttributeOrMeasure, IBucket, newBucket, newInsightDefinition, ObjRef } from "@gooddata/sdk-model";
import { withEventing } from "../../eventingBackend";

const defaultBackend = dummyBackendEmptyData();

function withCachingForTests(
    realBackend: IAnalyticalBackend = defaultBackend,
    onCacheReady?: (cacheControl: CacheControl) => void,
): IAnalyticalBackend {
    return withCaching(realBackend, {
        maxCatalogs: 1,
        maxCatalogOptions: 1,
        maxExecutions: 1,
        maxResultWindows: 1,
        maxSecuritySettingsOrgs: 1,
        maxSecuritySettingsOrgUrls: 1,
        maxSecuritySettingsOrgUrlsAge: 300_000,
        // set to two as one attribute can take up two places (one for id, one for uri)
        maxAttributeDisplayFormsPerWorkspace: 2,
        maxAttributeWorkspaces: 1,
        onCacheReady,
    });
}

function doExecution(backend: IAnalyticalBackend, items: IAttributeOrMeasure[]): Promise<IExecutionResult> {
    return backend.workspace("test").execution().forItems(items).execute();
}

function doInsightExecution(backend: IAnalyticalBackend, buckets: IBucket[]): Promise<IExecutionResult> {
    const insight = newInsightDefinition("foo", (i) => i.buckets(buckets));
    return backend.workspace("test").execution().forInsight(insight).execute();
}

function doGetAttributeDisplayForm(
    backend: IAnalyticalBackend,
    ref: ObjRef,
): Promise<IAttributeDisplayFormMetadataObject> {
    return backend.workspace("test").attributes().getAttributeDisplayForm(ref);
}

function doGetAttributeDisplayForms(
    backend: IAnalyticalBackend,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return backend.workspace("test").attributes().getAttributeDisplayForms(refs);
}

describe("withCaching", () => {
    it("caches executions calls", async () => {
        const backend = withCachingForTests();

        const first = await doExecution(backend, [ReferenceLdm.Won]);
        const second = await doExecution(backend, [ReferenceLdm.Won]);
        const firstData = await first.readAll();
        const secondData = await second.readAll();

        expect((firstData as any).decorated).toBe((secondData as any).decorated);
    });

    it("maintains the caching decorator", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceLdm.Won]);
        const dataView = await result.readAll();

        expect(dataView.result).toBe(result);
    });

    it("caches insight executions calls with different buckets with the same measures and sanitizes the definition", async () => {
        const backend = withCachingForTests();

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

    it("keeps the cached data views' methods intact", async () => {
        const backend = withCachingForTests();

        const firstBuckets = [newBucket("measures", ReferenceLdm.Won, ReferenceLdm.WinRate)];

        const secondBuckets = [
            newBucket("measures", ReferenceLdm.Won),
            newBucket("secondary_measures", ReferenceLdm.WinRate),
        ];

        const first = await doInsightExecution(backend, firstBuckets);
        const second = await doInsightExecution(backend, secondBuckets);

        const firstAll = await first.readAll();
        // the secondAll object is from cache but has an altered definition, let's check the methods are still there and work
        const secondAll = await second.readAll();

        expect(secondAll.fingerprint).toBeDefined();
        expect(secondAll.equals(firstAll)).toBe(true);
    });

    it("evicts when execution cache limit hit", () => {
        const backend = withCachingForTests();

        const first = doExecution(backend, [ReferenceLdm.Won]);
        doExecution(backend, [ReferenceLdm.Amount]);
        const second = doExecution(backend, [ReferenceLdm.Won]);

        expect(second).not.toBe(first);
    });

    it("caches readWindow calls", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceLdm.Won]);
        const first = await result.readWindow([0, 0], [1, 1]);
        const second = await result.readWindow([0, 0], [1, 1]);

        expect((second as any).decorated).toBe((first as any).decorated);
    });

    it("evicts when readWindow limit hit", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceLdm.Won]);
        const first = result.readWindow([0, 0], [1, 1]);
        result.readWindow([0, 0], [2, 2]);
        const second = result.readWindow([0, 0], [1, 1]);

        expect(second).not.toBe(first);
    });

    it("deletes from cache if error occurs", async () => {
        const backend = withCachingForTests(dummyBackend());

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

        try {
            await second;
        } catch (e) {
            // ignored
        }

        expect(second).not.toBe(first);
    });

    it("caches workspace catalogs", () => {
        const backend = withCachingForTests();

        const first = backend.workspace("test").catalog().load();
        const second = backend.workspace("test").catalog().load();

        expect(second).toBe(first);
    });

    it("evicts workspace catalogs", () => {
        const backend = withCachingForTests();

        const first = backend.workspace("test").catalog().load();
        backend.workspace("someOtherWorkspace").catalog().load();
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    it("evicts workspace catalogs options", () => {
        const backend = withCachingForTests();

        // first call caches result when getting catalog with default options
        const first = backend.workspace("test").catalog().load();

        // second call done explicitly with different options => evict previous entry
        backend.workspace("test").catalog().forTypes(["attribute"]).load();

        // now back to default options, will be new promise
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    it("calls onCacheReady during construction", () => {
        let cacheControl: CacheControl | undefined;

        withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

        expect(cacheControl).toBeDefined();
    });

    it("resets execution cache", async () => {
        /*
         * Execution caching is fully transparent. To verify effective executions, this test uses backend
         * decorated with eventing in order to figure out how many executions fell through the caching.
         */

        let cacheControl: CacheControl | undefined;
        let effectiveExecutions: number = 0;
        const realBackend = withEventing(defaultBackend, { successfulExecute: () => effectiveExecutions++ });
        const cachingBackend = withCachingForTests(realBackend, (cc) => (cacheControl = cc));

        await doExecution(cachingBackend, [ReferenceLdm.Won]);
        cacheControl?.resetExecutions();
        await doExecution(cachingBackend, [ReferenceLdm.Won]);

        expect(effectiveExecutions).toEqual(2);
    });

    it("resets catalog cache", async () => {
        let cacheControl: CacheControl | undefined;

        const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));
        const first = backend.workspace("test").catalog().load();
        cacheControl?.resetCatalogs();
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    describe("security settings", () => {
        const ORGANIZATION_ID = "org";
        const URL = "https://gooddata.com";

        it("caches organization security settings URL validation result", () => {
            const backend = withCachingForTests();

            const first = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");
            const second = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");

            expect(second).toBe(first);
        });

        it("evicts organization security settings", () => {
            const backend = withCachingForTests();

            const first = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");
            backend.organization("someOtherOrg").securitySettings().isUrlValid(URL, "UI_EVENT");
            const second = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");

            expect(second).not.toBe(first);
        });

        it("evicts organization security settings URL validation result", () => {
            const backend = withCachingForTests();

            // first call caches result when getting security settings with default options
            const first = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");

            // second call done explicitly with different options => evict previous entry
            backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid("https://example.com", "UI_EVENT");

            // now back to default options, will be new promise
            const second = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");

            expect(second).not.toBe(first);
        });

        it("resets security settings cache", async () => {
            let cacheControl: CacheControl | undefined;

            const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));
            const first = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");
            cacheControl?.resetSecuritySettings();
            const second = backend
                .organization(ORGANIZATION_ID)
                .securitySettings()
                .isUrlValid(URL, "UI_EVENT");

            expect(second).not.toBe(first);
        });
    });

    describe("attributes", () => {
        describe("getAttributeDisplayForm and getAttributeDisplayForms", () => {
            it("should cache the scalar calls", async () => {
                const backend = withCachingForTests();

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );
                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                expect(second).toBe(first);
            });

            it("should cache the vector calls", async () => {
                const backend = withCachingForTests();

                const first = await doGetAttributeDisplayForms(backend, [
                    ReferenceLdm.Account.Name.attribute.displayForm,
                ]);
                const second = await doGetAttributeDisplayForms(backend, [
                    ReferenceLdm.Account.Name.attribute.displayForm,
                ]);

                expect(second[0]).toBe(first[0]);
            });

            it("should use cached results from scalar version in the vector version", async () => {
                const backend = withCachingForTests();

                const scalar = await doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );
                const vector = await doGetAttributeDisplayForms(backend, [
                    ReferenceLdm.Account.Name.attribute.displayForm,
                    ReferenceLdm.Activity.Default.attribute.displayForm,
                ]);

                expect(vector[0]).toBe(scalar);
            });

            it("should use cached results from vector version in the scalar version", async () => {
                const backend = withCachingForTests();

                const vector = await doGetAttributeDisplayForms(backend, [
                    ReferenceLdm.Account.Name.attribute.displayForm,
                ]);
                const scalar = await doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                expect(scalar).toBe(vector[0]);
            });

            it("should evict cache items when the limit is hit", async () => {
                const backend = withCachingForTests();

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                // other 2 calls with different display form to replace the first one
                doGetAttributeDisplayForm(backend, ReferenceLdm.Activity.Default.attribute.displayForm);
                doGetAttributeDisplayForm(backend, ReferenceLdm.Activity.Subject.attribute.displayForm);

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAttributes", async () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAttributes();

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAll", async () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAll();

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceLdm.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });
        });
    });
});
