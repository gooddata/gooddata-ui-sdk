// (C) 2024 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IRichTextWidget } from "@gooddata/sdk-model";
import { IErrorProps, ILoadingProps, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

///
/// Component props
///

/**
 * Rich text widget props.
 *
 * @public
 */
export interface IDashboardRichTextProps {
    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     *
     * @alpha
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the Insight widget exists.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     *
     * @alpha
     */
    workspace?: string;

    /**
     * Definition of insight widget to render.
     *
     * @public
     */
    widget: IRichTextWidget;

    // TODO: RICH TEXT do we need loading changed, on error and so on? (probably yes once we add "variables")

    /**
     * Error component to use when insight rendering fails for any reason.
     *
     * @alpha
     */
    ErrorComponent: ComponentType<IErrorProps>;

    /**
     * Loading component to use while loading and preparing data to render.
     *
     * @alpha
     */
    LoadingComponent: ComponentType<ILoadingProps>;

    /**
     * @alpha
     */
    clientHeight?: number;

    /**
     * @alpha
     */
    clientWidth?: number;

    /**
     * @alpha
     */
    onError?: OnError;

    /**
     * @alpha
     */
    onLoadingChanged?: OnLoadingChanged;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardRichTextComponent = ComponentType<IDashboardRichTextProps>;
