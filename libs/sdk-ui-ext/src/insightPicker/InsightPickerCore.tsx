// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { idRef, insightId } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { DropdownList, Input, NoData, UiSkeleton, isEscapeKey } from "@gooddata/sdk-ui-kit";

import {
    type ITabsIds,
    useInsightPagedList,
} from "../internal/components/insightList/useInsightPagedList.js";

import { InsightPickerFilterBar } from "./InsightPickerFilterBar.js";
import { InsightPickerRow } from "./InsightPickerRow.js";
import { InsightPickerSuggestionsHeader } from "./InsightPickerSuggestionsHeader.js";
import { messages } from "./messages.js";
import { type IInsightPickerItem, type IInsightPickerProps } from "./types.js";
import { useInsightPickerFilters } from "./useInsightPickerFilters.js";
import { useInsightPickerHybridSearch } from "./useInsightPickerHybridSearch.js";

// These tab identifiers are internal keys for useInsightPagedList state — not i18n IDs.
const tabsIds: ITabsIds = { my: "my", all: "all" };

const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_RELATED_ITEMS: readonly IInsightPickerItem[] = [];

// Clearing the field applies at once — waiting out a debounce to show the full list again reads
// as the picker being stuck.
function useDebouncedSearchQuery(searchQuery: string, delayMs: number): string {
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    useEffect(() => {
        if (searchQuery === "") {
            setDebouncedQuery("");
            return undefined;
        }
        const timeout = setTimeout(() => setDebouncedQuery(searchQuery), delayMs);
        return () => clearTimeout(timeout);
    }, [searchQuery, delayMs]);

    return debouncedQuery;
}

const ITEM_HEIGHT = 50;
const SUGGESTIONS_HEADER_HEIGHT = 30;

