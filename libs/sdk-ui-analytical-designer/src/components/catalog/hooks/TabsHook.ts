// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { defineMessage } from "react-intl";

import { type CatalogItem, type GenAIObjectType } from "@gooddata/sdk-model";

import { type GeoLabelType } from "../../../constants/geo.js";
import { type ICatalogFilter, TabIconGroups, TabIcons, TabNames, TabTypes } from "../model/catalogFilter.js";

export interface IOrganizedCatalogTabsHook {
    tabAvailableItems: ReadonlyArray<CatalogItem>;
    tabAllItems: ReadonlyArray<CatalogItem>;
    onTabChanged: (position: number, group?: string) => void;
    tabs: ReadonlyArray<ICatalogFilter>;
    tabShowDateItem: boolean;
    tabSelectionStates: Array<boolean>;
    objectTypes: Array<GenAIObjectType>;
}

const TAB_NAMES: ReadonlyArray<ICatalogFilter> = [
    {
        name: TabNames.ALL_TAB_NAME,
        label: defineMessage({ id: "catalog.filter.all" }).id,
    },
    {
        name: TabNames.MEASURES_TAB_NAME,
        label: defineMessage({ id: "catalog.filter.metrics" }).id,
    },
    {
        name: TabNames.ATTRIBUTES_TAB_NAME,
        label: defineMessage({ id: "catalog.filter.attributes" }).id,
    },
];

const useTabItems = (
    items: ReadonlyArray<CatalogItem>,
    tabSelectionStates: Array<boolean>,
    tabIcons: Array<ICatalogFilter>,
    shouldDisplayIconTab: boolean,
    isLocationIconEnabled: boolean,
    geoLabelType?: GeoLabelType,
) => {
    return useMemo(
        () =>
            shouldDisplayIconTab
                ? getTabIconItems(tabIcons, items, tabSelectionStates, isLocationIconEnabled, geoLabelType)
                : getTabItems(items, tabSelectionStates),
        [items, tabSelectionStates, tabIcons, shouldDisplayIconTab, isLocationIconEnabled, geoLabelType],
    );
};

/**
 * Computed attributes live among the normal attributes in the catalog, so every attribute-tab
 * membership test has to accept both types. Geo checks stay attribute-only - a computed attribute
 * has no geo display forms.
 */
const isAttributeLikeItem = (item: CatalogItem) =>
    item.type === (TabTypes.ATTRIBUTE as string) || item.type === (TabTypes.COMPUTED_ATTRIBUTE as string);

const getTabItems = (items: ReadonlyArray<CatalogItem>, tabSelectionStates: Array<boolean>) => {
    const activeTabIndex = tabSelectionStates.indexOf(true);
    const activeTab = TAB_NAMES[activeTabIndex];
    let tabItems: ReadonlyArray<CatalogItem>;
    let tabShowDateItem = true;

    switch (activeTab.name) {
        case TabNames.ALL_TAB_NAME:
            tabItems = items;
            break;

        case TabNames.MEASURES_TAB_NAME:
            tabItems = items.filter(
                (item) =>
                    item.type === (TabTypes.MEASURE as string) || item.type === (TabTypes.FACT as string),
            );
            tabShowDateItem = false;
            break;

        case TabNames.ATTRIBUTES_TAB_NAME:
            tabItems = items.filter(isAttributeLikeItem);
            break;

        default:
            throw new Error("Invariant: Unexpected tab name");
    }

    return { tabItems, tabShowDateItem };
};

/**
 * If no tab is selected (which is the default setting) entries from all types are visible.
 * User can select Multi-tab, but only from the same group.
 * @param tabIcons -
 * @param items -
 * @param tabSelectionStates -
 * @param isLocationIconEnabled -
 * @returns
 */
type CatalogGeoDisplayForm = { displayFormType?: string; type?: string };

