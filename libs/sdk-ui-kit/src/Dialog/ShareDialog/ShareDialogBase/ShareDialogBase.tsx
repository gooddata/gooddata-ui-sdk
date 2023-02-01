// (C) 2021-2023 GoodData Corporation
import React from "react";

import { Overlay } from "../../../Overlay";
import { IAlignPoint } from "../../../typings/positioning";

import { ShareGranteeBase } from "./ShareGranteeBase";
import { AddGranteeBase } from "./AddGranteeBase";
import { IShareDialogBaseProps } from "./types";
import { useShareDialogBase } from "./useShareDialogBase";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ShareDialogBase: React.FC<IShareDialogBaseProps> = (props) => {
    const { onCancel, sharedObject, currentUserRef, currentUserPermissions } = props;

    const {
        onAddedGranteeDelete,
        onSharedGranteeDelete,
        onAddGranteeBackClick,
        onAddGranteeButtonClick,
        onGranteeAdd,
        onSubmitShareGrantee,
        onSubmitAddGrantee,
        granteesToAdd,
        dialogMode,
        isShareDialogDirty,
        isAddDialogDirty,
        sharedGrantees,
        appliedGranteesWithOwner,
        isGranteesLoading,
        isLockedNow,
        isUnderLenientControlNow,
        onLockChange,
        onUnderLenientControlChange,
        onGranularGranteeAddChange,
        onGranularGranteeShareChange,
    } = useShareDialogBase(props);

    return (
        <Overlay
            alignPoints={alignPoints}
            isModal={true}
            positionType="fixed"
            className="gd-share-dialog-overlay"
        >
            <div className="s-gd-share-dialog">
                {dialogMode === "ShareGrantee" ? (
                    <ShareGranteeBase
                        currentUserPermissions={currentUserPermissions}
                        currentUserRef={currentUserRef}
                        isLoading={isGranteesLoading}
                        isDirty={isShareDialogDirty}
                        isLockedNow={isLockedNow}
                        isUnderLenientControlNow={isUnderLenientControlNow}
                        sharedObject={sharedObject}
                        grantees={sharedGrantees}
                        onCancel={onCancel}
                        onSubmit={onSubmitShareGrantee}
                        onAddGranteeButtonClick={onAddGranteeButtonClick}
                        onGranteeDelete={onSharedGranteeDelete}
                        onLockChange={onLockChange}
                        onUnderLenientControlChange={onUnderLenientControlChange}
                        onGranularGranteeChange={onGranularGranteeShareChange}
                    />
                ) : (
                    <AddGranteeBase
                        currentUserPermissions={currentUserPermissions}
                        isDirty={isAddDialogDirty}
                        currentUserRef={currentUserRef}
                        appliedGrantees={appliedGranteesWithOwner}
                        addedGrantees={granteesToAdd}
                        sharedObject={sharedObject}
                        onAddUserOrGroups={onGranteeAdd}
                        onDelete={onAddedGranteeDelete}
                        onCancel={onCancel}
                        onSubmit={onSubmitAddGrantee}
                        onBackClick={onAddGranteeBackClick}
                        onGranularGranteeChange={onGranularGranteeAddChange}
                    />
                )}
            </div>
        </Overlay>
    );
};
