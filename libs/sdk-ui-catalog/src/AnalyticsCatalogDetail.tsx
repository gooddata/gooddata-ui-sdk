// (C) 2025 GoodData Corporation
import React from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    BackendProvider,
    IntlWrapper,
    WorkspaceProvider,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { CatalogDetail, type CatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
import {
    CatalogDetailContent,
    type CatalogDetailContentProps,
} from "./catalogDetail/CatalogDetailContent.js";

/**
 * @internal
 */
export interface AnalyticsCatalogDetailProps extends CatalogDetailProps {
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
export function AnalyticsCatalogDetail(props: AnalyticsCatalogDetailProps) {
    const { backend, workspace, locale, ...restProps } = props;
    const b = useBackendStrict(backend);
    const w = useWorkspaceStrict(workspace);

    return (
        <BackendProvider backend={b}>
            <WorkspaceProvider workspace={w}>
                <IntlWrapper locale={locale}>
                    <CatalogDetail {...restProps} />
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}

/**
 * @internal
 */
export interface AnalyticsCatalogDetailContentProps extends CatalogDetailContentProps {
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
export function AnalyticsCatalogDetailContent(props: AnalyticsCatalogDetailContentProps) {
    const { backend, workspace, locale, ...restProps } = props;
    const b = useBackendStrict(backend);
    const w = useWorkspaceStrict(workspace);

    return (
        <BackendProvider backend={b}>
            <WorkspaceProvider workspace={w}>
                <IntlWrapper locale={locale}>
                    <CatalogDetailContent {...restProps} />
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
