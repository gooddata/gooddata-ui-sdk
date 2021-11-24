// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";
import { AddGranteeBase } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";
import { current, group, groupAll, user } from "./GranteeMock";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend, RecordedBackendConfig } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const EmptySelectionExample = (): JSX.Element => {
    const config: RecordedBackendConfig = {
        accessControl: {
            accessList: [],
        },
        users: {
            users: [],
        },
    };
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings, config);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <AddGranteeBase
                        isDirty={false}
                        addedGrantees={[]}
                        appliedGrantees={[groupAll, user]}
                        onAddUserOrGroups={action("onAddUserOrGroups")}
                        onDelete={action("onDelete")}
                        onCancel={action("onCancel")}
                        onSubmit={action("onSubmit")}
                        onBackClick={action("onBackClick")}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

const EmptyAvailableItemsExample = (): JSX.Element => {
    const config: RecordedBackendConfig = {
        accessControl: {
            accessList: [],
        },
        users: {
            users: [],
        },
    };
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings, config);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <AddGranteeBase
                        isDirty={false}
                        addedGrantees={[user]}
                        appliedGrantees={[]}
                        onAddUserOrGroups={action("onAddUserOrGroups")}
                        onDelete={action("onDelete")}
                        onCancel={action("onCancel")}
                        onSubmit={action("onSubmit")}
                        onBackClick={action("onBackClick")}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

const SelectedItemsExample = (): JSX.Element => {
    const config: RecordedBackendConfig = {
        accessControl: {
            accessList: [],
        },
        users: {
            users: [],
        },
    };
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings, config);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <AddGranteeBase
                        isDirty={true}
                        addedGrantees={[user, current, group]}
                        appliedGrantees={[groupAll]}
                        onAddUserOrGroups={action("onAddUserOrGroups")}
                        onDelete={action("onDelete")}
                        onCancel={action("onCancel")}
                        onSubmit={action("onSubmit")}
                        onBackClick={action("onBackClick")}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

/**
 * @internal
 */
export const AddGranteeExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>AddGranteeBase example</h4>
                <SelectedItemsExample />
            </div>
            <div className="library-component screenshot-target">
                <h4>AddGranteeBase empty selection example</h4>
                <EmptySelectionExample />
            </div>
            <div className="library-component screenshot-target">
                <h4>AddGranteeBase all groups example</h4>
                <EmptyAvailableItemsExample />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/ShareDialog/AddGranteeBase`, module).add("full-featured", () =>
    withScreenshot(<AddGranteeExamples />),
);
storiesOf(`${UiKit}/ShareDialog/AddGranteeBase`, module).add("themed", () =>
    withScreenshot(wrapWithTheme(<AddGranteeExamples />)),
);
