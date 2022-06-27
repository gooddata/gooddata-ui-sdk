// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeFilterDropdownButtons } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeFilterDropdownButtons";
import { action } from "@storybook/addon-actions";

const AttributeFilterButtonsExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterDropdownButtons</h4>
                    <AttributeFilterDropdownButtons
                        onApplyButtonClicked={action("onApplyButtonClicked")}
                        onCloseButtonClicked={action("onCloseButtonClicked")}
                        isApplyDisabled={false}
                    />
                    <h4>AttributeFilterDropdownButtons apply disabled</h4>
                    <AttributeFilterDropdownButtons
                        onApplyButtonClicked={action("onApplyButtonClicked")}
                        onCloseButtonClicked={action("onCloseButtonClicked")}
                        isApplyDisabled={true}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterDropdownButtons`)
    .add("full-featured", () => <AttributeFilterButtonsExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonsExamples />), {});
