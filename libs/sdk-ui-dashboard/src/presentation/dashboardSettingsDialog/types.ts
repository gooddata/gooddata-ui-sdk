// (C) 2019-2025 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IDashboardSettingsApplyPayload {
    disableCrossFiltering: boolean;
    disableUserFilterSave: boolean;
    disableUserFilterReset: boolean;
    disableFilterViews: boolean;
    evaluationFrequency: string | undefined;
}

/**
 * @alpha
 */
export interface IDashboardSettingsDialogProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     */
    backend: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     */
    workspace: string;

    /**
     * Is dashboard setting dialog visible.
     */
    isVisible?: boolean;

    /**
     * Callback to be called when user apply dashboard settings.
     */
    onApply: (payload: IDashboardSettingsApplyPayload) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called when user closes the dashboard settings dialog.
     */
    onCancel: () => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardSettingsDialogComponent = ComponentType<IDashboardSettingsDialogProps>;
