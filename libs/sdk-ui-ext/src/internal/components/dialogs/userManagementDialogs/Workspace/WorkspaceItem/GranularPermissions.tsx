// (C) 2024-2025 GoodData Corporation

import { type ReactNode, useCallback, useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { DialogListHeader, Message } from "@gooddata/sdk-ui-kit";

import { AdditionalAccessPermissionItem, WorkspaceAccessPermissionItem } from "./GranularPermissionsItems.js";
import {
    getGranularPermissions,
    getImplicitGranularPermissions,
    getWorkspacePermission,
    isExportPermissionIndefinite,
    isPermissionDisabled,
    removeRedundantPermissions,
    sanitizeExportPermissions,
    workspacePermissions,
} from "./granularPermissionUtils.js";
import { getWorkspaceAccessPermissionDescription, workspaceGranularPermissionMessages } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";
import {
    type IGrantedWorkspace,
    type IPermissionsItem,
    type WorkspacePermission,
    type WorkspacePermissions,
} from "../../types.js";

const granularPermissions: IPermissionsItem[] = [
    { id: "CREATE_AUTOMATION", enabled: true },
    { id: "USE_AI_ASSISTANT", enabled: true },
    { id: "EXPORT", enabled: true },
    { id: "EXPORT_PDF", enabled: true, group: true },
    { id: "EXPORT_TABULAR", enabled: true, group: true },
    { id: "CREATE_FILTER_VIEW", enabled: true },
];

interface IGranularPermissionsProps {
    workspace: IGrantedWorkspace | undefined;
    onChange: (workspace: IGrantedWorkspace) => void;
    areFilterViewsEnabled: boolean;
    showRedundancyWarningMessage: boolean;
}

export function GranularPermissions({
    workspace,
    areFilterViewsEnabled,
    onChange,
    showRedundancyWarningMessage,
}: IGranularPermissionsProps) {
    const intl = useIntl();
    const { permissions: selectedPermissions = [], isHierarchical = false } = workspace ?? {};
    const selectedWorkspacePermission = getWorkspacePermission(selectedPermissions);
    const selectedGranularPermissions = getGranularPermissions(selectedPermissions);

    const granularItems = useMemo(
        () => granularPermissions.filter((item) => areFilterViewsEnabled || item.id !== "CREATE_FILTER_VIEW"),
        [areFilterViewsEnabled],
    );

    const handleChange = useCallback(
        (permissions: WorkspacePermissions, isHierarchical: boolean) => {
            const sanitizedPermissions = removeRedundantPermissions(permissions);
            onChange({ ...workspace, permissions: sanitizedPermissions, isHierarchical });
        },
        [onChange, workspace],
    );

    const handleHierarchicalChange = useCallback(
        (isHierarchical: boolean) => {
            handleChange([selectedWorkspacePermission, ...selectedGranularPermissions], isHierarchical);
        },
        [handleChange, selectedGranularPermissions, selectedWorkspacePermission],
    );

    const handleWorkspacePermissionChange = useCallback(
        (workspacePermission: WorkspacePermission) => {
            const updatedGranularPermissions = getImplicitGranularPermissions(workspacePermission);
            handleChange([workspacePermission, ...updatedGranularPermissions], isHierarchical);
        },
        [handleChange, isHierarchical],
    );

    const handleGranularPermissionChange = useCallback(
        (granularPermission: WorkspacePermission) => {
            const isPermissionSelected = selectedGranularPermissions.includes(granularPermission);
            const updatedGranularPermissions = isPermissionSelected
                ? selectedGranularPermissions.filter((p) => p !== granularPermission)
                : [...selectedGranularPermissions, granularPermission];
            const sanitizedGranularPermissions = sanitizeExportPermissions(
                granularPermission,
                updatedGranularPermissions,
                !isPermissionSelected,
            );

            handleChange([selectedWorkspacePermission, ...sanitizedGranularPermissions], isHierarchical);
        },
        [handleChange, isHierarchical, selectedGranularPermissions, selectedWorkspacePermission],
    );

    if (!workspace) {
        return (
            <div className="gd-granular-permissions-empty">
                <FormattedMessage id="userManagement.workspace.granularPermission.noWorkspace" />
            </div>
        );
    }

    return (
        <div className="gd-granular-permissions">
            <div className="gd-granular-permissions__hierarchy">
                <label className="input-checkbox-toggle">
                    <input
                        type="checkbox"
                        checked={isHierarchical}
                        onChange={(e) => handleHierarchicalChange(e.currentTarget.checked)}
                    />
                    <span className="input-label-text">
                        <FormattedMessage id="userManagement.workspace.granularPermission.hierarchy" />
                    </span>
                </label>
                <div className="gd-granular-permissions__hierarchy-icon">
                    <QuestionMarkIcon
                        bubbleTextId={workspaceGranularPermissionMessages.hierarchyTooltip.id}
                        width={14}
                        height={14}
                    />
                </div>
            </div>
            <DialogListHeader
                title={intl.formatMessage({
                    id: "userManagement.workspace.granularPermission.workspaceAccess.title",
                })}
            />
            <div className="gd-granular-permissions__workspace-access">
                {workspacePermissions.map((workspacePermission) => {
                    return (
                        <WorkspaceAccessPermissionItem
                            key={workspacePermission}
                            item={workspacePermission}
                            checked={workspacePermission === selectedWorkspacePermission}
                            onChange={() => handleWorkspacePermissionChange(workspacePermission)}
                        />
                    );
                })}
            </div>
            <div className="gd-granular-permissions__workspace-access-description">
                <FormattedMessage
                    id={getWorkspaceAccessPermissionDescription(selectedWorkspacePermission).id}
                />
            </div>
            <DialogListHeader
                title={intl.formatMessage({
                    id: "userManagement.workspace.granularPermission.additionalAccess.title",
                })}
            />
            <div className="gd-granular-permissions__additional-access-wrapper">
                {granularItems.map((granularPermission) => {
                    return (
                        <AdditionalAccessPermissionItem
                            key={granularPermission.id}
                            item={granularPermission}
                            checked={selectedGranularPermissions.includes(granularPermission.id)}
                            indefinite={isExportPermissionIndefinite(
                                granularPermission.id,
                                selectedGranularPermissions,
                            )}
                            disabled={isPermissionDisabled(
                                granularPermission.id,
                                selectedWorkspacePermission,
                                selectedGranularPermissions,
                            )}
                            onChange={() => handleGranularPermissionChange(granularPermission.id)}
                        />
                    );
                })}
            </div>
            {showRedundancyWarningMessage ? (
                <Message type="warning" className="gd-granular-permissions__warning">
                    <FormattedMessage
                        id="userManagement.workspace.granularPermission.warning"
                        values={{
                            b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Message>
            ) : null}
        </div>
    );
}
