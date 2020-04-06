// (C) 2020 GoodData Corporation

import { getMVS } from "../../test/helper";
import { IColorPalette, IColorPaletteItem, RgbType } from "@gooddata/sdk-model";
import { ColorFactory } from "../../colorFactory";
import { AttributeColorStrategy } from "../attribute";
import { DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import { getRgbString } from "../../../utils/color";
import { IColorMapping } from "../../../../interfaces";
import { IResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { ReferenceData, ReferenceRecordings } from "@gooddata/reference-workspace";
import { getColorsFromStrategy } from "./helper";
import { RgbPalette } from "./color.fixture";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";

describe("AttributeColorStrategy", () => {
    it("should return AttributeColorStrategy with two colors from default color palette", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "bar";
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

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(
            DefaultColorPalette.slice(0, 2).map((defaultColorPaletteItem: IColorPaletteItem) =>
                getRgbString(defaultColorPaletteItem),
            ),
        );
    });

    it("should return AttributeColorStrategy with two colors from custom color palette", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "bar";

        const colorStrategy = ColorFactory.getColorStrategy(
            RgbPalette,
            undefined,
            viewByAttribute,
            stackByAttribute,
            dv,
            type,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(
            RgbPalette.slice(0, 2).map((defaultColorPaletteItem: IColorPaletteItem) =>
                getRgbString(defaultColorPaletteItem),
            ),
        );
    });

    it("should return AttributeColorStrategy with properly applied mapping", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "bar";
        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.attributeItemNameMatch(ReferenceData.Region.EastCoast.title),
                color: {
                    type: "guid",
                    value: "blue",
                },
            },
            {
                predicate: (headerItem: IResultAttributeHeader) =>
                    headerItem.attributeHeaderItem && headerItem.attributeHeaderItem.uri === "invalid",
                color: {
                    type: "rgb" as RgbType,
                    value: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                },
            },
            {
                predicate: HeaderPredicates.uriMatch(ReferenceData.Region.WestCoast.uri),
                color: {
                    type: "rgb" as RgbType,
                    value: {
                        r: 0,
                        g: 0,
                        b: 1,
                    },
                },
            },
        ];

        const colorStrategy = ColorFactory.getColorStrategy(
            RgbPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
            type,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(["rgb(0,0,255)", "rgb(0,0,1)"]);
    });
});
