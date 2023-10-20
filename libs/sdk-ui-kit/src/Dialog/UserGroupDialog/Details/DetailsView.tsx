// (C) 2023 GoodData Corporation

import React from "react";
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";

import { GroupsListMode } from "../types.js";
import { Input } from "../../../Form/index.js";

import { OrganizationMemberDropdown } from "./OrganizationMemberDropdown.js";

interface IValueCellProps {
    value?: string;
    mode: GroupsListMode;
    disabled?: boolean;
    onChange: (value: string) => void;
}

const ValueCell: React.FC<IValueCellProps> = ({ value, mode, disabled, onChange }) => {
    const intl = useIntl();
    return (
        <div
            className={cx(
                "gd-user-group-dialog-detail-value",
                { "gd-user-group-dialog-detail-value-empty": !value && mode === "VIEW" }
            )}
        >
            {mode === "EDIT" && <Input value={value} disabled={disabled} onChange={onChange} className="gd-user-group-dialog-detail-input" />}
            {mode === "VIEW" && (value ? value : intl.formatMessage({ id: "userGroupDialog.detail.emptyValue" }))}
        </div>
    );
};

export interface IDetailsViewProps {
    isAdmin: boolean;
    user: IWorkspaceUser;
    mode: GroupsListMode;
    onChange?: (user: IWorkspaceUser, isAdmin: boolean) => void;
}

export const DetailsView: React.FC<IDetailsViewProps> = ({ user, isAdmin, mode, onChange }) => {
    const intl = useIntl();

    if (!user) {
        return null;
    }

    return (
        <div className="gd-user-group-dialog-detail">
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.firstName.label" />
                </div>
                <ValueCell
                    value={user.firstName}
                    mode={mode}
                    onChange={(firstName) => {
                        onChange({ ...user, firstName }, isAdmin);
                    }}
                />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.lastName.label" />
                </div>
                <ValueCell
                    value={user.lastName}
                    mode={mode}
                    onChange={(lastName) => {
                        onChange({ ...user, lastName }, isAdmin);
                    }}
                />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.email.label" />
                </div>
                <ValueCell
                    value={user.email}
                    mode={mode}
                    onChange={(email) => {
                        onChange({ ...user, email }, isAdmin);
                    }}
                />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.orgPermission.label" />
                </div>
                <div className="gd-user-group-dialog-detail-value">
                    {
                        mode === "VIEW" && (
                            isAdmin
                                ? intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.admin" })
                                : intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.member" })
                        )
                    }
                    {mode === "EDIT" && (
                        <OrganizationMemberDropdown
                            isAdmin={isAdmin}
                            onChange={(isAdmin) => {
                                onChange(user, isAdmin);
                            }}
                        />
                    )}
                </div>
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.id.label" />
                </div>
                <ValueCell value={user.login} mode={mode} disabled={true} onChange={noop} />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.status.label" />
                </div>
                <div className="gd-user-group-dialog-detail-value">
                    <span className="gd-user-group-dialog-detail-check">✓</span> Active
                </div>
            </div>
        </div>
    );
};
