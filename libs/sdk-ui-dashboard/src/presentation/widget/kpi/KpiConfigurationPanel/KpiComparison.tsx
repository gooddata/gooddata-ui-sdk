// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import {
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
    IKpiWidget,
    widgetRef,
} from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";
import { KpiComparisonTypeDropdown } from "./KpiComparisonTypeDropdown";
import { changeKpiWidgetComparison, useDashboardDispatch } from "../../../../model";
import { KpiComparisonDirectionDropdown } from "./KpiComparisonDirectionDropdown";

interface IKpiComparisonProps {
    widget: IKpiWidget;
}

export const KpiComparison: React.FC<IKpiComparisonProps> = (props) => {
    const { widget } = props;

    const ref = widgetRef(widget);
    const comparisonDirection = widget.kpi.comparisonDirection;
    const comparisonType = widget.kpi.comparisonType;
    const isEnabled = !!widget.kpi.metric;

    const classes = cx({ "is-disabled": !isEnabled });
    const dispatch = useDashboardDispatch();

    const handleComparisonTypeChanged = useCallback(
        (newComparisonType: IKpiComparisonTypeComparison) => {
            dispatch(
                changeKpiWidgetComparison(ref, {
                    comparisonDirection,
                    comparisonType: newComparisonType,
                }),
            );
        },
        [dispatch, ref, comparisonDirection],
    );

    const handleComparisonDirectionChanged = useCallback(
        (newComparisonDirection: IKpiComparisonDirection) => {
            dispatch(
                changeKpiWidgetComparison(ref, {
                    comparisonType,
                    comparisonDirection: newComparisonDirection,
                }),
            );
        },
        [dispatch, ref, comparisonType],
    );

    return (
        <div>
            <Typography tagName="h3" className={classes}>
                <FormattedMessage id="configurationPanel.comparison" />
            </Typography>
            {isEnabled && (
                <div>
                    <FormattedMessage id="configurationPanel.compareWith" tagName="label" />
                    <KpiComparisonTypeDropdown
                        comparisonType={comparisonType}
                        onComparisonTypeChanged={handleComparisonTypeChanged}
                    />
                    {!!comparisonDirection && (
                        <KpiComparisonDirectionDropdown
                            comparisonDirection={comparisonDirection}
                            onComparisonDirectionChanged={handleComparisonDirectionChanged}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
