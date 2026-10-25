// (C) 2021-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { describe, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    changeBucketItemDisplayForm,
    setBucketItemShowInPercent,
    storeBucketItemDisplayForm,
    storeSetBucketItemShowInPercent,
} from "../actions/buckets_actions.js";

import { watchBuckets } from "./bucket_saga.js";

describe("bucket_saga", () => {
    describe("UI_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT", () => {
        it("should put expected action", () => {
            const localIdentifier = "id";
            const value = true;
            const action = setBucketItemShowInPercent(localIdentifier, value);

            return expectSaga(watchBuckets)
                .put(storeSetBucketItemShowInPercent(localIdentifier, value))
                .dispatch(action)
                .silentRun();
        });
    });

    describe("UI_BUCKETS_CHANGE_BUCKET_ITEM_DISPLAY_FORM", () => {
        it("should put expected action", () => {
            const displayForm = idRef("id");
            const localIdentifier = "f1";
            const action = changeBucketItemDisplayForm(localIdentifier, displayForm);

            return expectSaga(watchBuckets)
                .put(storeBucketItemDisplayForm(localIdentifier, displayForm))
                .dispatch(action)
                .silentRun();
        });
    });
});
