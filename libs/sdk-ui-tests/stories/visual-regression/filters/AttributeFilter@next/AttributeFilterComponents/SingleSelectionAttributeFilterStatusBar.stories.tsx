// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { SingleSelectionAttributeFilterStatusBar } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";

const elements = [
    { title: "PhoenixSoft", uri: "/uri1" },
    { title: "WonderKid", uri: "/uri2" },
];

function SingleSelectionAttributeFilterStatusBarExamples(): ReactElement {
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
                        isInverted
                        selectedItemsLimit={500}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters
                    />
                </div>
            </IntlWrapper>
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Components/SingleSelectionAttributeFilterStatusBar",
};

export function FullFeatured() {
    return <SingleSelectionAttributeFilterStatusBarExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
