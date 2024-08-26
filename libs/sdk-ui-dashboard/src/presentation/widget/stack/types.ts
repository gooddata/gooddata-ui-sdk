// (C) 2024 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IStackWidget } from "@gooddata/sdk-model";

///
/// Component props
///

// NESTOR
/**
 * Stack widget props.
 *
 * @public
 */
export interface IDashboardStackProps {
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
    widget: IStackWidget;

    /**
     * Height of the rich text widget container.
     *
     * @alpha
     */
    clientHeight?: number;

    /**
     * Width of the rich text widget container.
     *
     * @alpha
     */
    clientWidth?: number;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardStackComponent = ComponentType<IDashboardStackProps>;
