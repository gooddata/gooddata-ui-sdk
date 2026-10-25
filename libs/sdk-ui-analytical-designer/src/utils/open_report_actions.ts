// (C) 2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";

import { openReportFailed, openReportFinished } from "../actions/open_actions.js";
import { resolveOpenReportResult } from "../sagas/open_report_sagas.js";
import { buildApplicationResetCarrier } from "../store/app_context/application_reset_events.js";
import { type OpenReportError } from "../store/report/report_state.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { type ILoadedReportItems, type IMissingDateFilterItem } from "../typings/report.js";

/**
 * Test builders for the open-report actions: the production creators carry the
 * operation result / reset carrier the SAGA boundary computes, so the suites build the actions
 * through the SAME boundary functions against their fixture state.
 */

export function buildOpenReportFinished(
    state: IAppState,
    insight: IInsight,
    loadedItems: ILoadedReportItems,
    time: number,
    useDefaultClass = false,
    isDraft = false,
): ReturnType<typeof openReportFinished> {
    const result = resolveOpenReportResult(state, insight, loadedItems, useDefaultClass);
    return openReportFinished(insight, loadedItems, time, useDefaultClass, result, isDraft);
}

export function buildOpenReportFailed(
    state: IAppState,
    isDraft = false,
    reason?: OpenReportError,
    missingItems?: ReadonlyArray<IMissingDateFilterItem>,
): ReturnType<typeof openReportFailed> {
    return openReportFailed(
        buildApplicationResetCarrier(getVisualizationClassesState(state)),
        isDraft,
        reason,
        missingItems,
    );
}
