// (C) 2024-2025 GoodData Corporation

import { ExtendedDashboardWidget } from "src/model/index.js";
import { describe, expect, it } from "vitest";

import { IDashboardLayout } from "@gooddata/sdk-model";

import { NESTED_LAYOUT } from "./coordinates.mock.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../../types.js";
import {
    areItemsInSameSection,
    areLayoutPathsEqual,
    areSameCoordinates,
    areSectionLayoutPathsEqual,
    asLayoutItemPath,
    asSectionPath,
    findItem,
    findSection,
    findSections,
    getCommonPath,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    isItemInSection,
    serializeLayoutItemPath,
    serializeLayoutSectionPath,
    updateItem,
    updateItemIndex,
    updateSectionIndex,
} from "../coordinates.js";

describe("coordinates", () => {
    describe("areSameCoordinates", () => {
        it("should return false when one of the coordinates is undefined", () => {
            expect(areSameCoordinates(undefined, { sectionIndex: 1, itemIndex: 2 })).toBe(false);
        });

        it("should return true when both coordinates are the same", () => {
            expect(
                areSameCoordinates({ sectionIndex: 1, itemIndex: 2 }, { sectionIndex: 1, itemIndex: 2 }),
            ).toBe(true);
        });

        it("should return false when coordinates are different", () => {
            expect(
                areSameCoordinates({ sectionIndex: 1, itemIndex: 2 }, { sectionIndex: 1, itemIndex: 3 }),
            ).toBe(false);
        });
    });

    describe("areLayoutPathsEqual", () => {
        const layoutPath: ILayoutItemPath = [{ itemIndex: 0, sectionIndex: 1 }];
        it.each([
            [true, "both paths are object with same reference", layoutPath, layoutPath],
            [true, "both paths are undefined", undefined, undefined],
            [true, "both paths are empty", [], []],
            [false, "first path is undefined", layoutPath, undefined],
            [false, "second path is undefined", undefined, layoutPath],
            [false, "first path is empty", layoutPath, []],
            [false, "second path is empty", [], layoutPath],
            [
                false,
                "paths have different length",
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
                layoutPath,
            ],
            [
                false,
                "paths are different at depth 1",
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
            ],
            [
                false,
                "paths are different at depth 2",
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 1 },
                ],
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
            ],
            [
                true,
                "paths points to same item 1 level deep",
                [{ itemIndex: 0, sectionIndex: 1 }],
                [{ itemIndex: 0, sectionIndex: 1 }],
            ],
            [
                true,
                "paths points to same item 2 levels deep",
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
            ],
        ])(
            "should return %s when %s",
            (
                expectedResult: boolean,
                _description: string,
                path1: ILayoutItemPath | undefined,
                path2: ILayoutItemPath | undefined,
            ) => {
                expect(areLayoutPathsEqual(path1 as ILayoutItemPath, path2 as ILayoutItemPath)).toBe(
                    expectedResult,
                );
            },
        );
    });

    describe("areItemsInSameSection", () => {
        const layoutPath: ILayoutItemPath = [{ itemIndex: 0, sectionIndex: 1 }];
        it.each([
            [true, "both paths are object with same reference", layoutPath, layoutPath],
            [false, "both paths are undefined", undefined, undefined],
            [false, "both paths are empty", [], []],
            [false, "first path is undefined", layoutPath, undefined],
            [false, "second path is undefined", undefined, layoutPath],
            [false, "first path is empty", layoutPath, []],
            [false, "second path is empty", [], layoutPath],
            [
                false,
                "paths have different length",
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 0 },
                ],
                layoutPath,
            ],
            [
                false,
                "first path section is undefined",
                [{ itemIndex: 0, sectionIndex: undefined }],
                [{ itemIndex: 1, sectionIndex: 0 }],
            ],
            [
                false,
                "second path section is undefined",
                [{ itemIndex: 0, sectionIndex: 1 }],
                [{ itemIndex: 1, sectionIndex: undefined }],
            ],
            [
                false,
                "both paths sections are undefined",
                [{ itemIndex: 0, sectionIndex: undefined }],
                [{ itemIndex: 1, sectionIndex: undefined }],
            ],
            [
                false,
                "section differs at depth 1",
                [
                    { itemIndex: 0, sectionIndex: 0 },
                    { itemIndex: 0, sectionIndex: 0 },
                ],
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 0 },
                ],
            ],
            [
                false,
                "item differs at depth 1",
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 0 },
                ],
                [
                    { itemIndex: 0, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 0 },
                ],
            ],
            [
                false,
                "section differs at depth 2",
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 1 },
                ],
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 0 },
                ],
            ],
            [
                true,
                "sections are same in all levels, leaf item is the same",
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 1 },
                ],
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 1 },
                ],
            ],
            [
                true,
                "sections are same in all levels, leaf item differs",
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 1, sectionIndex: 1 },
                ],
                [
                    { itemIndex: 1, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 1 },
                ],
            ],
        ])(
            "should return %s when %s",
            (expectedResult: boolean, _description: string, path1: unknown, path2: unknown) => {
                expect(areItemsInSameSection(path1 as ILayoutItemPath, path2 as ILayoutItemPath)).toBe(
                    expectedResult,
                );
            },
        );
    });

    describe("serializeLayoutItemPath", () => {
        it("should serialize undefined path", () => {
            expect(serializeLayoutItemPath(undefined)).toBe("undefined");
        });

        it("should serialize empty path", () => {
            expect(serializeLayoutItemPath([])).toBe("undefined");
        });

        it("should serialize root path", () => {
            expect(serializeLayoutItemPath([{ itemIndex: 2, sectionIndex: 3 }])).toBe("3_2");
        });

        it("should serialize nested path", () => {
            expect(
                serializeLayoutItemPath([
                    { itemIndex: 2, sectionIndex: 3 },
                    { itemIndex: 6, sectionIndex: 1 },
                    { itemIndex: 0, sectionIndex: 4 },
                ]),
            ).toBe("3_2-1_6-4_0");
        });
    });

    describe("serializeLayoutSectionPath", () => {
        it("should serialize undefined path", () => {
            expect(serializeLayoutSectionPath(undefined)).toBe("undefined");
        });

        it("should serialize root section path (parent set to undefined)", () => {
            expect(
                serializeLayoutSectionPath({
                    parent: undefined,
                    sectionIndex: 1,
                }),
            ).toBe("1");
        });

        it("should serialize root section path (parent set to empty)", () => {
            expect(
                serializeLayoutSectionPath({
                    parent: [],
                    sectionIndex: 1,
                }),
            ).toBe("1");
        });

        it("should serialize section path 1 level deep", () => {
            expect(
                serializeLayoutSectionPath({ parent: [{ itemIndex: 2, sectionIndex: 3 }], sectionIndex: 4 }),
            ).toBe("3_2-4");
        });

        it("should serialize section path N levels deep", () => {
            expect(
                serializeLayoutSectionPath({
                    parent: [
                        { itemIndex: 2, sectionIndex: 3 },
                        { itemIndex: 6, sectionIndex: 1 },
                        { itemIndex: 0, sectionIndex: 4 },
                    ],
                    sectionIndex: 12,
                }),
            ).toBe("3_2-1_6-4_0-12");
        });
    });

    describe("areSectionLayoutPathsEqual", () => {
        const layoutPath: ILayoutSectionPath = {
            parent: [{ itemIndex: 0, sectionIndex: 1 }],
            sectionIndex: 12,
        };
        it.each([
            [true, "both paths are object with same reference", layoutPath, layoutPath],
            [true, "both paths are undefined", undefined, undefined],
            [
                true,
                "both parents are empty, section is the same",
                { parent: [], sectionIndex: 1 },
                { parent: [], sectionIndex: 1 },
            ],
            [
                true,
                "both parents are undefined, section is the same",
                { parent: undefined, sectionIndex: 1 },
                { parent: undefined, sectionIndex: 1 },
            ],
            [
                false,
                "both parents are undefined, section differ",
                { parent: [], sectionIndex: 0 },
                { parent: [], sectionIndex: 1 },
            ],
            [
                false,
                "both parents are undefined, section differ",
                { parent: undefined, sectionIndex: 0 },
                { parent: undefined, sectionIndex: 1 },
            ],
            [
                false,
                "first parent is undefined, sections are same",
                { parent: undefined, sectionIndex: 0 },
                { parent: layoutPath, sectionIndex: 0 },
            ],
            [
                false,
                "second parent is undefined, sections are same",
                { parent: layoutPath, sectionIndex: 0 },
                { parent: undefined, sectionIndex: 0 },
            ],
            [
                false,
                "first parent is empty, sections are same",
                { parent: [], sectionIndex: 0 },
                { parent: layoutPath, sectionIndex: 0 },
            ],
            [
                false,
                "second parent is empty, sections are same",
                { parent: layoutPath, sectionIndex: 0 },
                { parent: [], sectionIndex: 0 },
            ],
            [
                false,
                "parents have different length, sections are same",
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
                { parent: layoutPath, sectionIndex: 0 },
            ],
            [
                false,
                "parent is different at depth 1, sections are same",
                {
                    parent: [
                        { itemIndex: 1, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
            ],
            [
                false,
                "parent is different at depth 2, sections are same",
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 1 },
                    ],
                    sectionIndex: 0,
                },
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
            ],
            [
                true,
                "parent points to same item 1 level deep, sections are the same",
                { parent: [{ itemIndex: 0, sectionIndex: 1 }], sectionIndex: 0 },
                { parent: [{ itemIndex: 0, sectionIndex: 1 }], sectionIndex: 0 },
            ],
            [
                false,
                "parent points to same item 1 level deep, sections differ",
                { parent: [{ itemIndex: 0, sectionIndex: 1 }], sectionIndex: 1 },
                { parent: [{ itemIndex: 0, sectionIndex: 1 }], sectionIndex: 0 },
            ],
            [
                true,
                "parent points to same item 2 levels deep, sections are the same",
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
            ],
            [
                false,
                "parent points to same item 2 levels deep, sections differ",
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 1,
                },
                {
                    parent: [
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 1, sectionIndex: 0 },
                    ],
                    sectionIndex: 0,
                },
            ],
        ])(
            "should return %s when %s",
            (expectedResult: boolean, _description: string, path1: unknown, path2: unknown) => {
                expect(
                    areSectionLayoutPathsEqual(path1 as ILayoutSectionPath, path2 as ILayoutSectionPath),
                ).toBe(expectedResult);
            },
        );
    });

    describe("asLayoutItemPath", () => {
        it("should throw when provided section path is undefined", () => {
            expect(() => asLayoutItemPath(undefined as unknown as ILayoutSectionPath, 1)).toThrowError();
        });

        it("should create root item path from section path (parent set as undefined)", () => {
            expect(
                asLayoutItemPath(
                    {
                        parent: undefined,
                        sectionIndex: 1,
                    },
                    2,
                ),
            ).toStrictEqual([{ itemIndex: 2, sectionIndex: 1 }]);
        });

        it("should create root item path from section path (parent set as empty)", () => {
            expect(
                asLayoutItemPath(
                    {
                        parent: [],
                        sectionIndex: 1,
                    },
                    2,
                ),
            ).toStrictEqual([{ itemIndex: 2, sectionIndex: 1 }]);
        });

        it("should create nested item path from section path", () => {
            expect(
                asLayoutItemPath(
                    {
                        parent: [
                            { itemIndex: 2, sectionIndex: 1 },
                            { itemIndex: 3, sectionIndex: 2 },
                        ],
                        sectionIndex: 1,
                    },
                    8,
                ),
            ).toStrictEqual([
                { itemIndex: 2, sectionIndex: 1 },
                { itemIndex: 3, sectionIndex: 2 },
                { itemIndex: 8, sectionIndex: 1 },
            ]);
        });
    });

    describe("asSectionPath", () => {
        it("should throw when provided section path is undefined", () => {
            expect(() => asSectionPath(undefined as unknown as ILayoutItemPath)).toThrowError();
        });

        it("should create path to root item's section", () => {
            expect(asSectionPath([{ itemIndex: 2, sectionIndex: 1 }])).toStrictEqual({
                parent: undefined,
                sectionIndex: 1,
            });
        });

        it("should create path to nested item's section", () => {
            expect(
                asSectionPath([
                    { itemIndex: 2, sectionIndex: 1 },
                    { itemIndex: 3, sectionIndex: 2 },
                    { itemIndex: 8, sectionIndex: 1 },
                ]),
            ).toStrictEqual({
                parent: [
                    { itemIndex: 2, sectionIndex: 1 },
                    { itemIndex: 3, sectionIndex: 2 },
                ],
                sectionIndex: 1,
            });
        });
    });

    describe("getItemIndex", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => getItemIndex(undefined as unknown as ILayoutItemPath)).toThrowError();
        });

        it("should return index of the leaf item in the root path", () => {
            expect(getItemIndex([{ itemIndex: 2, sectionIndex: 1 }])).toBe(2);
        });

        it("should return index of the leaf item in the nested path", () => {
            expect(
                getItemIndex([
                    { itemIndex: 2, sectionIndex: 1 },
                    { itemIndex: 3, sectionIndex: 2 },
                ]),
            ).toBe(3);
        });
    });

    describe("getSectionIndex", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => getSectionIndex(undefined as unknown as ILayoutSectionPath)).toThrowError();
        });

        it("should return index of the leaf section in the root item path", () => {
            expect(getSectionIndex([{ itemIndex: 2, sectionIndex: 1 }])).toBe(1);
        });

        it("should return index of the leaf section in the nested item path", () => {
            expect(
                getSectionIndex([
                    { itemIndex: 8, sectionIndex: 1 },
                    { itemIndex: 3, sectionIndex: 2 },
                ]),
            ).toBe(2);
        });

        it("should return index of the leaf section in the root section path", () => {
            expect(getSectionIndex({ parent: undefined, sectionIndex: 9 })).toBe(9);
        });

        it("should return index of the leaf section in the nested section path", () => {
            expect(getSectionIndex({ parent: [{ itemIndex: 2, sectionIndex: 1 }], sectionIndex: 9 })).toBe(9);
        });
    });

    describe("updateItemIndex", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => updateItemIndex(undefined as unknown as ILayoutItemPath, 1)).toThrowError();
        });
        it("should throw when provided item path is empty", () => {
            expect(() => updateItemIndex([], 1)).toThrowError();
        });

        it("should update leaf item index of the root item", () => {
            expect(updateItemIndex([{ itemIndex: 8, sectionIndex: 1 }], 9)).toStrictEqual([
                { itemIndex: 9, sectionIndex: 1 },
            ]);
        });

        it("should update leaf item index of the nested item", () => {
            expect(
                updateItemIndex(
                    [
                        { itemIndex: 8, sectionIndex: 1 },
                        { itemIndex: 3, sectionIndex: 2 },
                    ],
                    9,
                ),
            ).toStrictEqual([
                { itemIndex: 8, sectionIndex: 1 },
                { itemIndex: 9, sectionIndex: 2 },
            ]);
        });
    });

    describe("updateSectionIndex", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => updateSectionIndex(undefined as unknown as ILayoutSectionPath, 1)).toThrowError();
        });

        it("should update section index of the root section", () => {
            expect(updateSectionIndex({ parent: undefined, sectionIndex: 1 }, 9)).toStrictEqual({
                parent: undefined,
                sectionIndex: 9,
            });
        });

        it("should update section index of the nested section", () => {
            expect(
                updateSectionIndex({ parent: [{ itemIndex: 8, sectionIndex: 1 }], sectionIndex: 7 }, 9),
            ).toStrictEqual({ parent: [{ itemIndex: 8, sectionIndex: 1 }], sectionIndex: 9 });
        });
    });

    describe("updateItem", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => updateItem(undefined as unknown as ILayoutItemPath, 1, 2)).toThrowError();
        });
        it("should throw when provided item path is empty", () => {
            expect(() => updateItem([], 1, 4)).toThrowError();
        });

        it("should update leaf item and section index of the root item", () => {
            expect(updateItem([{ itemIndex: 8, sectionIndex: 1 }], 9, 3)).toStrictEqual([
                { itemIndex: 3, sectionIndex: 9 },
            ]);
        });

        it("should update leaf item and section index of the nested item", () => {
            expect(
                updateItem(
                    [
                        { itemIndex: 8, sectionIndex: 1 },
                        { itemIndex: 3, sectionIndex: 2 },
                    ],
                    9,
                    7,
                ),
            ).toStrictEqual([
                { itemIndex: 8, sectionIndex: 1 },
                { itemIndex: 7, sectionIndex: 9 },
            ]);
        });
    });

    describe("isItemInSection", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() =>
                isItemInSection(undefined as unknown as ILayoutItemPath, {
                    parent: undefined,
                    sectionIndex: 1,
                }),
            ).toThrowError();
        });

        it("should throw when provided section path is undefined", () => {
            expect(() =>
                isItemInSection(
                    [{ itemIndex: 8, sectionIndex: 1 }],
                    undefined as unknown as ILayoutSectionPath,
                ),
            ).toThrowError();
        });

        it("should return true when root item is in the same root section", () => {
            expect(
                isItemInSection([{ itemIndex: 2, sectionIndex: 3 }], { parent: undefined, sectionIndex: 3 }),
            ).toBe(true);
        });

        it("should return false when root item is in the different root section", () => {
            expect(
                isItemInSection([{ itemIndex: 2, sectionIndex: 3 }], { parent: undefined, sectionIndex: 4 }),
            ).toBe(false);
        });

        it("should return true when root item is not in nested section", () => {
            expect(
                isItemInSection([{ itemIndex: 2, sectionIndex: 3 }], {
                    parent: [{ itemIndex: 2, sectionIndex: 3 }],
                    sectionIndex: 4,
                }),
            ).toBe(false);
        });

        it("should return true when nested item is in the same nested section", () => {
            expect(
                isItemInSection(
                    [
                        { itemIndex: 2, sectionIndex: 3 },
                        { itemIndex: 1, sectionIndex: 8 },
                    ],
                    { parent: [{ itemIndex: 2, sectionIndex: 3 }], sectionIndex: 8 },
                ),
            ).toBe(true);
        });

        it("should return false when nested item is in different nested section in the middle of path (sections have same indexes but item differs)", () => {
            expect(
                isItemInSection(
                    [
                        { itemIndex: 1, sectionIndex: 1 },
                        { itemIndex: 4, sectionIndex: 3 },
                        { itemIndex: 1, sectionIndex: 8 },
                    ],
                    {
                        parent: [
                            { itemIndex: 1, sectionIndex: 1 },
                            { itemIndex: 2, sectionIndex: 3 },
                        ],
                        sectionIndex: 8,
                    },
                ),
            ).toBe(false);
        });

        it("should return false when nested item is in the same root section but different nested section", () => {
            expect(
                isItemInSection(
                    [
                        { itemIndex: 2, sectionIndex: 3 },
                        { itemIndex: 1, sectionIndex: 8 },
                    ],
                    { parent: [{ itemIndex: 2, sectionIndex: 3 }], sectionIndex: 4 },
                ),
            ).toBe(false);
        });
    });

    describe("findItem", () => {
        it("should throw when provided item path is undefined", () => {
            expect(() => findItem(NESTED_LAYOUT, undefined as unknown as ILayoutItemPath)).toThrowError();
        });

        it("should throw when provided item path is empty", () => {
            expect(() => findItem(NESTED_LAYOUT, [])).toThrowError();
        });

        it("should throw when provided layout is undefined", () => {
            expect(() =>
                findItem(undefined as unknown as IDashboardLayout<ExtendedDashboardWidget>, [
                    { itemIndex: 2, sectionIndex: 3 },
                ]),
            ).toThrowError();
        });

        it("should throw when root item is not found in the layout (wrong item index)", () => {
            expect(() => findItem(NESTED_LAYOUT, [{ itemIndex: 3, sectionIndex: 0 }])).toThrowError();
        });

        it("should throw when root item is not found in the layout (wrong section index)", () => {
            expect(() => findItem(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 2 }])).toThrowError();
        });

        it("should throw when nested item is not found in the layout (wrong item index)", () => {
            expect(() =>
                findItem(NESTED_LAYOUT, [
                    { itemIndex: 1, sectionIndex: 0 },
                    { itemIndex: 2, sectionIndex: 0 },
                ]),
            ).toThrowError();
        });

        it("should throw when nested item is not found in the layout (wrong section index)", () => {
            expect(() =>
                findItem(NESTED_LAYOUT, [
                    { itemIndex: 1, sectionIndex: 0 },
                    { itemIndex: 0, sectionIndex: 3 },
                ]),
            ).toThrowError();
        });

        it("should find root item (insight1) in the layout", () => {
            expect(findItem(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 0 }])).toMatchSnapshot();
        });
        it("should find nested item (insight4) in the layout", () => {
            expect(
                findItem(NESTED_LAYOUT, [
                    { itemIndex: 1, sectionIndex: 0 },
                    { itemIndex: 0, sectionIndex: 1 },
                ]),
            ).toMatchSnapshot();
        });
    });

    describe("findSection", () => {
        it("should throw when provided section path is undefined", () => {
            expect(() =>
                findSection(NESTED_LAYOUT, undefined as unknown as ILayoutSectionPath),
            ).toThrowError();
        });

        describe("layout item path", () => {
            it("should throw when provided section path is empty", () => {
                expect(() => findSection(NESTED_LAYOUT, [])).toThrowError();
            });

            it("should throw when provided layout is undefined", () => {
                expect(() =>
                    findSection(undefined as unknown as IDashboardLayout<ExtendedDashboardWidget>, [
                        { itemIndex: 2, sectionIndex: 3 },
                    ]),
                ).toThrowError();
            });

            it("should throw when root section is not found in the layout", () => {
                expect(() => findSection(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 3 }])).toThrowError();
            });

            it("should throw when nested section is not found in the layout", () => {
                expect(() =>
                    findSection(NESTED_LAYOUT, [
                        { itemIndex: 1, sectionIndex: 0 },
                        { itemIndex: 3, sectionIndex: 3 },
                    ]),
                ).toThrowError();
            });

            it("should find root section (section 1) in the layout", () => {
                expect(findSection(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 0 }])).toMatchSnapshot();
            });
            it("should find nested section (section 4) in the layout", () => {
                expect(
                    findSection(NESTED_LAYOUT, [
                        { itemIndex: 1, sectionIndex: 0 },
                        { itemIndex: 0, sectionIndex: 1 },
                    ]),
                ).toMatchSnapshot();
            });
        });

        describe("layout section path", () => {
            it("should throw when root section is not found in the layout", () => {
                expect(() =>
                    findSection(NESTED_LAYOUT, { parent: undefined, sectionIndex: 2 }),
                ).toThrowError();
            });

            it("should throw when nested section is not found in the layout (wrong section index)", () => {
                expect(() =>
                    findSection(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 1, sectionIndex: 0 }],
                        sectionIndex: 2,
                    }),
                ).toThrowError();
            });

            it("should throw when nested section is not found in the layout (nesting points at non existing item)", () => {
                expect(() =>
                    findSection(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 3, sectionIndex: 0 }],
                        sectionIndex: 0,
                    }),
                ).toThrowError();
            });

            it("should throw when nested section is not found in the layout (nesting points at non layout item)", () => {
                expect(() =>
                    findSection(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 0, sectionIndex: 0 }],
                        sectionIndex: 0,
                    }),
                ).toThrowError();
            });

            it("should find root section (section 1) in the layout", () => {
                expect(findSection(NESTED_LAYOUT, { parent: undefined, sectionIndex: 0 })).toMatchSnapshot();
            });
            it("should find nested section (section 4) in the layout", () => {
                expect(
                    findSection(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 1, sectionIndex: 0 }],
                        sectionIndex: 1,
                    }),
                ).toMatchSnapshot();
            });
        });
    });

    describe("findSections", () => {
        it("should throw when provided section path is undefined", () => {
            expect(() =>
                findSections(NESTED_LAYOUT, undefined as unknown as ILayoutSectionPath),
            ).toThrowError();
        });

        describe("layout item path", () => {
            it("should throw when provided section path is empty", () => {
                expect(() => findSections(NESTED_LAYOUT, [])).toThrowError();
            });

            it("should throw when provided layout is undefined", () => {
                expect(() =>
                    findSections(undefined as unknown as IDashboardLayout<ExtendedDashboardWidget>, [
                        { itemIndex: 2, sectionIndex: 3 },
                    ]),
                ).toThrowError();
            });

            it("should throw when root section is not found in the layout", () => {
                expect(() => findSections(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 3 }])).toThrowError();
            });

            it("should throw when nested section is not found in the layout", () => {
                expect(() =>
                    findSections(NESTED_LAYOUT, [
                        { itemIndex: 1, sectionIndex: 0 },
                        { itemIndex: 3, sectionIndex: 3 },
                    ]),
                ).toThrowError();
            });

            it("should find root sections (section 1 and 2) in the layout", () => {
                expect(findSections(NESTED_LAYOUT, [{ itemIndex: 0, sectionIndex: 0 }])).toMatchSnapshot();
            });
            it("should find nested sections (section 3 and 4) in the layout", () => {
                expect(
                    findSections(NESTED_LAYOUT, [
                        { itemIndex: 1, sectionIndex: 0 },
                        { itemIndex: 0, sectionIndex: 1 },
                    ]),
                ).toMatchSnapshot();
            });
        });

        describe("layout section path", () => {
            it("should return root sections if there's no parent set and leaf section does not exist", () => {
                expect(findSections(NESTED_LAYOUT, { parent: undefined, sectionIndex: 2 })).toMatchSnapshot();
            });

            it("should return nested sections event when leaf section does not exist", () => {
                expect(
                    findSections(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 1, sectionIndex: 0 }],
                        sectionIndex: 2,
                    }),
                ).toMatchSnapshot();
            });

            it("should throw when nested section is not found in the layout (nesting points at non existing item)", () => {
                expect(() =>
                    findSections(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 3, sectionIndex: 0 }],
                        sectionIndex: 0,
                    }),
                ).toThrowError();
            });

            it("should throw when nested section is not found in the layout (nesting points at non layout item)", () => {
                expect(() =>
                    findSections(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 0, sectionIndex: 0 }],
                        sectionIndex: 0,
                    }),
                ).toThrowError();
            });

            it("should find root section (section 1 and 2) in the layout", () => {
                expect(findSections(NESTED_LAYOUT, { parent: undefined, sectionIndex: 0 })).toMatchSnapshot();
            });
            it("should find nested section (section 3 and 4) in the layout", () => {
                expect(
                    findSections(NESTED_LAYOUT, {
                        parent: [{ itemIndex: 1, sectionIndex: 0 }],
                        sectionIndex: 1,
                    }),
                ).toMatchSnapshot();
            });
        });
    });

    describe("getParentPath", () => {
        describe("item path", () => {
            it("should return undefined when section or item path is undefined", () => {
                expect(getParentPath(undefined)).toBeUndefined();
            });

            it("should return undefined when item has no parent", () => {
                expect(getParentPath([{ itemIndex: 0, sectionIndex: 1 }])).toBeUndefined();
            });

            it("should return path to the parent when item has just one parent", () => {
                expect(
                    getParentPath([
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 2, sectionIndex: 8 },
                    ]),
                ).toStrictEqual([{ itemIndex: 0, sectionIndex: 1 }]);
            });

            it("should return path to the immediate parent when item is nested in multiple parents", () => {
                expect(
                    getParentPath([
                        { itemIndex: 4, sectionIndex: 5 },
                        { itemIndex: 0, sectionIndex: 1 },
                        { itemIndex: 2, sectionIndex: 8 },
                    ]),
                ).toStrictEqual([
                    { itemIndex: 4, sectionIndex: 5 },
                    { itemIndex: 0, sectionIndex: 1 },
                ]);
            });
        });

        describe("section path", () => {
            it("should return undefined when section has no parent", () => {
                expect(getParentPath({ parent: undefined, sectionIndex: 2 })).toBeUndefined();
            });

            it("should return path to the parent when section has just one parent", () => {
                expect(
                    getParentPath({ parent: [{ itemIndex: 0, sectionIndex: 1 }], sectionIndex: 2 }),
                ).toStrictEqual([{ itemIndex: 0, sectionIndex: 1 }]);
            });

            it("should return path to the immediate parent when section is nested in multiple parents", () => {
                expect(
                    getParentPath({
                        parent: [
                            { itemIndex: 4, sectionIndex: 5 },
                            { itemIndex: 0, sectionIndex: 1 },
                        ],
                        sectionIndex: 2,
                    }),
                ).toStrictEqual([
                    { itemIndex: 4, sectionIndex: 5 },
                    { itemIndex: 0, sectionIndex: 1 },
                ]);
            });
        });
    });

    describe("getCommonPath", () => {
        it("should return empty array when paths are empty", () => {
            expect(getCommonPath([], [])).toStrictEqual([]);
        });

        it("should return empty array when paths are not related", () => {
            expect(
                getCommonPath([{ sectionIndex: 1, itemIndex: 0 }], [{ sectionIndex: 3, itemIndex: 2 }]),
            ).toStrictEqual([]);
        });

        it("should return common path when paths are related", () => {
            expect(
                getCommonPath(
                    [
                        { sectionIndex: 0, itemIndex: 0 },
                        { sectionIndex: 0, itemIndex: 0 },
                    ],
                    [
                        { sectionIndex: 0, itemIndex: 0 },
                        { sectionIndex: 1, itemIndex: 0 },
                    ],
                ),
            ).toStrictEqual([{ sectionIndex: 0, itemIndex: 0 }]);
        });

        it("should return common path when paths are related and longer", () => {
            const fromPath = [
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 0 },
            ];
            const toPath = [
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 0 },
            ];
            expect(getCommonPath(fromPath, toPath)).toStrictEqual(fromPath);
        });

        it("should return common path when paths are different in the middle", () => {
            const fromPath = [
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 1 },
                { sectionIndex: 0, itemIndex: 0 },
            ];
            const toPath = [
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 0 },
                { sectionIndex: 0, itemIndex: 0 },
            ];
            expect(getCommonPath(fromPath, toPath)).toStrictEqual([{ sectionIndex: 0, itemIndex: 0 }]);
        });
    });
});
