// (C) 2022 GoodData Corporation
import React from "react";

import { ICatalogMeasure, ObjRef, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import { IKpiDescriptionTriggerProps } from "./types.js";
import {
    useDashboardSelector,
    selectCatalogMeasures,
    useDashboardUserInteraction,
    DescriptionTooltipOpenedData,
} from "../../../../../model/index.js";
import { DescriptionClickTrigger } from "../../../description/DescriptionClickTrigger.js";

const getKpiMetricDescription = (metrics: ICatalogMeasure[], ref: ObjRef): string | undefined => {
    return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, ref))?.measure.description;
};

export const KpiDescriptionTrigger: React.FC<IKpiDescriptionTriggerProps> = (props) => {
    const { kpi } = props;
    const visible = kpi.configuration?.description?.visible ?? true;
    const metrics = useDashboardSelector(selectCatalogMeasures);

    const description =
        kpi.configuration?.description?.source === "kpi"
            ? kpi.description
            : getKpiMetricDescription(metrics, kpi.kpi.metric);

    const trimmedDescription = description?.trim();

    const kpiRefAsString = kpi.ref ? objRefToString(kpi.ref) : "";

    const userInteraction = useDashboardUserInteraction();

    const eventPayload: DescriptionTooltipOpenedData = {
        from: "kpi",
        type: kpi.configuration?.description?.source === "kpi" ? "custom" : "inherit",
        description: trimmedDescription,
    };

    if (visible && trimmedDescription && trimmedDescription !== "") {
        return (
            <DescriptionClickTrigger
                className={`kpi-description-${stringUtils.simplifyText(kpiRefAsString)}`}
                description={trimmedDescription}
                onOpen={() => userInteraction.descriptionTooltipOpened(eventPayload)}
            />
        );
    }
    return null;
};
