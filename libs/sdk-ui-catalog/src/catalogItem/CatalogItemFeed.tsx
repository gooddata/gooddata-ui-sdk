// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";

import type { ICatalogItem, ICatalogItemFeedOptions } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";
import { type AsyncStatus } from "../async/types.js";
import { useObjectTypeCounterSync } from "../objectType/ObjectTypeContext.js";

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

export function CatalogItemFeed({ backend, workspace, children, pageSize }: Props) {
    const intl = useIntl();
    const { items, status, next, hasNext, totalCount, totalCountByType, updateItem } = useCatalogItemFeed({
        backend,
        workspace,
        pageSize,
    });

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
