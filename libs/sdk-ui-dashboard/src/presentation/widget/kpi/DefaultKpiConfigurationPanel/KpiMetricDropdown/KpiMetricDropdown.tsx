// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IKpiWidget, IMeasureMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { MetricDropdown } from "./MetricDropdown";

interface IKpiMetricDropdownProps {
    widget?: IKpiWidget;
    onMeasureChange: (item: ObjRef) => void;
}

export const KpiMetricDropdown: React.FC<IKpiMetricDropdownProps> = (props) => {
    const { widget, onMeasureChange } = props;
    const workspace = useWorkspaceStrict();

    const measureRef = widget?.kpi.metric;
    const selectedItems = useMemo(() => (measureRef ? [measureRef] : []), [measureRef]);

    const handleMeasureChanged = useCallback(
        (measure: IMeasureMetadataObject) => {
            onMeasureChange(measure.ref);
        },
        [onMeasureChange],
    );

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
