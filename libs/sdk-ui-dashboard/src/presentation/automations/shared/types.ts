// (C) 2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * Lifecycle callbacks shared by the alerting and scheduled email create/edit dialogs.
 *
 * @remarks
 * There is no pre-backend observer callback: the observation seam is the dialog context accessors
 * and the caller-owned submit hook.
 *
 * @alpha
 */
export interface IAutomationDialogCallbacks {
    /**
     * Called after a new automation has been created on the backend, with the created automation.
     */
    onCreateSuccess?: (automation: IAutomationMetadataObject) => void;
    /**
     * Called when creating a new automation on the backend fails, with the error.
     */
    onCreateError?: (error: GoodDataSdkError) => void;
    /**
     * Called after an existing automation has been updated on the backend, with the updated automation.
     */
    onUpdateSuccess?: (automation: IAutomationMetadataObject) => void;
    /**
     * Called when updating an existing automation on the backend fails, with the error.
     */
    onUpdateError?: (error: GoodDataSdkError) => void;
    /**
     * Called after the automation has been deleted from the backend, or unsubscribed from when the
     * current user may not delete it, with that automation.
     */
    onDeleteSuccess?: (automation: IAutomationMetadataObject) => void;
    /**
     * Called when deleting the automation from the backend (or unsubscribing from it) fails, with
     * the error.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;
    /**
     * Called when the user dismisses the dialog without saving.
     */
    onCancel?: () => void;
}

/**
 * Callbacks shared by the alerting and scheduled email management dialogs.
 *
 * @alpha
 */
export interface IAutomationManagementDialogCallbacks {
    /**
     * Called when the user asks to create a new automation from the management dialog.
     */
    onAdd?: () => void;
    /**
     * Called when the user picks an automation to edit, with that automation.
     */
    onEdit?: (automation: IAutomationMetadataObject) => void;
    /**
     * Called when the user closes the management dialog.
     */
    onClose?: () => void;
}
