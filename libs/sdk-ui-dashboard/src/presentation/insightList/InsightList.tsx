// (C) 2022-2023 GoodData Corporation
import React, { useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import {
    insightTitle,
    insightVisualizationType,
    IInsight,
    insightUpdated,
    insightIsLocked,
    isUriRef,
    areObjRefsEqual,
    insightSummary,
} from "@gooddata/sdk-model";
import debounce from "lodash/debounce.js";
import range from "lodash/range.js";
import { useBackendStrict, usePagedResource, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IInsightsQueryOptions } from "@gooddata/sdk-backend-spi";
import { InsightListItem, DropdownList, ITab } from "@gooddata/sdk-ui-kit";

import { InsightListNoData } from "./InsightListNoData.js";
import {
    createInsightRequested,
    selectAllowCreateInsightRequest,
    selectCanCreateVisualization,
    selectCurrentUserRef,
    selectInsightListLastUpdateRequested,
    selectSettings,
    useDashboardEventDispatch,
    useDashboardSelector,
} from "../../model/index.js";
import { IInsightListProps } from "./types.js";
import { messages } from "../../locales.js";

const ITEMS_PER_PAGE = 50;
const ITEM_HEIGHT = 40;
const LIST_WIDTH = 229;

interface IInsightListItem {
    insight: IInsight;
    insightType: string;
}

export function getInsightListSourceItem(insight: IInsight): IInsightListItem {
    const insightType = insightVisualizationType(insight);

    return {
        insight,
        insightType,
    };
}

const dropdownTabsTranslationIds = [messages.tabsMy, messages.tabsAll] as ITab[];

/**
 * @internal
 */
export const InsightList: React.FC<IInsightListProps> = ({
    height,
    width = LIST_WIDTH,
    searchAutofocus,
    renderItem,
    selectedRef,
    onSelect,
}) => {
    const intl = useIntl();

    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
    const [pagesToLoad, setPagesToLoad] = useState<number[]>([0]); // first page loaded
    const [search, setSearch] = useState("");
    const [selectedTabId, setSelectedTabId] = useState(messages.tabsMy.id);
    const userRef = useDashboardSelector(selectCurrentUserRef);
    const userUri = isUriRef(userRef) ? userRef.uri : undefined;
    const insightListLastUpdateRequested = useDashboardSelector(selectInsightListLastUpdateRequested);
    const canCreateVisualization = useDashboardSelector(selectCanCreateVisualization);
    const allowCreateInsightRequest = useDashboardSelector(selectAllowCreateInsightRequest);
    const settings = useDashboardSelector(selectSettings);

    const params = pagesToLoad.map((pageNumber) => ({
        limit: ITEMS_PER_PAGE,
        offset: pageNumber * ITEMS_PER_PAGE,
        title: search,
        author: selectedTabId === messages.tabsMy.id && !search ? userUri : undefined,
    }));

    const {
        items: insights,
        totalItemsCount: totalInsightsCount,
        isLoading,
    } = usePagedResource(
        ({
            limit,
            offset,
            title,
            author,
        }: {
            limit: number;
            offset: number;
            title?: string;
            author?: string;
        }) => {
            const options: IInsightsQueryOptions = {
                limit,
                offset,
                author,
                title,
                orderBy: "updated",
            };

            return backend.workspace(workspaceId).insights().getInsights(options);
        },
        params,
        [backend, pagesToLoad, search, selectedTabId, insightListLastUpdateRequested],
        [search, selectedTabId, pagesToLoad.length === 0, insightListLastUpdateRequested],
    );

    useEffect(() => {
        if (!initialLoadCompleted && typeof totalInsightsCount !== "undefined") {
            setInitialLoadCompleted(true);
            if (totalInsightsCount === 0) {
                // when the user has no insights of their own, switch to the All tab
                setSelectedTabId(messages.tabsAll.id);
            }
        }
    }, [initialLoadCompleted, totalInsightsCount]);

    const onSearch = useCallback(
        debounce((searchString: string) => {
            setPagesToLoad([0]);
            setSearch(searchString);
        }, 250),
        [],
    );

    const itemHeightGetter = (index: number) => {
        // Modify item heights for first/last item so that their hover states don't overlap.

        // Also @see styles and keep this value in sync with what's in css styles
        // for is-first and is-last in visualization items in the list
        const firstLastItemMargin = 10;

        const isFirstOrLast = totalInsightsCount ? index === 0 || index === totalInsightsCount - 1 : false;

        return isFirstOrLast ? ITEM_HEIGHT + firstLastItemMargin : ITEM_HEIGHT;
    };

    const eventDispatch = useDashboardEventDispatch();
    const createInsightRequestedEvent = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        eventDispatch(createInsightRequested());
    }, []);

    const TABS_AND_SEARCHFIELD_HEIGHT = 70;
    const SEARCHFIELD_HEIGHT = 47;

    // need to subtract height of controls from the overall size which was measured
    const controlsHeight = search ? SEARCHFIELD_HEIGHT : TABS_AND_SEARCHFIELD_HEIGHT;
    const dropdownListHeight = height && height - controlsHeight;
    const dropdownListLoading = isLoading && insights.length === 0;
    const showDropdownListTabs = initialLoadCompleted && !search;
    const showNoDataCreateButton = allowCreateInsightRequest && canCreateVisualization;

    return (
        <DropdownList
            width={width}
            height={dropdownListHeight}
            isMobile={false}
            isLoading={dropdownListLoading}
            showSearch={initialLoadCompleted}
            searchString={search}
            searchFieldSize="small"
            searchPlaceholder={intl.formatMessage({ id: "search_insights" })}
            onSearch={onSearch}
            disableAutofocus={!searchAutofocus}
            showTabs={showDropdownListTabs}
            tabs={backend.capabilities.supportsOwners && userUri ? dropdownTabsTranslationIds : undefined}
            selectedTabId={selectedTabId}
            onTabSelect={({ id }) => {
                setPagesToLoad([0]);
                setSelectedTabId(id);
            }}
            itemHeight={ITEM_HEIGHT}
            itemHeightGetter={itemHeightGetter}
            items={insights as IInsight[]}
            itemsCount={totalInsightsCount}
            renderItem={
                renderItem ??
                (({ item: insight, width }) => {
                    if (!insight) {
                        return <InsightListItem isLoading />;
                    }

                    const title = insightTitle(insight);
                    const description = insightSummary(insight)?.trim();
                    const insightListSourceItem = getInsightListSourceItem(insight);
                    const isSelected = areObjRefsEqual(insight.insight.ref, selectedRef);

                    return (
                        <InsightListItem
                            title={title}
                            description={description}
                            showDescriptionPanel={settings?.enableDescriptions}
                            type={insightListSourceItem.insightType}
                            width={width}
                            isSelected={isSelected}
                            updated={insightUpdated(insightListSourceItem.insight)}
                            isLocked={insightIsLocked(insightListSourceItem.insight)}
                            onClick={() => onSelect?.(insight)}
                        />
                    );
                })
            }
            renderNoData={({ hasNoMatchingData }) => (
                <InsightListNoData
                    isUserInsights={selectedTabId === messages.tabsMy.id}
                    hasNoMatchingData={hasNoMatchingData}
                    showNoDataCreateButton={showNoDataCreateButton}
                    onCreateButtonClick={createInsightRequestedEvent}
                />
            )}
            onScrollEnd={(startIndex, endIndex) => {
                const startPage = Math.floor(startIndex / ITEMS_PER_PAGE);
                const endPage = Math.floor(endIndex / ITEMS_PER_PAGE);
                const pagesToLoad = range(startPage, endPage + 1);
                setPagesToLoad(pagesToLoad);
            }}
        />
    );
};
