// (C) 2022 GoodData Corporation
import React from "react";

import { FilterStories } from "../../../../_infra/storyGroups.js";
import { storiesOf } from "../../../../_infra/storyRepository.js";

import { IntlWrapper } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { SingleSelectionAttributeFilterStatusBar } from "@gooddata/sdk-ui-filters";

const elements = [
    { title: "PhoenixSoft", uri: "/uri1" },
    { title: "WonderKid", uri: "/uri2" },
];

const SingleSelectionAttributeFilterStatusBarExamples = (): JSX.Element => {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>SingleSelectionAttributeFilterStatusBar positive selection = renders nothing</h4>
                    <SingleSelectionAttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={false}
                        selectedItemsLimit={500}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>SingleSelectionAttributeFilterStatusBar filtered by parent filters</h4>
                    <SingleSelectionAttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted={true}
                        selectedItemsLimit={500}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters={true}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
};

storiesOf(`${FilterStories}@next/Components/SingleSelectionAttributeFilterStatusBar`).add(
    "full-featured",
    () => <SingleSelectionAttributeFilterStatusBarExamples />,
    { screenshot: true },
);
