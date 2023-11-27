// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React from "react";
import cx from "classnames";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";

import { IGrantedUserGroup, ListMode } from "../types.js";
import { messages } from "../locales.js";

const GranteeGroupIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-group gd-grantee-item-icon-left" />
        </div>
    );
};

const alignPoints = [{ align: "cr cl" }];

interface IRemoveIconProps {
    mode: ListMode;
    isDisabled: boolean;
    onClick: () => void;
}

const RemoveIcon: React.FC<IRemoveIconProps> = ({ mode, onClick, isDisabled }) => {
    const intl = useIntl();
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className={cx(
                    "gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-user-management-delete",
                    { "is-disabled": isDisabled },
                )}
                onClick={isDisabled ? undefined : onClick}
                aria-label="Share dialog grantee delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "VIEW"
                    ? intl.formatMessage(
                          isDisabled
                              ? messages.removeSavedUserGroupDisabledTooltip
                              : messages.removeSavedUserGroupTooltip,
                      )
                    : intl.formatMessage(messages.removeUnsavedUserGroupTooltip)}
            </Bubble>
        </BubbleHoverTrigger>
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

    return (
        <div className={itemClassName}>
            <RemoveIcon mode={mode} onClick={() => onDelete(userGroup)} isDisabled={isDeleteDisabled} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{userGroup.title}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
