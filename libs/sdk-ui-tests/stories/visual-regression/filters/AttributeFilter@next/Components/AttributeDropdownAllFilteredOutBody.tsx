// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { AttributeDropdownAllFilteredOutBody } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/Components/AttributeDropdownAllFilteredOutBody";
import { action } from "@storybook/addon-actions";

const AttributeDropdownAllFilteredOutBodyExamples = (): JSX.Element => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeDropdownAllFilteredOutBody</h4>
                    <AttributeDropdownAllFilteredOutBody
                        parentFilterTitles={["aaa", "bbb"]}
                        onApplyButtonClick={action("onApplyButtonClick")}
                        onCancelButtonClick={action("onCancelButtonClick")}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeDropdownAllFilteredOutBody`)
    .add("full-featured", () => <AttributeDropdownAllFilteredOutBodyExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeDropdownAllFilteredOutBodyExamples />), {});
