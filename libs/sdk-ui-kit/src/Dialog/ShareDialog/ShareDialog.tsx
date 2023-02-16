// (C) 2021-2023 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    BackendProvider,
    IntlWrapper,
    UnexpectedSdkError,
    useBackendStrict,
    useWorkspaceStrict,
    WorkspaceProvider,
} from "@gooddata/sdk-ui";

import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";
import { GranteeItem, IAffectedSharedObject } from "./ShareDialogBase/types";
import { IShareDialogProps } from "./types";
import {
    mapGranteesToGranularAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapUserToInactiveOwner,
    mapSharedObjectToAffectedSharedObject,
} from "./shareDialogMappers";
import { ComponentLabelsProvider } from "./ShareDialogBase/ComponentLabelsContext";

/**
 * @internal
 */
export const ShareDialog: React.FC<IShareDialogProps> = (props) => {
    const {
        backend,
        workspace,
        locale,
        sharedObject,
        currentUserRef,
        onApply,
        onCancel,
        onError,
        isLockingSupported,
        isCurrentUserWorkspaceManager,
        labels,
        currentUserPermissions,
    } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const areGranularPermissionsSupported = effectiveBackend.capabilities.supportsGranularAccessControl;
    const isLeniencyControlSupported = !effectiveBackend.capabilities.usesStrictAccessControl;
    const isMetadataObjectLockingSupported = effectiveBackend.capabilities.supportsMetadataObjectLocking;
    const canWorkspaceManagerSeeEverySharedObject =
        effectiveBackend.capabilities.canWorkspaceManagerSeeEverySharedObject;
    const { createdBy } = sharedObject;

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
        ) => {
            const shareStatus = mapGranteesToShareStatus(grantees, granteesToAdd, granteesToDelete);
            const isUnderStrictControl = shareStatus !== "public" && !isUnderLenientControl;

            const addAccess = mapGranteesToGranularAccessGrantees(granteesToAdd, true);
            const revokeAccess = mapGranteesToGranularAccessGrantees(granteesToDelete);

            onApply({
                shareStatus,
                isUnderStrictControl,
                isLocked,
                granteesToAdd: addAccess,
                granteesToDelete: revokeAccess,
            });
        },
        [onApply],
    );

    const affectedSharedObject = useMemo<IAffectedSharedObject>(() => {
        return mapSharedObjectToAffectedSharedObject(
            sharedObject,
            owner,
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
                        <ShareDialogBase
                            currentUserRef={currentUserRef}
                            sharedObject={affectedSharedObject}
                            isCurrentUserWorkspaceManager={isCurrentUserWorkspaceManager}
                            currentUserPermissions={currentUserPermissions}
                            onCancel={onCancel}
                            onSubmit={onSubmit}
                            onError={onShareDialogBaseError}
                        />
                    </ComponentLabelsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </IntlWrapper>
    );
};
