// (C) 2023 GoodData Corporation

import React from "react";
import { IUser } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import noop from "lodash/noop.js";

import { ListMode } from "../types.js";

import { OrganizationMemberDropdown } from "./OrganizationMemberDropdown.js";
import { DetailRow } from "./DetailRow.js";
import { userManagementMessages } from "../../../locales.js";

export interface IDetailsViewProps {
    isAdmin: boolean;
    user: IUser;
    mode: ListMode;
    onChange?: (user: IUser, isAdmin: boolean) => void;
}

export const UserDetailsView: React.FC<IDetailsViewProps> = ({ user, isAdmin, mode, onChange }) => {
    const intl = useIntl();

    if (!user) {
        return null;
    }

    return (
        <div className="gd-user-management-dialog-detail s-user-management-user">
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userFirstName)}
                value={user.firstName}
                mode={mode}
                onChange={(firstName) => onChange({ ...user, firstName }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userLastName)}
                value={user.lastName}
                mode={mode}
                onChange={(lastName) => onChange({ ...user, lastName }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userEmail)}
                value={user.email}
                mode={mode}
                onChange={(email) => onChange({ ...user, email }, isAdmin)}
            />
            <div className="gd-user-management-dialog-detail-row">
                <div className="gd-user-management-dialog-detail-label">
                    {intl.formatMessage(userManagementMessages.userMembership)}
                </div>
                <div>
                    {mode === "VIEW" &&
                        (isAdmin
                            ? intl.formatMessage(userManagementMessages.userIsAdmin)
                            : intl.formatMessage(userManagementMessages.userIsRegularUser))}
                    {mode === "EDIT" && (
                        <OrganizationMemberDropdown
                            isAdmin={isAdmin}
                            onChange={(isAdminNow) => onChange(user, isAdminNow)}
                        />
                    )}
                </div>
            </div>
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userId)}
                value={user.login}
                mode={mode}
                disabled={true}
                onChange={noop}
            />
        </div>
    );
};
