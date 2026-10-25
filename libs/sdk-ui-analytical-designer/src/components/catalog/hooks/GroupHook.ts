// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { isEmpty, omitBy, sortBy } from "lodash-es";
import { type IntlShape } from "react-intl";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogGroup,
    type ICatalogMeasure,
    type IMetadataObject,
    type ObjRef,
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
    isCatalogComputedAttribute,
    isCatalogFact,
    isCatalogMeasure,
    objRefToString,
} from "@gooddata/sdk-model";

import { type GeoLabelType } from "../../../constants/geo.js";
import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../../typings/catalog.js";
import { type ICacheItemDisplayForm } from "../../../typings/state_objects.js";
import {
    displayFormToCacheDisplayForm,
    getPreferredAreaDisplayForm,
    getPreferredLocationDisplayForm,
} from "../../../utils/displayForms.js";
import { areCatalogItemsEquals } from "../utils/equals.js";
import { isNonGroupableCatalogItem } from "../utils/groupableItem.js";
import { isAreaCatalogItem, isLocationCatalogItem } from "../utils/locationAttribute.js";

export const getGroupId = (ref: ObjRef) => objRefToString(ref);
export const getCatalogGroupId = (group: ICatalogGroup) => getGroupId(group.tag);

const UNGROUPED = "ungrouped";

export interface IGroupsExpandState {
    [key: string]: boolean;
}

export type SetGroupsExpandState = (groupsExpandState: IGroupsExpandState) => void;

export interface IOrganizedCatalogExpandCollapseHook {
    flatItems: ReadonlyArray<IOrganizedCatalogItem>;
    allFlatItems: ReadonlyArray<IOrganizedCatalogItem>;
    itemGroups: ReadonlyArray<IOrganizedCatalogGroup>;
    onGroupClick: (groupId: string) => void;
}

const buildGroupsDefaultExpandState = (
    groups: ReadonlyArray<ICatalogGroup>,
    defaultExpandState: boolean,
    isLoadingItems: boolean,
): IGroupsExpandState => {
    const groupsExpandState: IGroupsExpandState = {};
    for (const group of groups) {
        const groupId = getCatalogGroupId(group);
        groupsExpandState[groupId] = defaultExpandState && !isLoadingItems;
    }
    groupsExpandState[UNGROUPED] = defaultExpandState && !isLoadingItems;
    return groupsExpandState;
};

const useDefaultGroupExpandState = (
    groups: ReadonlyArray<ICatalogGroup>,
    defaultExpandState: boolean,
    isLoadingItems: boolean,
) => {
    const [groupsExpandState, setGroupsExpandState] = useState({});
    useEffect(
        () => setGroupsExpandState(buildGroupsDefaultExpandState(groups, defaultExpandState, isLoadingItems)),
        [groups, defaultExpandState, isLoadingItems],
    );
    return {
        groupsExpandState,
        setGroupsExpandState,
    };
};

const useSearchedGroupExpandState = (
    groups: ReadonlyArray<ICatalogGroup>,
    isLoadingItems: boolean,
    searchQuery: string,
) => {
    const [searchedGroupsExpandState, setSearchedGroupsExpandState] = useState({});
    useEffect(
        () => setSearchedGroupsExpandState(buildGroupsDefaultExpandState(groups, false, isLoadingItems)),
        [groups, isLoadingItems, searchQuery],
    );
    return {
        searchedGroupsExpandState,
        setSearchedGroupsExpandState,
    };
};

const useGroupsExpandState = (
    groups: ReadonlyArray<ICatalogGroup>,
    defaultExpandState: boolean,
    isLoadingItems: boolean,
    searchQuery: string,
) => {
    const { groupsExpandState, setGroupsExpandState } = useDefaultGroupExpandState(
        groups,
        defaultExpandState,
        isLoadingItems,
    );
    const { searchedGroupsExpandState, setSearchedGroupsExpandState } = useSearchedGroupExpandState(
        groups,
        isLoadingItems,
        searchQuery,
    );

    if (searchQuery.length > 0) {
        return {
            groupsExpandState: searchedGroupsExpandState,
            setGroupsExpandState: setSearchedGroupsExpandState,
        };
    }

    return { groupsExpandState, setGroupsExpandState };
};

