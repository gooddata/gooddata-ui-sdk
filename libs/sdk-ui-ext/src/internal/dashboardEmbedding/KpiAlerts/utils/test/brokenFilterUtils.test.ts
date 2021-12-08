// (C) 2021 GoodData Corporation
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDataSetMetadataObject,
    IWidgetAlertDefinition,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    idRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";

import {
    enrichBrokenAlertsInfo,
    getBrokenAlertFiltersBasicInfo,
    IAttributeFilterMetaCollection,
    IBrokenAlertFilterBasicInfo,
} from "../brokenFilterUtils";
import { BrokenAlertType, IBrokenAlertFilter } from "../../types";

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

    type EmptyOutputScenario = [string, IWidgetAlertDefinition];
    const emptyOutputScenarios: EmptyOutputScenario[] = [
        ["alert is undefined", undefined],
        ["alert has no filter context", alertBase],
        ["alert has filter context with no filters", getAlertWithFilters([])],
    ];

    it.each(emptyOutputScenarios)("should return empty array if %s", (_, alert) => {
        const kpi = kpiBase;
        const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, []);
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

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, []);
            expect(actual).toEqual(expected);
        });
    });

    describe("attribute filters", () => {
        const displayForm = ReferenceMd.Account.Name.attribute.displayForm;
        const attributeFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: { uris: ["/gdc/md/foo?id=1"] },
                displayForm,
                negativeSelection: false,
            },
        };

        const noopAttributeFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: { uris: [] },
                displayForm,
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
                        displayForm,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: attributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [
                newPositiveAttributeFilter(displayForm, { uris: ["/gdc/md/foo?id=1"] }),
            ]);
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

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, []);
            expect(actual).toEqual(expected);
        });

        it("should mark attribute filter that is both deleted and ignored as ignored", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi: IWidgetDefinition = {
                ...kpiBase,
                ignoreDashboardFilters: [
                    {
                        type: "attributeFilterReference",
                        displayForm,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: attributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, []);
            expect(actual).toEqual(expected);
        });

        it("should detect ignored attribute filter even if it is noop", () => {
            const alert = getAlertWithFilters([noopAttributeFilter]);
            const kpi: IWidgetDefinition = {
                ...kpiBase,
                ignoreDashboardFilters: [
                    {
                        type: "attributeFilterReference",
                        displayForm,
                    },
                ],
            };

            const expected: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: noopAttributeFilter,
                    brokenType: "ignored",
                },
            ];

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [
                newNegativeAttributeFilter(displayForm, { uris: [] }),
            ]);
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

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, []);
            expect(actual).toEqual(expected);
        });

        it("should NOT detect attribute filter if it is applied", () => {
            const alert = getAlertWithFilters([attributeFilter]);
            const kpi = kpiBase;

            const actual = getBrokenAlertFiltersBasicInfo(alert, kpi, [
                newPositiveAttributeFilter(displayForm, { uris: ["/gdc/md/foo?id=1"] }),
            ]);
            expect(actual).toEqual([]);
        });
    });
});

