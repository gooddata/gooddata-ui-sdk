// (C) 2023 GoodData Corporation

import { useState } from "react";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { sortByName, asPermissionAssignment } from "../utils.js";
import { userManagementMessages } from "../../../locales.js";
import { useToastMessage } from "../../../Messages/index.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

export const useAddWorkspace = (
    id: string,
    subjectType: WorkspacePermissionSubject,
    onSubmit: (workspaces: IGrantedWorkspace[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    const [addedWorkspaces, setAddedWorkspaces] = useState<IGrantedWorkspace[]>([]);

    const onDelete = (workspace: IGrantedWorkspace) => {
        setAddedWorkspaces(addedWorkspaces.filter((item) => item.id !== workspace.id));
    };

    const onChange = (workspace: IGrantedWorkspace) => {
        const unchangedWorkspaces = addedWorkspaces.filter((item) => item.id !== workspace.id);
        setAddedWorkspaces([...unchangedWorkspaces, workspace].sort(sortByName));
    };

    const onAdd = () => {
        const updateWorkspacePermissionsForUser =
            subjectType === "user"
                ? backend.organization(organizationId).permissions().updateWorkspacePermissionsForUser
                : backend.organization(organizationId).permissions().updateWorkspacePermissionsForUserGroup;

        updateWorkspacePermissionsForUser(id, addedWorkspaces.map(asPermissionAssignment))
            .then(() => {
                addSuccess(userManagementMessages.workspaceAddedSuccess);
                onSubmit(addedWorkspaces);
                onCancel();
            })
            .catch((error) => {
                console.error("Addition of workspace permission failed", error);
                addError(userManagementMessages.workspaceAddedError);
            });
    };

    const onSelect = ({ id, title }: IWorkspaceDescriptor) => {
        setAddedWorkspaces(
            [
                ...addedWorkspaces,
                {
                    id,
                    title,
                    permission: "VIEW" as const,
                    isHierarchical: false,
                },
            ].sort(sortByName),
        );
    };

    return {
        addedWorkspaces,
        onDelete,
        onChange,
        onSelect,
        onAdd,
    };
};
