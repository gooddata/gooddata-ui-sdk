// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IExecutionDefinition,
    IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    insightRef,
    isObjRef,
} from "@gooddata/sdk-model";

import { SaveScheduledEmail } from "../../commands/scheduledEmail.js";
import { DashboardScheduledEmailSaved, scheduledEmailSaved } from "../../events/scheduledEmail.js";
import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";
import {
    selectInsightByWidgetRef,
    selectRawExportOverridesForInsightByRef,
} from "../../store/insights/insightsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

function saveScheduledEmail(
    ctx: DashboardContext,
    scheduledEmail: IAutomationMetadataObject,
    preparedExecutionDefinition?: IExecutionDefinition,
    overrides?: IRawExportCustomOverrides,
): Promise<IAutomationMetadataObject> {
    const { backend, workspace } = ctx;
    if (!isObjRef(scheduledEmail)) {
        throw new Error("Cannot save schedule not referencing to an persisted object");
    }
    return backend
        .workspace(workspace)
        .automations()
        .updateAutomation(scheduledEmail, undefined, preparedExecutionDefinition, overrides);
}

export function* saveScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: SaveScheduledEmail,
): SagaIterator<DashboardScheduledEmailSaved> {
    const scheduledEmail = cmd.payload.scheduledEmail;
    const csvRawRequest = scheduledEmail.exportDefinitions?.find(
        (def) => def.requestPayload.format === "CSV_RAW",
    )?.requestPayload as IExportDefinitionVisualizationObjectRequestPayload;

    const widgetId = csvRawRequest?.content?.widget;
    const ref = widgetId ? idRef(widgetId) : undefined;
    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    const preparedExecutionDefinition = executionEnvelope?.executionResult?.definition;

    const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
        selectInsightByWidgetRef(ref),
    );

    const overrides: ReturnType<ReturnType<typeof selectRawExportOverridesForInsightByRef>> = insight
        ? yield select(selectRawExportOverridesForInsightByRef(insightRef(insight)))
        : undefined;

    if (csvRawRequest && widgetId && !preparedExecutionDefinition) {
        throw new Error("CSV raw widget attachment requires an available execution.");
    }

    yield call(saveScheduledEmail, ctx, scheduledEmail, preparedExecutionDefinition, overrides);

    return scheduledEmailSaved(ctx, cmd.correlationId);
}
