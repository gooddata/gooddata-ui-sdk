// (C) 2021 GoodData Corporation
import React, { useCallback, useState } from "react";
import { storiesOf } from "@storybook/react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { getGranteeItemTestId, ShareDialogBase } from "@gooddata/sdk-ui-kit";
import { Button } from "@gooddata/sdk-ui-kit";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { action } from "@storybook/addon-actions";
import { uriRef } from "@gooddata/sdk-model";

import { UiKit } from "../../../_infra/storyGroups";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";
import { BackstopConfig } from "../../../_infra/backstopScenario";

import { groupAll, owner } from "./GranteeMock";
import { LabelsMock } from "./LabelsMock";

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
        (...args) => {
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
                <div id="Share-Grantee-base-basic-example">
                    <Button
                        value="Open share dialog"
                        className="gd-button-positive s-share-dialog-button"
                        onClick={onOpen}
                    />
                    {open && (
                        <ShareDialogBase
                            sharedObject={{
                                ref: uriRef("ref"),
                                shareStatus: "private",
                                owner,
                                isLocked: false,
                                isUnderLenientControl: false,
                                isLockingSupported: true,
                                isLeniencyControlSupported: true,
                            }}
                            onCancel={onCancel}
                            onSubmit={onSubmit}
                            onError={onCancel}
                            labels={LabelsMock}
                        />
                    )}
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
};

/**
 * @internal
 */
export const ShareDialogExamples: React.FC = () => {
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
        clickSelectors: [".s-share-dialog-button", 100],
    },
    "toggle-lock": {
        clickSelectors: [".s-share-dialog-button", 100, ".s-shared-object-lock", 100],
    },
};

const drillAvailabilityScenarios: BackstopConfig = {
    open: {
        clickSelectors: [".s-share-dialog-button", 100],
    },
    "toggle-availability-for-drill": {
        clickSelectors: [".s-share-dialog-button", 100, ".s-shared-object-under-lenient-control", 100],
    },
};

storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("full-featured", () =>
    withMultipleScreenshots(<ShareDialogExamples />, scenarios),
);
storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("themed", () =>
    withMultipleScreenshots(wrapWithTheme(<ShareDialogExamples />), scenarios),
);
storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("lock-interaction", () =>
    withMultipleScreenshots(<ShareDialogExamples />, lockScenarios),
);
storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("drill-availability-interaction", () =>
    withMultipleScreenshots(<ShareDialogExamples />, drillAvailabilityScenarios),
);
