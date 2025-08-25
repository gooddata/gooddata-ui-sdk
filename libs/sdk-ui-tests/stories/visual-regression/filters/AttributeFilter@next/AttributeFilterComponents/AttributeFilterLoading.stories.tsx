// (C) 2022-2025 GoodData Corporation
import React from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterLoading } from "@gooddata/sdk-ui-filters";

import { wrapWithTheme } from "../../../themeWrapper.js";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

function AttributeFilterLoadingExamples() {
    return (
        <div style={{ width: 300 }}>
            <IntlWrapper>
                <div className="library-component screenshot-target">
                    <h4>AttributeFilterLoading</h4>
                    <AttributeFilterLoading />
                </div>
            </IntlWrapper>
        </div>
    );
}

export default {
    title: "10 Filters@next/Components/AttributeFilterLoading",
};

export function FullFeatured() {
    return <AttributeFilterLoadingExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterLoadingExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
