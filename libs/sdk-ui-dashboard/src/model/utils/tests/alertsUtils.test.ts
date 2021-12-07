// (C) 2021 GoodData Corporation

import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IWidgetAlertDefinition,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-backend-spi";
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { idRef, newNegativeAttributeFilter, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { IBrokenAlertFilterBasicInfo } from "../../types/alertTypes";
import { getBrokenAlertFiltersBasicInfo } from "../alertsUtils";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { newDisplayFormMap } from "../../../_staging/metadata/objRefMap";

describe("getBrokenAlertFiltersBasicInfo", () => {
    const kpiBase: IWidgetDefinition = {
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
        title: "KPI",
        type: "kpi",
        kpi: {
            comparisonType: "none",
            metric: idRef("measure"),
        },
    };

    const alertBase: IWidgetAlertDefinition = {
        dashboard: idRef("dashboard"),
        description: "",
        isTriggered: false,
        threshold: 42,
        title: "",
        whenTriggered: "aboveThreshold",
        widget: idRef("widget"),
    };

    function getAlertWithFilters(filters: FilterContextItem[]): IWidgetAlertDefinition {
        return {
            ...alertBase,
            filterContext: {
                description: "",
                filters,
                title: "",
            },
        };
    }

    type EmptyOutputScenario = [description: string, alert: IWidgetAlertDefinition | undefined];
    const emptyOutputScenarios: EmptyOutputScenario[] = [
        ["alert is undefined", undefined],
        ["alert has no filter context", alertBase],
        ["alert has filter context with no filters", getAlertWithFilters([])],
    ];

    it.each(emptyOutputScenarios)("should return empty array if %s", (_, alert) => {
        const kpi = kpiBase;
        const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [], newDisplayFormMap([]));
        expect(actual).toEqual([]);
    });

    describe("date filters", () => {
        it("should detect broken date filter", () => {
            const dateFilter: IDashboardDateFilter = {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.date",
                    dataSet: ReferenceMd.DateDatasets.Activity.ref,
                    from: -6,
                    to: 0,
                },
            };

            const alert = getAlertWithFilters([dateFilter]);
            const kpi = kpiBase;

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: dateFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [], newDisplayFormMap([]));
            expect(actual).toEqual(expected);
        });
    });

    describe("attribute filters", () => {
        const displayForm = ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status
            .obj as IAttributeDisplayFormMetadataObject;
        const displayFormRef = displayForm.ref;
        const displayFormsMap = newDisplayFormMap([displayForm]);

        const attributeFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: { uris: ["/gdc/md/foo?id=1"] },
                displayForm: displayFormRef,
                negativeSelection: false,
            },
        };

        const noopAttributeFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: { uris: [] },
                displayForm: displayFormRef,
                negativeSelection: true,
            },
        };

        it("should detect ignored attribute filter", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi: IWidgetDefinition = {
                ...kpiBase,
                ignoreDashboardFilters: [
                    {
                        type: "attributeFilterReference",
                        displayForm: displayFormRef,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: attributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(
                alert,
                kpi,
                [newPositiveAttributeFilter(displayFormRef, { uris: ["/gdc/md/foo?id=1"] })],
                displayFormsMap,
            );
            expect(actual).toEqual(expected);
        });

        it("should detect deleted attribute filter", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi = kpiBase;

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: attributeFilter,
                    brokenType: "deleted",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [], displayFormsMap);
            expect(actual).toEqual(expected);
        });

        it("should mark attribute filter that is both deleted and ignored as ignored", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi: IWidgetDefinition = {
                ...kpiBase,
                ignoreDashboardFilters: [
                    {
                        type: "attributeFilterReference",
                        displayForm: displayFormRef,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: attributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [], displayFormsMap);
            expect(actual).toEqual(expected);
        });

        it("should detect ignored attribute filter even if it is noop", () => {
            const alert = getAlertWithFilters([noopAttributeFilter]);
            const kpi: IWidgetDefinition = {
                ...kpiBase,
                ignoreDashboardFilters: [
                    {
                        type: "attributeFilterReference",
                        displayForm: displayFormRef,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: noopAttributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(
                alert,
                kpi,
                [newNegativeAttributeFilter(displayFormRef, { uris: [] })],
                displayFormsMap,
            );
            expect(actual).toEqual(expected);
        });

        it("should detect deleted attribute filter even if it is noop", () => {
            const alert = getAlertWithFilters([noopAttributeFilter]);
            const kpi = kpiBase;

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: noopAttributeFilter,
                    brokenType: "deleted",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [], displayFormsMap);
            expect(actual).toEqual(expected);
        });

        it("should NOT detect attribute filter if it is applied", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi = kpiBase;

            const actual = getBrokenAlertFiltersBasicInfo(
                alert,
                kpi,
                [newPositiveAttributeFilter(displayFormRef, { uris: ["/gdc/md/foo?id=1"] })],
                displayFormsMap,
            );
            expect(actual).toEqual([]);
        });
    });
});
