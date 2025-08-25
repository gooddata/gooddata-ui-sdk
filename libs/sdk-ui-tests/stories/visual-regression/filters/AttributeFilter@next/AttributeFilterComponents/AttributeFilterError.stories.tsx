// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterError } from "@gooddata/sdk-ui-filters";

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
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterErrorExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
