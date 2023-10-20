// (C) 2023 GoodData Corporation

import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { IWorkspaceUser } from "@gooddata/sdk-model";

import { Overlay } from "../../Overlay/index.js";
import { IAlignPoint } from "../../typings/positioning.js";
import { Tabs } from "../../Tabs/index.js";
import { userDialogTabsMessageLabels, userDialogMessageLabels } from "../../locales.js";
import { Button } from "../../Button/index.js";
import { useToastMessage } from "../../Messages/index.js";
import { DialogBase } from "../DialogBase.js";
import { Typography } from "../../Typography/index.js";

import { WorkspaceList } from "./Workspace/WorkspaceList.js";
import { DialogMode, IGrantedWorkspace, IUserEditDialogApi } from "./types.js";
import { AddWorkspaceBase } from "./Workspace/AddWorkspaceBase.js";
import {
    sortGrantedWorkspacesByName,
    asEmptyPermissionAssignment,
    asPermissionAssignment,
    asPermission
} from "./utils.js";
import { LoadingComponent } from "@gooddata/sdk-ui";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserDialogBaseProps {
    userId: string;
    onClose: () => void;
    api: IUserEditDialogApi;
}

const tabs = [userDialogTabsMessageLabels.workspaces, userDialogTabsMessageLabels.groups, userDialogTabsMessageLabels.details];

/**
 * @internal
 */
