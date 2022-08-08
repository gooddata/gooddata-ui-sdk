// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterDropdownActions } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/Dropdown/AttributeFilterDropdownActions";
import { action } from "@storybook/addon-actions";

const AttributeFilterButtonsExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterDropdownActions</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClick")}
                        onCloseButtonClick={action("onCloseButtonClick")}
                        isApplyDisabled={false}
                    />
                    <h4>AttributeFilterDropdownActions apply disabled</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClicked")}
                        onCloseButtonClick={action("onCloseButtonClicked")}
                        isApplyDisabled={true}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownActions`)
    .add("full-featured", () => <AttributeFilterButtonsExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonsExamples />), {});
