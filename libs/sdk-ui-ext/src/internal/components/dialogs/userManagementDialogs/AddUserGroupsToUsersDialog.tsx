// (C) 2023-2025 GoodData Corporation

import React from "react";

import { IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";
import { IGrantedUserGroup } from "./types.js";
import { AddUserGroup } from "./UserGroups/AddUserGroup.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedUserGroups: IGrantedUserGroup[] = [];

/**
 * @internal
 */
export interface IAddUserGroupsToUsersDialogProps extends IWithTelemetryProps {
    userIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

const AddUserGroupsToUsersDialogComponent: React.FC<IAddUserGroupsToUsersDialogProps> = ({
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

/**
 * @internal
 */
export const AddUserGroupsToUsersDialog = withTelemetry(AddUserGroupsToUsersDialogComponent);
