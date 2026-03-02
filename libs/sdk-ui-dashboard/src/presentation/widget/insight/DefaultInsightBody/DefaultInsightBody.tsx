// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { InsightRenderer } from "@gooddata/sdk-ui-ext";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogAttributes } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectSettings } from "../../../../model/store/config/configSelectors.js";
import { selectPreloadedAttributesWithReferences } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { useShowAsTable } from "../../showAsTableButton/useShowAsTable.js";
import { getGeoDefaultDisplayFormRefs } from "../geoDefaultDisplayFormRefs.js";
import { convertInsightToLayerTables, convertInsightToTableDefinition } from "../insightToTable.js";
import { LayeredTableView } from "../LayeredTableView.js";
import { type IInsightBodyProps } from "../types.js";

/**
 * Default implementation of the InsightBody.
 *
 * @alpha
 */
export function DefaultInsightBody(props: IInsightBodyProps) {
    const { insight, layerTables: providedLayerTables } = props;
    const { isWidgetAsTable } = useShowAsTable(props.widget);
    const settings = useDashboardSelector(selectSettings);
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const preloadedAttributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);

    const computedLayerTables = useMemo(
        () =>
            providedLayerTables
                ? undefined
                : isWidgetAsTable
                  ? convertInsightToLayerTables(insight, {
                        settings,
                        catalogAttributes,
                        preloadedAttributesWithReferences,
                    })
                  : undefined,
        [
            providedLayerTables,
            isWidgetAsTable,
            insight,
            settings,
            catalogAttributes,
            preloadedAttributesWithReferences,
        ],
    );
    const layerTables = providedLayerTables ?? computedLayerTables;

    if (layerTables && layerTables.length > 1) {
        return <LayeredTableView {...props} layerTables={layerTables} />;
    }

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