const createOrganizedCatalogItemBase = (item: IMetadataObject) => ({
    ref: item.ref,
    identifier: item.id,
    title: item.title,
    summary: item.description,
    uri: item.uri,
});

const asCacheDisplayForm = (df: IAttributeDisplayFormMetadataObject): ICacheItemDisplayForm => ({
    ...displayFormToCacheDisplayForm(df),
});

const createOrganizedCatalogAttribute = (catalogItem: ICatalogAttribute): IOrganizedCatalogItem => {
    const locationDisplayForm = getPreferredLocationDisplayForm(catalogItem.geoPinDisplayForms);
    const areaDisplayForm = getPreferredAreaDisplayForm(catalogItem.geoPinDisplayForms);
    return {
        ...createOrganizedCatalogItemBase(catalogItem.attribute),
        type: "attribute",
        dfRef: catalogItem.defaultDisplayForm.ref,
        dfUri: catalogItem.defaultDisplayForm.uri,
        dfIdentifier: catalogItem.defaultDisplayForm.id,
        displayForms: catalogItem.displayForms?.map((df) => asCacheDisplayForm(df)) || [],
        locationDisplayFormRef: locationDisplayForm?.ref,
        locationDisplayFormUri: locationDisplayForm?.uri,
        locationDisplayFormIdentifier: locationDisplayForm?.id,
        areaDisplayFormRef: areaDisplayForm?.ref,
        areaDisplayFormUri: areaDisplayForm?.uri,
        areaDisplayFormIdentifier: areaDisplayForm?.id,
    };
};

const createOrganizedCatalogComputedAttribute = (
    catalogItem: ICatalogComputedAttribute,
): IOrganizedCatalogItem => ({
    ...createOrganizedCatalogItemBase(catalogItem.computedAttribute),
    type: "computedAttribute",
    expression: catalogItem.computedAttribute.expression,
    dfRef: catalogItem.defaultDisplayForm.ref,
    dfUri: catalogItem.defaultDisplayForm.uri,
    dfIdentifier: catalogItem.defaultDisplayForm.id,
    displayForms: catalogItem.displayForms?.map((df) => asCacheDisplayForm(df)) || [],
});

const createOrganizedCatalogMeasure = (catalogItem: ICatalogMeasure): IOrganizedCatalogItem => ({
    ...createOrganizedCatalogItemBase(catalogItem.measure),
    type: "metric",
    expression: catalogItem.measure.expression,
    hiddenFromKda: catalogItem.measure.isHiddenFromKda ?? false,
});

const createOrganizedCatalogFact = (catalogItem: ICatalogFact): IOrganizedCatalogItem => ({
    ...createOrganizedCatalogItemBase(catalogItem.fact),
    type: "fact",
});

const createOrganizedCatalogDateDataset = (catalogItem: ICatalogDateDataset): IOrganizedCatalogItem => ({
    ...createOrganizedCatalogItemBase(catalogItem.dataSet),
    type: "date",
});

const createOrganizedCatalogAttributeHierarchy = (
    catalogItem: ICatalogAttributeHierarchy,
): IOrganizedCatalogItem => ({
    ...createOrganizedCatalogItemBase(catalogItem.attributeHierarchy),
    type: "attributeHierarchy",
});

const createOrganizedCatalogItemData = (item: CatalogItem): IOrganizedCatalogItem => {
    if (isCatalogAttribute(item)) {
        return createOrganizedCatalogAttribute(item);
    } else if (isCatalogMeasure(item)) {
        return createOrganizedCatalogMeasure(item);
    } else if (isCatalogFact(item)) {
        return createOrganizedCatalogFact(item);
    } else if (isCatalogAttributeHierarchy(item)) {
        return createOrganizedCatalogAttributeHierarchy(item);
    } else if (isCatalogComputedAttribute(item)) {
        return createOrganizedCatalogComputedAttribute(item);
    } else {
        return createOrganizedCatalogDateDataset(item);
    }
};

const isGeoItemForLabelType = (item: IOrganizedCatalogItem, geoLabelType?: GeoLabelType): boolean => {
    if (!geoLabelType) {
        return false;
    }

    return geoLabelType === "location" ? isLocationCatalogItem(item) : isAreaCatalogItem(item);
};

