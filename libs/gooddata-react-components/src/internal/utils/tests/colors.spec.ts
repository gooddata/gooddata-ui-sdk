// (C) 2019 GoodData Corporation
import { GuidType, IColorItem } from "@gooddata/gooddata-js";
import { getProperties, getColoredInputItems, getSearchedItems, getValidProperties } from "../colors";
import { IColorConfiguration, IColoredItem } from "../../interfaces/Colors";
import * as MappingHeader from "../../../interfaces/MappingHeader";
import * as ChartConfiguration from "../../../interfaces/Config";

describe("color utils", () => {
    const color1: IColorItem = {
        type: "guid",
        value: "guid1",
    };

    const attributeColorAssignments = [
        {
            headerItem: {
                attributeHeaderItem: {
                    uri: "/a/1",
                    name: "a1",
                },
            },
            color: color1,
        },
    ];

    const measureColorAssignments = [
        {
            headerItem: {
                measureHeaderItem: {
                    localIdentifier: "m1",
                    name: "m1",
                    format: "#00",
                },
            },
            color: color1,
        },
    ];

    describe("getValidProperties", () => {
        function getProperties(colorMapping: any) {
            return {
                controls: {
                    colorMapping,
                },
            };
        }

        it("should erase attribute color mapping if items not in references", () => {
            const properties = getProperties([
                {
                    id: "abc",
                    color: color1,
                },
            ]);

            const result = getValidProperties(properties, attributeColorAssignments);
            expect(result.controls.colorMapping).toEqual(null);
        });

        it("should erase measure color mapping if items are not in color assignment", () => {
            const colorMapping = [
                {
                    id: "abc",
                    color: color1,
                },
            ];
            const properties = getProperties(colorMapping);

            const result = getValidProperties(properties, measureColorAssignments);
            expect(result.controls.colorMapping).toEqual(null);
        });

        it("should keep measure color mapping for items which are in color assignment", () => {
            const colorMapping = [
                {
                    id: "m1",
                    color: color1,
                },
            ];

            const richColorMapping = [
                ...colorMapping,
                {
                    id: "m2",
                    color: color1,
                },
            ];

            const properties = getProperties(richColorMapping);

            const result = getValidProperties(properties, measureColorAssignments);
            expect(result.controls.colorMapping).toEqual(colorMapping);
        });
    });

    describe("getProperties", () => {
        function createIdColorMappingItemByGuid(id: string, guid: string) {
            return {
                id,
                color: {
                    type: "guid",
                    value: guid,
                },
            };
        }

        const guid = "guid4";
        const type: GuidType = "guid";
        const guidColor = {
            type,
            value: guid,
        };

        const attributeItem: MappingHeader.IMappingHeader = {
            attributeHeaderItem: {
                uri: "/a1",
                identifier: "",
                localIdentifier: "",
                name: "",
                formOf: null,
            },
        };

        it("should assign measure item to properties", () => {
            const measureItem: MappingHeader.IMappingHeader = {
                measureHeaderItem: {
                    localIdentifier: "m1",
                    name: "measure1",
                    format: "",
                },
            };

            const properties = {
                controls: {
                    colorMapping: [
                        createIdColorMappingItemByGuid("m1", "guid1"),
                        createIdColorMappingItemByGuid("m2", "guid2"),
                    ],
                },
            };

            const result = getProperties(properties, measureItem, guidColor);

            expect(result).toEqual({
                controls: {
                    colorMapping: [
                        createIdColorMappingItemByGuid("m1", guid),
                        createIdColorMappingItemByGuid("m2", "guid2"),
                    ],
                },
            });
        });

        it("should assign attribute header item to properties", () => {
            const properties = {
                controls: {
                    colorMapping: [createIdColorMappingItemByGuid("m1", "guid1")],
                },
            };

            const result = getProperties(properties, attributeItem, guidColor);

            expect(result).toEqual({
                controls: {
                    colorMapping: [
                        createIdColorMappingItemByGuid("/a1", guid),
                        createIdColorMappingItemByGuid("m1", "guid1"),
                    ],
                },
            });
        });
    });

    describe("getColoredInputItems", () => {
        it("should return input items with valid mapping", () => {
            const colors: IColorConfiguration = {
                colorPalette: ChartConfiguration.DEFAULT_COLOR_PALETTE,
                colorAssignments: [
                    {
                        headerItem: { attributeHeaderItem: { uri: "/ahi1", name: "abc" } },
                        color: {
                            type: "guid",
                            value: "4",
                        },
                    },
                    {
                        headerItem: { attributeHeaderItem: { uri: "/ahi2", name: "def" } },
                        color: {
                            type: "guid",
                            value: "5",
                        },
                    },
                ],
            };

            const inputItems = getColoredInputItems(colors);
            const expectedItems: IColoredItem[] = [
                {
                    color: {
                        r: 241,
                        g: 134,
                        b: 0,
                    },
                    colorItem: {
                        type: "guid",
                        value: "4",
                    },
                    mappingHeader: {
                        attributeHeaderItem: { uri: "/ahi1", name: "abc" },
                    },
                },
                {
                    color: {
                        r: 171,
                        g: 85,
                        b: 163,
                    },
                    colorItem: {
                        type: "guid",
                        value: "5",
                    },
                    mappingHeader: {
                        attributeHeaderItem: { uri: "/ahi2", name: "def" },
                    },
                },
            ];

            expect(inputItems).toEqual(expectedItems);
        });

        it("should return input items with valid mapping from custom color", () => {
            const colors: IColorConfiguration = {
                colorPalette: ChartConfiguration.DEFAULT_COLOR_PALETTE,
                colorAssignments: [
                    {
                        headerItem: { attributeHeaderItem: { uri: "/ahi1", name: "abc" } },
                        color: {
                            type: "rgb",
                            value: {
                                r: 255,
                                g: 0,
                                b: 0,
                            },
                        },
                    },
                    {
                        headerItem: { attributeHeaderItem: { uri: "/ahi2", name: "def" } },
                        color: {
                            type: "rgb",
                            value: {
                                r: 0,
                                g: 255,
                                b: 0,
                            },
                        },
                    },
                ],
            };

            const inputItems = getColoredInputItems(colors);
            const expectedItems: IColoredItem[] = [
                {
                    color: {
                        r: 255,
                        g: 0,
                        b: 0,
                    },
                    colorItem: {
                        type: "rgb",
                        value: {
                            r: 255,
                            g: 0,
                            b: 0,
                        },
                    },
                    mappingHeader: {
                        attributeHeaderItem: { uri: "/ahi1", name: "abc" },
                    },
                },
                {
                    color: {
                        r: 0,
                        g: 255,
                        b: 0,
                    },
                    colorItem: {
                        type: "rgb",
                        value: {
                            r: 0,
                            g: 255,
                            b: 0,
                        },
                    },
                    mappingHeader: {
                        attributeHeaderItem: { uri: "/ahi2", name: "def" },
                    },
                },
            ];

            expect(inputItems).toEqual(expectedItems);
        });

        it("should return item with mapping of first color when mapping is invalid", () => {
            const colors: IColorConfiguration = {
                colorPalette: ChartConfiguration.DEFAULT_COLOR_PALETTE,
                colorAssignments: [
                    {
                        headerItem: { attributeHeaderItem: { uri: "/ahi1", name: "abc" } },
                        color: {
                            type: "guid",
                            value: "invalid guid",
                        },
                    },
                ],
            };

            const inputItems = getColoredInputItems(colors);
            const expectedItems = [
                {
                    color: {
                        r: 20,
                        g: 178,
                        b: 226,
                    },
                    colorItem: {
                        type: "guid",
                        value: "invalid guid",
                    },
                    mappingHeader: {
                        attributeHeaderItem: { uri: "/ahi1", name: "abc" },
                    },
                },
            ];

            expect(inputItems).toEqual(expectedItems);
        });
    });

    describe("getSearchedItems", () => {
        const colorItems: IColoredItem[] = [
            {
                color: {
                    r: 241,
                    g: 134,
                    b: 0,
                },
                colorItem: {
                    type: "guid",
                    value: "4",
                },
                mappingHeader: {
                    attributeHeaderItem: { uri: "/ahi1", name: "abc" },
                },
            },
            {
                color: {
                    r: 171,
                    g: 85,
                    b: 163,
                },
                colorItem: {
                    type: "guid",
                    value: "5",
                },
                mappingHeader: {
                    measureHeaderItem: { localIdentifier: "id1", name: "abd", format: "format1" },
                },
            },
        ];

        it("should return two items with same prefix by name", () => {
            const searchedItems = getSearchedItems(colorItems, "ab");
            expect(searchedItems).toEqual(colorItems);
        });

        it("should return one item with attribute mapping header by name", () => {
            const searchedItems = getSearchedItems(colorItems, "abc");
            expect(searchedItems[0]).toEqual(colorItems[0]);
        });

        it("should return one item with measure mapping header by name", () => {
            const searchedItems = getSearchedItems(colorItems, "abd");
            expect(searchedItems[0]).toEqual(colorItems[1]);
        });

        it("should return empty array when no matching color item is found", () => {
            const searchedItems = getSearchedItems(colorItems, "zzz");
            expect(searchedItems).toEqual([]);
        });

        it("should return all input items when called with empty string", () => {
            const searchedItems = getSearchedItems(colorItems, "");
            expect(searchedItems).toEqual(colorItems);
        });
    });
});
