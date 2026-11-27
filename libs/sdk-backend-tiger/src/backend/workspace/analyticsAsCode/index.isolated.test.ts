// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as layoutApi from "@gooddata/api-client-tiger/endpoints/layout";
import { type AnalyticsAsCodeDocument } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceAnalyticsAsCodeService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/layout", () => ({
    LayoutApi_PutWorkspaceLayout: vi.fn(),
}));

const documents: AnalyticsAsCodeDocument[] = [
    {
        type: "dataset",
        id: "orders",
        table_path: "demo/orders",
        primary_key: "order_id",
        fields: {
            order_id: { type: "attribute", source_column: "order_id", data_type: "STRING" },
            amount: { type: "fact", source_column: "amount", data_type: "NUMERIC" },
        },
    },
    { type: "metric", id: "revenue", maql: "SELECT SUM({fact/amount})" },
];

describe("TigerWorkspaceAnalyticsAsCodeService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerWorkspaceAnalyticsAsCodeService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceAnalyticsAsCodeService } = await import("./index.js");
        service = new TigerWorkspaceAnalyticsAsCodeService(mockAuthCall as TigerAuthenticatedCallGuard, "ws");
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(layoutApi.LayoutApi_PutWorkspaceLayout).mockResolvedValue({} as AxiosResponse);
    });

    it("puts the converted documents as the workspace layout", async () => {
        await service.deploy(documents, { dataSourceId: "demo_ds" });

        const [, , { workspaceId, declarativeWorkspaceModel }] = vi.mocked(
            layoutApi.LayoutApi_PutWorkspaceLayout,
        ).mock.calls[0];
        expect(workspaceId).toBe("ws");
        expect(declarativeWorkspaceModel.ldm?.datasets?.map(({ id }) => id)).toEqual(["orders"]);
        expect(declarativeWorkspaceModel.ldm?.datasets?.[0].dataSourceTableId?.dataSourceId).toBe("demo_ds");
        expect(declarativeWorkspaceModel.analytics?.metrics?.map(({ id }) => id)).toEqual(["revenue"]);
    });

    it("does not call the backend when a document does not convert", async () => {
        const invalid = { type: "dashboard", id: "broken", tabs: [{ id: "t" }], sections: [{}] };

        await expect(service.deploy([invalid as AnalyticsAsCodeDocument])).rejects.toThrow();
        expect(layoutApi.LayoutApi_PutWorkspaceLayout).not.toHaveBeenCalled();
    });
});
