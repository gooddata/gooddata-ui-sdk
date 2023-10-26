// (C) 2019-2023 GoodData Corporation

import { ISharedObject, ISharingApplyPayload } from "../types.js";
import { IUser, ShareStatus } from "@gooddata/sdk-model";
import {
    availableUserAccessGrantee,
    granularUserAccess,
    granularUserAccessNoInheritPermission,
    userAccessGrantee,
    workspaceUser,
} from "../ShareDialogBase/test/GranteeMock.js";
import {
    createComponent,
    getShareDialog,
    defaultSharedObject,
    getGroupAll,
    getOwner,
    getCurrentUser,
    clickDeleteGranteeIcon,
    getGrantee,
    shareDialogSubmit,
    getGranularPermissionsDropdownButton,
    shareDialogCancel,
    clickAddGrantees,
    clickUnderLenientControlCheckbox,
    clickLockCheckbox,
    getAdminInformationMessage,
    clickOnOption,
    waitForComponentToPaint,
    getEmptyListMessage,
    clickBack,
    clickGranularPermissionsDropdownButton,
    clickGranularPermissionsDropdownItem,
} from "./testHelpers.js";
import { describe, it, expect, vi } from "vitest";

describe("ShareDialog", () => {
    describe("Share with users and groups page", () => {
        it("should render without crash", async () => {
            await createComponent();

            expect(getShareDialog()).toBeInTheDocument();
        });

        it.each([
            ["add group all", "public", 1],
            ["add not group all", "private", 0],
            ["add not group all", "shared", 0],
        ])(
            "should %s when status of sharedObject is %s",
            async (_desc: string, status: ShareStatus, visible: number) => {
                const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: status };
                await createComponent({ sharedObject });

                expect(getGroupAll()).toHaveLength(visible);
            },
        );

        it.each([
            ["inactive owner", "is not specified", undefined],
            ["active owner", "is specified", workspaceUser],
        ])("should render %s when createdBy user %s", async (_desc: string, _desc2: string, user: IUser) => {
            const sharedObject: ISharedObject = { ...defaultSharedObject, createdBy: user };
            const isUserActive = user !== undefined;
            await createComponent({ sharedObject });

            expect(getOwner(isUserActive)).toBeInTheDocument();
        });

        it("should mark current user in grantees ", async () => {
            await createComponent({ currentUser: userAccessGrantee.user }, [], [], [userAccessGrantee]);

            expect(getCurrentUser()).toBeInTheDocument();
        });

        it("should mark by word YOU current logged user in grantees list when current logged user is owner", async () => {
            const sharedObject: ISharedObject = { ...defaultSharedObject, createdBy: workspaceUser };
            await createComponent({ sharedObject, currentUser: workspaceUser });

            expect(getCurrentUser()).toBeInTheDocument();
        });

        it("should remove grantee from list and submit callback for empty grantees list and with object set as public", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [
                    {
                        granteeRef: userAccessGrantee.user.ref,
                        type: "granularUser",
                        permissions: [],
                        inheritedPermissions: [],
                    },
                ],
                isUnderStrictControl: false,
                isLocked: false,
                shareStatus: "private",
            };
            await createComponent({ onApply: onApply }, [], [], [userAccessGrantee]);

            clickDeleteGranteeIcon(availableUserAccessGrantee.name);
            expect(getGrantee(availableUserAccessGrantee.name)).not.toBeInTheDocument();

            shareDialogSubmit();
            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should remove grantee from list and submit callback when group all present and with object set as public", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [
                    {
                        granteeRef: userAccessGrantee.user.ref,
                        type: "granularUser",
                        permissions: [],
                        inheritedPermissions: [],
                    },
                ],
                isUnderStrictControl: false,
                isLocked: false,
                shareStatus: "public",
            };
            const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: "public" };
            await createComponent({ onApply: onApply, sharedObject }, [], [], [userAccessGrantee]);

            clickDeleteGranteeIcon(availableUserAccessGrantee.name);
            expect(getGrantee(availableUserAccessGrantee.name)).not.toBeInTheDocument();

            shareDialogSubmit();
            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should remove group all from list and submit callback is private", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [],
                isUnderStrictControl: false,
                shareStatus: "private",
                isLocked: false,
            };
            const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: "public" };
            await createComponent({ onApply: onApply, sharedObject }, [], [], []);

            clickDeleteGranteeIcon("All users");
            expect(getGrantee("All users")).not.toBeInTheDocument();

            shareDialogSubmit();
            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should uncheck under lenient control checkbox and submit callback where isUnderStrictControl is true", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [],
                isUnderStrictControl: true,
                shareStatus: "private",
                isLocked: false,
            };
            await createComponent({ onApply: onApply }, [], [], []);

            clickUnderLenientControlCheckbox();
            shareDialogSubmit();

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should check under lenient control checkbox and submit callback where isUnderStrictControl is false", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [],
                isUnderStrictControl: false,
                shareStatus: "private",
                isLocked: false,
            };

            const sharedObject: ISharedObject = { ...defaultSharedObject, isUnderStrictControl: true };
            await createComponent({ onApply: onApply, sharedObject }, [], [], []);

            clickUnderLenientControlCheckbox();
            shareDialogSubmit();

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should check shared object lock checkbox and submit callback where isLocked is true", async () => {
            const onApply = vi.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [],
                isUnderStrictControl: false,
                shareStatus: "private",
                isLocked: true,
            };
            await createComponent({ onApply: onApply }, [], [], []);

            clickLockCheckbox();
            shareDialogSubmit();

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should call cancel callback when cancel is clicked", async () => {
            const onCancel = vi.fn();
            await createComponent({ onCancel: onCancel }, [], [], []);

            shareDialogCancel();

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it("should render granular permissions dropdown button when granular permissions are supported and user access is granular", async () => {
            await createComponent({}, [], [], [granularUserAccess], [], {
                supportsGranularAccessControl: true,
            });

            expect(getGranularPermissionsDropdownButton(availableUserAccessGrantee.name)).toBeInTheDocument();
        });
    });

    describe("Add users and groups page", () => {
        it("should add group all into grantees selection", async () => {
            await createComponent({}, [], [], [userAccessGrantee]);

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption("All users");

            expect(getGrantee("All users")).toBeInTheDocument();
        });

        it("should add user into grantees selection", async () => {
            await createComponent({}, [], [], [], [availableUserAccessGrantee]);

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption(availableUserAccessGrantee.name);

            expect(getGrantee(availableUserAccessGrantee.name)).toBeInTheDocument();
        });

        it("should add user into grantees selection and then remove it", async () => {
            await createComponent({}, [], [], [], [availableUserAccessGrantee]);

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption(availableUserAccessGrantee.name);
            expect(getGrantee(availableUserAccessGrantee.name)).toBeInTheDocument();

            clickDeleteGranteeIcon(availableUserAccessGrantee.name);
            expect(getGrantee(availableUserAccessGrantee.name)).not.toBeInTheDocument();
        });

        it("should clear selection when Back button is clicked", async () => {
            await createComponent({}, [], [], [], [availableUserAccessGrantee]);

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption(availableUserAccessGrantee.name);
            expect(getGrantee(availableUserAccessGrantee.name)).toBeInTheDocument();

            clickBack();
            clickAddGrantees();
            await waitForComponentToPaint();

            expect(getEmptyListMessage()).toBeInTheDocument();
        });

        it("should go back when cancel is clicked", async () => {
            await createComponent({}, [], [], []);

            clickAddGrantees();
            await waitForComponentToPaint();
            shareDialogCancel();

            expect(getShareDialog()).toBeInTheDocument();
        });

        it("should render granular permissions dropdown button when granular permissions are supported and user access is granular", async () => {
            await createComponent({}, [], [], [], [availableUserAccessGrantee], {
                supportsGranularAccessControl: true,
            });

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption(availableUserAccessGrantee.name);

            expect(getGrantee(availableUserAccessGrantee.name)).toBeInTheDocument();
            expect(getGranularPermissionsDropdownButton(availableUserAccessGrantee.name)).toBeInTheDocument();
        });

        it("should render admin information message when user is admin", async () => {
            await createComponent({ isCurrentUserWorkspaceManager: true }, [], [], [], [], {
                canWorkspaceManagerSeeEverySharedObject: true,
            });

            expect(getAdminInformationMessage()).toBeInTheDocument();
        });

        it("should not render admin information message when not supported", async () => {
            await createComponent({ isCurrentUserWorkspaceManager: true }, [], [], [], [], {
                canWorkspaceManagerSeeEverySharedObject: false,
            });

            expect(getAdminInformationMessage()).not.toBeInTheDocument();
        });

        it("should not render admin information message when user is not an admin", async () => {
            await createComponent({ isCurrentUserWorkspaceManager: false }, [], [], [], [], {
                canWorkspaceManagerSeeEverySharedObject: true,
            });

            expect(getAdminInformationMessage()).not.toBeInTheDocument();
        });
    });

    describe("interactions", () => {
        it("should call interaction with SHARE_DIALOG_OPENED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction });

            expect(onInteraction).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "SHARE_DIALOG_OPENED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_CLOSED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction });

            shareDialogCancel();

            expect(onInteraction).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: "SHARE_DIALOG_CLOSED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_SAVED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [userAccessGrantee]);

            clickDeleteGranteeIcon(availableUserAccessGrantee.name);
            shareDialogSubmit();

            expect(onInteraction).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: "SHARE_DIALOG_SAVED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_AVAILABLE_GRANTEE_LIST_OPENED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], []);

            clickAddGrantees();
            await waitForComponentToPaint();

            expect(onInteraction).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: "SHARE_DIALOG_AVAILABLE_GRANTEE_LIST_OPENED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                    numberOfAvailableGrantees: 1,
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_GRANTEE_ADDED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [], [availableUserAccessGrantee], {
                supportsGranularAccessControl: true,
            });

            clickAddGrantees();
            await waitForComponentToPaint();
            clickOnOption(availableUserAccessGrantee.name);

            expect(onInteraction).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    type: "SHARE_DIALOG_GRANTEE_ADDED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                    granteeType: "user",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED type when the user has no inherit permission", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [granularUserAccessNoInheritPermission], [], {
                supportsGranularAccessControl: true,
            });

            clickGranularPermissionsDropdownButton(availableUserAccessGrantee.name);

            expect(onInteraction).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    type: "SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                    granteeType: "user",
                    isExistingGrantee: true,
                    isCurrentUserSelfUpdating: false,
                    granteeEffectivePermission: "VIEW",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED type", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [granularUserAccess], [], {
                supportsGranularAccessControl: true,
            });

            const dropdownButton = document.querySelector(".s-granular-permission-button.disabled");

            expect(dropdownButton).toBeDefined();
        });

        it("should call interaction with SHARE_DIALOG_PERMISSIONS_CHANGED type", async () => {
            const onInteraction = vi.fn();
            await createComponent(
                {
                    onInteraction,
                    currentUserPermissions: {
                        canEditAffectedObject: true,
                        canEditLockedAffectedObject: true,
                        canShareAffectedObject: true,
                        canShareLockedAffectedObject: true,
                        canViewAffectedObject: true,
                    },
                },
                [],
                [],
                [granularUserAccess],
                [],
                {
                    supportsGranularAccessControl: true,
                },
            );

            clickGranularPermissionsDropdownButton(availableUserAccessGrantee.name);
            clickGranularPermissionsDropdownItem("Can edit & share");

            expect(onInteraction).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    type: "SHARE_DIALOG_PERMISSIONS_CHANGED",
                    currentUserPermission: "EDIT",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                    granteeType: "user",
                    isExistingGrantee: true,
                    isCurrentUserSelfUpdating: false,
                    granteeEffectivePermission: "SHARE",
                    granteeUpdatedPermission: "EDIT",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_GRANTEE_REMOVED type and user grantee has no inherit permission", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [granularUserAccessNoInheritPermission], [], {
                supportsGranularAccessControl: true,
            });

            clickGranularPermissionsDropdownButton(availableUserAccessGrantee.name);
            clickGranularPermissionsDropdownItem("Remove");

            expect(onInteraction).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    type: "SHARE_DIALOG_GRANTEE_REMOVED",
                    currentUserPermission: "SHARE",
                    isCurrentUserWorkspaceManager: false,
                    isSharedObjectLocked: false,
                    sharedObjectStatus: "private",
                    granteeType: "user",
                    isExistingGrantee: true,
                    isCurrentUserSelfUpdating: false,
                    granteeEffectivePermission: "VIEW",
                }),
            );
        });

        it("should call interaction with SHARE_DIALOG_GRANTEE_REMOVED type and user grantee", async () => {
            const onInteraction = vi.fn();
            await createComponent({ onInteraction }, [], [], [granularUserAccess], [], {
                supportsGranularAccessControl: true,
            });

            const dropdownButton = document.querySelector(".s-granular-permission-button.disabled");

            expect(dropdownButton).toBeDefined();
        });
    });
});
