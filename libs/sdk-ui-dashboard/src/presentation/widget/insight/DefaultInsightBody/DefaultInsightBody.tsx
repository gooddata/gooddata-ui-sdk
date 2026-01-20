// (C) 2022-2026 GoodData Corporation

import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import {
    selectCatalogAttributes,
    selectPreloadedAttributesWithReferences,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useShowAsTable } from "../../showAsTableButton/useShowAsTable.js";
import { getGeoDefaultDisplayFormRefs } from "../geoDefaultDisplayFormRefs.js";
import { convertInsightToTableDefinition } from "../insightToTable.js";
import { type IInsightBodyProps } from "../types.js";

/**
 * Default implementation of the InsightBody.
 *
 * @alpha
 */
export function DefaultInsightBody(props: IInsightBodyProps) {
    const { insight } = props;
    const { isWidgetAsTable } = useShowAsTable(props.widget);
    const settings = useDashboardSelector(selectSettings);
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const preloadedAttributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const defaultDisplayFormRefs = isWidgetAsTable
        ? getGeoDefaultDisplayFormRefs(
              insight,
              settings,
              catalogAttributes,
              preloadedAttributesWithReferences,
          )
        : undefined;
    const insightToShow = isWidgetAsTable
        ? convertInsightToTableDefinition(insight, { settings, defaultDisplayFormRefs })
        : insight;

    return <InsightRenderer {...props} insight={insightToShow} />;
}
