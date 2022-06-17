// (C) 2020-2022 GoodData Corporation

import axios, { AxiosResponse } from "axios";
import { ILiveFeatures } from "@gooddata/api-client-tiger";
import { getFeatureHubFeatures, FeatureHubResponse } from "../hub";
import { FeatureDef, StrategiesDef, AttributeDef } from "../feature";

jest.mock("axios");

describe("live features", () => {
    function createFeatures(earlyAccess = ""): ILiveFeatures["live"] {
        return { configuration: { host: "/", key: "" }, context: { earlyAccess } };
    }

    function createFeature(
        key: string,
        type: FeatureDef["type"],
        value: any,
        strategies: StrategiesDef[] = [],
    ): FeatureDef {
        return {
            id: Math.random().toString(),
            key,
            type,
            value,
            strategies,
            l: false,
            version: "1",
        };
    }

    function createStrategy(value: any, attributes: AttributeDef[]): StrategiesDef {
        return {
            id: Math.random().toString(),
            value,
            attributes,
        };
    }

    function createAttr(
        fieldName: string,
        values: string[],
        type: AttributeDef["type"],
        conditional: AttributeDef["conditional"],
    ): AttributeDef {
        return {
            values,
            type,
            conditional,
            fieldName,
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
            headers: { "Content-type": "application/json" },
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
            createFeature("ADmeasureValueFilterNullAsZeroOption", "BOOLEAN", true),
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", true),
            createFeature("enableKPIDashboardDeleteFilterButton", "BOOLEAN", true),
            createFeature("enableMultipleDates", "BOOLEAN", true),
            createFeature("enableSortingByTotalGroup", "BOOLEAN", true),
        ]);

        const results = await getFeatureHubFeatures(createFeatures());
        expect(results).toEqual({
            ADmeasureValueFilterNullAsZeroOption: true,
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
        });
    });

    it("full definition - STRING", async () => {
        mockReturn([
            createFeature("ADmeasureValueFilterNullAsZeroOption", "STRING", "EnabledUncheckedByDefault"),
            createFeature("dashboardEditModeDevRollout", "STRING", "ENABLED"),
            createFeature("enableKPIDashboardDeleteFilterButton", "STRING", "ENABLED"),
            createFeature("enableMultipleDates", "STRING", "ENABLED"),
            createFeature("enableSortingByTotalGroup", "STRING", "ENABLED"),
        ]);

        const results = await getFeatureHubFeatures(createFeatures());
        expect(results).toEqual({
            ADmeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
        });
    });

    it("full definition - BOOLEAN - with valid strategy EQUAL that matched", async () => {
        mockReturn([
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", false, [
                createStrategy(true, [createAttr("earlyAccess", ["beta"], "STRING", "EQUALS")]),
            ]),
        ]);

        const results = await getFeatureHubFeatures(createFeatures("beta"));
        expect(results).toEqual({
            dashboardEditModeDevRollout: true,
        });
    });

    it("full definition - BOOLEAN - with valid strategy EQUAL that not matched", async () => {
        mockReturn([
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", false, [
                createStrategy(true, [createAttr("earlyAccess", ["beta"], "STRING", "EQUALS")]),
            ]),
        ]);

        const results = await getFeatureHubFeatures(createFeatures("alpha"));
        expect(results).toEqual({
            dashboardEditModeDevRollout: false,
        });
    });

    it("full definition - BOOLEAN - with valid strategy NOT_EQUAL that matched", async () => {
        mockReturn([
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", false, [
                createStrategy(true, [createAttr("earlyAccess", ["beta"], "STRING", "NOT_EQUALS")]),
            ]),
        ]);

        const results = await getFeatureHubFeatures(createFeatures("beta"));
        expect(results).toEqual({
            dashboardEditModeDevRollout: false,
        });
    });

    it("full definition - BOOLEAN - with valid strategy NOT_EQUAL that not matched", async () => {
        mockReturn([
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", false, [
                createStrategy(true, [createAttr("earlyAccess", ["beta"], "STRING", "NOT_EQUALS")]),
            ]),
        ]);

        const results = await getFeatureHubFeatures(createFeatures("alpha"));
        expect(results).toEqual({
            dashboardEditModeDevRollout: true,
        });
    });

    it("full definition - BOOLEAN - with invalid strategy EQUAL that matched", async () => {
        mockReturn([
            createFeature("dashboardEditModeDevRollout", "BOOLEAN", false, [
                createStrategy(true, [createAttr("earlyAccess", ["beta"], "STRING", "ENDS_WITH")]),
            ]),
        ]);

        const results = await getFeatureHubFeatures(createFeatures("beta"));
        expect(results).toEqual({
            dashboardEditModeDevRollout: false,
        });
    });

    describe("full definition - BOOLEAN - with more definitions", () => {
        beforeEach(() => {
            mockReturn([
                createFeature("ADmeasureValueFilterNullAsZeroOption", "STRING", "Disabled", [
                    createStrategy("EnabledCheckedByDefault", [
                        createAttr("earlyAccess", ["alpha", "beta"], "STRING", "EQUALS"),
                    ]),
                    createStrategy("EnabledUncheckedByDefault", [
                        createAttr("earlyAccess", ["gamma"], "STRING", "EQUALS"),
                    ]),
                ]),
            ]);
        });

        it("for none", async () => {
            const results = await getFeatureHubFeatures(createFeatures("none"));
            expect(results).toEqual({
                ADmeasureValueFilterNullAsZeroOption: "Disabled",
            });
        });

        it("for alpha", async () => {
            const results = await getFeatureHubFeatures(createFeatures("alpha"));
            expect(results).toEqual({
                ADmeasureValueFilterNullAsZeroOption: "EnabledCheckedByDefault",
            });
        });

        it("for gamma", async () => {
            const results = await getFeatureHubFeatures(createFeatures("gamma"));
            expect(results).toEqual({
                ADmeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            });
        });

        it("for omega", async () => {
            const results = await getFeatureHubFeatures(createFeatures("omega"));
            expect(results).toEqual({
                ADmeasureValueFilterNullAsZeroOption: "Disabled",
            });
        });
    });
});
