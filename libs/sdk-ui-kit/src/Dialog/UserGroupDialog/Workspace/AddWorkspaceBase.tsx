// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback, useState } from "react";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

import { IGrantedWorkspace, IUserEditDialogApi } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { sortGrantedWorkspacesByName, asPermissionAssignment } from "../utils.js";

import { AddWorkspaceContent } from "./AddWorkspaceContent.js";
import { userDialogMessageLabels } from "../../../locales.js";
import { useToastMessage } from "../../../Messages/index.js";

/**
 * @internal
 */
export interface IAddWorkspaceBaseProps {
    api: IUserEditDialogApi;
    userId: string;
    grantedWorkspaces: IGrantedWorkspace[];
    onBackClick: () => void;
    onSubmit: (workspaces: IGrantedWorkspace[]) => void;
    onCancel: () => void;
}

/**
 * @internal
 */
export const AddWorkspaceBase: React.FC<IAddWorkspaceBaseProps> = ({
    api,
    userId,
    grantedWorkspaces,
    onSubmit,
    onCancel,
    onBackClick
}) => {
    const intl = useIntl();
    const { addSuccess, addError} = useToastMessage();
    
    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick} className="s-user-group-dialog-navigate-back" />;
    }, [onBackClick]);

    const [addedWorkspaces, setAddedWorkspaces] = useState<IGrantedWorkspace[]>([]);

    const onDelete = (workspace: IGrantedWorkspace) => {
        setAddedWorkspaces(addedWorkspaces.filter((item) => item.id !== workspace.id));
    };

    const onChange = (workspace: IGrantedWorkspace) => {
        const unchangedWorkspaces = addedWorkspaces
            .filter((item) => item.id !== workspace.id);
        setAddedWorkspaces([...unchangedWorkspaces, workspace].sort(sortGrantedWorkspacesByName));
    };

    const handleSubmit = () => {
        api.manageWorkspacePermissionsForUser(userId, addedWorkspaces.map(asPermissionAssignment))
            .then(() => {
                addSuccess(userDialogMessageLabels.grantedWorkspaceAddedSuccess);
                onSubmit(addedWorkspaces);
                onBackClick();
            })
            .catch((error) => {
                console.error("Addition of workspace permission failed", error);
                addError(userDialogMessageLabels.grantedWorkspaceAddedError);
            });
    };

    const onSelectWorkspace = ({ id, title }: IWorkspaceDescriptor) => {
        setAddedWorkspaces([...addedWorkspaces, {
            id,
            title,
            permission: "VIEW" as const,
            isHierarchical: false,
        }].sort(sortGrantedWorkspacesByName));
    };

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedWorkspaces.length === 0}
            headline={intl.formatMessage({ id: "userGroupDialog.workspace.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "userGroupDialog.workspace.addButton" })}
            onCancel={onBackClick}
            onSubmit={handleSubmit}
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <AddWorkspaceContent
                grantedWorkspaces={grantedWorkspaces}
                addedWorkspaces={addedWorkspaces}
                onDelete={onDelete}
                onChange={onChange}
                onSelectWorkspace={onSelectWorkspace}
            />
        </ConfirmDialogBase>
    );
};
