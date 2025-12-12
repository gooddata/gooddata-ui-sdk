// (C) 2023-2025 GoodData Corporation

import { type IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { type IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";
import { type IGrantedUserGroup } from "./types.js";
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

function AddUserGroupsToUsersDialogComponent({
    userIds,
    organizationId,
    onSuccess,
    onClose,
}: IAddUserGroupsToUsersDialogProps) {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal positionType="fixed">
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
}

/**
 * @internal
 */
export const AddUserGroupsToUsersDialog = withTelemetry(AddUserGroupsToUsersDialogComponent);
