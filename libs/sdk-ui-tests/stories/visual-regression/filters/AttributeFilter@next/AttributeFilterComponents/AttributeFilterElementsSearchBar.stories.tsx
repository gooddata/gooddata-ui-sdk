// (C) 2022-2025 GoodData Corporation

import { wrapWithTheme } from "../../../themeWrapper.js";

import { action } from "storybook/actions";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSearchBar } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterElementsSearchBarExamples() {
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
}

export default {
    title: "10 Filters@next/Components/AttributeFilterElementsSearchBar",
};

export const FullFeatured = () => <AttributeFilterElementsSearchBarExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSearchBarExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
