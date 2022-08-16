// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups";
import { storiesOf } from "../../../../_infra/storyRepository";
import { wrapWithTheme } from "../../../themeWrapper";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterError } from "@gooddata/sdk-ui-filters/dist/internal";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterErrorExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterError</h4>
                    <AttributeFilterError />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterError`)
    .add("full-featured", () => <AttributeFilterErrorExamples />, {})
    .add("themed", () => wrapWithTheme(<AttributeFilterErrorExamples />), {});
