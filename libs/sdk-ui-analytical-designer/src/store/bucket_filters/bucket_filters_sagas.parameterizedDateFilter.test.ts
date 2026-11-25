// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { type IUpdateDateFilterActionPayload } from "./bucket_filters_actions.js";
import {
    mapDateFilterIdToExternalDateFilter,
    postFilterContextChangedWithAvailableCommands,
    updateDateFilter,
} from "./bucket_filters_sagas.js";

describe("a date filter with a period in embedded Analytical Designer", () => {
    const payload: IUpdateDateFilterActionPayload = {
        localIdentifier: "period-filter",
        filterConfig: { type: "parameterized", parameterRef: idRef("lastQuarter", "parameter") },
        dateDatasetRef: idRef("closed", "dataSet"),
        emptyDateValuesFilter: "exclude",
    };

    it("has no external shape, so it is not told as a relative filter without bounds", () => {
        expect(mapDateFilterIdToExternalDateFilter(payload)).toBeUndefined();
    });

    it("does not post the filter context change", async () => {
        await expectSaga(updateDateFilter, payload)
            .withState(getInitializedState())
            .provide([[select(getIsEmbedded), true]])
            .not.call.fn(postFilterContextChangedWithAvailableCommands)
            .run();
    });
});
