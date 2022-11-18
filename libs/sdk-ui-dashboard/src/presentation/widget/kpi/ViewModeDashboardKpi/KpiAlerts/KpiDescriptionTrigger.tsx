// (C) 2022 GoodData Corporation
import React from "react";

import { DescriptionPanel } from "@gooddata/sdk-ui-kit";
import { ICatalogMeasure, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { IKpiDescriptionTriggerProps } from "./types";
import { useDashboardSelector, selectCatalogMeasures } from "../../../../../model";

const getKpiMetricDescription = (metrics: ICatalogMeasure[], ref: ObjRef): string | undefined => {
    return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, ref))?.measure.description;
};

export const KpiDescriptionTrigger: React.FC<IKpiDescriptionTriggerProps> = (props) => {
    const { kpi } = props;
    const visible = kpi.configuration?.description?.visible;
    const metrics = useDashboardSelector(selectCatalogMeasures);

    const description =
        kpi.configuration?.description?.source === "kpi"
            ? kpi.description
            : getKpiMetricDescription(metrics, kpi.kpi.metric);

    if (visible && description && description !== "") {
        return (
            <div className="dash-item-action-description">
                <DescriptionPanel description={description} />
            </div>
        );
    }
    return null;
};
