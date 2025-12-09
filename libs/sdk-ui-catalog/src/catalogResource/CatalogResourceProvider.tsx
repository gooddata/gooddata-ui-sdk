// (C) 2025 GoodData Corporation

import type { PropsWithChildren } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { CatalogTagsProvider } from "./CatalogTagsContext.js";

type Props = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

/**
 * Provides catalog server resources to the children components.
 */
export function CatalogResourceProvider({ children, backend, workspace }: Props) {
    return (
        <CatalogTagsProvider backend={backend} workspace={workspace}>
            {children}
        </CatalogTagsProvider>
    );
}
