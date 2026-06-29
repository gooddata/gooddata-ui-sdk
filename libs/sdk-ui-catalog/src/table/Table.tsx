// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";
import {
    type IUiAsyncTableColumn,
    UiAsyncTable,
    UiAsyncTableEmptyState,
    UiAsyncTableRowHeightNormal,
    UiAsyncTableScrollbarWidth,
    UiSearchResultsAnnouncement,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { type AsyncStatus } from "../async/types.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { useFullTextSearchState } from "../search/FullTextSearchContext.js";

import { createdByColumn } from "./columns/CreatedByColumn.js";
import { updatedAtColumn } from "./columns/ModifiedColumn.js";
import { tagsColumn } from "./columns/TagsColumn.js";
import { titleColumn } from "./columns/TitleColumn.js";

const tableWidth = 1100;

export interface ITableProps {
    status: AsyncStatus;
    items: ICatalogItem[];
    relatedItems: ICatalogItem[];
    relatedItemsStatus: AsyncStatus;
    totalCount: number;
    next: () => Promise<void>;
    hasNext: boolean;
    onTagClick?: (tag: string) => void;
    onItemClick?: (item: ICatalogItem) => void;
}

export function Table({
    items,
    status,
    next,
    hasNext,
    totalCount,
    relatedItemsStatus,
    relatedItems,
    onTagClick,
    onItemClick,
}: ITableProps) {
    const intl = useIntl();
    const { searchTerm } = useFullTextSearchState();
    const { ref, height, width } = useElementSize<HTMLDivElement>();
    const availableWidth = (width > 0 ? width : tableWidth) - UiAsyncTableScrollbarWidth;

    // NOTE: UiAsyncTable is using its own react-intl provider, so we need to pass the intl to the columns directly
    const columns: IUiAsyncTableColumn<ICatalogItem>[] = useMemo(() => {
        return [
            titleColumn(intl, getColumnWidth(availableWidth, 400)),
            createdByColumn(intl, getColumnWidth(availableWidth, 200)),
            tagsColumn(intl, getColumnWidth(availableWidth, 300), onTagClick),
            updatedAtColumn(intl, getColumnWidth(availableWidth, 200)),
        ];
    }, [intl, onTagClick, availableWidth]);

    const isLoading = status === "loading" || status === "idle";
    const isRelatedLoading = relatedItemsStatus === "loading";
    const isSearching = searchTerm.length > 0;
    const effectiveItems = useMemo(
        () => [...items, ...relatedItems].map((item) => ({ ...item, id: item.identifier })),
        [items, relatedItems],
    );
    const skeletonItemsCount = isLoading
        ? 3
        : totalCount - effectiveItems.length + (isRelatedLoading ? 3 : 0);
    const announcedTotalResults = isSearching && status === "success" ? totalCount : undefined;

    if (status === "error") {
        return (
            <ErrorComponent
                message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                description={intl.formatMessage({ id: "analyticsCatalog.error.unknown.description" })}
                width="100%"
            />
        );
    }

    return (
        <div className="gd-analytics-catalog__table" ref={ref}>
            <UiSearchResultsAnnouncement totalResults={announcedTotalResults} />
            <UiAsyncTable<ICatalogItem & { id: string }>
                totalItemsCount={totalCount}
                skeletonItemsCount={skeletonItemsCount}
                items={effectiveItems}
                columns={columns}
                //paging
                hasNextPage={hasNext}
                loadNextPage={() => {
                    void next();
                }}
                maxHeight={height - UiAsyncTableRowHeightNormal}
                isLoading={isLoading || (items.length === 0 && isRelatedLoading)}
                //events
                onItemClick={onItemClick}
                //renderers
                renderEmptyState={() => {
                    if (isSearching) {
                        return (
                            <UiAsyncTableEmptyState
                                icon="search"
                                title={intl.formatMessage({ id: "analyticsCatalog.empty.search.title" })}
                                description={intl.formatMessage({
                                    id: "analyticsCatalog.empty.search.description",
                                })}
                            />
                        );
                    }
                    return (
                        <UiAsyncTableEmptyState
                            icon="drawerEmpty"
                            title={intl.formatMessage({ id: "analyticsCatalog.empty.filters.title" })}
                            description={intl.formatMessage({
                                id: "analyticsCatalog.empty.filters.description",
                            })}
                        />
                    );
                }}
            />
        </div>
    );
}

function getColumnWidth(availableWidth: number, desiredWidth: number) {
    return Math.round((availableWidth * desiredWidth) / tableWidth);
}
