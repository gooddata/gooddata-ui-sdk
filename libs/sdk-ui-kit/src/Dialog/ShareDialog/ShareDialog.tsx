// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";
import { GranteeItem } from "./ShareDialogBase/types";
import { IShareDialogProps } from "./types";
import {
    mapGranteesToAccessGrantees,
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapUserToInactiveOwner,
} from "./shareDialogMappers";
import {
    BackendProvider,
    IntlWrapper,
    UnexpectedSdkError,
    useBackendStrict,
    useWorkspaceStrict,
    WorkspaceProvider,
} from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const ShareDialog: React.FC<IShareDialogProps> = (props) => {
    const { backend, workspace, locale, sharedObject, currentUserRef, onApply, onCancel, onError } = props;
    const { createdBy, shareStatus, ref: sharedObjectRef } = sharedObject;

    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const onShareDialogBaseError = useCallback(
        (err: Error) => {
            onError?.(new UnexpectedSdkError(err.message, err));
        },
        [onError],
    );

    const owner = useMemo(() => {
        if (sharedObject.createdBy) {
            return mapOwnerToGrantee(createdBy, currentUserRef);
        }
        return mapUserToInactiveOwner();
    }, [createdBy, currentUserRef]);

    const onSubmit = useCallback(
        (grantees: GranteeItem[], granteesToAdd: GranteeItem[], granteesToDelete: GranteeItem[]) => {
            const shareStatus = mapGranteesToShareStatus(grantees, granteesToAdd, granteesToDelete);
            const isUnderStrictControl = shareStatus !== "public";
            const add = mapGranteesToAccessGrantees(granteesToAdd);
            const del = mapGranteesToAccessGrantees(granteesToDelete);
            onApply({ shareStatus, isUnderStrictControl, granteesToAdd: add, granteesToDelete: del });
        },
        [onApply],
    );

    return (
        <IntlWrapper locale={locale}>
            <BackendProvider backend={effectiveBackend}>
                <WorkspaceProvider workspace={effectiveWorkspace}>
                    <ShareDialogBase
                        shareStatus={shareStatus}
                        sharedObjectRef={sharedObjectRef}
                        owner={owner}
                        onCancel={onCancel}
                        onSubmit={onSubmit}
                        onError={onShareDialogBaseError}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </IntlWrapper>
    );
};
