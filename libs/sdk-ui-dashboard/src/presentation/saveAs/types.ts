// (C) 2019-2021 GoodData Corporation
import { ComponentType } from "react";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IDashboard } from "@gooddata/sdk-backend-spi";

///
/// Component props
///

/**
 * @alpha
 */
export interface ISaveAsDialogProps {
    /**
     * Is SaveAs dialog visible?
     */
    isVisible?: boolean;

    /**
     * Callback to be called, when user submits the save as dialog.
     */
    onSubmit?: (title: string, switchToCopy?: boolean) => void;

    /**
     * Callback to be called, when user closes the save as dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when save as finished successfully.
     */
    onSuccess?: (dashboard: IDashboard) => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomSaveAsDialogComponent = ComponentType<ISaveAsDialogProps>;
