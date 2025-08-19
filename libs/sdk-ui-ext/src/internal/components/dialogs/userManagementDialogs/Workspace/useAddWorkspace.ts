// (C) 2023-2025 GoodData Corporation

import { useState } from "react";

import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useTelemetry } from "../TelemetryContext.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { grantedWorkspaceAsPermissionAssignment, sortByName } from "../utils.js";

export const useAddWorkspace = (
    ids: string[],
    subjectType: WorkspacePermissionSubject,
    onSubmit: (workspaces: IGrantedWorkspace[]) => void,
    onCancel: () => void,
    editWorkspace?: IGrantedWorkspace,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedWorkspaces, setAddedWorkspaces] = useState<IGrantedWorkspace[]>(
        editWorkspace ? [editWorkspace] : [],
    );
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
                workspaces: addedWorkspaces.map((w) => grantedWorkspaceAsPermissionAssignment(w)),
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
        setAddedWorkspaces([...addedWorkspaces, getInitialWorkspaceTemplate(id, title)].sort(sortByName));
    };

    const onOverwriteSelect = ({ id, title }: IWorkspaceDescriptor) => {
        setAddedWorkspaces([getInitialWorkspaceTemplate(id, title)]);
    };

    return {
        addedWorkspaces,
        onDelete,
        onChange,
        onSelect,
        onOverwriteSelect,
        onAdd,
        isProcessing,
    };
};

const getInitialWorkspaceTemplate = (id: string, title: string) => ({
    id,
    title,
    permissions: ["VIEW" as const],
    isHierarchical: false,
});
