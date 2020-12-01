// (C) 2020 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import isNil from "lodash/isNil";
import { IDrillEventContext, OnFiredDrillEvent } from "@gooddata/sdk-ui";
import { DataValue, IMeasureDescriptor, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import ResponsiveText from "@gooddata/goodstrap/lib/ResponsiveText/ResponsiveText";

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

const KpiItemAsValue = ({ value }: { value: IKpiValueInfo }) => (
    <div
        className={cx("headline-value", "s-headline-value", {
            "headline-value--empty": isNil(value?.formattedValue),
            "s-headline-value--empty": isNil(value?.formattedValue),
            "headline-link-style-underline": true, // TODO parametrize this
        })}
    >
        {value?.formattedValue ?? "—"}
    </div>
);

const KpiItemAsLink = ({ value }: { value: IKpiValueInfo }) => (
    <div className="headline-item-link s-headline-item-link">
        <KpiItemAsValue value={value} />
    </div>
);

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

    // this just a quick approximation of the Headline component, use KPI ASAP
    return (
        <div className="headline">
            <div className={cx("headline-primary-item", { "is-drillable": primaryValue?.isDrillable })}>
                <div>
                    {!!alert && <span>{alert.isTriggered ? "Triggered alert" : "Not triggered alert"}</span>}
                </div>
                <ResponsiveText>
                    <div className="headline-value-wrapper" onClick={onPrimaryValueClick}>
                        {primaryValue?.isDrillable ? (
                            <KpiItemAsLink value={primaryValue} />
                        ) : (
                            <KpiItemAsValue value={primaryValue} />
                        )}
                    </div>
                </ResponsiveText>
            </div>
            {secondaryValue ? (
                <div className="gd-flex-container headline-compare-section">
                    <div
                        className="gd-flex-item headline-compare-section-item headline-secondary-item s-headline-secondary-item"
                        style={{ borderLeft: "none" }} // temporary override of the original Headline styles
                        onClick={onSecondaryValueClick}
                    >
                        <div className="headline-value-wrapper s-headline-value-wrapper">
                            <ResponsiveText>
                                <KpiItemAsValue value={secondaryValue} />
                            </ResponsiveText>
                        </div>
                        <div
                            className="headline-title-wrapper s-headline-title-wrapper"
                            title={secondaryValue.title}
                        >
                            {secondaryValue.title}
                        </div>
                    </div>
                </div>
            ) : null}
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
