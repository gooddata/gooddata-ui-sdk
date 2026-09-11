// (C) 2026 GoodData Corporation

import { type AxiosPromise } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    EntitiesApi_GetEntityMetrics,
    EntitiesApi_PatchEntityMetrics,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceMeasures as TigerWorkspaceMeasuresClass } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityMetrics: vi.fn(),
    EntitiesApi_DeleteEntityMetrics: vi.fn(),
    EntitiesApi_GetAllEntitiesMetrics: vi.fn(),
    EntitiesApi_GetAllEntitiesVisualizationObjects: vi.fn(),
    EntitiesApi_GetEntityMetrics: vi.fn(),
    EntitiesApi_PatchEntityMetrics: vi.fn(),
    EntitiesApi_UpdateEntityMetrics: vi.fn(),
}));

// The service is imported dynamically from a fresh module registry so that it picks up the mock
// above even when another (non-isolated) test file already imported it with a mock of its own.
let TigerWorkspaceMeasures: typeof TigerWorkspaceMeasuresClass;

beforeAll(async () => {
    vi.resetModules();
    ({ TigerWorkspaceMeasures } = await import("./index.js"));
});

const WORKSPACE = "ws-1";

const authCall = vi.fn(async (callback) =>
    callback({
        axios: {},
        basePath: "",
    }),
) as TigerAuthenticatedCallGuard;

function patchResponse() {
    return {
        data: {
            data: {
                id: "m1",
                type: "metric",
                attributes: {
                    title: "Revenue",
                    description: "",
                    tags: [],
                    content: { maql: "SELECT 1", format: "#,##0.00" },
                },
            },
        },
    } as unknown as Awaited<AxiosPromise>;
}

describe("TigerWorkspaceMeasures.updateMeasureMeta — conditionalFormatting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(EntitiesApi_PatchEntityMetrics).mockResolvedValue(patchResponse());
    });

    it("serializes the caller's conditionalFormatting fresh, without fetching the backend's current state first", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasureMeta({
            ref: idRef("m1"),
            id: "m1",
            uri: "/m1",
            conditionalFormatting: {
                enabled: true,
                conditions: [
                    {
                        id: "c1",
                        operator: "GREATER_THAN",
                        value: { kind: "literal", value: 100 },
                        format: { scope: "cell", backgroundColor: "#E54D40" },
                    },
                ],
            },
        });

        expect(EntitiesApi_GetEntityMetrics).not.toHaveBeenCalled();
        const request = vi.mocked(EntitiesApi_PatchEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricPatchDocument.data.attributes.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [
                {
                    id: "c1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 100 },
                    format: { scope: "cell", backgroundColor: "#E54D40" },
                },
            ],
        });
    });

    it("clears conditionalFormatting via explicit null, without fetching the current state", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasureMeta({
            ref: idRef("m1"),
            id: "m1",
            uri: "/m1",
            conditionalFormatting: null,
        });

        expect(EntitiesApi_GetEntityMetrics).not.toHaveBeenCalled();
        const request = vi.mocked(EntitiesApi_PatchEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricPatchDocument.data.attributes.conditionalFormatting).toBeNull();
    });

    it("sends an empty conditions list as-is", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasureMeta({
            ref: idRef("m1"),
            id: "m1",
            uri: "/m1",
            conditionalFormatting: { enabled: true, conditions: [] },
        });

        const request = vi.mocked(EntitiesApi_PatchEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricPatchDocument.data.attributes.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [],
        });
    });

    it("does not touch conditionalFormatting (nor fetch the current state) when the caller omits it entirely", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasureMeta({
            ref: idRef("m1"),
            id: "m1",
            uri: "/m1",
            title: "New title",
        });

        expect(EntitiesApi_GetEntityMetrics).not.toHaveBeenCalled();
        const request = vi.mocked(EntitiesApi_PatchEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricPatchDocument.data.attributes).not.toHaveProperty(
            "conditionalFormatting",
        );
    });
});
