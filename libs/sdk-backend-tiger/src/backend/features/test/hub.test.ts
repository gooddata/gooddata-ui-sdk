// (C) 2020-2022 GoodData Corporation

import axios, { AxiosResponse } from "axios";
import { ILiveFeatures } from "@gooddata/api-client-tiger";
import { getFeatureHubFeatures, FeatureHubResponse } from "../hub";
import { FeatureDef } from "../feature";
import { pickContext } from "../index";

jest.mock("axios");

describe("live features", () => {
    function createFeatures(earlyAccess = ""): ILiveFeatures["live"] {
        return { configuration: { host: "/", key: "" }, context: { earlyAccess } };
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
        (axios.get as any).mockResolvedValueOnce({
            data: [{ id: "test", features }],
            headers: { etag },
            status,
            statusText: "",
            config: {},
        } as AxiosResponse<FeatureHubResponse>);
    }

    it("call axios", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures());
        expect(axios.get).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=",
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
        });
    });

    it("call axios with ws context", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures(), pickContext({ earlyAccess: "omega" }));
        expect(axios.get).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=omega",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
        });
    });

    it("call axios with context filled", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures("beta"));
        expect(axios.get).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=beta",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
        });
    });

    it("call axios with context and ws context filled", async () => {
        mockReturn([]);

        await getFeatureHubFeatures(createFeatures("beta"), pickContext({ earlyAccess: "omega" }));
        expect(axios.get).toHaveBeenCalledWith("/features", {
            baseURL: "/",
            headers: {
                "Content-type": "application/json",
                "X-FeatureHub": "earlyAccess=omega",
                "if-none-match": expect.anything(),
            },
            method: "GET",
            params: { sdkUrl: "" },
            validateStatus: expect.anything(),
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
            createFeature("enableSortingByTotalGroup", "STRING", "ENABLED"),
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
