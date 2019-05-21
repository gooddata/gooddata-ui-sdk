// (C) 2007-2019 GoodData Corporation
import { getSanitizedStackingConfig } from "../common";
import { IChartConfig } from "../../../interfaces/Config";
import * as fixtures from "../../../../stories/test_data/fixtures";

describe("getSanitizedStackingConfig", () => {
    it("should keep config as is if afm has more than 1 measure", () => {
        const { afm } = fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const hasStackByAttribute = false;
        const newConfig: IChartConfig = getSanitizedStackingConfig(afm, config, hasStackByAttribute);
        expect(newConfig).toEqual(config);
    });

    it("should sanitized stacking config if afm has one measure and no stackBy", () => {
        const { afm } = fixtures.barChartWithViewByAttribute.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(afm, config, false);
        expect(newConfig).toEqual({
            stackMeasures: true,
            stackMeasuresToPercent: false,
        });
    });

    it("should sanitized stacking config if afm has one measure and one stackBy", () => {
        const { afm } = fixtures.barChartWithStackByAndViewByAttributes.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(afm, config, true);
        expect(newConfig).toEqual(config);
    });

    it("should sanitized stacking config if afm has 1 measure and isComputeRatio", () => {
        const { afm } = fixtures.columnChartWithMeasureViewByAndComputeRatio.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const hasStackByAttribute = false;
        const newConfig: IChartConfig = getSanitizedStackingConfig(afm, config, hasStackByAttribute);
        expect(newConfig).toEqual({
            stackMeasures: false,
            stackMeasuresToPercent: false,
        });
    });
});
