// (C) 2021-2023 GoodData Corporation
import React from "react";

import { IGrantedGroup, IUserEditDialogApi } from "../types.js";

import { GroupsList } from "./GroupsList.js";
import { AddGroupSelect } from "./AddGroupSelect.js";

/**
 * @internal
 */
export interface IAddGroupContentProps {
    api: IUserEditDialogApi;
    addedGroups: IGrantedGroup[];
    grantedGroups: IGrantedGroup[];
    onDelete: (group: IGrantedGroup) => void;
    onSelectGroup: (group: IGrantedGroup) => void;
}

/**
 * @internal
 */
export const AddGroupContent: React.FC<IAddGroupContentProps> = ({ api, addedGroups, grantedGroups, onDelete, onSelectGroup }) => {
    return (
        <>
            <AddGroupSelect
                api={api}
                addedGroups={addedGroups}
                grantedGroups={grantedGroups}
                onSelectGroup={onSelectGroup}
            />
            <GroupsList
                mode="EDIT"
                groups={addedGroups}
                onDelete={onDelete}
            />
        </>
    );
};
