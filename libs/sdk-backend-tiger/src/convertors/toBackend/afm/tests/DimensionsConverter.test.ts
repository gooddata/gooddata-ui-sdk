// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    IExecutionDefinition,
    IPostProcessing,
    MeasureGroupIdentifier,
    defWithDimensions,
    defWithPostProcessing,
    defWithSorting,
    emptyDef,
    newAttributeLocator,
    newAttributeSort,
    newDimension,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { Matcher, suppressConsole } from "@gooddata/util";

import { convertDimensions } from "../DimensionsConverter.js";

const SingleDimAttributes = defWithDimensions(emptyDef("test"), newDimension(["localId1", "localId2"]));
const SingleDimAttributesAndMeasure = defWithDimensions(
    emptyDef("test"),
    newDimension(["localId1", "localId2", MeasureGroupIdentifier]),
);
const SingleDimMeasure = defWithDimensions(emptyDef("test"), newDimension([MeasureGroupIdentifier]));
const TwoDimAttrAndMeasures = defWithDimensions(
    emptyDef("test"),
    newDimension(["localId1", "localId2"]),
    newDimension([MeasureGroupIdentifier]),
);
const TwoDimMeasuresAndAttr = defWithDimensions(
    emptyDef("test"),
    newDimension([MeasureGroupIdentifier]),
    newDimension(["localId1", "localId2"]),
);
const TwoDimAttrMeasuresAndAttr = defWithDimensions(
    emptyDef("test"),
    newDimension(["localId1", MeasureGroupIdentifier]),
    newDimension(["localId2"]),
);
const TwoDimAttrAndAttrMeasures = defWithDimensions(
    emptyDef("test"),
    newDimension(["localId2"]),
    newDimension(["localId1", MeasureGroupIdentifier]),
);

describe("convertDimensions", () => {
    const Scenarios: Array<[string, IExecutionDefinition]> = [
        ["single dim definition with just attributes", SingleDimAttributes],
        ["single dim definition with attributes and measure group", SingleDimAttributesAndMeasure],
        ["single dim definition with just measure group", SingleDimMeasure],
        ["two dim definition with attributes in first and measure group in second", TwoDimAttrAndMeasures],
        ["two dim definition with attributes in second and measure group in first", TwoDimMeasuresAndAttr],
        [
            "two dim definition with attributes+measure group in first and attributes in second",
            TwoDimAttrMeasuresAndAttr,
        ],
        [
            "two dim definition with attributes+measure group in second and attributes in first",
            TwoDimAttrAndAttrMeasures,
        ],
    ];

    it.each(Scenarios)("should correctly convert %s", (_desc, def) => {
        expect(convertDimensions(def)).toMatchSnapshot();
    });

    it.each(Scenarios)("should correctly convert %s with attribute sorts", (_desc, def) => {
        const id = "localId1";
        const defWithSorts = defWithSorting(def, [newAttributeSort(id)]);

        expect(
            suppressConsole(() => convertDimensions(defWithSorts), "log", [
                {
                    type: "exact",
                    value: `attempting to sort by attribute with localId ${id} but this attribute is not in any dimension.`,
                },
            ]),
        ).toMatchSnapshot();
    });

    const commonWarnOutput: Matcher[] = [
        {
            type: "exact",
            value: "Trying to use measure sort in an execution that does not contain MeasureGroup. Ignoring.",
        },
        {
            type: "exact",
            value: "Trying to use measure sort in an execution that only contains dimension with MeasureGroup. This is not valid sort. Measure sort is used to sort the non-measure dimension by values from measure dimension. Ignoring",
        },
    ];

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts without attribute locators",
        (_desc, def) => {
            const defWithSorts = defWithSorting(def, [newMeasureSort("testMeasure")]);

            expect(
                suppressConsole(() => convertDimensions(defWithSorts), "warn", commonWarnOutput),
            ).toMatchSnapshot();
        },
    );

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts with attribute locators",
        (_desc, def) => {
            const measureSort = newMeasureSort("testMeasure", "desc", [
                newAttributeLocator("localId1", "PrimaryLabelValue"),
            ]);
            const defWithSorts = defWithSorting(def, [measureSort]);

            expect(
                suppressConsole(() => convertDimensions(defWithSorts), "warn", commonWarnOutput),
            ).toMatchSnapshot();
        },
    );

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts with attribute locators that contain element URIs",
        (_desc, def) => {
            const measureSort = newMeasureSort("testMeasure", "desc", [
                newAttributeLocator("localId1", "/obj/666/elements?id=PrimaryLabelValue"),
            ]);
            const defWithSorts = defWithSorting(def, [measureSort]);

            expect(
                suppressConsole(() => convertDimensions(defWithSorts), "warn", commonWarnOutput),
            ).toMatchSnapshot();
        },
    );

    it.each(Scenarios)("should correctly convert %s with date formats", (_desc, def) => {
        const dateFormats = ["MM/dd/yyyy", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "M/d/yy", "dd.MM.yyyy"];
        dateFormats.forEach((dateFormat: string) => {
            const postProcessing: IPostProcessing = { dateFormat };
            const newDef = defWithPostProcessing(def, postProcessing);
            expect(newDef).not.toBe(def);
            expect(newDef.postProcessing?.dateFormat).toBe(dateFormat);
        });
    });
});
