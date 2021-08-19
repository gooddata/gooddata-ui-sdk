// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillEventContext } from "@gooddata/sdk-ui";
import { ISeparators, IKpiWidget, IKpiWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";

import { OnFiredDashboardViewDrillEvent } from "../../../../types";

import { KpiContent } from "./KpiContent";
import { IKpiResult } from "./types";

interface IKpiRendererProps {
    kpi: IKpiWidget | IKpiWidgetDefinition;
    kpiResult: IKpiResult | undefined;
    filters: IFilter[];
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    isDrillable?: boolean;
    onDrill?: (drillContext: IDrillEventContext) => ReturnType<OnFiredDashboardViewDrillEvent>;
    enableCompactSize?: boolean;
}

/**
 * @internal
 */
export const KpiRenderer: React.FC<IKpiRendererProps> = ({
    disableDrillUnderline,
    onDrill,
    isDrillable,
    kpi,
    kpiResult,
    filters,
    separators,
    enableCompactSize,
}) => {
    const onPrimaryValueClick = useCallback(() => {
        if (!isDrillable || !onDrill || !kpiResult) {
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
            isLoading={false}
            kpi={kpi}
            kpiResult={kpiResult}
            isKpiUnderlineHiddenWhenClickable={disableDrillUnderline}
            onKpiValueClick={isDrillable && onDrill ? onPrimaryValueClick : undefined}
            filters={filters}
            separators={separators}
            enableCompactSize={enableCompactSize}
        />
    );
};
