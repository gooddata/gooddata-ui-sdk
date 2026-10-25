// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import {
    type AdOpenInsightCommandData,
    GdcAdCommandType,
    GdcProductName,
    type IAdOpenInsightCommandBody,
    type IObjectMeta,
    type IPostMessageContextPayload,
} from "@gooddata/sdk-embedding";

import { resetApplication } from "../../actions/app_context_actions.js";
import { type IOpenReportFailedAction, type IOpenReportFinishedAction } from "../../actions/open_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { DEFAULT_REPORT_ID, defaultRouteParams } from "../../constants/route_params.js";
import { getInsightForCreateViaMd } from "../../selectors/insight_selectors.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { isResetDisabledSelector } from "../../selectors/reset_button_selector.js";
import { type IOpenReportResult } from "../../store/report/open_report_operation.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { type ICustomRouteParams } from "../../typings/location.js";
import { getRouteUri, setLocation } from "../../utils/location.js";
import {
    openInsightFailed,
    openInsightFinished,
    openInsightRequested,
} from "../actions/open_insight_actions.js";
import { DEFAULT_POST_MESSAGE_CONTEXT_ID } from "../actions/post_message_action_helper.js";
import { setPostMessageContext } from "../actions/set_post_message_context_actions.js";
import { insightOpened } from "../outgoing/open_insight_events.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";
import {
    availableCommandsSelector,
    getPostMessageContext,
} from "../state/selectors/post_message_context_selector.js";

import { emptyInsightDefinition } from "./mocks.test.helpers.js";
import { handleOpenInsightFailed, handleOpenInsightFinished, openInsight } from "./open_insight_saga.js";

