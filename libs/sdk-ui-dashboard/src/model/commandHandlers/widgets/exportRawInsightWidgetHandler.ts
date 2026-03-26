// (C) 2024-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IDashboardExportRawOptions,
    type IExportResult,
    type IRawExportCustomOverrides,
} from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type INullableFilter,
    defWithDimensions,
    defaultDimensionsGenerator,
    insightRef,
    newDefForInsight,
} from "@gooddata/sdk-model";
import { fillMissingTitles, resolveDefaultDisplayFormRefForDisplayForm } from "@gooddata/sdk-ui";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/filterConverters.js";
import { type IExportRawInsightWidget } from "../../commands/insight.js";
import {
    type IDashboardInsightWidgetExportResolved,
    insightWidgetExportResolved,
} from "../../events/insight.js";
import { selectCatalogAttributes } from "../../store/catalog/catalogSelectors.js";
import {
    selectExportResultPollingTimeout,
    selectLocale,
    selectSettings,
} from "../../store/config/configSelectors.js";
import { selectExecutionResultByRef } from "../../store/executionResults/executionResultsSelectors.js";
import {
    selectInsightByRef,
    selectRawExportOverridesForInsight,
} from "../../store/insights/insightsSelectors.js";
import {
    selectFilterContextFilters,
    selectPreloadedAttributesWithReferences,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { prepareGeoRawExportDefinition } from "../common/prepareGeoRawExportDefinition.js";

async function exportDashboardToCSVRaw(
    ctx: DashboardContext,
    definition: IExecutionDefinition,
    filename: string,
    overrides?: IRawExportCustomOverrides,
    options?: IDashboardExportRawOptions,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;

    return backend
        .workspace(workspace)
        .dashboards()
        .exportDashboardToCSVRaw(definition, filename, overrides, options);
}

export function* exportRawInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: IExportRawInsightWidget,
): SagaIterator<IDashboardInsightWidgetExportResolved> {
    const { ref, widget, insight, filename, options } = cmd.payload;
    const { workspace } = ctx;

    const executionEnvelope: ReturnType<ReturnType<typeof selectExecutionResultByRef>> = yield select(
        selectExecutionResultByRef(ref),
    );

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const dashboardFilters: INullableFilter[] = filterContextItemsToDashboardFiltersByWidget(
        filterContextFilters,
        widget,
    );
    const mergedFilters: INullableFilter[] = [...insight.insight.filters, ...dashboardFilters];

    const definition = defWithDimensions(
        newDefForInsight(workspace, insight, mergedFilters),
        defaultDimensionsGenerator,
    );

    const selectedInsight = yield select(selectInsightByRef(insightRef(insight)));
    const locale = yield select(selectLocale);
    const filledInsight = yield call(fillMissingTitles, selectedInsight, locale, undefined);
    const settings = yield select(selectSettings);
    const catalogAttributes = yield select(selectCatalogAttributes);
    const preloadedAttributesWithReferences = yield select(selectPreloadedAttributesWithReferences);
    const baseExecutionDefinition = executionEnvelope?.executionResult?.definition ?? definition;
    const { executionDefinition: preparedExecutionDefinition, filledInsight: preparedFilledInsight } =
        prepareGeoRawExportDefinition({
            baseExecutionDefinition,
            sourceInsight: insight,
            filledInsight,
            workspace,
            settings,
            resolveDefaultDisplayFormRef: (displayFormRef) =>
                resolveDefaultDisplayFormRefForDisplayForm(
                    displayFormRef,
                    catalogAttributes,
                    preloadedAttributesWithReferences,
                ),
        });

    const overrides: ReturnType<ReturnType<typeof selectRawExportOverridesForInsight>> = yield select(
        selectRawExportOverridesForInsight(preparedFilledInsight),
    );

    // execution definition must be defined at this point
    invariant(preparedExecutionDefinition);

    const timeout: ReturnType<typeof selectExportResultPollingTimeout> = yield select(
        selectExportResultPollingTimeout,
    );
    const effectiveTimeout = options?.timeout ?? timeout;

    const result: PromiseFnReturnType<typeof exportDashboardToCSVRaw> = yield call(
        exportDashboardToCSVRaw,
        ctx,
        preparedExecutionDefinition,
        filename,
        overrides,
        { ...options, timeout: effectiveTimeout },
    );

    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;
    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };

    return insightWidgetExportResolved(ctx, sanitizedResult, cmd.correlationId);
}
