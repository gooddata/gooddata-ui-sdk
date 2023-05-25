// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectLoading } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterElementsSelectLoadingExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterElementsSelectLoading</h4>
                    <AttributeFilterElementsSelectLoading height={100} />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterElementsSelectLoading`)
    .add("full-featured", () => <AttributeFilterElementsSelectLoadingExamples />)
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSelectLoadingExamples />));
