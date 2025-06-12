// (C) 2007-2020 GoodData Corporation
import { IChartConfig } from "../../../interfaces/index.js";
import { getSanitizedStackingConfig, sanitizeConfig } from "../sanitizeStacking.js";
import { IMeasure, newMeasure } from "@gooddata/sdk-model";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

const [M1, M2]: IMeasure[] = ["m1", "m2"].map((name: string) => {
    return newMeasure(name, (m) => m.localId(name));
});

function createMeasureWithRatio(name: string): IMeasure {
    return newMeasure(name, (m) => m.localId(name).ratio());
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
        const { definition } = recordedDataView(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy);
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual(config);
    });

    it("should keep stacking config if afm has one measure and no stackBy", () => {
        const { definition } = recordedDataView(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy,
        );
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
        const { definition } = recordedDataView(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
        );
        const config: IChartConfig = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        const newConfig: IChartConfig = getSanitizedStackingConfig(definition, config);
        expect(newConfig).toEqual(config);
    });

    it("should sanitized stacking config if afm has 1 measure and isComputeRatio", () => {
        const { definition } = recordedDataView(
            ReferenceRecordings.Scenarios.ColumnChart.SingleRatioMeasureWithViewBy,
        );
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