const matchesDisplayFormType = (
    displayForms: ReadonlyArray<CatalogGeoDisplayForm> | undefined,
    target: string,
): boolean => {
    if (!displayForms) {
        return false;
    }

    return displayForms.some(
        (displayForm) => displayForm.displayFormType === target || displayForm.type === target,
    );
};

const hasLocationDisplayForm = (displayForms?: ReadonlyArray<CatalogGeoDisplayForm>): boolean => {
    const hasPin = matchesDisplayFormType(displayForms, "GDC.geo.pin");
    const hasLatitude = matchesDisplayFormType(displayForms, "GDC.geo.pin_latitude");
    const hasLongitude = matchesDisplayFormType(displayForms, "GDC.geo.pin_longitude");

    return hasPin || (hasLatitude && hasLongitude);
};

const hasAreaDisplayForm = (displayForms?: ReadonlyArray<CatalogGeoDisplayForm>): boolean => {
    return matchesDisplayFormType(displayForms, "GDC.geo.area");
};

const getGeoPinDisplayForms = (item: CatalogItem): ReadonlyArray<CatalogGeoDisplayForm> => {
    const attribute = (item as unknown as { attribute?: { geoPinDisplayForms?: CatalogGeoDisplayForm[] } })
        .attribute;

    return (
        (item as { geoPinDisplayForms?: CatalogGeoDisplayForm[] }).geoPinDisplayForms ??
        attribute?.geoPinDisplayForms
    );
};

const itemMatchesGeoLabelType = (item: CatalogItem, geoLabelType?: GeoLabelType): boolean => {
    const geoDisplayForms = getGeoPinDisplayForms(item);
    const hasAreaPins = hasAreaDisplayForm(geoDisplayForms);
    const hasLocationPins = hasLocationDisplayForm(geoDisplayForms);

    if (!geoLabelType) {
        return Boolean(geoDisplayForms?.length);
    }

    return geoLabelType === "location" ? hasLocationPins && !hasAreaPins : hasAreaPins;
};

const getTabIconItems = (
    tabIcons: Array<ICatalogFilter>,
    items: ReadonlyArray<CatalogItem>,
    tabSelectionStates: Array<boolean>,
    isLocationIconEnabled: boolean,
    geoLabelType?: GeoLabelType,
) => {
    const { isMetricTabSelected, isFactTabSelected, isAttributeTabSelected, isGeoAttributeSelected } =
        tabSelectionStates.reduce(
            (result, value, index) => {
                if (value) {
                    const tabIconName = tabIcons[index]?.name;

                    if (tabIconName === TabIcons.METRICS) result.isMetricTabSelected = true;
                    else if (tabIconName === TabIcons.FACTS) result.isFactTabSelected = true;
                    else if (tabIconName === TabIcons.ATTRIBUTES) result.isAttributeTabSelected = true;
                    else if (tabIconName === TabIcons.GEO_ATTRIBUTES) result.isGeoAttributeSelected = true;
                }

                return result;
            },
            {
                isMetricTabSelected: false,
                isFactTabSelected: false,
                isAttributeTabSelected: false,
                isGeoAttributeSelected: false,
            },
        );

    // no tab is selected
    if (!isMetricTabSelected && !isFactTabSelected && !isAttributeTabSelected && !isGeoAttributeSelected) {
        return {
            tabItems: items,
            tabShowDateItem: true,
        };
    }
    const hasGeoAttributeTabIcon =
        tabIcons.findIndex((tabIcon) => tabIcon.name === TabIcons.GEO_ATTRIBUTES) > -1;
    const tabItems: ReadonlyArray<CatalogItem> = items.filter((item) => {
        const matchesGeoType = itemMatchesGeoLabelType(item, geoLabelType);
        const isAttributeItem =
            isAttributeTabSelected &&
            isAttributeLikeItem(item) &&
            (!isLocationIconEnabled ||
                (isLocationIconEnabled && (!matchesGeoType || !hasGeoAttributeTabIcon)));

        return (
            (isMetricTabSelected && item.type === (TabTypes.MEASURE as string)) ||
            (isFactTabSelected && item.type === (TabTypes.FACT as string)) ||
            isAttributeItem ||
            (isGeoAttributeSelected && item.type === (TabTypes.ATTRIBUTE as string) && matchesGeoType)
        );
    });

    return { tabItems, tabShowDateItem: isAttributeTabSelected };
};

