// (C) 2025-2026 GoodData Corporation

import type { MouseEvent, PropsWithChildren } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogDetail, type ICatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
import {
    CatalogDetailContent,
    type ICatalogDetailContentProps,
} from "./catalogDetail/CatalogDetailContent.js";
import type { OpenHandlerEvent } from "./catalogDetail/types.js";
import { CatalogResourceProvider } from "./catalogResource/CatalogResourceProvider.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { MetricMutationProvider } from "./metric/MetricMutationContext.js";
import { type ObjectType } from "./objectType/types.js";
import { OverlayProvider } from "./overlay/OverlayProvider.js";
import { ParameterMutationProvider } from "./parameter/ParameterMutationContext.js";
import { PermissionsProvider } from "./permission/PermissionsContext.js";
import { usePermissionsQuery } from "./permission/usePermissionsQuery.js";
import { QualityProvider } from "./quality/QualityContext.js";

/**
 * @public
 */
export interface IAnalyticsCatalogDetailProps extends Omit<ICatalogDetailProps, "objectId" | "objectType"> {
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
 * @public
 */
export function AnalyticsCatalogDetail({
    backend,
    workspace,
    locale,
    ...restProps
}: IAnalyticsCatalogDetailProps) {
    return (
        <Providers backend={backend} workspace={workspace} locale={locale}>
            <CatalogDetail {...restProps} />
        </Providers>
    );
}

/**
 * @public
 */
export interface IAnalyticsCatalogDetailContentProps extends Omit<
    ICatalogDetailContentProps,
    "objectId" | "objectType"
> {
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
 * @public
 */
export function AnalyticsCatalogDetailContent({
    backend,
    workspace,
    locale,
    ...restProps
}: IAnalyticsCatalogDetailContentProps) {
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
                    <ToastsCenterContextProvider>
                        <OverlayProvider>
                            <PermissionsProvider permissionsState={permissionsState}>
                                <QualityProvider backend={backend} workspace={workspace}>
                                    <CatalogResourceProvider backend={backend} workspace={workspace}>
                                        <ParameterMutationProvider>
                                            <MetricMutationProvider>{props.children}</MetricMutationProvider>
                                        </ParameterMutationProvider>
                                    </CatalogResourceProvider>
                                </QualityProvider>
                            </PermissionsProvider>
                        </OverlayProvider>
                    </ToastsCenterContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
