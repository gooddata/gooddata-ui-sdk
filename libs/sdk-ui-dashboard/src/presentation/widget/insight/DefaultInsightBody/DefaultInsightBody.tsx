// (C) 2022-2025 GoodData Corporation
import React from "react";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import { CustomInsightBodyComponent } from "../types.js";
import { convertInsightToTableDefinition } from "../insightToTable.js";
import { useWidgetAsTable } from "../../asTableButton/useWidgetAsTable.js";

/**
 * Default implementation of the InsightBody.
 *
 * @alpha
 */
export const DefaultInsightBody: CustomInsightBodyComponent = (props) => {
    const { insight } = props;
    const { isWidgetAsTable } = useWidgetAsTable(props.widget);

    const insightToShow = isWidgetAsTable ? convertInsightToTableDefinition(insight) : insight;

    return <InsightRenderer {...props} insight={insightToShow} />;
};
