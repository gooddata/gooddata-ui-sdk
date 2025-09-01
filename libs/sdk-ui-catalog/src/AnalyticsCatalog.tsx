// (C) 2025 GoodData Corporation

import React from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { Catalog } from "./catalog/Catalog.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { PermissionsProvider } from "./permission/index.js";
import { usePermissionsQuery } from "./permission/usePermissionsQuery.js";
import { SearchProvider } from "./search/index.js";

/**
 * @internal
 */
export interface IAnalyticsCatalogProps {
    /**
     * An analytical backend to use within the analytics catalog. Can be omitted and taken from context.
     */
    backend?: IAnalyticalBackend;
    /**
     * A workspace to use within the analytics catalog. Can be omitted and taken from context.
     */
    workspace?: string;
    /**
     * A locale to use for translations. Can be omitted and taken from context.
     */
    locale?: string;
}

/**
 * @internal
 */
export function AnalyticsCatalog(props: IAnalyticsCatalogProps) {
    const workspace = useWorkspaceStrict(props.workspace);
    const backend = useBackendStrict(props.backend);
    const permissionsState = usePermissionsQuery({ backend, workspace });

    return (
        <IntlWrapper locale={props.locale}>
            <PermissionsProvider permissionsState={permissionsState}>
                <SearchProvider>
                    <Catalog backend={backend} workspace={workspace} />
                </SearchProvider>
            </PermissionsProvider>
        </IntlWrapper>
    );
}
