// (C) 2020-2022 GoodData Corporation
import React, { useCallback } from "react";
import { GoodDataSdkError, IDrillEventContext } from "@gooddata/sdk-ui";
import { IFilter, IKpiWidget, IKpiWidgetDefinition, ISeparators } from "@gooddata/sdk-model";

import { OnFiredDashboardDrillEvent } from "../../../../types.js";

import { KpiContent } from "./KpiContent/index.js";
import { IKpiResult } from "./types.js";
import { useDashboardSelector, selectIsInEditMode } from "../../../../model/index.js";

interface IKpiRendererProps {
    kpi: IKpiWidget | IKpiWidgetDefinition;
    kpiResult: IKpiResult | undefined;
    filters: IFilter[];
    separators: ISeparators;
    disableDrillUnderline?: boolean;
    isDrillable?: boolean;
    onDrill?: (drillContext: IDrillEventContext) => ReturnType<OnFiredDashboardDrillEvent>;
    isKpiValueClickDisabled?: boolean;
    enableCompactSize?: boolean;
    error?: GoodDataSdkError;
    errorHelp?: string;
    isLoading?: boolean;
}

/**
 * @internal
 */
export const KpiRenderer: React.FC<IKpiRendererProps> = ({
    disableDrillUnderline,
    onDrill,
    isDrillable,
    isKpiValueClickDisabled,
    kpi,
    kpiResult,
    filters,
    separators,
    enableCompactSize,
    error,
    errorHelp,
    isLoading,
}) => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const onPrimaryValueClick = useCallback(() => {
        if (!isDrillable || !onDrill) {
            return;
        }

        return onDrill({
            type: "headline", // TODO is that correct?
            element: "primaryValue",
            value: kpiResult?.measureResult?.toString(),
            intersection: kpiResult?.measureDescriptor
                ? [
                      {
                          header: kpiResult.measureDescriptor,
                      },
                  ]
                : [],
        });
    }, [kpiResult?.measureResult, kpiResult?.measureDescriptor, isDrillable, onDrill]);

    return (
        <KpiContent
            isLoading={!!isLoading}
            kpi={kpi}
            kpiResult={kpiResult}
            isKpiUnderlineHiddenWhenClickable={disableDrillUnderline}
            onKpiValueClick={isDrillable && onDrill ? onPrimaryValueClick : undefined}
            isKpiValueClickDisabled={isKpiValueClickDisabled}
            filters={filters}
            separators={separators}
            enableCompactSize={enableCompactSize}
            error={error}
            errorHelp={errorHelp}
            isInEditMode={isInEditMode}
        />
    );
};
