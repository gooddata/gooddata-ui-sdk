// (C) 2020-2022 GoodData Corporation

import {
    defWithDimensions,
    defWithSorting,
    defWithPostProcessing,
    emptyDef,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    newAttributeLocator,
    newAttributeSort,
    newDimension,
    newMeasureSort,
    IPostProcessing,
} from "@gooddata/sdk-model";
import { convertDimensions } from "../DimensionsConverter";

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
        const defWithSorts = defWithSorting(def, [newAttributeSort("localId1")]);

        expect(convertDimensions(defWithSorts)).toMatchSnapshot();
    });

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts without attribute locators",
        (_desc, def) => {
            const defWithSorts = defWithSorting(def, [newMeasureSort("testMeasure")]);

            expect(convertDimensions(defWithSorts)).toMatchSnapshot();
        },
    );

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts with attribute locators",
        (_desc, def) => {
            const measureSort = newMeasureSort("testMeasure", "desc", [
                newAttributeLocator("localId1", "PrimaryLabelValue"),
            ]);
            const defWithSorts = defWithSorting(def, [measureSort]);

            expect(convertDimensions(defWithSorts)).toMatchSnapshot();
        },
    );

    it.each(Scenarios)(
        "should correctly convert %s with measure sorts with attribute locators that contain element URIs",
        (_desc, def) => {
            const measureSort = newMeasureSort("testMeasure", "desc", [
                newAttributeLocator("localId1", "/obj/666/elements?id=PrimaryLabelValue"),
            ]);
            const defWithSorts = defWithSorting(def, [measureSort]);

            expect(convertDimensions(defWithSorts)).toMatchSnapshot();
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