describe("Open Insight saga", () => {
    const projectId = "foo";
    const insightId = "123";
    const contextId = "contextId";
    const postMessageContext: IPostMessageContextPayload = {
        postMessageContext: {
            contextId,
        },
    };

    const getCommandData = (
        commandBody: IAdOpenInsightCommandBody,
        contextId?: string,
    ): AdOpenInsightCommandData => {
        return {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: {
                    name: GdcAdCommandType.OpenInsight,
                    data: commandBody,
                    contextId,
                },
            },
        };
    };

    it("should redirect to target insight", async () => {
        const commandBody: IAdOpenInsightCommandBody = { projectId, insightId };
        const routeParams: ICustomRouteParams = { projectId, reportId: insightId };
        const uri = `/analyze/#/${projectId}/obj/${insightId}`;

        const saga: RunResult = await expectSaga(
            openInsight,
            openInsightRequested(getCommandData(commandBody)),
        )
            .provide([
                [select(getRouteUri, { ...defaultRouteParams, ...routeParams }), uri],
                [select(isResetDisabledSelector), false],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(resetApplication()),
            put(setPostMessageContext(DEFAULT_POST_MESSAGE_CONTEXT_ID)),
        ]);
        expect(saga.effects.call).toEqual([call(setLocation, uri)]);
    });

    it("should open new insight if default report id was passed", async () => {
        const commandBody: IAdOpenInsightCommandBody = { projectId, insightId: DEFAULT_REPORT_ID };
        const routeParams: ICustomRouteParams = { projectId, reportId: DEFAULT_REPORT_ID };
        const uri = `/analyze/#/${projectId}/obj/${DEFAULT_REPORT_ID}`;

        const saga: RunResult = await expectSaga(
            openInsight,
            openInsightRequested(getCommandData(commandBody)),
        )
            .provide([
                [select(getRouteUri, { ...defaultRouteParams, ...routeParams }), uri],
                [select(isResetDisabledSelector), false],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(resetApplication()),
            put(setPostMessageContext(DEFAULT_POST_MESSAGE_CONTEXT_ID)),
        ]);
        expect(saga.effects.call).toEqual([call(setLocation, uri)]);
    });

    it("should fail without navigation when the command has no projectId", async () => {
        const commandBody: IAdOpenInsightCommandBody = { insightId };

        const saga: RunResult = await expectSaga(
            openInsight,
            openInsightRequested(getCommandData(commandBody)),
        ).run();
        expect(saga.effects.put).toEqual([put(openInsightFailed(DEFAULT_POST_MESSAGE_CONTEXT_ID))]);
        expect(saga.effects.call).toBeUndefined();
    });

    it("should not reset application if reset action is disabled", async () => {
        const commandBody: IAdOpenInsightCommandBody = { projectId, insightId: DEFAULT_REPORT_ID };
        const routeParams: ICustomRouteParams = { projectId, reportId: DEFAULT_REPORT_ID };
        const uri = `/analyze/#/${projectId}/obj/${DEFAULT_REPORT_ID}`;

        const saga: RunResult = await expectSaga(
            openInsight,
            openInsightRequested(getCommandData(commandBody)),
        )
            .provide([
                [select(getRouteUri, { ...defaultRouteParams, ...routeParams }), uri],
                [select(isResetDisabledSelector), true],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(setPostMessageContext(DEFAULT_POST_MESSAGE_CONTEXT_ID)),
            //put(push(uri)),
        ]);
    });

    it("should remove excludeObjectsWithTags if includeObjectsWithTags is existing", async () => {
        const commandBody: IAdOpenInsightCommandBody = {
            projectId,
            insightId,
            includeObjectsWithTags: "[a]",
            excludeObjectsWithTags: "[b]",
        };
        const routeParams: ICustomRouteParams = {
            projectId,
            reportId: insightId,
            includeObjectsWithTags: "[a]",
            excludeObjectsWithTags: "[b]",
        };
        const uri = `/analyze/#/${projectId}/obj/${insightId}?includeObjectsWithTags=[a]`;

        const saga: RunResult = await expectSaga(
            openInsight,
            openInsightRequested(getCommandData(commandBody)),
        )
            .provide([
                [
                    select(getRouteUri, {
                        ...defaultRouteParams,
                        ...routeParams,
                        excludeObjectsWithTags: null,
                    }),
                    uri,
                ],
                [select(isResetDisabledSelector), false],
            ])
            .run();
        expect(saga.effects.put).toEqual([
            put(resetApplication()),
            put(setPostMessageContext(DEFAULT_POST_MESSAGE_CONTEXT_ID)),
        ]);
        expect(saga.effects.call).toEqual([call(setLocation, uri)]);
    });

    it("should keep postmessage context to retrieve later", async () => {
        const commandBody: IAdOpenInsightCommandBody = {
            projectId,
            insightId,
        };
        const commandData: AdOpenInsightCommandData = getCommandData(commandBody, contextId);
        const routeParams: ICustomRouteParams = {
            projectId,
            reportId: insightId,
        };
        const uri = `/analyze/#/${projectId}/obj/${insightId}?includeObjectsWithTags=[a]`;

        const saga: RunResult = await expectSaga(openInsight, openInsightRequested(commandData))
            .provide([
                [
                    select(getRouteUri, {
                        ...defaultRouteParams,
                        ...routeParams,
                        excludeObjectsWithTags: null,
                    }),
                    uri,
                ],
                [select(isResetDisabledSelector), false],
            ])
            .run();
        expect(saga.effects.put).toEqual([put(resetApplication()), put(setPostMessageContext(contextId))]);
        expect(saga.effects.call).toEqual([call(setLocation, uri)]);
    });

    it("should emit an InsightOpened event", async () => {
        const insightMeta: IObjectMeta = {
            title: "insight title",
            uri: "uri",
            identifier: "identifier",
        };
        const action: IOpenReportFinishedAction = {
            type: ActionTypeKeys.OPEN_REPORT_FINISHED,
            payload: {
                isDraft: false,
                insight: newInsight("visualization/class/uri", "identifier", "uri", (i) =>
                    i.title("insight title"),
                ),
                loadedItems: {
                    allDateDatasets: {
                        available: [],
                        unavailable: 0,
                    },
                    availableDateDatasets: {
                        available: [],
                        unavailable: 0,
                    },
                    filterItems: {},
                    itemCache: {},
                    parameterFilters: [],
                    parameterWarnings: [],
                },
                time: 0,
                useDefaultClass: true,
                result: {} as IOpenReportResult,
            },
        };

        const saga: RunResult = await expectSaga(handleOpenInsightFinished, action)
            .provide([
                [select(getIsEmbedded), true],
                [select(getInsightForCreateViaMd), emptyInsightDefinition],
                [select(getPostMessageContext), postMessageContext],
                [select(availableCommandsSelector), SUPPORTED_COMMANDS],
            ])
            .silentRun();
        expect(saga.effects.put).toEqual([put(openInsightFinished(0, contextId))]);
        expect(saga.effects.call).toEqual([
            call(insightOpened, SUPPORTED_COMMANDS, insightMeta, emptyInsightDefinition, contextId),
        ]);
    });

    it("should not put openInsightFinished when isDraft is true", async () => {
        const insightMeta: IObjectMeta = {
            title: "insight title",
            uri: "uri",
            identifier: "identifier",
        };
        const action: IOpenReportFinishedAction = {
            type: ActionTypeKeys.OPEN_REPORT_FINISHED,
            payload: {
                isDraft: true,
                insight: newInsight("visualization/class/uri", "identifier", "uri", (i) =>
                    i.title("insight title"),
                ),
                loadedItems: {
                    allDateDatasets: {
                        available: [],
                        unavailable: 0,
                    },
                    availableDateDatasets: {
                        available: [],
                        unavailable: 0,
                    },
                    filterItems: {},
                    itemCache: {},
                    parameterFilters: [],
                    parameterWarnings: [],
                },
                time: 0,
                useDefaultClass: true,
                result: {} as IOpenReportResult,
            },
        };

        const saga: RunResult = await expectSaga(handleOpenInsightFinished, action)
            .provide([
                [select(getIsEmbedded), true],
                [select(getInsightForCreateViaMd), emptyInsightDefinition],
                [select(getPostMessageContext), postMessageContext],
                [select(availableCommandsSelector), SUPPORTED_COMMANDS],
            ])
            .silentRun();
        expect(saga.effects.put).toBe(undefined);
        expect(saga.effects.call).toEqual([
            call(insightOpened, SUPPORTED_COMMANDS, insightMeta, emptyInsightDefinition, contextId),
        ]);
    });

    it("should dispatch openInsightFailed action when insight is not found", async () => {
        const action: IOpenReportFailedAction = {
            type: ActionTypeKeys.OPEN_REPORT_FAILED,
            payload: {
                isDraft: false,
                reset: { sessionId: "fresh", defaultVisualizationClass: null },
            },
        };
        const saga: RunResult = await expectSaga(handleOpenInsightFailed, action)
            .provide([[select(getPostMessageContext), postMessageContext]])
            .silentRun();
        expect(saga.effects.put).toEqual([put(openInsightFailed(contextId, true))]);
    });

    it("should not put openInsightFailed when isDraft is true", async () => {
        const action: IOpenReportFailedAction = {
            type: ActionTypeKeys.OPEN_REPORT_FAILED,
            payload: {
                isDraft: true,
                reset: { sessionId: "fresh", defaultVisualizationClass: null },
            },
        };
        const saga: RunResult = await expectSaga(handleOpenInsightFailed, action).silentRun();
        expect(saga.effects.put).toBe(undefined);
    });
});
