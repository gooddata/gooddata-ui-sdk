// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";
import { TigerReferencesService } from "../index.js";

vi.mock("@gooddata/api-client-tiger", async () => {
    const actual = await vi.importActual<typeof api>("@gooddata/api-client-tiger");
    return {
        ...actual,
        ActionsApi_GetDependentEntitiesGraphFromEntryPoints: vi.fn(),
    };
});

type TigerNode = { id: string; type: string; title?: string };
type TigerEdge = [TigerNode, TigerNode];

const metricNode = { id: "m1", type: "metric", title: "M1" };
const parameterNode = { id: "p1", type: "parameter", title: "P1" };
const dashboardNode = { id: "d1", type: "analyticalDashboard", title: "D1" };
const metricRef = idRef("m1", "measure");
const parameterRef = idRef("p1", "parameter");
const dashboardRef = idRef("d1", "analyticalDashboard");
const metricDependencyEdge: TigerEdge = [parameterNode, metricNode];
const metricDependentEdge: TigerEdge = [metricNode, dashboardNode];

function mockGraph(nodes: TigerNode[] = [], edges: TigerEdge[] = []) {
    vi.mocked(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).mockResolvedValue(
        graphResponse(nodes, edges),
    );
}

function mockGraphOnce(nodes: TigerNode[] = [], edges: TigerEdge[] = []) {
    vi.mocked(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).mockResolvedValueOnce(
        graphResponse(nodes, edges),
    );
}

function graphResponse(nodes: TigerNode[], edges: TigerEdge[]): AxiosResponse {
    return {
        data: { graph: { nodes, edges } },
    } as unknown as AxiosResponse;
}

const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));

function makeService() {
    return new TigerReferencesService(mockAuthCall as TigerAuthenticatedCallGuard, "ws-1");
}

function expectGraphRequest(
    identifiers: Array<{ id: string; type: string }>,
    relation: "DEPENDENCIES" | "DEPENDENTS",
) {
    expect(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
            workspaceId: "ws-1",
            dependentEntitiesRequest: { identifiers, relation },
        },
    );
}

describe("TigerReferencesService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sends a single dependency graph request for a single metric root (down)", async () => {
        mockGraph();
        const service = makeService();

        await service.getReferences(metricRef, { direction: "down" });

        expect(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).toHaveBeenCalledTimes(1);
        expectGraphRequest([{ id: "m1", type: "metric" }], "DEPENDENCIES");
    });

    it("sends one batch request when called with an array of metric roots", async () => {
        mockGraph();
        const service = makeService();

        await service.getReferences([metricRef, idRef("m2", "measure")], { direction: "down" });

        expect(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).toHaveBeenCalledTimes(1);
        expectGraphRequest(
            [
                { id: "m1", type: "metric" },
                { id: "m2", type: "metric" },
            ],
            "DEPENDENCIES",
        );
    });

    it("converts metric -> parameter edges so callers can map roots to parameter refs", async () => {
        mockGraph([metricNode, parameterNode], [metricDependencyEdge]);
        const service = makeService();

        const result = await service.getReferences(metricRef, { direction: "down" });

        expect(result.edges).toEqual([{ from: metricRef, to: parameterRef }]);
        expect(result.nodes).toContainEqual({
            ...parameterRef,
            title: "P1",
            isRoot: false,
        });
    });

    it("keeps dependent edges in API relation order for up", async () => {
        mockGraph([metricNode, dashboardNode], [metricDependentEdge]);
        const service = makeService();

        const result = await service.getReferences(metricRef, { direction: "up" });

        expect(result.edges).toEqual([{ from: metricRef, to: dashboardRef }]);
        expectGraphRequest([{ id: "m1", type: "metric" }], "DEPENDENTS");
    });

    it("orients both dependency and dependent graphs by their API relation", async () => {
        mockGraphOnce([metricNode, parameterNode], [metricDependencyEdge]);
        mockGraphOnce([metricNode, dashboardNode], [metricDependentEdge]);
        const service = makeService();

        const result = await service.getReferences(metricRef, { direction: "both" });

        expect(result.edges).toEqual(
            expect.arrayContaining([
                { from: metricRef, to: parameterRef },
                { from: metricRef, to: dashboardRef },
            ]),
        );
    });

    it("marks the returned node as `isRoot` for an untyped identifier root", async () => {
        mockGraph([{ id: "foo", type: "visualizationObject", title: "Foo" }]);
        const service = makeService();

        const result = await service.getReferences(idRef("foo"), { direction: "down" });

        expect(result.nodes).toContainEqual({
            identifier: "foo",
            type: "insight",
            title: "Foo",
            isRoot: true,
        });
    });

    it("skips roots whose SDK type has no Tiger graph mapping", async () => {
        const service = makeService();

        const result = await service.getReferences(idRef("tag-1", "tag"), { direction: "down" });

        expect(result).toEqual({ nodes: [], edges: [] });
        expect(api.ActionsApi_GetDependentEntitiesGraphFromEntryPoints).not.toHaveBeenCalled();
    });
});
