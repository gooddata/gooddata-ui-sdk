// (C) 2007-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IAnalyticalBackend,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IElementsQueryResult,
    type IExecutionResult,
    type IGeoService,
    type IGetInsightOptions,
    type IPreparedExecution,
    type IWorkspaceExportTemplatesService,
    type IWorkspaceFactsService,
    type IWorkspaceInsightsService,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type IBucket,
    type IExportTemplate,
    type IExportTemplateDefinition,
    type IFactMetadataObject,
    type IGeoJsonFeature,
    type IInsight,
    type IMetadataObject,
    type ObjRef,
    geoFeatureId,
    idRef,
    newBucket,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import {
    DecoratedDataView,
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
} from "../../decoratedBackend/execution.js";
import { decoratedBackend } from "../../decoratedBackend/index.js";
import { DecoratedWorkspaceInsightsService } from "../../decoratedBackend/insights.js";
import { DecoratedWorkspaceExportTemplatesService } from "../../decoratedBackend/workspaceExportTemplates.js";
import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend/index.js";
import { withEventing } from "../../eventingBackend/index.js";
import { type CacheControl, type CachingConfiguration, withCaching } from "../index.js";

const defaultBackend = dummyBackendEmptyData();

function withCachingForTests(
    realBackend: IAnalyticalBackend = defaultBackend,
    onCacheReady?: (cacheControl: CacheControl) => void,
    configOverrides: Partial<CachingConfiguration> = {},
): IAnalyticalBackend {
    return withCaching(realBackend, {
        maxCatalogs: 1,
        maxCatalogOptions: 1,
        maxExecutions: 1,
        maxResultWindows: 1,
        maxGeoCollectionItemsPerResult: 50,
        maxSecuritySettingsOrgs: 1,
        maxSecuritySettingsOrgUrls: 1,
        maxSecuritySettingsOrgUrlsAge: 300_000,
        // set to two as one attribute can take up two places (one for id, one for uri)
        maxAttributeDisplayFormsPerWorkspace: 2,
        // set to two as one attribute can take up two places (one for id, one for uri)
        maxAttributesPerWorkspace: 2,
        maxAttributeElementResultsPerWorkspace: 1,
        maxAttributeWorkspaces: 1,
        maxWorkspaceSettings: 1,
        maxAutomationsWorkspaces: 1,
        maxInsightsPerWorkspace: 2,
        maxExportTemplatesWorkspaces: 1,
        maxFactsWorkspaces: 1,
        maxFactsPerWorkspace: 2,
        cacheGeoStyles: true,
        onCacheReady,
        ...configOverrides,
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

function doGetAttributeByDisplayForm(
    backend: IAnalyticalBackend,
    ref: ObjRef,
): Promise<IAttributeMetadataObject> {
    return backend.workspace("test").attributes().getAttributeByDisplayForm(ref);
}

function doGetAttributeElements(backend: IAnalyticalBackend, ref: ObjRef): Promise<IElementsQueryResult> {
    return backend.workspace("test").attributes().elements().forDisplayForm(ref).query();
}

type CollectionItemsProvider = (config: ICollectionItemsConfig) => ICollectionItemsResult;

function createGeoCollectionBackend(provider: CollectionItemsProvider): IAnalyticalBackend {
    const backend = dummyBackendEmptyData();

    return decoratedBackend(backend, {
        execution: (factory) =>
            new DecoratedExecutionFactory(
                factory,
                (execution) => new GeoPreparedExecution(execution, provider),
            ),
    });
}

function createGeoStyleBackend(
    getDefaultStyle: IGeoService["getDefaultStyle"],
    getDefaultStyleSpriteIcons: IGeoService["getDefaultStyleSpriteIcons"] = async () => [],
): IAnalyticalBackend {
    const backend = dummyBackendEmptyData();

    return {
        ...backend,
        geo: () => ({
            ...backend.geo(),
            getDefaultStyle,
            getDefaultStyleSpriteIcons,
        }),
    };
}

const FACT_REF: ObjRef = idRef("fact.foo", "fact");

const SAMPLE_FACT = {
    type: "fact",
    id: "fact.foo",
    uri: "/facts/fact.foo",
    ref: FACT_REF,
    title: "Foo fact",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
} as IFactMetadataObject;

const SAMPLE_FACT_DATASET = {
    type: "dataSet",
    id: "dataset.foo",
    uri: "/datasets/dataset.foo",
    ref: idRef("dataset.foo", "dataSet"),
    title: "Foo dataset",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
} as IMetadataObject;

/**
 * Builds a backend whose facts service delegates to the provided (typically call-counting) implementations.
 * The default dummy backend's facts service throws NotSupported, so tests need to supply their own.
 */
function createFactsBackend(
    getFact: IWorkspaceFactsService["getFact"],
    getFactDatasetMeta: IWorkspaceFactsService["getFactDatasetMeta"] = () =>
        Promise.resolve(SAMPLE_FACT_DATASET),
): IAnalyticalBackend {
    const backend = dummyBackendEmptyData();

    return {
        ...backend,
        workspace: (id: string) => ({
            ...backend.workspace(id),
            facts: () => ({
                ...backend.workspace(id).facts(),
                getFact,
                getFactDatasetMeta,
            }),
        }),
    };
}

function createGeoFeature(value: string): IGeoJsonFeature {
    return {
        type: "Feature",
        id: value,
        properties: {},
        geometry: {
            type: "Point",
            coordinates: [0, 0],
        },
    };
}

type InsightGetter = (ref: ObjRef, options?: IGetInsightOptions) => Promise<IInsight>;

/**
 * A call-counting decorator for the insights service. It counts how many times the underlying
 * (decorated) getInsight gets invoked - used to assert that the caching layer de-duplicates
 * concurrent reads of the same insight into a single underlying call.
 */
class CallCountingInsightsService extends DecoratedWorkspaceInsightsService {
    constructor(
        decorated: IWorkspaceInsightsService,
        workspace: string,
        private readonly counter: { calls: number },
        private readonly getter: InsightGetter,
    ) {
        super(decorated, workspace);
    }

    public override getInsight = (ref: ObjRef, options?: IGetInsightOptions): Promise<IInsight> => {
        this.counter.calls += 1;
        return this.getter(ref, options);
    };

    public override async updateInsight(insight: IInsight): Promise<IInsight> {
        return insight;
    }
}

function createInsightCountingBackend(getter: InsightGetter): {
    backend: IAnalyticalBackend;
    counter: { calls: number };
} {
    const counter = { calls: 0 };
    const backend = decoratedBackend(dummyBackendEmptyData(), {
        insights: (decorated, workspace) =>
            new CallCountingInsightsService(decorated, workspace, counter, getter),
    });

    return { backend, counter };
}

/**
 * A call-counting decorator for the workspace export templates service. It counts how many times the
 * underlying (decorated) getExportTemplates gets invoked - used to assert that the caching layer
 * de-duplicates reads and invalidates on writes.
 */
class CallCountingWorkspaceExportTemplatesService extends DecoratedWorkspaceExportTemplatesService {
    constructor(
        decorated: IWorkspaceExportTemplatesService,
        private readonly counter: { calls: number },
        private readonly getter: () => Promise<IExportTemplate[]>,
    ) {
        super(decorated);
    }

    public override getExportTemplates = (): Promise<IExportTemplate[]> => {
        this.counter.calls += 1;
        return this.getter();
    };

    public override async createExportTemplate(
        template: IExportTemplateDefinition,
    ): Promise<IExportTemplate> {
        return { ...template, ref: idRef("created") };
    }

    public override async patchExportTemplate(ref: ObjRef): Promise<IExportTemplate> {
        return { name: "patched", ref };
    }

    public override async deleteExportTemplate(): Promise<void> {
        return undefined;
    }
}

function createWorkspaceExportTemplatesCountingBackend(getter: () => Promise<IExportTemplate[]>): {
    backend: IAnalyticalBackend;
    counter: { calls: number };
} {
    const counter = { calls: 0 };
    const backend = decoratedBackend(dummyBackendEmptyData(), {
        workspaceExportTemplates: (decorated) =>
            new CallCountingWorkspaceExportTemplatesService(decorated, counter, getter),
    });

    return { backend, counter };
}

function createTestInsight(id: string): IInsight {
    return {
        insight: {
            ...newInsightDefinition("local:table").insight,
            identifier: id,
            uri: `/insights/${id}`,
            ref: idRef(id, "insight"),
            title: id,
        },
    };
}

describe("withCaching", () => {
    it("caches executions calls", async () => {
        const backend = withCachingForTests();

        const first = await doExecution(backend, [ReferenceMd.Won]);
        const second = await doExecution(backend, [ReferenceMd.Won]);
        const firstData = await first.readAll();
        const secondData = await second.readAll();

        expect((firstData as any).decorated).toBe((secondData as any).decorated);
    });

    it("maintains the caching decorator", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceMd.Won]);
        const dataView = await result.readAll();

        expect(dataView.result).toBe(result);
    });

    it("caches insight executions calls with different buckets with the same measures and sanitizes the definition", async () => {
        const backend = withCachingForTests();

        const firstBuckets = [newBucket("measures", ReferenceMd.Won, ReferenceMd.WinRate)];

        const secondBuckets = [
            newBucket("measures", ReferenceMd.Won),
            newBucket("secondary_measures", ReferenceMd.WinRate),
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

        const firstBuckets = [newBucket("measures", ReferenceMd.Won, ReferenceMd.WinRate)];

        const secondBuckets = [
            newBucket("measures", ReferenceMd.Won),
            newBucket("secondary_measures", ReferenceMd.WinRate),
        ];

        const first = await doInsightExecution(backend, firstBuckets);
        const second = await doInsightExecution(backend, secondBuckets);

        const firstAll = await first.readAll();
        // the secondAll object is from cache but has an altered definition, let's check the methods are still there and work
        const secondAll = await second.readAll();

        expect(secondAll.fingerprint).toBeDefined();
        expect(secondAll.equals(firstAll)).toBe(true);
    });

    it("evicts when execution cache limit hit (count-based)", () => {
        const backend = withCachingForTests();

        const first = doExecution(backend, [ReferenceMd.Won]);
        void doExecution(backend, [ReferenceMd.Amount]);
        const second = doExecution(backend, [ReferenceMd.Won]);

        expect(second).not.toBe(first);
    });

    it("evicts least recently used geo styles when the geo style cache reaches its max size", async () => {
        const getDefaultStyle = vi.fn<IGeoService["getDefaultStyle"]>(async (params) => ({
            language: params?.language,
        }));
        const backend = withCachingForTests(createGeoStyleBackend(getDefaultStyle));

        for (let i = 0; i < 10; i += 1) {
            await backend.geo().getDefaultStyle({ language: `lang-${i}` });
        }

        expect(getDefaultStyle).toHaveBeenCalledTimes(10);

        await backend.geo().getDefaultStyle({ language: "lang-10" });
        await backend.geo().getDefaultStyle({ language: "lang-0" });

        expect(getDefaultStyle).toHaveBeenCalledTimes(12);
    });

    it("caches default style sprite icons", async () => {
        const getDefaultStyleSpriteIcons = vi.fn<IGeoService["getDefaultStyleSpriteIcons"]>(async () => [
            "airport",
            "harbor",
        ]);
        const backend = withCachingForTests(
            createGeoStyleBackend(async () => ({}), getDefaultStyleSpriteIcons),
        );

        const first = await backend.geo().getDefaultStyleSpriteIcons();
        const second = await backend.geo().getDefaultStyleSpriteIcons();

        expect(first).toEqual(["airport", "harbor"]);
        expect(second).toEqual(["airport", "harbor"]);
        expect(getDefaultStyleSpriteIcons).toHaveBeenCalledTimes(1);
    });

    it("evicts when execution cache TTL expires (time-based)", async () => {
        vi.useFakeTimers();
        const ttl = 1000; // 1 second TTL for test
        const backend = withCaching(defaultBackend, {
            maxExecutionsAge: ttl,
            maxCatalogs: 1,
            maxCatalogOptions: 1,
            maxResultWindows: 1,
            maxGeoCollectionItemsPerResult: 50,
            maxSecuritySettingsOrgs: 1,
            maxSecuritySettingsOrgUrls: 1,
            maxSecuritySettingsOrgUrlsAge: 300_000,
            maxAttributeDisplayFormsPerWorkspace: 2,
            maxAttributesPerWorkspace: 2,
            maxAttributeElementResultsPerWorkspace: 1,
            maxAttributeWorkspaces: 1,
            maxWorkspaceSettings: 1,
            maxAutomationsWorkspaces: 1,
        });

        const first = await doExecution(backend, [ReferenceMd.Won]);

        // Advance time past TTL
        vi.advanceTimersByTime(ttl + 100);

        const second = await doExecution(backend, [ReferenceMd.Won]);

        // After TTL expiration, should get a new execution result (not the same reference)
        expect(second).not.toBe(first);

        vi.useRealTimers();
    });

    it("uses count-based eviction when maxExecutions is set (takes precedence over maxExecutionsAge)", () => {
        const backend = withCaching(defaultBackend, {
            maxExecutions: 1, // This takes precedence over maxExecutionsAge
            maxExecutionsAge: 900_000,
            maxCatalogs: 1,
            maxCatalogOptions: 1,
            maxResultWindows: 1,
            maxGeoCollectionItemsPerResult: 50,
            maxSecuritySettingsOrgs: 1,
            maxSecuritySettingsOrgUrls: 1,
            maxSecuritySettingsOrgUrlsAge: 300_000,
            maxAttributeDisplayFormsPerWorkspace: 2,
            maxAttributesPerWorkspace: 2,
            maxAttributeElementResultsPerWorkspace: 1,
            maxAttributeWorkspaces: 1,
            maxWorkspaceSettings: 1,
            maxAutomationsWorkspaces: 1,
        });

        // With maxExecutions: 1, this should evict the first execution when the second one is cached
        const first = doExecution(backend, [ReferenceMd.Won]);
        void doExecution(backend, [ReferenceMd.Amount]);
        const third = doExecution(backend, [ReferenceMd.Won]);

        // Should NOT be the same cached result (evicted by count-based LRU)
        expect(third).not.toBe(first);
    });

    it("caches readWindow calls", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceMd.Won]);
        const first = await result.readWindow([0, 0], [1, 1]);
        const second = await result.readWindow([0, 0], [1, 1]);

        expect((second as any).decorated).toBe((first as any).decorated);
    });

    it("evicts when readWindow limit hit", async () => {
        const backend = withCachingForTests();

        const result = await doExecution(backend, [ReferenceMd.Won]);
        const first = result.readWindow([0, 0], [1, 1]);
        void result.readWindow([0, 0], [2, 2]);
        const second = result.readWindow([0, 0], [1, 1]);

        expect(second).not.toBe(first);
    });

    it("deletes from cache if error occurs", async () => {
        const backend = withCachingForTests(dummyBackend());

        const result = await doExecution(backend, [ReferenceMd.Won]);

        // backend will throw no data
        const first = result.readWindow([0, 0], [1, 1]);

        // as the promise completes, the catch should clean up anything that is cached
        try {
            await first;
        } catch {
            // ignored
        }

        // and the second attempt will give new promise
        const second = result.readWindow([0, 0], [1, 1]);

        try {
            await second;
        } catch {
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
        void backend.workspace("someOtherWorkspace").catalog().load();
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    it("evicts workspace catalogs options", () => {
        const backend = withCachingForTests();

        // first call caches result when getting catalog with default options
        const first = backend.workspace("test").catalog().load();

        // second call done explicitly with different options => evict previous entry
        void backend.workspace("test").catalog().forTypes(["attribute"]).load();

        // now back to default options, will be new promise
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    it("evicts workspace automations list", () => {
        const backend = withCachingForTests();

        const first = backend.workspace("test").automations().getAutomations();
        const second = backend.workspace("test").automations().getAutomations();

        expect(second).toBe(first);
    });

    it("evicts workspace automations query with same settings", () => {
        const backend = withCachingForTests();

        const first = backend
            .workspace("test")
            .automations()
            .getAutomationsQuery()
            .withPage(2)
            .withSize(5)
            .query();
        const second = backend
            .workspace("test")
            .automations()
            .getAutomationsQuery()
            .withPage(2)
            .withSize(5)
            .query();

        expect(second).toBe(first);
    });

    it("evicts workspace automations query with different settings", () => {
        const backend = withCachingForTests();

        const first = backend
            .workspace("test")
            .automations()
            .getAutomationsQuery()
            .withPage(2)
            .withSize(5)
            .query();
        const second = backend
            .workspace("test")
            .automations()
            .getAutomationsQuery()
            .withPage(2)
            .withSize(3)
            .query();

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

        await doExecution(cachingBackend, [ReferenceMd.Won]);
        cacheControl?.resetExecutions();
        await doExecution(cachingBackend, [ReferenceMd.Won]);

        expect(effectiveExecutions).toEqual(2);
    });

    it("resets catalog cache", () => {
        let cacheControl: CacheControl | undefined;

        const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));
        const first = backend.workspace("test").catalog().load();
        cacheControl?.resetCatalogs();
        const second = backend.workspace("test").catalog().load();

        expect(second).not.toBe(first);
    });

    describe("collection items caching", () => {
        const collectionBaseConfig = {
            collectionId: "geo-collection",
        };

        it("reuses cached geo collection values for overlapping requests", async () => {
            const provider = vi.fn((config: ICollectionItemsConfig) => {
                const features = config.values?.map((value) => createGeoFeature(value)) ?? [];

                return {
                    type: "FeatureCollection",
                    features,
                    bbox: [0, 0, 0, 0],
                };
            });

            const backend = withCachingForTests(createGeoCollectionBackend(provider));
            const result = await doExecution(backend, [ReferenceMd.Won]);
            const dataView = await result.readAll();

            const first = await dataView.readCollectionItems({
                ...collectionBaseConfig,
                values: ["alpha", "beta"],
            });

            expect(first.features.map(geoFeatureId)).toEqual(["alpha", "beta"]);

            const second = await dataView.readCollectionItems({
                ...collectionBaseConfig,
                values: ["beta", "gamma"],
            });

            expect(provider).toHaveBeenCalledTimes(2);
            expect(provider.mock.calls[0][0].values).toEqual(["alpha", "beta"]);
            expect(provider.mock.calls[1][0].values).toEqual(["gamma"]);
            expect(second.features.map(geoFeatureId)).toEqual(["beta", "gamma"]);

            await dataView.readCollectionItems({
                ...collectionBaseConfig,
                values: ["gamma"],
            });

            expect(provider).toHaveBeenCalledTimes(2);
        });

        it("remembers empty geo collection responses per value", async () => {
            const provider = vi.fn((config: ICollectionItemsConfig) => {
                const features =
                    config.values
                        ?.filter((value) => value === "alpha")
                        .map((value) => createGeoFeature(value)) ?? [];

                return {
                    type: "FeatureCollection",
                    features,
                };
            });

            const backend = withCachingForTests(createGeoCollectionBackend(provider));
            const result = await doExecution(backend, [ReferenceMd.Won]);
            const dataView = await result.readAll();

            await dataView.readCollectionItems({
                ...collectionBaseConfig,
                values: ["alpha", "missing"],
            });

            const second = await dataView.readCollectionItems({
                ...collectionBaseConfig,
                values: ["missing"],
            });

            expect(second.features).toHaveLength(0);
            expect(provider).toHaveBeenCalledTimes(1);
        });
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
            void backend.organization("someOtherOrg").securitySettings().isUrlValid(URL, "UI_EVENT");
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
            void backend
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

        it("resets security settings cache", () => {
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

    describe("workspace settings", () => {
        it("caches workspace settings", () => {
            const backend = withCachingForTests();

            const first = backend.workspace("test").settings().getSettings();
            const second = backend.workspace("test").settings().getSettings();

            expect(second).toBe(first);
        });

        it("evicts workspace settings", () => {
            const backend = withCachingForTests();

            const first = backend.workspace("test").settings().getSettings();
            void backend.workspace("other").settings().getSettings();
            const second = backend.workspace("test").settings().getSettings();

            expect(second).not.toBe(first);
        });

        it("caches user workspace settings", () => {
            const backend = withCachingForTests();

            const first = backend.workspace("test").settings().getSettingsForCurrentUser();
            const second = backend.workspace("test").settings().getSettingsForCurrentUser();

            expect(second).toBe(first);
        });

        it("evicts user workspace settings", () => {
            const backend = withCachingForTests();

            const first = backend.workspace("test").settings().getSettingsForCurrentUser();
            void backend.workspace("other").settings().getSettingsForCurrentUser();
            const second = backend.workspace("test").settings().getSettingsForCurrentUser();

            expect(second).not.toBe(first);
        });

        it("resets workspace settings cache", () => {
            let cacheControl: CacheControl | undefined;

            const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));
            const first = backend.workspace("test").settings().getSettingsForCurrentUser();
            cacheControl?.resetWorkspaceSettings();
            const second = backend.workspace("test").settings().getSettingsForCurrentUser();

            expect(second).not.toBe(first);
        });
    });

    describe("insights", () => {
        const REF = idRef("insight-1", "insight");

        it("caches getInsight", async () => {
            const insight = createTestInsight("insight-1");
            const { backend, counter } = createInsightCountingBackend(async () => insight);
            const cachedBackend = withCachingForTests(backend);

            const first = await cachedBackend.workspace("test").insights().getInsight(REF);
            const second = await cachedBackend.workspace("test").insights().getInsight(REF);

            expect(second).toBe(first);
            expect(counter.calls).toEqual(1);
        });

        it("de-duplicates concurrent getInsight calls for the same ref into a single underlying call", async () => {
            const insight = createTestInsight("insight-1");
            // resolve only after all concurrent callers have registered on the in-flight promise
            const { backend, counter } = createInsightCountingBackend(
                () => new Promise<IInsight>((resolve) => setTimeout(() => resolve(insight), 10)),
            );
            const cachedBackend = withCachingForTests(backend);

            const service = cachedBackend.workspace("test").insights();
            const results = await Promise.all([
                service.getInsight(REF),
                service.getInsight(REF),
                service.getInsight(REF),
                service.getInsight(REF),
                service.getInsight(REF),
            ]);

            // a single underlying call serves all concurrent callers
            expect(counter.calls).toEqual(1);
            // and they all observe identical results
            results.forEach((result) => expect(result).toBe(insight));
        });

        it("does not share cache entries for different options", async () => {
            const insight = createTestInsight("insight-1");
            const { backend, counter } = createInsightCountingBackend(async () => insight);
            const cachedBackend = withCachingForTests(backend);

            const service = cachedBackend.workspace("test").insights();
            await service.getInsight(REF);
            await service.getInsight(REF, { loadUserData: true });

            expect(counter.calls).toEqual(2);
        });

        it("evicts the cache entry when getInsight fails", async () => {
            let shouldFail = true;
            const insight = createTestInsight("insight-1");
            const { backend, counter } = createInsightCountingBackend(async () => {
                if (shouldFail) {
                    throw new Error("boom");
                }
                return insight;
            });
            const cachedBackend = withCachingForTests(backend);
            const service = cachedBackend.workspace("test").insights();

            await expect(service.getInsight(REF)).rejects.toThrow("boom");

            // the failed entry is evicted, so a subsequent call hits the backend again
            shouldFail = false;
            const result = await service.getInsight(REF);

            expect(result).toBe(insight);
            expect(counter.calls).toEqual(2);
        });

        it("invalidates the getInsight cache after updateInsight so edits are not served stale", async () => {
            const insight = createTestInsight("insight-1");
            const { backend, counter } = createInsightCountingBackend(async () => insight);
            const cachedBackend = withCachingForTests(backend);
            const service = cachedBackend.workspace("test").insights();

            await service.getInsight(REF);
            await service.updateInsight(insight);
            await service.getInsight(REF);

            // the edit invalidated the cache, so the second read hits the backend again
            expect(counter.calls).toEqual(2);
        });

        it("resets insights cache", async () => {
            let cacheControl: CacheControl | undefined;
            const insight = createTestInsight("insight-1");
            const { backend, counter } = createInsightCountingBackend(async () => insight);
            const cachedBackend = withCachingForTests(backend, (cc) => (cacheControl = cc));
            const service = cachedBackend.workspace("test").insights();

            await service.getInsight(REF);
            cacheControl?.resetInsights();
            await service.getInsight(REF);

            expect(counter.calls).toEqual(2);
        });
    });

    describe("workspace export templates", () => {
        const template: IExportTemplate = { name: "template-1", ref: idRef("template-1") };

        it("caches getExportTemplates", async () => {
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => [
                template,
            ]);
            const cachedBackend = withCachingForTests(backend);

            const first = await cachedBackend.workspace("test").exportTemplates().getExportTemplates();
            const second = await cachedBackend.workspace("test").exportTemplates().getExportTemplates();

            expect(second).toBe(first);
            expect(counter.calls).toEqual(1);
        });

        it("does not share cache entries across workspaces", async () => {
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => [
                template,
            ]);
            const cachedBackend = withCachingForTests(backend);

            await cachedBackend.workspace("ws-1").exportTemplates().getExportTemplates();
            await cachedBackend.workspace("ws-2").exportTemplates().getExportTemplates();

            expect(counter.calls).toEqual(2);
        });

        it("invalidates other workspaces' cached lists on a write (inherited templates may change)", async () => {
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => [
                template,
            ]);
            const cachedBackend = withCachingForTests(backend);

            // ws-child caches its list (which may include templates inherited from ws-parent)
            await cachedBackend.workspace("ws-child").exportTemplates().getExportTemplates();
            // a write in ws-parent must not leave ws-child serving a stale inherited list
            await cachedBackend.workspace("ws-parent").exportTemplates().createExportTemplate(template);
            await cachedBackend.workspace("ws-child").exportTemplates().getExportTemplates();

            // ws-child: 1 initial read + 1 re-read after the parent write invalidated the cache
            expect(counter.calls).toEqual(2);
        });

        it("evicts the cache entry when getExportTemplates fails", async () => {
            let shouldFail = true;
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => {
                if (shouldFail) {
                    throw new Error("boom");
                }
                return [template];
            });
            const cachedBackend = withCachingForTests(backend);
            const service = cachedBackend.workspace("test").exportTemplates();

            await expect(service.getExportTemplates()).rejects.toThrow("boom");

            // the failed entry is evicted, so a subsequent call hits the backend again
            shouldFail = false;
            const result = await service.getExportTemplates();

            expect(result).toEqual([template]);
            expect(counter.calls).toEqual(2);
        });

        it.each([
            [
                "createExportTemplate",
                (s: IWorkspaceExportTemplatesService) => s.createExportTemplate(template),
            ],
            [
                "patchExportTemplate",
                (s: IWorkspaceExportTemplatesService) => s.patchExportTemplate(template.ref, template),
            ],
            [
                "deleteExportTemplate",
                (s: IWorkspaceExportTemplatesService) => s.deleteExportTemplate(template.ref),
            ],
        ])("invalidates the cache after %s so edits are not served stale", async (_label, mutate) => {
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => [
                template,
            ]);
            const cachedBackend = withCachingForTests(backend);
            const service = cachedBackend.workspace("test").exportTemplates();

            await service.getExportTemplates();
            await mutate(service);
            await service.getExportTemplates();

            // the write invalidated the cache, so the second read hits the backend again
            expect(counter.calls).toEqual(2);
        });

        it("resets export templates cache", async () => {
            let cacheControl: CacheControl | undefined;
            const { backend, counter } = createWorkspaceExportTemplatesCountingBackend(async () => [
                template,
            ]);
            const cachedBackend = withCachingForTests(backend, (cc) => (cacheControl = cc));
            const service = cachedBackend.workspace("test").exportTemplates();

            await service.getExportTemplates();
            cacheControl?.resetExportTemplates();
            await service.getExportTemplates();

            expect(counter.calls).toEqual(2);
        });
    });

    describe("attributes", () => {
        describe("getAttributeDisplayForm and getAttributeDisplayForms", () => {
            it("should cache the scalar calls", () => {
                const backend = withCachingForTests();

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );
                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).toBe(first);
            });

            it("should cache the vector calls", async () => {
                const backend = withCachingForTests();

                const first = await doGetAttributeDisplayForms(backend, [
                    ReferenceMd.Account.Name.attribute.displayForm,
                ]);
                const second = await doGetAttributeDisplayForms(backend, [
                    ReferenceMd.Account.Name.attribute.displayForm,
                ]);

                expect(second[0]).toBe(first[0]);
            });

            it("should use cached results from scalar version in the vector version", async () => {
                const backend = withCachingForTests();

                const scalar = await doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );
                const vector = await doGetAttributeDisplayForms(backend, [
                    ReferenceMd.Account.Name.attribute.displayForm,
                    ReferenceMd.Activity.Default.attribute.displayForm,
                ]);

                expect(vector[0]).toBe(scalar);
            });

            it("should use cached results from vector version in the scalar version", async () => {
                const backend = withCachingForTests();

                const vector = await doGetAttributeDisplayForms(backend, [
                    ReferenceMd.Account.Name.attribute.displayForm,
                ]);
                const scalar = await doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(scalar).toBe(vector[0]);
            });

            it("should evict cache items when the limit is hit", () => {
                const backend = withCachingForTests();

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                // other 3 calls with different display form to replace the first one
                // the LRU we use starts evicting at maxSize * 2
                void doGetAttributeDisplayForm(backend, ReferenceMd.Activity.Default.attribute.displayForm);
                void doGetAttributeDisplayForm(backend, ReferenceMd.Activity.Subject.attribute.displayForm);
                void doGetAttributeDisplayForm(backend, ReferenceMd.Account.Default.attribute.displayForm);

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAttributes", () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAttributes();

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAll", () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAll();

                const second = doGetAttributeDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });
        });

        describe("getAttributeByDisplayForm", () => {
            it("should cache the calls", async () => {
                const backend = withCachingForTests();

                const first = await doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );
                const second = await doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).toBe(first);
            });

            it("should evict cache items when the limit is hit", () => {
                const backend = withCachingForTests();

                const first = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                // other 3 calls with different display form to replace the first one
                // the LRU we use starts evicting at maxSize * 2
                void doGetAttributeByDisplayForm(backend, ReferenceMd.Activity.Default.attribute.displayForm);
                void doGetAttributeByDisplayForm(backend, ReferenceMd.Activity.Subject.attribute.displayForm);
                void doGetAttributeByDisplayForm(backend, ReferenceMd.Account.Default.attribute.displayForm);

                const second = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAttributes", () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAttributes();

                const second = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attributes cache with resetAll", () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAll();

                const second = doGetAttributeByDisplayForm(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });
        });

        describe("elements", () => {
            it("should cache the calls", async () => {
                const backend = withCachingForTests();

                const first = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );
                const second = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).toBe(first);
            });

            it("should evict cache items when the limit is hit", async () => {
                const backend = withCachingForTests();

                const first = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                void doGetAttributeElements(backend, ReferenceMd.Activity.Default.attribute.displayForm);

                const second = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attribute elements cache with resetAttributes", async () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAttributes();

                const second = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });

            it("should reset attribute elements cache with resetAll", async () => {
                let cacheControl: CacheControl | undefined;

                const backend = withCachingForTests(defaultBackend, (cc) => (cacheControl = cc));

                const first = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                cacheControl?.resetAll();

                const second = await doGetAttributeElements(
                    backend,
                    ReferenceMd.Account.Name.attribute.displayForm,
                );

                expect(second).not.toBe(first);
            });
        });
    });

    describe("facts", () => {
        describe("getFact", () => {
            it("collapses concurrent same-ref calls into a single underlying call", async () => {
                const underlying = vi.fn(async () => ({ ...SAMPLE_FACT }) as IFactMetadataObject);
                const backend = withCachingForTests(createFactsBackend(underlying));

                const [a, b, c] = await Promise.all([
                    backend.workspace("test").facts().getFact(FACT_REF),
                    backend.workspace("test").facts().getFact(FACT_REF),
                    backend.workspace("test").facts().getFact(FACT_REF),
                ]);

                // de-duplication: only one underlying request despite three concurrent callers
                expect(underlying).toHaveBeenCalledTimes(1);
                // all callers share the exact same result
                expect(a).toBe(b);
                expect(b).toBe(c);
            });

            it("evicts the cached entry when the underlying call fails", async () => {
                const underlying = vi
                    .fn<IWorkspaceFactsService["getFact"]>()
                    .mockRejectedValueOnce(new Error("boom"))
                    .mockResolvedValueOnce({ ...SAMPLE_FACT } as IFactMetadataObject);
                const backend = withCachingForTests(createFactsBackend(underlying));

                await expect(backend.workspace("test").facts().getFact(FACT_REF)).rejects.toThrow("boom");

                // failed promise must not be cached - a retry hits the backend again and succeeds
                await expect(backend.workspace("test").facts().getFact(FACT_REF)).resolves.toMatchObject({
                    id: "fact.foo",
                });

                expect(underlying).toHaveBeenCalledTimes(2);
            });

            it("does not collapse calls with different include options", async () => {
                const underlying = vi.fn(async () => ({ ...SAMPLE_FACT }) as IFactMetadataObject);
                const backend = withCachingForTests(createFactsBackend(underlying));

                await Promise.all([
                    backend.workspace("test").facts().getFact(FACT_REF),
                    backend
                        .workspace("test")
                        .facts()
                        .getFact(FACT_REF, { include: ["dataset"] }),
                ]);

                expect(underlying).toHaveBeenCalledTimes(2);
            });

            it("resets facts cache with resetFacts", async () => {
                let cacheControl: CacheControl | undefined;
                const underlying = vi.fn(async () => ({ ...SAMPLE_FACT }) as IFactMetadataObject);
                const backend = withCachingForTests(
                    createFactsBackend(underlying),
                    (cc) => (cacheControl = cc),
                );

                await backend.workspace("test").facts().getFact(FACT_REF);
                cacheControl?.resetFacts();
                await backend.workspace("test").facts().getFact(FACT_REF);

                expect(underlying).toHaveBeenCalledTimes(2);
            });

            it("resets facts cache with resetAll", async () => {
                let cacheControl: CacheControl | undefined;
                const underlying = vi.fn(async () => ({ ...SAMPLE_FACT }) as IFactMetadataObject);
                const backend = withCachingForTests(
                    createFactsBackend(underlying),
                    (cc) => (cacheControl = cc),
                );

                await backend.workspace("test").facts().getFact(FACT_REF);
                cacheControl?.resetAll();
                await backend.workspace("test").facts().getFact(FACT_REF);

                expect(underlying).toHaveBeenCalledTimes(2);
            });
        });

        describe("getFactDatasetMeta", () => {
            it("collapses concurrent same-ref calls into a single underlying call", async () => {
                const underlying = vi.fn(async () => ({ ...SAMPLE_FACT_DATASET }) as IMetadataObject);
                const backend = withCachingForTests(createFactsBackend(vi.fn(), underlying));

                const [a, b, c] = await Promise.all([
                    backend.workspace("test").facts().getFactDatasetMeta(FACT_REF),
                    backend.workspace("test").facts().getFactDatasetMeta(FACT_REF),
                    backend.workspace("test").facts().getFactDatasetMeta(FACT_REF),
                ]);

                expect(underlying).toHaveBeenCalledTimes(1);
                expect(a).toBe(b);
                expect(b).toBe(c);
            });

            it("evicts the cached entry when the underlying call fails", async () => {
                const underlying = vi
                    .fn<IWorkspaceFactsService["getFactDatasetMeta"]>()
                    .mockRejectedValueOnce(new Error("boom"))
                    .mockResolvedValueOnce({ ...SAMPLE_FACT_DATASET } as IMetadataObject);
                const backend = withCachingForTests(createFactsBackend(vi.fn(), underlying));

                await expect(backend.workspace("test").facts().getFactDatasetMeta(FACT_REF)).rejects.toThrow(
                    "boom",
                );

                await expect(
                    backend.workspace("test").facts().getFactDatasetMeta(FACT_REF),
                ).resolves.toMatchObject({ id: "dataset.foo" });

                expect(underlying).toHaveBeenCalledTimes(2);
            });
        });
    });
});

