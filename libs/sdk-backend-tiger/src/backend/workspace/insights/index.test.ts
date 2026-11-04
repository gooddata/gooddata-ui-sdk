// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type DependentEntitiesResponse } from "@gooddata/api-client-tiger";
import * as actions from "@gooddata/api-client-tiger/endpoints/actions";
import { type IMetadataObject, type ObjectType, idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceInsights } from "./index.js";

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

    it("splits the dependents graph into dashboards and documents", async () => {
        const insightNode = { id: "insight", type: "visualizationObject", title: "Insight" };
        const dashboardNode = { id: "board", type: "analyticalDashboard", title: "Board" };
        const documentNode = { id: "pack", type: "document", title: "Q3 board pack" };
        const untitledDocumentNode = { id: "untitled-doc", type: "document" };
        const metricNode = { id: "revenue", type: "metric", title: "Revenue" };
        vi.mocked(actions.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).mockResolvedValue(
            graphResponse(
                [insightNode, dashboardNode, documentNode, untitledDocumentNode, metricNode],
                [
                    [insightNode, dashboardNode],
                    [insightNode, documentNode],
                    [insightNode, untitledDocumentNode],
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
