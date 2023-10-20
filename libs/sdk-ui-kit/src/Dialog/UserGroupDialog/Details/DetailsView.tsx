// (C) 2023 GoodData Corporation

import React from "react";
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";

export interface IDetailsViewProps {
    isAdmin: boolean;
    user: IWorkspaceUser;
}

const ValueCell: React.FC<{ value?: string }> = ({ value }) => {
    const intl = useIntl();
    return (
        <div
            className={cx(
                "gd-user-group-dialog-detail-value",
                { "gd-user-group-dialog-detail-value-empty": !value }
            )}
        >
            {value ? value : intl.formatMessage({ id: "userGroupDialog.detail.emptyValue" })}
        </div>
    );
};

export const DetailsView: React.FC<IDetailsViewProps> = ({ user, isAdmin }) => {
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
                <ValueCell value={user.firstName} />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.lastName.label" />
                </div>
                <ValueCell value={user.lastName} />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.email.label" />
                </div>
                <ValueCell value={user.email} />
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.orgPermission.label" />
                </div>
                <div className="gd-user-group-dialog-detail-value">
                    {
                        isAdmin
                            ? intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.admin" }) :
                            intl.formatMessage({ id: "userGroupDialog.detail.orgPermission.member" })
                    }
                </div>
            </div>
            <div className="gd-user-group-dialog-detail-row">
                <div className="gd-user-group-dialog-detail-label">
                    <FormattedMessage id="userGroupDialog.detail.id.label" />
                </div>
                <div className="gd-user-group-dialog-detail-value">{user.login}</div>
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
