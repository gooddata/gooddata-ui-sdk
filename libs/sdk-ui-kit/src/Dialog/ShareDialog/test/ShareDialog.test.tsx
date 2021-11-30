// (C) 2019 GoodData Corporation

import { ShareStatus } from "@gooddata/sdk-backend-spi";
import { ISharedObject, ISharingApplyPayload } from "../types";
import { IUser } from "@gooddata/sdk-model";
import { userAccessGrantee, workspaceUser } from "../ShareDialogBase/test/GranteeMock";
import {
    createComponent,
    isDialogVisible,
    defaultSharedObject,
    isGroupAllVisible,
    isOwnerVisible,
    isCurrentUserInGrantees,
    getGranteeSelector,
    clickDeleteGranteeIcon,
    isGranteeVisible,
    shareDialogSubmit,
    getGroupAllSelector,
    waitForComponentToPaint,
    shareDialogCancel,
    clickAddGrantees,
    clickOnOption,
    getGroupAllOptionSelector,
    getUserOptionSelector,
    clickBack,
    isSelectionEmpty,
    isDialogOnShareGranteesPage,
} from "./testHelpers";

describe("ShareDialog", () => {
    describe("Share with users and groups page", () => {
        it("should render without crash", async () => {
            const wrapper = await createComponent();
            expect(isDialogVisible(wrapper)).toBe(true);
        });

        it.each([
            ["add group all", "public", true],
            ["add not group all", "private", false],
            ["add not group all", "shared", false],
        ])(
            "should %s when status of sharedObject is%s",
            async (_desc: string, status: ShareStatus, visible: boolean) => {
                const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: status };
                const wrapper = await createComponent({ sharedObject });
                expect(isGroupAllVisible(wrapper)).toBe(visible);
            },
        );

        it.each([
            ["inactive owner", "is not specified", undefined],
            ["active owner", "is specified", workspaceUser],
        ])("should render %s when createdBy user %s", async (_desc: string, _desc2: string, user: IUser) => {
            const sharedObject: ISharedObject = { ...defaultSharedObject, createdBy: user };
            const wrapper = await createComponent({ sharedObject });
            const isUserActive = user !== undefined;

            expect(isOwnerVisible(wrapper, isUserActive)).toBe(true);
        });

        it("should mark current user in grantees ", async () => {
            const userRef = userAccessGrantee.user.ref;
            const wrapper = await createComponent({ currentUserRef: userRef }, [], [], [userAccessGrantee]);
            expect(isCurrentUserInGrantees(wrapper)).toBe(true);
        });

        it("should mark by word YOU current logged user in grantees list when current logged user is owner", async () => {
            const sharedObject: ISharedObject = { ...defaultSharedObject, createdBy: workspaceUser };
            const wrapper = await createComponent({ sharedObject, currentUserRef: workspaceUser.ref });
            expect(isCurrentUserInGrantees(wrapper)).toBe(true);
        });

        it("should remove grantee from list and submit callback for empty grantees list and with object set as public", async () => {
            const granteeSelector = getGranteeSelector(userAccessGrantee.user);
            const onApply = jest.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [
                    {
                        granteeRef: userAccessGrantee.user.ref,
                    },
                ],
                isUnderStrictControl: false,
                isLocked: false,
                shareStatus: "private",
            };

            const wrapper = await createComponent({ onApply: onApply }, [], [], [userAccessGrantee]);
            clickDeleteGranteeIcon(wrapper, granteeSelector);

            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(false);

            shareDialogSubmit(wrapper);

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should remove grantee from list and submit callback when group all present and with object set as public", async () => {
            const granteeSelector = getGranteeSelector(userAccessGrantee.user);
            const onApply = jest.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [
                    {
                        granteeRef: userAccessGrantee.user.ref,
                    },
                ],
                isUnderStrictControl: false,
                isLocked: false,
                shareStatus: "public",
            };
            const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: "public" };
            const wrapper = await createComponent(
                { onApply: onApply, sharedObject },
                [],
                [],
                [userAccessGrantee],
            );
            clickDeleteGranteeIcon(wrapper, granteeSelector);

            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(false);

            shareDialogSubmit(wrapper);

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should remove group all from list and submit callback is private", async () => {
            const granteeSelector = getGroupAllSelector();
            const onApply = jest.fn();
            const expectedPayload: ISharingApplyPayload = {
                granteesToAdd: [],
                granteesToDelete: [],
                isUnderStrictControl: false,
                shareStatus: "private",
                isLocked: false,
            };
            const sharedObject: ISharedObject = { ...defaultSharedObject, shareStatus: "public" };
            const wrapper = await createComponent({ onApply: onApply, sharedObject }, [], [], []);
            clickDeleteGranteeIcon(wrapper, granteeSelector);

            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(false);

            shareDialogSubmit(wrapper);

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenLastCalledWith(expectedPayload);
        });

        it("should call cancel callback when cancel is clicked", async () => {
            const onCancel = jest.fn();
            const wrapper = await createComponent({ onCancel: onCancel }, [], [], []);
            await waitForComponentToPaint(wrapper);
            shareDialogCancel(wrapper);
            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe("Add users and groups page", () => {
        it("should add group all into grantees selection", async () => {
            const wrapper = await createComponent({}, [], [], [userAccessGrantee]);
            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);
            clickOnOption(wrapper, getGroupAllOptionSelector());
            expect(isGroupAllVisible(wrapper)).toBe(true);
        });

        it("should add user into grantees selection", async () => {
            const wrapper = await createComponent({}, [workspaceUser], [], []);

            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);
            clickOnOption(wrapper, getUserOptionSelector(workspaceUser));

            expect(isGranteeVisible(wrapper, getGranteeSelector(workspaceUser))).toBe(true);
        });

        it("should add user into grantees selection and then remove it", async () => {
            const wrapper = await createComponent({}, [workspaceUser], [], []);
            const granteeSelector = getGranteeSelector(workspaceUser);

            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);
            clickOnOption(wrapper, getUserOptionSelector(workspaceUser));
            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(true);

            clickDeleteGranteeIcon(wrapper, granteeSelector);
            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(false);
        });

        it("should clear selection when Back button is clicked", async () => {
            const wrapper = await createComponent({}, [workspaceUser], [], []);
            const granteeSelector = getGranteeSelector(workspaceUser);

            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);
            clickOnOption(wrapper, getUserOptionSelector(workspaceUser));
            expect(isGranteeVisible(wrapper, granteeSelector)).toBe(true);

            clickBack(wrapper);
            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);

            expect(isSelectionEmpty(wrapper)).toBe(true);
        });

        it("should go back when cancel is clicked", async () => {
            const wrapper = await createComponent({}, [], [], []);

            clickAddGrantees(wrapper);
            await waitForComponentToPaint(wrapper);
            shareDialogCancel(wrapper);
            expect(isDialogOnShareGranteesPage(wrapper)).toBe(true);
        });
    });
});
