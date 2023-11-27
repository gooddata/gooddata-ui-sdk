// (C) 2023 GoodData Corporation

import { useState } from "react";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { sortByName, asPermissionAssignment } from "../utils.js";
import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

export const useAddWorkspace = (
    ids: string[],
    subjectType: WorkspacePermissionSubject,
    grantedWorkspaces: IGrantedWorkspace[],
    onSubmit: (workspaces: IGrantedWorkspace[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    const [addedWorkspaces, setAddedWorkspaces] = useState<IGrantedWorkspace[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDelete = (workspace: IGrantedWorkspace) => {
        setAddedWorkspaces(addedWorkspaces.filter((item) => item.id !== workspace.id));
    };

    const onChange = (workspace: IGrantedWorkspace) => {
        const unchangedWorkspaces = addedWorkspaces.filter((item) => item.id !== workspace.id);
        setAddedWorkspaces([...unchangedWorkspaces, workspace].sort(sortByName));
    };

    const onAdd = () => {
        setIsProcessing(true);
        if (ids.length === 1) {
            backend
                .organization(organizationId)
                .permissions()
                .updateWorkspacePermissions([
                    ...grantedWorkspaces.map((workspace) =>
                        asPermissionAssignment(ids[0], subjectType, workspace),
                    ),
                    ...addedWorkspaces.map((workspace) =>
                        asPermissionAssignment(ids[0], subjectType, workspace),
                    ),
                ])
                .then(() => {
                    addSuccess(messages.workspaceAddedSuccess);
                    onSubmit(addedWorkspaces);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of workspace permission failed", error);
                    addError(messages.workspaceAddedError);
                })
                .finally(() => setIsProcessing(false));
        } else {
            const permissionLoader =
                subjectType === "user"
                    ? backend.organization(organizationId).permissions().getWorkspacePermissionsForUser
                    : backend.organization(organizationId).permissions().getWorkspacePermissionsForUserGroup;

            Promise
                // fetch permissions for every edited subject and merge them with new permissions
                .all(
                    ids.map(async (id) => {
                        const newPermissions = addedWorkspaces.map((workspace) =>
                            asPermissionAssignment(id, subjectType, workspace),
                        );
                        return permissionLoader(id).then((existingPermissions) => [
                            ...existingPermissions,
                            ...newPermissions,
                        ]);
                    }),
                )
                // set new permissions
                .then((permissions) =>
                    backend
                        .organization(organizationId)
                        .permissions()
                        .updateWorkspacePermissions([].concat(...permissions))
                        .then(() => {
                            addSuccess(
                                subjectType === "user"
                                    ? messages.workspacesAddedToUsersSuccess
                                    : messages.workspacesAddedToUserGroupsSuccess,
                            );
                            onSubmit(addedWorkspaces);
                            onCancel();
                        })
                        .catch((error) => {
                            console.error("Addition of workspace permissions failed", error);
                            addError(
                                subjectType === "user"
                                    ? messages.workspacesAddedToUsersError
                                    : messages.workspacesAddedToUserGroupsError,
                            );
                        })
                        .finally(() => setIsProcessing(false)),
                );
        }
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
        isProcessing,
    };
};
