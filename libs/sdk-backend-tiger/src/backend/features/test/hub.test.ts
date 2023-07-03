// (C) 2020-2023 GoodData Corporation

import axios from "axios";
import { ILiveFeatures } from "@gooddata/api-client-tiger";
import { getFeatureHubFeatures, FeatureHubResponse } from "../hub.js";
import { FeatureDef } from "../feature.js";
import { pickContext } from "../index.js";
import { describe, expect, it, vi } from "vitest";

const axiosGetSpy = vi.spyOn(axios, "get");

describe("live features", () => {
    function createFeatures(earlyAccess = "", organizationId = ""): ILiveFeatures["live"] {
        return { configuration: { host: "/", key: "" }, context: { earlyAccess, organizationId } };
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
                "X-FeatureHub": "earlyAccess=,organizationId=",
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
            timeout: 30000,
        });
    });

    it("call axios with ws context", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures(), pickContext({ earlyAccess: "omega" }, "test-org"));
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=omega,organizationId=test-org",
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

        await getFeatureHubFeatures(createFeatures("beta", "org"));
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=beta,organizationId=org",
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
            createFeatures("beta", "org"),
            pickContext({ earlyAccess: "omega" }, "test-org"),
        );
        expect(axiosGetSpy).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=omega,organizationId=test-org",
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
