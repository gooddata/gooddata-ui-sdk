// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";
import { GranteeItem, IAffectedSharedObject } from "./ShareDialogBase/types";
import { IShareDialogProps } from "./types";
import {
    mapGranteesToAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapUserToInactiveOwner,
    mapSharedObjectToAffectedSharedObject,
} from "./shareDialogMappers";
import {
    BackendProvider,
    IntlWrapper,
    UnexpectedSdkError,
    useBackendStrict,
    useWorkspaceStrict,
    WorkspaceProvider,
} from "@gooddata/sdk-ui";
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
        labels,
        dashboardPermissions,
    } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const areGranularPermissionsSupported = effectiveBackend.capabilities.supportsGranularAccessControl;
    const isLeniencyControlSupported = !effectiveBackend.capabilities.usesStrictAccessControl;

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
        if (sharedObject.createdBy) {
            return mapOwnerToGrantee(sharedObject.createdBy, currentUserRef);
        }
        return mapUserToInactiveOwner();
    }, [sharedObject, currentUserRef, areGranularPermissionsSupported]);

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
            const add = mapGranteesToAccessGrantees(granteesToAdd);
            const del = mapGranteesToAccessGrantees(granteesToDelete);
            onApply({
                shareStatus,
                isUnderStrictControl,
                isLocked,
                granteesToAdd: add,
                granteesToDelete: del,
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
        );
    }, [
        sharedObject,
        owner,
        isLockingSupported,
        isLeniencyControlSupported,
        areGranularPermissionsSupported,
    ]);

    return (
        <IntlWrapper locale={locale}>
            <BackendProvider backend={effectiveBackend}>
                <WorkspaceProvider workspace={effectiveWorkspace}>
                    <ComponentLabelsProvider labels={labels}>
                        <ShareDialogBase
                            currentUserRef={currentUserRef}
                            sharedObject={affectedSharedObject}
                            dashboardPermissions={dashboardPermissions}
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
