// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type DependentEntitiesResponse,
    type JsonApiParameterOutWithLinks,
    type JsonApiVisualizationObjectOutDocument,
} from "@gooddata/api-client-tiger";
import * as actions from "@gooddata/api-client-tiger/endpoints/actions";
import * as entities from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IMetadataObject, type ObjectType, idRef, insightId } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceInsights } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", async () => {
    const actual = await vi.importActual<typeof entities>(
        "@gooddata/api-client-tiger/endpoints/entitiesObjects",
    );
    return {
        ...actual,
        EntitiesApi_GetEntityVisualizationObjects: vi.fn(),
    };
});

vi.mock("@gooddata/api-client-tiger/endpoints/actions", async () => {
    const actual = await vi.importActual<typeof actions>("@gooddata/api-client-tiger/endpoints/actions");
    return {
        ...actual,
        ActionsApi_GetDependentEntitiesGraphFromEntryPoints: vi.fn(),
    };
});

type TigerNode = { id: string; type: string; title?: string };
type TigerEdge = [TigerNode, TigerNode];

function graphResponse(nodes: TigerNode[], edges: TigerEdge[]): AxiosResponse<DependentEntitiesResponse> {
    return {
        data: { graph: { nodes, edges } },
    } as unknown as AxiosResponse<DependentEntitiesResponse>;
}

function metadataObject(type: ObjectType, id: string, title: string): IMetadataObject {
    return {
        id,
        ref: idRef(id, type),
        type,
        title,
        uri: "",
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
}

const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));

// The service is imported dynamically from a fresh module registry so that it picks up the mock
// above even when another (non-isolated) test file already imported it without the mock.
let TigerWorkspaceInsightsCtor: typeof TigerWorkspaceInsights;

