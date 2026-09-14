// (C) 2026 GoodData Corporation

// @vitest-environment node

import { call, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type FilterContextItem, idRef } from "@gooddata/sdk-model";

import {
    type IRemoveDateFilters,
    removeAttributeFilters,
    removeMeasureValueFilters,
    removeRestrictedFilters,
} from "../../commands/filters.js";
import { selectReportedRestrictedDashboardFilters } from "../../store/filtering/dashboardFilterSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import { removeAttributeFiltersHandler } from "./attributeFilter/removeAttributeFiltersHandler.js";
import { removeDateFiltersHandler } from "./dateFilter/removeDateFiltersHandler.js";
import { removeMeasureValueFilterHandler } from "./measureValueFilter/removeMeasureValueFilterHandler.js";
import { removeRestrictedFiltersHandler } from "./removeRestrictedFiltersHandler.js";

const ctx = { workspace: "ws" } as DashboardContext;
const dataSet = idRef("dataset", "dataSet");

const asFilter = (filter: unknown) => filter as FilterContextItem;
const attributeFilter = asFilter({
    attributeFilter: { displayForm: idRef("label", "displayForm"), localIdentifier: "attribute" },
});
const dateFilter = asFilter({
    dateFilter: { type: "relative", dataSet, localIdentifier: "date" },
});
const measureValueFilter = asFilter({
    dashboardMeasureValueFilter: { measure: idRef("metric"), localIdentifier: "measure-value" },
});

describe("removeRestrictedFiltersHandler", () => {
    it("removes each reported type through its own handler, which cleans up after it", () => {
        const generator = removeRestrictedFiltersHandler(ctx, removeRestrictedFilters("corr"));

        expect(generator.next().value).toEqual(select(selectReportedRestrictedDashboardFilters));

        const restricted = [attributeFilter, dateFilter, measureValueFilter];
        expect(generator.next(restricted).value).toEqual(
            call(removeAttributeFiltersHandler, ctx, removeAttributeFilters(["attribute"], "corr")),
        );

        expect(generator.next().value).toEqual(
            call(removeDateFiltersHandler, ctx, {
                type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.REMOVE",
                correlationId: "corr",
                payload: { dataSets: [dataSet] },
            } as IRemoveDateFilters),
        );

        expect(generator.next().value).toEqual(
            call(removeMeasureValueFilterHandler, ctx, removeMeasureValueFilters(["measure-value"], "corr")),
        );

        expect(generator.next().done).toBe(true);
    });

    it("asks for no removal when nothing is restricted", () => {
        const generator = removeRestrictedFiltersHandler(ctx, removeRestrictedFilters());

        generator.next();

        expect(generator.next([]).done).toBe(true);
    });
});
