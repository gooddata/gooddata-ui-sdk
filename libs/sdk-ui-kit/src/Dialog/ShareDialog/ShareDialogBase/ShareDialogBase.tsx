// (C) 2021 GoodData Corporation
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
    const { sharedObject, onCancel, labels } = props;

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
                        labels={labels}
                        onLockChange={onLockChange}
                        onUnderLenientControlChange={onUnderLenientControlChange}
                    />
                ) : (
                    <AddGranteeBase
                        isDirty={isAddDialogDirty}
                        appliedGrantees={appliedGranteesWithOwner}
                        addedGrantees={granteesToAdd}
                        onAddUserOrGroups={onGranteeAdd}
                        onDelete={onAddedGranteeDelete}
                        onCancel={onCancel}
                        onSubmit={onSubmitAddGrantee}
                        onBackClick={onAddGranteeBackClick}
                    />
                )}
            </div>
        </Overlay>
    );
};
