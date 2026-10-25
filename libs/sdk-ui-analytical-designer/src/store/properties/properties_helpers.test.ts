// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { newAttributeSort } from "@gooddata/sdk-model";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { type IVisualizationPropertiesControls } from "../../typings/properties.js";

import {
    getMergedProperties,
    getReplacedProperties,
    joinControls,
    removeInvalidControls,
} from "./properties_helpers.js";

describe("getMergedProperties", () => {
    it("should return only new properties if previous controls are not set", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
        };

        const newProperties: IVisualizationProperties = {
            controls: {
                foo: "bar",
            },
        };

        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                foo: "bar",
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("should return merged controls", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                foo: {
                    valueA: "bar",
                    valueB: "xyz",
                },
            },
        };

        const newProperties: IVisualizationProperties = {
            controls: {
                foo: {
                    valueA: "abc",
                },
            },
        };

        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                foo: {
                    valueA: "abc",
                    valueB: "xyz",
                },
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("should return correct columns widths with new locators", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const newProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 200,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id2",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 200,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id2",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("should return correct columns widths with new column width definition", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const newProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 200,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        measureColumnWidthItem: {
                            width: 400,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id2",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 200,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        measureColumnWidthItem: {
                            width: 400,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id2",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("should return correct columns widths when columnWidths are empty", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };
        const newProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [],
            },
        };
        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [],
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("should return correct properties when controls has more than one prop", () => {
        const currentProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
                foo: {
                    valueA: "bar",
                    valueB: "xyz",
                },
            },
        };
        const newProperties: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 500,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id1",
                                    },
                                },
                            ],
                        },
                    },
                ],
                foo: {
                    valueA: "abc",
                },
            },
        };
        const expectedResult: IVisualizationProperties = {
            sortItems: [],
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 500,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id1",
                                    },
                                },
                            ],
                        },
                    },
                ],
                foo: {
                    valueA: "abc",
                    valueB: "xyz",
                },
            },
        };

        expect(getMergedProperties(currentProperties, newProperties)).toEqual(expectedResult);
    });

    it("drops the controls key entirely when the merge result is empty", () => {
        const result = getMergedProperties({ sortItems: [], controls: {} }, { controls: {} });

        expect(result).toEqual({ sortItems: [] });
    });

    it("keeps keys of the current properties the new properties do not mention", () => {
        const result = getMergedProperties(
            { sortItems: [newAttributeSort("a1")], other: "kept" },
            {
                controls: { foo: "bar" },
            },
        );

        expect(result).toEqual({
            sortItems: [newAttributeSort("a1")],
            other: "kept",
            controls: { foo: "bar" },
        });
    });
});

describe("joinControls", () => {
    it("should merge new properties to empty previous properities with supported property", () => {
        const currentProperties: IVisualizationProperties = {
            xaxis: {
                rotation: "20",
            },
        };

        expect(joinControls(currentProperties, {})).toEqual(currentProperties);
    });

    it("should merge property if it's array", () => {
        const previousProperties: IVisualizationProperties = {
            xaxis: {
                rotation: [1, 2, 3],
            },
        };

        const currentProperties: IVisualizationProperties = {
            xaxis: {
                rotation: [1, 2, 3, 4, 5, 6],
            },
        };

        expect(joinControls(currentProperties, previousProperties)).toEqual(previousProperties);
    });

    it("should merge properties if new value is object", () => {
        const previousProperties: IVisualizationProperties = {
            xaxis: {
                rotation: {
                    foo: "bar",
                    abc: "def",
                },
            },
        };

        const currentProperties: IVisualizationProperties = {
            xaxis: {
                rotation: {
                    abc: "xyz",
                },
            },
        };

        expect(joinControls(previousProperties, currentProperties)).toEqual(currentProperties);
    });

    it("should set new property if previous is undefined and current is object", () => {
        const previousProperties: IVisualizationProperties = {
            xaxis: {
                rotation: undefined,
            },
        };

        const currentProperties: IVisualizationProperties = {
            xaxis: {
                rotation: {
                    abc: "xyz",
                },
            },
        };

        expect(joinControls(previousProperties, currentProperties)).toEqual(currentProperties);
    });

    it("should delete property if current is undefined", () => {
        const previousProperties: IVisualizationProperties = {
            xaxis: {
                rotation: {
                    abc: "xyz",
                },
            },
        };

        const currentProperties: IVisualizationProperties = {
            xaxis: {
                rotation: undefined,
            },
        };

        const expectedResult: IVisualizationProperties = {
            xaxis: {
                rotation: undefined,
            },
        };

        // toStrictEqual: the key stays PRESENT with an undefined value (shallow-merge semantics) —
        // toEqual could not tell that from an absent key
        expect(joinControls(previousProperties, currentProperties)).toStrictEqual(expectedResult);
    });

    it("should merge optional stacking properties", () => {
        const previousProperties: IVisualizationProperties = {
            stackMeasures: true,
            stackMeasuresToPercent: false,
        };
        const currentProperties: IVisualizationProperties = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };

        expect(joinControls(previousProperties, currentProperties)).toEqual(currentProperties);
    });

    it("should replace columnWidths", () => {
        const previousProperties: IVisualizationProperties = {
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 500,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id1",
                                },
                            },
                        ],
                    },
                },
            ],
        };
        const currentProperties: IVisualizationProperties = {
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 1000,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id1",
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(joinControls(previousProperties, currentProperties)).toEqual(currentProperties);
    });

    it("should replace columnWidths and replace other controls", () => {
        const previousProperties: IVisualizationProperties = {
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 500,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id1",
                                },
                            },
                        ],
                    },
                },
            ],
            xaxis: {
                rotation: {
                    foo: "bar",
                    abc: "def",
                },
            },
        };
        const currentProperties: IVisualizationProperties = {
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 1000,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id1",
                                },
                            },
                        ],
                    },
                },
            ],
            xaxis: {
                rotation: {
                    abc: "def",
                },
            },
        };

        expect(joinControls(previousProperties, currentProperties)).toEqual(currentProperties);
    });
});

