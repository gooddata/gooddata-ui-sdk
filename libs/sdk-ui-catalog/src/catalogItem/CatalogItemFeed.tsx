// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";

import { type AsyncStatus } from "../async/types.js";
import { useCatalogFeedActions, useCatalogFeedState } from "./CatalogFeedContext.js";
import type { ICatalogItem } from "./types.js";

type Props = {
    children: (props: {
        items: ICatalogItem[];
        totalCount: number;
        next: () => Promise<void>;
        hasNext: boolean;
        status: AsyncStatus;
    }) => ReactNode;
};

export function CatalogItemFeed({ children }: Props) {
    const intl = useIntl();
    const { items, status, hasNext, totalCount } = useCatalogFeedState();
    const { next } = useCatalogFeedActions();

    if (status === "error") {
        return (
            <ErrorComponent
                message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                description={intl.formatMessage({ id: "analyticsCatalog.error.unknown.description" })}
                width="100%"
            />
        );
    }

    return <>{children({ items, next, hasNext, totalCount, status })}</>;
}
