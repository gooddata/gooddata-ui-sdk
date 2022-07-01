// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IKpiWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { changeKpiWidgetMeasure, useDashboardDispatch } from "../../../../model";
import { MetricDropdown } from "./MetricDropdown";

interface IKpiMetricDropdownProps {
    widget: IKpiWidget;
}

export const KpiMetricDropdown: React.FC<IKpiMetricDropdownProps> = (props) => {
    const { widget } = props;
    const workspace = useWorkspaceStrict();
    const dispatch = useDashboardDispatch();
    const metric = widget.kpi.metric;

    const handleMeasureChanged = useCallback(
        (item: ObjRef) => {
            dispatch(changeKpiWidgetMeasure(widgetRef(widget), item));
        },
        [dispatch, widget],
    );

    const selectedItems = useMemo(() => [metric], [metric]);

    return (
        <MetricDropdown
            workspace={workspace}
            openOnInit={!metric}
            bodyClassName="configuration-dropdown metrics-list s-metrics-list"
            selectedItems={selectedItems}
            onSelect={handleMeasureChanged}
        />
    );
};
