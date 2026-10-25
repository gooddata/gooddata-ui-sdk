// (C) 2019-2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogGroup,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { getCatalogAttribute, getCatalogMeasure } from "../../../tests/catalog.test.helpers.js";
import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../../typings/catalog.js";
import { type ICacheItemDisplayForm } from "../../../typings/state_objects.js";
import { mockIntlProp } from "../../../utils/with_intl.js";

import { useGroups } from "./GroupHook.js";

const intl = mockIntlProp();

const geoPinDisplayForm: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    uri: "/gdc/locationDf/uri/1",
    id: "location.id1",
    ref: uriRef("/gdc/locationDf/uri/1"),
    production: true,
    deprecated: false,
    unlisted: false,
    title: "Location",
    description: "Location",
    attribute: uriRef("/gdc/attribute/1"),
    displayFormType: "GDC.geo.pin",
    isDefault: false,
    isPrimary: false,
};

const geoLatitudeDisplayForm: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    uri: "/gdc/locationDf/uri/2",
    id: "location.id2",
    ref: uriRef("/gdc/locationDf/uri/2"),
    production: true,
    deprecated: false,
    unlisted: false,
    title: "Latitude",
    description: "Latitude",
    attribute: uriRef("/gdc/attribute/1"),
    displayFormType: "GDC.geo.pin_latitude",
    isDefault: false,
    isPrimary: false,
};

const geoLongitudeDisplayForm: IAttributeDisplayFormMetadataObject = {
    type: "displayForm",
    uri: "/gdc/locationDf/uri/3",
    id: "location.id3",
    ref: uriRef("/gdc/locationDf/uri/3"),
    production: true,
    deprecated: false,
    unlisted: false,
    title: "Longitude",
    description: "Longitude",
    attribute: uriRef("/gdc/attribute/1"),
    displayFormType: "GDC.geo.pin_longitude",
    isDefault: false,
    isPrimary: false,
};

