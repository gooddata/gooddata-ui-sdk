// (C) 2025 GoodData Corporation

import type { MouseEvent } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { Catalog } from "./catalog/Catalog.js";
import type { OpenHandlerEvent } from "./catalogDetail/CatalogDetailContent.js";
import type { ICatalogItemRef } from "./catalogItem/index.js";
import { FilterProvider } from "./filter/index.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { ObjectTypeProvider } from "./objectType/index.js";
import { OverlayProvider } from "./overlay/OverlayProvider.js";
import { PermissionsProvider, usePermissionsQuery } from "./permission/index.js";
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

    /**
     * Reference to the catalog item to open on initial render.
     */
    openCatalogItemRef?: ICatalogItemRef;

    /**
     * Handler for opening catalog items.
     */
    onCatalogItemOpenClick?: (e: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;

    /**
     * Handler when opening catalog detail.
     */
    onCatalogDetailOpened?: (ref: ICatalogItemRef) => void;

    /**
     * Handler when closing catalog detail.
     */
    onCatalogDetailClosed?: () => void;
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
            <ToastsCenterContextProvider>
                <OverlayProvider>
                    <PermissionsProvider permissionsState={permissionsState}>
                        <FilterProvider>
                            <SearchProvider>
                                <ObjectTypeProvider>
                                    <Catalog
                                        backend={backend}
                                        workspace={workspace}
                                        openCatalogItemRef={props.openCatalogItemRef}
                                        onCatalogItemOpenClick={props.onCatalogItemOpenClick}
                                        onCatalogDetailOpened={props.onCatalogDetailOpened}
                                        onCatalogDetailClosed={props.onCatalogDetailClosed}
                                    />
                                </ObjectTypeProvider>
                            </SearchProvider>
                        </FilterProvider>
                    </PermissionsProvider>
                </OverlayProvider>
            </ToastsCenterContextProvider>
        </IntlWrapper>
    );
}