class GeoPreparedExecution extends DecoratedPreparedExecution {
    constructor(
        decorated: IPreparedExecution,
        private readonly provider: CollectionItemsProvider,
    ) {
        super(decorated);
    }

    public override async execute(): Promise<IExecutionResult> {
        const result = await this.decorated.execute();
        return new GeoExecutionResult(result, this.provider);
    }

    protected createNew(decorated: IPreparedExecution): IPreparedExecution {
        return new GeoPreparedExecution(decorated, this.provider);
    }
}

class GeoExecutionResult extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        private readonly provider: CollectionItemsProvider,
    ) {
        super(decorated, (execution) => new GeoPreparedExecution(execution, provider));
    }

    public override async readAll(): Promise<IDataView> {
        const dataView = await super.readAll();
        return new GeoDataView(dataView, this.provider);
    }

    public override async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const dataView = await super.readWindow(offset, size);
        return new GeoDataView(dataView, this.provider);
    }

    protected createNew(decorated: IExecutionResult): IExecutionResult {
        return new GeoExecutionResult(decorated, this.provider);
    }
}

class GeoDataView extends DecoratedDataView {
    constructor(
        decorated: IDataView,
        private readonly provider: CollectionItemsProvider,
    ) {
        super(decorated);
    }

    public override readCollectionItems(config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
        return Promise.resolve(this.provider(config));
    }
}
