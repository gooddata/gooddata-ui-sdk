// (C) 2019-2022 GoodData Corporation
import { createIntlMock, DefaultLocale } from "@gooddata/sdk-ui";
import {
    IDateFilter,
    newAllTimeFilter,
    newRelativeDateFilter,
    DateFilterGranularity,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

import { translations } from "../../../../../../localization/index.js";
import { getKpiAlertTranslationData, KpiAlertTranslationData } from "../translationUtils.js";

// we need to have both sdk-ui and sdk-ui-ext messages available
const intl = createIntlMock(translations[DefaultLocale], DefaultLocale);

type TranslationTestPair = [IDateFilter | IDashboardDateFilter, KpiAlertTranslationData];

describe("getKpiAlertTranslationData", () => {
    const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";

    it("should return null for unsupported filter", () => {
        const res = getKpiAlertTranslationData(
            newAllTimeFilter(ReferenceMd.DateDatasets.Activity),
            intl,
            DEFAULT_DATE_FORMAT,
        );
        expect(res).toEqual(null);
    });

    describe("date filters", () => {
        const testedData: TranslationTestPair[] = [
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.week_us", 0, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "this week",
                },
            ],
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.week_us", -1, -1),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last week",
                },
            ],
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last 7 days",
                },
            ],
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, -1),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset.inPeriod",
                    rangeText: "from 6 to 1 day ago",
                },
            ],
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.month", -11, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last 12 months",
                },
            ],
            [
                newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.month", -3, 3),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset.inPeriod",
                    rangeText: "from 3 months ago to 3 months ahead",
                },
            ],
        ];
        it.each(testedData)("should take relative filter %o and return intl data %o", (input, output) => {
            expect(getKpiAlertTranslationData(input, intl, DEFAULT_DATE_FORMAT)).toEqual(output);
        });
    });

    describe("dashboard date filters", () => {
        function newRelativeDashboardFilter(
            granularity: DateFilterGranularity,
            from: number,
            to: number,
        ): IDashboardDateFilter {
            return {
                dateFilter: {
                    granularity,
                    type: "relative",
                    from,
                    to,
                },
            };
        }

        const testedData: TranslationTestPair[] = [
            [
                newRelativeDashboardFilter("GDC.time.week_us", 0, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "this week",
                },
            ],
            [
                newRelativeDashboardFilter("GDC.time.week_us", -1, -1),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last week",
                },
            ],
            [
                newRelativeDashboardFilter("GDC.time.date", -6, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last 7 days",
                },
            ],
            [
                newRelativeDashboardFilter("GDC.time.date", -6, -1),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset.inPeriod",
                    rangeText: "from 6 to 1 day ago",
                },
            ],
            [
                newRelativeDashboardFilter("GDC.time.month", -11, 0),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset",
                    rangeText: "last 12 months",
                },
            ],
            [
                newRelativeDashboardFilter("GDC.time.month", -3, 3),
                {
                    intlIdRoot: "filters.alertMessage.relativePreset.inPeriod",
                    rangeText: "from 3 months ago to 3 months ahead",
                },
            ],
        ];
        it.each(testedData)(
            "should take relative dashboard filter %o and return intl data %o",
            (input, output) => {
                expect(getKpiAlertTranslationData(input, intl, DEFAULT_DATE_FORMAT)).toEqual(output);
            },
        );
    });
});
