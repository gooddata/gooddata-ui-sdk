// (C) 2023-2024 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { BackendProvider } from "@gooddata/sdk-ui";
import { UserEditDialog } from "@gooddata/sdk-ui-ext";
import { IUserGroup, idRef, IWorkspacePermissionAssignment } from "@gooddata/sdk-model";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/user_management_dialogs.css";

const USER_WITHOUT_PERMISSIONS = "john.doe";
const USER_WITH_PERMISSIONS = "jane.doe";

const getUserGroupsOfUser = (userId: string): IUserGroup[] =>
    userId === USER_WITHOUT_PERMISSIONS
        ? []
        : [
              {
                  id: "id1",
                  ref: idRef("id1"),
                  name: "First group",
              },
              {
                  id: "id2",
                  ref: idRef("id2"),
                  name: "Second group",
              },
          ];

const getWorkspacePermissionsForUser = (userId: string): IWorkspacePermissionAssignment[] =>
    userId === USER_WITHOUT_PERMISSIONS
        ? []
        : [
              {
                  workspace: {
                      id: "foo",
                      name: "Foo",
                  },
                  permissions: ["MANAGE"],
                  hierarchyPermissions: [],
                  assigneeIdentifier: {
                      id: USER_WITH_PERMISSIONS,
                      type: "user",
                  },
              },
              {
                  workspace: {
                      id: "bar",
                      name: "Bar",
                  },
                  permissions: [],
                  hierarchyPermissions: ["ANALYZE", "EXPORT"],
                  assigneeIdentifier: {
                      id: USER_WITH_PERMISSIONS,
                      type: "user",
                  },
              },
          ];

const withProvider = (UserDialogExample: React.FunctionComponent) => {
    const backend = recordedBackend(ReferenceRecordings.Recordings, {
        getUserGroupsOfUser,
        getWorkspacePermissionsForUser,
    });

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <UserDialogExample />
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const UserEditDialogExample = ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
    withProvider(() => (
        <UserEditDialog
            userId={userId}
            organizationId="org"
            isAdmin={isAdmin}
            onSuccess={noop}
            onClose={noop}
            onEvent={noop}
        />
    ));

storiesOf(`${ExtensionComponents}/UserManagementDialogs/userEdit`)
    .add(
        "has no permissions and no groups",
        () => <UserEditDialogExample userId={USER_WITHOUT_PERMISSIONS} isAdmin={false} />,
        {
            screenshots: {
                permissions: {
                    postInteractionWait: 200,
                },
                addPermission: {
                    clickSelector: ".s-add_permission",
                    postInteractionWait: 1000,
                },
                emptyGroups: {
                    clickSelector: ".s-usermanagement_tab_groups",
                    postInteractionWait: 1000,
                },
                addGroup: {
                    clickSelectors: [".s-usermanagement_tab_groups", 1000, ".s-add_to_group", 1000],
                },
                details: {
                    clickSelector: ".s-usermanagement_tab_details",
                    postInteractionWait: 400,
                },
                editDetails: {
                    clickSelectors: [".s-usermanagement_tab_details", 500, ".s-edit", 500],
                },
                deleteUser: {
                    clickSelector: ".s-delete_user",
                    postInteractionWait: 200,
                },
            },
        },
    )
    .add(
        "has permissions and groups",
        () => <UserEditDialogExample userId={USER_WITH_PERMISSIONS} isAdmin={false} />,
        {
            screenshots: {
                permissions: {
                    postInteractionWait: 1000,
                },
                workspacePermission: {
                    clickSelector: ".s-permission-button-bar",
                    postInteractionWait: 400,
                },
                workspaceHierarchyPermission: {
                    clickSelector: ".s-hierarchical-permission-button-bar",
                    postInteractionWait: 400,
                },
                groups: {
                    clickSelector: ".s-usermanagement_tab_groups",
                    postInteractionWait: 400,
                },
            },
        },
    )
    .add("admin", () => <UserEditDialogExample userId={USER_WITH_PERMISSIONS} isAdmin={true} />, {
        screenshots: {
            dialog: {
                postInteractionWait: 200,
            },
        },
    });
