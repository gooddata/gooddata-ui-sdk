// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import { IChartConfig } from "../../../../../interfaces/Config";
import { getDefaultChartType, getComboConfiguration } from "../comboConfiguration";
import { VisualizationTypes } from "../../../../../constants/visualizationTypes";

describe("Combo Configuration", () => {
    const { COLUMN, LINE, AREA } = VisualizationTypes;

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

    it("should disable saturation on other line series in line_line combo chart?", () => {
        const config: IChartConfig = {
            primaryChartType: LINE,
            secondaryChartType: LINE,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config);
        expect(series.states.inactive.opacity).toBe(1);
    });

    it("should not disable saturation other series for another kind of combo", () => {
        const config: IChartConfig = {
            primaryChartType: LINE,
            secondaryChartType: AREA,
        };
        const {
            plotOptions: { series: series },
        } = getComboConfiguration(config);
        expect(get(series, "states.inactive.opacity")).not.toBe(1);
    });

    it("should not disable saturation other series for default combo", () => {
        const {
            plotOptions: { series: series },
        } = getComboConfiguration({});
        expect(get(series, "states.inactive.opacity")).not.toBe(1);
    });
});
