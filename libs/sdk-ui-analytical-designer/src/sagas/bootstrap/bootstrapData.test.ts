// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IBootstrapData } from "../../actions/app_context_actions.js";
import { backend } from "../../backend.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { bootstrapData as bootstrapDataSelector } from "../../selectors/bootstrap_selector.js";
import { getLocale } from "../../selectors/intl_selector.js";

import { backendBootstrapData } from "./backendBootstrapData.js";
import { fetchBootstrapData } from "./bootstrapData.js";

const routeParams = { projectId: "ws1", reportId: "insight-1" };
const derived = { user: { language: "de-DE" }, project: { identifier: "ws1" } } as IBootstrapData;

describe("fetchBootstrapData in pluggable mode", () => {
    it("keeps the bootstrap data the host seeded", () => {
        const seeded = { user: { language: "en-US" } } as IBootstrapData;

        return expectSaga(fetchBootstrapData, routeParams)
            .provide([[select(bootstrapDataSelector), seeded]])
            .not.call.fn(backendBootstrapData)
            .not.put.actionType(ActionTypeKeys.BOOTSTRAP_DATA)
            .run();
    });

    it("loads the bootstrap data from the backend when the host seeded none", async () => {
        const { effects } = await expectSaga(fetchBootstrapData, routeParams)
            .provide([
                [select(bootstrapDataSelector), null],
                [select(getLocale), "de-DE"],
                [matchers.call.fn(backendBootstrapData), derived],
            ])
            .call(backendBootstrapData, backend, "ws1", "de-DE")
            .run();

        expect(effects.put).toHaveLength(1);
        expect(effects.put[0].payload.action).toMatchObject({
            type: ActionTypeKeys.BOOTSTRAP_DATA,
            payload: { data: derived },
        });
    });

    it("propagates a failed load to the bootstrap error handling", async () => {
        const error = new Error("not found");

        await expect(
            expectSaga(fetchBootstrapData, routeParams)
                .provide([
                    [select(bootstrapDataSelector), null],
                    [select(getLocale), "en-US"],
                    [matchers.call.fn(backendBootstrapData), throwError(error)],
                ])
                .run(),
        ).rejects.toBe(error);
    });
});
