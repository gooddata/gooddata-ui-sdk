// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IKpiWidget, ObjRef, widgetRef, widgetTitle } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    changeKpiWidgetMeasure,
    selectAllCatalogMeasuresMap,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { MetricDropdown } from "./MetricDropdown";

interface IKpiMetricDropdownProps {
    widget: IKpiWidget;
}

export const KpiMetricDropdown: React.FC<IKpiMetricDropdownProps> = (props) => {
    const { widget } = props;
    const workspace = useWorkspaceStrict();
    const dispatch = useDashboardDispatch();

    const measureRef = widget.kpi.metric;
    const measuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const measureTitle = measuresMap.get(measureRef)?.measure.title;

    const handleMeasureChanged = useCallback(
        (item: ObjRef) => {
            dispatch(
                changeKpiWidgetMeasure(
                    widgetRef(widget),
                    item,
                    // if the title of the widget was the same as the title of the measure
                    // update the widget title to be the title of the newly selected measure
                    measureTitle === widgetTitle(widget) ? "from-measure" : undefined,
                ),
            );
        },
        [dispatch, widget, measureTitle],
    );

    const selectedItems = useMemo(() => [measureRef], [measureRef]);

    return (
        <MetricDropdown
            workspace={workspace}
            openOnInit={!measureRef}
            bodyClassName="configuration-dropdown metrics-list s-metrics-list"
            selectedItems={selectedItems}
            onSelect={handleMeasureChanged}
        />
    );
};
