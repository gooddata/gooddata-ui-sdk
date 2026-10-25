// (C) 2020-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IObjectMeta } from "@gooddata/sdk-embedding";

import { reportExecutionFailed, reportExecutionFinished } from "../../actions/report_actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import {
    getLastSavedReportIdentifier,
    getLastSavedReportTitle,
    getLastSavedReportUri,
} from "../../selectors/report_selector.js";
import { withMdObjectMeta } from "../../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withReport } from "../../tests/state_builder.test.helpers.js";
import { insightRendered } from "../outgoing/render_insight_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { notifyInsightRendered } from "./render_insight_saga.js";

describe("Render Insight saga", () => {
    it("should notify outer app when an insight has been rendered successfully in embedded mode", async () => {
        const action = reportExecutionFinished({}, "id", 10, 20);
        const availableCommands = ["drillableItems", "openInsight"];
        const state = withReport(
            withReport(
                withReport(getInitializedState(), {
                    lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                        title: "reportTitle",
                    }),
                }),
                {
                    lastSavedObject: withMdObjectMeta(
                        withReport(getInitializedState(), {
                            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                                title: "reportTitle",
                            }),
                        }).report.lastSavedObject,
                        { uri: "/gdc/md/projectId/obj/objId" },
                    ),
                },
            ),
            {
                lastSavedObject: withMdObjectMeta(
                    withReport(
                        withReport(getInitializedState(), {
                            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                                title: "reportTitle",
                            }),
                        }),
                        {
                            lastSavedObject: withMdObjectMeta(
                                withReport(getInitializedState(), {
                                    lastSavedObject: withMdObjectMeta(
                                        getInitializedState().report.lastSavedObject,
                                        { title: "reportTitle" },
                                    ),
                                }).report.lastSavedObject,
                                { uri: "/gdc/md/projectId/obj/objId" },
                            ),
                        },
                    ).report.lastSavedObject,
                    { identifier: "reportIndentifier" },
                ),
            },
        );
        const insightMeta: IObjectMeta = {
            title: getLastSavedReportTitle(state),
            uri: getLastSavedReportUri(state),
            identifier: getLastSavedReportIdentifier(state),
        };
        await expectSaga(notifyInsightRendered, action)
            .provide([
                [select(getIsEmbedded), true],
                [select(), state],
                [select(availableCommandsSelector), availableCommands],
            ])
            .call(insightRendered, availableCommands, insightMeta, action.payload.status)
            .silentRun();
    });

    it("should notify outer app when an insight has been rendered with error in embedded mode", async () => {
        const action = reportExecutionFailed({ status: "NO_DATA" }, "id", 10, 20);
        const availableCommands = ["drillableItems", "openInsight"];
        const state = withReport(
            withReport(
                withReport(getInitializedState(), {
                    lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                        title: "reportTitle",
                    }),
                }),
                {
                    lastSavedObject: withMdObjectMeta(
                        withReport(getInitializedState(), {
                            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                                title: "reportTitle",
                            }),
                        }).report.lastSavedObject,
                        { uri: "/gdc/md/projectId/obj/objId" },
                    ),
                },
            ),
            {
                lastSavedObject: withMdObjectMeta(
                    withReport(
                        withReport(getInitializedState(), {
                            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                                title: "reportTitle",
                            }),
                        }),
                        {
                            lastSavedObject: withMdObjectMeta(
                                withReport(getInitializedState(), {
                                    lastSavedObject: withMdObjectMeta(
                                        getInitializedState().report.lastSavedObject,
                                        { title: "reportTitle" },
                                    ),
                                }).report.lastSavedObject,
                                { uri: "/gdc/md/projectId/obj/objId" },
                            ),
                        },
                    ).report.lastSavedObject,
                    { identifier: "reportIndentifier" },
                ),
            },
        );
        const insightMeta: IObjectMeta = {
            title: getLastSavedReportTitle(state),
            uri: getLastSavedReportUri(state),
            identifier: getLastSavedReportIdentifier(state),
        };
        await expectSaga(notifyInsightRendered, action)
            .provide([
                [select(getIsEmbedded), true],
                [select(), state],
                [select(availableCommandsSelector), availableCommands],
            ])
            .call(insightRendered, availableCommands, insightMeta, "NO_DATA")
            .silentRun();
    });

    it("should not notify outer app when an insight has been rendered successfully (not in embedded mode)", async () => {
        const action = reportExecutionFinished({}, "id", 10, 20);
        await expectSaga(notifyInsightRendered, action)
            .provide([[select(getIsEmbedded), false]])
            .not.call(insightRendered)
            .silentRun();
    });

    it("should not notify outer app when an insight has been rendered with error (not in embedded mode)", async () => {
        const action = reportExecutionFailed({ status: "NO_DATA" }, "id", 10, 20);
        await expectSaga(notifyInsightRendered, action)
            .provide([[select(getIsEmbedded), false]])
            .not.call(insightRendered)
            .silentRun();
    });
});
