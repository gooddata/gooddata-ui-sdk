// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { defaultTigerClient } from "@gooddata/api-client-tiger";
import {
    type IAnalyticalBackend,
    type IElementsQueryOptions,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type IDataSetMetadataObject, type ObjRef, idRef } from "@gooddata/sdk-model";

import { MetadataService } from "./metadataService.js";

const WORKSPACE_ID = "test-workspace";

const dataset = {
    type: "dataSet",
    id: "ds1",
    title: "Dataset 1",
    description: "",
    ref: idRef("ds1", "dataSet"),
} as IDataSetMetadataObject;

/**
 * A hand-rolled backend covering exactly the surface the metadata service touches. Every entry
 * point is a spy so the tests can assert the service runs on THIS instance and nothing else.
 */
function createBackendStub(elementsFactory: unknown = {}) {
    const catalog = {
        attributes: () => [],
        facts: () => [],
        measures: () => [],
        dateDatasets: () => [],
        computedAttributes: () => [],
    };
    const catalogLoad = vi.fn().mockResolvedValue(catalog);
    const catalogDefaultLoad = vi.fn().mockResolvedValue(catalog);
    const catalogForTypes = vi.fn().mockReturnValue({ load: catalogLoad });
    const parametersQuery = vi.fn().mockResolvedValue({ all: () => [] });
    let dataSetType: string | undefined;
    const datasetsQuery = vi.fn(() => {
        const items = dataSetType === "NORMAL" ? [dataset] : [];
        return Promise.resolve({ all: () => Promise.resolve(items) });
    });
    const datasetsQueryBuilder = {
        withOrigin: vi.fn(),
        withFilter: vi.fn(),
        withSize: vi.fn(),
        query: datasetsQuery,
    };
    datasetsQueryBuilder.withOrigin.mockReturnValue(datasetsQueryBuilder);
    datasetsQueryBuilder.withFilter.mockImplementation((filter: { dataSetType?: string }) => {
        dataSetType = filter.dataSetType;
        return datasetsQueryBuilder;
    });
    datasetsQueryBuilder.withSize.mockReturnValue(datasetsQueryBuilder);
    const workspace = vi.fn().mockReturnValue({
        catalog: () => ({ forTypes: catalogForTypes, load: catalogDefaultLoad }),
        parameters: () => ({
            getParametersQuery: () => ({ withSize: () => ({ query: parametersQuery }) }),
        }),
        attributes: () => ({ elements: () => elementsFactory }),
        datasets: () => ({ getDatasetsQuery: () => datasetsQueryBuilder }),
    });
    // Deliberately partial: the service must not touch anything beyond the stubbed surface.
    const backend = { workspace } as unknown as IAnalyticalBackend;
    return {
        backend,
        workspace,
        catalogLoad,
        catalogDefaultLoad,
        catalogForTypes,
        parametersQuery,
        datasetsQuery,
        datasetsQueryBuilder,
    };
}

