// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillEventContext, OnFiredDrillEvent } from "@gooddata/sdk-ui";
import { DataValue, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

export interface IKpiValueInfo {
    formattedValue: string;
    isDrillable: boolean;
    title: string;
    value: DataValue;
    measureDescriptor: IMeasureDescriptor;
}

interface IKpiRendererProps {
    title: string;
    primaryValue?: IKpiValueInfo;
    secondaryValue?: IKpiValueInfo;
    onDrill?: (drillContext: IDrillEventContext) => ReturnType<OnFiredDrillEvent>;
}

/**
 * @remarks The rendered part will be replaced by the "real" KPI component once that is ready.
 * @internal
 */
export const KpiRenderer: React.FC<IKpiRendererProps> = ({
    title,
    primaryValue,
    secondaryValue,
    onDrill,
}) => {
    const onPrimaryValueClick = useCallback(() => {
        if (!primaryValue?.isDrillable || !onDrill) {
            return;
        }
        return onDrill(getDrillEventContext(primaryValue, "primaryValue"));
    }, [primaryValue, onDrill]);

    const onSecondaryValueClick = useCallback(() => {
        if (!secondaryValue?.isDrillable || !onDrill) {
            return;
        }
        return onDrill(getDrillEventContext(secondaryValue, "secondaryValue"));
    }, [secondaryValue, onDrill]);

    return (
        <div>
            <div onClick={onPrimaryValueClick}>
                <div>{title}</div>
                <div>{primaryValue?.formattedValue ?? "—"}</div>
            </div>
            {secondaryValue && <div onClick={onSecondaryValueClick}>{secondaryValue.formattedValue}</div>}
        </div>
    );
};

function getDrillEventContext(
    valueInfo: IKpiValueInfo,
    element: IDrillEventContext["element"],
): IDrillEventContext {
    return {
        type: "headline", // TODO is that correct?
        element,
        value: valueInfo.value?.toString(),
        intersection: [
            {
                header: valueInfo.measureDescriptor,
            },
        ],
    };
}
