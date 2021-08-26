// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import last from "lodash/last";
import { selectLocale, useDashboardSelector } from "../../../../model";
import { DrillStep, getDrillDownAttributeTitle } from "../../../drill";
import { IDrillDownDefinition, isDrillDownDefinition } from "../../../../types";
import { getDrillOriginLocalIdentifier } from "../../../../_staging/drills/drillingUtils";
import { DashboardInsightWithDrillSelect } from "./Insight/DashboardInsightWithDrillSelect";
import { InsightDrillDialog } from "./InsightDrillDialog/InsightDrillDialog";
import { IDashboardInsightProps } from "../types";

/**
 * @internal
 */
export const DashboardInsightWithDrillDialog = (props: IDashboardInsightProps): JSX.Element => {
    const [drillSteps, setDrillSteps] = useState<DrillStep[]>([]);
    const activeDrillStep = last(drillSteps);
    const insight = activeDrillStep?.insight;
    const widget = props.widget;

    const breadcrumbs = drillSteps
        .filter((s) => isDrillDownDefinition(s.drillDefinition))
        .map((s) =>
            getDrillDownAttributeTitle(
                getDrillOriginLocalIdentifier(s.drillDefinition as IDrillDownDefinition),
                s.drillEvent,
            ),
        );

    const locale = useDashboardSelector(selectLocale);

    const setNextDrillStep = (drillStep: DrillStep) => {
        setDrillSteps((s) => [...s, drillStep]);
    };

    const goBack = () => setDrillSteps(([firstDrill]) => [firstDrill]);
    const onClose = () => setDrillSteps([]);

    return (
        <>
            <DashboardInsightWithDrillSelect
                {...props}
                onDrillDown={(evt) => setNextDrillStep(evt.payload)}
                onDrillToInsight={(evt) => setNextDrillStep(evt.payload)}
            />
            {activeDrillStep && (
                <InsightDrillDialog
                    locale={locale}
                    breadcrumbs={breadcrumbs}
                    widget={widget!}
                    insight={insight!}
                    onDrillDown={(evt) => setNextDrillStep(evt.payload)}
                    onBackButtonClick={goBack}
                    onClose={onClose}
                />
            )}
        </>
    );
};