describe("MetadataService.withBackend", () => {
    it("loads the whole catalog through the injected backend", async () => {
        const { backend, workspace, catalogLoad, catalogForTypes, parametersQuery, datasetsQueryBuilder } =
            createBackendStub();

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        const ldmObjects = await service.getLdmObjects();

        expect(datasetsQueryBuilder.withOrigin).toHaveBeenCalledWith("ALL");
        expect(datasetsQueryBuilder.withFilter).toHaveBeenCalledWith({ dataSetType: "NORMAL" });
        expect(datasetsQueryBuilder.withFilter).toHaveBeenCalledWith({ dataSetType: "AUXILIARY" });
        expect(datasetsQueryBuilder.query).toHaveBeenCalledTimes(2);
        expect(workspace).toHaveBeenCalledWith(WORKSPACE_ID);
        expect(catalogForTypes).toHaveBeenCalledWith([
            "attribute",
            "measure",
            "fact",
            "dateDataset",
            "attributeHierarchy",
            "computedAttribute",
        ]);
        expect(catalogLoad).toHaveBeenCalledTimes(1);
        expect(parametersQuery).toHaveBeenCalledTimes(1);

        const datasets = ldmObjects.get("dataset");
        expect(datasets).toHaveLength(1);
        expect(datasets[0]).toMatchObject({ id: "ds1", title: "Dataset 1", tigerType: "dataset" });
    });

    it("requests computed attributes when the setting is enabled", async () => {
        const { backend, catalogForTypes, catalogLoad } = createBackendStub();

        const service = MetadataService.withBackend(WORKSPACE_ID, backend, {
            enableComputedAttributes: true,
        });
        await service.getLdmObjects();

        expect(catalogForTypes).toHaveBeenCalledWith(expect.arrayContaining(["computedAttribute"]));
        expect(catalogLoad).toHaveBeenCalledTimes(1);
    });

    it("does not request computed attributes when the setting is disabled", async () => {
        const { backend, catalogForTypes, catalogLoad, catalogDefaultLoad } = createBackendStub();

        const service = MetadataService.withBackend(WORKSPACE_ID, backend, {
            enableComputedAttributes: false,
        });
        const ldmObjects = await service.getLdmObjects();

        expect(catalogForTypes).not.toHaveBeenCalled();
        expect(catalogLoad).not.toHaveBeenCalled();
        expect(catalogDefaultLoad).toHaveBeenCalledTimes(1);
        expect(ldmObjects.get("dataset")).toHaveLength(1);
    });

    it("falls back to the default catalog when the computed-attributes request is refused", async () => {
        const { backend, catalogLoad, catalogDefaultLoad } = createBackendStub();
        catalogLoad.mockRejectedValueOnce(new Error("Feature 'enableComputedAttributes' is not enabled"));

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        const ldmObjects = await service.getLdmObjects();

        expect(catalogDefaultLoad).toHaveBeenCalledTimes(1);
        expect(ldmObjects.get("dataset")).toHaveLength(1);
    });

    it("keeps the catalog when the datasets query fails", async () => {
        const { backend, datasetsQuery } = createBackendStub();
        datasetsQuery.mockRejectedValueOnce(new Error("Not found"));

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        const ldmObjects = await service.getLdmObjects();

        expect(ldmObjects.get("dataset")).toHaveLength(0);
        expect(ldmObjects.get("metric")).toEqual([]);
    });

    it("keeps the catalog when the backend has no datasets service", async () => {
        const { backend, workspace } = createBackendStub();
        const workspaceObject = workspace(WORKSPACE_ID);
        workspace.mockReturnValue({
            ...workspaceObject,
            datasets: () => {
                throw new Error("NotSupported");
            },
        });

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        const ldmObjects = await service.getLdmObjects();

        expect(ldmObjects.get("dataset")).toHaveLength(0);
    });

    it("lists the normal and the auxiliary datasets", async () => {
        const { backend, datasetsQuery } = createBackendStub();
        const auxiliary = { ...dataset, id: "aux", title: "Auxiliary" };
        datasetsQuery
            .mockResolvedValueOnce({ all: () => Promise.resolve([dataset]) })
            .mockResolvedValueOnce({ all: () => Promise.resolve([auxiliary]) });

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        const ldmObjects = await service.getLdmObjects();

        expect(ldmObjects.get("dataset").map((item) => item.id)).toEqual(["ds1", "aux"]);
    });

    it("reloads the datasets on updateModel", async () => {
        const { backend, datasetsQuery } = createBackendStub();

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        await service.getLdmObjects();

        service.updateModel();
        await service.getLdmObjects();

        expect(datasetsQuery).toHaveBeenCalledTimes(4);
    });

    it("performs no request on the global defaultTigerClient axios", async () => {
        const axiosSpies = (["request", "get", "post", "put", "delete"] as const).map((method) =>
            vi.spyOn(defaultTigerClient.axios, method),
        );
        const { backend } = createBackendStub();

        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        await service.getLdmObjects();

        for (const spy of axiosSpies) {
            expect(spy).not.toHaveBeenCalled();
        }
    });
});

interface IElementsPage {
    items: IAttributeElement[];
    offset?: number;
    totalCount?: number;
}

