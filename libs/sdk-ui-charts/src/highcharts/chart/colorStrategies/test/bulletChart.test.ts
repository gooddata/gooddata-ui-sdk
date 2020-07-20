// (C) 2020 GoodData Corporation
import range from "lodash/range";
import { ColorFactory } from "../../colorFactory";
import { IColorPalette, IMeasure } from "@gooddata/sdk-model";
import { CUSTOM_COLOR_PALETTE } from "../../test/colorPalette.fixture";
import { DataViewFacade, HeaderPredicates } from "@gooddata/sdk-ui";
import { IColorMapping } from "../../../../interfaces";
import { ReferenceLdm, ReferenceLdmExt, ReferenceRecordings } from "@gooddata/reference-workspace";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";

const defaultColorMapping: IColorMapping[] = [
    {
        predicate: () => false,
        color: {
            type: "rgb",
            value: {
                r: 255,
                g: 0,
                b: 0,
            },
        },
    },
];

const getBulletColorStrategy = (props: {
    palette?: IColorPalette;
    colorMapping?: IColorMapping[];
    dv: DataViewFacade;
}): IColorStrategy => {
    const { palette, colorMapping = defaultColorMapping, dv } = props;

    return ColorFactory.getColorStrategy(palette, colorMapping, undefined, undefined, dv, "bullet");
};

const PrimaryAndComparative = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndComparativeMeasures,
);
const PrimaryAndTarget = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndTargetMeasures,
);
const AllMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryTargetAndComparativeMeasures,
);

describe("BulletChartColorStrategy", () => {
    describe("colorPalette", () => {
        it.each([
            [undefined, PrimaryAndComparative, ["rgb(20,178,226)", "rgb(217,220,226)"]],
            [undefined, PrimaryAndTarget, ["rgb(20,178,226)", "rgb(14,125,158)"]],
            [CUSTOM_COLOR_PALETTE, AllMeasures, ["rgb(195,49,73)", "rgb(137,34,51)", "rgb(217,220,226)"]],
        ])(
            "should create palette",
            (palette: IColorPalette, dv: DataViewFacade, expectedColors: string[]) => {
                const colorStrategy = getBulletColorStrategy({
                    palette,
                    dv,
                });

                range(expectedColors.length).map((itemIndex) => {
                    expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColors[itemIndex]);
                });
            },
        );
    });

    describe("colorMapping", () => {
        const getRedColorMappingForMeasure = (measure: IMeasure): IColorMapping => ({
            predicate: HeaderPredicates.localIdentifierMatch(measure),
            color: {
                type: "rgb",
                value: {
                    r: 255,
                    g: 0,
                    b: 0,
                },
            },
        });

        it.each([
            [
                [getRedColorMappingForMeasure(ReferenceLdm.Won)],
                ["rgb(255,0,0)", "rgb(14,125,158)", "rgb(217,220,226)"],
            ],
            [
                [getRedColorMappingForMeasure(ReferenceLdm.Amount)],
                ["rgb(20,178,226)", "rgb(255,0,0)", "rgb(217,220,226)"],
            ],
            [
                [getRedColorMappingForMeasure(ReferenceLdmExt.CalculatedLost)],
                ["rgb(20,178,226)", "rgb(14,125,158)", "rgb(255,0,0)"],
            ],
        ])("should map colors", (colorMapping: IColorMapping[], expectedColors: string[]) => {
            const colorStrategy = getBulletColorStrategy({ dv: AllMeasures, colorMapping });

            range(expectedColors.length).map((itemIndex) => {
                expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColors[itemIndex]);
            });
        });
    });
});
