// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterLoading } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterLoadingExamples = (): ReactElement => {
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
};

export default {
    title: "10 Filters@next/Components/AttributeFilterLoading",
};

export const FullFeatured = () => <AttributeFilterLoadingExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterLoadingExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
