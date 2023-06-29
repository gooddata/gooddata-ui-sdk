// (C) 2007-2022 GoodData Corporation
import {
    idRef,
    IFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    FilterContextItem,
    IFilterContextDefinition,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

import { areKpiAlertFiltersSameAsDashboard } from "../filterUtils.js";

describe("areKpiAlertFiltersSameAsDashboard", () => {
    const alertBase: IWidgetAlertDefinition = {
        dashboard: idRef("foo"),
        description: "",
        isTriggered: false,
        threshold: 123,
        title: "",
        whenTriggered: "aboveThreshold",
        widget: idRef("bar"),
    };

    function getFilterContext(filters: FilterContextItem[]): IFilterContextDefinition {
        return {
            description: "",
            title: "",
            filters,
        };
    }

    describe("attribute filters", () => {
        const alertWithAttributeFilter: IWidgetAlertDefinition = {
            ...alertBase,
            filterContext: getFilterContext([
                {
                    attributeFilter: {
                        attributeElements: { uris: ["/gdc/md/123"] },
                        displayForm: ReferenceMd.Account.Name.attribute.displayForm,
                        negativeSelection: false,
                    },
                },
            ]),
        };

        it("should return true for matching filter", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceMd.Account.Name, { uris: ["/gdc/md/123"] }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for filter with wrong type", () => {
            const filters: IFilter[] = [
                newNegativeAttributeFilter(ReferenceMd.Account.Name, { uris: ["/gdc/md/123"] }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for filter with wrong elements", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceMd.Account.Name, {
                    uris: ["/gdc/md/123", "/gdc/md/456"],
                }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for filter with no matching display form", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceMd.Activity.Subject, { uris: ["/gdc/md/123"] }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for filter with empty filters", () => {
            const filters: IFilter[] = [];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return true for filter with no selection with empty filters", () => {
            const alertWithAttributeFilterWithNoSelection: IWidgetAlertDefinition = {
                ...alertBase,
                filterContext: getFilterContext([
                    {
                        attributeFilter: {
                            attributeElements: { uris: [] },
                            displayForm: ReferenceMd.Account.Name.attribute.displayForm,
                            negativeSelection: true,
                        },
                    },
                ]),
            };

            const filters: IFilter[] = [];

            const actual = areKpiAlertFiltersSameAsDashboard(
                alertWithAttributeFilterWithNoSelection,
                filters,
            );
            expect(actual).toBe(true);
        });
    });

    describe("absolute date filters", () => {
        const alertWithAbsoluteDateFilter: IWidgetAlertDefinition = {
            ...alertBase,
            filterContext: getFilterContext([
                {
                    dateFilter: {
                        granularity: "GDC.time.date",
                        type: "absolute",
                        from: "2020-01-01",
                        to: "2020-12-31",
                    },
                },
            ]),
        };

        it("should return true for matching absolute filter", () => {
            const filters: IFilter[] = [
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity.Date, "2020-01-01", "2020-12-31"),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAbsoluteDateFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for absolute filter with wrong from", () => {
            const filters: IFilter[] = [
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity.Date, "1990-01-01", "2020-12-31"),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAbsoluteDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for absolute filter with wrong to", () => {
            const filters: IFilter[] = [
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity.Date, "2020-01-01", "2100-12-31"),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAbsoluteDateFilter, filters);
            expect(actual).toBe(false);
        });
    });

    describe("relative date filters", () => {
        const alertWithRelativeDateFilter: IWidgetAlertDefinition = {
            ...alertBase,
            filterContext: getFilterContext([
                {
                    dateFilter: {
                        granularity: "GDC.time.date",
                        type: "relative",
                        from: -6,
                        to: 0,
                    },
                },
            ]),
        };

        it("should return true for matching relative filter", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity.Date, "GDC.time.date", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for relative filter with wrong from", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity.Date, "GDC.time.date", -600, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for relative filter with wrong to", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity.Date, "GDC.time.date", -6, 600),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for relative filter with wrong granularity", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity.Date, "GDC.time.year", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return true for alert with no filters with all time filter applied", () => {
            const filters: IFilter[] = [newAllTimeFilter(ReferenceMd.DateDatasets.Activity.Date)];

            const actual = areKpiAlertFiltersSameAsDashboard(alertBase, filters);
            expect(actual).toBe(true);
        });

        it("should return false for alert with no filters with non-all time filter applied", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity.Date, "GDC.time.date", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertBase, filters);
            expect(actual).toBe(false);
        });
    });
});
