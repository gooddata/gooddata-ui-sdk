// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IDashboardAttributeFilter, IDashboardFilterGroup } from "@gooddata/sdk-model";

import { groupFilterItems } from "../filterGroupUtils.js";
import type { FilterBarAttributeFilterIndexed } from "../useFiltersWithAddedPlaceholder.js";

describe("groupFilterItems", () => {
    it("Empty input with no config returns empty array", () => {
        const actualResult = groupFilterItems([]);
        expect(actualResult).toEqual([]);
    });
    it("Empty input with empty config returns empty array", () => {
        const actualResult = groupFilterItems([], { groups: [] });
        expect(actualResult).toEqual([]);
    });
    it("Empty input with config returns empty array", () => {
        const actualResult = groupFilterItems([], {
            groups: [GROUP_CONFIG_1, GROUP_CONFIG_2],
        });
        expect(actualResult).toEqual([]);
    });
    it("No config does not change input", () => {
        const actualResult = groupFilterItems(ATTRIBUTE_FILTER_ITEMS);
        expect(actualResult).toEqual(ATTRIBUTE_FILTER_ITEMS);
    });
    it("Empty config does not change input", () => {
        const actualResult = groupFilterItems(ATTRIBUTE_FILTER_ITEMS, { groups: [] });
        expect(actualResult).toEqual(ATTRIBUTE_FILTER_ITEMS);
    });
    it("Unrelated config does not change input", () => {
        const actualResult = groupFilterItems(ATTRIBUTE_FILTER_ITEMS, {
            groups: [UNRELATED_GROUP_CONFIG_1, UNRELATED_GROUP_CONFIG_2],
        });
        expect(actualResult).toEqual(ATTRIBUTE_FILTER_ITEMS);
    });
    it("Single group is grouped correctly", () => {
        const actualResult = groupFilterItems(ATTRIBUTE_FILTER_ITEMS, { groups: [GROUP_CONFIG_1] });
        expect(actualResult).toEqual([
            { filter: FILTER_1, filterIndex: 0 },
            {
                groupConfig: GROUP_CONFIG_1,
                filterIndex: 1,
                filters: [
                    { filter: FILTER_2, filterIndex: 0 },
                    { filter: FILTER_4, filterIndex: 1 },
                ],
            },
            { filter: FILTER_3, filterIndex: 2 },
            { filter: FILTER_5, filterIndex: 3 },
        ]);
    });
    it("Multiple groups are grouped correctly", () => {
        const actualResult = groupFilterItems(ATTRIBUTE_FILTER_ITEMS, {
            groups: [GROUP_CONFIG_1, GROUP_CONFIG_2],
        });
        expect(actualResult).toEqual([
            { filter: FILTER_1, filterIndex: 0 },
            {
                groupConfig: GROUP_CONFIG_1,
                filterIndex: 1,
                filters: [
                    { filter: FILTER_2, filterIndex: 0 },
                    { filter: FILTER_4, filterIndex: 1 },
                ],
            },
            {
                groupConfig: GROUP_CONFIG_2,
                filterIndex: 2,
                filters: [
                    { filter: FILTER_3, filterIndex: 0 },
                    { filter: FILTER_5, filterIndex: 1 },
                ],
            },
        ]);
    });
});

const UNRELATED_GROUP_CONFIG_1: IDashboardFilterGroup = {
    title: "Group 1",
    filters: [{ filterLocalIdentifier: "not-exists-1" }, { filterLocalIdentifier: "not-exists-2" }],
};

const UNRELATED_GROUP_CONFIG_2: IDashboardFilterGroup = {
    title: "Group 2",
    filters: [{ filterLocalIdentifier: "not-exists-3" }, { filterLocalIdentifier: "not-exists-4" }],
};

const GROUP_CONFIG_1: IDashboardFilterGroup = {
    title: "Group 1",
    filters: [{ filterLocalIdentifier: "222" }, { filterLocalIdentifier: "444" }],
};

const GROUP_CONFIG_2: IDashboardFilterGroup = {
    title: "Group 2",
    filters: [{ filterLocalIdentifier: "333" }, { filterLocalIdentifier: "555" }],
};

const FILTER_1: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute.one",
            type: "displayForm",
        },
        negativeSelection: false,
        attributeElements: { values: ["value1"] },
        localIdentifier: "111",
        title: "One",
        selectionMode: "multi",
    },
};

const FILTER_2: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute.two",
            type: "displayForm",
        },
        negativeSelection: false,
        attributeElements: { values: ["value2"] },
        localIdentifier: "222",
        title: "Two",
        selectionMode: "single",
    },
};

const FILTER_3: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute.three",
            type: "displayForm",
        },
        negativeSelection: true,
        attributeElements: { values: ["value3"] },
        localIdentifier: "333",
        title: "Three",
        selectionMode: "multi",
    },
};

const FILTER_4: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute.four",
            type: "displayForm",
        },
        negativeSelection: false,
        attributeElements: { values: ["value4"] },
        localIdentifier: "444",
        title: "Four",
        selectionMode: "single",
    },
};

const FILTER_5: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute.five",
            type: "displayForm",
        },
        negativeSelection: true,
        attributeElements: { values: ["value5"] },
        localIdentifier: "555",
        title: "Five",
        selectionMode: "multi",
    },
};

const ATTRIBUTE_FILTER_ITEMS: FilterBarAttributeFilterIndexed[] = [
    { filter: FILTER_1, filterIndex: 0 },
    { filter: FILTER_2, filterIndex: 1 },
    { filter: FILTER_3, filterIndex: 2 },
    { filter: FILTER_4, filterIndex: 3 },
    { filter: FILTER_5, filterIndex: 4 },
];
