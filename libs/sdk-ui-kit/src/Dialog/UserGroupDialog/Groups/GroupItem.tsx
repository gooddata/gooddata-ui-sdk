// (C) 2022-2023 GoodData Corporation

import React from "react";
import cx from "classnames";

import { IGrantedGroup } from "../types.js";
import { GranteeGroupIcon } from "../../ShareDialog/ShareDialogBase/GranteeIcons.js";

interface IGroupItemProps {
    group: IGrantedGroup;
    onDelete: (grantee: IGrantedGroup) => void;
}

export const GroupItem: React.FC<IGroupItemProps> = ({ group }) => {
    const itemClassName = cx(
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
        {
            "is-active": false, // TODO based on hover
        },
    );

    // TODO delete icon + onDelete
    return (
        <div className={itemClassName}>
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{group.title}</div>
            </div>
            <GranteeGroupIcon />
        </div>
    );
};
