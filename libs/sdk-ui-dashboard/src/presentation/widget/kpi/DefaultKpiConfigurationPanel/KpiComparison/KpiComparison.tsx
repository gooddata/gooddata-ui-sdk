// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import {
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
    IKpiWidget,
    widgetRef,
} from "@gooddata/sdk-model";
import { changeKpiWidgetComparison, useDashboardDispatch } from "../../../../../model/index.js";
import { KpiComparisonTypeDropdown } from "./KpiComparisonTypeDropdown.js";
import { KpiComparisonDirectionDropdown } from "./KpiComparisonDirectionDropdown.js";

interface IKpiComparisonProps {
    widget: IKpiWidget;
}

export const KpiComparison: React.FC<IKpiComparisonProps> = (props) => {
    const { widget } = props;

    const ref = widgetRef(widget);
    const comparisonDirection = widget.kpi.comparisonDirection;
    const comparisonType = widget.kpi.comparisonType;

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
    );
};
