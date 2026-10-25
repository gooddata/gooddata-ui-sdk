// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { type ISortItem } from "@gooddata/sdk-model";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { type IVisualizationPropertiesControls } from "../typings/properties.js";

import {
    areSameVisualizationProperties,
    getSortItemIdentifiers,
    getVisualizationPropertiesWithDefaultValues,
} from "./visualization_properties.js";

describe("visualization properties utils", () => {
    describe("getSortItemIdentifiers", () => {
        it("should extract identifier from attribute sort item", () => {
            const sortItem = {
                attributeSortItem: {
                    attributeIdentifier: "ident_a",
                    direction: "desc",
                },
            };

            expect(getSortItemIdentifiers(sortItem)).toEqual(["ident_a"]);
        });

        it("should extract measure identifier from measure sort item", () => {
            const sortItem = {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "ident_m",
                            },
                        },
                    ],
                },
            };

            expect(getSortItemIdentifiers(sortItem)).toEqual(["ident_m"]);
        });

        it("ignores a total locator (it carries no identifier the sort can be keyed on)", () => {
            // sdk-model's ILocatorItem union includes ITotalLocatorItem, for which
            // `measureLocatorItem?.measureIdentifier` is undefined
            const sortItem = {
                measureSortItem: {
                    direction: "desc",
                    locators: [{ totalLocatorItem: { attributeIdentifier: "a1", totalFunction: "sum" } }],
                },
            };

            expect(getSortItemIdentifiers(sortItem)).toEqual([undefined]);
        });

        it("should extract attribute identifier from measure sort item", () => {
            const sortItem = {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "ident_m",
                            },
                        },
                    ],
                },
            };

            expect(getSortItemIdentifiers(sortItem)).toEqual(["ident_m"]);
        });
    });

    describe("visualization properties comparison", () => {
        it("should add default values", () => {
            const defaultProperties: IVisualizationProperties = { controls: {}, sortItems: [] };
            expect(getVisualizationPropertiesWithDefaultValues(null)).toEqual(null);
            expect(getVisualizationPropertiesWithDefaultValues(undefined)).toEqual(undefined);
            expect(getVisualizationPropertiesWithDefaultValues({})).toEqual(defaultProperties);
            expect(getVisualizationPropertiesWithDefaultValues({ controls: {} })).toEqual(defaultProperties);
            expect(getVisualizationPropertiesWithDefaultValues({ sortItems: [] })).toEqual(defaultProperties);
        });

        it("should compare properties with default values", () => {
            const sortItems: ISortItem[] = [
                {
                    attributeSortItem: {
                        attributeIdentifier: "b3630449bc08433eabdff193459ead2b",
                        direction: "asc",
                    },
                },
            ];
            const controls: IVisualizationPropertiesControls = {
                columnWidths: [],
            };
            expect(areSameVisualizationProperties({ sortItems }, { sortItems, controls: {} })).toBe(true);
            expect(areSameVisualizationProperties({ controls }, { sortItems: [], controls })).toBe(true);
        });

        it("should compare the two provenances", () => {
            // the shape the saga and ReportVisualization actually compare: the extended reference
            // point's properties against the properties state family. They are two DIFFERENT
            // OBJECTS of the same shape, which is what the defaulted normalization is for
            const properties = {
                sortItems: [
                    { attributeSortItem: { attributeIdentifier: "a1", direction: "asc" } },
                ] as ISortItem[],
                controls: { legend: { position: "top" } },
            };

            expect(areSameVisualizationProperties(cloneDeep(properties), properties)).toBe(true);
            expect(
                areSameVisualizationProperties(cloneDeep(properties), {
                    ...properties,
                    controls: { legend: { position: "bottom" } },
                }),
            ).toBe(false);
        });

        it("should treat empty geo viewport navigation as missing", () => {
            const withoutNavigation = {
                controls: {
                    viewport: {
                        area: "world",
                    },
                },
            };
            const withEmptyNavigation = {
                controls: {
                    viewport: {
                        area: "world",
                        navigation: {},
                    },
                },
            };

            expect(areSameVisualizationProperties(withoutNavigation, withEmptyNavigation)).toBe(true);
        });

        it("should treat empty tags as missing", () => {
            expect(areSameVisualizationProperties({ tags: [] }, {})).toBe(true);
        });
    });
});
