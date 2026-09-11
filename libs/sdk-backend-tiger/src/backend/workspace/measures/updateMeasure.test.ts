// (C) 2026 GoodData Corporation

import { type AxiosPromise } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    EntitiesApi_GetEntityMetrics,
    EntitiesApi_UpdateEntityMetrics,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
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

const measure = newMeasureMetadataObject(idRef("m1"), (m) =>
    m.id("m1").title("Revenue").expression("SELECT 1").format("#,##0.00"),
);

function updateResponse() {
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

describe("TigerWorkspaceMeasures.updateMeasure — conditionalFormatting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(EntitiesApi_UpdateEntityMetrics).mockResolvedValue(updateResponse());
    });

    it("serializes the caller's conditionalFormatting fresh, without fetching the backend's current state first", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasure({
            ...measure,
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
        const request = vi.mocked(EntitiesApi_UpdateEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricInDocument.data.attributes.conditionalFormatting).toEqual({
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

    it("omits conditionalFormatting (a full PUT clears an omitted attribute on its own) when the caller's value is absent", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasure({ ...measure, conditionalFormatting: undefined });

        expect(EntitiesApi_GetEntityMetrics).not.toHaveBeenCalled();
        const request = vi.mocked(EntitiesApi_UpdateEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricInDocument.data.attributes).not.toHaveProperty("conditionalFormatting");
    });

    it("sends an empty conditions list as-is", async () => {
        const measures = new TigerWorkspaceMeasures(authCall, WORKSPACE);

        await measures.updateMeasure({
            ...measure,
            conditionalFormatting: { enabled: true, conditions: [] },
        });

        const request = vi.mocked(EntitiesApi_UpdateEntityMetrics).mock.calls[0][2];
        expect(request.jsonApiMetricInDocument.data.attributes.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [],
        });
    });
});
