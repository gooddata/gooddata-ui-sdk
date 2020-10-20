// (C) 2020 GoodData Corporation

import { getMVS } from "../../../_to_refactor/test/helper";
import { IColorPalette, IColorPaletteItem } from "@gooddata/sdk-model";
import { ColorFactory } from "../../../_to_refactor/colorFactory";
import { TreemapColorStrategy } from "../treemapColoring";
import { DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import { getRgbString } from "@gooddata/sdk-ui-vis-commons";
import { IColorMapping } from "../../../../interfaces";
import { getColorsFromStrategy } from "../../_common/colorStrategies/test/helper";
import { TwoColorPalette } from "../../_common/colorStrategies/test/color.fixture";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";

describe("TreemapColorStrategy", () => {
    it("should return TreemapColorStrategy strategy with two colors from default color palette", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Treemap.SingleMeasureViewByAndSegment);
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "treemap";
        const colorPalette: IColorPalette = undefined;

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            undefined,
            viewByAttribute,
            stackByAttribute,
            dv,
            type,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
        expect(updatedPalette).toEqual(
            DefaultColorPalette.slice(0, 1).map((defaultColorPaletteItem: IColorPaletteItem) =>
                getRgbString(defaultColorPaletteItem),
            ),
        );
    });

    it("should return TreemapColorStrategy with properly applied mapping", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Treemap.SingleMeasureViewByAndSegment);
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "treemap";

        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                color: {
                    type: "guid",
                    value: "02",
                },
            },
        ];

        const colorStrategy = ColorFactory.getColorStrategy(
            TwoColorPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
            type,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
        expect(updatedPalette).toEqual(["rgb(100,100,100)"]);
    });
});
