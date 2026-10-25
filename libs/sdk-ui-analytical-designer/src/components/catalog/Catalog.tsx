// (C) 2019-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import {
    type HybridSearchItemBuilder,
    customMatcher,
    useHybridSearch,
} from "@gooddata/sdk-ui-semantic-search";

import { CatalogUiActions } from "../../sagas/catalog/catalog_ui_actions.js";
import { getLinkToDatasourcePage } from "../../selectors/data_page_selector.js";
import {
    enableCatalogSmartSearchResults as enableCatalogSmartSearchResultsSelector,
    enableEnhancedInsightPicker,
    getCatalogGroupsExpanded,
    isFreemiumEdition as isFreemiumEditionSelector,
} from "../../selectors/feature_flag_selector.js";
import { canManageProject as canManageProjectSelector } from "../../selectors/permissions_selector.js";
import {
    getActiveGeoLabelType,
    isLocationIconEnabled as isLocationIconEnabledSelector,
} from "../../services/reference_point_service.js";
import {
    getAvailableItems,
    getHLLFilteredCatalogItems,
    getSortedCatalogGroups,
    getUpdatedItemsCount,
    isDateItemAvailable,
    isLoadingGroups as isLoadingGroupsSelector,
    isLoadingItems as isLoadingItemsSelector,
    isWorkspaceEmpty as isWorkspaceEmptySelector,
    shouldUnavailableItemsBeVisible as shouldUnavailableItemsBeVisibleSelector,
} from "../../store/catalog/catalog_selector.js";
import { type AppDispatch } from "../../store/types.js";
import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../typings/catalog.js";
import { OrganizedCatalogUtils } from "../../utils/organized_catalog.js";

import { CatalogVisual as OrganizedCatalogVisual } from "./CatalogVisual.js";
import { createOrganizedCatalogItem, useGroups } from "./hooks/GroupHook.js";
import { useTabs } from "./hooks/TabsHook.js";
import { isCatalogItemRef } from "./utils/equals.js";

export function Catalog() {
    const showDateItem = useSelector(isDateItemAvailable);
    const isLoadingGroups = useSelector(isLoadingGroupsSelector);
    const isLoadingItems = useSelector(isLoadingItemsSelector);
    const items = useSelector(getAvailableItems);
    const allItems = useSelector(getHLLFilteredCatalogItems);
    const groups = useSelector(getSortedCatalogGroups);
    const defaultExpandedState = useSelector(getCatalogGroupsExpanded);
    const isLocationIconEnabled = useSelector(isLocationIconEnabledSelector);
    const geoLabelType = useSelector(getActiveGeoLabelType);
    const updatedItemsCount = useSelector(getUpdatedItemsCount);
    const isWorkspaceEmpty = useSelector(isWorkspaceEmptySelector);
    const canManageProject = useSelector(canManageProjectSelector);
    const isFreemiumEdition = useSelector(isFreemiumEditionSelector);
    const linkToDatasourcePage = useSelector(getLinkToDatasourcePage);
    const shouldUnavailableItemsBeVisible = useSelector(shouldUnavailableItemsBeVisibleSelector);
    const enableCatalogSmartSearchResults = useSelector(enableCatalogSmartSearchResultsSelector);
    const isEnhancedInsightPickerEnabled = useSelector(enableEnhancedInsightPicker);

    const dispatch = useDispatch<AppDispatch>();
    const requestCatalogRefresh = useCallback(
        (preventRefreshAvailability?: boolean) => {
            dispatch(CatalogUiActions.requestCatalogRefresh(preventRefreshAvailability));
        },
        [dispatch],
    );

    const intl = useIntl();

    const {
        tabAvailableItems,
        tabAllItems,
        onTabChanged,
        tabs,
        tabShowDateItem,
        tabSelectionStates,
        objectTypes,
    } = useTabs(items, allItems, true, isLocationIconEnabled, geoLabelType);

    const itemBuilder = useCallback(
        ((_, { ref }) => {
            const item = allItems.find((item) => isCatalogItemRef(item, ref));
            if (item) {
                return createOrganizedCatalogItem(isLocationIconEnabled, geoLabelType, allItems)(item);
            }
            return null;
        }) as HybridSearchItemBuilder<IOrganizedCatalogItem>,
        [allItems, geoLabelType, isLocationIconEnabled],
    );

    const matcher = useMemo(() => customMatcher(["name", "title"]), []);

    const { searchState, onSearchQueryChange, search } = useHybridSearch<
        IOrganizedCatalogItem,
        IOrganizedCatalogGroup
    >({
        allowSematicSearch: enableCatalogSmartSearchResults,
        deepSearch: false,
        objectTypes,
        itemBuilder,
        matcher,
    });
    const { flatItems, allFlatItems, itemGroups, onGroupClick } = useGroups(
        groups,
        defaultExpandedState,
        tabAvailableItems,
        tabAllItems,
        searchState.debouncedQuery,
        isLoadingItems,
        isLocationIconEnabled,
        geoLabelType,
        intl,
        shouldUnavailableItemsBeVisible,
    );
    const {
        searchItems,
        searchAllItems,
        searchItemGroups,
        searchKeywords,
        searchRelatedItems,
        semanticSearchState,
    } = useMemo(
        () =>
            search({
                items: flatItems,
                allItems: allFlatItems,
                itemGroups: itemGroups,
                keywords: [intl.formatMessage({ id: "date" })],
            }),
        [allFlatItems, flatItems, intl, itemGroups, search],
    );

    const unavailableItemsCount = OrganizedCatalogUtils.getUnavailableItemsCount(
        searchState.debouncedQuery,
        flatItems,
        allFlatItems,
        searchItems,
        searchAllItems,
    );

    return (
        <OrganizedCatalogVisual
            searchState={searchState}
            tabs={tabs}
            allItems={shouldUnavailableItemsBeVisible ? searchAllItems : searchItems}
            relatedItems={searchRelatedItems}
            itemGroups={searchItemGroups}
            hiddenItemsCount={unavailableItemsCount}
            showDateItem={
                showDateItem && tabShowDateItem && searchKeywords.length > 0 ? !isLoadingItems : null
            }
            isLoadingGroups={isLoadingGroups}
            isLoadingItems={isLoadingItems}
            isRelatedLoading={semanticSearchState.state === "loading"}
            onGroupClick={onGroupClick}
            onSearchQueryChange={onSearchQueryChange}
            onTabChanged={onTabChanged}
            requestCatalogRefresh={requestCatalogRefresh}
            updatedItemsCount={updatedItemsCount}
            isWorkspaceEmpty={isWorkspaceEmpty}
            tabSelectionStates={tabSelectionStates}
            canManageProject={canManageProject}
            isFreemiumEdition={isFreemiumEdition}
            linkToDatasourcePage={linkToDatasourcePage}
            isEnhancedInsightPickerEnabled={isEnhancedInsightPickerEnabled}
        />
    );
}
