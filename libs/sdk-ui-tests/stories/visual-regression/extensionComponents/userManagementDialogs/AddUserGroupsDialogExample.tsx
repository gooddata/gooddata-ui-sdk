// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { BackendProvider } from "@gooddata/sdk-ui";
import { AddUserGroupsToUsersDialog } from "@gooddata/sdk-ui-ext";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/user_management_dialogs.css";

const USER_IDS = ["john.doe", "jane.doe"];

const withProvider = (AddUserGroupsToUsersDialogExample: React.FunctionComponent) => {
    const backend = recordedBackend(ReferenceRecordings.Recordings, {});

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <AddUserGroupsToUsersDialogExample />
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const AddUserGroupsToUsersDialogExample = ({ userIds }: { userIds: string[] }) =>
    withProvider(() => (
        <AddUserGroupsToUsersDialog
            userIds={userIds}
            organizationId="org"
            onSuccess={noop}
            onClose={noop}
            onEvent={noop}
        />
    ));

storiesOf(`${ExtensionComponents}/UserManagementDialogs/addUserGroups`).add(
    "dialog",
    () => <AddUserGroupsToUsersDialogExample userIds={USER_IDS} />,
    {
        screenshots: {
            permissions: {
                postInteractionWait: 200,
            },
        },
    },
);
