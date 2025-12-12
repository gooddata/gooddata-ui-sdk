// (C) 2019-2025 GoodData Corporation
import { type ComponentType } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type IUser } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    type CurrentUserPermissions,
    type IShareDialogInteractionData,
    type ISharedObject,
    type ISharingApplyPayload as ISharingDialogApplyPayload,
} from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISharingApplyPayload extends ISharingDialogApplyPayload {}

/**
 * @alpha
 */
export interface IShareDialogProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     */
    backend: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     */
    workspace: string;

    /**
     * Is share dialog visible?
     */
    isVisible?: boolean;

    /**
     * Object to share
     */
    sharedObject: ISharedObject;

    /**
     * Current user
     */
    currentUser: IUser;

    /**
     * Is locking of the dashboard supported by the currently logged user and backend?
     */
    isLockingSupported: boolean;

    /**
     * Is currently logger user a workspace manager?
     */
    isCurrentUserWorkspaceManager: boolean;

    /**
     * Dashboard permissions for current user.
     */
    currentUserPermissions: CurrentUserPermissions;

    /**
     * Dashboard filters
     */
    dashboardFilters: FilterContextItem[];

    /**
     * Is share grant hidden?
     */
    isShareGrantHidden: boolean;

    /**
     * Apply share grant on select, without confirming?
     */
    applyShareGrantOnSelect: boolean;

    /**
     * Show dashboard share link?
     */
    showDashboardShareLink: boolean;

    /**
     * Is grantee share loading?
     */
    isGranteeShareLoading: boolean;

    /**
     * Callback to be called when user copies share link
     */
    onShareLinkCopy: (shareLink: string) => void;

    /**
     * Callback to be called when user apply share dialog
     */
    onApply: (payload: ISharingApplyPayload, closeOnApply?: boolean) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called when user closes the share dialog.
     */
    onCancel: () => void;

    /**
     * Callback to be called on specific share dialog interactions.
     */
    onInteraction?: (data: IShareDialogInteractionData) => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomShareDialogComponent = ComponentType<IShareDialogProps>;
