// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { uriRef } from "@gooddata/sdk-model";
import { action } from "@storybook/addon-actions";
import {
    GranteeItem,
    IGranteeUser,
    IGranteeInactiveOwner,
    ShareGranteeBase,
    ComponentLabelsProvider,
} from "@gooddata/sdk-ui-kit";

import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import { defaultUser, defaultUserPermissions, grantees, inactiveUser, owner } from "./GranteeMock.js";
import { LabelsMock } from "./LabelsMock.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

interface BasicExampleProps {
    isDirty: boolean;
    grantees: GranteeItem[];
    owner: IGranteeUser | IGranteeInactiveOwner;
    isLocked?: boolean;
    isUnderLenientControl?: boolean;
    isLockingSupported?: boolean;
    isLeniencyControlSupported?: boolean;
    areGranularPermissionsSupported?: boolean;
    isMetadataObjectLockingSupported?: boolean;
}

const BasicExample: React.FC<BasicExampleProps> = ({
    owner,
    grantees,
    isDirty,
    isLocked = false,
    isUnderLenientControl = false,
    isLockingSupported = true,
    isLeniencyControlSupported = true,
    isMetadataObjectLockingSupported = true,
}) => {
    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <div id="Share-Grantee-base-basic-example">
                <ShareGranteeBase
                    currentUser={defaultUser}
                    isDirty={isDirty}
                    isLoading={false}
                    sharedObject={{
                        ref: uriRef("ref"),
                        shareStatus: "private",
                        owner,
                        isLockingSupported,
                        isLocked,
                        isUnderLenientControl,
                        isLeniencyControlSupported,
                        isMetadataObjectLockingSupported,
                    }}
                    isLockedNow={isLocked}
                    isUnderLenientControlNow={isUnderLenientControl}
                    grantees={grantees}
                    onGranteeDelete={action("onGranteeDelete")}
                    onAddGranteeButtonClick={action("onAddGrantee")}
                    onCancel={action("onCancel")}
                    onSubmit={action("onSubmit")}
                    onUnderLenientControlChange={action("onUnderLenientControlChange")}
                    onLockChange={action("onLockChange")}
                    isCurrentUserWorkspaceManager={false}
                    currentUserPermissions={defaultUserPermissions}
                />
            </div>
        </ComponentLabelsProvider>
    );
};

const getGrantees = (): GranteeItem[] => {
    const res: IGranteeUser[] = [];

    for (let i = 1; i <= 10; i++) {
        res.push({
            id: uriRef(i.toString()),
            type: "user",
            name: `Name surname - ${i}`,
            email: `name.surname-${i}@mail.com`,
            isOwner: false,
            isCurrentUser: i === 0,
            status: "Active",
        });
    }

    return res;
};
/**
 * @internal
 */
export const ShareGranteeBaseExamples: React.FC = () => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>ShareGranteeBase basic example</h4>
                <BasicExample isDirty={false} grantees={[]} owner={owner} />
                <h4>ShareGranteeBase isDirty</h4>
                <BasicExample isDirty={true} grantees={grantees} owner={owner} />
                <h4>ShareGranteeBase inactive owner</h4>
                <BasicExample isDirty={false} grantees={[]} owner={inactiveUser} />
                <h4>ShareGranteeBase scrollable</h4>
                <BasicExample isDirty={false} grantees={getGrantees()} owner={owner} />
                <h4>ShareGranteeBase locked</h4>
                <BasicExample isDirty={false} grantees={grantees} owner={owner} isLocked={true} />
                <h4>ShareGranteeBase available for drill</h4>
                <BasicExample
                    isDirty={false}
                    grantees={grantees}
                    owner={owner}
                    isUnderLenientControl={true}
                />
                <h4>ShareGranteeBase without ability to lock the object</h4>
                <BasicExample isDirty={false} grantees={grantees} owner={owner} isLockingSupported={false} />
                <h4>ShareGranteeBase without ability to change availability for drill</h4>
                <BasicExample
                    isDirty={false}
                    grantees={grantees}
                    owner={owner}
                    isLeniencyControlSupported={false}
                />
            </div>
        </InternalIntlWrapper>
    );
};

/**
 * @internal
 */
export const ShareGranteeBaseInteractionExamples: React.FC = () => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>ShareGranteeBase interaction example</h4>
                <BasicExample isDirty={false} grantees={grantees} owner={owner} />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/ShareDialog/ShareGranteeBase`)
    .add("full-featured", () => <ShareGranteeBaseExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<ShareGranteeBaseExamples />), { screenshot: true });
