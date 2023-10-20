// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback, useState } from "react";

import { IUserEditDialogApi, IGrantedGroup } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { sortGrantedGroupsByName } from "../utils.js";

import { userDialogMessageLabels } from "../../../locales.js";
import { useToastMessage } from "../../../Messages/index.js";

import { AddGroupContent } from "./AddGroupContent.js";

/**
 * @internal
 */
export interface IAddGroupProps {
    api: IUserEditDialogApi;
    userId: string;
    grantedGroups: IGrantedGroup[];
    onBackClick: () => void;
    onSubmit: (groups: IGrantedGroup[]) => void;
    onCancel: () => void;
}

/**
 * @internal
 */
export const AddGroup: React.FC<IAddGroupProps> = ({
    api,
    userId,
    grantedGroups,
    onSubmit,
    onCancel,
    onBackClick
}) => {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick} className="s-user-group-dialog-navigate-back" />;
    }, [onBackClick]);

    const [addedGroups, setAddedGroups] = useState<IGrantedGroup[]>([]);

    const onDelete = (group: IGrantedGroup) => {
        setAddedGroups(addedGroups.filter((item) => item.id !== group.id));
    };

    const handleSubmit = () => {
        api.addGroupsToUser(userId, addedGroups.map((group) => group.id))
            .then(() => {
                addSuccess(userDialogMessageLabels.grantedGroupAddedSuccess);
                onSubmit(addedGroups);
                onBackClick();
            })
            .catch((error) => {
                console.error("Addition of group membership failed", error);
                addError(userDialogMessageLabels.grantedGroupAddedError);
            });
    };

    const onSelectGroup = ({ id, title }: IGrantedGroup) => {
        setAddedGroups([...addedGroups, {
            id,
            title,
        }].sort(sortGrantedGroupsByName));
    };

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedGroups.length === 0}
            headline={intl.formatMessage({ id: "userGroupDialog.group.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "userGroupDialog.workspace.addButton" })}
            onCancel={onBackClick}
            onSubmit={handleSubmit}
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <AddGroupContent
                api={api}
                grantedGroups={grantedGroups}
                addedGroups={addedGroups}
                onDelete={onDelete}
                onSelectGroup={onSelectGroup}
            />
        </ConfirmDialogBase>
    );
};
