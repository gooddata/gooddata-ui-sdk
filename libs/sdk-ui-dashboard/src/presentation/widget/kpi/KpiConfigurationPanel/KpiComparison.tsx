// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { IKpiComparisonDirection, IKpiComparisonTypeComparison, ObjRef } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";
import { KpiComparisonTypeDropdown } from "./KpiComparisonTypeDropdown";
import { changeKpiWidgetComparison, useDashboardDispatch } from "../../../../model";
import { KpiComparisonDirectionDropdown } from "./KpiComparisonDirectionDropdown";

interface IKpiComparisonProps {
    isEnabled: boolean;
    comparisonDirection: IKpiComparisonDirection;
    comparisonType: IKpiComparisonTypeComparison;
    widgetRef: ObjRef;
}

export const KpiComparison: React.FC<IKpiComparisonProps> = (props) => {
    const { isEnabled, comparisonDirection, comparisonType, widgetRef } = props;
    const classes = cx({ "is-disabled": !isEnabled });
    const dispatch = useDashboardDispatch();

    const handleComparisonTypeChanged = useCallback(
        (newComparisonType: IKpiComparisonTypeComparison) => {
            dispatch(
                changeKpiWidgetComparison(widgetRef, {
                    comparisonDirection,
                    comparisonType: newComparisonType,
                }),
            );
        },
        [dispatch, widgetRef, comparisonDirection],
    );

    const handleComparisonDirectionChanged = useCallback(
        (newComparisonDirection: IKpiComparisonDirection) => {
            dispatch(
                changeKpiWidgetComparison(widgetRef, {
                    comparisonType,
                    comparisonDirection: newComparisonDirection,
                }),
            );
        },
        [dispatch, widgetRef, comparisonType],
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
