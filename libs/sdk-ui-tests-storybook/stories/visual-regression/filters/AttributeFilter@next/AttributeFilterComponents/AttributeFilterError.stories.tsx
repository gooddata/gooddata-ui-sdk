// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterError } from "@gooddata/sdk-ui-filters";

import { type IStoryParameters, State } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterErrorExamples(): ReactElement {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterError</h4>
                    <AttributeFilterError />
                </div>
            </IntlWrapper>
        </div>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterError",
};

export function FullFeatured() {
    return <AttributeFilterErrorExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterErrorExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
