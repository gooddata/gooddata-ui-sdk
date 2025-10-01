// (C) 2025 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useIntl } from "react-intl";

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ErrorComponent } from "@gooddata/sdk-ui";

import { sortCatalogItems } from "./sorting.js";
import type { ICatalogItem, ICatalogItemFeedOptions } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";
import type { AsyncStatus } from "../async/index.js";
import { useObjectTypeCounterSync } from "../objectType/index.js";

type Props = ICatalogItemFeedOptions & {
    children: (props: {
        items: ICatalogItem[];
        totalCount: number;
        next: () => Promise<void>;
        hasNext: boolean;
        status: AsyncStatus;
        updateItem: (changes: Partial<ICatalogItem> & Pick<ICatalogItem, "identifier" | "type">) => void;
    }) => ReactNode;
};

// Static until the semantic search is implemented back
const searchStatus = "idle";
const searchItems: ISemanticSearchResultItem[] = [];

export function CatalogItemFeed({ backend, workspace, children, pageSize }: Props) {
    const intl = useIntl();
    const id = useIdFilter(searchStatus, searchItems);
    const {
        items: feedItems,
        status: feedStatus,
        next,
        hasNext,
        totalCount,
        totalCountByType,
        updateItem,
    } = useCatalogItemFeed({
        backend,
        workspace,
        id,
        pageSize,
    });

    const items = useUnifiedItems(searchStatus, searchItems, feedItems);
    const status = getUnifiedStatus(searchStatus, feedStatus);

    // Sync total count into the object type counter
    useObjectTypeCounterSync(totalCountByType);

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
    return useMemo(() => {
        if (isEmpty) {
            return emptyItems;
        }
        return sortCatalogItems(feedItems, searchItems);
    }, [isEmpty, searchItems, feedItems]);
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
