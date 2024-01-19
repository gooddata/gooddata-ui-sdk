// (C) 2024 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IRichTextWidget } from "@gooddata/sdk-model";

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
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardRichTextComponent = ComponentType<IDashboardRichTextProps>;
