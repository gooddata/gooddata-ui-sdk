// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { UiKit } from "../../../_infra/storyGroups";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { wrapWithTheme } from "../../themeWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";

import { action } from "@storybook/addon-actions";
import { ComponentLabelsProvider, getGranteeItemTestId, GranteeItemComponent } from "@gooddata/sdk-ui-kit";
import { BackstopConfig } from "../../../_infra/backstopScenario";
import {
    current,
    currentAndOwen,
    group,
    groupNoCount,
    inactiveUser,
    owner,
    user,
    userInactive,
} from "./GranteeMock";
import { LabelsMock } from "./LabelsMock";

const UserItemBasicExample = (): JSX.Element => {
    const border = { border: "1px solid black", width: 300 };

    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <span> Grantee user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent mode={"ShareGrantee"} grantee={user} onDelete={action("onDelete")} />
            </div>
            <span> Grantee long name and email</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={{
                        ...user,
                        name: "Very very very very very very very long name of user",
                        email: "Very_very_very_very_very_very_very@long_email.com",
                    }}
                    onDelete={action("onDelete")}
                />
            </div>
            <span> Grantee current user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent mode={"ShareGrantee"} grantee={current} onDelete={action("onDelete")} />
            </div>
            <span> Grantee inactive user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={userInactive}
                    onDelete={action("onDelete")}
                />
            </div>
            <span> Grantee inactive user long name</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={{
                        ...userInactive,
                        name: "Very very very very very very very long name of user",
                    }}
                    onDelete={action("onDelete")}
                />
            </div>
            <span> Grantee owner user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent mode={"ShareGrantee"} grantee={owner} onDelete={action("onDelete")} />
            </div>
            <span> Grantee owner and current user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={currentAndOwen}
                    onDelete={action("onDelete")}
                />
            </div>

            <span> Grantee owner inactive</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={inactiveUser}
                    onDelete={action("onDelete")}
                />
            </div>
        </ComponentLabelsProvider>
    );
};

const GroupItemBasicExample = (): JSX.Element => {
    const border = { border: "1px solid black", width: 300 };

    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <span> Grantee group</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent mode={"ShareGrantee"} grantee={group} onDelete={action("onDelete")} />
            </div>
            <span> Grantee long name</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={{ ...group, name: "Very very very very very very very long name of user" }}
                    onDelete={action("onDelete")}
                />
            </div>
            <span> Grantee no group count items</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    mode={"ShareGrantee"}
                    grantee={groupNoCount}
                    onDelete={action("onDelete")}
                />
            </div>
        </ComponentLabelsProvider>
    );
};

/**
 * @internal
 */
export const GranteeItemExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div className="library-component screenshot-target">
                <h4>Grantee UserItem basic example</h4>
                <UserItemBasicExample />
                <h4>Grantee GroupItem basic example</h4>
                <GroupItemBasicExample />
            </div>
        </InternalIntlWrapper>
    );
};

const testItemSelector = `.${getGranteeItemTestId(user)}`;

const scenarios: BackstopConfig = {
    normal: {},
    hover: {
        hoverSelector: testItemSelector,
        postInteractionWait: 100,
    },
    "hover-delete": {
        hoverSelectors: [testItemSelector, 100, `${testItemSelector} .gd-grantee-icon-trash`, 100],
    },
};

storiesOf(`${UiKit}/ShareDialog/GranteeItem`, module).add("full-featured", () =>
    withMultipleScreenshots(<GranteeItemExamples />, scenarios),
);
storiesOf(`${UiKit}/ShareDialog/GranteeItem`, module).add("themed", () =>
    withMultipleScreenshots(wrapWithTheme(<GranteeItemExamples />), scenarios),
);
