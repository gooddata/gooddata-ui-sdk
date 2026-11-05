// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IDashboardAttributeFilter, idRef } from "@gooddata/sdk-model";

import {
    type ReplaceAttributeFilterItemSelection,
    replaceAttributeFilterItemSelection,
    replaceAttributeFilterItemSelectionForSelectionTypeChange,
} from "../../../commands/filters.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { beginTabSync } from "../tabSync/tabSyncSaga.js";

import { replaceAttributeFilterItemSelectionHandler } from "./replaceAttributeFilterItemSelectionHandler.js";

type SagaEffect = {
    "@@redux-saga/IO": true;
    type: "SELECT" | "PUT" | "CALL";
    payload: any;
};

const LOCAL_ID = "region";

const filter: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: idRef("region_id", "displayForm"),
        negativeSelection: true,
        attributeElements: { uris: [] },
        localIdentifier: LOCAL_ID,
    },
};

const ctx = { workspace: "ws", dashboardRef: idRef("dashboard-id") } as DashboardContext;

function beginTabSyncEffect(cmd: ReplaceAttributeFilterItemSelection): SagaEffect {
    const saga = replaceAttributeFilterItemSelectionHandler(ctx, cmd);
    saga.next(); // select the affected filter
    saga.next(filter); // select apply-all-at-once
    const effect = saga.next(false).value as SagaEffect;
    expect(effect.type).toBe("CALL");
    expect(effect.payload.fn).toBe(beginTabSync);
    return effect;
}

describe("replaceAttributeFilterItemSelectionHandler", () => {
    it("syncs a replaced filter to other tabs", () => {
        const effect = beginTabSyncEffect(replaceAttributeFilterItemSelection(LOCAL_ID, filter));

        expect(effect.payload.args).toEqual([{ enabled: true }]);
    });

    it("keeps the reset of a filter whose selection type changes on its own tab", () => {
        const effect = beginTabSyncEffect(
            replaceAttributeFilterItemSelectionForSelectionTypeChange(LOCAL_ID, filter),
        );

        expect(effect.payload.args).toEqual([{ enabled: false }]);
    });
});
