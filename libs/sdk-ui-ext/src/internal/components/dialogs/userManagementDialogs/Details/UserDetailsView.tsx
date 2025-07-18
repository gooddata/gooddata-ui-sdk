// (C) 2023-2025 GoodData Corporation

import { IUser } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import noop from "lodash/noop.js";

import { ListMode } from "../types.js";
import { messages } from "../locales.js";
import { useTelemetry } from "../TelemetryContext.js";

import { OrganizationMemberDropdown } from "./OrganizationMemberDropdown.js";
import { DetailRow } from "./DetailRow.js";

export interface IDetailsViewProps {
    isAdmin: boolean;
    isBootstrapUser: boolean;
    user: IUser;
    mode: ListMode;
    onChange?: (user: IUser, isAdmin: boolean) => void;
}

export function UserDetailsView({ user, isAdmin, isBootstrapUser, mode, onChange }: IDetailsViewProps) {
    const intl = useIntl();
    const trackEvent = useTelemetry();

    if (!user) {
        return null;
    }

    return (
        <div className="gd-user-management-dialog-detail s-user-management-user">
            <DetailRow
                labelText={intl.formatMessage(messages.userFirstName)}
                value={user.firstName}
                mode={mode}
                onChange={(firstName) => onChange({ ...user, firstName }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(messages.userLastName)}
                value={user.lastName}
                mode={mode}
                onChange={(lastName) => onChange({ ...user, lastName }, isAdmin)}
            />
            <DetailRow
                labelText={intl.formatMessage(messages.userEmail)}
                value={user.email}
                mode={mode}
                onChange={(email) => onChange({ ...user, email }, isAdmin)}
            />
            <div className="gd-user-management-dialog-detail-row">
                <div className="gd-user-management-dialog-detail-label">
                    {intl.formatMessage(messages.userMembership)}
                </div>
                <div>
                    {mode === "VIEW" &&
                        (isAdmin
                            ? intl.formatMessage(messages.userIsAdmin)
                            : intl.formatMessage(messages.userIsRegularUser))}
                    {mode === "EDIT" && (
                        <OrganizationMemberDropdown
                            isDisabled={isBootstrapUser}
                            isAdmin={isAdmin}
                            onChange={(isAdminNow) => {
                                onChange(user, isAdminNow);
                                trackEvent(
                                    isAdmin ? "user-role-changed-to-admin" : "user-role-changed-to-member",
                                );
                            }}
                        />
                    )}
                </div>
            </div>
            <DetailRow
                labelText={intl.formatMessage(messages.userId)}
                value={user.login}
                mode={mode}
                disabled={true}
                onChange={noop}
            />
        </div>
    );
}
