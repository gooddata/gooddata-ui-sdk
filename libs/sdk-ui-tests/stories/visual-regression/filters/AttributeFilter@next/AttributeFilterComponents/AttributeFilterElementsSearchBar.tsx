// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "@storybook/addon-actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSearchBar } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterElementsSearchBarExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterElementsSearchBar placeholder</h4>
                    <AttributeFilterElementsSearchBar onSearch={action("search")} searchString={""} />
                    <h4>AttributeFilterElementsSearchBar with search string</h4>
                    <AttributeFilterElementsSearchBar
                        onSearch={action("search")}
                        searchString={"WonderKid"}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterElementsSearchBar`)
    .add("full-featured", () => <AttributeFilterElementsSearchBarExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterElementsSearchBarExamples />), { screenshot: true });
