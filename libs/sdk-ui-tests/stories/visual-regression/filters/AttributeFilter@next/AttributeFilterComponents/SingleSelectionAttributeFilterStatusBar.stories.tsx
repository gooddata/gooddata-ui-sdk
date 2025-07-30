// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { SingleSelectionAttributeFilterStatusBar } from "@gooddata/sdk-ui-filters";

const elements = [
    { title: "PhoenixSoft", uri: "/uri1" },
    { title: "WonderKid", uri: "/uri2" },
];

const SingleSelectionAttributeFilterStatusBarExamples = (): ReactElement => {
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

export default {
    title: "10 Filters@next/Components/SingleSelectionAttributeFilterStatusBar",
};

export const FullFeatured = () => <SingleSelectionAttributeFilterStatusBarExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };
