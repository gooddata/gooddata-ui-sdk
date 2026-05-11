// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { idRef, insightId, uriRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { DropdownList, Input, NoData, UiSkeleton, isEscapeKey } from "@gooddata/sdk-ui-kit";

import {
    type ITabsIds,
    useInsightPagedList,
} from "../internal/components/insightList/useInsightPagedList.js";

import { InsightPickerFilterBar } from "./InsightPickerFilterBar.js";
import { InsightPickerRow } from "./InsightPickerRow.js";
import { messages } from "./messages.js";
import { type IInsightPickerItem, type IInsightPickerProps } from "./types.js";
import { useInsightPickerFilters } from "./useInsightPickerFilters.js";
import { useInsightPickerHybridSearch } from "./useInsightPickerHybridSearch.js";

// These tab identifiers are internal keys for useInsightPagedList state — not i18n IDs.
const tabsIds: ITabsIds = { my: "my", all: "all" };

export function InsightPickerCore({
    backend: backendProp,
    workspace: workspaceProp,
    includeTags,
    excludeTags,
    author,
    enabledVisualizationClassesUrls = [],
    selectedInsightId,
    enableDescriptions,
    metadataTimeZone,
    searchQuery,
    onSearchChange,
    sortBy,
    sortDirection,
    onSortChange,
    authorFilter,
    onAuthorFilterChange,
    tagFilter,
    onTagFilterChange,
    enableSemanticSearch = true,
    maxHeight = 350,
    width = 700,
    onSelect,
    onDescriptionPanelOpen,
    onItemActivate,
    menuActions,
    renderMenu,
    renderItem: renderItemProp,
}: IInsightPickerProps) {
    const intl = useIntl();
    const backend = useBackendStrict(backendProp);
    const workspace = useWorkspaceStrict(workspaceProp);

    const hasMenu = !!(menuActions?.length || renderMenu);

    // --- Filter options from API ---
    const {
        authorOptions: authorFilterOptions,
        tagOptions: tagFilterOptions,
        authorsLoaded,
        tagsLoaded,
    } = useInsightPickerFilters(backend, workspace, author);

    // --- Effective tags for the query (combine user selection with URL scope) ---
    const effectiveTags = useMemo(() => {
        if (tagFilter.length > 0) {
            return includeTags?.length ? tagFilter.filter((t) => includeTags.includes(t)) : tagFilter;
        }
        return includeTags;
    }, [tagFilter, includeTags]);

    // --- Fetch insights ---
    const {
        items: insights,
        totalItemsCount: totalInsightsCount,
        isLoading,
        isNextPageLoading,
        initialLoadCompleted,
        hasNextPage,
        skeletonItemsCount,
        loadNextPage,
        loadInitialItems,
        resetItems,
    } = useInsightPagedList({
        backend,
        workspaceId: workspace,
        author,
        tabsIds,
        tags: effectiveTags,
        excludeTags,
        sortBy,
        sortDirection,
        createdByFilter: authorFilter.length > 0 ? authorFilter : undefined,
        includeAuthorInfo: true,
    });

    // Fetch on mount
    useEffect(() => {
        loadInitialItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload when sorting or filters change (after initial load)
    const sortingKey = `${sortBy ?? ""},${sortDirection}`;
    const authorFilterKey = authorFilter.join(",");
    const tagFilterKey = tagFilter.join(",");
    const prevKeys = useRef({ sortingKey, authorFilterKey, tagFilterKey });
    useEffect(() => {
        const prev = prevKeys.current;
        if (
            sortingKey !== prev.sortingKey ||
            authorFilterKey !== prev.authorFilterKey ||
            tagFilterKey !== prev.tagFilterKey
        ) {
            prevKeys.current = { sortingKey, authorFilterKey, tagFilterKey };
            resetItems();
        }
    }, [sortingKey, authorFilterKey, tagFilterKey, resetItems]);

    // --- Insight lookup ---
    const insightsByIdentifier = useMemo(
        () => new Map(insights.map((insight) => [insightId(insight), insight])),
        [insights],
    );

    // --- Hybrid search ---
    const { searchState, semanticSearchState, displayItems, isSearching, handleSearchChange } =
        useInsightPickerHybridSearch({
            insights,
            searchQuery,
            onSearchChange,
            enableSemanticSearch,
            includeTags,
            excludeTags,
        });

    const totalItems = isSearching ? displayItems.length : (totalInsightsCount ?? insights.length);

    const shouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number) => lastItemIndex >= itemsCount - 5,
        [],
    );

    const handleItemClick = useCallback(
        (entry: IInsightPickerItem) => {
            const entryRef = entry.uri ? uriRef(entry.uri) : idRef(entry.identifier, "insight");
            onSelect(entryRef, entry);
        },
        [onSelect],
    );

    return (
        <div className="gd-ui-ext-insight-picker">
            {initialLoadCompleted ? (
                <>
                    <div
                        className="gd-ui-ext-insight-picker-search"
                        onKeyDown={(e) => {
                            if (isEscapeKey(e) && searchState.query) {
                                e.stopPropagation();
                                handleSearchChange("");
                            }
                            // When search is empty, let Esc propagate to close the dialog
                        }}
                    >
                        <Input
                            isSearch
                            autofocus
                            placeholder={intl.formatMessage(messages.searchPlaceholder)}
                            value={searchState.query}
                            onChange={(value) => handleSearchChange(String(value))}
                        />
                    </div>
                    <InsightPickerFilterBar
                        author={author}
                        authorFilterOptions={authorFilterOptions}
                        tagFilterOptions={tagFilterOptions}
                        authorsLoaded={authorsLoaded}
                        tagsLoaded={tagsLoaded}
                        includeTags={includeTags}
                        excludeTags={excludeTags}
                        authorFilter={authorFilter}
                        tagFilter={tagFilter}
                        onAuthorFilterChange={onAuthorFilterChange}
                        onTagFilterChange={onTagFilterChange}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={onSortChange}
                    />
                </>
            ) : null}
            <DropdownList
                width={width}
                isMobile={false}
                isLoading={
                    isSearching
                        ? semanticSearchState.state === "loading" && displayItems.length === 0
                        : isLoading
                          ? insights.length === 0
                          : undefined
                }
                showSearch={false}
                onKeyDownConfirm={(entry) => {
                    if (onItemActivate) {
                        const sourceInsight = insightsByIdentifier.get(entry.identifier);
                        onItemActivate(entry, sourceInsight);
                    } else {
                        handleItemClick(entry);
                    }
                }}
                itemHeight={50}
                items={displayItems}
                itemsCount={totalItems}
                maxHeight={maxHeight}
                loadNextPage={isSearching ? undefined : loadNextPage}
                hasNextPage={isSearching ? false : hasNextPage}
                skeletonItemsCount={isSearching ? 0 : skeletonItemsCount}
                isNextPageLoading={isSearching ? false : isNextPageLoading}
                shouldLoadNextPage={isSearching ? undefined : shouldLoadNextPage}
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
                renderItem={({ item: entry, width: itemWidth }) => {
                    const type =
                        (enabledVisualizationClassesUrls.includes(entry.visualizationUrl) &&
                            entry.visualizationUrl?.split(":")[1]) ||
                        "unknown";
                    const isSelected = entry.identifier === selectedInsightId;

                    if (renderItemProp) {
                        const sourceInsight = insightsByIdentifier.get(entry.identifier);
                        return renderItemProp({
                            item: entry,
                            type,
                            width: itemWidth,
                            isSelected,
                            sourceInsight,
                        });
                    }
                    return (
                        <InsightPickerRow
                            entry={entry}
                            type={type}
                            width={itemWidth}
                            isSelected={isSelected}
                            hasMenu={hasMenu}
                            enableDescriptions={enableDescriptions}
                            metadataTimeZone={metadataTimeZone}
                            menuActions={menuActions}
                            renderMenu={renderMenu}
                            onItemClick={handleItemClick}
                            onDescriptionPanelOpen={onDescriptionPanelOpen}
                        />
                    );
                }}
                renderNoData={({ hasNoMatchingData }) => (
                    <NoData
                        notFoundLabel={intl.formatMessage(messages.noInsightsFound)}
                        noDataLabel={intl.formatMessage(messages.noInsights)}
                        hasNoMatchingData={hasNoMatchingData}
                    />
                )}
            />
        </div>
    );
}