describe("enrichBrokenAlertsInfo", () => {
    const DEFAULT_DATE_TITLE = "Date";
    const intl = createIntlMock({ "kpiAlertDialog.brokenAlertDefaultDateLabel": DEFAULT_DATE_TITLE });
    const dateFormat = "yyyy/MM/dd";
    const dateDataSets: IDataSetMetadataObject[] = [
        {
            deprecated: false,
            description: "",
            id: ReferenceMd.DateDatasets.Activity.identifier,
            production: true,
            ref: ReferenceMd.DateDatasets.Activity.ref,
            title: "Activity",
            type: "dataSet",
            unlisted: false,
            uri: "",
        },
    ];

    const attributeFiltersMeta: IAttributeFilterMetaCollection = {
        [objRefToString(ReferenceMd.StageName.Default.attribute.displayForm)]: {
            title: "Stage Name",
            totalElementsCount:
                ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status.elements.length,
            validElements:
                ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status.elements,
        },
    };

    it("should return empty array for empty broken filters", () => {
        const actual = enrichBrokenAlertsInfo([], intl, dateFormat, dateDataSets, attributeFiltersMeta);
        expect(actual).toEqual([]);
    });

    describe("date filters", () => {
        type Scenario = [string, IDashboardDateFilter, string];
        const scenarios: Scenario[] = [
            [
                "relative",
                {
                    dateFilter: {
                        type: "relative",
                        granularity: "GDC.time.date",
                        dataSet: ReferenceMd.DateDatasets.Activity.ref,
                        from: -6,
                        to: 0,
                    },
                },
                "Last 7 days",
            ],
            [
                "absolute",
                {
                    dateFilter: {
                        type: "absolute",
                        granularity: "GDC.time.date",
                        dataSet: ReferenceMd.DateDatasets.Activity.ref,
                        from: "2021-01-01",
                        to: "2021-12-31",
                    },
                },
                "2021/01/01–2021/12/31",
            ],
        ];

        it.each(scenarios)("should correctly enrich %s date", (_, dateFilter, expectedDateFilterTitle) => {
            const brokenAlertFilters: IBrokenAlertFilterBasicInfo[] = [
                {
                    alertFilter: dateFilter,
                    brokenType: "ignored",
                },
            ];

            const expected: IBrokenAlertFilter[] = [
                {
                    type: "date",
                    brokenType: "ignored",
                    dateFilterTitle: expectedDateFilterTitle,
                    title: DEFAULT_DATE_TITLE,
                },
            ];

            const actual = enrichBrokenAlertsInfo(
                brokenAlertFilters,
                intl,
                dateFormat,
                dateDataSets,
                attributeFiltersMeta,
            );

            expect(actual).toEqual(expected);
        });
    });

    describe("attribute filters", () => {
        const displayForm = ReferenceMd.StageName.Default.attribute.displayForm;
        const elements = ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status.elements;
        const firstElement =
            ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status.elements[0];

        type Scenario = [BrokenAlertType, string, IDashboardAttributeFilter, IBrokenAlertFilter[]];
        const scenarios: Scenario[] = [
            [
                "ignored",
                "positive attribute",
                {
                    attributeFilter: {
                        attributeElements: { uris: [firstElement.uri] },
                        displayForm,
                        negativeSelection: false,
                    },
                },
                [
                    {
                        type: "attribute",
                        brokenType: "ignored",
                        isAllSelected: false,
                        selection: firstElement.title,
                        selectionSize: 1,
                        title: "Stage Name",
                    },
                ],
            ],
            [
                "deleted",
                "positive attribute",
                {
                    attributeFilter: {
                        attributeElements: { uris: [firstElement.uri] },
                        displayForm,
                        negativeSelection: false,
                    },
                },
                [
                    {
                        type: "attribute",
                        brokenType: "deleted",
                        isAllSelected: false,
                        selection: firstElement.title,
                        selectionSize: 1,
                        title: "Stage Name",
                    },
                ],
            ],
            [
                "ignored",
                "negative attribute",
                {
                    attributeFilter: {
                        attributeElements: { uris: [firstElement.uri] },
                        displayForm,
                        negativeSelection: true,
                    },
                },
                [
                    {
                        type: "attribute",
                        brokenType: "ignored",
                        isAllSelected: false,
                        selection: `${elements[1].title}, ${elements[2].title}`,
                        selectionSize: 2,
                        title: "Stage Name",
                    },
                ],
            ],
        ];

        it.each(scenarios)(
            "should correctly enrich %s %s filter",
            (brokenType, _, attributeFilter, expected) => {
                const brokenAlertFilters: IBrokenAlertFilterBasicInfo[] = [
                    {
                        alertFilter: attributeFilter,
                        brokenType,
                    },
                ];

                const actual = enrichBrokenAlertsInfo(
                    brokenAlertFilters,
                    intl,
                    dateFormat,
                    dateDataSets,
                    attributeFiltersMeta,
                );

                expect(actual).toEqual(expected);
            },
        );
    });
});
