// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useState } from "react";

import { isIdentifierRef } from "@gooddata/sdk-model";
import { type IDrillEventContext, createFocusHighchartsDatapointEvent } from "@gooddata/sdk-ui";

import { DashboardInsightWithDrillSelect } from "./Insight/DashboardInsightWithDrillSelect.js";
import { InsightDrillDialog } from "./InsightDrillDialog/InsightDrillDialog.js";
import { KdaDialogController } from "../../../../kdaDialog/internal.js";
import {
    selectCatalogAttributeDisplayFormsById,
    selectEnableDrilledTooltip,
    selectLocale,
    selectObjectAvailabilityConfig,
    selectSeparators,
    useDashboardSelector,
} from "../../../../model/index.js";
import { type IDrillDownDefinition, isDrillDownDefinition } from "../../../../types.js";
import {
    type DrillStep,
    type KeyDriveInfo,
    type OnDashboardDrill,
    type OnDrillDownSuccess,
    type OnDrillToInsightSuccess,
    type OnKeyDriverAnalysisSuccess,
    getDrillDownTitle,
} from "../../../drill/index.js";
import { type IDashboardInsightProps } from "../types.js";

type IReturnFocusInfo =
    | { type: "chart"; chartId: string; seriesIndex: number; pointIndex: number }
    | { type: "table"; element: HTMLElement | null };

/**
 * @internal
 */
export function DashboardInsightWithDrillDialog(props: IDashboardInsightProps): ReactElement {
    const [drillSteps, setDrillSteps] = useState<DrillStep[]>([]);
    const activeDrillStep = drillSteps.at(-1);
    const insight = activeDrillStep?.insight;
    const widget = props.widget;
    const separators = useDashboardSelector(selectSeparators);
    const attributeDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayFormsById);
    const enableDrillDescription = useDashboardSelector(selectEnableDrilledTooltip);

    const breadcrumbs = useMemo(
        () =>
            drillSteps
                .filter((s) => isDrillDownDefinition(s.drillDefinition))
                .map(
                    (s) =>
                        getDrillDownTitle(
                            s.drillDefinition as IDrillDownDefinition,
                            s.drillEvent,
                            widget.drillDownIntersectionIgnoredAttributes,
                            attributeDisplayForms[
                                isIdentifierRef(s.drillDefinition.target)
                                    ? s.drillDefinition.target.identifier
                                    : s.drillDefinition.target.uri
                            ],
                        ) ?? "NULL", // TODO localize this? drilldown is currently only on bear and that does not support nulls anyway
                ),
        [drillSteps, attributeDisplayForms, widget.drillDownIntersectionIgnoredAttributes],
    );

    const locale = useDashboardSelector(selectLocale);
    const objectAvailability = useDashboardSelector(selectObjectAvailabilityConfig);

    const setNextDrillStep = useCallback((drillStep: DrillStep) => {
        setDrillSteps((s) => [...s, drillStep]);
    }, []);

    const [returnFocusInfo, setReturnFocusInfo] = useState<null | IReturnFocusInfo>(null);

    const returnFocusToInsight = useCallback(
        (force?: boolean) => {
            const isNavigatingByKeyboard = force || document.querySelector(":focus-visible") !== null;

            if (!returnFocusInfo || !isNavigatingByKeyboard) {
                return;
            }

            if (returnFocusInfo.type === "chart") {
                window.dispatchEvent(createFocusHighchartsDatapointEvent(returnFocusInfo));
            }
            if (returnFocusInfo.type === "table") {
                returnFocusInfo.element?.focus();
            }

            setReturnFocusInfo(null);
        },
        [returnFocusInfo],
    );

    const goBack = useCallback(() => setDrillSteps(([firstDrill]) => [firstDrill]), []);
    const onClose = useCallback(() => {
        returnFocusToInsight();

        setDrillSteps([]);
    }, [returnFocusToInsight]);

    const storeDatapointInfo = useCallback((drillContext: IDrillEventContext) => {
        // TABLE
        if (drillContext.type === "table") {
            setReturnFocusInfo({ type: "table", element: document.activeElement as HTMLElement });
            return;
        }

        // CHART
        const { chartId, seriesIndex, pointIndex } = drillContext;

        if (chartId === undefined || seriesIndex === undefined || pointIndex === undefined) {
            return;
        }

        setReturnFocusInfo({ type: "chart", chartId, seriesIndex, pointIndex });
    }, []);

    const onDrillDown = useCallback<OnDrillDownSuccess>(
        (evt) => setNextDrillStep(evt.payload),
        [setNextDrillStep],
    );
    const onDrillToInsight = useCallback<OnDrillToInsightSuccess>(
        (evt) => setNextDrillStep(evt.payload),
        [setNextDrillStep],
    );
    const onDrillStart = useCallback<OnDashboardDrill>(
        (evt) => storeDatapointInfo(evt.payload.drillEvent.drillContext),
        [storeDatapointInfo],
    );

    const [keyDriveInfo, setKeyDriveInfo] = useState<KeyDriveInfo | undefined>(undefined);
    const onKeyDriverAnalysisSuccess = useCallback<OnKeyDriverAnalysisSuccess>((evt) => {
        setKeyDriveInfo(evt.payload);
    }, []);
    const onCloseKeyDriverAnalysis = useCallback(() => {
        returnFocusToInsight();
        setKeyDriveInfo(undefined);
    }, [returnFocusToInsight]);

    const onRequestedDefinitionChange = useCallback(
        (definition: KeyDriveInfo["keyDriveDefinition"] | undefined) => {
            // Keep the drill-derived state in sync with the controller
            if (!definition) {
                setKeyDriveInfo(undefined);
                return;
            }
            setKeyDriveInfo((prev) => (prev ? { ...prev, keyDriveDefinition: definition } : prev));
        },
        [],
    );

    return (
        <>
            <DashboardInsightWithDrillSelect
                {...props}
                onDrillDown={onDrillDown}
                onDrillToInsight={onDrillToInsight}
                onKeyDriverAnalysisSuccess={onKeyDriverAnalysisSuccess}
                drillStep={activeDrillStep}
                returnFocusToInsight={returnFocusToInsight}
                onDrillStart={onDrillStart}
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
                    enableDrillDescription={enableDrillDescription}
                    drillStep={activeDrillStep}
                    returnFocusToInsight={returnFocusToInsight}
                    onDrillStart={onDrillStart}
                />
            ) : null}
            <KdaDialogController
                requestedDefinition={keyDriveInfo?.keyDriveDefinition}
                separators={separators}
                showCloseButton
                includeTags={objectAvailability?.includeObjectsWithTags}
                excludeTags={objectAvailability?.excludeObjectsWithTags}
                onRequestedDefinitionChange={onRequestedDefinitionChange}
                onClose={onCloseKeyDriverAnalysis}
            />
        </>
    );
}
