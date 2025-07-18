// (C) 2022-2025 GoodData Corporation
import { ReactElement } from "react";

import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterEmptyResult } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterEmptyResultExamples = (): ReactElement => {
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
                    <h4>
                        AttributeFilterEmptyResult empty filtered result with support for irrelevant values
                    </h4>
                    <AttributeFilterEmptyResult
                        height={100}
                        isFilteredByParentFilters={true}
                        searchString={""}
                        totalItemsCount={100}
                        parentFilterTitles={["Location", "Department"]}
                        enableShowingFilteredElements={true}
                    />
                </div>
            </IntlWrapper>
        </div>
    );
};

const delayConfig = { delay: 200 };

export default {
    title: "10 Filters@next/Components/AttributeFilterEmptyResult",
};

export const FullFeatured = () => <AttributeFilterEmptyResultExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: delayConfig };

export const Themed = () => wrapWithTheme(<AttributeFilterEmptyResultExamples />);
Themed.parameters = { kind: "themed", screenshot: delayConfig };
