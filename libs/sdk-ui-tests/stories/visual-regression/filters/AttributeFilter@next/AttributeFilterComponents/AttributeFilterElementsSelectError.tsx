// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectError } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterElementsSelectErrorExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterElementsSelectError</h4>
                    <AttributeFilterElementsSelectError />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterElementsSelectError`)
    .add("full-featured", () => <AttributeFilterElementsSelectErrorExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSelectErrorExamples />), { screenshot: true });