const useAvailableTabIcons = (
    availableItems: ReadonlyArray<CatalogItem>,
    isLocationIconEnabled: boolean,
    geoLabelType?: GeoLabelType,
) =>
    useMemo((): Array<ICatalogFilter> => {
        const hasMetricType =
            availableItems.findIndex((item) => item.type === (TabTypes.MEASURE as string)) > -1;
        const hasFactType = availableItems.findIndex((item) => item.type === (TabTypes.FACT as string)) > -1;
        const hasAttributeType = availableItems.findIndex(isAttributeLikeItem) > -1;
        const hasGeoAttributeType =
            isLocationIconEnabled &&
            availableItems.findIndex(
                (item) =>
                    item.type === (TabTypes.ATTRIBUTE as string) &&
                    itemMatchesGeoLabelType(item, geoLabelType),
            ) > -1;

        const tabIcons: Array<ICatalogFilter> = [];

        if (hasMetricType) {
            tabIcons.push({
                name: TabIcons.METRICS,
                label: defineMessage({ id: "catalog.filter.metrics" }).id,
                group: TabIconGroups.METRIC_FACT,
            });
        }

        if (hasFactType) {
            tabIcons.push({
                name: TabIcons.FACTS,
                label: defineMessage({ id: "catalog.filter.facts" }).id,
                group: TabIconGroups.METRIC_FACT,
            });
        }

        if (hasAttributeType) {
            tabIcons.push({
                name: TabIcons.ATTRIBUTES,
                label: defineMessage({ id: "catalog.filter.attributes" }).id,
                group: TabIconGroups.ATTRIBUTE,
            });
        }

        if (hasGeoAttributeType) {
            tabIcons.push({
                name: TabIcons.GEO_ATTRIBUTES,
                label: defineMessage({ id: "catalog.filter.geo.attributes" }).id,
                group: TabIconGroups.ATTRIBUTE,
            });
        }

        return tabIcons;
    }, [availableItems, isLocationIconEnabled, geoLabelType]);

const useOnTabChangedCallback = (
    tabIcons: Array<ICatalogFilter>,
    tabSelectionStates: Array<boolean>,
    setTabSelectionStates: (stateTabs: Array<boolean>) => void,
    shouldDisplayTabIcons: boolean,
) =>
    useCallback(
        (position: number, group?: string) => {
            const clonedTabSelectionStates = [...tabSelectionStates];
            if (shouldDisplayTabIcons) {
                const isSelectedTab = clonedTabSelectionStates[position];
                const isOtherGroup = tabIcons.find((tab, index) => {
                    return (tab.group as string) !== group && clonedTabSelectionStates[index];
                });

                if (!isSelectedTab && isOtherGroup) {
                    clonedTabSelectionStates.fill(false);
                }

                const updatedSelectedTabs = clonedTabSelectionStates.map((isTabSelected, index) => {
                    return index === position ? !isTabSelected : isTabSelected;
                });

                setTabSelectionStates(updatedSelectedTabs);
            } else {
                clonedTabSelectionStates.fill(false);
                clonedTabSelectionStates[position] = true;
                setTabSelectionStates(clonedTabSelectionStates);
            }
        },
        [tabIcons, tabSelectionStates, setTabSelectionStates, shouldDisplayTabIcons],
    );

