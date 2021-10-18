// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import { action } from "@storybook/addon-actions";

import { ShareGranteeBase } from "@gooddata/sdk-ui-kit";
import { grantees, owner } from "./GranteeMock";

const BasicExample = (): JSX.Element => {
    return (
        <div id="Share-Grantee-base-basic-example">
            <ShareGranteeBase
                isDirty={false}
                owner={owner}
                grantees={grantees}
                onGranteeDelete={action("onGranteeDelete")}
                onCancel={action("onCancel")}
                onSubmit={action("onSubmit")}
                onAddGranteeButtonClick={action("onAddGrantee")}
            />
        </div>
    );
};

/**
 * @internal
 */
export const ShareGranteeBaseExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>ShareGranteeBase basic example</h4>
                <BasicExample />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/ShareDialog/ShareGranteeBase`, module).add("full-featured", () =>
    withScreenshot(<ShareGranteeBaseExamples />),
);
storiesOf(`${UiKit}/ShareDialog/ShareGranteeBase`, module).add("themed", () =>
    withScreenshot(wrapWithTheme(<ShareGranteeBaseExamples />)),
);
