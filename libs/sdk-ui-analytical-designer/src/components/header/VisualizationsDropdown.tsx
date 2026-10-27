// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useMemo } from "react";

import { isEmpty } from "lodash-es";
import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import {
    type IInsight,
    type ISemanticSearchResultItem,
    type ObjRef,
    insightCreated,
    insightId,
    insightIsLocked,
    insightSummary,
    insightTitle,
    insightUpdated,
    insightUri,
    insightVisualizationUrl,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";
import { useBackend } from "@gooddata/sdk-ui";
import { type ITabsIds, useInsightPagedList } from "@gooddata/sdk-ui-ext";
import {
    Dropdown,
    DropdownButton,
    DropdownList,
    InsightListItem,
    NoData,
    UiIcon,
    UiSkeleton,
} from "@gooddata/sdk-ui-kit";
import {
    type HybridSearchItemBuilder,
    type SearchItemGroup,
    customMatcher,
    useHybridSearch,
} from "@gooddata/sdk-ui-semantic-search";

import { deleteReport } from "../../actions/delete_actions.js";
import { openReport } from "../../actions/open_actions.js";
import { descriptionTooltipOpened } from "../../sagas/description_tooltip/description_tooltip_ui_actions.js";
import { isOwnershipSupported, supportsObjectUris } from "../../selectors/backend_capabilities_selector.js";
import { getProjectId, getUserLoginMD5, getUserUri } from "../../selectors/bootstrap_selector.js";
import {
    enableCatalogSmartSearchResults,
    enableVisualizationFilteringByTags,
    getMetadataTimeZone,
} from "../../selectors/feature_flag_selector.js";
import { canOpenReport } from "../../selectors/open_report_selector.js";
import { openReportIdSelector } from "../../selectors/report_selector.js";
import { getTagsConfiguration } from "../../selectors/route_selector.js";
import { getEnabledVisualizationClassesUrls } from "../../services/visualization_class_service.js";
import { getIsReadOnlyMode } from "../../store/embedding/embedding_selectors.js";
import { type AppDispatch } from "../../store/types.js";

const INSIGHT_DROPDOWN_MY_TAB_ID = defineMessage({ id: "gs.visualizationsList.tabs.my" }).id;

const INSIGHT_DROPDOWN_ALL_TAB_ID = defineMessage({ id: "gs.visualizationsList.tabs.all" }).id;

const dropdownTabsTranslationIds = [{ id: INSIGHT_DROPDOWN_MY_TAB_ID }, { id: INSIGHT_DROPDOWN_ALL_TAB_ID }];

const SEMANTIC_SEARCH_OBJECT_TYPES: ["visualization"] = ["visualization"];

const insightItemBuilder: HybridSearchItemBuilder<IInsight["insight"]> = (
    item: ISemanticSearchResultItem,
    { ref },
) => ({
    ref,
    ...ref,
    identifier: item.id,
    uri: item.id,
    title: item.title,
    tags: item.tags,
    filters: [],
    visualizationUrl: item.visualizationUrl ?? "",
    buckets: [],
    sorts: [],
    properties: {},
    created: item.createdAt,
    updated: item.modifiedAt,
});

interface IInsightGroup extends SearchItemGroup<IInsight["insight"]> {
    identifier?: string;
}

const isDisabledSelector = createSelector([canOpenReport], (canOpenReport) => !canOpenReport);

const authorSelector = createSelector(
    supportsObjectUris,
    getUserUri,
    getUserLoginMD5,
    (isObjectUriSupported, userUri, userLoginMd5) => {
        return isObjectUriSupported ? userUri : userLoginMd5;
    },
);

const tabsIds: ITabsIds = { my: INSIGHT_DROPDOWN_MY_TAB_ID, all: INSIGHT_DROPDOWN_ALL_TAB_ID };
const divider = { divider: true };

export function VisualizationsDropdown() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const workspaceId = useSelector(getProjectId);
    const author = useSelector(authorSelector);
    const isDisabled = useSelector(isDisabledSelector);
    const openInsightId = useSelector(openReportIdSelector);
    const enabledVisualizationClassesUrls: string[] = useSelector(getEnabledVisualizationClassesUrls);
    const hasOwnershipSupport = useSelector(isOwnershipSupported);
    const isSmartSearchResultsEnabled = useSelector(enableCatalogSmartSearchResults);
    const metadataTimeZone = useSelector(getMetadataTimeZone);
    const isFilteringByTagsEnabled = useSelector(enableVisualizationFilteringByTags);
    const tagsConfiguration = useSelector(getTagsConfiguration);
    const isReadOnly = useSelector(getIsReadOnlyMode);

    const onOpenInsight = useCallback(
        (insightRef: ObjRef) => {
            dispatch(openReport(insightRef, false));
        },
        [dispatch],
    );

    const onDeleteInsight = useCallback(
        (insightRef: ObjRef, title: string) => {
            dispatch(deleteReport(insightRef, false, { title }));
        },
        [dispatch],
    );

    const onDescriptionTooltipOpened = useCallback(
        (description: string) => {
            dispatch(descriptionTooltipOpened(description));
        },
        [dispatch],
    );

    const buttonText = intl.formatMessage({ id: "openReportPlaceholder" });

    const backend = useBackend();

    // Extract tag identifiers from tags configuration only when the feature flag is enabled
    // Tags come as ObjRef (idRef) from route selector, extract identifier directly as the method expects
    // just strings
    const [tags, excludeTags] = useMemo(() => {
        const tags = isFilteringByTagsEnabled
            ? tagsConfiguration?.includeObjectsWithTags?.map((tag) => objRefToString(tag))
            : undefined;
        const excludeTags = isFilteringByTagsEnabled
            ? tagsConfiguration?.excludeObjectsWithTags?.map((tag) => objRefToString(tag))
            : undefined;
        return [tags, excludeTags];
    }, [isFilteringByTagsEnabled, tagsConfiguration]);

    const {
        items,
        totalItemsCount: totalInsightsCount,
        isLoading,
        isNextPageLoading,
        initialLoadCompleted,
        search,
        selectedTabId,
        hasNextPage,
        skeletonItemsCount,
        fetchItems,
        loadNextPage,
        onSearch,
        onTabSelect,
        reset,
    } = useInsightPagedList({
        backend,
        workspaceId,
        author,
        tabsIds,
        tags,
        excludeTags,
    });

    const matcher = useMemo(
        () => customMatcher<IInsight["insight"], IInsightGroup>(["title", "summary", "identifier"]),
        [],
    );

    const { search: hybridSearch, onSearchQueryChange: setHybridSearchQuery } = useHybridSearch<
        IInsight["insight"],
        never
    >({
        objectTypes: SEMANTIC_SEARCH_OBJECT_TYPES,
        allowSematicSearch: isSmartSearchResultsEnabled,
        itemBuilder: insightItemBuilder,
        includeTags: tags,
        excludeTags,
        matcher,
    });

    useEffect(() => {
        setHybridSearchQuery(search);
    }, [search, setHybridSearchQuery]);

    const { semanticSearchState, searchRelatedItems } = useMemo(
        () => hybridSearch({ items: items.map((insight) => insight.insight) }),
        [hybridSearch, items],
    );
    const isRelatedLoading = semanticSearchState.state === "loading";

    const totalItems =
        (totalInsightsCount ?? items.length) +
        (isRelatedLoading ? 4 : searchRelatedItems.length + (searchRelatedItems.length ? 1 : 0));
    const loadingItemsCount = skeletonItemsCount + (isRelatedLoading ? 4 : 0);

    const insights = useMemo(
        () => [
            ...items,
            ...(isRelatedLoading
                ? [divider]
                : [
                      ...(searchRelatedItems.length ? [divider] : []),
                      ...searchRelatedItems.map((insight) => ({ insight })),
                  ]),
        ],
        [items, searchRelatedItems, isRelatedLoading],
    );

    const shouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number) => lastItemIndex >= itemsCount - 5,
        [],
    );

    const handleOpenStateChanged = useCallback(
        (opened: boolean) => {
            if (opened) {
                // Fetch initial items when dropdown opens
                void fetchItems({ page: 0, search: "", tabId: selectedTabId, resetItems: true });
            } else {
                reset();
            }
        },
        [fetchItems, selectedTabId, reset],
    );

    return (
        <Dropdown
            className="s-report_select report-select editor-header-item"
            closeOnMouseDrag
            alignPoints={[
                {
                    align: "br tr",
                },
            ]}
            onOpenStateChanged={handleOpenStateChanged}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    className="type-metric customizable"
                    value={buttonText}
                    disabled={isDisabled}
                    onClick={toggleDropdown}
                    isOpen={isOpen}
                    isSmall={false}
                />
            )}
            renderBody={({ closeDropdown, isMobile }) => {
                return (
                    <div className="open-visualizations s-open-visualizations">
                        <DropdownList
                            width={350}
                            isMobile={isMobile}
                            isLoading={isLoading ? items.length === 0 : null}
                            showSearch={initialLoadCompleted}
                            searchString={search}
                            searchFieldSize="small"
                            searchPlaceholder={intl.formatMessage({ id: "search_insights" })}
                            onSearch={onSearch}
                            showTabs={hasOwnershipSupport && initialLoadCompleted ? !search : null}
                            tabs={dropdownTabsTranslationIds}
                            selectedTabId={isEmpty(search) ? selectedTabId : INSIGHT_DROPDOWN_ALL_TAB_ID}
                            onTabSelect={onTabSelect}
                            itemHeight={40}
                            items={insights}
                            itemsCount={totalItems}
                            maxHeight={200}
                            loadNextPage={loadNextPage}
                            hasNextPage={hasNextPage || isRelatedLoading}
                            skeletonItemsCount={loadingItemsCount}
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
                            body={() => {
                                if (!isLoading && items.length === 0 && searchRelatedItems.length > 0) {
                                    return (
                                        <NoData
                                            notFoundLabel={intl.formatMessage({
                                                id: "visualizationsList.noVisualizationsFound",
                                            })}
                                            noDataLabel={intl.formatMessage({
                                                id: "visualizationsList.noVisualizations",
                                            })}
                                            hasNoMatchingData
                                        />
                                    );
                                }
                                return null;
                            }}
                            renderItem={({ item: insight, width }) => {
                                if ("divider" in insight) {
                                    return (
                                        <div className="gd-visualizations-related-header">
                                            <UiIcon type="genai" size={12} color="complementary-6" />
                                            <span>
                                                {intl.formatMessage({ id: "catalog.group_title.suggestion" })}
                                            </span>
                                        </div>
                                    );
                                }

                                const {
                                    title,
                                    description,
                                    identifier,
                                    uri,
                                    isLocked,
                                    created,
                                    updated,
                                    visualizationUrl,
                                } = createStructuredSelector({
                                    title: insightTitle,
                                    description: insightSummary,
                                    identifier: insightId,
                                    uri: insightUri,
                                    isLocked: insightIsLocked,
                                    created: insightCreated,
                                    updated: insightUpdated,
                                    visualizationUrl: insightVisualizationUrl,
                                })(insight);

                                // "unknown" type renders "?" icon for deprecated vis classes
                                const type =
                                    (enabledVisualizationClassesUrls.includes(visualizationUrl) &&
                                        visualizationUrl?.split(":")[1]) ||
                                    "unknown";
                                const isSelected = identifier === openInsightId;
                                const insightUriRef = uriRef(uri);

                                // TODO: tiger does not have roles yet. It does, however have concept
                                //  of parent-child workspaces and inheritance of objects. Inherited objects are locked
                                //  and read-only. Thus the extra tiger backend check here. Once the tiger has
                                //  ACLs and true read-only indicators, we can clean this up.
                                return (
                                    <InsightListItem
                                        title={title}
                                        description={description?.trim()}
                                        showDescriptionPanel
                                        type={type}
                                        width={width}
                                        updated={updated ?? created}
                                        isLocked={isLocked}
                                        isSelected={isSelected}
                                        onDelete={
                                            !isReadOnly &&
                                            !isLocked &&
                                            (() => {
                                                closeDropdown();
                                                onDeleteInsight(insightUriRef, title);
                                            })
                                        }
                                        onClick={() => {
                                            closeDropdown();
                                            onOpenInsight(insightUriRef);
                                        }}
                                        onDescriptionPanelOpen={() => {
                                            onDescriptionTooltipOpened(description);
                                        }}
                                        metadataTimeZone={metadataTimeZone}
                                    />
                                );
                            }}
                            renderNoData={({ hasNoMatchingData }) => (
                                <NoData
                                    notFoundLabel={intl.formatMessage({
                                        id: "visualizationsList.noVisualizationsFound",
                                    })}
                                    noDataLabel={intl.formatMessage({
                                        id: "visualizationsList.noVisualizations",
                                    })}
                                    hasNoMatchingData={hasNoMatchingData}
                                />
                            )}
                        />
                    </div>
                );
            }}
        />
    );
}
