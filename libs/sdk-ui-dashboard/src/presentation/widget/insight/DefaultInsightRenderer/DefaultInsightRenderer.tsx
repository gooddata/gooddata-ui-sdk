// (C) 2022 GoodData Corporation
import React from "react";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import { CustomInsightRenderer } from "../types";

/**
 * Default implementation of the Insight Renderer.
 *
 * @alpha
 */
export const DefaultInsightRenderer: CustomInsightRenderer = (props) => {
    return <InsightRenderer {...props} />;
};
