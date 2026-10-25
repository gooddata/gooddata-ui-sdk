// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { appFinishedLoading } from "../../actions/app_context_actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { listeningForDrillableItems } from "../outgoing/drillable_items_events.js";

import { appReadinessChange } from "./listening_drillable_items_saga.js";

describe("appReadinessChange", () => {
    it("should fire postMessage", () => {
        const action = appFinishedLoading();
        return expectSaga(appReadinessChange, action)
            .provide([
                [select(getIsEmbedded), true],
                [call(listeningForDrillableItems), undefined],
            ])
            .silentRun();
    });
});
