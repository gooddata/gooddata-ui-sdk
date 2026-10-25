// (C) 2020-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type GdcAdCommandType } from "@gooddata/sdk-embedding";

import { reportExecutionStarted } from "../../actions/report_actions.js";
import { enableNewInsightChangedPostMessageEvent } from "../../selectors/feature_flag_selector.js";
import { getInsightForCreateViaMd } from "../../selectors/insight_selectors.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { extendedReferencePointApplied } from "../../store/buckets/buckets_operation_events.js";
import { insightChanged } from "../outgoing/insight_changed_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { handleExecutionStarted } from "./insight_changed_saga.js";
import { emptyInsightDefinition } from "./mocks.test.helpers.js";

const reportExecutionStartedAction = reportExecutionStarted("test", 0);

/**
 * The APPLIED event, not the trigger. This handler reads the insight back out of the store, and
 * since the buckets cascades became saga operations the trigger writes nothing — keying on it would notify
 * the host with the previous insight.
 */
const extendedReferencePointAppliedAction = extendedReferencePointApplied({
    extendedReferencePoint: {},
    buckets: [],
    sortItems: undefined,
    filterBar: undefined,
    referencePoint: undefined,
    isVisualizationMdObjectValid: true,
});

describe("handleExecutionStarted", () => {
    it("should send insightChanged post message in embedded mode", () => {
        const commands: GdcAdCommandType[] = [];

        return expectSaga(handleExecutionStarted, reportExecutionStartedAction)
            .provide([
                [select(getIsEmbedded), true],
                [select(getInsightForCreateViaMd), emptyInsightDefinition],
                [select(availableCommandsSelector), commands],
                [select(enableNewInsightChangedPostMessageEvent), false],
            ])
            .call(insightChanged, commands, emptyInsightDefinition)
            .run();
    });

    it("should send insightChanged post message in embedded mode when new event FF is true", () => {
        const commands: GdcAdCommandType[] = [];

        return expectSaga(handleExecutionStarted, extendedReferencePointAppliedAction)
            .provide([
                [select(getIsEmbedded), true],
                [select(getInsightForCreateViaMd), emptyInsightDefinition],
                [select(availableCommandsSelector), commands],
                [select(enableNewInsightChangedPostMessageEvent), true],
            ])
            .call(insightChanged, commands, emptyInsightDefinition)
            .run();
    });

    it("should do nothing when not in embedded mode", () => {
        const commands: GdcAdCommandType[] = [];

        return expectSaga(handleExecutionStarted, reportExecutionStartedAction)
            .provide([[select(getIsEmbedded), false]])
            .not.call(insightChanged, commands, emptyInsightDefinition)
            .run();
    });
});
