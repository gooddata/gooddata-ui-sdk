// (C) 2021 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "../styles/goodstrap.scss";

import { action } from "@storybook/addon-actions";
import {
    ComponentLabelsProvider,
    getGranteeItemTestId,
    GranteeItemComponent,
    IGranteeItemProps,
} from "@gooddata/sdk-ui-kit";
import { BackstopConfig } from "../../../_infra/backstopScenario.js";
import {
    current,
    currentAndOwen,
    defaultUserPermissions,
    granularGroup,
    granularUser,
    group,
    groupNoCount,
    inactiveUser,
    owner,
    user,
    userInactive,
} from "./GranteeMock.js";
import { LabelsMock } from "./LabelsMock.js";

const defaultGranteeItemComponentProps: Omit<IGranteeItemProps, "grantee"> = {
    mode: "ShareGrantee",
    onDelete: action("onDelete"),
    currentUserPermissions: defaultUserPermissions,
    isSharedObjectLocked: false,
};

const UserItemBasicExample = (): JSX.Element => {
    const border = { border: "1px solid black", width: 300 };

    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <span> Grantee user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={user} {...defaultGranteeItemComponentProps} />
            </div>
            <span> Grantee long name and email</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    grantee={{
                        ...user,
                        name: "Very very very very very very very long name of user",
                        email: "Very_very_very_very_very_very_very@long_email.com",
                    }}
                    {...defaultGranteeItemComponentProps}
                />
            </div>
            <span> Grantee current user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={current} {...defaultGranteeItemComponentProps} />
            </div>
            <span> Grantee inactive user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={userInactive} {...defaultGranteeItemComponentProps} />
            </div>
            <span> Grantee inactive user long name</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    grantee={{
                        ...userInactive,
                        name: "Very very very very very very very long name of user",
                    }}
                    {...defaultGranteeItemComponentProps}
                />
            </div>
            <span> Grantee owner user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={owner} {...defaultGranteeItemComponentProps} />
            </div>
            <span> Grantee owner and current user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={currentAndOwen} {...defaultGranteeItemComponentProps} />
            </div>

            <span> Grantee owner inactive</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={inactiveUser} {...defaultGranteeItemComponentProps} />
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
                <GranteeItemComponent grantee={group} {...defaultGranteeItemComponentProps} />
            </div>
            <span> Grantee long name</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    grantee={{ ...group, name: "Very very very very very very very long name of user" }}
                    {...defaultGranteeItemComponentProps}
                />
            </div>
            <span> Grantee no group count items</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent grantee={groupNoCount} {...defaultGranteeItemComponentProps} />
            </div>
        </ComponentLabelsProvider>
    );
};

const GranularGranteeBasicExample = (): JSX.Element => {
    const border = { border: "1px solid black", width: 300 };

    return (
        <ComponentLabelsProvider labels={LabelsMock}>
            <span> Grantee user</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    grantee={granularUser}
                    areGranularPermissionsSupported={true}
                    {...defaultGranteeItemComponentProps}
                />
            </div>
            <span> Grantee group</span>
            <div id="Grantee-item-basic-example" style={border}>
                <GranteeItemComponent
                    grantee={granularGroup}
                    areGranularPermissionsSupported={true}
                    {...defaultGranteeItemComponentProps}
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
                <h4>Grantee granular basic example</h4>
                <GranularGranteeBasicExample />
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
    "click-select": {
        clickSelector: ".s-granular-permission-button",
        postInteractionWait: 200,
    },
};

storiesOf(`${UiKit}/ShareDialog/GranteeItem`)
    .add("full-featured", () => <GranteeItemExamples />, { screenshots: scenarios })
    .add("themed", () => wrapWithTheme(<GranteeItemExamples />), { screenshots: scenarios });
