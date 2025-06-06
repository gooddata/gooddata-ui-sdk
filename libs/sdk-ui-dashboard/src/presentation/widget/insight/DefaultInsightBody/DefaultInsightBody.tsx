// (C) 2022-2025 GoodData Corporation
import React from "react";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import { CustomInsightBodyComponent } from "../types.js";

/**
 * Default implementation of the InsightBody.
 *
 * @alpha
 */
export const DefaultInsightBody: CustomInsightBodyComponent = (props) => {
    return <InsightRenderer {...props} />;
};
