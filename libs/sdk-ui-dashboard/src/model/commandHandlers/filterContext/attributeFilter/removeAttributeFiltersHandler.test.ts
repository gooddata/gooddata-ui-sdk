// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { removeAttributeFilters } from "../../../commands/filters.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

import { removeAttributeFiltersHandler } from "./removeAttributeFiltersHandler.js";

const ctx = { workspace: "ws" } as DashboardContext;

const filterItem = (localIdentifier: string, parents: string[] = []) => ({
    attributeFilter: {
        displayForm: idRef(localIdentifier),
        localIdentifier,
        filterElementsBy: parents.map((filterLocalIdentifier) => ({
            filterLocalIdentifier,
            over: { attributes: [] },
        })),
    },
});

describe("removeAttributeFiltersHandler", () => {
    it("leaves a child with no reference to any of the parents removed with it", () => {
        const generator = removeAttributeFiltersHandler(
            ctx,
            removeAttributeFilters(["parent-a", "parent-b"]),
        );
        generator.next();

        const effects = [];
        let step = generator.next([
            filterItem("parent-a"),
            filterItem("parent-b"),
            filterItem("child", ["parent-a", "parent-b"]),
        ]);
        while (!step.done) {
            effects.push(step.value);
            step = generator.next([]);
        }

        const parentUpdates = effects
            .map((effect) => (effect as any)?.payload?.action?.payload)
            .filter(Array.isArray)
            .flat()
            .filter((action) => action.type === tabsActions.setAttributeFilterParents.type)
            .map((action) => action.payload);

        expect(parentUpdates).toEqual([
            { filterLocalId: "child", parentFilters: [] },
            { filterLocalId: "child", parentFilters: [] },
        ]);
    });
});