/**
 * Elements query factory stub answering per label identifier with a page of elements or an error.
 */
function createElementsFactoryStub(responses: Record<string, IElementsPage | Error>) {
    const queries: {
        identifier: string;
        options?: IElementsQueryOptions;
        limit?: number;
        offset?: number;
    }[] = [];
    const forDisplayForm = vi.fn((ref: ObjRef) => {
        const identifier = (ref as { identifier: string }).identifier;
        const query: (typeof queries)[number] = { identifier };
        queries.push(query);
        const builder = {
            withOptions: (options: IElementsQueryOptions) => {
                query.options = options;
                return builder;
            },
            withLimit: (limit: number) => {
                query.limit = limit;
                return builder;
            },
            withOffset: (offset: number) => {
                query.offset = offset;
                return builder;
            },
            query: () => {
                const response = responses[identifier];
                if (response instanceof Error) {
                    return Promise.reject(response);
                }
                const limit = query.limit ?? 100;
                return Promise.resolve({
                    items: response.items,
                    offset: response.offset ?? 0,
                    limit,
                    totalCount: response.totalCount ?? response.items.length,
                });
            },
        };
        return builder;
    });
    return { factory: { forDisplayForm }, queries };
}

describe("MetadataService.getLabelElementsFunction", () => {
    const label = (identifier: string) => ({ id: identifier, ref: idRef(identifier, "displayForm") });
    const element = (title: string): IAttributeElement => ({ title, uri: title });

    async function getLabelElementsFunc(responses: Record<string, IElementsPage | Error>) {
        const { factory, queries } = createElementsFactoryStub(responses);
        const { backend } = createBackendStub(factory);
        const service = MetadataService.withBackend(WORKSPACE_ID, backend);
        return { labelElementsFunc: await service.getLabelElementsFunction(), queries };
    }

    it("queries the elements of the label with the given options, limit and offset", async () => {
        const { labelElementsFunc, queries } = await getLabelElementsFunc({
            l1: { items: [element("a"), element("b")] },
        });
        const options = { elements: { values: ["a", "b"] } };

        const result = await labelElementsFunc([label("l1")], [], options, 2, 5);

        expect(queries).toEqual([{ identifier: "l1", options, limit: 2, offset: 5 }]);
        expect(result).toEqual({
            list: { elements: [element("a"), element("b")], isIncomplete: false },
            rejected: [],
            rejectionReasons: new Map(),
        });
    });

    it("merges the elements of multiple labels and filters out the excluded ones", async () => {
        const { labelElementsFunc } = await getLabelElementsFunc({
            l1: { items: [element("a"), element("b")] },
            l2: { items: [element("c"), { title: null, uri: "null" }] },
        });

        const result = await labelElementsFunc([label("l1"), label("l2")], ["b"], {});

        expect(result.list.elements).toEqual([element("a"), element("c"), { title: null, uri: "null" }]);
    });

    it("reports the list as incomplete when any label has more elements than returned", async () => {
        const { labelElementsFunc } = await getLabelElementsFunc({
            l1: { items: [element("a")] },
            l2: { items: [element("b")], totalCount: 10 },
        });

        const result = await labelElementsFunc([label("l1"), label("l2")], [], {}, 1);

        expect(result.list.isIncomplete).toBe(true);
    });

    it("keeps the elements of the other labels and the reason when a label query is rejected", async () => {
        const error = new UnexpectedResponseError("Bad Request", 400, { detail: "Invalid value" });
        const { labelElementsFunc } = await getLabelElementsFunc({
            l1: { items: [element("a")] },
            l2: error,
        });
        const l1 = label("l1");
        const l2 = label("l2");

        const result = await labelElementsFunc([l1, l2], [], {});

        expect(result.list).toEqual({ elements: [element("a")], isIncomplete: false });
        expect(result.rejected).toEqual([l2]);
        expect(result.rejectionReasons?.get(l2)).toBe(error);
        expect(result.rejectionReasons?.has(l1)).toBe(false);
    });
});
