// (C) 2019-2022 GoodData Corporation

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { act } from "react-dom/test-utils";
import { noop } from "lodash";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IShareDialogLabels, IShareDialogProps, ISharedObject } from "../types";
import { uriRef, IWorkspaceUser, IWorkspaceUserGroup, AccessGranteeDetail } from "@gooddata/sdk-model";
import { ShareDialog } from "../ShareDialog";
import { groupAll } from "../ShareDialogBase/test/GranteeMock";
import { getGranteeItemTestId } from "../ShareDialogBase/utils";
import { mapWorkspaceUserToGrantee } from "../shareDialogMappers";

export const labels: IShareDialogLabels = {
    accessTypeLabel: "lockControl label",
    accessRegimeLabel: "underLenientControl label",
    removeAccessGranteeTooltip: "removeAccessGranteeToolTip",
    removeAccessCreatorTooltip: "removeAccessGranteeToolTip",
};

export const defaultSharedObject: ISharedObject = {
    ref: uriRef("objRef"),
    shareStatus: "private",
    createdBy: undefined,
};

export const defaultProps: IShareDialogProps = {
    backend: recordedBackend(ReferenceRecordings.Recordings),
    workspace: "foo",
    sharedObject: defaultSharedObject,
    currentUserRef: uriRef("userRef"),
    labels,
    isLockingSupported: true,
    locale: "en-US",
    onApply: noop,
    onCancel: noop,
    onError: noop,
};

export const createComponent = async (
    customProps: Partial<IShareDialogProps> = {},
    users: IWorkspaceUser[] = [],
    groups: IWorkspaceUserGroup[] = [],
    grantees: AccessGranteeDetail[] = [],
): Promise<ReactWrapper> => {
    const config: RecordedBackendConfig = {
        userManagement: {
            users: {
                users: users,
            },
            userGroup: {
                userGroups: groups,
            },
            accessControl: {
                accessList: grantees,
            },
        },
    };

    const backend = recordedBackend(ReferenceRecordings.Recordings, config);

    const props: IShareDialogProps = { ...defaultProps, ...customProps, backend };

    const wrapper = mount(<ShareDialog {...props} />);

    await waitForComponentToPaint(wrapper);

    return wrapper;
};

export function isDialogVisible(wrapper: ReactWrapper): boolean {
    return wrapper.find(".s-gd-share-dialog").hostNodes().length === 1;
}

export const waitForComponentToPaint = async (wrapper: ReactWrapper): Promise<void> => {
    // this prevent  Warning: An update to null inside a test was not wrapped in act(...)
    // https://github.com/enzymejs/enzyme/issues/2073
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
        wrapper.update();
    });
};

export function isGroupAllVisible(wrapper: ReactWrapper): boolean {
    const className = getGranteeItemTestId(groupAll);
    return wrapper.find(`.${className}`).hostNodes().length === 1;
}

export function isOwnerVisible(wrapper: ReactWrapper, isActive: boolean): boolean {
    const selector = isActive ? ".s-share-dialog-owner" : ".s-share-dialog-inactive-owner";
    return wrapper.find(selector).hostNodes().length === 1;
}

export function isCurrentUserInGrantees(wrapper: ReactWrapper): boolean {
    return wrapper.find(".s-share-dialog-current-user").hostNodes().length === 1;
}

export function getGranteeSelector(user: IWorkspaceUser): string {
    const grantee = mapWorkspaceUserToGrantee(user, uriRef(""));
    return `.${getGranteeItemTestId(grantee)}`;
}

export function getGroupAllSelector(): string {
    return `.${getGranteeItemTestId(groupAll)}`;
}

export function clickDeleteGranteeIcon(wrapper: ReactWrapper, selector: string): void {
    const item = wrapper.find(selector);
    item.simulate("mouseover"); // delete icon is visible just when mouse is over item
    item.find(".s-gd-grantee-item-delete").hostNodes().simulate("click");
    wrapper.update();
}

export function isGranteeVisible(wrapper: ReactWrapper, selector: string): boolean {
    return wrapper.find(selector).hostNodes().length === 1;
}

export function shareDialogSubmit(wrapper: ReactWrapper): void {
    wrapper.find(".s-dialog-submit-button").hostNodes().simulate("click");
}

export function shareDialogCancel(wrapper: ReactWrapper): void {
    wrapper.find(".s-dialog-cancel-button").hostNodes().simulate("click");
}

export function clickAddGrantees(wrapper: ReactWrapper): void {
    wrapper.find(".s-add-users-or-groups").hostNodes().simulate("click");
    wrapper.update();
}

export function clickBack(wrapper: ReactWrapper): void {
    wrapper.find(".s-share-dialog-navigate-back").hostNodes().simulate("click");
    wrapper.update();
}

export function getGroupAllOptionSelector(): string {
    return `.${getGranteeItemTestId(groupAll, "option")}`;
}

export function getUserOptionSelector(user: IWorkspaceUser): string {
    return `.${getGranteeItemTestId(mapWorkspaceUserToGrantee(user, uriRef("")), "option")}`;
}

export function clickOnOption(wrapper: ReactWrapper, selector: string): void {
    wrapper.find(selector).simulate("click");
}

export function isSelectionEmpty(wrapper: ReactWrapper): boolean {
    return wrapper.find(".s-gd-share-dialog-grantee-list-empty-selection").hostNodes().length === 1;
}

export function isDialogOnShareGranteesPage(wrapper: ReactWrapper): boolean {
    return wrapper.find(".s-gd-share-grantees").hostNodes().length === 1;
}

export function checkLockCheckbox(wrapper: ReactWrapper): void {
    wrapper
        .find(".s-shared-object-lock")
        .find(".input-checkbox")
        .hostNodes()
        .simulate("change", { target: { checked: true } });
    wrapper.update();
}

export function setUnderLenientControlCheckbox(wrapper: ReactWrapper, value: boolean): void {
    wrapper
        .find(".s-shared-object-under-lenient-control")
        .find(".input-checkbox")
        .hostNodes()
        .simulate("change", { target: { checked: value } });
    wrapper.update();
}
