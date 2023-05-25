// (C) 2022 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IKpiWidget, IMeasureMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { safeSerializeObjRef } from "../../../../../_staging/metadata/safeSerializeObjRef.js";

import { MetricDropdown } from "./MetricDropdown.js";

interface IKpiMetricDropdownProps {
    widget?: IKpiWidget;
    onMeasureChange: (item: ObjRef) => void;
}

export const KpiMetricDropdown: React.FC<IKpiMetricDropdownProps> = (props) => {
    const { widget, onMeasureChange } = props;
    const workspace = useWorkspaceStrict();
    const measureRef = widget?.kpi.metric;

    const [selectedMeasure, setSelectedMeasure] = useState<ObjRef | undefined>(measureRef);

    const selectedItems = useMemo(() => (selectedMeasure ? [selectedMeasure] : []), [selectedMeasure]);

    const handleMeasureChanged = useCallback(
        (measure: IMeasureMetadataObject) => {
            onMeasureChange(measure.ref);
            setSelectedMeasure(measure.ref);
        },
        [onMeasureChange],
    );

    useEffect(() => {
        setSelectedMeasure(measureRef);
    }, [safeSerializeObjRef(measureRef)]);

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
