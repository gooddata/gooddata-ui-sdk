// (C) 2022-2025 GoodData Corporation
import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import { IInsightBodyProps } from "../types.js";
import { convertInsightToTableDefinition } from "../insightToTable.js";
import { useShowAsTable } from "../../showAsTableButton/useShowAsTable.js";

/**
 * Default implementation of the InsightBody.
 *
 * @alpha
 */
export function DefaultInsightBody(props: IInsightBodyProps) {
    const { insight } = props;
    const { isWidgetAsTable } = useShowAsTable(props.widget);

    const insightToShow = isWidgetAsTable ? convertInsightToTableDefinition(insight) : insight;

    return <InsightRenderer {...props} insight={insightToShow} />;
}
