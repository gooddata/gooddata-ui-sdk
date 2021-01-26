// (C) 2007-2021 GoodData Corporation
import {
    FilterContextItem,
    IFilterContextDefinition,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    idRef,
    IFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import isUndefined from "lodash/isUndefined";
import omitBy from "lodash/omitBy";

import { getFilterLabelFilter, areKpiAlertFiltersSameAsDashboard } from "../filterUtils";
import { IBrokenAlertDateFilter, IBrokenAlertAttributeFilter } from "../../types";

describe("getFilterLabelFilter", () => {
    const pickDefined = (obj: object) => omitBy(obj, isUndefined);

    describe("item should be converted to AD-FilterLabel compatible format", () => {
        it("should convert date filter item", () => {
            const title = "Date (Created)";
            const dateItemTitle = "This year";

            const item: IBrokenAlertDateFilter = {
                type: "date",
                brokenType: "deleted",
                dateFilterTitle: dateItemTitle,
                title,
            };

            const filterLabel = getFilterLabelFilter(item);

            expect(pickDefined(filterLabel)).toEqual({
                title,
                selection: dateItemTitle,
                isDate: true,
                isAllSelected: false,
                selectionSize: null,
            });
        });

        it("should convert attribute filter item", () => {
            const title = "Education";
            const bachelor = "Bachelor";
            const graduate = "Graduate";
            const count = 1000;
            const isAll = false;

            const item: IBrokenAlertAttributeFilter = {
                type: "attribute",
                brokenType: "deleted",
                isAllSelected: isAll,
                selection: `${bachelor}, ${graduate}`,
                selectionSize: count,
                title,
            };

            const filterLabel = getFilterLabelFilter(item);

            expect(pickDefined(filterLabel)).toEqual({
                title,
                selection: `${bachelor}, ${graduate}`,
                isAllSelected: isAll,
                isDate: false,
                selectionSize: count,
            });
        });
    });
});

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
                        displayForm: ReferenceLdm.Account.Name.attribute.displayForm,
                        negativeSelection: false,
                    },
                },
            ]),
        };

        it("should return true for matching filter", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceLdm.Account.Name, { uris: ["/gdc/md/123"] }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for filter with wrong type", () => {
            const filters: IFilter[] = [
                newNegativeAttributeFilter(ReferenceLdm.Account.Name, { uris: ["/gdc/md/123"] }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for filter with wrong elements", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceLdm.Account.Name, {
                    uris: ["/gdc/md/123", "/gdc/md/456"],
                }),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAttributeFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for filter with no matching display form", () => {
            const filters: IFilter[] = [
                newPositiveAttributeFilter(ReferenceLdm.Activity.Subject, { uris: ["/gdc/md/123"] }),
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
                            displayForm: ReferenceLdm.Account.Name.attribute.displayForm,
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
                newAbsoluteDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "2020-01-01", "2020-12-31"),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAbsoluteDateFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for absolute filter with wrong from", () => {
            const filters: IFilter[] = [
                newAbsoluteDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "1990-01-01", "2020-12-31"),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithAbsoluteDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for absolute filter with wrong to", () => {
            const filters: IFilter[] = [
                newAbsoluteDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "2020-01-01", "2100-12-31"),
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
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "GDC.time.date", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(true);
        });

        it("should return false for relative filter with wrong from", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "GDC.time.date", -600, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for relative filter with wrong to", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "GDC.time.date", -6, 600),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return false for relative filter with wrong granularity", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "GDC.time.year", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertWithRelativeDateFilter, filters);
            expect(actual).toBe(false);
        });

        it("should return true for alert with no filters with all time filter applied", () => {
            const filters: IFilter[] = [newAllTimeFilter(ReferenceLdm.DateDatasets.Activity.Date)];

            const actual = areKpiAlertFiltersSameAsDashboard(alertBase, filters);
            expect(actual).toBe(true);
        });

        it("should return false for alert with no filters with non-all time filter applied", () => {
            const filters: IFilter[] = [
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Activity.Date, "GDC.time.date", -6, 0),
            ];

            const actual = areKpiAlertFiltersSameAsDashboard(alertBase, filters);
            expect(actual).toBe(false);
        });
    });
});
