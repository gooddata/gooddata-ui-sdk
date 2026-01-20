// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { type IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    type IAutomationMetadataObject,
    type IExecutionDefinition,
    type IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
    insightRef,
    isObjRef,
} from "@gooddata/sdk-model";
import { fillMissingTitles, resolveMessages } from "@gooddata/sdk-ui";

import { prepareCsvRawExecutionDefinition } from "./csvRawExecutionDefinition.js";
import { type ISaveScheduledEmail } from "../../commands/scheduledEmail.js";
import { type IDashboardScheduledEmailSaved, scheduledEmailSaved } from "../../events/scheduledEmail.js";
import { selectLocale } from "../../store/config/configSelectors.js";
import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";
import { selectAutomationCommonDateFilterId } from "../../store/filtering/dashboardFilterSelectors.js";
import {
    selectInsightByRef,
    selectInsightByWidgetRef,
    selectRawExportOverridesForInsight,
} from "../../store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

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
    cmd: ISaveScheduledEmail,
): SagaIterator<IDashboardScheduledEmailSaved> {
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

    const widget: ReturnType<ReturnType<typeof selectWidgetByRef>> = yield select(selectWidgetByRef(ref));
    const commonDateFilterId: ReturnType<typeof selectAutomationCommonDateFilterId> = yield select(
        selectAutomationCommonDateFilterId,
    );

    const insight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
        selectInsightByWidgetRef(ref),
    );

    const locale = yield select(selectLocale);
    const messages = yield call(resolveMessages, locale);
    const lookupInsight = insight ? yield select(selectInsightByRef(insightRef(insight))) : undefined;
    const filledInsight = lookupInsight
        ? yield call(fillMissingTitles, lookupInsight, locale, messages)
        : undefined;

    const overrides: ReturnType<ReturnType<typeof selectRawExportOverridesForInsight>> = filledInsight
        ? yield select(selectRawExportOverridesForInsight(filledInsight))
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

    yield call(saveScheduledEmail, ctx, scheduledEmail, preparedExecutionDefinitionWithFilters, overrides);

    return scheduledEmailSaved(ctx, cmd.correlationId);
}
