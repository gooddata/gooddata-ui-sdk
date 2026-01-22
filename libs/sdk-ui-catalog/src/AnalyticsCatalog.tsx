// (C) 2025-2026 GoodData Corporation

import type { MouseEvent } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { Catalog } from "./catalog/Catalog.js";
import type { OpenHandlerEvent } from "./catalogDetail/CatalogDetailContent.js";
import { type ICatalogItemRef } from "./catalogItem/types.js";
import { CatalogResourceProvider } from "./catalogResource/CatalogResourceProvider.js";
import { FilterProvider } from "./filter/FilterContext.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { ObjectTypeProvider } from "./objectType/ObjectTypeContext.js";
import { OverlayProvider } from "./overlay/OverlayProvider.js";
import { PermissionsProvider } from "./permission/PermissionsContext.js";
import { usePermissionsQuery } from "./permission/usePermissionsQuery.js";
import { QualityProvider } from "./quality/QualityContext.js";
import { FullTextSearchProvider } from "./search/FullTextSearchContext.js";

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
     * Handler for navigating to a catalog item. Consumers can handle route changes.
     */
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;

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
                            <FullTextSearchProvider>
                                <ObjectTypeProvider>
                                    <QualityProvider backend={backend} workspace={workspace}>
                                        <CatalogResourceProvider backend={backend} workspace={workspace}>
                                            <Catalog
                                                backend={backend}
                                                workspace={workspace}
                                                openCatalogItemRef={props.openCatalogItemRef}
                                                onCatalogItemOpenClick={props.onCatalogItemOpenClick}
                                                onCatalogDetailOpened={props.onCatalogDetailOpened}
                                                onCatalogDetailClosed={props.onCatalogDetailClosed}
                                                onCatalogItemNavigation={props.onCatalogItemNavigation}
                                            />
                                        </CatalogResourceProvider>
                                    </QualityProvider>
                                </ObjectTypeProvider>
                            </FullTextSearchProvider>
                        </FilterProvider>
                    </PermissionsProvider>
                </OverlayProvider>
            </ToastsCenterContextProvider>
        </IntlWrapper>
    );
}
