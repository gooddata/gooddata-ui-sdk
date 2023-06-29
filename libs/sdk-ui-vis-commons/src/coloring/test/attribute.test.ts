// (C) 2020 GoodData Corporation

import { IColorPaletteItem, RgbType, IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade, DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import { AttributeColorStrategy } from "../attribute.js";
import { getRgbString } from "../color.js";
import { ReferenceData, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../__mocks__/recordings.js";
import { getColorsFromStrategy } from "./helper.js";
import { IColorMapping } from "../types.js";
import { describe, it, expect } from "vitest";

const RgbPalette: IColorPalette = [
    {
        guid: "red",
        fill: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    {
        guid: "green",
        fill: {
            r: 0,
            g: 255,
            b: 0,
        },
    },
    {
        guid: "blue",
        fill: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
];

function getAttributeDescriptors(dv: DataViewFacade) {
    const descriptors = dv.meta().attributeDescriptors();
    const headers = dv.meta().attributeHeaders();

    return {
        viewByAttribute: {
            ...descriptors[1].attributeHeader,
            items: headers[1][0],
        },
        stackByAttribute: {
            ...descriptors[0].attributeHeader,
            items: headers[0][0],
        },
    };
}

describe("AttributeColorStrategy", () => {
    it("should return AttributeColorStrategy with two colors from default color palette", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
        );
        const { viewByAttribute, stackByAttribute } = getAttributeDescriptors(dv);

        const colorStrategy = new AttributeColorStrategy(
            DefaultColorPalette,
            undefined as any,
            viewByAttribute,
            stackByAttribute,
            dv,
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
        const { viewByAttribute, stackByAttribute } = getAttributeDescriptors(dv);

        const colorStrategy = new AttributeColorStrategy(
            RgbPalette,
            undefined as any,
            viewByAttribute,
            stackByAttribute,
            dv,
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
        const { viewByAttribute, stackByAttribute } = getAttributeDescriptors(dv);
        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.attributeItemNameMatch(ReferenceData.Region.EastCoast.title),
                color: {
                    type: "guid",
                    value: "blue",
                },
            },
            {
                predicate: HeaderPredicates.attributeItemNameMatch("invalid"),
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

        const colorStrategy = new AttributeColorStrategy(
            RgbPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(["rgb(0,0,255)", "rgb(0,0,1)"]);
    });
});
