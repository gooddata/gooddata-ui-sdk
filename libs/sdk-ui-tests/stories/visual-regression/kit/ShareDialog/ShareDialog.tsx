// (C) 2021 GoodData Corporation
import React, { useCallback, useState } from "react";
import { storiesOf } from "@storybook/react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";
import { BackstopConfig } from "../../../_infra/backstopScenario";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";
import { action } from "@storybook/addon-actions";
import { getGranteeItemTestId, ShareDialogBase } from "@gooddata/sdk-ui-kit";
import { Button } from "@gooddata/sdk-ui-kit";
import { grantees, groupAll, owner } from "./GranteeMock";

const BasicExample = (): JSX.Element => {
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

    return (
        <div id="Share-Grantee-base-basic-example">
            <Button
                value="Open share dialog"
                className="gd-button-positive s-share-dialog-button"
                onClick={onOpen}
            />
            {open && (
                <ShareDialogBase owner={owner} grantees={grantees} onCancel={onCancel} onSubmit={onSubmit} />
            )}
        </div>
    );
};

/**
 * @internal
 */
export const ShareDialogExamples = (): JSX.Element => {
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
        clickSelectors: [".s-share-dialog-button"],
    },
    "add-grantee": {
        clickSelectors: [".s-share-dialog-button", 100, ".s-add-users-or-groups", 100],
    },
    "selected-grantee": {
        clickSelectors: [".s-share-dialog-button", 100, ".s-add-users-or-groups", 100, granteeAllSelector],
    },
};

storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("full-featured", () =>
    withMultipleScreenshots(<ShareDialogExamples />, scenarios),
);
storiesOf(`${UiKit}/ShareDialog/ShareDialog`, module).add("themed", () =>
    withMultipleScreenshots(wrapWithTheme(<ShareDialogExamples />), scenarios),
);
