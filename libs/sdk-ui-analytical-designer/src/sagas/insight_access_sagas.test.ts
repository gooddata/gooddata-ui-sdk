// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IObjectShareDraft, applyObjectShareDraft } from "@gooddata/sdk-ui-ext";

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

import { applyDraftedInsightAccess, refreshInsightPermissions } from "./insight_access_sagas.js";
import { getInsight } from "./open_report_sagas.js";

const workspaceDraft: IObjectShareDraft = {
    granteeEdits: {},
    ruleEdit: { generalAccess: "WORKSPACE", level: "VIEW", pending: false },
};
const apply = call(applyObjectShareDraft, backend, "ws", insightPermissionsTarget("bars"), workspaceDraft);

describe("applyDraftedInsightAccess", () => {
    it("does nothing without a draft", () => {
        return expectSaga(applyDraftedInsightAccess, "ws", "bars")
            .provide([[select(getInsightAccessDraft), undefined]])
            .not.put(insightAccessDraftApplied())
            .not.call.fn(applyObjectShareDraft)
            .silentRun();
    });

    it("drops the draft and writes it to the created visualization", () => {
        return expectSaga(applyDraftedInsightAccess, "ws", "bars")
            .provide([
                [select(getInsightAccessDraft), workspaceDraft],
                [apply, true],
            ])
            .put(insightAccessDraftApplied())
            .call(applyObjectShareDraft, backend, "ws", insightPermissionsTarget("bars"), workspaceDraft)
            .not.put.like({ action: { type: addMessage.type } })
            .silentRun();
    });

    it("reports a refused write, still dropping the draft", () => {
        return expectSaga(applyDraftedInsightAccess, "ws", "bars")
            .provide([
                [select(getInsightAccessDraft), workspaceDraft],
                [apply, false],
            ])
            .put(insightAccessDraftApplied())
            .put(addMessage({ translationKey: "insightAccess.applyFailed", type: "error" }))
            .silentRun();
    });
});

describe("refreshInsightPermissions", () => {
    it("stores the visualization's current permissions", () => {
        return expectSaga(refreshInsightPermissions, insightShareDialogClosed("bars"))
            .provide([
                [select(getProjectId), "ws"],
                [call(getInsight, "ws", "bars"), { insight: { insight: { permissions: ["VIEW"] } } }],
            ])
            .put(savedInsightPermissionsLoaded("bars", ["VIEW"]))
            .silentRun();
    });

    it("keeps the known permissions when the read fails", () => {
        return expectSaga(refreshInsightPermissions, insightShareDialogClosed("bars"))
            .provide([
                [select(getProjectId), "ws"],
                [call(getInsight, "ws", "bars"), throwError(new Error("500"))],
            ])
            .not.put.like({ action: { type: savedInsightPermissionsLoaded.type } })
            .silentRun();
    });
});
