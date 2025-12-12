// (C) 2021-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import {
    BackendProvider,
    IntlWrapper,
    UnexpectedSdkError,
    WorkspaceProvider,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { ComponentInteractionProvider } from "./ShareDialogBase/ComponentInteractionContext.js";
import { ComponentLabelsProvider } from "./ShareDialogBase/ComponentLabelsContext.js";
import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase.js";
import { type GranteeItem, type IAffectedSharedObject } from "./ShareDialogBase/types.js";
import {
    mapGranteesToGranularAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapSharedObjectToAffectedSharedObject,
    mapUserToInactiveOwner,
} from "./shareDialogMappers.js";
import { type IShareDialogProps } from "./types.js";

/**
 * @internal
 */
export function ShareDialog({
    backend,
    workspace,
    locale,
    sharedObject,
    currentUser,
    onApply,
    onCancel,
    onError,
    onInteraction = () => {},
    isLockingSupported,
    isCurrentUserWorkspaceManager,
    isGranteeShareLoading,
    labels,
    currentUserPermissions,
    dashboardFilters,
    isShareGrantHidden,
    applyShareGrantOnSelect,
    showDashboardShareLink,
    onShareLinkCopy,
}: IShareDialogProps) {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const areGranularPermissionsSupported = effectiveBackend.capabilities.supportsGranularAccessControl;
    const isLeniencyControlSupported = !effectiveBackend.capabilities.usesStrictAccessControl;
    const isMetadataObjectLockingSupported = effectiveBackend.capabilities.supportsMetadataObjectLocking;
    const canWorkspaceManagerSeeEverySharedObject =
        effectiveBackend.capabilities.canWorkspaceManagerSeeEverySharedObject;
    const { createdBy } = sharedObject;
    const { ref: currentUserRef } = currentUser;

    const onShareDialogBaseError = useCallback(
        (err: Error) => {
            onError?.(new UnexpectedSdkError(err.message, err));
        },
        [onError],
    );

    const owner = useMemo(() => {
        if (areGranularPermissionsSupported) {
            return undefined;
        }
        if (createdBy) {
            return mapOwnerToGrantee(createdBy, currentUserRef);
        }
        return mapUserToInactiveOwner();
    }, [createdBy, currentUserRef, areGranularPermissionsSupported]);

    const onSubmit = useCallback(
        (
            grantees: GranteeItem[],
            granteesToAdd: GranteeItem[],
            granteesToDelete: GranteeItem[],
            isUnderLenientControl: boolean,
            isLocked: boolean,
            closeOnApply?: boolean,
        ) => {
            const shareStatus = mapGranteesToShareStatus(grantees, granteesToAdd, granteesToDelete);
            const isUnderStrictControl = shareStatus !== "public" && !isUnderLenientControl;

            const addAccess = mapGranteesToGranularAccessGrantees(granteesToAdd, true);
            const revokeAccess = mapGranteesToGranularAccessGrantees(granteesToDelete);

            onApply(
                {
                    shareStatus,
                    isUnderStrictControl,
                    isLocked,
                    granteesToAdd: addAccess,
                    granteesToDelete: revokeAccess,
                },
                closeOnApply,
            );
        },
        [onApply],
    );

    const affectedSharedObject = useMemo<IAffectedSharedObject>(() => {
        return mapSharedObjectToAffectedSharedObject(
            sharedObject,
            owner!,
            isLockingSupported,
            isLeniencyControlSupported,
            areGranularPermissionsSupported,
            isMetadataObjectLockingSupported,
            canWorkspaceManagerSeeEverySharedObject,
        );
    }, [
        sharedObject,
        owner,
        isLockingSupported,
        isLeniencyControlSupported,
        areGranularPermissionsSupported,
        isMetadataObjectLockingSupported,
        canWorkspaceManagerSeeEverySharedObject,
    ]);

    return (
        <IntlWrapper locale={locale}>
            <BackendProvider backend={effectiveBackend}>
                <WorkspaceProvider workspace={effectiveWorkspace}>
                    <ComponentLabelsProvider labels={labels}>
                        <ComponentInteractionProvider
                            onInteraction={onInteraction}
                            currentUser={currentUser}
                            currentUserPermissions={currentUserPermissions}
                            isCurrentUserWorkspaceManager={isCurrentUserWorkspaceManager}
                            sharedObjectStatus={affectedSharedObject.shareStatus}
                            isSharedObjectLocked={affectedSharedObject.isLocked}
                        >
                            <ShareDialogBase
                                currentUser={currentUser}
                                sharedObject={affectedSharedObject}
                                isCurrentUserWorkspaceManager={isCurrentUserWorkspaceManager}
                                currentUserPermissions={currentUserPermissions}
                                dashboardFilters={dashboardFilters}
                                onCancel={onCancel}
                                onSubmit={onSubmit}
                                onError={onShareDialogBaseError}
                                isShareGrantHidden={isShareGrantHidden}
                                applyShareGrantOnSelect={applyShareGrantOnSelect}
                                showDashboardShareLink={showDashboardShareLink}
                                onShareLinkCopy={onShareLinkCopy}
                                isGranteeShareLoading={isGranteeShareLoading}
                            />
                        </ComponentInteractionProvider>
                    </ComponentLabelsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </IntlWrapper>
    );
}