describe("TigerWorkspaceInsights.getInsightReferencingObjects", () => {
    beforeAll(async () => {
        vi.resetModules();
        ({ TigerWorkspaceInsights: TigerWorkspaceInsightsCtor } = await import("./index.js"));
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("splits the dependents graph into dashboards and documents with templates", async () => {
        const insightNode = { id: "insight", type: "visualizationObject", title: "Insight" };
        const dashboardNode = { id: "board", type: "analyticalDashboard", title: "Board" };
        const documentNode = { id: "pack", type: "document", title: "Q3 board pack" };
        const untitledDocumentNode = { id: "untitled-doc", type: "document" };
        const documentTemplateNode = { id: "monthly", type: "documentTemplate", title: "Monthly review" };
        const pageTemplateNode = { id: "kpi-page", type: "pageTemplate", title: "KPI page" };
        const metricNode = { id: "revenue", type: "metric", title: "Revenue" };
        vi.mocked(actions.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).mockResolvedValue(
            graphResponse(
                [
                    insightNode,
                    dashboardNode,
                    documentNode,
                    untitledDocumentNode,
                    documentTemplateNode,
                    pageTemplateNode,
                    metricNode,
                ],
                [
                    [insightNode, dashboardNode],
                    [insightNode, documentNode],
                    [insightNode, untitledDocumentNode],
                    [insightNode, documentTemplateNode],
                    [insightNode, pageTemplateNode],
                ],
            ),
        );
        const service = new TigerWorkspaceInsightsCtor(mockAuthCall as TigerAuthenticatedCallGuard, "ws-1");

        const result = await service.getInsightReferencingObjects(idRef("insight", "insight"));

        expect(result).toEqual({
            analyticalDashboards: [metadataObject("analyticalDashboard", "board", "Board")],
            documents: [
                metadataObject("document", "pack", "Q3 board pack"),
                metadataObject("document", "untitled-doc", "untitled-doc"),
                metadataObject("documentTemplate", "monthly", "Monthly review"),
                metadataObject("pageTemplate", "kpi-page", "KPI page"),
            ],
        });
        expect(actions.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                workspaceId: "ws-1",
                dependentEntitiesRequest: { identifiers: [{ id: "insight", type: "visualizationObject" }] },
            },
        );
    });
});

describe("TigerWorkspaceInsights.getInsight", () => {
    beforeAll(async () => {
        vi.resetModules();
        ({ TigerWorkspaceInsights: TigerWorkspaceInsightsCtor } = await import("./index.js"));
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const parameter: JsonApiParameterOutWithLinks = {
        id: "discount",
        type: "parameter",
        attributes: { title: "Discount", definition: { type: "NUMBER", defaultValue: 5 } },
        links: { self: "/parameters/discount" },
    };
    const document: JsonApiVisualizationObjectOutDocument = {
        data: {
            id: "insight",
            type: "visualizationObject",
            attributes: {
                title: "Insight",
                description: "",
                content: {
                    version: "2",
                    visualizationUrl: "local:table",
                    buckets: [],
                    filters: [],
                    sorts: [],
                    properties: {},
                },
            },
        },
        included: [parameter, { id: "revenue", type: "metric", attributes: { content: { maql: "" } } }],
    };

    it("loads the referenced parameters in the request for the insight", async () => {
        vi.mocked(entities.EntitiesApi_GetEntityVisualizationObjects).mockResolvedValue({
            data: document,
        } as AxiosResponse<JsonApiVisualizationObjectOutDocument>);
        const service = new TigerWorkspaceInsightsCtor(mockAuthCall as TigerAuthenticatedCallGuard, "ws-1");

        const insight = await service.getInsight(idRef("insight", "insight"), { loadParameters: true });

        expect(insightId(insight)).toBe("insight");
        expect(insight.insight.referencedParameters).toEqual([
            expect.objectContaining({
                ref: idRef("discount", "parameter"),
                definition: { type: "NUMBER", defaultValue: 5 },
            }),
        ]);
        expect(entities.EntitiesApi_GetEntityVisualizationObjects).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { objectId: "insight", workspaceId: "ws-1", include: ["parameters"] },
        );
    });

    it("does not load the referenced parameters when the caller does not ask for them", async () => {
        vi.mocked(entities.EntitiesApi_GetEntityVisualizationObjects).mockResolvedValue({
            data: document,
        } as AxiosResponse<JsonApiVisualizationObjectOutDocument>);
        const service = new TigerWorkspaceInsightsCtor(mockAuthCall as TigerAuthenticatedCallGuard, "ws-1");

        const insight = await service.getInsight(idRef("insight", "insight"));

        expect(insight.insight.referencedParameters).toBeUndefined();
        expect(entities.EntitiesApi_GetEntityVisualizationObjects).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { objectId: "insight", workspaceId: "ws-1" },
        );
    });

    it("loads the referenced parameters with the catalog items only when the caller asks for them", async () => {
        vi.mocked(entities.EntitiesApi_GetEntityVisualizationObjects).mockResolvedValue({
            data: document,
        } as AxiosResponse<JsonApiVisualizationObjectOutDocument>);
        const service = new TigerWorkspaceInsightsCtor(mockAuthCall as TigerAuthenticatedCallGuard, "ws-1");
        const catalogReferences = ["metrics", "attributes", "facts", "labels"];

        const withParameters = await service.getInsightWithCatalogItems(idRef("insight", "insight"), {
            loadParameters: true,
        });
        const withoutParameters = await service.getInsightWithCatalogItems(idRef("insight", "insight"));

        expect(withParameters.insight.insight.referencedParameters).toEqual([
            expect.objectContaining({ ref: idRef("discount", "parameter") }),
        ]);
        expect(withParameters.catalogItems).toEqual(withoutParameters.catalogItems);
        expect(withoutParameters.catalogItems).toEqual([
            expect.objectContaining({ measure: expect.objectContaining({ id: "revenue" }) }),
        ]);
        expect(withoutParameters.insight.insight.referencedParameters).toBeUndefined();
        expect(entities.EntitiesApi_GetEntityVisualizationObjects).toHaveBeenNthCalledWith(
            1,
            expect.anything(),
            expect.anything(),
            { objectId: "insight", workspaceId: "ws-1", include: [...catalogReferences, "parameters"] },
        );
        expect(entities.EntitiesApi_GetEntityVisualizationObjects).toHaveBeenNthCalledWith(
            2,
            expect.anything(),
            expect.anything(),
            { objectId: "insight", workspaceId: "ws-1", include: catalogReferences },
        );
    });
});
