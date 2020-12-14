// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillEventContext, OnFiredDrillEvent } from "@gooddata/sdk-ui";
import { ISeparators, IWidgetAlert, IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";

import { KpiContent, IKpiResult } from "../../KpiContent";

interface IKpiRendererProps {
    kpi: IWidgetDefinition;
    kpiResult: IKpiResult | null;
    filters: IFilter[];
    separators: ISeparators;
    alert?: IWidgetAlert;
    disableDrillUnderline?: boolean;
    isDrillable?: boolean;
    onDrill?: (drillContext: IDrillEventContext) => ReturnType<OnFiredDrillEvent>;
    clientWidth: number;
}

/**
 * @internal
 */
export const KpiRenderer: React.FC<IKpiRendererProps> = ({
    disableDrillUnderline,
    onDrill,
    isDrillable,
    clientWidth,
    kpi,
    kpiResult,
    filters,
    separators,
}) => {
    const onPrimaryValueClick = useCallback(() => {
        if (!isDrillable || !onDrill) {
            return;
        }
        return onDrill({
            type: "headline", // TODO is that correct?
            element: "primaryValue",
            value: kpiResult.measureResult?.toString(),
            intersection: [
                {
                    header: kpiResult.measureDescriptor,
                },
            ],
        });
    }, [kpiResult?.measureResult, kpiResult?.measureDescriptor, isDrillable, onDrill]);

    return (
        <KpiContent
            clientWidth={clientWidth}
            isLoading={false}
            kpi={kpi}
            kpiResult={kpiResult}
            isKpiUnderlineHiddenWhenClickable={disableDrillUnderline}
            onKpiValueClick={isDrillable && onPrimaryValueClick}
            filters={filters}
            separators={separators}
        />
    );
};
