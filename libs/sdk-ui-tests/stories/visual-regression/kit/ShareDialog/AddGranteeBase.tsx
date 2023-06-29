// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { action } from "@storybook/addon-actions";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { AddGranteeBase, ComponentLabelsProvider, IAffectedSharedObject } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";
import {
    current,
    defaultUser,
    defaultUserPermissions,
    granularGrantees,
    group,
    groupAll,
    user,
} from "./GranteeMock.js";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { idRef } from "@gooddata/sdk-model";
import { LabelsMock } from "./LabelsMock.js";

const sharedObject: IAffectedSharedObject = {
    ref: idRef("object"),
    shareStatus: "shared",
    owner: {
        id: idRef("owner"),
        type: "user",
        name: "owner",
        isOwner: true,
        isCurrentUser: true,
        status: "Active",
    },
    isLocked: false,
    isUnderLenientControl: false,
    isLockingSupported: true,
    isLeniencyControlSupported: true,
    isMetadataObjectLockingSupported: true,
    areGranularPermissionsSupported: false,
};

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
                            currentUser={defaultUser}
                            appliedGrantees={[groupAll, user]}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                            currentUserPermissions={defaultUserPermissions}
                            sharedObject={sharedObject}
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
                            currentUser={defaultUser}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                            currentUserPermissions={defaultUserPermissions}
                            sharedObject={sharedObject}
                        />
                    </ComponentLabelsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </div>
    );
};

const GranularItemsExample = (): JSX.Element => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    return (
        <div id="Share-Grantee-base-basic-example">
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <ComponentLabelsProvider labels={LabelsMock}>
                        <AddGranteeBase
                            isDirty={false}
                            addedGrantees={granularGrantees}
                            appliedGrantees={[]}
                            currentUser={defaultUser}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                            currentUserPermissions={defaultUserPermissions}
                            sharedObject={{
                                ...sharedObject,
                                areGranularPermissionsSupported: true,
                            }}
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
                            currentUser={defaultUser}
                            onAddUserOrGroups={action("onAddUserOrGroups")}
                            onDelete={action("onDelete")}
                            onCancel={action("onCancel")}
                            onSubmit={action("onSubmit")}
                            onBackClick={action("onBackClick")}
                            currentUserPermissions={defaultUserPermissions}
                            sharedObject={sharedObject}
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
                <h4>AddGranteeBase granular permissions example</h4>
                <GranularItemsExample />
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
