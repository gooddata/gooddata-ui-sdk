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

const EmptySelectionExample = (): JSX.Element => {
    return (
        <div id="Share-Grantee-base-basic-example">
            <AddGranteeBase
                isDirty={false}
                addedGrantees={[]}
                availableGrantees={[groupAll, user]}
                onAddUserOrGroups={action("onAddUserOrGroups")}
                onDelete={action("onDelete")}
                onCancel={action("onCancel")}
                onSubmit={action("onSubmit")}
                onBackClick={action("onBackClick")}
            />
        </div>
    );
};

const EmptyAvailableItemsExample = (): JSX.Element => {
    return (
        <div id="Share-Grantee-base-basic-example">
            <AddGranteeBase
                isDirty={false}
                addedGrantees={[user]}
                availableGrantees={[]}
                onAddUserOrGroups={action("onAddUserOrGroups")}
                onDelete={action("onDelete")}
                onCancel={action("onCancel")}
                onSubmit={action("onSubmit")}
                onBackClick={action("onBackClick")}
            />
        </div>
    );
};

const SelectedItemsExample = (): JSX.Element => {
    return (
        <div id="Share-Grantee-base-basic-example">
            <AddGranteeBase
                isDirty={false}
                addedGrantees={[user, current, group]}
                availableGrantees={[groupAll]}
                onAddUserOrGroups={action("onAddUserOrGroups")}
                onDelete={action("onDelete")}
                onCancel={action("onCancel")}
                onSubmit={action("onSubmit")}
                onBackClick={action("onBackClick")}
            />
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
                <h4>AddGranteeBase empty available items example</h4>
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
