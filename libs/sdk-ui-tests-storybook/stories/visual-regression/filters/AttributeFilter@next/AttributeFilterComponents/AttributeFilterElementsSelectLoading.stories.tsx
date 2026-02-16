// (C) 2022-2026 GoodData Corporation

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectLoading } from "@gooddata/sdk-ui-filters";

import { type IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterElementsSelectLoadingExamples() {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterElementsSelectLoading</h4>
                    <AttributeFilterElementsSelectLoading height={100} />
                </div>
            </IntlWrapper>
        </div>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterElementsSelectLoading",
};

export function FullFeatured() {
    return <AttributeFilterElementsSelectLoadingExamples />;
}
FullFeatured.parameters = { kind: "full-featured" } satisfies IStoryParameters;
// No screenshot param here as in original

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSelectLoadingExamples />);
Themed.parameters = { kind: "themed" } satisfies IStoryParameters;
// No screenshot param here as in original
