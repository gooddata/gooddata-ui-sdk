// (C) 2023 GoodData Corporation

import React from "react";
import { AddUserGroup } from "./UserGroups/AddUserGroup.js";
import { IAlignPoint } from "../../typings/positioning.js";
import { Overlay } from "../../Overlay/index.js";
import { IGrantedUserGroup } from "./types.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedUserGroups: IGrantedUserGroup[] = [];

/**
 * @internal
 */
export interface IAddUserGroupsToUsersDialogProps {
    userIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const AddUserGroupsToUsersDialog: React.FC<IAddUserGroupsToUsersDialogProps> = ({
    userIds,
    organizationId,
    onSuccess,
    onClose,
}) => {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal={true} positionType="fixed">
                <AddUserGroup
                    userIds={userIds}
                    grantedUserGroups={noGrantedUserGroups}
                    enableBackButton={false}
                    onSubmit={onSuccess}
                    onCancel={onClose}
                    onClose={onClose}
                />
            </Overlay>
        </OrganizationIdProvider>
    );
};
