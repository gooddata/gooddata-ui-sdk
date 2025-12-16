// (C) 2021-2025 GoodData Corporation

import { action } from "storybook/actions";

import { uriRef } from "@gooddata/sdk-model";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import {
    ComponentLabelsProvider,
    type GranteeItem,
    type IGranteeInactiveOwner,
    type IGranteeUser,
    ShareGranteeBase,
} from "@gooddata/sdk-ui-kit";

import { defaultUserPermissions, grantees, inactiveUser, owner } from "./GranteeMock.js";
import { LabelsMock } from "./LabelsMock.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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

function BasicExample({
    owner,
    grantees,
    isDirty,
    isLocked = false,
    isUnderLenientControl = false,
    isLockingSupported = true,
    isLeniencyControlSupported = true,
    isMetadataObjectLockingSupported = true,
}: BasicExampleProps) {
    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <div id="Share-Grantee-base-basic-example">
                <ShareGranteeBase
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
}

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

function ShareGranteeBaseExamples() {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>ShareGranteeBase basic example</h4>
                <BasicExample isDirty={false} grantees={[]} owner={owner} />
                <h4>ShareGranteeBase isDirty</h4>
                <BasicExample isDirty grantees={grantees} owner={owner} />
                <h4>ShareGranteeBase inactive owner</h4>
                <BasicExample isDirty={false} grantees={[]} owner={inactiveUser} />
                <h4>ShareGranteeBase scrollable</h4>
                <BasicExample isDirty={false} grantees={getGrantees()} owner={owner} />
                <h4>ShareGranteeBase locked</h4>
                <BasicExample isDirty={false} grantees={grantees} owner={owner} isLocked />
                <h4>ShareGranteeBase available for drill</h4>
                <BasicExample isDirty={false} grantees={grantees} owner={owner} isUnderLenientControl />
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/ShareDialog/ShareGranteeBase",
};

export function FullFeatured() {
    return <ShareGranteeBaseExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<ShareGranteeBaseExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
