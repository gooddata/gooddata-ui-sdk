// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { BackendProvider } from "@gooddata/sdk-ui";
import { DeleteUsersDialog } from "@gooddata/sdk-ui-ext";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/user_management_dialogs.css";

const USER_IDS = ["foo", "bar"];

const withProvider = (DeleteUsersDialogExample: React.FunctionComponent) => {
    const backend = recordedBackend(ReferenceRecordings.Recordings, {});

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <DeleteUsersDialogExample />
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const DeleteUsersDialogExample = ({ userIds }: { userIds: string[] }) =>
    withProvider(() => (
        <DeleteUsersDialog
            userIds={userIds}
            organizationId="org"
            onSuccess={noop}
            onClose={noop}
            onEvent={noop}
        />
    ));

storiesOf(`${ExtensionComponents}/UserManagementDialogs/deleteUsers`).add(
    "dialog",
    () => <DeleteUsersDialogExample userIds={USER_IDS} />,
    {
        screenshots: {
            permissions: {
                postInteractionWait: 200,
            },
        },
    },
);
