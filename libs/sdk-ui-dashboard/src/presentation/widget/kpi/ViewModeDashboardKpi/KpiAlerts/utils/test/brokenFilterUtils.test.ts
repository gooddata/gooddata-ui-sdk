// (C) 2021-2022 GoodData Corporation
import {
    objRefToString,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDataSetMetadataObject,
} from "@gooddata/sdk-model";
import { createIntlMock } from "@gooddata/sdk-ui";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

import { enrichBrokenAlertsInfo, IAttributeFilterMetaCollection } from "../brokenFilterUtils.js";
import { IBrokenAlertFilter } from "../../types.js";
import { BrokenAlertType, IBrokenAlertFilterBasicInfo } from "../../../../../../../model/index.js";

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
                "2021/01/01 – 2021/12/31",
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
