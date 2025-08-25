// (C) 2025 GoodData Corporation
import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTable, type UiAsyncTableColumn, useElementSize } from "@gooddata/sdk-ui-kit";

import { createdByColumn } from "./columns/CreatedByColumn.js";
import { updatedAtColumn } from "./columns/ModifiedColumn.js";
import { tagsColumn } from "./columns/TagsColumn.js";
import { titleColumn } from "./columns/TitleColumn.js";
import type { ICatalogItem } from "../catalogItem/types.js";

export interface ITableProps {
    items: ICatalogItem[];
    onTagClick?: (tag: string) => void;
}

export function Table({ items, onTagClick }: ITableProps) {
    const intl = useIntl();
    const { ref, height } = useElementSize<HTMLDivElement>();

    const columns: UiAsyncTableColumn<ICatalogItem>[] = useMemo(() => {
        return [
            titleColumn(intl, 400),
            createdByColumn(intl, 200),
            tagsColumn(intl, 300, onTagClick),
            updatedAtColumn(intl, 200),
        ];
    }, [intl, onTagClick]);

    return (
        <div className="gd-analytics-catalog__table" ref={ref}>
            <UiAsyncTable<ICatalogItem>
                totalItemsCount={items.length + 2}
                //skeletonItemsCount={2}
                items={items}
                columns={columns}
                onItemClick={() => {
                    //TODO: handle row click
                }}
                //paging
                isLoading={false}
                hasNextPage={true}
                loadNextPage={() => {
                    //TODO: load next page
                }}
                maxHeight={height}
            />
        </div>
    );
}
