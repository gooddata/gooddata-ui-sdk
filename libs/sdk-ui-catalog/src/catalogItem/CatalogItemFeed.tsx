// (C) 2025 GoodData Corporation

import React from "react";

import type { ICatalogItem, ICatalogItemFeedProps } from "./types.js";
import { useCatalogItemFeed } from "./useCatalogItemFeed.js";

type Props = ICatalogItemFeedProps & {
    children: (props: { items: ICatalogItem[] }) => React.ReactNode;
};

export function CatalogItemFeed({ types, backend, workspace, children }: Props) {
    const { items, status } = useCatalogItemFeed({ types, backend, workspace });

    if (status === "loading") {
        // TODO: add skeleton
        return <div>Loading...</div>;
    }
    if (status === "error") {
        // TODO: add error message
        return <div>Error</div>;
    }

    return <>{children({ items })}</>;
}
