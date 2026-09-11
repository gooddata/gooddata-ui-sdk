// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, idRef } from "@gooddata/sdk-model";

import { isDashboardFilterRestricted, isDashboardObjectRestricted } from "./restrictedFilterUtils.js";

const labelRef = idRef("label", "displayForm");
const dataSetRef = idRef("dataset", "dataSet");
const measureRef = idRef("measure", "measure");

const forbidden = (
    ref: IUnavailableDashboardReference["ref"],
    type: IUnavailableDashboardReference["type"],
): IUnavailableDashboardReference[] => [{ ref, type, reason: "forbidden" }];

const asFilter = (filter: unknown) => filter as FilterContextItem;
const attributeFilter = asFilter({ attributeFilter: { displayForm: labelRef, localIdentifier: "a" } });
const dateFilter = asFilter({ dateFilter: { type: "relative", dataSet: dataSetRef, localIdentifier: "d" } });
const measureValueFilter = asFilter({
    dashboardMeasureValueFilter: { measure: measureRef, localIdentifier: "m" },
});
const commonDateFilter = asFilter({ dateFilter: { type: "relative", localIdentifier: "common" } });

describe("isDashboardObjectRestricted", () => {
    it("matches only a forbidden object of the same type and ref", () => {
        expect(isDashboardObjectRestricted(labelRef, "displayForm", forbidden(labelRef, "displayForm"))).toBe(
            true,
        );
        expect(isDashboardObjectRestricted(labelRef, "dataSet", forbidden(labelRef, "displayForm"))).toBe(
            false,
        );
        expect(
            isDashboardObjectRestricted(labelRef, "displayForm", forbidden(dataSetRef, "displayForm")),
        ).toBe(false);
        expect(
            isDashboardObjectRestricted(labelRef, "displayForm", [
                { ref: labelRef, type: "displayForm", reason: "notFound" },
            ]),
        ).toBe(false);
    });
});

describe("isDashboardFilterRestricted", () => {
    it("resolves every filter type against the object it filters by", () => {
        expect(isDashboardFilterRestricted(attributeFilter, forbidden(labelRef, "displayForm"))).toBe(true);
        expect(isDashboardFilterRestricted(attributeFilter, forbidden(dataSetRef, "dataSet"))).toBe(false);
        expect(isDashboardFilterRestricted(dateFilter, forbidden(dataSetRef, "dataSet"))).toBe(true);
        expect(isDashboardFilterRestricted(measureValueFilter, forbidden(measureRef, "measure"))).toBe(true);
    });

    it("treats the common date filter as unrestricted, it references no object", () => {
        expect(isDashboardFilterRestricted(commonDateFilter, forbidden(dataSetRef, "dataSet"))).toBe(false);
    });
});
