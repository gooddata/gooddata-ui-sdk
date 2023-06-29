// (C) 2007-2022 GoodData Corporation
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newRelativeDateFilter,
    IWidgetDefinition,
} from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

import { isAlertingTemporarilyDisabledForGivenFilter } from "../filterUtils.js";

describe("isAlertingTemporarilyDisabledForGivenFilter", () => {
    type Scenario = [boolean, string, IWidgetDefinition, IFilter[]];

    const kpiBase: IWidgetDefinition = {
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
        title: "Title",
        type: "kpi",
        kpi: {
            comparisonType: "none",
            metric: ReferenceMd.Amount.measure.definition.measureDefinition.item,
        },
    };

    const kpi: IWidgetDefinition = {
        ...kpiBase,
        dateDataSet: ReferenceMd.DateDatasets.Activity.ref,
    };

    const settingsWithoutAfmExecutor: IUserWorkspaceSettings = {
        locale: "en-US",
        separators: { decimal: ".", thousand: "," },
        userId: "foo",
        workspace: "projectId",
    };

    describe("afm executor disabled", () => {
        const scenariosWithoutAfmExecutor: Scenario[] = [
            [false, "no date filter", kpi, []],
            [false, "all time date filter", kpi, [newAllTimeFilter(ReferenceMd.DateDatasets.Activity)]],
            [
                false,
                "relative filter ending today",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, 0)],
            ],
            [
                false,
                "relative filter starting and ending last period",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -1, -1)],
            ],
            [
                true,
                "relative filter starting in the past (not last period) and ending last period (exclude current period)",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, -1)],
            ],
            [
                false,
                "relative filter starting in the past (not last period) and ending last period (exclude current period) but KPI with no dataset",
                kpiBase,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, -1)],
            ],
            [
                true,
                "absolute filter",
                kpi,
                [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity, "2020-01-01", "2020-12-31")],
            ],
            [
                false,
                "absolute filter but KPI with no dataset",
                kpiBase,
                [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity, "2020-01-01", "2020-12-31")],
            ],
        ];

        it.each(scenariosWithoutAfmExecutor)(
            "should return %p for %s with afm executor disabled",
            (expected, _, kpi, filters) => {
                expect(
                    isAlertingTemporarilyDisabledForGivenFilter(kpi, filters, settingsWithoutAfmExecutor),
                ).toBe(expected);
            },
        );
    });

    describe("afm executor enabled", () => {
        const settingsWithAfmExecutor: IUserWorkspaceSettings = {
            ...settingsWithoutAfmExecutor,
            "kpi.alerting.useAfmExecutor": true,
        };

        const scenariosWithAfmExecutor: Scenario[] = [
            [false, "no date filter", kpi, []],
            [false, "all time date filter", kpi, [newAllTimeFilter(ReferenceMd.DateDatasets.Activity)]],
            [
                false,
                "relative filter ending today",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, 0)],
            ],
            [
                false,
                "relative filter starting and ending last period",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -1, -1)],
            ],
            [
                false,
                "relative filter starting in the past (not last period) and ending last period (exclude current period)",
                kpi,
                [newRelativeDateFilter(ReferenceMd.DateDatasets.Activity, "GDC.time.date", -6, -1)],
            ],
            [
                true,
                "absolute filter",
                kpi,
                [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity, "2020-01-01", "2020-12-31")],
            ],
            [
                false,
                "absolute filter but KPI with no dataset",
                kpiBase,
                [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity, "2020-01-01", "2020-12-31")],
            ],
        ];

        it.each(scenariosWithAfmExecutor)(
            "should return %p for %s with afm executor enabled",
            (expected, _, kpi, filters) => {
                expect(
                    isAlertingTemporarilyDisabledForGivenFilter(kpi, filters, settingsWithAfmExecutor),
                ).toBe(expected);
            },
        );
    });
});
