// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import { IDrillEventContext, OnFiredDrillEvent } from "@gooddata/sdk-ui";
import { DataValue, IMeasureDescriptor, IWidgetAlert } from "@gooddata/sdk-backend-spi";

export interface IKpiValueInfo {
    formattedValue: string;
    isDrillable: boolean;
    title: string;
    value: DataValue;
    measureDescriptor: IMeasureDescriptor;
}

interface IKpiRendererProps {
    primaryValue?: IKpiValueInfo;
    secondaryValue?: IKpiValueInfo;
    alert?: IWidgetAlert;
    onDrill?: (drillContext: IDrillEventContext) => ReturnType<OnFiredDrillEvent>;
}

/**
 * @remarks The rendered part will be replaced by the "real" KPI component once that is ready.
 * @internal
 */
export const KpiRenderer: React.FC<IKpiRendererProps> = ({
    primaryValue,
    secondaryValue,
    alert,
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
                <div>
                    {!!alert && <span>{alert.isTriggered ? "Triggered alert" : "Not triggered alert"}</span>}
                </div>
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
