// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import { IChartConfig } from "../../../../base/interfaces/Config";
import { getComboConfiguration, getDefaultChartType } from "../comboConfiguration";
import { VisualizationTypes } from "../../../../base/constants/visualizationTypes";
import { MEASURES, SECONDARY_MEASURES } from "../../../../base/constants/bucketNames";
import { defForBuckets } from "@gooddata/sdk-backend-spi";
import { newBucket } from "@gooddata/sdk-model";

describe("Combo Configuration", () => {
    const { COLUMN, LINE, AREA } = VisualizationTypes;
    function getDefinition(bucketId: string) {
        return defForBuckets("test", [
            newBucket(
                bucketId,
                {
                    measure: {
                        localIdentifier: "m1",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "",
                                },
                            },
                        },
                    },
                },
                {
                    measure: {
                        localIdentifier: "m2",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "",
                                },
                            },
                        },
                    },
                },
            ),
        ]);
    }

    describe("getDefaultChartType", () => {
        it.each([COLUMN, LINE, AREA])("should return '%s' when both y axes have same chart type", type => {
            const config: IChartConfig = {
                primaryChartType: type,
                secondaryChartType: type,
            };

            expect(getDefaultChartType(config)).toEqual(type);
        });

        it.each([[COLUMN, LINE], [COLUMN, AREA], [LINE, COLUMN], [AREA, COLUMN]])(
            "should return 'column' if primaryChartType=%s and secondaryChartType=%s",
            (primaryChartType, secondaryChartType) => {
                const config: IChartConfig = {
                    primaryChartType,
                    secondaryChartType,
                };

                expect(getDefaultChartType(config)).toEqual(COLUMN);
            },
        );

        it("should return 'line' when there is no column chart type", () => {
            const config: IChartConfig = {
                primaryChartType: LINE,
                secondaryChartType: AREA,
            };

            expect(getDefaultChartType(config)).toEqual(LINE);
        });
    });

    it("should disable saturation on other series in combo which has line series on both axes", () => {
        const config: IChartConfig = {
            primaryChartType: LINE,
            secondaryChartType: LINE,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config);
        expect(series.states.inactive.opacity).toBe(1);
    });

    it("should disable saturation on other series in combo which have line series on left axis only", () => {
        const config: IChartConfig = {
            primaryChartType: LINE,
            secondaryChartType: COLUMN,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config, getDefinition(MEASURES));
        expect(series.states.inactive.opacity).toBe(1);
    });

    it("should disable saturation on other series in combo which have line series on right axis only", () => {
        const config: IChartConfig = {
            primaryChartType: COLUMN,
            secondaryChartType: LINE,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config, getDefinition(SECONDARY_MEASURES));
        expect(series.states.inactive.opacity).toBe(1);
    });

    it("should not disable saturation other series for another kind of combo", () => {
        const config: IChartConfig = {
            primaryChartType: LINE,
            secondaryChartType: AREA,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config, getDefinition(SECONDARY_MEASURES));
        expect(get(series, "states.inactive.opacity")).not.toBe(1);
    });

    it("should not disable saturation other series for default combo", () => {
        const {
            plotOptions: { series: series },
        } = getComboConfiguration({}, getDefinition(MEASURES));
        expect(get(series, "states.inactive.opacity")).not.toBe(1);
    });
});
