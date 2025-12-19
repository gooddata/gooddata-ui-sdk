// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type IColorPalette, type IColorPaletteItem } from "@gooddata/sdk-model";
import { DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import { getRgbString } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { type IColorMapping } from "../../../../interfaces/index.js";
import { TwoColorPalette } from "../../_chartColoring/test/color.fixture.js";
import { getColorsFromStrategy } from "../../_chartColoring/test/helper.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { getMVS } from "../../_util/test/helper.js";
import { TreemapColorStrategy } from "../treemapColoring.js";

describe("TreemapColorStrategy", () => {
    it("should return TreemapColorStrategy strategy with two colors from default color palette", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.Treemap
                .SingleMeasureViewByAndSegment as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "treemap";
        const colorPalette: IColorPalette | undefined = undefined;

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            undefined,
            viewByAttribute,
            undefined,
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
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.Treemap
                .SingleMeasureViewByAndSegment as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "treemap";

        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Amount),
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
            undefined,
            stackByAttribute,
            dv,
            type,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
        expect(updatedPalette).toEqual(["rgb(100,100,100)"]);
    });
});
