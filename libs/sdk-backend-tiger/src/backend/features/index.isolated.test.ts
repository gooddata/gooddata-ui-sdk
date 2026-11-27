// (C) 2026 GoodData Corporation

import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserProfile } from "@gooddata/api-client-tiger";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import {
    FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
    type FeatureFlagOverrideRule,
    type getServerFeatureFlags as GetServerFeatureFlags,
} from "../featureFlagOverrides.js";
import type { LocalFeatureFlagOverrides as Overrides } from "../uiFeatures.js";

import type { TigerFeaturesService as FeaturesService } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/profile", () => ({
    ProfileApi_GetCurrent: vi.fn(),
}));

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

    describe("runtime overrides", () => {
        let getServerFeatureFlags: typeof GetServerFeatureFlags;

        const profileWithGate = (gate: "TRUE" | "FALSE") =>
            ({
                organizationId: "org",
                userId: "user",
                features: {
                    static: {
                        items: { enableFeatureFlagOverrides: gate, enableRadarChart: "TRUE" },
                    },
                },
            }) as unknown as IUserProfile;

        const storeRules = (rules: FeatureFlagOverrideRule[]) => {
            const content = JSON.stringify({ version: 1, rules });
            vi.stubGlobal("window", {
                localStorage: {
                    getItem: (key: string) => (key === FEATURE_FLAG_OVERRIDES_STORAGE_KEY ? content : null),
                },
            });
        };

        beforeEach(async () => {
            ({ getServerFeatureFlags } = await import("../featureFlagOverrides.js"));
        });

        it("ignores stored rules when the gate flag is off", async () => {
            storeRules([{ flag: "enableRadarChart", value: false }]);

            expect((await service.getFeatures(profileWithGate("FALSE"))).enableRadarChart).toBe(true);
        });

        it("applies the stored rules that match the organization, user and workspace", async () => {
            storeRules([
                { flag: "enableRadarChart", value: false, organizationId: "org", userId: "user" },
                { flag: "enableMekkoChart", value: true, organizationId: "org", workspaceId: "ws" },
            ]);

            expect(await service.getFeatures(profileWithGate("TRUE"), {}, "ws")).toMatchObject({
                enableRadarChart: false,
                enableMekkoChart: true,
            });
            expect(await service.getFeatures(profileWithGate("TRUE"))).toMatchObject({
                enableRadarChart: false,
                enableMekkoChart: false,
            });
        });

        it("lets compile-time overrides win over stored rules", async () => {
            overrides.enableRadarChart = true;
            storeRules([{ flag: "enableRadarChart", value: false }]);

            expect((await service.getFeatures(profileWithGate("TRUE"))).enableRadarChart).toBe(true);
        });

        it("applies stored rules when the gate is set in code and no flags load", async () => {
            overrides.enableFeatureFlagOverrides = true;
            storeRules([{ flag: "enableMekkoChart", value: true }]);
            const profileWithoutFeatures = { organizationId: "org", userId: "user" } as IUserProfile;

            expect((await service.getFeatures(profileWithoutFeatures)).enableMekkoChart).toBe(true);
        });

        it("keeps the server values without the stored rules", async () => {
            storeRules([{ flag: "enableRadarChart", value: false }]);

            await service.getFeatures(profileWithGate("TRUE"));

            expect(getServerFeatureFlags()?.enableRadarChart).toBe(true);
        });

        it("leaves the flags set in code out of the server values", async () => {
            overrides.enableRadarChart = false;

            await service.getFeatures(profileWithGate("TRUE"));

            expect(getServerFeatureFlags()).not.toHaveProperty("enableRadarChart");
            expect(getServerFeatureFlags()?.enableFeatureFlagOverrides).toBe(true);
        });

        it("keeps the server values of a workspace apart from those of the organization", async () => {
            await service.getFeatures(profileWithGate("TRUE"), { earlyAccessValues: ["beta"] }, "ws");
            await service.getFeatures(profileWithGate("FALSE"));

            expect(getServerFeatureFlags("ws")?.enableFeatureFlagOverrides).toBe(true);
            expect(getServerFeatureFlags()?.enableFeatureFlagOverrides).toBe(false);
            expect(getServerFeatureFlags("other")).toBeUndefined();
        });

        it("loads the profile when none is given and stored rules exist", async () => {
            vi.mocked(ProfileApi_GetCurrent).mockResolvedValue(profileWithGate("TRUE"));
            storeRules([{ flag: "enableRadarChart", value: false, userId: "user" }]);

            expect((await service.getFeatures()).enableRadarChart).toBe(false);
        });
    });
});
