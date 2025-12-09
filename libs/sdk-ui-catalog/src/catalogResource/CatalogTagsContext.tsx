// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type UseCancelablePromiseStatus, useCancelablePromise } from "@gooddata/sdk-ui";

interface ICatalogTagsState {
    status: UseCancelablePromiseStatus;
    tags: string[];
}

const initialState: ICatalogTagsState = {
    status: "pending",
    tags: [],
};

const CatalogTagsContext = createContext<ICatalogTagsState>(initialState);

type Props = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

export function CatalogTagsProvider({ backend, workspace, children }: Props) {
    const catalogTags = useCancelablePromise<{ tags: string[] }, Error>(
        {
            promise: () => backend.workspace(workspace).genAI().getAnalyticsCatalog().getTags(),
            onError: (error) => console.error(error),
        },
        [backend, workspace],
    );

    const value = useMemo<ICatalogTagsState>(
        () => ({
            status: catalogTags.status,
            tags: sortTags(catalogTags.result?.tags ?? initialState.tags),
        }),
        [catalogTags.result?.tags, catalogTags.status],
    );

    return <CatalogTagsContext.Provider value={value}>{children}</CatalogTagsContext.Provider>;
}

export function useCatalogTags(): ICatalogTagsState {
    return useContext(CatalogTagsContext);
}

/** Sort tags alphabetically */
function sortTags(tags: string[]): string[] {
    return [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}
