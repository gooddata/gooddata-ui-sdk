// (C) 2025 GoodData Corporation

import type { MouseEvent, PropsWithChildren } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { CatalogDetail, type CatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
import {
    CatalogDetailContent,
    type CatalogDetailContentProps,
    type OpenHandlerEvent,
} from "./catalogDetail/CatalogDetailContent.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import type { ObjectType } from "./objectType/index.js";
import { OverlayProvider } from "./overlay/OverlayProvider.js";
import { PermissionsProvider } from "./permission/index.js";
import { usePermissionsQuery } from "./permission/usePermissionsQuery.js";
import { QualityProvider } from "./quality/QualityContext.js";

/**
 * @internal
 */
export interface AnalyticsCatalogDetailProps extends Omit<CatalogDetailProps, "objectId" | "objectType"> {
    /**
     * An object id of the catalog item.
     */
    objectId: string;
    /**
     * An object type of the catalog item.
     */
    objectType: ObjectType;
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
export function AnalyticsCatalogDetail({
    backend,
    workspace,
    locale,
    ...restProps
}: AnalyticsCatalogDetailProps) {
    return (
        <Providers backend={backend} workspace={workspace} locale={locale}>
            <CatalogDetail {...restProps} />
        </Providers>
    );
}

/**
 * @internal
 */
export interface AnalyticsCatalogDetailContentProps
    extends Omit<CatalogDetailContentProps, "objectId" | "objectType"> {
    /**
     * An object id of the catalog item.
     */
    objectId: string;
    /**
     * An object type of the catalog item.
     */
    objectType: ObjectType;
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
     * Handler for opening catalog items.
     */
    onOpenClick?: (e: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
}

/**
 * @internal
 */
export function AnalyticsCatalogDetailContent({
    backend,
    workspace,
    locale,
    ...restProps
}: AnalyticsCatalogDetailContentProps) {
    return (
        <Providers backend={backend} workspace={workspace} locale={locale}>
            <CatalogDetailContent {...restProps} />
        </Providers>
    );
}

type ProvidersProps = PropsWithChildren<{
    backend?: IAnalyticalBackend;
    workspace?: string;
    locale?: string;
}>;

function Providers(props: ProvidersProps) {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const permissionsState = usePermissionsQuery({ backend, workspace });

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <IntlWrapper locale={props.locale}>
                    <OverlayProvider>
                        <PermissionsProvider permissionsState={permissionsState}>
                            <QualityProvider backend={backend} workspace={workspace}>
                                {props.children}
                            </QualityProvider>
                        </PermissionsProvider>
                    </OverlayProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
