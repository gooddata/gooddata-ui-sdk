// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { BackendProvider } from "@gooddata/sdk-ui";
import { UserGroupEditDialog } from "@gooddata/sdk-ui-ext";
import { idRef, IWorkspacePermissionAssignment, IUser } from "@gooddata/sdk-model";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/user_management_dialogs.css";

const USER_GROUP_WITHOUT_PERMISSIONS = "admin";
const USER_GROUP_WITH_PERMISSIONS = "sales";

const getUsersOfUserGroup = (userGroupId: string): IUser[] =>
    userGroupId === USER_GROUP_WITHOUT_PERMISSIONS
        ? []
        : [
              {
                  ref: idRef("john.doe"),
                  login: "john.doe",
                  firstName: "John",
                  lastName: "Doe",
                  fullName: "John Doe",
                  email: "john.doe@example.com",
              },
              {
                  ref: idRef("jane.doe"),
                  login: "jane.doe",
                  firstName: "Jane",
                  lastName: "Doe",
                  fullName: "Jane Doe",
                  email: "jane.doe@example.com",
              },
          ];

const getWorkspacePermissionsForUserGroup = (userGroupId: string): IWorkspacePermissionAssignment[] =>
    userGroupId === USER_GROUP_WITHOUT_PERMISSIONS
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
                      id: USER_GROUP_WITH_PERMISSIONS,
                      type: "userGroup",
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
                      id: USER_GROUP_WITH_PERMISSIONS,
                      type: "userGroup",
                  },
              },
          ];

const withProvider = (UserGroupDialogExample: React.FunctionComponent) => {
    const backend = recordedBackend(ReferenceRecordings.Recordings, {
        getUsersOfUserGroup,
        getWorkspacePermissionsForUserGroup,
    });

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <UserGroupDialogExample />
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const UserGroupEditDialogExample = ({ userGroupId, isAdmin }: { userGroupId: string; isAdmin: boolean }) =>
    withProvider(() => (
        <UserGroupEditDialog
            userGroupId={userGroupId}
            organizationId="org"
            isAdmin={isAdmin}
            onSuccess={noop}
            onClose={noop}
            onEvent={noop}
        />
    ));

storiesOf(`${ExtensionComponents}/UserManagementDialogs/userGroupEdit`)
    .add(
        "has no permissions and no users",
        () => <UserGroupEditDialogExample userGroupId={USER_GROUP_WITHOUT_PERMISSIONS} isAdmin={false} />,
        {
            screenshots: {
                emptyUsers: {
                    postInteractionWait: 200,
                },
                addUsers: {
                    clickSelector: ".s-add_members",
                    postInteractionWait: 400,
                },
                emptyPermissions: {
                    clickSelector: ".s-usermanagement_tab_workspaces",
                    postInteractionWait: 400,
                },
                addPermission: {
                    clickSelectors: [".s-usermanagement_tab_workspaces", 200, ".s-add_permission", 200],
                },
                details: {
                    clickSelector: ".s-usermanagement_tab_details",
                    postInteractionWait: 400,
                },
                editDetails: {
                    clickSelectors: [".s-usermanagement_tab_details", 200, ".s-edit", 200],
                },
                deleteUserGroup: {
                    clickSelector: ".s-delete_group",
                    postInteractionWait: 200,
                },
            },
        },
    )
    .add(
        "has permissions and users",
        () => <UserGroupEditDialogExample userGroupId={USER_GROUP_WITH_PERMISSIONS} isAdmin={false} />,
        {
            screenshots: {
                users: {
                    postInteractionWait: 200,
                },
                permissions: {
                    clickSelector: ".s-usermanagement_tab_workspaces",
                    postInteractionWait: 400,
                },
                workspacePermission: {
                    clickSelectors: [
                        ".s-usermanagement_tab_workspaces",
                        200,
                        ".s-permission-button-bar",
                        200,
                    ],
                    postInteractionWait: 200,
                },
                workspaceHierarchyPermission: {
                    clickSelectors: [
                        ".s-usermanagement_tab_workspaces",
                        200,
                        ".s-hierarchical-permission-button-bar",
                        200,
                    ],
                    postInteractionWait: 200,
                },
            },
        },
    )
    .add(
        "admin",
        () => <UserGroupEditDialogExample userGroupId={USER_GROUP_WITH_PERMISSIONS} isAdmin={true} />,
        {
            screenshots: {
                dialog: {
                    postInteractionWait: 200,
                },
            },
        },
    );
