// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExecutionDefinition,
    IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    insightRef,
} from "@gooddata/sdk-model";

import { prepareCsvRawExecutionDefinition } from "./csvRawExecutionDefinition.js";
import { CreateScheduledEmail } from "../../commands/scheduledEmail.js";
import { DashboardScheduledEmailCreated, scheduledEmailCreated } from "../../events/scheduledEmail.js";
import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";
import { selectAutomationCommonDateFilterId } from "../../store/filtering/dashboardFilterSelectors.js";
import {
    selectInsightByWidgetRef,
    selectRawExportOverridesForInsightByRef,
} from "../../store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function createScheduledEmail(
    ctx: DashboardContext,
    scheduledEmail: IAutomationMetadataObjectDefinition,
    preparedExecutionDefinition?: IExecutionDefinition,
    overrides?: IRawExportCustomOverrides,
): Promise<IAutomationMetadataObject> {
    const { backend, workspace } = ctx;

    return backend
        .workspace(workspace)
        .automations()
        .createAutomation(scheduledEmail, undefined, preparedExecutionDefinition, overrides);
}

export function* createScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: CreateScheduledEmail,
): SagaIterator<DashboardScheduledEmailCreated> {
    const csvRawRequest = cmd.payload.scheduledEmail.exportDefinitions?.find(
        (def) => def.requestPayload.format === "CSV_RAW",
    )?.requestPayload as IExportDefinitionVisualizationObjectRequestPayload;

    const widgetId = csvRawRequest?.content?.widget;
    const ref = widgetId ? idRef(widgetId) : undefined;
    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    const preparedExecutionDefinition = executionEnvelope?.executionResult?.definition;

    const widget: ReturnType<ReturnType<typeof selectWidgetByRef>> = yield select(selectWidgetByRef(ref));
    const commonDateFilterId: ReturnType<typeof selectAutomationCommonDateFilterId> = yield select(
        selectAutomationCommonDateFilterId,
    );

    const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
        selectInsightByWidgetRef(ref),
    );

    const overrides: ReturnType<ReturnType<typeof selectRawExportOverridesForInsightByRef>> = insight
        ? yield select(selectRawExportOverridesForInsightByRef(insightRef(insight)))
        : undefined;

    if (csvRawRequest && widgetId) {
        if (!preparedExecutionDefinition) {
            throw new Error("CSV raw widget attachment requires an available execution.");
        }
        if (!widget) {
            throw new Error("CSV raw widget attachment requires an available widget.");
        }
    }

    const preparedExecutionDefinitionWithFilters = prepareCsvRawExecutionDefinition(
        preparedExecutionDefinition,
        csvRawRequest,
        insight,
        widget,
        commonDateFilterId,
    );

    const scheduledEmail: PromiseFnReturnType<typeof createScheduledEmail> = yield call(
        createScheduledEmail,
        ctx,
        cmd.payload.scheduledEmail,
        preparedExecutionDefinitionWithFilters,
        overrides,
    );

    return scheduledEmailCreated(ctx, scheduledEmail, cmd.correlationId);
}
