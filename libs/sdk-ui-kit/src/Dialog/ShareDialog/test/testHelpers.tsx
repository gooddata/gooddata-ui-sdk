// (C) 2019-2023 GoodData Corporation

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { noop } from "lodash";
import {
    defaultRecordedBackendCapabilities,
    recordedBackend,
    RecordedBackendConfig,
} from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { CurrentUserPermissions, IShareDialogLabels, IShareDialogProps, ISharedObject } from "../types.js";
import {
    uriRef,
    IWorkspaceUser,
    IWorkspaceUserGroup,
    AccessGranteeDetail,
    IAvailableAccessGrantee,
} from "@gooddata/sdk-model";
import { ShareDialog } from "../ShareDialog.js";
import { defaultUser } from "../ShareDialogBase/test/GranteeMock.js";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

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

const defaultUserPermissions: CurrentUserPermissions = {
    canEditAffectedObject: false,
    canEditLockedAffectedObject: false,
    canShareAffectedObject: true,
    canShareLockedAffectedObject: true,
    canViewAffectedObject: true,
};

export const defaultProps: IShareDialogProps = {
    backend: recordedBackend(ReferenceRecordings.Recordings),
    workspace: "foo",
    sharedObject: defaultSharedObject,
    currentUser: defaultUser,
    labels,
    isLockingSupported: true,
    locale: "en-US",
    onApply: noop,
    onCancel: noop,
    onError: noop,
    isCurrentUserWorkspaceManager: false,
    currentUserPermissions: defaultUserPermissions,
};

export const createComponent = async (
    customProps: Partial<IShareDialogProps> = {},
    users: IWorkspaceUser[] = [],
    groups: IWorkspaceUserGroup[] = [],
    grantees: AccessGranteeDetail[] = [],
    availableGrantees: IAvailableAccessGrantee[] = [],
    capabilities: IBackendCapabilities = defaultRecordedBackendCapabilities,
) => {
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
                availableGrantees,
            },
        },
    };
    const backend = recordedBackend(ReferenceRecordings.Recordings, config, capabilities);
    const props: IShareDialogProps = { ...defaultProps, ...customProps, backend };
    const wrapper = render(<ShareDialog {...props} />);

    await waitForComponentToPaint();

    return wrapper;
};

export const waitForComponentToPaint = async (): Promise<void> => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve));
    });
};

export function getShareDialog() {
    return screen.queryByText("Share with users and groups");
}

export function getGroupAll() {
    return screen.queryAllByText("All users");
}

export function getOwner(isActive: boolean) {
    const selector = isActive ? ".s-share-dialog-owner" : ".s-share-dialog-inactive-owner";
    return document.querySelector(selector);
}

export function getCurrentUser() {
    return screen.queryByText(/(You)/);
}

export function getGranularPermissionsDropdownButton(granteeName: string) {
    const granteeItem = getGranteeItem(granteeName);
    return within(granteeItem).getByLabelText("Share dialog granular permissions button");
}

export function clickGranularPermissionsDropdownButton(granteeName: string) {
    fireEvent.click(getGranularPermissionsDropdownButton(granteeName));
}

export function clickGranularPermissionsDropdownItem(text: string): void {
    fireEvent.click(screen.getByText(text));
}

export function getGrantee(name: string) {
    return screen.queryByText(name);
}

export function getGranteeItem(name: string) {
    return getGrantee(name).parentElement.parentElement; // whole grantee item is two divs above the text
}

export function clickDeleteGranteeIcon(name: string) {
    const granteeItem = getGranteeItem(name);
    fireEvent.mouseOver(granteeItem); // delete icon is visible only when mouse is over item
    const deleteIcon = within(granteeItem).getByLabelText("Share dialog grantee delete");
    fireEvent.click(deleteIcon);
}

export function shareDialogSubmit() {
    fireEvent.click(screen.getByText("Save"));
}

export function shareDialogCancel(): void {
    fireEvent.click(screen.getByText("Cancel"));
}

export function clickAddGrantees(): void {
    fireEvent.click(screen.getByText("Add"));
}

export function clickBack(): void {
    fireEvent.click(document.querySelector(".s-share-dialog-navigate-back"));
}

export function clickOnOption(name: string) {
    fireEvent.click(getGrantee(name));
}

export function getEmptyListMessage() {
    return screen.queryByText("No user or group selected.");
}

export function clickLockCheckbox() {
    fireEvent.click(screen.getByLabelText("shared-dialog-lock"));
}

export function clickUnderLenientControlCheckbox() {
    fireEvent.click(screen.getByLabelText("shared-accessRegimeLabel-control"));
}

export function getAdminInformationMessage() {
    return screen.queryByLabelText("Share dialog admin information message");
}
