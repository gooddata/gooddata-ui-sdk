// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { withScreenshot } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import { action } from "@storybook/addon-actions";

import { GranteeItem, IGranteeUser, IGranteeUserInactive, ShareGranteeBase } from "@gooddata/sdk-ui-kit";
import { grantees, inactiveUser, owner } from "./GranteeMock";
import { uriRef } from "@gooddata/sdk-model";

interface BasicExampleProps {
    isDirty: boolean;
    grantees: GranteeItem[];
    owner: IGranteeUser | IGranteeUserInactive;
}

const BasicExample = (props: BasicExampleProps): JSX.Element => {
    return (
        <div id="Share-Grantee-base-basic-example">
            <ShareGranteeBase
                isDirty={props.isDirty}
                isLoading={false}
                owner={props.owner}
                grantees={props.grantees}
                onGranteeDelete={action("onGranteeDelete")}
                onAddGranteeButtonClick={action("onAddGrantee")}
                onCancel={action("onCancel")}
                onSubmit={action("onSubmit")}
            />
        </div>
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
export const ShareGranteeBaseExamples = (): JSX.Element => {
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
