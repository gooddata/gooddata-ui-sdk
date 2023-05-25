// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterEmptyResult } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterEmptyResultExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterEmptyResult empty attribute result</h4>
                    <AttributeFilterEmptyResult
                        height={100}
                        isFilteredByParentFilters={false}
                        searchString={""}
                        totalItemsCount={0}
                        parentFilterTitles={[]}
                    />
                    <h4>AttributeFilterEmptyResult empty search result</h4>
                    <AttributeFilterEmptyResult
                        height={100}
                        isFilteredByParentFilters={false}
                        searchString={"Search"}
                        totalItemsCount={100}
                        parentFilterTitles={[]}
                    />
                    <h4>AttributeFilterEmptyResult empty filtered result</h4>
                    <AttributeFilterEmptyResult
                        height={100}
                        isFilteredByParentFilters={true}
                        searchString={""}
                        totalItemsCount={100}
                        parentFilterTitles={["Location", "Department"]}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterEmptyResult`)
    .add("full-featured", () => <AttributeFilterEmptyResultExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterEmptyResultExamples />), { screenshot: true });
