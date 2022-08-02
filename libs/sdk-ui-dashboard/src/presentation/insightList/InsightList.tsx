// (C) 2022 GoodData Corporation
import React, { useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import {
    insightTitle,
    insightVisualizationUrl,
    IInsight,
    insightUpdated,
    insightIsLocked,
    isUriRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import debounce from "lodash/debounce";
import range from "lodash/range";
import { useBackendStrict, usePagedResource, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IInsightsQueryOptions } from "@gooddata/sdk-backend-spi";
import { InsightListItem, DropdownList } from "@gooddata/sdk-ui-kit";

import { InsightListNoData } from "./InsightListNoData";
import { selectCurrentUserRef, useDashboardSelector } from "../../model";
import { IInsightListProps } from "./types";
import { messages } from "../../locales";

const ITEMS_PER_PAGE = 50;
const ITEM_HEIGHT = 40;
const LIST_WIDTH = 229;

interface IInsightListItem {
    insight: IInsight;
    insightType: string;
}

export function getInsightListSourceItem(insight: IInsight): IInsightListItem {
    const insightUrl = insightVisualizationUrl(insight);
    const insightType = insightUrl?.split(":")[1];

    return {
        insight,
        insightType,
    };
}

const dropdownTabsTranslationIds = [messages.tabsMy, messages.tabsAll];

/**
 * @internal
 */
export const InsightList: React.FC<IInsightListProps> = ({
    height,
    searchAutofocus,
    noDataButton,
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
        [backend, pagesToLoad, search, selectedTabId],
        [search, selectedTabId, pagesToLoad.length === 0],
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

    const TABS_AND_SEARCHFIELD_HEIGHT = 70;
    const SEARCHFIELD_HEIGHT = 47;

    // need to subtract height of controls from the overall size which was measured
    const controlsHeight = search ? SEARCHFIELD_HEIGHT : TABS_AND_SEARCHFIELD_HEIGHT;

    return (
        <DropdownList
            width={LIST_WIDTH}
            height={height && height - controlsHeight}
            isMobile={false}
            isLoading={isLoading && insights.length === 0}
            showSearch={initialLoadCompleted}
            searchString={search}
            searchFieldSize="small"
            searchPlaceholder={intl.formatMessage({ id: "search_insights" })}
            onSearch={onSearch}
            disableAutofocus={!searchAutofocus}
            showTabs={initialLoadCompleted && !search}
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
                    const insightListSourceItem = getInsightListSourceItem(insight);
                    const isSelected = areObjRefsEqual(insight.insight.ref, selectedRef);

                    return (
                        <InsightListItem
                            title={title}
                            type={insightListSourceItem.insightType}
                            width={width}
                            isSelected={isSelected}
                            updated={insightUpdated(insightListSourceItem.insight)}
                            isLocked={insightIsLocked(insightListSourceItem.insight)}
                            onClick={() => onSelect && onSelect(insight)}
                        />
                    );
                })
            }
            renderNoData={({ hasNoMatchingData }) => (
                <InsightListNoData
                    isUserInsights={selectedTabId === messages.tabsMy.id}
                    hasNoMatchingData={hasNoMatchingData}
                    button={noDataButton}
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