export const useTabs = (
    availableItems: ReadonlyArray<CatalogItem>,
    allItems: ReadonlyArray<CatalogItem>,
    shouldDisplayTabIcons: boolean,
    isLocationIconEnabled: boolean,
    geoLabelType?: GeoLabelType,
): IOrganizedCatalogTabsHook => {
    const tabIcons = useAvailableTabIcons(availableItems, isLocationIconEnabled, geoLabelType);
    const [tabSelectionStates, setTabSelectionStates] = useState(
        shouldDisplayTabIcons ? [] : [true, ...new Array(TAB_NAMES.length - 1).fill(false)],
    );
    // tabIconSelectionNames to keep previous status of tab icon when availableItems change
    const [tabIconSelectionNames, setTabIconSelectionNames] = useState<string[]>([]);
    const { tabItems: tabAvailableItems, tabShowDateItem } = useTabItems(
        availableItems,
        tabSelectionStates,
        tabIcons,
        shouldDisplayTabIcons,
        isLocationIconEnabled,
        geoLabelType,
    );
    const { tabItems: tabAllItems } = useTabItems(
        allItems,
        tabSelectionStates,
        tabIcons,
        shouldDisplayTabIcons,
        isLocationIconEnabled,
        geoLabelType,
    );
    const onTabChanged = useOnTabChangedCallback(
        tabIcons,
        tabSelectionStates,
        setTabSelectionStates,
        shouldDisplayTabIcons,
    );

    const objectTypes = useMemo(() => {
        const objects: GenAIObjectType[] = [];
        if (shouldDisplayTabIcons) {
            tabIcons.forEach((tabIcon, i) => {
                if (tabSelectionStates[i]) {
                    objects.push(...getObjectTypeFromTabName(tabIcon));
                }
            });
            if (objects.length === 0) {
                objects.push(...getObjectTypeFromTabName(TAB_NAMES[0]));
            }
        } else {
            TAB_NAMES.forEach((tab, i) => {
                if (tabSelectionStates[i]) {
                    objects.push(...getObjectTypeFromTabName(tab));
                }
            });
        }
        return objects.filter((value, index, self) => self.indexOf(value) === index);
    }, [shouldDisplayTabIcons, tabIcons, tabSelectionStates]);

    useEffect(() => {
        if (shouldDisplayTabIcons && availableItems.length) {
            const { updatedTabIconSelectionNames, updatedTabSelectionStates } = tabIcons.reduce(
                (result, tabIcon) => {
                    const tabStateIndex = tabIconSelectionNames.indexOf(tabIcon.name);
                    result.updatedTabIconSelectionNames.push(tabIcon.name);
                    result.updatedTabSelectionStates.push(tabSelectionStates[tabStateIndex] || false);

                    return result;
                },
                { updatedTabIconSelectionNames: [], updatedTabSelectionStates: [] },
            );

            if (!isEqual(updatedTabIconSelectionNames, tabIconSelectionNames)) {
                setTabIconSelectionNames(updatedTabIconSelectionNames);
            }

            if (!isEqual(updatedTabSelectionStates, tabSelectionStates)) {
                setTabSelectionStates(updatedTabSelectionStates);
            }
        }
    }, [availableItems, tabSelectionStates, tabIcons, tabIconSelectionNames, shouldDisplayTabIcons]);

    return {
        tabAvailableItems,
        tabAllItems,
        onTabChanged,
        tabs: shouldDisplayTabIcons ? tabIcons : TAB_NAMES,
        tabShowDateItem,
        tabSelectionStates,
        objectTypes,
    };
};

function getObjectTypeFromTabName(tab: ICatalogFilter): GenAIObjectType[] {
    switch (tab.name) {
        case TabIcons.GEO_ATTRIBUTES:
        case TabIcons.ATTRIBUTES:
            return ["attribute", "date"];
        case TabIcons.FACTS:
            return ["fact"];
        case TabIcons.METRICS:
        case TabNames.MEASURES_TAB_NAME:
            return ["metric"];
        case TabNames.ALL_TAB_NAME:
        default:
            return ["attribute", "dataset", "fact", "metric"];
    }
}
