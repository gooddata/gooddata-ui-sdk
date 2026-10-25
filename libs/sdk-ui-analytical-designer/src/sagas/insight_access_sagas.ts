// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select, takeLatest } from "redux-saga/effects";

import { applyObjectShareDraft } from "@gooddata/sdk-ui-ext";

import {
    insightAccessDraftApplied,
    insightShareDialogClosed,
    savedInsightPermissionsLoaded,
} from "../actions/insight_access_actions.js";
import { addMessage } from "../actions/messages_actions.js";
import { backend } from "../backend.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { insightPermissionsTarget } from "../selectors/insight_access_selector.js";
import { getInsightAccessDraft } from "../store/insight_access/insight_access_selectors.js";
import { logError } from "../utils/logging/error_logging.js";

import { getInsight } from "./open_report_sagas.js";

const messages = defineMessages({
    applyFailed: { id: "insightAccess.applyFailed" },
});

// The draft is dropped whatever the outcome, so the next save cannot send it again.
export function* applyDraftedInsightAccess(projectId: string, identifier: string): SagaIterator<void> {
    const draft: ReturnType<typeof getInsightAccessDraft> = yield select(getInsightAccessDraft);
    if (!draft) {
        return;
    }
    yield put(insightAccessDraftApplied());

    const applied: boolean = yield call(
        applyObjectShareDraft,
        backend,
        projectId,
        insightPermissionsTarget(identifier),
        draft,
    );
    if (!applied) {
        yield put(addMessage({ translationKey: messages.applyFailed.id, type: "error" }));
    }
}

export function* refreshInsightPermissions({
    payload: { identifier },
}: ReturnType<typeof insightShareDialogClosed>): SagaIterator<void> {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    try {
        const { insight }: SagaReturnType<typeof getInsight> = yield call(getInsight, projectId, identifier);
        yield put(savedInsightPermissionsLoaded(identifier, insight.insight.permissions));
    } catch (error) {
        logError("Error while refreshing the visualization permissions", error);
    }
}

export function* watchInsightAccess() {
    yield takeLatest(insightShareDialogClosed.type, refreshInsightPermissions);
}
