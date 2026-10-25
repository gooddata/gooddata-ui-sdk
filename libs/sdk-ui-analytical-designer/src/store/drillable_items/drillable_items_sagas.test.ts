// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { type IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { type IHeaderPredicate } from "@gooddata/sdk-ui";
import { DrillablePredicatesUtils } from "@gooddata/sdk-ui-ext/internal";

import { conversionDone, conversionInit } from "../../actions/drillable_items_actions.js";
import { bearLegacyFunctions } from "../../bearLegacyFunctions.js";
import { initialState } from "../../reducers/initial_state.js";
import { convertDrillableItems } from "../../sagas/drillable_items_sagas.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { logDrillableItemsReceived } from "../../services/telemetry/tracking_events.js";

describe("convertDrillableItems", () => {
    it("should convert drillable items uris and ids", () => {
        const state = initialState;
        const action = conversionInit({
            uris: [],
            identifiers: [],
        });
        const projectId = "projectId";
        const sanitized: IDrillableItemsCommandBody = {
            uris: [],
            composedFrom: { uris: [] },
        };
        const converted: IHeaderPredicate[] = [];
        return expectSaga(convertDrillableItems, action)
            .provide([
                [select(), state],
                [select(getProjectId), projectId],
                [call(logDrillableItemsReceived, { state }), undefined],
                [
                    call(
                        bearLegacyFunctions.sanitizeDrillingActivationPostMessageData,
                        projectId,
                        action.payload,
                    ),
                    sanitized,
                ],
                [
                    call(DrillablePredicatesUtils.convertPostMessageToDrillablePredicates, action.payload),
                    converted,
                ],
            ])
            .put(conversionDone(converted))
            .silentRun();
    });
});
