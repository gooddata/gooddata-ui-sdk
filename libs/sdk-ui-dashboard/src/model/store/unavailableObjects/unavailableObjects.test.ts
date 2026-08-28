// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { idRef, uriRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../types.js";

import {
    type UnavailableObjectsState,
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "./index.js";
import {
    selectUnavailableObjects,
    selectUnavailableObjectsMapByType,
} from "./unavailableObjectsSelectors.js";

const forbiddenInsight: IUnavailableDashboardReference = {
    ref: idRef("x", "insight"),
    type: "insight",
    reason: "forbidden",
};

const missingDisplayForm: IUnavailableDashboardReference = {
    ref: idRef("df", "displayForm"),
    type: "displayForm",
    reason: "notFound",
};

const forbiddenDashboardByUri: IUnavailableDashboardReference = {
    ref: uriRef("/gdc/md/dash-1"),
    type: "analyticalDashboard",
    reason: "forbidden",
};

function stateWith(...references: IUnavailableDashboardReference[]): DashboardState {
    const unavailableObjects: UnavailableObjectsState = unavailableObjectsSliceReducer(
        undefined,
        unavailableObjectsActions.setUnavailableObjects(references),
    );
    return { unavailableObjects } as unknown as DashboardState;
}

describe("unavailableObjects store", () => {
    describe("reducer", () => {
        it("setUnavailableObjects replaces all entries", () => {
            const initial = stateWith(forbiddenInsight, missingDisplayForm).unavailableObjects;

            const unavailableObjects = unavailableObjectsSliceReducer(
                initial,
                unavailableObjectsActions.setUnavailableObjects([forbiddenDashboardByUri]),
            );

            expect(selectUnavailableObjects({ unavailableObjects } as unknown as DashboardState)).toEqual([
                forbiddenDashboardByUri,
            ]);
        });
    });

    describe("selectUnavailableObjectsMapByType", () => {
        it("resolves entries of the requested type by identifier ref", () => {
            const state = stateWith(forbiddenInsight, missingDisplayForm);

            expect(selectUnavailableObjectsMapByType("insight")(state).get(idRef("x", "insight"))).toEqual(
                forbiddenInsight,
            );
            expect(selectUnavailableObjectsMapByType("displayForm")(state).get(idRef("df"))).toEqual(
                missingDisplayForm,
            );
        });

        it("resolves entries by uri ref", () => {
            const state = stateWith(forbiddenDashboardByUri);

            expect(
                selectUnavailableObjectsMapByType("analyticalDashboard")(state).get(uriRef("/gdc/md/dash-1")),
            ).toEqual(forbiddenDashboardByUri);
        });

        it("keeps objects of different types with the same identifier apart", () => {
            const sameIdDashboard: IUnavailableDashboardReference = {
                ref: idRef("x", "analyticalDashboard"),
                type: "analyticalDashboard",
                reason: "notFound",
            };
            const state = stateWith(forbiddenInsight, sameIdDashboard);

            expect(selectUnavailableObjectsMapByType("insight")(state).get(idRef("x"))?.reason).toBe(
                "forbidden",
            );
            expect(
                selectUnavailableObjectsMapByType("analyticalDashboard")(state).get(idRef("x"))?.reason,
            ).toBe("notFound");
        });

        it("returns undefined for refs that are available", () => {
            const state = stateWith(forbiddenInsight);

            expect(
                selectUnavailableObjectsMapByType("insight")(state).get(idRef("other", "insight")),
            ).toBeUndefined();
            expect(
                selectUnavailableObjectsMapByType("analyticalDashboard")(state).get(idRef("x")),
            ).toBeUndefined();
        });
    });
});
