// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React from "react";
import cx from "classnames";

import { IGrantedUserGroup, ListMode } from "../types.js";
import { GranteeGroupIcon } from "../../ShareDialog/ShareDialogBase/GranteeIcons.js";
import { BubbleHoverTrigger, Bubble } from "../../../Bubble/index.js";
import { userManagementMessages } from "../../../locales.js";

const alignPoints = [{ align: "cr cl" }];

interface IRemoveIconProps {
    mode: ListMode;
    onClick: () => void;
}

const RemoveIcon: React.FC<IRemoveIconProps> = ({ mode, onClick }) => {
    const intl = useIntl();
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className="gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-user-management-delete"
                onClick={onClick}
                aria-label="Share dialog grantee delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "VIEW"
                    ? intl.formatMessage(userManagementMessages.removeSavedUserGroupTooltip)
                    : intl.formatMessage(userManagementMessages.removeUnsavedUserGroupTooltip)}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

interface IUserGroupItemProps {
    userGroup: IGrantedUserGroup;
    mode: ListMode;
    onDelete: (grantee: IGrantedUserGroup) => void;
}

export const UserGroupItem: React.FC<IUserGroupItemProps> = ({ mode, onDelete, userGroup }) => {
    const itemClassName = cx("s-user-management-item", "gd-share-dialog-grantee-item");

    return (
        <div className={itemClassName}>
            <RemoveIcon mode={mode} onClick={() => onDelete(userGroup)} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{userGroup.title}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