describe("useGroups", () => {
    const items: ReadonlyArray<CatalogItem> = [
        { ...getCatalogAttribute(1), groups: [], displayForms: [geoPinDisplayForm] },
        { ...getCatalogMeasure(2), groups: [{ identifier: "col" }] },
        { ...getCatalogMeasure(3), groups: [{ identifier: "exp" }] },
        { ...getCatalogMeasure(4), groups: [{ identifier: "col" }, { identifier: "exp" }] },
        {
            ...getCatalogAttribute(5),
            groups: [],
            displayForms: [geoLatitudeDisplayForm, geoLongitudeDisplayForm],
        },
    ];

    const getOrganizedCatalogMeasure = (
        index: number,
        locationDisplayFormUri?: string,
        available = true,
        hiddenFromKda?: boolean,
    ): IOrganizedCatalogItem => ({
        ref: {
            identifier: `measure${index}.identifier`,
        },
        identifier: `measure${index}.identifier`,
        title: `measure ${index}`,
        uri: `uri/measure${index}`,
        type: "metric",
        available,
        hiddenFromKda,
        ...(locationDisplayFormUri && { locationDisplayFormUri }),
    });

    const getOrganizedCatalogAttribute = (
        index: number,
        displayForms: ICacheItemDisplayForm[] = undefined,
        available = true,
    ): IOrganizedCatalogItem => ({
        ref: {
            identifier: `attribute${index}.identifier`,
        },
        identifier: `attribute${index}.identifier`,
        title: `attribute ${index}`,
        uri: `uri/attribute${index}`,
        type: "attribute",
        dfUri: `uri/displayForm${index}`,
        dfRef: idRef(`displayForm${index}.identifier`),
        dfIdentifier: `displayForm${index}.identifier`,
        ...(available && { available }),
        ...(displayForms ? { displayForms } : {}),
    });

    const allItems: ReadonlyArray<CatalogItem> = [
        ...items,
        { ...getCatalogMeasure(5), groups: [{ identifier: "col" }] },
    ];

    const groups: ReadonlyArray<ICatalogGroup> = [
        {
            title: "Collapsed group",
            tag: {
                identifier: "col",
            },
        },
        {
            title: "Expanded group",
            tag: {
                identifier: "exp",
            },
        },
        {
            title: "A very long group that needs to be shortened",
            tag: {
                identifier: "long",
            },
        },
    ];

    const organizedDf1 = {
        uri: "/gdc/locationDf/uri/1",
        id: "location.id1",
        ref: uriRef("/gdc/locationDf/uri/1"),
        title: "Location",
        type: "GDC.geo.pin",
        isDefault: false,
        isPrimary: false,
    };

    const organizedDf2 = {
        uri: "/gdc/locationDf/uri/2",
        id: "location.id2",
        ref: uriRef("/gdc/locationDf/uri/2"),
        title: "Latitude",
        type: "GDC.geo.pin_latitude",
        isDefault: false,
        isPrimary: false,
    };
    const organizedDf3 = {
        uri: "/gdc/locationDf/uri/3",
        id: "location.id3",
        ref: uriRef("/gdc/locationDf/uri/3"),
        title: "Longitude",
        type: "GDC.geo.pin_longitude",
        isDefault: false,
        isPrimary: false,
    };

    const flatItems: IOrganizedCatalogItem[] = [
        getOrganizedCatalogAttribute(1, [organizedDf1]),
        getOrganizedCatalogMeasure(2),
        getOrganizedCatalogMeasure(3),
        getOrganizedCatalogMeasure(4),
        getOrganizedCatalogAttribute(5, [organizedDf2, organizedDf3]),
    ];

    const allFlatItems: IOrganizedCatalogItem[] = [...flatItems, getOrganizedCatalogMeasure(5, null, false)];

    const itemGroups: IOrganizedCatalogGroup[] = [
        {
            id: "col",
            tag: {
                identifier: "col",
            },
            isExpanded: false,
            items: [getOrganizedCatalogMeasure(2), getOrganizedCatalogMeasure(4)],
            name: "Collapsed group",
        },
        {
            id: "exp",
            tag: {
                identifier: "exp",
            },
            isExpanded: false,
            items: [getOrganizedCatalogMeasure(3), getOrganizedCatalogMeasure(4)],
            name: "Expanded group",
        },
        {
            id: "long",
            tag: {
                identifier: "long",
            },
            isExpanded: false,
            items: [],
            name: "A very long group that needs to be shortened",
        },
    ];

    const ungroupedItemGroup: IOrganizedCatalogGroup = {
        id: "ungrouped",
        tag: {
            identifier: "ungrouped",
        },
        isExpanded: false,
        items: [
            getOrganizedCatalogAttribute(1, [organizedDf1]),
            getOrganizedCatalogAttribute(5, [organizedDf2, organizedDf3]),
        ],
        name: "Ungrouped",
    };

    const itemsWithoutGroups: CatalogItem[] = [
        {
            ...getCatalogMeasure(1),
            groups: [],
        },
        {
            ...getCatalogMeasure(2),
            groups: [],
        },
    ];

    const EMPTY_SEARCH_QUERY = "";

    it("should have all groups having items in state", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        const expectedItemGroups = [itemGroups[0], itemGroups[1], ungroupedItemGroup];
        expect(result.current.itemGroups.length).toEqual(expectedItemGroups.length);
    });

    it("should have all groups collapsed by default if default expand state is set to false", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        expect(result.current.itemGroups.every((group) => group.isExpanded === false)).toEqual(true);
    });

    it("should have all groups expanded by default if default expand state is set to true", () => {
        const { result } = renderHook(() =>
            useGroups(groups, true, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        expect(result.current.itemGroups.every((group) => group.isExpanded === true)).toEqual(true);
    });

    it("should expand and collapse group", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);
        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);
    });

    it("should collapse expanded group when search query is applied", () => {
        let searchQuery = "";
        const { result, rerender } = renderHook(() =>
            useGroups(groups, false, items, allItems, searchQuery, false, false, undefined, intl),
        );
        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);

        searchQuery = "a";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);
    });

    it("should collapse expanded group when search query is extended", () => {
        let searchQuery = "";
        const { result, rerender } = renderHook(() =>
            useGroups(groups, false, items, allItems, searchQuery, false, false, undefined, intl),
        );
        searchQuery = "ab";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);

        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);

        searchQuery = "abc";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);
    });

    it("should collapse expanded group when search query is reduced", () => {
        let searchQuery = "";
        const { result, rerender } = renderHook(() =>
            useGroups(groups, false, items, allItems, searchQuery, false, false, undefined, intl),
        );
        searchQuery = "ab";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);

        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);

        searchQuery = "a";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);
    });

    it("should expand group collapsed by search when search query is removed", () => {
        let searchQuery = "";
        const { result, rerender } = renderHook(() =>
            useGroups(groups, false, items, allItems, searchQuery, false, false, undefined, intl),
        );
        act(() => result.current.onGroupClick("col"));
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);
        expect(result.current.itemGroups[1].isExpanded).toEqual(false);

        searchQuery = "a";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(false);
        expect(result.current.itemGroups[1].isExpanded).toEqual(false);

        searchQuery = "";
        rerender();
        expect(result.current.itemGroups[0].isExpanded).toEqual(true);
        expect(result.current.itemGroups[1].isExpanded).toEqual(false);
    });

    it("should enable location icon for location attribute", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, "", false, true, "location", intl),
        );
        expect(result.current.itemGroups[2].items[0].isLocationIconVisible).toEqual(true);
        expect(result.current.flatItems[0].isLocationIconVisible).toEqual(true);
        expect(result.current.allFlatItems[0].isLocationIconVisible).toEqual(true);
    });

    it("should enable location icon for lat/long attributes", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, "", false, true, "location", intl),
        );
        expect(result.current.itemGroups[2].items[1].isLocationIconVisible).toEqual(true);
        expect(result.current.flatItems[4].isLocationIconVisible).toEqual(true);
        expect(result.current.allFlatItems[4].isLocationIconVisible).toEqual(true);
    });

    it("should disable location icon", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, "", false, false, undefined, intl),
        );
        expect(result.current.itemGroups[2].items[0].isLocationIconVisible).toEqual(undefined);
        expect(result.current.flatItems[0].isLocationIconVisible).toEqual(undefined);
        expect(result.current.allFlatItems[0].isLocationIconVisible).toEqual(undefined);
    });

    it("should set isHiddenInKda for measures", () => {
        const emptyGroups: ReadonlyArray<ICatalogGroup> = [];
        const measuresWithHidden: CatalogItem[] = [
            {
                ...getCatalogMeasure(1),
                measure: {
                    ...getCatalogMeasure(1).measure,
                    isHiddenFromKda: true,
                },
            },
        ];
        const { result } = renderHook(() =>
            useGroups(
                emptyGroups,
                false,
                measuresWithHidden,
                measuresWithHidden,
                "",
                false,
                false,
                undefined,
                intl,
            ),
        );
        expect(result.current.flatItems[0].hiddenFromKda).toEqual(true);
    });

    it("should return flat items arrays from provided items", () => {
        const emptyGroups: ReadonlyArray<ICatalogGroup> = [];
        const { result } = renderHook(() =>
            useGroups(emptyGroups, false, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        expect(result.current.flatItems).toEqual(flatItems);
        expect(result.current.allFlatItems).toEqual(allFlatItems);
    });

    it("should create itemGroups with items", () => {
        const { result } = renderHook(() =>
            useGroups(groups, false, items, allItems, EMPTY_SEARCH_QUERY, false, false, undefined, intl),
        );
        const expectedItemGroups = [itemGroups[0], itemGroups[1], ungroupedItemGroup];
        expect(result.current.itemGroups).toEqual(expectedItemGroups);
    });

    it("should not create ungrouped group if there are no other groups", () => {
        const emptyGroups: ReadonlyArray<ICatalogGroup> = [];
        const { result } = renderHook(() =>
            useGroups(
                emptyGroups,
                false,
                itemsWithoutGroups,
                allItems,
                EMPTY_SEARCH_QUERY,
                false,
                false,
                undefined,
                intl,
            ),
        );

        expect(result.current.itemGroups.length).toEqual(0);
    });

    it("should not hide groups when items are still being loaded", () => {
        const { result } = renderHook(() =>
            useGroups(
                groups,
                false,
                itemsWithoutGroups,
                allItems,
                EMPTY_SEARCH_QUERY,
                true,
                false,
                undefined,
                intl,
            ),
        );

        expect(result.current.itemGroups.length).toEqual(4);
    });
});
