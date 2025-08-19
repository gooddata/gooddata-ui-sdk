// (C) 2023-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { messages } from "../locales.js";
import { RemoveIcon } from "../RemoveIcon.js";
import { IGrantedUserGroup, ListMode } from "../types.js";

const GranteeGroupIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-group gd-grantee-item-icon-left" />
        </div>
    );
};

interface IUserGroupItemProps {
    userGroup: IGrantedUserGroup;
    mode: ListMode;
    onDelete: (grantee: IGrantedUserGroup) => void;
    isDeleteDisabled?: boolean;
}

export const UserGroupItem: React.FC<IUserGroupItemProps> = ({
    mode,
    onDelete,
    userGroup,
    isDeleteDisabled,
}) => {
    const itemClassName = cx("s-user-management-item", "gd-share-dialog-grantee-item");
    const intl = useIntl();
    const tooltipMessage =
        mode === "VIEW"
            ? intl.formatMessage(
                  isDeleteDisabled
                      ? messages.removeSavedUserGroupDisabledTooltip
                      : messages.removeSavedUserGroupTooltip,
              )
            : intl.formatMessage(messages.removeUnsavedUserGroupTooltip);

    return (
        <div className={itemClassName}>
            <RemoveIcon
                tooltipMessage={tooltipMessage}
                onClick={() => onDelete(userGroup)}
                isDisabled={isDeleteDisabled}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{userGroup.title}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
