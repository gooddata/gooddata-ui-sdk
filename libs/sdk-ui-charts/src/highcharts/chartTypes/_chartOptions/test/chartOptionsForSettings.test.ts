// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISettings } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../../interfaces/chartConfig.js";
import { updateConfigWithSettings } from "../chartOptionsForSettings.js";

describe("updateConfigWithSettings", () => {
    describe("enableCompactSize", () => {
        it("should return correct config with enableCompactSize always true", () => {
            const config: IChartConfig = {};
            const settings: ISettings = {};
            const expectedConfig = {
                enableAliasAttributeLabel: true,
                enableChartSorting: true,
                enableCompactSize: true,
                enableJoinedAttributeAxisName: true,
                enableReversedStacking: true,
                enableSeparateTotalLabels: true,
                respectLegendPosition: true,
                useGenericInteractionTooltip: true,
            };
            expect(updateConfigWithSettings(config, settings)).toEqual(expectedConfig);
        });
    });

    it("should return correct config from undefined feature flags", () => {
        const config: IChartConfig = {};
        const featureFlags: ISettings | undefined = undefined;
        const expectedConfig = {
            enableCompactSize: true,
        };
        expect(updateConfigWithSettings(config, featureFlags)).toEqual(expectedConfig);
    });

    describe("enableCustomTooltip", () => {
        const customTooltip = { enabled: true, content: "Revenue: {metric/m1}" };

        it("keeps customTooltip when the flag is enabled", () => {
            const config: IChartConfig = { customTooltip };
            const settings: ISettings = { enableCustomTooltip: true };
            expect(updateConfigWithSettings(config, settings).customTooltip).toEqual(customTooltip);
        });

        it("keeps customTooltip when the flag is unset (defaults on)", () => {
            const config: IChartConfig = { customTooltip };
            const settings: ISettings = {};
            expect(updateConfigWithSettings(config, settings).customTooltip).toEqual(customTooltip);
        });

        it("strips customTooltip when the flag is explicitly disabled", () => {
            const config: IChartConfig = { customTooltip };
            const settings: ISettings = { enableCustomTooltip: false };
            expect(updateConfigWithSettings(config, settings).customTooltip).toBeUndefined();
        });
    });
});
