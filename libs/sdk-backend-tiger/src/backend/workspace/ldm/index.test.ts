// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as layoutApi from "@gooddata/api-client-tiger/endpoints/layout";
import { type IDeclarativeLogicalModel } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceLogicalModelService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/layout", () => ({
    LayoutApi_GetLogicalModel: vi.fn(),
    LayoutApi_PutWorkspaceLayout: vi.fn(),
    LayoutApi_SetLogicalModel: vi.fn(),
}));

const model: IDeclarativeLogicalModel = {
    datasets: [
        {
            id: "orders",
            title: "Orders",
            grain: [{ id: "order_id", type: "attribute" }],
            references: [],
            attributes: [{ id: "order_id", title: "Order ID", labels: [], sourceColumn: "order_id" }],
            dataSourceTableId: {
                dataSourceId: "pg",
                id: "orders",
                path: ["public", "orders"],
                type: "dataSource",
            },
        },
    ],
    dateInstances: [
        {
            id: "date",
            title: "Date",
            granularities: ["DAY"],
            granularitiesFormatting: { titleBase: "", titlePattern: "%titleBase - %granularityTitle" },
        },
    ],
};

describe("TigerWorkspaceLogicalModelService", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: TigerWorkspaceLogicalModelService;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceLogicalModelService } = await import("./index.js");
        service = new TigerWorkspaceLogicalModelService(mockAuthCall as TigerAuthenticatedCallGuard, "ws");
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reads the model without the parents by default", async () => {
        vi.mocked(layoutApi.LayoutApi_GetLogicalModel).mockResolvedValue({
            data: { ldm: model },
        } as AxiosResponse);

        expect(await service.getDeclarativeModel()).toEqual(model);
        expect(layoutApi.LayoutApi_GetLogicalModel).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            includeParents: false,
        });
    });

    it("reads the model with the parents", async () => {
        vi.mocked(layoutApi.LayoutApi_GetLogicalModel).mockResolvedValue({ data: {} } as AxiosResponse);

        expect(await service.getDeclarativeModel({ includeParents: true })).toEqual({});
        expect(layoutApi.LayoutApi_GetLogicalModel).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            includeParents: true,
        });
    });

    it("writes the model", async () => {
        vi.mocked(layoutApi.LayoutApi_SetLogicalModel).mockResolvedValue({} as AxiosResponse);

        await service.setDeclarativeModel(model);

        expect(layoutApi.LayoutApi_SetLogicalModel).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            declarativeModel: { ldm: model },
        });
    });

    it("writes the model and the analytics in one request", async () => {
        vi.mocked(layoutApi.LayoutApi_PutWorkspaceLayout).mockResolvedValue({} as AxiosResponse);
        const analytics = { metrics: [{ id: "m", title: "M", content: { maql: "SELECT 1" } }] };

        await service.setDeclarativeLayout({ ldm: model, analytics });

        expect(layoutApi.LayoutApi_PutWorkspaceLayout).toHaveBeenCalledWith({}, "", {
            workspaceId: "ws",
            declarativeWorkspaceModel: { ldm: model, analytics },
        });
    });
});