export const createOrganizedCatalogItem =
    (
        isLocationIconEnabled: boolean,
        geoLabelType?: GeoLabelType,
        availableItems?: ReadonlyArray<CatalogItem>,
    ) =>
    (item: CatalogItem): IOrganizedCatalogItem => {
        const itemData: IOrganizedCatalogItem = createOrganizedCatalogItemData(item);
        const matchesGeoLabelType = isGeoItemForLabelType(itemData, geoLabelType);
        const isLocationIconVisible = matchesGeoLabelType && isLocationIconEnabled;
        const withLocationIcon = {
            ...itemData,
            isLocationIconVisible,
            available:
                availableItems === undefined ||
                availableItems.some((availableItem) => areCatalogItemsEquals(availableItem, item)),
        } as IOrganizedCatalogItem;
        // The "available" property is preserved on objects even when false.
        // This allows us to distinguish between:
        // - Items from catalog (which have this property explicitly set)
        // - Items from buckets (which don't have this property)
        return omitBy(withLocationIcon, (i, key) => !i && key !== "available") as IOrganizedCatalogItem;
    };

const createGroupItems = (
    group: ICatalogGroup,
    items: ReadonlyArray<CatalogItem>,
    availableItems: ReadonlyArray<CatalogItem>,
    isLocationIconEnabled: boolean,
    geoLabelType?: GeoLabelType,
) => {
    const id = getCatalogGroupId(group);
    const isUngroupedGroup = id === UNGROUPED;
    return items
        .filter((item) => {
            const groups = isNonGroupableCatalogItem(item) ? [] : item.groups;
            const hasGroup = !isEmpty(groups);
            const belongsToGroup = hasGroup && groups.some((tagRef) => id === getGroupId(tagRef));
            const belongsToUngrouped = !hasGroup && isUngroupedGroup;
            return belongsToGroup || belongsToUngrouped;
        })
        .map(createOrganizedCatalogItem(isLocationIconEnabled, geoLabelType, availableItems));
};

/**
 * Creates a single group with its items but WITHOUT expand state.
 * This is the expensive part (filters all items per group) and should be
 * memoized independently of expand state changes.
 */
const createItemGroupBase = (
    group: ICatalogGroup,
    items: ReadonlyArray<CatalogItem>,
    availableItems: ReadonlyArray<CatalogItem>,
    isLocationIconEnabled: boolean,
    geoLabelType: GeoLabelType | undefined,
): Omit<IOrganizedCatalogGroup, "isExpanded"> => {
    const { title, tag } = group;
    const id = getCatalogGroupId(group);
    return {
        id,
        name: title,
        tag,
        items: createGroupItems(group, items, availableItems, isLocationIconEnabled, geoLabelType),
    };
};

/**
 * Expensive: computes groups with their items (O(groups × items)).
 * Does NOT depend on expand state so it can be memoized on data changes only.
 */
const createItemGroupsBase = (
    groups: ReadonlyArray<ICatalogGroup>,
    items: ReadonlyArray<CatalogItem>,
    availableItems: ReadonlyArray<CatalogItem>,
    isLoadingItems: boolean,
    isLocationIconEnabled: boolean,
    geoLabelType: GeoLabelType | undefined,
    intl: IntlShape,
): ReadonlyArray<Omit<IOrganizedCatalogGroup, "isExpanded">> => {
    const itemGroups = groups.reduce((acc: Array<Omit<IOrganizedCatalogGroup, "isExpanded">>, group) => {
        const itemGroup = createItemGroupBase(
            group,
            items,
            availableItems,
            isLocationIconEnabled,
            geoLabelType,
        );
        if (isLoadingItems || itemGroup.items.length > 0) {
            acc.push(itemGroup);
        }
        return acc;
    }, []);

    const hasUngroupedItems = items.some((item) => !isNonGroupableCatalogItem(item) && isEmpty(item.groups));
    if (hasUngroupedItems && groups.length > 0) {
        itemGroups.push(
            createItemGroupBase(
                {
                    title: intl.formatMessage({ id: "catalog.group_title.ungrouped" }),
                    tag: {
                        identifier: UNGROUPED,
                    },
                },
                sortBy(items, (item) => {
                    return createOrganizedCatalogItemData(item).title.toUpperCase();
                }),
                availableItems,
                isLocationIconEnabled,
                geoLabelType,
            ),
        );
    }

    return itemGroups;
};

