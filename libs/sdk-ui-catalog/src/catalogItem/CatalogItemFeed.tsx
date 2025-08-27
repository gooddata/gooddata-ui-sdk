// (C) 2025 GoodData Corporation

import React from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";

import type { ICatalogItem, ICatalogItemFeedProps } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";

type Props = ICatalogItemFeedProps & {
    children: (props: {
        items: ICatalogItem[];
        totalCount: number;
        next: () => Promise<void>;
        hasNext: boolean;
        status: "loading" | "success" | "error" | "pending";
    }) => React.ReactNode;
};

export function CatalogItemFeed({ types, backend, workspace, children, tags, createdBy, pageSize }: Props) {
    const intl = useIntl();
    const { items, status, next, hasNext, totalCount, error } = useCatalogItemFeed({
        types,
        backend,
        workspace,
        tags,
        createdBy,
        pageSize,
    });

    if (error && status === "error") {
        return (
            <ErrorComponent
                code={error.message}
                message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                description={intl.formatMessage({ id: "analyticsCatalog.error.unknown.description" })}
                width="100%"
            />
        );
    }

    return <>{children({ items, next, hasNext, totalCount, status })}</>;
}
