// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    UiAsyncTable,
    type UiAsyncTableColumn,
    UiAsyncTableEmptyState,
    UiAsyncTableRowHeightNormal,
    UiAsyncTableScrollbarWidth,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { createdByColumn } from "./columns/CreatedByColumn.js";
import { updatedAtColumn } from "./columns/ModifiedColumn.js";
import { tagsColumn } from "./columns/TagsColumn.js";
import { titleColumn } from "./columns/TitleColumn.js";
import type { AsyncStatus } from "../async/index.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { useFullTextSearchState } from "../search/index.js";

const tableWidth = 1100;

export interface ITableProps {
    status: AsyncStatus;
    items: ICatalogItem[];
    totalCount: number;
    next: () => Promise<void>;
    hasNext: boolean;
    onTagClick?: (tag: string) => void;
    onItemClick?: (item: ICatalogItem) => void;
}

export function Table({ items, status, next, hasNext, totalCount, onTagClick, onItemClick }: ITableProps) {
    const intl = useIntl();
    const { searchTerm } = useFullTextSearchState();
    const { ref, height, width } = useElementSize<HTMLDivElement>();
    const availableWidth = (width > 0 ? width : tableWidth) - UiAsyncTableScrollbarWidth;

    // NOTE: UiAsyncTable is using its own react-intl provider, so we need to pass the intl to the columns directly
    const columns: UiAsyncTableColumn<ICatalogItem>[] = useMemo(() => {
        return [
            titleColumn(intl, getColumnWidth(availableWidth, 400)),
            createdByColumn(intl, getColumnWidth(availableWidth, 200)),
            tagsColumn(intl, getColumnWidth(availableWidth, 300), onTagClick),
            updatedAtColumn(intl, getColumnWidth(availableWidth, 200)),
        ];
    }, [intl, onTagClick, availableWidth]);

    const isLoading = status === "loading" || status === "idle";
    const isSearching = searchTerm.length > 0;
    const effectiveItems = useMemo(() => items.map((item) => ({ ...item, id: item.identifier })), [items]);
    const skeletonItemsCount = isLoading ? 3 : totalCount - items.length;

    return (
        <div className="gd-analytics-catalog__table" ref={ref}>
            <UiAsyncTable<ICatalogItem & { id: string }>
                totalItemsCount={totalCount}
                skeletonItemsCount={skeletonItemsCount}
                items={effectiveItems}
                columns={columns}
                //paging
                hasNextPage={hasNext}
                loadNextPage={next}
                maxHeight={height - UiAsyncTableRowHeightNormal}
                isLoading={isLoading}
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
