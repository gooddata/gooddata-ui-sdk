// (C) 2020 GoodData Corporation
import React, { useState } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";

import { selectLocale, selectWidgetByRef, useDashboardSelector } from "../../../model";
import { DrillStep, OnDashboardDrill, getDrillDownAttributeTitle } from "../../../drill";
import { IDrillDownDefinition, isDrillDownDefinition } from "../../../types";
import { IDefaultDashboardInsightProps } from "../types";

import { DefaultDashboardInsightWithDrillSelect } from "./DefaultDashboardInsightWithDrillSelect";
import { InsightDrillDialog } from "./InsightDrillDialog";

/**
 * @internal
 */
export const DefaultDashboardInsightWithDrillDialog = (props: IDefaultDashboardInsightProps): JSX.Element => {
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
