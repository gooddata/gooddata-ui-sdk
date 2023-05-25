// (C) 2020-2022 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import last from "lodash/last.js";
import { selectLocale, useDashboardSelector } from "../../../../model/index.js";
import {
    DrillStep,
    getDrillDownAttributeTitle,
    OnDrillDownSuccess,
    OnDrillToInsightSuccess,
} from "../../../drill/index.js";
import { IDrillDownDefinition, isDrillDownDefinition } from "../../../../types.js";
import { getDrillOriginLocalIdentifier } from "../../../../_staging/drills/drillingUtils.js";
import { DashboardInsightWithDrillSelect } from "./Insight/DashboardInsightWithDrillSelect.js";
import { InsightDrillDialog } from "./InsightDrillDialog/InsightDrillDialog.js";
import { IDashboardInsightProps } from "../types.js";

/**
 * @internal
 */
export const DashboardInsightWithDrillDialog = (props: IDashboardInsightProps): JSX.Element => {
    const [drillSteps, setDrillSteps] = useState<DrillStep[]>([]);
    const activeDrillStep = last(drillSteps);
    const insight = activeDrillStep?.insight;
    const widget = props.widget;

    const breadcrumbs = useMemo(
        () =>
            drillSteps
                .filter((s) => isDrillDownDefinition(s.drillDefinition))
                .map(
                    (s) =>
                        getDrillDownAttributeTitle(
                            getDrillOriginLocalIdentifier(s.drillDefinition as IDrillDownDefinition),
                            s.drillEvent,
                        ) ?? "NULL", // TODO localize this? drilldown is currently only on bear and that does not support nulls anyway
                ),
        [drillSteps],
    );

    const locale = useDashboardSelector(selectLocale);

    const setNextDrillStep = useCallback((drillStep: DrillStep) => {
        setDrillSteps((s) => [...s, drillStep]);
    }, []);

    const goBack = useCallback(() => setDrillSteps(([firstDrill]) => [firstDrill]), []);
    const onClose = useCallback(() => setDrillSteps([]), []);
    const onDrillDown = useCallback<OnDrillDownSuccess>(
        (evt) => setNextDrillStep(evt.payload),
        [setNextDrillStep],
    );
    const onDrillToInsight = useCallback<OnDrillToInsightSuccess>(
        (evt) => setNextDrillStep(evt.payload),
        [setNextDrillStep],
    );

    return (
        <>
            <DashboardInsightWithDrillSelect
                {...props}
                onDrillDown={onDrillDown}
                onDrillToInsight={onDrillToInsight}
            />
            {activeDrillStep ? (
                <InsightDrillDialog
                    locale={locale}
                    breadcrumbs={breadcrumbs}
                    widget={widget!}
                    insight={insight!}
                    onDrillDown={onDrillDown}
                    onBackButtonClick={goBack}
                    onClose={onClose}
                />
            ) : null}
        </>
    );
};