/** The colorMapping removal-entry semantics. */
describe("joinControls — colorMapping removal-entry semantics", () => {
    const stored = () => ({
        colorMapping: [
            { id: "a", color: { type: "guid", value: "1" } },
            { id: "b", color: { type: "guid", value: "2" } },
        ],
    });

    it("an entry with null color removes the stored entry with the same id", () => {
        const result = joinControls(stored(), { colorMapping: [{ id: "a", color: null }] });

        expect(result).toEqual({
            colorMapping: [{ id: "b", color: { type: "guid", value: "2" } }],
        });
    });

    it("a removal entry whose id is not stored is dropped, not stored", () => {
        const result = joinControls(stored(), { colorMapping: [{ id: "zzz", color: null }] });

        expect(result).toEqual({
            colorMapping: [
                { id: "a", color: { type: "guid", value: "1" } },
                { id: "b", color: { type: "guid", value: "2" } },
            ],
        });
    });

    it("a new entry with a stored id replaces the stored entry in place", () => {
        const result = joinControls(stored(), {
            colorMapping: [{ id: "a", color: { type: "guid", value: "9" } }],
        });

        expect(result).toEqual({
            colorMapping: [
                { id: "a", color: { type: "guid", value: "9" } },
                { id: "b", color: { type: "guid", value: "2" } },
            ],
        });
    });

    it("a new entry with an unknown id is appended", () => {
        const result = joinControls(stored(), {
            colorMapping: [{ id: "c", color: { type: "guid", value: "3" } }],
        });

        expect(result).toEqual({
            colorMapping: [
                { id: "a", color: { type: "guid", value: "1" } },
                { id: "b", color: { type: "guid", value: "2" } },
                { id: "c", color: { type: "guid", value: "3" } },
            ],
        });
    });

    it("a list emptied by removals drops the whole key", () => {
        const result = joinControls(stored(), {
            colorMapping: [
                { id: "a", color: null },
                { id: "b", color: null },
            ],
        });

        expect(result).toEqual({});
    });

    it("undefined over a stored list drops the key", () => {
        const result = joinControls(stored(), { colorMapping: undefined });

        expect(result).toEqual({});
    });

    it("null over a stored list keeps the stored list", () => {
        const result = joinControls(stored(), { colorMapping: null });

        expect(result).toEqual({
            colorMapping: [
                { id: "a", color: { type: "guid", value: "1" } },
                { id: "b", color: { type: "guid", value: "2" } },
            ],
        });
    });

    it("primitive list items merge by identity, not id", () => {
        const result = joinControls({ list: ["x", "y"] }, { list: ["y", "z"] });

        expect(result).toEqual({ list: ["x", "y", "z"] });
    });

    it("removal entries in a list the state does not have yet are not stored", () => {
        const result = joinControls(
            {},
            {
                colorMapping: [
                    { id: "a", color: null },
                    { id: "b", color: { type: "guid", value: "2" } },
                ],
            },
        );

        expect(result).toEqual({
            colorMapping: [{ id: "b", color: { type: "guid", value: "2" } }],
        });
    });

    it("a new-only list consisting solely of removal entries drops the key", () => {
        const result = joinControls({}, { colorMapping: [{ id: "a", color: null }] });

        expect(result).toEqual({});
    });

    it("a new-only list that is empty from the start stays an empty list", () => {
        const result = joinControls({}, { colorMapping: [] });

        expect(result).toEqual({ colorMapping: [] });
    });
});

/**
 * The replace-not-merge keys: they are ALWAYS replaced, never deleted, even when the replacement is
 * empty.
 */
