// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { InsightDrillDialog } from "../drill/DrillDialog/InsightDrillDialog";
import { DrillStep, OnDashboardDrill } from "../drill/interfaces";
import { DashboardInsightProps } from "./types";
import last from "lodash/last";
import { DefaultDashboardInsightWithDrillSelect } from "./DefaultDashboardInsightWithDrillSelect";
import { getDrillDownAttributeTitle } from "../drill/utils/drillDownUtils";
import { isDrillDownDefinition, IDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import { useDashboardSelector } from "../model/state/dashboardStore";
import { selectLocale, selectWidgetByRef } from "../model";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export const DefaultDashboardInsightWithDrillDialog = (props: DashboardInsightProps): JSX.Element => {
    const [drillSteps, setDrillSteps] = useState<DrillStep[]>([]);
    const activeDrillStep = last(drillSteps);
    const insight = activeDrillStep?.insight;

    const breadcrumbs = drillSteps
        .filter((s) => isDrillDownDefinition(s.drillDefinition))
        .map((s) => getDrillDownAttributeTitle(s.drillDefinition as IDrillDownDefinition, s.drillEvent));

    const widget = useDashboardSelector(selectWidgetByRef(activeDrillStep?.drillEvent.widgetRef)) as
        | IInsightWidget
        | undefined;

    const locale = useDashboardSelector(selectLocale);

    const setNextDrillStep = (drillStep: DrillStep) => {
        setDrillSteps((s) => [...s, drillStep]);
    };

    const goBack = () => setDrillSteps(([firstDrill]) => [firstDrill]);
    const onClose = () => setDrillSteps([]);
    const onDrill: OnDashboardDrill = (drillEvent, drillContext) => {
        props.onDrill?.(drillEvent, drillContext);
    };

    return (
        <>
            <DefaultDashboardInsightWithDrillSelect
                {...props}
                onDrillDown={setNextDrillStep}
                onDrillToInsight={setNextDrillStep}
                onDrill={onDrill}
            />
            {activeDrillStep && (
                <InsightDrillDialog
                    locale={locale}
                    breadcrumbs={breadcrumbs}
                    widget={widget!}
                    insight={insight!}
                    onDrill={onDrill}
                    onDrillDown={setNextDrillStep}
                    onDrillToInsight={setNextDrillStep}
                    onBackButtonClick={goBack}
                    onClose={onClose}
                />
            )}
        </>
    );
};
