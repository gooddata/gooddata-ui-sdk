// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeDropdownButtons } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeDropdownButtons";
import { action } from "@storybook/addon-actions";

const AttributeFilterButtonsExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeDropdownButtons</h4>
                    <AttributeDropdownButtons
                        onApplyButtonClicked={action("onApplyButtonClicked")}
                        onCloseButtonClicked={action("onCloseButtonClicked")}
                        applyDisabled={false}
                    />
                    <h4>AttributeDropdownButtons apply disabled</h4>
                    <AttributeDropdownButtons
                        onApplyButtonClicked={action("onApplyButtonClicked")}
                        onCloseButtonClicked={action("onCloseButtonClicked")}
                        applyDisabled={true}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeDropdownButtons`)
    .add("full-featured", () => <AttributeFilterButtonsExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterButtonsExamples />), {});
