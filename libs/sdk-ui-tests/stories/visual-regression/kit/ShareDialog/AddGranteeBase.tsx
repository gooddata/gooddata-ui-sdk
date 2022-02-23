// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { action } from "@storybook/addon-actions";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { AddGranteeBase, ComponentLabelsProvider } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";
import { current, group, groupAll, user } from "./GranteeMock";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { uriRef } from "@gooddata/sdk-model";
import { LabelsMock } from "./LabelsMock";

const EmptySelectionExample = (): JSX.Element => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <ComponentLabelsProvider labels={LabelsMock}>
                        <AddGranteeBase
                            isDirty={false}
                            addedGrantees={[]}
                            currentUserRef={uriRef("")}
                            appliedGrantees={[groupAll, user]}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                        />
                    </ComponentLabelsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

const EmptyAvailableItemsExample = (): JSX.Element => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <ComponentLabelsProvider labels={LabelsMock}>
                        <AddGranteeBase
                            isDirty={false}
                            addedGrantees={[user]}
                            appliedGrantees={[]}
                            currentUserRef={uriRef("")}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                        />
                    </ComponentLabelsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

const SelectedItemsExample = (): JSX.Element => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <ComponentLabelsProvider labels={LabelsMock}>
                        <AddGranteeBase
                            isDirty={true}
                            addedGrantees={[user, current, group]}
                            appliedGrantees={[groupAll]}
                            currentUserRef={uriRef("")}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                        />
                    </ComponentLabelsProvider>
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

storiesOf(`${UiKit}/ShareDialog/AddGranteeBase`)
    .add("full-featured", () => <AddGranteeExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AddGranteeExamples />), { screenshot: true });
