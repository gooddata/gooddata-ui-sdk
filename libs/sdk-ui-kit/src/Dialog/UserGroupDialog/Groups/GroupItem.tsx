// (C) 2022-2023 GoodData Corporation

import { FormattedMessage } from "react-intl";
import React from "react";
import cx from "classnames";

import { IGrantedGroup, GroupsListMode } from "../types.js";
import { GranteeGroupIcon } from "../../ShareDialog/ShareDialogBase/GranteeIcons.js";
import { BubbleHoverTrigger, Bubble } from "../../../Bubble/index.js";

const alignPoints = [{ align: "cr cl" }];

interface IRemoveIconProps {
    mode: GroupsListMode;
    onClick: () => void;
}

const RemoveIcon: React.FC<IRemoveIconProps> = ({ mode, onClick }) => {
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className="gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-gd-grantee-item-delete"
                onClick={onClick}
                aria-label="Share dialog grantee delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "VIEW" ? (
                    <FormattedMessage id={"userGroupDialog.group.remove"} />
                ) : (
                    <FormattedMessage id={"shareDialog.share.grantee.item.remove.selection"} />
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

interface IGroupItemProps {
    group: IGrantedGroup;
    mode: GroupsListMode;
    onDelete: (grantee: IGrantedGroup) => void;
}

export const GroupItem: React.FC<IGroupItemProps> = ({ mode, onDelete, group }) => {
    const itemClassName = cx(
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
    );

    return (
        <div className={itemClassName}>
            <RemoveIcon mode={mode} onClick={() => onDelete(group)} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{group.title}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
