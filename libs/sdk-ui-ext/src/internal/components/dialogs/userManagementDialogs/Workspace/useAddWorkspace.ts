// (C) 2023-2024 GoodData Corporation

import { useState } from "react";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { sortByName, grantedWorkspaceAsPermissionAssignment } from "../utils.js";
import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useTelemetry } from "../TelemetryContext.js";

export const useAddWorkspace = (
    ids: string[],
    subjectType: WorkspacePermissionSubject,
    onSubmit: (workspaces: IGrantedWorkspace[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedWorkspaces, setAddedWorkspaces] = useState<IGrantedWorkspace[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    const onDelete = (workspace: IGrantedWorkspace) => {
        setAddedWorkspaces(addedWorkspaces.filter((item) => item.id !== workspace.id));
    };

    const onChange = (workspace: IGrantedWorkspace) => {
        const unchangedWorkspaces = addedWorkspaces.filter((item) => item.id !== workspace.id);
        setAddedWorkspaces([...unchangedWorkspaces, workspace].sort(sortByName));
    };

    const onAdd = () => {
        setIsProcessing(true);

        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: ids.map((id) => ({ id, type: subjectType })),
                workspaces: addedWorkspaces.map(grantedWorkspaceAsPermissionAssignment),
            })
            .then(() => {
                if (ids.length === 1) {
                    addSuccess(messages.workspaceAddedSuccess);
                    trackEvent(
                        subjectType === "user"
                            ? "permission-added-to-single-user"
                            : "permission-added-to-single-group",
                    );
                } else {
                    addSuccess(
                        subjectType === "user"
                            ? messages.workspacesAddedToUsersSuccess
                            : messages.workspacesAddedToUserGroupsSuccess,
                    );
                    trackEvent(
                        subjectType === "user"
                            ? "permission-added-to-multiple-users"
                            : "permission-added-to-multiple-groups",
                    );
                }

                onSubmit(addedWorkspaces);
                onCancel();
            })
            .catch((error) => {
                console.error("Addition of workspace permission failed", error);
                if (ids.length === 1) {
                    addError(messages.workspaceAddedError);
                } else {
                    addError(
                        subjectType === "user"
                            ? messages.workspacesAddedToUsersError
                            : messages.workspacesAddedToUserGroupsError,
                    );
                }
            })
            .finally(() => setIsProcessing(false));
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
