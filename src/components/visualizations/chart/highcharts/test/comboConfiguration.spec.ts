// (C) 2019 GoodData Corporation
import { getDefaultChartType } from "../comboConfiguration";
import { VisualizationTypes } from "../../../../../constants/visualizationTypes";

describe("Combo Configuration", () => {
    const { COLUMN, LINE, AREA } = VisualizationTypes;

    describe("getDefaultChartType", () => {
        it.each([COLUMN, LINE, AREA])("should return '%s' when both y axes have same chart type", type => {
            const config = {
                primaryChartType: type,
                secondaryChartType: type,
            };

            expect(getDefaultChartType(config)).toEqual(type);
        });

        it.each([[COLUMN, LINE], [COLUMN, AREA], [LINE, COLUMN], [AREA, COLUMN]])(
            "should return 'column' if primaryChartType=%s and secondaryChartType=%s",
            (primaryChartType, secondaryChartType) => {
                const config = {
                    primaryChartType,
                    secondaryChartType,
                };

                expect(getDefaultChartType(config)).toEqual(COLUMN);
            },
        );

        it("should return 'line' when there is no column chart type", () => {
            const config = {
                primaryChartType: LINE,
                secondaryChartType: AREA,
            };

            expect(getDefaultChartType(config)).toEqual(LINE);
        });
    });
});