export function InsightPickerCore({
    backend: backendProp,
    workspace: workspaceProp,
    includeTags,
    excludeTags,
    author,
    enabledVisualizationClassesUrls = [],
    selectedInsightId,
    metadataTimeZone,
    searchQuery,
    onSearchChange,
    sortBy,
    sortDirection,
    onSortChange,
    authorFilter,
    onAuthorFilterChange,
    isAuthorFilterModified,
    tagFilter,
    onTagFilterChange,
    enableSemanticSearch = false,
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

    // The list is paged, so only the server can answer a search over every visualization. The
    // debounce keeps one query per pause in typing rather than one per keystroke.
    const debouncedSearchQuery = useDebouncedSearchQuery(searchQuery, SEARCH_DEBOUNCE_MS);

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
        searchTerm: debouncedSearchQuery,
    });

    // Fetch on mount
    useEffect(() => {
        loadInitialItems();
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortingKey = `${sortBy ?? ""},${sortDirection}`;
    const authorFilterKey = authorFilter.join(",");
    const tagFilterKey = tagFilter.join(",");
    const searchKey = debouncedSearchQuery;
    // Holds the filters the loaded items belong to. The reload effect below advances it.
    const prevKeys = useRef({ sortingKey, authorFilterKey, tagFilterKey, searchKey });

    // The picker opens filtered to the current user. A user who authored nothing would face an
    // empty picker, so drop that default and let the reload below fetch every author. The filter
    // state must change, not just one query: every page is fetched from this state.
    //
    // Three things narrow this to the case it is meant for. The default must be untouched, which
    // only the caller can say — this component remounts every time the picker is reopened, while
    // the filter it would drop does not. No tag may be selected, so the author default is the only
    // filter the empty count can be blamed on; widening it under a tag the user chose would answer
    // a query they did not ask. And the count must belong to the filters now in force: clearing a
    // tag renders once with the tag gone but the tag query's count still in place, and acting on
    // that would drop the author before the reload can show it has insights after all.
    //
    // This effect must stay ahead of the reload effect, which is what makes the last check work.
    const isUntouchedAuthorDefault =
        !isAuthorFilterModified && !!author && authorFilter.length === 1 && authorFilter[0] === author;
    const mayDropAuthorDefault = isUntouchedAuthorDefault && tagFilter.length === 0 && searchKey === "";
    useEffect(() => {
        const prev = prevKeys.current;
        const isCountStale =
            sortingKey !== prev.sortingKey ||
            authorFilterKey !== prev.authorFilterKey ||
            tagFilterKey !== prev.tagFilterKey ||
            searchKey !== prev.searchKey;

        if (!isCountStale && initialLoadCompleted && totalInsightsCount === 0 && mayDropAuthorDefault) {
            onAuthorFilterChange([]);
        }
    }, [
        initialLoadCompleted,
        totalInsightsCount,
        mayDropAuthorDefault,
        onAuthorFilterChange,
        sortingKey,
        authorFilterKey,
        tagFilterKey,
        searchKey,
    ]);

    // Reload when sorting, filters or the search term change (after initial load)
    useEffect(() => {
        const prev = prevKeys.current;
        if (
            sortingKey !== prev.sortingKey ||
            authorFilterKey !== prev.authorFilterKey ||
            tagFilterKey !== prev.tagFilterKey ||
            searchKey !== prev.searchKey
        ) {
            prevKeys.current = { sortingKey, authorFilterKey, tagFilterKey, searchKey };
            resetItems();
        }
    }, [sortingKey, authorFilterKey, tagFilterKey, searchKey, resetItems]);

    // --- Insight lookup ---
    const insightsByIdentifier = useMemo(
        () => new Map(insights.map((insight) => [insightId(insight), insight])),
        [insights],
    );

    // --- Hybrid search ---
    const { searchState, semanticSearchState, searchEntries, relatedItems, isSearching, handleSearchChange } =
        useInsightPickerHybridSearch({
            insights,
            searchQuery,
            onSearchChange,
            enableSemanticSearch,
            includeTags,
            excludeTags,
        });

    // Semantic hits are appended below the literal matches, so they may only be shown once every
    // page of those matches is in. Otherwise the next page would push them further down the list.
    // A reload reports no next page until the first page of the new query lands, so the loading
    // flags and the debounce have to be checked too — `hasNextPage` alone is false in that window.
    const isLiteralSearchComplete =
        searchState.query === debouncedSearchQuery && !isLoading && !isNextPageLoading && !hasNextPage;
    const appendedRelatedItems = isSearching && isLiteralSearchComplete ? relatedItems : EMPTY_RELATED_ITEMS;
    const displayItems = useMemo(
        () => [...searchEntries, ...appendedRelatedItems],
        [searchEntries, appendedRelatedItems],
    );

    const totalItems = (totalInsightsCount ?? insights.length) + appendedRelatedItems.length;

    // The group label rides on the first suggestion rather than on a row of its own, which would
    // take a keyboard stop the user cannot act on.
    const suggestionsHeaderIndex = appendedRelatedItems.length > 0 ? searchEntries.length : -1;

    const shouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number) => lastItemIndex >= itemsCount - 5,
        [],
    );

    const itemHeightGetter = useCallback(
        (index: number) =>
            index === suggestionsHeaderIndex ? ITEM_HEIGHT + SUGGESTIONS_HEADER_HEIGHT : ITEM_HEIGHT,
        [suggestionsHeaderIndex],
    );

    const handleItemClick = useCallback(
        (entry: IInsightPickerItem) => onSelect(idRef(entry.identifier, "insight"), entry),
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
                    isLoading
                        ? insights.length === 0
                        : isSearching && semanticSearchState.state === "loading"
                          ? displayItems.length === 0
                          : undefined
                }
                showSearch={false}
                searchString={searchState.query}
                onKeyDownConfirm={(entry) => {
                    if (onItemActivate) {
                        const sourceInsight = insightsByIdentifier.get(entry.identifier);
                        onItemActivate(entry, sourceInsight);
                    } else {
                        handleItemClick(entry);
                    }
                }}
                itemHeight={ITEM_HEIGHT}
                itemHeightGetter={itemHeightGetter}
                items={displayItems}
                itemsCount={totalItems}
                maxHeight={maxHeight}
                loadNextPage={loadNextPage}
                hasNextPage={hasNextPage}
                skeletonItemsCount={skeletonItemsCount}
                isNextPageLoading={isNextPageLoading}
                shouldLoadNextPage={shouldLoadNextPage}
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
                renderItem={({ item: entry, rowIndex, width: itemWidth }) => {
                    const type =
                        (enabledVisualizationClassesUrls.includes(entry.visualizationUrl) &&
                            entry.visualizationUrl?.split(":")[1]) ||
                        "unknown";
                    const isSelected = entry.identifier === selectedInsightId;

                    const row = renderItemProp ? (
                        renderItemProp({
                            item: entry,
                            type,
                            width: itemWidth,
                            isSelected,
                            sourceInsight: insightsByIdentifier.get(entry.identifier),
                        })
                    ) : (
                        <InsightPickerRow
                            entry={entry}
                            type={type}
                            width={itemWidth}
                            isSelected={isSelected}
                            hasMenu={hasMenu}
                            metadataTimeZone={metadataTimeZone}
                            menuActions={menuActions}
                            renderMenu={renderMenu}
                            onItemClick={handleItemClick}
                            onDescriptionPanelOpen={onDescriptionPanelOpen}
                        />
                    );

                    return rowIndex === suggestionsHeaderIndex ? (
                        <div className="gd-ui-ext-insight-picker-suggestions-group">
                            <InsightPickerSuggestionsHeader />
                            {row}
                        </div>
                    ) : (
                        row
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
