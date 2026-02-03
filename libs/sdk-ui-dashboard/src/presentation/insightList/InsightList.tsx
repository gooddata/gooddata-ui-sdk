// (C) 2022-2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect, useRef } from "react";

import { useIntl } from "react-intl";

import {
    type IInsight,
    areObjRefsEqual,
    insightCreated,
    insightIsLocked,
    insightSummary,
    insightTitle,
    insightUpdated,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type ITabsIds, useInsightPagedList } from "@gooddata/sdk-ui-ext";
import { DropdownList, type ITab, InsightListItem, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { InsightListNoData } from "./InsightListNoData.js";
import { type IInsightListProps } from "./types.js";
import { messages } from "../../locales.js";
import { createInsightRequested } from "../../model/events/lab.js";
import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import { selectBackendCapabilities } from "../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectAllowCreateInsightRequest,
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectSettings,
} from "../../model/store/config/configSelectors.js";
import { selectCanCreateVisualization } from "../../model/store/permissions/permissionsSelectors.js";
import {
    selectExecutionTimestamp,
    selectInsightListLastUpdateRequested,
} from "../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../model/store/user/userSelectors.js";
import { getAuthor } from "../../model/utils/author.js";
import { useDashboardComponentsContext } from "../dashboardContexts/DashboardComponentsContext.js";

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

const useAuthor = () => {
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const currentUser = useDashboardSelector(selectCurrentUser);
    return getAuthor(capabilities, currentUser);
};

const tabsIds: ITabsIds = { my: messages.tabsMy.id, all: messages.tabsAll.id };

/**
 * @internal
 */
export function InsightList({
    height,
    width = LIST_WIDTH,
    searchAutofocus,
    renderItem,
    selectedRef,
    onSelect,
}: IInsightListProps) {
    const intl = useIntl();

    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const author = useAuthor();
    const insightListLastUpdateRequested = useDashboardSelector(selectInsightListLastUpdateRequested);
    const canCreateVisualization = useDashboardSelector(selectCanCreateVisualization);
    const allowCreateInsightRequest = useDashboardSelector(selectAllowCreateInsightRequest);
    const settings = useDashboardSelector(selectSettings);
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const useReferences = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const { LoadingComponent } = useDashboardComponentsContext();

    const {
        items: insights,
        totalItemsCount: totalInsightsCount,
        isLoading,
        isNextPageLoading,
        initialLoadCompleted,
        search,
        selectedTabId,
        hasNextPage,
        skeletonItemsCount,
        shouldLoadNextPage,
        loadNextPage,
        onSearch,
        onTabSelect,
        loadInitialItems,
        resetItems,
    } = useInsightPagedList({
        backend,
        workspaceId,
        author,
        tabsIds,
    });

    const prevInsightListLastUpdateRequestedRef = useRef(insightListLastUpdateRequested);

    useEffect(() => {
        loadInitialItems();
    }, [loadInitialItems]);

    useEffect(() => {
        // Only refresh when insightListLastUpdateRequested actually changed
        if (insightListLastUpdateRequested !== prevInsightListLastUpdateRequestedRef.current) {
            resetItems();
        }
        prevInsightListLastUpdateRequestedRef.current = insightListLastUpdateRequested;
    }, [insightListLastUpdateRequested, resetItems]);

    const itemHeightGetter = (index: number) => {
        // Modify item heights for first/last item so that their hover states don't overlap.

        // Also @see styles and keep this value in sync with what's in css styles
        // for is-first and is-last in visualization items in the list
        const firstLastItemMargin = 10;

        const isFirstOrLast = totalInsightsCount ? index === 0 || index === totalInsightsCount - 1 : false;

        return isFirstOrLast ? ITEM_HEIGHT + firstLastItemMargin : ITEM_HEIGHT;
    };

    const eventDispatch = useDashboardEventDispatch();
    const createInsightRequestedEvent = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        eventDispatch(createInsightRequested());
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            tabs={backend.capabilities.supportsOwners && author ? dropdownTabsTranslationIds : undefined}
            selectedTabId={selectedTabId}
            onTabSelect={onTabSelect}
            itemHeight={ITEM_HEIGHT}
            itemHeightGetter={itemHeightGetter}
            items={insights}
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
                            updated={
                                insightUpdated(insightListSourceItem.insight) ??
                                insightCreated(insightListSourceItem.insight)
                            }
                            isLocked={insightIsLocked(insightListSourceItem.insight)}
                            onClick={() => onSelect?.(insight)}
                            metadataTimeZone={settings?.metadataTimeZone}
                            useRichText={useRichText}
                            useReferences={useReferences}
                            richTextExecConfig={{
                                timestamp: executionTimestamp,
                            }}
                            LoadingComponent={LoadingComponent}
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
            loadNextPage={loadNextPage}
            hasNextPage={hasNextPage}
            skeletonItemsCount={skeletonItemsCount}
            shouldLoadNextPage={shouldLoadNextPage}
            isNextPageLoading={isNextPageLoading}
            SkeletonItem={() => (
                <UiSkeleton
                    itemWidth={["100%"]}
                    direction="row"
                    itemPadding={15}
                    itemHeight={30}
                    itemsCount={1}
                    itemsGap={0}
                />
            )}
        />
    );
}
