// (C) 2007-2020 GoodData Corporation

import { ISettings } from "@gooddata/sdk-backend-spi";
import { IChartConfig } from "../../../../interfaces";
import { updateConfigWithSettings } from "../chartOptionsForSettings";

describe("updateConfigWithSettings", () => {
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

    it("should return correct config from undefined feature flags", async () => {
        const config: IChartConfig = {};
        const featureFlags: ISettings = undefined;
        expect(updateConfigWithSettings(config, featureFlags)).toEqual(config);
    });
});
