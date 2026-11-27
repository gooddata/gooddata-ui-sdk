// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalyticsCatalogGenerateDescriptionObjectType } from "@gooddata/sdk-backend-spi";

import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";

describe("AnalyticsCatalogService", () => {
    const request = vi.fn();
    const service = () =>
        new AnalyticsCatalogService(
            vi.fn(async (callback) =>
                callback({ axios: { request }, basePath: "" }),
            ) as TigerAuthenticatedCallGuard,
            "workspace",
        );
    const sentBody = () => JSON.parse(request.mock.calls[0][0].data);

    beforeEach(() => {
        request.mockReset();
        request.mockResolvedValue({ status: 200, data: {} });
    });

    const cases: Array<[AnalyticsCatalogGenerateDescriptionObjectType, string]> = [
        ["insight", "Visualization"],
        ["analyticalDashboard", "Dashboard"],
        ["measure", "Metric"],
        ["fact", "Fact"],
        ["attribute", "Attribute"],
        ["document", "Document"],
    ];

    it.each(cases)("generateDescription sends %s as %s", async (objectType, expected) => {
        await service().generateDescription({ objectType, objectId: "obj" });

        expect(sentBody()).toEqual({ objectType: expected, objectId: "obj" });
    });

    it.each(cases)("generateTitle sends %s as %s", async (objectType, expected) => {
        await service().generateTitle({ objectType, objectId: "obj" });

        expect(sentBody()).toEqual({ objectType: expected, objectId: "obj" });
    });
});
