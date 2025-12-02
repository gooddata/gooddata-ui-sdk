// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterDropdownActions } from "@gooddata/sdk-ui-filters";

import { IStoryParameters } from "../../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterButtonsExamples(): ReactElement {
    return (
        <IntlWrapper>
            <div style={{ width: 400 }}>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterDropdownActions</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClick")}
                        onCancelButtonClick={action("onCancelButtonClick")}
                        isApplyDisabled={false}
                    />
                    <h4>AttributeFilterDropdownActions apply disabled</h4>
                    <AttributeFilterDropdownActions
                        onApplyButtonClick={action("onApplyButtonClicked")}
                        onCancelButtonClick={action("onCancelButtonClicked")}
                        isApplyDisabled
                    />
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterDropdownActions",
};

export function FullFeatured() {
    return <AttributeFilterButtonsExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<AttributeFilterButtonsExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
