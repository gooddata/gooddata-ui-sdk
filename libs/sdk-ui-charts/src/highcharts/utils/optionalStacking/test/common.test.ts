// (C) 2007-2019 GoodData Corporation
import { IChartConfig } from "../../../Config";
import * as fixtures from "../../../../../__mocks__/fixtures";
import { getSanitizedStackingConfig, sanitizeConfig } from "../common";
import { IMeasure, newMeasure } from "@gooddata/sdk-model";

const [M1, M2]: IMeasure[] = ["m1", "m2"].map((name: string) => {
    return newMeasure(name, m => m.localId(name));
});

function createMeasureWithRatio(name: string): IMeasure {
    return newMeasure(name, m => m.localId(name).ratio());
}

describe("sanitizeConfig", () => {
    const config: IChartConfig = {
        stackMeasures: true,
        stackMeasuresToPercent: true,
    };

    it("should keep config as is if buckets have more than 1 measure", () => {
        expect(sanitizeConfig([M1, M2], config)).toEqual(config);
    });

    it("should sanitized stacking config if buckets have one measure and no stackBy", () => {
        expect(sanitizeConfig([M1], config)).toEqual({
            stackMeasures: true,
            stackMeasuresToPercent: true,
        });
    });

    it("should sanitized stacking config if buckets have one measure and one stackBy", () => {
        expect(sanitizeConfig([M1], config)).toEqual(config);
    });

    it("should sanitized stacking config if buckets have 1 measure and isComputeRatio", () => {
        const M1WithRatio = createMeasureWithRatio("m1");
        expect(sanitizeConfig([M1WithRatio], config)).toEqual({
            stackMeasures: false,
            stackMeasuresToPercent: false,
        });
    });

    it("should NOT sanitize stacking config if there is no measures", () => {
        expect(sanitizeConfig([], config)).toEqual(config);
    });
});

describe("getSanitizedStackingConfigFromAfm", () => {
    it("should keep config as is if afm has more than 1 measure", () => {
        const { definition } = fixtures.barChartWith3MetricsAndViewByAttribute;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual(config);
    });

    it("should keep stacking config if afm has one measure and no stackBy", () => {
        const { definition } = fixtures.barChartWithViewByAttribute;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual({
            stackMeasures: true,
            stackMeasuresToPercent: true,
        });
    });

    it("should sanitized stacking config if afm has one measure and one stackBy", () => {
        const { definition } = fixtures.barChartWithStackByAndViewByAttributes;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual(config);
    });

    it("should sanitized stacking config if afm has 1 measure and isComputeRatio", () => {
        const { definition } = fixtures.columnChartWithMeasureAndViewByAndComputeRatio;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual({
            stackMeasures: false,
            stackMeasuresToPercent: false,
        });
    });
});
