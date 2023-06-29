// (C) 2007-2022 GoodData Corporation

import { ISettings } from "@gooddata/sdk-model";
import { IChartConfig } from "../../../../interfaces/index.js";
import { updateConfigWithSettings } from "../chartOptionsForSettings.js";
import { describe, it, expect } from "vitest";

describe("updateConfigWithSettings", () => {
    describe("disableKpiDashboardHeadlineUnderline", () => {
        it("should return correct config from feature flags", async () => {
            const config: IChartConfig = {};
            const settings: ISettings = {
                disableKpiDashboardHeadlineUnderline: true,
            };
            const expectedConfig = {
                disableDrillUnderline: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });

    describe("enableKDWidgetCustomHeight", () => {
        it("should return correct config from feature flags", async () => {
            const config: IChartConfig = {};
            const settings: ISettings = {
                enableKDWidgetCustomHeight: true,
            };
            const expectedConfig = {
                enableCompactSize: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });

    describe("enableAxisNameViewByTwoAttributes", () => {
        it("should return correct config from feature flags if enableJoinedAttributeAxisName is not provided", async () => {
            const config: IChartConfig = {};
            const settings: ISettings = {
                enableAxisNameViewByTwoAttributes: false,
            };
            const expectedConfig = {
                enableJoinedAttributeAxisName: false,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });

        it("should return correct config from feature flags if enableJoinedAttributeAxisName is provided", async () => {
            const config: IChartConfig = {
                enableJoinedAttributeAxisName: true,
            };
            const settings: ISettings = {
                enableAxisNameViewByTwoAttributes: false,
            };
            const expectedConfig = {
                enableJoinedAttributeAxisName: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });

    it("should return correct config from undefined feature flags", async () => {
        const config: IChartConfig = {};
        const featureFlags: ISettings = undefined;
        expect(updateConfigWithSettings(config, featureFlags)).toEqual(config);
    });
});
