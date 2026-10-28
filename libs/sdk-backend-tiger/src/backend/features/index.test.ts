// (C) 2026 GoodData Corporation

import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserProfile } from "@gooddata/api-client-tiger";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import type { LocalFeatureFlagOverrides as Overrides } from "../uiFeatures.js";

import type { TigerFeaturesService as FeaturesService } from "./index.js";

describe("feature resolution", () => {
    const authCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: FeaturesService;
    let overrides: typeof Overrides;

    beforeEach(async () => {
        vi.resetModules();
        const { TigerFeaturesService } = await import("./index.js");
        ({ LocalFeatureFlagOverrides: overrides } = await import("../uiFeatures.js"));
        service = new TigerFeaturesService(authCall as TigerAuthenticatedCallGuard);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const staticProfile = {
        features: { static: { items: { enableRadarChart: "TRUE", aiChatSearchLimit: "42" } } },
    } as unknown as IUserProfile;
    const liveProfile = {
        features: { live: { configuration: { host: "/", key: "test" }, context: {} } },
    } as unknown as IUserProfile;

    it("uses remote values ahead of defaults", async () => {
        expect((await service.getFeatures(staticProfile)).enableRadarChart).toBe(true);
    });

    it("forces a local value while loading the other FeatureHub flags normally", async () => {
        overrides.enableRadarChart = false;
        const get = vi.spyOn(axios, "get").mockResolvedValue({
            status: 200,
            headers: { etag: "test" },
            data: [
                {
                    id: "test",
                    features: [
                        { key: "enableRadarChart", type: "BOOLEAN", value: true },
                        { key: "enableMekkoChart", type: "BOOLEAN", value: true },
                    ],
                },
            ],
        });

        expect(await service.getFeatures(liveProfile)).toMatchObject({
            enableRadarChart: false,
            enableMekkoChart: true,
        });
        expect(get).toHaveBeenCalledOnce();
    });

    it("keeps local overrides when FeatureHub fails", async () => {
        overrides.enableRadarChart = true;
        vi.spyOn(axios, "get").mockRejectedValue(new Error("offline"));
        const error = vi.spyOn(console, "error").mockImplementation(() => {});

        expect((await service.getFeatures(liveProfile)).enableRadarChart).toBe(true);
        expect(error).toHaveBeenCalledOnce();
    });

    it("does not keep forced values in the cache after an override is removed", async () => {
        overrides.enableRadarChart = false;
        expect((await service.getFeatures(staticProfile)).enableRadarChart).toBe(false);
        delete overrides.enableRadarChart;
        expect((await service.getFeatures(staticProfile)).enableRadarChart).toBe(true);
        expect((await service.getFeatures(staticProfile)).enableRadarChart).toBe(true);
        expect(authCall).toHaveBeenCalledTimes(2);
    });

    it("distinguishes an undefined override from no override", async () => {
        overrides.aiChatSearchLimit = undefined;
        expect((await service.getFeatures(staticProfile)).aiChatSearchLimit).toBeUndefined();
        delete overrides.aiChatSearchLimit;
        expect((await service.getFeatures(staticProfile)).aiChatSearchLimit).toBe(42);
        overrides.aiChatSearchLimit = 0;
        expect((await service.getFeatures(staticProfile)).aiChatSearchLimit).toBe(0);
    });
});
