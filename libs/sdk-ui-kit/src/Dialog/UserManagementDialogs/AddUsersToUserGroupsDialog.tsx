// (C) 2023 GoodData Corporation

import React from "react";
import { IAlignPoint } from "../../typings/positioning.js";
import { Overlay } from "../../Overlay/index.js";
import { IUserMember } from "./types.js";
import { AddUser } from "./Users/AddUser.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedUsers: IUserMember[] = [];

/**
 * @alpha
 */
export interface IAddUsersToUserGroupsDialogProps {
    userGroupIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @alpha
 */
export const AddUsersToUserGroupsDialog: React.FC<IAddUsersToUserGroupsDialogProps> = ({
    userGroupIds,
    organizationId,
    onSuccess,
    onClose,
}) => {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal={true} positionType="fixed">
                <AddUser
                    userGroupIds={userGroupIds}
                    grantedUsers={noGrantedUsers}
                    enableBackButton={false}
                    onSubmit={onSuccess}
                    onCancel={onClose}
                    onClose={onClose}
                />
            </Overlay>
        </OrganizationIdProvider>
    );
};