/**
 * Cheap: applies expand state to pre-computed groups — O(groups) only.
 */
const applyExpandState = (
    baseGroups: ReadonlyArray<Omit<IOrganizedCatalogGroup, "isExpanded">>,
    groupsExpandState: IGroupsExpandState,
): ReadonlyArray<IOrganizedCatalogGroup> =>
    baseGroups.map((group) => ({
        ...group,
        isExpanded: groupsExpandState[group.id] ?? false,
    }));

const useItemGroups = (
    groups: ReadonlyArray<ICatalogGroup>,
    items: ReadonlyArray<CatalogItem>,
    availableItems: ReadonlyArray<CatalogItem>,
    groupsExpandState: IGroupsExpandState,
    isLoadingItems: boolean,
    isLocationIconEnabled: boolean,
    geoLabelType: GeoLabelType | undefined,
    intl: IntlShape,
): ReadonlyArray<IOrganizedCatalogGroup> => {
    // Expensive memo: compute groups with their items.
    // Does NOT depend on groupsExpandState — only reruns when actual data changes.
    const baseGroups = useMemo(() => {
        const itemsWithoutAttributeHierarchies = items.filter((item) => !isCatalogAttributeHierarchy(item));
        return createItemGroupsBase(
            groups,
            itemsWithoutAttributeHierarchies,
            availableItems,
            isLoadingItems,
            isLocationIconEnabled,
            geoLabelType,
            intl,
        );
    }, [groups, items, availableItems, isLoadingItems, isLocationIconEnabled, geoLabelType, intl]);

    // Cheap memo: apply expand/collapse state — O(groups) only.
    return useMemo(() => applyExpandState(baseGroups, groupsExpandState), [baseGroups, groupsExpandState]);
};

const useOnGroupClickCallback = (
    groupsExpandState: IGroupsExpandState,
    setGroupsExpandState: SetGroupsExpandState,
) => {
    return useCallback(
        (groupId: string) => {
            const newGroups: IGroupsExpandState = {
                ...groupsExpandState,
                [groupId]: !groupsExpandState[groupId],
            };
            setGroupsExpandState(newGroups);
        },
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [groupsExpandState],
    );
};

const useFlatItems = (
    items: ReadonlyArray<CatalogItem>,
    isLocationIconEnabled: boolean,
    geoLabelType: GeoLabelType | undefined,
    availableItems?: ReadonlyArray<CatalogItem>,
) => {
    return useMemo(
        () =>
            items
                .filter((item) => !isCatalogAttributeHierarchy(item))
                .map(createOrganizedCatalogItem(isLocationIconEnabled, geoLabelType, availableItems)),
        [items, isLocationIconEnabled, geoLabelType, availableItems],
    );
};

export const useGroups = (
    groups: ReadonlyArray<ICatalogGroup>,
    defaultExpandState: boolean,
    items: ReadonlyArray<CatalogItem>,
    allItems: ReadonlyArray<CatalogItem>,
    searchQuery: string,
    isLoadingItems: boolean,
    isLocationIconEnabled: boolean,
    geoLabelType: GeoLabelType | undefined,
    intl: IntlShape,
    shouldUnavailableItemsBeVisible = false,
): IOrganizedCatalogExpandCollapseHook => {
    const { groupsExpandState, setGroupsExpandState } = useGroupsExpandState(
        groups,
        defaultExpandState,
        isLoadingItems,
        searchQuery,
    );
    const onGroupClick = useOnGroupClickCallback(groupsExpandState, setGroupsExpandState);
    const itemGroups = useItemGroups(
        groups,
        shouldUnavailableItemsBeVisible ? allItems : items,
        shouldUnavailableItemsBeVisible ? items : undefined,
        groupsExpandState,
        isLoadingItems,
        isLocationIconEnabled,
        geoLabelType,
        intl,
    );
    const flatItems = useFlatItems(items, isLocationIconEnabled, geoLabelType);
    const allFlatItems = useFlatItems(allItems, isLocationIconEnabled, geoLabelType, items);

    return {
        flatItems,
        allFlatItems,
        itemGroups,
        onGroupClick,
    };
};
