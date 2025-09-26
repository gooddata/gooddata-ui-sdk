// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ISettings } from "@gooddata/sdk-model";

import { IChartConfig } from "../../../../interfaces/index.js";
import { updateConfigWithSettings } from "../chartOptionsForSettings.js";

describe("updateConfigWithSettings", () => {
    describe("enableCompactSize", () => {
        it("should return correct config with enableCompactSize always true", async () => {
            const config: IChartConfig = {};
            const settings: ISettings = {};
            const expectedConfig = {
                disableDrillUnderline: true,
                enableCompactSize: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
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
                disableDrillUnderline: true,
                enableCompactSize: true,
                enableJoinedAttributeAxisName: false,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
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
                disableDrillUnderline: true,
                enableCompactSize: true,
                enableJoinedAttributeAxisName: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });

    it("should return correct config from undefined feature flags", async () => {
        const config: IChartConfig = {};
        const featureFlags: ISettings = undefined;
        const expectedConfig = {
            enableCompactSize: true,
        };
        expect(updateConfigWithSettings(config, featureFlags)).toEqual(expectedConfig);
    });

    describe("enableKDCrossFiltering", () => {
        it("should return correct config from feature flags", async () => {
            const config: IChartConfig = {};
            const settings: ISettings = {
                enableKDCrossFiltering: true,
            };
            const expectedConfig = {
                disableDrillUnderline: true,
                enableCompactSize: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
                useGenericInteractionTooltip: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });
});
