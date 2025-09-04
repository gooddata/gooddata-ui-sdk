// (C) 2025 GoodData Corporation

import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ErrorComponent } from "@gooddata/sdk-ui";

import type { ICatalogItem, ICatalogItemFeedOptions } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";
import type { AsyncStatus } from "../async/index.js";
import { useSearchState } from "../search/index.js";

type Props = ICatalogItemFeedOptions & {
    children: (props: {
        items: ICatalogItem[];
        totalCount: number;
        next: () => Promise<void>;
        hasNext: boolean;
        status: AsyncStatus;
        updateItem: (changes: Partial<ICatalogItem> & Pick<ICatalogItem, "identifier" | "type">) => void;
    }) => React.ReactNode;
};

export function CatalogItemFeed({ backend, workspace, children, tags, createdBy, pageSize }: Props) {
    const intl = useIntl();
    const { searchStatus, searchItems } = useSearchState();
    const id = useIdFilter(searchStatus, searchItems);
    const {
        items: feedItems,
        status: feedStatus,
        next,
        hasNext,
        totalCount,
        updateItem,
    } = useCatalogItemFeed({
        backend,
        workspace,
        id,
        tags,
        createdBy,
        pageSize,
    });

    const items = useUnifiedItems(searchStatus, searchItems, feedItems);
    const status = getUnifiedStatus(searchStatus, feedStatus);

    if (status === "error") {
        return (
            <ErrorComponent
                message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                description={intl.formatMessage({ id: "analyticsCatalog.error.unknown.description" })}
                width="100%"
            />
        );
    }

    return <>{children({ items, next, hasNext, totalCount, status, updateItem })}</>;
}

const emptyFilter: string[] = [];
const emptyItems: ICatalogItem[] = [];

function useIdFilter(
    searchStatus: AsyncStatus,
    searchItems: ISemanticSearchResultItem[],
): string[] | undefined {
    return useMemo(() => {
        if (searchStatus === "idle") {
            return undefined;
        }
        return searchItems.length > 0 ? searchItems.map((item) => item.id) : emptyFilter;
    }, [searchItems, searchStatus]);
}

function useUnifiedItems(
    searchStatus: AsyncStatus,
    searchItems: ISemanticSearchResultItem[],
    feedItems: ICatalogItem[],
) {
    const isEmpty = searchStatus === "loading" || (searchStatus === "success" && searchItems.length === 0);
    return useMemo(() => (isEmpty ? emptyItems : feedItems), [isEmpty, feedItems]);
}

function getUnifiedStatus(searchStatus: AsyncStatus, feedStatus: AsyncStatus) {
    if (searchStatus === "loading" || feedStatus === "loading") {
        return "loading";
    }
    if (feedStatus === "loadingMore") {
        return "loadingMore";
    }
    if (searchStatus === "error" || feedStatus === "error") {
        return "error";
    }
    if (searchStatus === "success" || feedStatus === "success") {
        return "success";
    }
    return "idle";
}
