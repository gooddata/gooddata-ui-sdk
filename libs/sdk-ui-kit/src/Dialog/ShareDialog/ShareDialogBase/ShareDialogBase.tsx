// (C) 2021-2025 GoodData Corporation
import React, { useCallback, useEffect, useRef } from "react";

import { Overlay } from "../../../Overlay/index.js";
import { IAlignPoint } from "../../../typings/positioning.js";

import { ShareGranteeBase } from "./ShareGranteeBase.js";
import { AddGranteeBase } from "./AddGranteeBase.js";
import { IShareDialogBaseProps } from "./types.js";
import { useShareDialogBase } from "./useShareDialogBase.js";
import { useShareDialogInteraction } from "./ComponentInteractionContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ShareDialogBase: React.FC<IShareDialogBaseProps> = (props) => {
    const {
        onCancel,
        sharedObject,
        currentUser,
        currentUserPermissions,
        dashboardFilters,
        isCurrentUserWorkspaceManager,
        isShareGrantHidden,
        applyShareGrantOnSelect,
        showDashboardShareLink,
        isGranteeShareLoading,
        onShareLinkCopy,
    } = props;
    const { openInteraction, closeInteraction } = useShareDialogInteraction();

    useEffect(() => {
        openInteraction();
    }, [openInteraction]);

    const handleCancel = useCallback(() => {
        onCancel();
        closeInteraction();
    }, [onCancel, closeInteraction]);

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

    const previouslyFocusedRef = useRef<HTMLElement>(document.activeElement as HTMLHtmlElement);

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
                        dashboardFilters={dashboardFilters}
                        isShareGrantHidden={isShareGrantHidden}
                        applyShareGrantOnSelect={applyShareGrantOnSelect}
                        showDashboardShareLink={showDashboardShareLink}
                        onShareLinkCopy={onShareLinkCopy}
                        isGranteeShareLoading={isGranteeShareLoading}
                        currentUser={currentUser}
                        isLoading={isGranteesLoading}
                        isDirty={isShareDialogDirty}
                        isLockedNow={isLockedNow}
                        isUnderLenientControlNow={isUnderLenientControlNow}
                        sharedObject={sharedObject}
                        grantees={sharedGrantees}
                        onCancel={handleCancel}
                        onSubmit={onSubmitShareGrantee}
                        onAddGranteeButtonClick={onAddGranteeButtonClick}
                        onGranteeDelete={onSharedGranteeDelete}
                        onLockChange={onLockChange}
                        onUnderLenientControlChange={onUnderLenientControlChange}
                        onGranularGranteeChange={onGranularGranteeShareChange}
                        isCurrentUserWorkspaceManager={isCurrentUserWorkspaceManager}
                    />
                ) : (
                    <AddGranteeBase
                        currentUserPermissions={currentUserPermissions}
                        isDirty={isAddDialogDirty}
                        currentUser={currentUser}
                        appliedGrantees={appliedGranteesWithOwner}
                        addedGrantees={granteesToAdd}
                        sharedObject={sharedObject}
                        previouslyFocusedRef={previouslyFocusedRef}
                        onAddUserOrGroups={onGranteeAdd}
                        onDelete={onAddedGranteeDelete}
                        onCancel={handleCancel}
                        onSubmit={onSubmitAddGrantee}
                        onBackClick={onAddGranteeBackClick}
                        onGranularGranteeChange={onGranularGranteeAddChange}
                        isGranteeShareLoading={isGranteeShareLoading}
                    />
                )}
            </div>
        </Overlay>
    );
};
