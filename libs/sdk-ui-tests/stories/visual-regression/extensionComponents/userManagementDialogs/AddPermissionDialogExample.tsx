// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { BackendProvider } from "@gooddata/sdk-ui";
import { AddWorkspaceToSubjects, WorkspacePermissionSubject } from "@gooddata/sdk-ui-ext";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/user_management_dialogs.css";

const IDS = ["id1", "id2"];

const withProvider = (AddPermissionsDialogExample: React.FunctionComponent) => {
    const backend = recordedBackend(ReferenceRecordings.Recordings, {});

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <AddPermissionsDialogExample />
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const AddPermissionsDialogExample = ({
    ids,
    subjectType,
}: {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
}) =>
    withProvider(() => (
        <AddWorkspaceToSubjects
            ids={ids}
            subjectType={subjectType}
            organizationId="org"
            onSuccess={noop}
            onClose={noop}
            onEvent={noop}
        />
    ));

storiesOf(`${ExtensionComponents}/UserManagementDialogs/addPermissions`)
    .add("add permissions to user", () => <AddPermissionsDialogExample ids={IDS} subjectType="user" />, {
        screenshots: {
            permissions: {
                postInteractionWait: 200,
            },
        },
    })
    .add(
        "add permissions to user group",
        () => <AddPermissionsDialogExample ids={IDS} subjectType="userGroup" />,
        {
            screenshots: {
                permissions: {
                    postInteractionWait: 200,
                },
            },
        },
    );
