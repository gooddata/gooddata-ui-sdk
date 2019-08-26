// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import {
    getComputeRatio,
    getSanitizedStackingConfigFromAfm,
    sanitizeConfig,
    sanitizeComputeRatioOnMeasures,
} from "../common";
import { measure } from "../../../helpers/model";
import { IChartConfig } from "../../../interfaces/Config";
import * as fixtures from "../../../../stories/test_data/fixtures";

const [M1, M2]: VisualizationObject.IMeasure[] = ["m1", "m2"].map((name: string) => {
    return measure(name).localIdentifier(name);
});

function createMeasureWithRatio(name: string): VisualizationObject.IMeasure {
    return measure(name)
        .localIdentifier(name)
        .ratio();
}

describe("sanitizeComputeRatioOnMeasures", () => {
    it("should return empty array when measures variable is null", () => {
        expect(sanitizeComputeRatioOnMeasures(null)).toEqual([]);
    });

    it("should keep measures as is if there is only one measure", () => {
        expect(sanitizeComputeRatioOnMeasures([M1])).toEqual([M1]);
    });

    it("should sanitized computeRatio if there are multiple measures", () => {
        const M2WithRatio = createMeasureWithRatio("m2");
        const sanitizedMeasures = sanitizeComputeRatioOnMeasures([M1, M2WithRatio]);
        const measuresWithComputeRatio = sanitizedMeasures.filter(getComputeRatio);

        expect(measuresWithComputeRatio.length).toEqual(0);
    });

    it("should disable computeRatio when forceDisableComputeRatio is true", () => {
        const M2WithRatio = createMeasureWithRatio("m2");
        const sanitizedMeasures = sanitizeComputeRatioOnMeasures([M2WithRatio], true);
        const measuresWithComputeRatio = sanitizedMeasures.filter(getComputeRatio);

        expect(measuresWithComputeRatio.length).toEqual(0);
    });
});

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
        const { afm } = fixtures.barChartWith3MetricsAndViewByAttribute.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfigFromAfm(afm, config);
        expect(newConfig).toEqual(config);
    });

    it("should keep stacking config if afm has one measure and no stackBy", () => {
        const { afm } = fixtures.barChartWithViewByAttribute.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfigFromAfm(afm, config);
        expect(newConfig).toEqual({
            stackMeasures: true,
            stackMeasuresToPercent: true,
        });
    });

    it("should sanitized stacking config if afm has one measure and one stackBy", () => {
        const { afm } = fixtures.barChartWithStackByAndViewByAttributes.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfigFromAfm(afm, config);
        expect(newConfig).toEqual(config);
    });

    it("should sanitized stacking config if afm has 1 measure and isComputeRatio", () => {
        const { afm } = fixtures.columnChartWithMeasureViewByAndComputeRatio.executionRequest;
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfigFromAfm(afm, config);
        expect(newConfig).toEqual({
            stackMeasures: false,
            stackMeasuresToPercent: false,
        });
    });
});
