// (C) 2024-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { DialogListHeader, Message } from "@gooddata/sdk-ui-kit";

import {
    type IGrantedWorkspace,
    type IPermissionsItem,
    type WorkspacePermission,
    type WorkspacePermissions,
} from "../../types.js";

import { AdditionalAccessPermissionItem, WorkspaceAccessPermissionItem } from "./GranularPermissionsItems.js";
import {
    getGranularPermissions,
    getWorkspacePermission,
    isExportPermissionIndefinite,
    isPermissionDisabled,
    sanitizeExportPermissions,
    workspacePermissions,
} from "./granularPermissionUtils.js";
import { getWorkspaceAccessPermissionDescription, workspaceGranularPermissionMessages } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";

const granularPermissions: IPermissionsItem[] = [
    { id: "CREATE_AUTOMATION", enabled: true },
    { id: "USE_AI_ASSISTANT", enabled: true },
    { id: "CREATE_COMPUTED_ATTRIBUTE", enabled: true },
    { id: "EXPORT", enabled: true },
    { id: "EXPORT_PDF", enabled: true, group: true },
    { id: "EXPORT_TABULAR", enabled: true, group: true },
    { id: "CREATE_METRIC", enabled: true },
    { id: "CREATE_VISUALIZATION", enabled: true },
    { id: "MANAGE_VISUALIZATIONS", enabled: true },
    { id: "CREATE_FILTER_VIEW", enabled: true },
];

interface IGranularPermissionsProps {
    workspace: IGrantedWorkspace | undefined;
    savedPermissions?: WorkspacePermissions;
    onChange: (workspace: IGrantedWorkspace) => void;
    showRedundancyWarningMessage: boolean;
    areMetricPermissionsEnabled?: boolean;
    isCreateVisualizationWorkspacePermissionEnabled?: boolean;
    areComputedAttributesEnabled?: boolean;
    areVisualizationPermissionsEnabled?: boolean;
}

export function GranularPermissions({
    workspace,
    savedPermissions = [],
    onChange,
    showRedundancyWarningMessage,
    areMetricPermissionsEnabled = false,
    isCreateVisualizationWorkspacePermissionEnabled = false,
    areComputedAttributesEnabled = false,
    areVisualizationPermissionsEnabled = false,
}: IGranularPermissionsProps) {
    const intl = useIntl();

    if (!workspace) {
        return (
            <div className="gd-granular-permissions-empty">
                <FormattedMessage id="userManagement.workspace.granularPermission.noWorkspace" />
            </div>
        );
    }

    const { permissions: selectedPermissions, isHierarchical } = workspace;
    const selectedWorkspacePermission = getWorkspacePermission(selectedPermissions);
    const selectedGranularPermissions = getGranularPermissions(selectedPermissions);
    const chosenGranularPermissions = selectedPermissions.filter((p) => !workspacePermissions.includes(p));

    const granularItems = granularPermissions.filter(
        ({ id }) =>
            (id !== "CREATE_METRIC" || areMetricPermissionsEnabled) &&
            (id !== "CREATE_VISUALIZATION" || isCreateVisualizationWorkspacePermissionEnabled) &&
            (id !== "CREATE_COMPUTED_ATTRIBUTE" || areComputedAttributesEnabled) &&
            (id !== "MANAGE_VISUALIZATIONS" || areVisualizationPermissionsEnabled),
    );
    const isShown = (permission: WorkspacePermission) => granularItems.some(({ id }) => id === permission);

    // Unsanitized until save, so unchecking or leaving Manage brings earlier choices back.
    const handleChange = (permissions: WorkspacePermissions, isHierarchical: boolean) => {
        onChange({ ...workspace, permissions, isHierarchical });
    };

    const handleHierarchicalChange = (isHierarchical: boolean) => {
        handleChange([selectedWorkspacePermission, ...chosenGranularPermissions], isHierarchical);
    };

    const handleWorkspacePermissionChange = (workspacePermission: WorkspacePermission) => {
        // The admin can't see hidden permissions, so only the stored access level keeps them.
        const hiddenPermissions =
            workspacePermission === getWorkspacePermission(savedPermissions)
                ? savedPermissions.filter((p) => !workspacePermissions.includes(p) && !isShown(p))
                : [];
        handleChange(
            [workspacePermission, ...chosenGranularPermissions.filter(isShown), ...hiddenPermissions],
            isHierarchical,
        );
    };

    const handleGranularPermissionChange = (granularPermission: WorkspacePermission) => {
        const isPermissionSelected = selectedGranularPermissions.includes(granularPermission);
        const updatedGranularPermissions = isPermissionSelected
            ? chosenGranularPermissions.filter((p) => p !== granularPermission)
            : [...chosenGranularPermissions, granularPermission];
        const sanitizedGranularPermissions = sanitizeExportPermissions(
            granularPermission,
            updatedGranularPermissions,
            !isPermissionSelected,
        );

        handleChange([selectedWorkspacePermission, ...sanitizedGranularPermissions], isHierarchical);
    };

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
