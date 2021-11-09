// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";
import { GranteeItem } from "./ShareDialogBase/types";
import { IShareDialogProps } from "./types";
import {
    mapGranteesToShareStatus,
    mapOwnerToGrantee,
    mapShareStatusToGroupAll,
    mapUserToInactiveGrantee,
} from "./shareDialogMappers";

/**
 * @internal
 */
export const ShareDialog: React.FC<IShareDialogProps> = (props) => {
    const { sharedObject, currentUserRef, onApply, onCancel } = props;
    const { createdBy, shareStatus } = sharedObject;

    const owner = useMemo(() => {
        if (sharedObject.createdBy) {
            return mapOwnerToGrantee(createdBy, currentUserRef);
        }
        return mapUserToInactiveGrantee();
    }, [createdBy, currentUserRef]);

    const grantees = useMemo(() => {
        const groupAll = mapShareStatusToGroupAll(shareStatus);
        if (groupAll) {
            return [groupAll];
        }
        return [];
    }, [shareStatus]);

    const onSubmit = useCallback(
        (granteesToAdd: GranteeItem[], granteesToDelete: GranteeItem[]) => {
            const shareStatus = mapGranteesToShareStatus(grantees, granteesToAdd, granteesToDelete);
            const isUnderStrictControl = shareStatus !== "public";
            onApply({ shareStatus, isUnderStrictControl });
        },
        [grantees, onApply],
    );

    return <ShareDialogBase owner={owner} grantees={grantees} onCancel={onCancel} onSubmit={onSubmit} />;
};
