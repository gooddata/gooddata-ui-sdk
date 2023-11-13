// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React from "react";
import cx from "classnames";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";

import { ListMode, IUserMember } from "../types.js";
import { messages } from "../locales.js";

const GranteeUserIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
};

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
                className="gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-user-management-item-delete"
                onClick={onClick}
                aria-label="Group dialog user member delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "VIEW"
                    ? intl.formatMessage(messages.removeSavedUserTooltip)
                    : intl.formatMessage(messages.removeUnsavedUserTooltip)}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

interface IUserItemProps {
    user: IUserMember;
    mode: ListMode;
    onDelete: (user: IUserMember) => void;
}

export const UserItem: React.FC<IUserItemProps> = ({ mode, onDelete, user }) => {
    const itemClassName = cx("s-user-management-item", "gd-share-dialog-grantee-item");

    return (
        <div className={itemClassName}>
            <RemoveIcon mode={mode} onClick={() => onDelete(user)} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{user.title}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email">{user.email}</div>
            </div>
            <GranteeUserIcon />
        </div>
    );
};
