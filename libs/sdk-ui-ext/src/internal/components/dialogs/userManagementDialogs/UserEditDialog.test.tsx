// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, IntlWrapper } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { useLanguageNoticeData } from "./dialogHooks.js";
import { type IGrantedWorkspace } from "./types.js";
import { UserEditDialog } from "./UserEditDialog.js";

const grantedWorkspaces: IGrantedWorkspace[] = [
    { id: "sales", title: "Sales", permissions: ["VIEW"], isHierarchical: false },
];

vi.mock("./Workspace/AddWorkspace.js", () => ({ AddWorkspace: () => null }));
vi.mock("./UserGroups/AddUserGroup.js", () => ({ AddUserGroup: () => null }));
vi.mock("./DataSources/AddDataSource.js", () => ({ AddDataSource: () => null }));

vi.mock("./hooks/usePermissions.js", () => ({
    usePermissions: () => ({
        grantedWorkspaces,
        onWorkspacesChanged: vi.fn(),
        removeGrantedWorkspace: vi.fn(),
        updateGrantedWorkspace: vi.fn(),
        grantedDataSources: [],
        onDataSourcesChanged: vi.fn(),
        removeGrantedDataSource: vi.fn(),
        updateGrantedDataSource: vi.fn(),
        reloadPermissions: vi.fn(),
    }),
}));

vi.mock("./dialogHooks.js", async (importOriginal) => {
    const original = await importOriginal<object>();
    return {
        ...original,
        useUser: () => ({
            user: { login: "john", ref: idRef("john"), fullName: "John Doe" },
            isCurrentlyAdmin: false,
            onUserDetailsChanged: vi.fn(),
            setIsAdmin: vi.fn(),
            error: undefined,
            isLoading: false,
        }),
        useUserLanguages: () => ({
            languages: {},
            setLanguages: vi.fn(),
            reloadLanguages: vi.fn(),
            isLoading: false,
            isError: false,
        }),
        useLanguageStatistics: () => ({ statistics: undefined, isLoading: false }),
        useOrganizationDetails: () => ({ isBootstrapUser: () => false, bootstrapUserGroupId: "admins" }),
        useUserGroups: () => ({
            grantedUserGroups: [],
            onUserGroupsChanged: vi.fn(),
            removeGrantedUserGroup: vi.fn(),
            removeAdminGroup: vi.fn(),
        }),
        useLanguageNoticeData: vi.fn(() => undefined),
    };
});

describe("UserEditDialog", () => {
    it("loads the language notice data only once the Details tab is shown", () => {
        render(
            <BackendProvider backend={dummyBackendEmptyData()}>
                <IntlWrapper>
                    <ToastsCenterContextProvider skipAutomaticMessageRendering>
                        <UserEditDialog
                            userId="john"
                            organizationId="org"
                            isAdmin={false}
                            isLocalizationEnabled
                            onSuccess={vi.fn()}
                            onClose={vi.fn()}
                            onEvent={vi.fn()}
                        />
                    </ToastsCenterContextProvider>
                </IntlWrapper>
            </BackendProvider>,
        );
        const loadNoticeData = vi.mocked(useLanguageNoticeData);

        expect(loadNoticeData).toHaveBeenCalled();
        expect(loadNoticeData.mock.calls.every(([, , isEnabled]) => !isEnabled)).toBe(true);

        fireEvent.click(screen.getByText("Details"));

        expect(loadNoticeData).toHaveBeenLastCalledWith("org", grantedWorkspaces, true);
    });
});
