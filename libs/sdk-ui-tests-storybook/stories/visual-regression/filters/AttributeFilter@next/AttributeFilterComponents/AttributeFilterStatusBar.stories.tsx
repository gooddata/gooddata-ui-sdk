// (C) 2022-2026 GoodData Corporation

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterStatusBar } from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

const elements = [
    { title: "PhoenixSoft", uri: "/uri1" },
    { title: "WonderKid", uri: "/uri2" },
];

function AttributeFilterStatusBarExamples() {
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
                        isInverted
                        selectedItemsLimit={500}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>AttributeFilterStatusBar filtered by parent filters</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted
                        selectedItemsLimit={500}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters
                    />
                    <h4>AttributeFilterStatusBar reached selection limit</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted
                        selectedItemsLimit={2}
                        parentFilterTitles={[]}
                        isFilteredByParentFilters={false}
                    />
                    <h4>AttributeFilterStatusBar over selection limit</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted
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
                        isInverted
                        selectedItemsLimit={2}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters
                    />
                    <h4>AttributeFilterStatusBar with irrelevant selected elements and show all option</h4>
                    <AttributeFilterStatusBar
                        getItemTitle={(element) => element.title!}
                        selectedItems={elements}
                        totalElementsCountWithCurrentSettings={100}
                        isInverted
                        selectedItemsLimit={500}
                        parentFilterTitles={["Location", "Department"]}
                        isFilteredByParentFilters
                        enableShowingFilteredElements
                        attributeTitle="Product"
                        onShowFilteredElements={action("showAll")}
                        irrelevantSelection={[elements[0]]}
                        onClearIrrelevantSelection={action("clear")}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterStatusBar",
};

export function FullFeatured() {
    return <AttributeFilterStatusBarExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterStatusBarExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
