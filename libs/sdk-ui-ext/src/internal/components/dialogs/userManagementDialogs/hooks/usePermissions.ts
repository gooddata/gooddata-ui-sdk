// (C) 2023-2025 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import {
    type IGrantedDataSource,
    type IGrantedWorkspace,
    type WorkspacePermissionSubject,
} from "../types.js";
import {
    dataSourcePermissionsAssignmentToGrantedDataSource,
    grantedDataSourceAsPermissionAssignment,
    grantedWorkspaceAsPermissionAssignment,
    sortByName,
    workspacePermissionsAssignmentToGrantedWorkspace,
} from "../utils.js";

export const usePermissions = (
    id: string,
    subjectType: WorkspacePermissionSubject,
    organizationId: string,
    onSuccess: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const [grantedWorkspaces, setGrantedWorkspaces] = useState<IGrantedWorkspace[]>(undefined);
    const [grantedDataSources, setGrantedDataSources] = useState<IGrantedDataSource[]>(undefined);
    // setup API factories based on the subject we are working with
    const { getPermissions } = useMemo(() => {
        if (subjectType === "user") {
            return {
                getPermissions: backend.organization(organizationId).permissions().getPermissionsForUser,
            };
        }
        return {
            getPermissions: backend.organization(organizationId).permissions().getPermissionsForUserGroup,
        };
    }, [backend, organizationId, subjectType]);

    // load initial permissions
    useEffect(() => {
        getPermissions(id).then((assignments) => {
            const workspaces = assignments.workspacePermissions.map((w) =>
                workspacePermissionsAssignmentToGrantedWorkspace(w),
            );
            const dataSources = assignments.dataSourcePermissions.map(
                dataSourcePermissionsAssignmentToGrantedDataSource,
            );
            setGrantedWorkspaces(workspaces);
            setGrantedDataSources(dataSources);
        });
    }, [getPermissions, id, organizationId]);

    const removeGrantedWorkspace = (removedWorkspace: IGrantedWorkspace) => {
        backend
            .organization(organizationId)
            .permissions()
            .revokePermissions({
                assignees: [{ id, type: subjectType }],
                workspaces: [grantedWorkspaceAsPermissionAssignment(removedWorkspace)],
            })
            .then(() => {
                addSuccess(messages.workspaceRemovedSuccess);
                setGrantedWorkspaces(grantedWorkspaces.filter((item) => item.id !== removedWorkspace.id));
                onSuccess();
            })
            .catch((error) => {
                console.error("Removal of workspace permission failed", error);
                addError(messages.workspaceRemovedFailure);
            });
    };

    const removeGrantedDataSource = (removedDataSource: IGrantedDataSource) => {
        backend
            .organization(organizationId)
            .permissions()
            .revokePermissions({
                assignees: [{ id, type: subjectType }],
                dataSources: [grantedDataSourceAsPermissionAssignment(removedDataSource)],
            })
            .then(() => {
                addSuccess(messages.dataSourceRemovedSuccess);
                setGrantedDataSources(grantedDataSources.filter((item) => item.id !== removedDataSource.id));
                onSuccess();
            })
            .catch((error) => {
                console.error("Removal of data source permission failed", error);
                addError(messages.dataSourceRemovedFailure);
            });
    };

    const updateGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        const updatedWorkspace = grantedWorkspaces.find((item) => item.id === workspace.id);
        const updatedWorkspaces = [
            ...grantedWorkspaces.filter((item) => item !== updatedWorkspace),
            workspace,
        ].sort(sortByName);

        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: [{ id, type: subjectType }],
                workspaces: [grantedWorkspaceAsPermissionAssignment(workspace)],
            })
            .then(() => {
                addSuccess(messages.workspaceChangeSuccess);
                setGrantedWorkspaces(updatedWorkspaces);
                if (updatedWorkspace.isHierarchical !== workspace.isHierarchical) {
                    onSuccess();
                }
            })
            .catch((error) => {
                console.error("Change of workspace permission failed", error);
                addError(messages.workspaceChangeFailure);
            });
    };

    const updateGrantedDataSource = (dataSource: IGrantedDataSource) => {
        const updatedDataSources = [
            ...grantedDataSources.filter((item) => item.id !== dataSource.id),
            dataSource,
        ].sort(sortByName);

        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: [{ id, type: subjectType }],
                dataSources: [grantedDataSourceAsPermissionAssignment(dataSource)],
            })
            .then(() => {
                addSuccess(messages.dataSourceChangeSuccess);
                setGrantedDataSources(updatedDataSources);
                onSuccess();
            })
            .catch((error) => {
                console.error("Change of data source permission failed", error);
                addError(messages.dataSourceChangeFailure);
            });
    };

    // update internal array with workspaces after applied changed in workspaces edit mode
    const onWorkspacesChanged = (workspaces: IGrantedWorkspace[]) => {
        const unchangedWorkspaces = grantedWorkspaces.filter(
            (item) => !workspaces.some((w) => w.id === item.id),
        );
        setGrantedWorkspaces([...unchangedWorkspaces, ...workspaces].sort(sortByName));
        onSuccess();
    };

    // update internal array with data sources after applied changed in data sources edit mode
    const onDataSourcesChanged = (dataSources: IGrantedDataSource[]) => {
        const unchangedDataSources = grantedDataSources.filter(
            (item) => !dataSources.some((w) => w.id === item.id),
        );
        setGrantedDataSources([...unchangedDataSources, ...dataSources].sort(sortByName));
        onSuccess();
    };

    return {
        grantedWorkspaces,
        grantedDataSources,
        onWorkspacesChanged,
        onDataSourcesChanged,
        removeGrantedWorkspace,
        removeGrantedDataSource,
        updateGrantedWorkspace,
        updateGrantedDataSource,
    };
};
