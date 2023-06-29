// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownActions } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterButtonsExamples = (): JSX.Element => {
    return (
        <IntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterDropdownActions</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClick")}
                        onCancelButtonClick={action("onCancelButtonClick")}
                        isApplyDisabled={false}
                    />
                    <h4>AttributeFilterDropdownActions apply disabled</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClicked")}
                        onCancelButtonClick={action("onCancelButtonClicked")}
                        isApplyDisabled={true}
                    />
                </div>
            </div>
        </IntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownActions`)
    .add("full-featured", () => <AttributeFilterButtonsExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonsExamples />), { screenshot: true });
