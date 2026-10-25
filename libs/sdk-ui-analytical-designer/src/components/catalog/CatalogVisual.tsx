// (C) 2019-2026 GoodData Corporation

import { useCallback, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";

import { type ISearchState } from "@gooddata/sdk-ui-semantic-search";

import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../typings/catalog.js";

import { AvailableItemsStatusPure as AvailableItemsStatus } from "./blocks/AvailableItemsStatus.js";
import { CatalogFilterTabIcons } from "./blocks/CatalogFilterTabIcons.js";
import { CatalogSearch } from "./blocks/CatalogSearch.js";
import { RefreshButton } from "./blocks/RefreshButton.js";
import { UpdatedItemsCount } from "./blocks/UpdatedItemsCount.js";
import { CatalogList } from "./CatalogList.js";
import { useScrollableArea } from "./hooks/ScrollableAreaHook.js";
import { type ICatalogFilter, TabNames } from "./model/catalogFilter.js";

export interface ICatalogVisualStateProps {
    searchState: ISearchState;
    tabs: ReadonlyArray<ICatalogFilter>;
    showDateItem: boolean;
    itemGroups: ReadonlyArray<IOrganizedCatalogGroup>;
    allItems: ReadonlyArray<IOrganizedCatalogItem>;
    relatedItems: ReadonlyArray<IOrganizedCatalogItem>;
    isRelatedLoading: boolean;
    isLoadingGroups: boolean;
    isLoadingItems: boolean;
    hiddenItemsCount: number;
    updatedItemsCount: number;
    isWorkspaceEmpty: boolean;
    canManageProject: boolean;
    isFreemiumEdition: boolean;
    linkToDatasourcePage: string;
    tabSelectionStates: ReadonlyArray<boolean>;
    isEnhancedInsightPickerEnabled: boolean;
}
export interface ICatalogVisualDispatchProps {
    onSearchQueryChange: (query: string) => void;
    onTabChanged: (tabIndex: number, group?: string) => void;
    onGroupClick: (groupId: string) => void;
    requestCatalogRefresh: () => void;
}

export type ICatalogVisualProps = ICatalogVisualStateProps & ICatalogVisualDispatchProps;

export function CatalogVisual({
    searchState,
    onSearchQueryChange,
    tabs,
    onTabChanged,
    hiddenItemsCount,
    allItems,
    relatedItems,
    itemGroups,
    isLoadingGroups,
    isLoadingItems,
    isRelatedLoading,
    showDateItem,
    onGroupClick,
    requestCatalogRefresh,
    updatedItemsCount,
    isWorkspaceEmpty,
    canManageProject,
    isFreemiumEdition,
    linkToDatasourcePage,
    tabSelectionStates,
    isEnhancedInsightPickerEnabled,
}: ICatalogVisualProps) {
    const intl = useIntl();

    const { onScroll, scrollableRef } = useScrollableArea();
    const [isMouseOver, setMouseOver] = useState(false);

    const onListMouseEnter = useCallback(() => setMouseOver(true), []);
    const onListMouseLeave = useCallback(() => setMouseOver(false), []);
    const onRefreshButtonClick = useCallback(() => {
        setMouseOver(false);
        requestCatalogRefresh();
    }, [requestCatalogRefresh]);
    const selectedTabNames = tabs.length
        ? tabs
              .reduce((result: Array<string>, tab: ICatalogFilter, index: number) => {
                  const isTabSelected = tabSelectionStates[index];
                  if (isTabSelected) {
                      result.push(tab.name);
                  }

                  return result;
              }, [])
              .join("-")
        : TabNames.ALL_TAB_NAME;

    const isSearchSettled = searchState.state === "completed" || searchState.state === "idle";

    const catalogClassNames = classNames(
        "adi-catalog adi-organized-catalog s-catalogue s-organized-catalog",
        {
            // Indicates the debounced search has settled and results are rendered
            // mainly used for e2e tests
            "s-catalog-search-settled": isSearchSettled,
            "enhanced-insight-picker": isEnhancedInsightPickerEnabled,
        },
    );
    return (
        <div className={catalogClassNames}>
            <CatalogSearch
                placeholder={intl.formatMessage({
                    id: "search_data",
                })}
                value={searchState.query}
                onChange={onSearchQueryChange}
            />

            {tabs.length > 1 && (
                <>
                    <CatalogFilterTabIcons
                        availableTabs={tabs}
                        activeTabs={tabSelectionStates}
                        onSelect={onTabChanged}
                    />

                    <div className="adi-catalog-tab-icons-separator">
                        <hr />
                    </div>
                </>
            )}

            <div
                key={selectedTabNames}
                className="adi-catalog-items s-catalog-items"
                onScroll={onScroll}
                ref={scrollableRef}
                onMouseEnter={onListMouseEnter}
                onMouseLeave={onListMouseLeave}
            >
                <CatalogList
                    showDateItem={showDateItem}
                    itemGroups={itemGroups}
                    relatedItems={relatedItems}
                    isRelatedLoading={isRelatedLoading}
                    isLoadingGroups={isLoadingGroups}
                    isLoadingItems={isLoadingItems}
                    onGroupClick={onGroupClick}
                    allItems={allItems}
                    searchQuery={searchState.debouncedQuery}
                    isWorkspaceEmpty={isWorkspaceEmpty}
                    hiddenItemsCount={hiddenItemsCount}
                    selectedTabNames={selectedTabNames}
                    canManageProject={canManageProject}
                    isFreemiumEdition={isFreemiumEdition}
                    linkToDatasourcePage={linkToDatasourcePage}
                />
                <UpdatedItemsCount count={updatedItemsCount} />
                <RefreshButton isVisible={isMouseOver} onClick={onRefreshButtonClick} />
            </div>

            <AvailableItemsStatus hiddenItemsCount={hiddenItemsCount} />
        </div>
    );
}
