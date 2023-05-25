// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterStatusBar } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const elements = [
    { title: "PhoenixSoft", uri: "/uri1" },
    { title: "WonderKid", uri: "/uri2" },
];

const AttributeFilterStatusBarExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterStatusBar positive selection</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={false}
                        selectedItemsLimit={500}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>AttributeFilterStatusBar negative selection</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={500}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>AttributeFilterStatusBar filtered by parent filters</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={500}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters={true}
                    />
                    <h4>AttributeFilterStatusBar reached selection limit</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={2}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>AttributeFilterStatusBar over selection limit</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={1}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>
                        AttributeFilterStatusBar reached selection limit and is filtered by parent filters
                    </h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={2}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters={true}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/AttributeFilterStatusBar`)
    .add("full-featured", () => <AttributeFilterStatusBarExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AttributeFilterStatusBarExamples />), { screenshot: true });
