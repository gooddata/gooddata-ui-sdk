// (C) 2020-2025 GoodData Corporation

import axios from "axios";
import { ApiEntitlement, ILiveFeatures } from "@gooddata/api-client-tiger";
import { getFeatureHubFeatures, FeatureHubResponse } from "../hub.js";
import { FeatureDef } from "../feature.js";
import { pickContext } from "../index.js";
import { describe, expect, it, vi } from "vitest";

const axiosGetSpy = vi.spyOn(axios, "get");

const entitlements: ApiEntitlement[] = [
    {
        name: "Tier",
        value: "TRIAL",
    },
];

describe("live features", () => {
    function createFeatures(
        earlyAccessValues: string[] = [],
        organizationId = "",
        tier = "",
        jsSdkVersion = "",
        controlledFeatureRollout = false,
    ): ILiveFeatures["live"] {
        return {
            configuration: { host: "/", key: "" },
            context: {
                earlyAccessValues,
                organizationId,
                tier,
                jsSdkVersion,
                controlledFeatureRollout,
            },
        };
    }

    function createFeature(key: string, type: FeatureDef["type"], value: any): FeatureDef {
        return {
            id: Math.random().toString(),
            key,
            type,
            value,
            l: false,
            version: "1",
        };
    }

    function mockReturn(
        features: FeatureHubResponse[number]["features"] = [],
        status = 200,
        etag = "current",
    ) {
        axiosGetSpy.mockResolvedValueOnce({
            data: [{ id: "test", features }],
            headers: { etag },
            status,
            statusText: "",
            config: {},
        } as any);
    }

    it("call axios", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures());
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "",
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
            timeout: 30000,
        });
    });

    it("call axios with ws context", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(
            createFeatures(),
            pickContext({ earlyAccessValues: ["omega"] }, "test-org", [], "1.0.0"),
        );
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "organizationId=test-org,earlyAccess=omega,jsSdkVersion=1.0.0",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
            timeout: 30000,
        });
    });

    it("call axios with context filled", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures(["beta"], "org", "", "1.0.0"));
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "organizationId=org,earlyAccess=beta,jsSdkVersion=1.0.0",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
            timeout: 30000,
        });
    });

    it("call axios with context and ws context filled", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(
            createFeatures(["beta"], "org"),
            pickContext({ earlyAccessValues: ["omega"] }, "test-org", entitlements, "1.0.0"),
        );
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "organizationId=test-org,earlyAccess=omega,tier=TRIAL,jsSdkVersion=1.0.0",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
            timeout: 30000,
        });
    });

    it("empty definition", async () => {
        mockReturn([]);

        const results = await getFeatureHubFeatures(createFeatures());
        expect(results).toEqual({});
    });

    it("full definition - BOOLEAN", async () => {
        mockReturn([
            createFeature("ADMeasureValueFilterNullAsZeroOption", "BOOLEAN", true),
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", true),
            createFeature("enableKPIDashboardDeleteFilterButton", "BOOLEAN", true),
            createFeature("enableMultipleDates", "BOOLEAN", true),
            createFeature("enableSortingByTotalGroup", "BOOLEAN", true),
        ]);

        const results = await getFeatureHubFeatures(createFeatures());
        expect(results).toEqual({
            ADMeasureValueFilterNullAsZeroOption: true,
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
        });
    });

    it("full definition - STRING", async () => {
        mockReturn([
            createFeature("ADMeasureValueFilterNullAsZeroOption", "STRING", "EnabledUncheckedByDefault"),
            createFeature("dashboardEditModeDevRollout", "STRING", "ENABLED"),
            createFeature("enableKPIDashboardDeleteFilterButton", "STRING", "ENABLED"),
            createFeature("enableMultipleDates", "STRING", "ENABLED"),
            createFeature("enableSortingByTotalGroup", "STRING", "TRUE"),
        ]);

        const results = await getFeatureHubFeatures(createFeatures());
        expect(results).toEqual({
            ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
        });
    });
});
