// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { ShareDialogBase } from "./ShareDialogBase/ShareDialogBase";
import { GranteeItem } from "./ShareDialogBase/types";
import { IShareDialogProps } from "./types";
import invariant from "ts-invariant";
import { mapGranteesToShareStatus, mapOwnerToGrantee, mapShareStatusToGroupAll } from "./shareDialogMappers";

/**
 * @internal
 */
export const ShareDialog: React.FC<IShareDialogProps> = (props) => {
    const { sharedObject, currentUserRef, onApply, onCancel } = props;
    const { createdBy, shareStatus } = sharedObject;

    const owner = useMemo(() => {
        invariant(sharedObject.createdBy, "ShareDialog sharedObject.createdBy should be specified.");

        return mapOwnerToGrantee(createdBy, currentUserRef);
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
