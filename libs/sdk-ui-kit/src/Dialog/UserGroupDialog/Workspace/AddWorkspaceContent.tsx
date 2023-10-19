// (C) 2021-2023 GoodData Corporation
import React from "react";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

import { AddWorkspaceSelect } from './AddWorkspaceSelect.js';
import { WorkspaceList } from './WorkspaceList.js';
import { IGrantedWorkspace } from "../types.js";

/**
 * @internal
 */
export interface IAddWorkspaceContentProps {
    addedWorkspaces: IGrantedWorkspace[];
    grantedWorkspaces: IGrantedWorkspace[];
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
    onSelectWorkspace: (workspace: IWorkspaceDescriptor) => void;
}

/**
 * @internal
 */
export const AddWorkspaceContent: React.FC<IAddWorkspaceContentProps> = ({ addedWorkspaces, grantedWorkspaces, onDelete, onChange, onSelectWorkspace}) => {
    return (
        <>
            <AddWorkspaceSelect
                addedWorkspaces={addedWorkspaces}
                grantedWorkspaces={grantedWorkspaces}
                onSelectWorkspace={onSelectWorkspace}
            />
            <WorkspaceList
                mode="EDIT"
                workspaces={addedWorkspaces}
                onDelete={onDelete}
                onChange={onChange}
            />
        </>
    );
};
