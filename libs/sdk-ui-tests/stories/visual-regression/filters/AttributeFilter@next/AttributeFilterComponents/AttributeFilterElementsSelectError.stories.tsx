// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { wrapWithTheme } from "../../../themeWrapper.js";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { AttributeFilterElementsSelectError } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";

const AttributeFilterElementsSelectErrorExamples = (): ReactElement => {
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
};

export default {
    title: "10 Filters@next/Components/AttributeFilterElementsSelectError",
};

export const FullFeatured = () => <AttributeFilterElementsSelectErrorExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<AttributeFilterElementsSelectErrorExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