export const UserEditDialog: React.FC<IUserDialogBaseProps> = ({ userId, api, onClose }) => {
    const [dialogMode, setDialogMode] = useState<DialogMode>("VIEW");
    const { addSuccess, addError } = useToastMessage();
    const intl = useIntl();
    const [selectedTabId, setSelectedTabId] = useState(userDialogTabsMessageLabels.workspaces);
    const [user, setUser] = useState<IWorkspaceUser>();

    useEffect(() => {
        api?.getUserById(userId)
            .then((user) => setUser(user));
    }, [api, userId]);

    useEffect(() => {
        api
            ?.getWorkspacePermissionsForUser(userId)
            .then((assignments) => {
                const workspaces = assignments.map((assignment) => {
                    const { workspace, permissions, hierarchyPermissions } = assignment;
                    const permission = asPermission(hierarchyPermissions ? hierarchyPermissions : permissions);
                    return {
                        id: workspace.id,
                        title: workspace.name,
                        permission,
                        isHierarchical: hierarchyPermissions.length > 0,
                    };
                });
                setGrantedWorkspaces(workspaces);
            });
    }, [api, userId]);

    const [grantedWorkspaces, setGrantedWorkspaces] = useState<IGrantedWorkspace[]>([]);

    // TODO show confirm dialog, call backend API from there
    const deleteUser = () => alert("Call API to delete user (possibly confirm the action first)");

    const removeGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        api.manageWorkspacePermissionsForUser(userId, [asEmptyPermissionAssignment(workspace)])
            .then(() => {
                addSuccess(userDialogMessageLabels.grantedWorkspaceRemovedSuccess);
                setGrantedWorkspaces(grantedWorkspaces.filter((item) => item.id !== workspace.id));
            })
            .catch((error) => {
                console.error("Removal of workspace permission failed", error);
                addError(userDialogMessageLabels.grantedWorkspaceRemovedError);
            });
    };

    const changeGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        api.manageWorkspacePermissionsForUser(userId, [asPermissionAssignment(workspace)])
            .then(() => {
                addSuccess(userDialogMessageLabels.grantedWorkspaceChangeSuccess);
                setGrantedWorkspaces([...grantedWorkspaces.filter((item) => item.id !== workspace.id), workspace].sort(sortGrantedWorkspacesByName));
            })
            .catch((error) => {
                console.error("Addition of workspace permission failed", error);
                addError(userDialogMessageLabels.grantedWorkspaceChangeError);
            });
    };

    // update internal array with workspaces after applied changed in workspaces edit mode
    const onWorkspaceChanged = (workspaces: IGrantedWorkspace[]) => {
        const unchangedWorkspaces = grantedWorkspaces
            .filter((item) => !workspaces.some((w) => w.id === item.id));
        setGrantedWorkspaces([...unchangedWorkspaces, ...workspaces].sort(sortGrantedWorkspacesByName));
    };

    return (
        <Overlay
            alignPoints={alignPoints}
            isModal={true}
            positionType="fixed"
            className="gd-share-dialog-overlay"
        >
            {!user && <LoadingComponent className="gd-user-group-dialog-loading" />}
            <div className="gd-user-group-dialog">
                {dialogMode === "VIEW" && (
                    <DialogBase
                        className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
                        displayCloseButton={true}
                        isPositive={true}
                        onClose={onClose}
                    >
                        <div className="gd-dialog-header-wrapper">
                            <div className="gd-dialog-header">
                                <Typography tagName="h3" className="gd-dialog-header-title">
                                    {user?.fullName ?? user?.login}
                                </Typography>
                            </div>
                        </div>
                        <div className="gd-dialog-content">
                            <Tabs
                                selectedTabId={selectedTabId.id}
                                onTabSelect={setSelectedTabId}
                                tabs={tabs}
                                className="gd-user-group-dialog-tabs"
                            />
                            {selectedTabId.id === userDialogTabsMessageLabels.workspaces.id && (
                                <WorkspaceList
                                    workspaces={grantedWorkspaces}
                                    mode="VIEW"
                                    onDelete={removeGrantedWorkspace}
                                    onChange={changeGrantedWorkspace}
                                />
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.groups.id && (
                                <div>TODO groups list</div>
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.details.id && (
                                <div>TODO detail</div>
                            )}
                        </div>
                        <div className="gd-dialog-footer">
                            <div className="gd-user-group-dialog-buttons">
                                <div className="gd-user-group-dialog-buttons-left">
                                    {selectedTabId.id === userDialogTabsMessageLabels.workspaces.id && (
                                        <Button
                                            className="gd-button gd-button-secondary"
                                            iconLeft="gd-icon-add blue-icon"
                                            value={intl.formatMessage({ id: "userGroupDialog.buttons.addWorkspace" })}
                                            onClick={() => setDialogMode("WORKSPACE")}
                                        />
                                    )}
                                    {selectedTabId.id === userDialogTabsMessageLabels.groups.id && (
                                        <Button
                                            className="gd-button gd-button-secondary"
                                            iconLeft="gd-icon-add blue-icon"
                                            value={intl.formatMessage({ id: "userGroupDialog.buttons.addToGroup" })}
                                            onClick={() => setDialogMode("GROUPS")}
                                        />
                                    )}
                                    {selectedTabId.id === userDialogTabsMessageLabels.details.id && (
                                        <Button
                                            className="gd-button gd-button-secondary"
                                            iconLeft="gd-icon-pencil blue-icon"
                                            value={intl.formatMessage({ id: "userGroupDialog.buttons.edit" })}
                                            onClick={() => setDialogMode("DETAIL")}
                                        />
                                    )}
                                </div>
                                <div className="gd-user-group-dialog-buttons-right">
                                    <Button
                                        className="gd-button gd-button-link-dimmed gd-user-group-dialog-button-underlined"
                                        value={intl.formatMessage({ id: "userGroupDialog.buttons.deleteUser" })}
                                        onClick={deleteUser}
                                    />
                                    <Button
                                        className="gd-button gd-button-secondary"
                                        value={intl.formatMessage({ id: "userGroupDialog.buttons.close" })}
                                        onClick={onClose}
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogBase>
                )}
                {dialogMode === "WORKSPACE" && (
                    <AddWorkspaceBase
                        api={api}
                        userId={userId}
                        grantedWorkspaces={grantedWorkspaces}
                        onBackClick={() => setDialogMode("VIEW")}
                        onSubmit={onWorkspaceChanged}
                        onCancel={() => setDialogMode("VIEW")}
                    />
                )}
            </div>
        </Overlay>
    );
};


