// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectError } from "@gooddata/sdk-ui-filters";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

import { IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

function AttributeFilterElementsSelectErrorExamples(): ReactElement {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterElementsSelectError</h4>
                    <AttributeFilterElementsSelectError />
                </div>
            </IntlWrapper>
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters@next/Components/AttributeFilterElementsSelectError",
};

export function FullFeatured() {
    return <AttributeFilterElementsSelectErrorExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSelectErrorExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
