// (C) 2021-2025 GoodData Corporation
import React, { useCallback, useState } from "react";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { Button, ComponentLabelsProvider, getGranteeItemTestId, ShareDialogBase } from "@gooddata/sdk-ui-kit";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { action } from "storybook/actions";
import { uriRef } from "@gooddata/sdk-model";

import { wrapWithTheme } from "../../themeWrapper.js";
import { BackstopConfig } from "../../../_infra/backstopScenario.js";

import { defaultUser, defaultUserPermissions, groupAll, owner } from "./GranteeMock.js";
import { LabelsMock } from "./LabelsMock.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";

const BasicExample: React.FC = () => {
    const [open, setOpen] = useState(false);

    const onCancel = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onOpen = useCallback(() => {
        setOpen((open) => !open);
    }, [setOpen]);

    const onSubmit = useCallback(
        (...args: any) => {
            setOpen((open) => !open);
            action("onSubmit")(args);
        },
        [setOpen],
    );

    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <ComponentLabelsProvider labels={LabelsMock}>
                    <div id="Share-Grantee-base-basic-example">
                        <Button
                            value="Open share dialog"
                            className="gd-button-positive s-share-dialog-button"
                            onClick={onOpen}
                        />
                        {open ? (
                            <ShareDialogBase
                                currentUser={defaultUser}
                                sharedObject={{
                                    ref: uriRef("ref"),
                                    shareStatus: "private",
                                    owner,
                                    isLocked: false,
                                    isUnderLenientControl: false,
                                    isLockingSupported: true,
                                    isLeniencyControlSupported: true,
                                    isMetadataObjectLockingSupported: true,
                                }}
                                isCurrentUserWorkspaceManager={false}
                                onCancel={onCancel}
                                onSubmit={onSubmit}
                                onError={onCancel}
                                currentUserPermissions={defaultUserPermissions}
                            />
                        ) : null}
                    </div>
                </ComponentLabelsProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
};

const ShareDialogExamples: React.FC = () => {
    return (
        <InternalIntlWrapper>
            screen 800x600 px
            <div className="library-component screenshot-target" style={{ width: 800, height: 600 }}>
                <h4>ShareDialog basic example</h4>
                <BasicExample />
            </div>
        </InternalIntlWrapper>
    );
};

const granteeAllSelector = `.${getGranteeItemTestId(groupAll, "option")}`;

const scenarios: BackstopConfig = {
    open: {
        clickSelectors: [".s-share-dialog-button", 100],
    },
    "add-grantee": {
        clickSelectors: [".s-share-dialog-button", 100, ".s-add-users-or-groups", 100],
    },
    "selected-grantee": {
        clickSelectors: [
            ".s-share-dialog-button",
            100,
            ".s-add-users-or-groups",
            100,
            granteeAllSelector,
            300,
        ],
    },
};

const lockScenarios: BackstopConfig = {
    open: {
        clickSelectors: [".s-share-dialog-button", 300],
    },
    "toggle-lock": {
        clickSelectors: [".s-share-dialog-button", 300, ".s-shared-object-lock", 300],
    },
};

const drillAvailabilityScenarios: BackstopConfig = {
    open: {
        clickSelectors: [".s-share-dialog-button", 300],
    },
    "toggle-availability-for-drill": {
        clickSelectors: [".s-share-dialog-button", 300, ".s-shared-object-under-lenient-control", 300],
    },
};

export default {
    title: "12 UI Kit/ShareDialog/ShareDialog",
};

export const FullFeatured = () => <ShareDialogExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios };

export const Themed = () => wrapWithTheme(<ShareDialogExamples />);
Themed.parameters = { kind: "themed", screenshots: scenarios };

export const LockInteraction = () => <ShareDialogExamples />;
LockInteraction.parameters = { kind: "lock-interaction", screenshots: lockScenarios };

export const DrillAvailabilityInteraction = () => <ShareDialogExamples />;
DrillAvailabilityInteraction.parameters = {
    kind: "drill-availability-interaction",
    screenshots: drillAvailabilityScenarios,
};
