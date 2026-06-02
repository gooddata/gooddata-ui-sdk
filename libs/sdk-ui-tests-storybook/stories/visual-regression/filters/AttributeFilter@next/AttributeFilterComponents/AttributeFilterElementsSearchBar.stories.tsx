// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSearchBar } from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

function AttributeFilterElementsSearchBarExamples(): ReactElement {
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

export function FullFeatured() {
    return <AttributeFilterElementsSearchBarExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSearchBarExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