describe("joinControls — replace-not-merge keys", () => {
    it("stores an EMPTY thresholdMeasures list", () => {
        const result = joinControls({ thresholdMeasures: ["m1"] }, { thresholdMeasures: [] });

        expect(result).toEqual({ thresholdMeasures: [] });
    });

    it("replaces thresholdMeasures instead of merging", () => {
        const result = joinControls({ thresholdMeasures: ["m1", "m2"] }, { thresholdMeasures: ["m3"] });

        expect(result).toEqual({ thresholdMeasures: ["m3"] });
    });

    it("stores an EMPTY disableKeyDriveAnalysisOn map", () => {
        const result = joinControls(
            { disableKeyDriveAnalysisOn: { m1: "x" } },
            { disableKeyDriveAnalysisOn: {} },
        );

        expect(result).toEqual({ disableKeyDriveAnalysisOn: {} });
    });

    it("replaces disableKeyDriveAnalysisOn instead of merging", () => {
        const result = joinControls(
            { disableKeyDriveAnalysisOn: { m1: "x" } },
            { disableKeyDriveAnalysisOn: { m2: "y" } },
        );

        expect(result).toEqual({ disableKeyDriveAnalysisOn: { m2: "y" } });
    });
});

describe("removeInvalidControls", () => {
    it("should return only not null items", () => {
        // off-domain input: controls is a record everywhere at runtime, but the array
        // tolerance of the value filter is pinned here
        const controls = [null, undefined, "foo"] as unknown as IVisualizationPropertiesControls;

        expect(removeInvalidControls(controls)).toEqual(["foo"]);
    });

    it("should return only not null items with columnWidths", () => {
        const newControls: IVisualizationPropertiesControls = {
            prop: null,
            foo: "1",
            list: ["test"],
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 100,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id",
                                },
                            },
                        ],
                    },
                },
            ],
            boo: undefined,
        };
        const expextedControls: IVisualizationPropertiesControls = {
            foo: "1",
            list: ["test"],
            columnWidths: [
                {
                    measureColumnWidthItem: {
                        width: 100,
                        locators: [
                            {
                                attributeLocatorItem: {
                                    attributeIdentifier: "id",
                                },
                            },
                        ],
                    },
                },
            ],
        };
        expect(removeInvalidControls(newControls)).toEqual(expextedControls);
    });
});

describe("getReplacedProperties", () => {
    it("should return only not null controls", () => {
        const newProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                foo: "bar",
            },
            another: null,
            foo: "bar",
        };

        const expectedProperties: IVisualizationProperties = {
            controls: {
                foo: "bar",
            },
            foo: "bar",
        };

        expect(getReplacedProperties({}, newProperties)).toEqual(expectedProperties);
    });

    it("should return correct properties with columnsWidths", () => {
        const newProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            another: null,
            foo: "bar",
        };
        const expectedProperties: IVisualizationProperties = {
            controls: {
                columnWidths: [
                    {
                        measureColumnWidthItem: {
                            width: 100,
                            locators: [
                                {
                                    attributeLocatorItem: {
                                        attributeIdentifier: "id",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            foo: "bar",
        };
        expect(getReplacedProperties({}, newProperties)).toEqual(expectedProperties);
    });

    it("should return correct properties with empty columnsWidths", () => {
        const newProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                columnWidths: [],
            },
            another: null,
            foo: "bar",
        };
        const expectedProperties: IVisualizationProperties = {
            controls: {
                columnWidths: [],
            },
            foo: "bar",
        };
        expect(getReplacedProperties({}, newProperties)).toEqual(expectedProperties);
    });

    it("should return correct properties with currentProperties object", () => {
        const currentProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                columnWidths: [
                    {
                        width: 100,
                    },
                ],
            },
        };
        const newProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                columnWidths: [],
            },
            another: null,
            foo: "bar",
        };
        const expectedProperties: IVisualizationProperties = {
            controls: {
                columnWidths: [],
            },
            foo: "bar",
        };
        expect(getReplacedProperties(currentProperties, newProperties)).toEqual(expectedProperties);
    });

    it("should return correct properties with currentProperties and with columnWidths", () => {
        const currentProperties: IVisualizationProperties = {
            controls: {
                prop: null,
                columnWidths: [
                    {
                        width: 100,
                    },
                ],
            },
        };
        const newProperties: IVisualizationProperties = {
            controls: {
                prop: "1",
                columnWidths: [
                    {
                        width: 200,
                    },
                ],
            },
            another: null,
            foo: "bar",
        };
        const expectedProperties: IVisualizationProperties = {
            controls: {
                prop: "1",
                columnWidths: [
                    {
                        width: 200,
                    },
                ],
            },
            foo: "bar",
        };
        expect(getReplacedProperties(currentProperties, newProperties)).toEqual(expectedProperties);
    });
});
