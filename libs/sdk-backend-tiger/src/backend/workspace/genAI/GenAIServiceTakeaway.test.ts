// (C) 2026 GoodData Corporation

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type ITakeawayRequest, type ITakeawayResult } from "@gooddata/sdk-backend-spi";
import { idRef, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type GenAIService as GenAIServiceClass } from "./index.js";

// The endpoint module may be mocked by a sibling test file; this one needs the real request it builds.
let GenAIService: typeof GenAIServiceClass;

beforeAll(async () => {
    vi.doUnmock("@gooddata/api-client-tiger/endpoints/genAI");
    vi.resetModules();
    ({ GenAIService } = await import("./index.js"));
});

afterAll(() => {
    vi.resetModules();
});

describe("GenAIService.generateTakeaway", () => {
    const request = vi.fn();
    const service = () =>
        new GenAIService(
            vi.fn(async (callback) =>
                callback({ axios: { request }, basePath: "" }),
            ) as TigerAuthenticatedCallGuard,
            "workspace",
            (value) => value ?? "",
        );
    const takeaway: ITakeawayResult = {
        takeaway: "**Revenue grew.** Every region added to it.",
        noData: false,
        generatedAt: "2026-10-22T00:00:00Z",
        agentId: "default",
        contextOmitted: ["memory"],
    };
    const placements: ITakeawayRequest["visualizations"] = [
        {
            visualizationId: "revenue",
            filters: [newAbsoluteDateFilter(idRef("date", "dataSet"), "2026-01-01", "2026-06-30")],
        },
    ];
    const sentBody = () => JSON.parse(request.mock.calls[0][0].data);

    beforeEach(() => {
        request.mockReset();
        request.mockResolvedValue({ status: 200, data: takeaway });
    });

    it("posts the charts under data, with the instructions and the length apart", async () => {
        const instructions = { slot: "One sentence", formatHint: "Plain text" };

        await service().generateTakeaway({
            visualizations: placements,
            filters: [],
            instructions,
            maxCharacters: 484,
        });

        expect(request.mock.calls[0][0]).toMatchObject({
            method: "POST",
            url: "/api/v1/ai/workspaces/workspace/takeaway",
        });
        expect(sentBody()).toEqual({
            data: {
                visualizations: [
                    {
                        visualizationId: "revenue",
                        filters: [
                            {
                                absoluteDateFilter: expect.objectContaining({
                                    from: "2026-01-01",
                                    to: "2026-06-30",
                                }),
                            },
                        ],
                    },
                ],
                filterContext: [],
            },
            instructions,
            maxCharacters: 484,
        });
    });

    it("leaves out what the request does not set, so the backend applies its defaults", async () => {
        await service().generateTakeaway({ visualizations: placements, filters: [] });

        expect(Object.keys(sentBody())).toEqual(["data"]);
    });

    it("names the agent only when the request does", async () => {
        await service().generateTakeaway({ visualizations: placements, filters: [], agentId: "analyst" });

        expect(sentBody().agentId).toBe("analyst");
    });

    it("returns the takeaway as the backend wrote it", async () => {
        await expect(
            service().generateTakeaway({ visualizations: placements, filters: [] }),
        ).resolves.toEqual(takeaway);
    });
});
