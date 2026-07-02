// (C) 2023-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAutoupdateRef, useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import {
    type IGrantedDataSource,
    type IGrantedWorkspace,
    type WorkspacePermissionSubject,
} from "../types.js";
import {
    dataSourcePermissionsAssignmentToGrantedDataSource,
    dedupeGrantedDataSources,
    dedupeGrantedWorkspaces,
    grantedDataSourceAsPermissionAssignment,
    grantedWorkspaceAsPermissionAssignment,
    workspacePermissionsAssignmentToGrantedWorkspace,
} from "../utils.js";

export interface IUsePermissionsParams {
    id: string;
    subjectType: WorkspacePermissionSubject;
    organizationId: string;
    onSuccess: () => void;
}

export const usePermissions = ({ id, subjectType, organizationId, onSuccess }: IUsePermissionsParams) => {
    const { addSuccess, addError } = useToastMessage();
    // useToastMessage returns a freshly-created addError on every render. Hold the latest in a ref so
    // reloadPermissions can stay referentially stable (it feeds the mount effect below) without
    // re-running that effect - and thus refetching - on every render.
    const addErrorRef = useAutoupdateRef(addError);
    const backend = useBackendStrict();
    // Effective permissions (direct + inherited via groups / workspace hierarchy), each tagged with
    // its access source. Inherited entries are rendered read-only.
    const [grantedWorkspaces, setGrantedWorkspaces] = useState<IGrantedWorkspace[] | undefined>(undefined);
    const [grantedDataSources, setGrantedDataSources] = useState<IGrantedDataSource[] | undefined>(undefined);
    // Reloads fire from mount and from each mutation, so several can be in flight at once. Stamp every
    // reload and only commit the one that is still the latest, so a slow earlier fetch cannot overwrite
    // a newer result with stale data.
    const latestReloadId = useRef(0);
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

    // Loads the subject's effective permissions. Re-run after every mutation so the displayed state
    // reflects the server instead of optimistically-patched local arrays.
    const reloadPermissions = useCallback(async () => {
        const reloadId = ++latestReloadId.current;
        const isStale = () => reloadId !== latestReloadId.current;
        try {
            const assignments = await getPermissions(id);
            if (isStale()) {
                return;
            }
            setGrantedWorkspaces(
                dedupeGrantedWorkspaces(
                    assignments.workspacePermissions.map(workspacePermissionsAssignmentToGrantedWorkspace),
                ),
            );
            setGrantedDataSources(
                dedupeGrantedDataSources(
                    assignments.dataSourcePermissions.map(dataSourcePermissionsAssignmentToGrantedDataSource),
                ),
            );
        } catch (error) {
            // A superseded reload's failure is irrelevant - a newer one governs the displayed state.
            if (isStale()) {
                return;
            }
            // Surface the error on its own rather than letting it reach a mutation's catch, which would
            // mislabel it as a failed mutation.
            console.error("Loading of permissions failed", error);
            addErrorRef.current(messages.permissionsLoadFailure);
            // Settle the lists so a first-load failure leaves the dialog with a terminal (empty) state to
            // render instead of an endless loading spinner; a failure after a successful load keeps the
            // last-known list on screen.
            setGrantedWorkspaces((current) => current ?? []);
            setGrantedDataSources((current) => current ?? []);
        }
    }, [getPermissions, id, addErrorRef]);

    useEffect(() => {
        void reloadPermissions();
    }, [reloadPermissions]);

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
                onSuccess();
                void reloadPermissions();
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
                onSuccess();
                void reloadPermissions();
            })
            .catch((error) => {
                console.error("Removal of data source permission failed", error);
                addError(messages.dataSourceRemovedFailure);
            });
    };

    const updateGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        const previousWorkspace = grantedWorkspaces?.find((item) => item.id === workspace.id);
        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: [{ id, type: subjectType }],
                workspaces: [grantedWorkspaceAsPermissionAssignment(workspace)],
            })
            .then(() => {
                addSuccess(messages.workspaceChangeSuccess);
                // Toggling hierarchy changes which child workspaces are reachable, so the effective
                // (overview) data needs refreshing; a plain level change does not.
                if (previousWorkspace?.isHierarchical !== workspace.isHierarchical) {
                    onSuccess();
                }
                void reloadPermissions();
            })
            .catch((error) => {
                console.error("Change of workspace permission failed", error);
                addError(messages.workspaceChangeFailure);
            });
    };

    const updateGrantedDataSource = (dataSource: IGrantedDataSource) => {
        backend
            .organization(organizationId)
            .permissions()
            .assignPermissions({
                assignees: [{ id, type: subjectType }],
                dataSources: [grantedDataSourceAsPermissionAssignment(dataSource)],
            })
            .then(() => {
                addSuccess(messages.dataSourceChangeSuccess);
                onSuccess();
                void reloadPermissions();
            })
            .catch((error) => {
                console.error("Change of data source permission failed", error);
                addError(messages.dataSourceChangeFailure);
            });
    };

    // Called after the add/edit flows have applied their changes; just re-sync from the server.
    const onWorkspacesChanged = () => {
        onSuccess();
        void reloadPermissions();
    };

    const onDataSourcesChanged = () => {
        onSuccess();
        void reloadPermissions();
    };

    return {
        grantedWorkspaces,
        grantedDataSources,
        reloadPermissions,
        onWorkspacesChanged,
        onDataSourcesChanged,
        removeGrantedWorkspace,
        removeGrantedDataSource,
        updateGrantedWorkspace,
        updateGrantedDataSource,
    };
};
