// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterEmptyResult } from "@gooddata/sdk-ui-filters";

import {
    type INeobackstopScenarioConfig,
    type IStoryParameters,
} from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterEmptyResultExamples(): ReactElement {
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
                        isFilteredByParentFilters
                        searchString={""}
                        totalItemsCount={100}
                        parentFilterTitles={["Location", "Department"]}
                    />
                    <h4>
                        AttributeFilterEmptyResult empty filtered result with support for irrelevant values
                    </h4>
                    <AttributeFilterEmptyResult
                        height={100}
                        isFilteredByParentFilters
                        searchString={""}
                        totalItemsCount={100}
                        parentFilterTitles={["Location", "Department"]}
                        enableShowingFilteredElements
                    />
                </div>
            </IntlWrapper>
        </div>
    );
}

const delayConfig: INeobackstopScenarioConfig = {
    readySelector: ".screenshot-target",
    delay: 200,
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Components/AttributeFilterEmptyResult",
};

export function FullFeatured() {
    return <AttributeFilterEmptyResultExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: delayConfig } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterEmptyResultExamples />);
Themed.parameters = { kind: "themed", screenshot: delayConfig } satisfies IStoryParameters;
