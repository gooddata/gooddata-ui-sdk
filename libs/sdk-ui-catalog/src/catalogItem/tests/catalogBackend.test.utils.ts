// (C) 2026 GoodData Corporation

import { type Mock, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { ObjectTypes } from "../../objectType/constants.js";
import type { ObjectType } from "../../objectType/types.js";

/**
 * A backend stub for the catalog feed and its semantic search companion.
 *
 * The feed hooks reach the backend through `catalogItem/query.js` and `useSemanticSearch`, both of
 * which only chain `with*` calls onto a query builder and then `query()` it. Faking the builders
 * rather than mocking those modules keeps the whole production chain — query construction, endpoint
 * selection, pagination, entity conversion — under test, and keeps the suite runnable without
 * per-file isolation: a `vi.mock` of a module that other test files load unmocked cannot be applied
 * to a module graph they already evaluated.
 */

/** A page as {@link useEndpointPaginator} consumes it; `next()` yields the following page. */
export interface IStubPage {
    items: unknown[];
    offset: number;
    limit: number;
    totalCount: number;
    next: Mock;
}

interface IStubPageSpec {
    items: unknown[];
    offset: number;
    totalCount: number;
}

/** Builds a linked chain of pages where each `page.next()` returns the next page in the chain. */
export function chainPages(specs: IStubPageSpec[]): IStubPage {
    const pageAt = (index: number): IStubPage => {
        const spec = specs[index];
        if (!spec) {
            throw new Error("next() called beyond the configured page chain");
        }
        return {
            items: spec.items,
            offset: spec.offset,
            limit: spec.items.length,
            totalCount: spec.totalCount,
            next: vi.fn(async () => pageAt(index + 1)),
        };
    };

    return pageAt(0);
}

/** A single empty page — what an endpoint serves unless a test points it elsewhere. */
export function emptyPage(): IStubPage {
    return chainPages([{ items: [], offset: 0, totalCount: 0 }]);
}

/**
 * Backend-shaped entities, i.e. ones the real `convertEntityToCatalogItem` accepts. Each carries
 * only the fields its converter reads, plus whatever its `sdk-model` type guard requires.
 */
const ENTITY_FACTORIES: Record<ObjectType, (id: string) => unknown> = {
    [ObjectTypes.DASHBOARD]: (id) => ({
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        title: id,
        description: "",
        tags: [],
        // `isListedDashboard` keys off `availability`.
        availability: "full",
    }),
    [ObjectTypes.VISUALIZATION]: (id) => ({
        // `isInsight` keys off the `insight` wrapper.
        insight: {
            identifier: id,
            title: id,
            summary: "",
            visualizationUrl: "local:bar",
            tags: [],
        },
    }),
    [ObjectTypes.METRIC]: (id) => metadataEntity(id, "measure"),
    [ObjectTypes.PARAMETER]: (id) => ({
        ...metadataEntity(id, "parameter"),
        definition: { type: "NUMBER", defaultValue: 0 },
    }),
    [ObjectTypes.ATTRIBUTE]: (id) => metadataEntity(id, "attribute"),
    [ObjectTypes.FACT]: (id) => metadataEntity(id, "fact"),
    [ObjectTypes.DATASET]: (id) => metadataEntity(id, "dataSet"),
};

function metadataEntity(id: string, type: ObjectType) {
    // `isMetadataObject` requires both `type` and `ref`.
    return { type, ref: idRef(id, type), id, title: id, description: "", tags: [] };
}

/** A backend entity of the given type whose converted catalog item is identified by `id`. */
export function catalogEntity(type: ObjectType, id: string): unknown {
    return ENTITY_FACTORIES[type](id);
}

/** The `with*` calls `catalogItem/query.js` chains onto a query builder before `query()`. */
const CATALOG_BUILDER_METHODS = [
    "withPage",
    "withSize",
    "withInclude",
    "withMetaInclude",
    "withSorting",
    "withOrigin",
    "withFilter",
    "withMethod",
] as const;

/** The `with*` calls `useSemanticSearch` chains onto the genAI semantic search builder. */
const SEMANTIC_BUILDER_METHODS = [
    "withQuestion",
    "withDeepSearch",
    "withObjectTypes",
    "withLimit",
    "withAllowedRelationshipTypes",
    "withIncludeTags",
    "withExcludeTags",
] as const;

export type QueryBuilderStub<TMethod extends string> = Record<TMethod, Mock> & { query: Mock };

type CatalogBuilderStub = QueryBuilderStub<(typeof CATALOG_BUILDER_METHODS)[number]>;
type SemanticBuilderStub = QueryBuilderStub<(typeof SEMANTIC_BUILDER_METHODS)[number]>;

function createBuilderStub<TMethod extends string>(
    methods: readonly TMethod[],
    run: () => Promise<unknown>,
): QueryBuilderStub<TMethod> {
    const builder: Record<string, unknown> = { query: vi.fn(() => run()) };
    for (const method of methods) {
        builder[method] = vi.fn(() => builder);
    }

    return builder as QueryBuilderStub<TMethod>;
}

/** Which workspace service and query factory each object type's endpoint goes through. */
const QUERY_SERVICES = {
    [ObjectTypes.DASHBOARD]: ["dashboards", "getDashboardsQuery"],
    [ObjectTypes.VISUALIZATION]: ["insights", "getInsightsQuery"],
    [ObjectTypes.METRIC]: ["measures", "getMeasuresQuery"],
    [ObjectTypes.PARAMETER]: ["parameters", "getParametersQuery"],
    [ObjectTypes.ATTRIBUTE]: ["attributes", "getAttributesQuery"],
    [ObjectTypes.FACT]: ["facts", "getFactsQuery"],
    [ObjectTypes.DATASET]: ["datasets", "getDatasetsQuery"],
} as const satisfies Record<ObjectType, readonly [string, string]>;

/** The shape `useSemanticSearch` reads off its query result. */
interface ISemanticSearchResponseStub {
    results: Array<{ id: string }>;
    relationships: unknown[];
}

export interface ICatalogBackendStub {
    backend: IAnalyticalBackend;
    /** `getXQuery()` per object type — its call count says which endpoints were reached. */
    queries: Record<ObjectType, Mock>;
    /** The builder `getXQuery()` returns; `withFilter` records the effective query options. */
    builders: Record<ObjectType, CatalogBuilderStub>;
    /** The genAI search builder; `withQuestion` records the search term the hook sent. */
    semanticSearchQuery: Mock;
    semanticSearchBuilder: SemanticBuilderStub;
    /** Points a type's endpoint at a page chain (or a rejection); default is one empty page. */
    setPages(type: ObjectType, source: () => Promise<IStubPage>): void;
    /** Points semantic search at a response (or a rejection); default is no results. */
    setSemanticSearchResponse(source: () => Promise<ISemanticSearchResponseStub>): void;
}

export function createCatalogBackendStub(): ICatalogBackendStub {
    const pageSources: Partial<Record<ObjectType, () => Promise<IStubPage>>> = {};
    const queries = {} as Record<ObjectType, Mock>;
    const builders = {} as Record<ObjectType, CatalogBuilderStub>;
    const services: Record<string, Record<string, Mock>> = {};

    for (const [type, [service, factoryName]] of Object.entries(QUERY_SERVICES) as Array<
        [ObjectType, readonly [string, string]]
    >) {
        const builder = createBuilderStub(CATALOG_BUILDER_METHODS, () =>
            (pageSources[type] ?? (() => Promise.resolve(emptyPage())))(),
        );
        const factory = vi.fn(() => builder);

        builders[type] = builder;
        queries[type] = factory;
        services[service] = { ...services[service], [factoryName]: factory };
    }

    let semanticSearchResponse: () => Promise<ISemanticSearchResponseStub> = () =>
        Promise.resolve({ results: [], relationships: [] });
    const semanticSearchBuilder = createBuilderStub(SEMANTIC_BUILDER_METHODS, () => semanticSearchResponse());
    const semanticSearchQuery = vi.fn(() => semanticSearchBuilder);

    const workspace = {
        genAI: () => ({ getSemanticSearchQuery: semanticSearchQuery }),
    } as Record<string, () => unknown>;
    for (const [service, api] of Object.entries(services)) {
        workspace[service] = () => api;
    }

    return {
        backend: { workspace: () => workspace } as unknown as IAnalyticalBackend,
        queries,
        builders,
        semanticSearchQuery,
        semanticSearchBuilder,
        setPages(type, source) {
            pageSources[type] = source;
        },
        setSemanticSearchResponse(source) {
            semanticSearchResponse = source;
        },
    };
}
