// (C) 2019-2021 GoodData Corporation
import {
    IReferencePoint,
    IBucketItem,
    IFilters,
    IAttributeFilter,
    IDateFilter,
    IMeasureValueFilter,
    IFiltersBucketItem,
    DATE_DATASET_ATTRIBUTE,
    IRankingFilter,
} from "../../interfaces/Visualization";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { ColumnWidthItem } from "@gooddata/sdk-ui-pivot";
import { ObjRef, uriRef, idRef } from "@gooddata/sdk-model";

export const dateDatasetRef: ObjRef = uriRef("data.dataset.1");

export const masterMeasureItems: IBucketItem[] = [
    {
        localIdentifier: "m1",
        type: "metric",
        aggregation: null,
        attribute: "aazb6kroa3iC",
        showInPercent: null,
        showOnSecondaryAxis: null,
    },
    {
        localIdentifier: "m2",
        type: "metric",
        aggregation: null,
        attribute: "af2Ewj9Re2vK",
        showInPercent: null,
        showOnSecondaryAxis: null,
    },
    {
        localIdentifier: "m3",
        type: "metric",
        aggregation: null,
        attribute: "dt.opportunitysnapshot.snapshotdate",
        showInPercent: null,
        showOnSecondaryAxis: true,
    },
    {
        localIdentifier: "m4",
        type: "metric",
        aggregation: null,
        attribute: "acfWntEMcom0",
        showInPercent: null,
        showOnSecondaryAxis: true,
    },
];

export const derivedMeasureItems: IBucketItem[] = [
    {
        localIdentifier: "m1_pop",
        type: "metric",
        aggregation: null,
        attribute: "aazb6kroa3iC",
        showInPercent: null,
        showOnSecondaryAxis: null,
        masterLocalIdentifier: "m1",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    },
    {
        localIdentifier: "m2_pop",
        type: "metric",
        aggregation: null,
        attribute: "af2Ewj9Re2vK",
        showInPercent: null,
        showOnSecondaryAxis: null,
        masterLocalIdentifier: "m2",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
    },
    {
        localIdentifier: "m3_pop",
        type: "metric",
        aggregation: null,
        attribute: "dt.opportunitysnapshot.snapshotdate",
        showInPercent: null,
        showOnSecondaryAxis: true,
        masterLocalIdentifier: "m3",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    },
    {
        localIdentifier: "m4_pop",
        type: "metric",
        aggregation: null,
        attribute: "acfWntEMcom0",
        showInPercent: null,
        showOnSecondaryAxis: true,
        masterLocalIdentifier: "m4",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
    },
    {
        localIdentifier: "m5_pop",
        type: "metric",
        aggregation: null,
        attribute: "acfWntEMcom0",
        showInPercent: null,
        showOnSecondaryAxis: null,
        masterLocalIdentifier: "m4",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    },
];

export const arithmeticMeasureItems: IBucketItem[] = [
    {
        localIdentifier: "am1",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m1", "m2"],
    },
    {
        localIdentifier: "am2",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m1", "am1"],
    },
    {
        localIdentifier: "am3",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m1", "m1"],
    },
    {
        localIdentifier: "am4",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m1_pop", "m1"],
    },
    {
        localIdentifier: "am5",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m3", "m4"],
    },
    {
        localIdentifier: "am6",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m2_pop", "m1"],
    },
    {
        localIdentifier: "am7",
        type: "metric",
        aggregation: null,
        attribute: null,
        showInPercent: null,
        showOnSecondaryAxis: null,
        operator: "sum",
        operandLocalIdentifiers: ["m1", "m3"],
    },
];

export const masterMeasuresWithPercentage: IBucketItem[] = masterMeasureItems.map((measure: IBucketItem) => ({
    ...measure,
    showInPercent: true,
}));

export const attributeFilter: IAttributeFilter = {
    attribute: "some.attribute",
    displayFormRef: uriRef("some/attribute/df/uri"),
    isInverted: false,
    selectedElements: [],
    totalElementsCount: 10,
};

export const dateFilter: IDateFilter = {
    attribute: DATE_DATASET_ATTRIBUTE,
    overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
    interval: {
        granularity: "GDC.year",
        interval: [-1, 0],
        name: "name",
        type: "absolute",
    },
};

export const measureValueFilter: IMeasureValueFilter = {
    measureLocalIdentifier: masterMeasureItems[0].localIdentifier,
    condition: {
        comparison: {
            operator: "GREATER_THAN",
            value: 100,
        },
    },
};

export const rankingFilter: IRankingFilter = {
    measure: masterMeasureItems[0].localIdentifier,
    operator: "TOP",
    value: 3,
};

export const dateFilterSamePeriodPreviousYear: IDateFilter = {
    attribute: DATE_DATASET_ATTRIBUTE,
    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    interval: {
        granularity: "GDC.year",
        interval: [-10, -5],
        name: "interval",
        type: "absolute",
    },
};

export const dateFilterBucketAllTime: IFilters = {
    localIdentifier: "filters",
    items: [
        {
            localIdentifier: "f1",
            type: "date",
            attribute: "attr.datedataset",
            filters: [
                {
                    overTimeComparisonType: "same_period_previous_year",
                    attribute: "attr.datedataset",
                    interval: {
                        name: "all_time",
                        granularity: "GDC.time.year",
                        interval: [1, 3],
                        type: "absolute",
                    },
                },
            ],
            aggregation: null,
        },
    ],
};

export const samePeriodPrevYearFiltersBucket: IFilters = {
    localIdentifier: "filters",
    items: [
        {
            localIdentifier: "f1",
            type: "date",
            attribute: "attr.datedataset",
            filters: [
                {
                    overTimeComparisonType: "same_period_previous_year",
                    attribute: "attr.datedataset",
                    interval: {
                        name: "last_year",
                        granularity: "GDC.time.year",
                        interval: ["-1", "-1"],
                        type: "absolute",
                    },
                },
            ],
            aggregation: null,
            dateDatasetRef,
        },
    ],
};

export const attributeFilterBucketItem: IFilters = {
    localIdentifier: "filters",
    items: [
        {
            attribute: "attr.account.id",
            filters: [
                {
                    attribute: "attr.account.id",
                    displayFormRef: uriRef("account/attribute/df/uri"),
                    selectedElements: [],
                    totalElementsCount: 10,
                    isInverted: false,
                },
            ],
            localIdentifier: "attr1",
            autoCreated: false,
        },
    ],
};

export const rankingFilterBucketItem: IFiltersBucketItem = {
    localIdentifier: "rf1",
    filters: [
        {
            measure: masterMeasureItems[0].localIdentifier,
            operator: "TOP",
            value: 3,
        },
    ],
};

export const emptyReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const attributeItems: IBucketItem[] = [
    {
        localIdentifier: "a1",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.department",
    },
    {
        localIdentifier: "a2",
        type: "attribute",
        aggregation: null,
        attribute: "attr.stage.iswon",
    },
    {
        localIdentifier: "a3",
        type: "attribute",
        attribute: "attr.owner.region",
    },
];

export const sliceByWeekBucketItem: IBucketItem = {
    localIdentifier: "date-week-attribute",
    type: "date",
    attribute: DATE_DATASET_ATTRIBUTE,
    granularity: "GDC.time.week_us",
};

export const geoAttributeItems: IBucketItem[] = [
    {
        localIdentifier: "a1",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.country",
        locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
        dfRef: { uri: "/geo/attribute/displayform/uri/2" },
    },
    {
        localIdentifier: "a2",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.city",
    },
];

export const geoAttributeFilters: IFiltersBucketItem[] = [
    {
        localIdentifier: "a1",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.country",
        filters: [
            {
                attribute: "attr.owner.country",
                displayFormRef: uriRef("owner/attribute/df/uri"),
                isInverted: false,
                totalElementsCount: 10,
                selectedElements: [
                    {
                        title: "string",
                        uri: "string",
                    },
                ],
            },
        ],
    },
    {
        localIdentifier: "a2",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.city",
        filters: [
            {
                attribute: "attr.owner.city",
                displayFormRef: uriRef("owner/attribute/df/uri"),
                totalElementsCount: 10,
                isInverted: true,
                selectedElements: [
                    {
                        title: "string",
                        uri: "string",
                    },
                ],
            },
        ],
    },
];

export const attributeFilters: IFiltersBucketItem[] = [
    {
        localIdentifier: "a1",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.department",
        filters: [
            {
                attribute: "attr.owner.department",
                displayFormRef: uriRef("owner/attribute/df/uri"),
                isInverted: false,
                totalElementsCount: 10,
                selectedElements: [
                    {
                        title: "string",
                        uri: "string",
                    },
                ],
            },
        ],
    },
    {
        localIdentifier: "a2",
        type: "attribute",
        aggregation: null,
        attribute: "attr.stage.iswon",
        filters: [
            {
                attribute: "attr.stage.iswon",
                displayFormRef: uriRef("iswon/attribute/df/uri"),
                totalElementsCount: 10,
                isInverted: true,
                selectedElements: [
                    {
                        title: "string",
                        uri: "string",
                    },
                ],
            },
        ],
    },
    {
        localIdentifier: "a3",
        type: "attribute",
        attribute: "attr.owner.region",
        filters: [
            {
                attribute: "attr.owner.region",
                displayFormRef: uriRef("owner/attribute/df/uri"),
                isInverted: true,
                totalElementsCount: 10,
                selectedElements: [],
            },
        ],
    },
];

export const dateFilterItem: IBucketItem = {
    localIdentifier: "a1",
    type: "date",
    attribute: "attr.datedataset",
    aggregation: null,
    showInPercent: null,
    filters: [dateFilter],
};

export const dateItem: IBucketItem = {
    localIdentifier: "a1",
    type: "date",
    attribute: "attr.datedataset",
    aggregation: null,
    showInPercent: null,
    dateDatasetRef: idRef("ds1"),
};

export const dateItem2: IBucketItem = {
    localIdentifier: "a2",
    type: "date",
    attribute: "attr.datedataset.2",
    aggregation: null,
    showInPercent: null,
    dateDatasetRef: idRef("ds2"),
};

export const dateItem3: IBucketItem = {
    localIdentifier: "a3",
    type: "date",
    attribute: "attr.datedataset.3",
    aggregation: null,
    showInPercent: null,
    dateDatasetRef: idRef("ds3"),
};

export const overTimeComparisonDateItem: IBucketItem = {
    aggregation: null,
    showInPercent: null,
    operator: null,
    operandLocalIdentifiers: null,
    granularity: null,
    masterLocalIdentifier: null,
    localIdentifier: "2fb4a818526f4ca18c926b1a11adc859",
    filters: [dateFilterSamePeriodPreviousYear],
    attribute: "attr.datedataset",
    dateDatasetRef,
};

export const dateItemWithDateDataset: IBucketItem = {
    localIdentifier: "a1",
    type: "date",
    attribute: "attr.datedataset",
    aggregation: null,
    showInPercent: null,
    dateDatasetRef,
};

const defaultSortItem = {
    attributeSortItem: {
        attributeIdentifier: "a1",
        direction: "asc",
    },
};

const columnWidths: ColumnWidthItem[] = [
    {
        attributeColumnWidthItem: {
            attributeIdentifier: "a1",
            width: { value: 100 },
        },
    },
];

export const secondaryMeasuresAndAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(0, 3),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 2),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const secondaryMeasureReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const measuresOnSecondaryAxisAndAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(2, 4),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const secondaryAndTertiaryMeasuresWithTwoAttributesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "tertiary_measures",
            items: masterMeasureItems.slice(1, 2),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 2),
    },
};

export const measuresAndDateReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [dateItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const simpleStackedReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 2),
    },
    properties: {
        sortItems: [defaultSortItem],
        controls: {
            columnWidths,
            test: "test",
        },
    },
};

export const oneMetricReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const oneMeasureWithInvalidOverTimeComparisonRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], derivedMeasureItems[0]],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const measureWithDerivedWithoutDateFilterRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], derivedMeasureItems[0], arithmeticMeasureItems[3]],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const samePeriodPreviousYearRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], derivedMeasureItems[0]],
        },
        {
            localIdentifier: "view",
            items: [dateItemWithDateDataset],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const measureWithDerivedAndPercentageRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                masterMeasuresWithPercentage[0],
                {
                    ...derivedMeasureItems[0],
                    showInPercent: true,
                },
            ],
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const multipleMeasuresWithPercentageRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasuresWithPercentage.slice(0, 2),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const multipleSecondaryMeasuresWithPercentageRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasuresWithPercentage.slice(2, 4),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const attributeInStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], masterMeasureItems[1]],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [attributeItems[0]],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

const firstMeasureDerivedBuckets = [
    {
        localIdentifier: "measures",
        items: [derivedMeasureItems[0], masterMeasureItems[0]],
    },
    {
        localIdentifier: "view",
        items: [],
    },
];

export const measureWithDerivedAsFirstRefPoint: IReferencePoint = {
    buckets: firstMeasureDerivedBuckets,
    filters: samePeriodPrevYearFiltersBucket,
};

export const measureWithDerivedAsFirstWithStackRefPoint: IReferencePoint = {
    buckets: [
        ...firstMeasureDerivedBuckets,
        {
            localIdentifier: "stack",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const measureWithDerivedAsFirstWithDateInStackRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [derivedMeasureItems[0], masterMeasureItems[0]],
        },
        {
            localIdentifier: "view",
            items: [dateItem, dateItem],
        },
        {
            localIdentifier: "stack",
            items: [dateItem2],
        },
    ],
    filters: samePeriodPrevYearFiltersBucket,
};

export const samePeriodPreviousYearAndAttributesRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], derivedMeasureItems[0]],
        },
        {
            localIdentifier: "attribute",
            items: [dateItem, ...attributeItems],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const measureWithDateAfterOtherAttributes: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [masterMeasureItems[0], derivedMeasureItems[0]],
        },
        {
            localIdentifier: "attribute",
            items: [...attributeItems.slice(0, 2), dateItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleMetricsAndCategoriesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "view",
            items: attributeItems,
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters,
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const multipleMetricBucketsAndCategoryReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(1, 2),
        },
        {
            localIdentifier: "tertiary_measures",
            items: masterMeasureItems.slice(2, 3),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const multipleMetricBucketsWithPercentageRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasuresWithPercentage.slice(0, 2),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasuresWithPercentage.slice(2, 4),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 1),
    },
};

export const oneMetricAndManyCategoriesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems,
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters,
    },
};

export const oneMetricAndManyCategoriesAndOneStackRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 2),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(2, 3),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 3),
    },
};

export const dateAsFirstCategoryReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [dateItem, attributeItems[1]],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAsSecondViewByItemReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [attributeItems[1], dateItem],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const twoMeasuresAndDateAsSecondViewByItemReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "view",
            items: [attributeItems[1], dateItem],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const threeDifferentDatesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "rows",
            items: [dateItem, dateItem2],
        },
        {
            localIdentifier: "columns",
            items: [dateItem3],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const threeDifferentDatesReferencePointChart: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "view",
            items: [dateItem, dateItem2],
        },
        {
            localIdentifier: "stack",
            items: [dateItem3],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const twoIdenticalDatesInRows: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "rows",
            items: [dateItem, dateItem],
        },
        {
            localIdentifier: "columns",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const twoIdenticalDatesInRowsWithSingleMeasure: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attributes",
            items: [{ ...dateItem }, { ...dateItem }],
        },
        {
            localIdentifier: "columns",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const twoDatesInColumnChart: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [dateItem],
        },
        {
            localIdentifier: "stack",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const threeDatesInColumnChart: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [dateItem, dateItem2],
        },
        {
            localIdentifier: "stack",
            items: [dateItem3],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleDatesInRowsOnly: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "rows",
            items: [dateItem, dateItem, dateItem2, dateItem3],
        },
        {
            localIdentifier: "columns",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const threeDatesSameDimensionRowsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "rows",
            items: [dateItem, dateItem],
        },
        {
            localIdentifier: "columns",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleDatesNotAsFirstReferencePointWithSingleMeasureColumn: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [attributeItems[0], dateItem],
        },
        {
            localIdentifier: "stack",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleDatesNotAsFirstReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "rows",
            items: [attributeItems[0], dateItem, dateItem2],
        },
        {
            localIdentifier: "columns",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleDatesNotAsFirstReferencePointWithSingleMeasure: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "rows",
            items: [attributeItems[0], dateItem, dateItem2],
        },
        {
            localIdentifier: "columns",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleMeasureAndDateInRowsAndColumReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "rows",
            items: [dateItem],
        },
        {
            localIdentifier: "columns",
            items: [dateItem2],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAsSecondCategoryReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems,
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAsThirdCategoryReferencePointWithoutStack: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [...attributeItems.slice(0, 2), dateItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAsSecondCategoryReferencePointWithoutStack: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [dateItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleAttributesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems,
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(2, 3),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const oneMetricOneStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(2, 3),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleMetricsNoCategoriesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            },
        ],
    },
};

export const oneMetricNoCategoriesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const metricWithViewByDateAndDateFilterReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [dateItem],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: dateFilterBucketAllTime,
};

export const oneMetricAndCategoryAndStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const oneMetricAndGeoCategoryAndStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: geoAttributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const oneMetricAndLocationAndSegmentReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "location",
            items: geoAttributeItems.slice(0, 1),
        },
        {
            localIdentifier: "segment",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const viewByWithDateAndGeoAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [...geoAttributeItems.slice(0, 1), dateItem],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const viewByWithNonGeoAndGeoAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [...attributeItems.slice(0, 1), ...geoAttributeItems.slice(0, 1)],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const sameCategoryAndStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(1, 2),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const oneStackAndNoCategoriesReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const overTimeComparisonRecommendationRefPoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [dateItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [
            {
                localIdentifier: "f1",
                type: "date",
                attribute: "attr.datedataset",
                filters: [dateFilter],
                aggregation: null,
            },
        ],
    },
};

export const comparisonAndTrendingRecommendationReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const percentRecommendationReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const TableRefencePointWithInvalidSort: IReferencePoint = {
    ...dateAsFirstCategoryReferencePoint,
    properties: {
        sortItems: [
            {
                attributeSortItem: {
                    attributeIdentifier: "unknown",
                    direction: "asc",
                },
            },
        ],
    },
};

export const oneMetricAndManyCategoriesReferencePointWithInvalidSort: IReferencePoint = {
    ...oneMetricAndManyCategoriesReferencePoint,
    properties: {
        sortItems: [
            {
                attributeSortItem: {
                    attributeIdentifier: "unknown",
                    direction: "asc",
                },
            },
        ],
    },
};

export const tableTotalsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
            totals: [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                    alias: "Sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [
            {
                attributeSortItem: {
                    attributeIdentifier: "a1",
                    direction: "asc",
                },
            },
        ],
    },
};

export const tableGrandAndSubtotalsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
            totals: [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a2",
                    type: "sum",
                    alias: "Sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [
            {
                attributeSortItem: {
                    attributeIdentifier: "a1",
                    direction: "asc",
                },
            },
        ],
    },
};

export const wrongBucketsOrderReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const bucketsJustStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const wrongBucketsOrderInLineReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "segment",
            items: attributeItems.slice(1, 2),
        },
        {
            localIdentifier: "trend",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const twoMeasureBucketsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(2),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const threeMeasuresBucketsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(1, 2),
        },
        {
            localIdentifier: "tertiary_measures",
            items: masterMeasureItems.slice(2, 3),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const multipleMetricsOneStackByReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems,
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const dateAttributeOnStackBucketReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [dateFilterItem],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [
            {
                localIdentifier: "f1",
                type: "date",
                attribute: DATE_DATASET_ATTRIBUTE,
                filters: [dateFilter],
                aggregation: null,
            },
        ],
    },
};

export const dateAttributeOnViewAndStackReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: [
                {
                    ...dateItem,
                    localIdentifier: "date1",
                },
            ],
        },
        {
            localIdentifier: "stack",
            items: [
                {
                    ...dateItem,
                    localIdentifier: "date2",
                },
            ],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAttributeOnRowsAndColumnsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("created"),
                    localIdentifier: "date1",
                },
            ],
        },
        {
            localIdentifier: "columns",
            items: [
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("created"),
                    localIdentifier: "date2",
                },
            ],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const dateAttributesOnRowsReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "attribute",
            items: [
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("created"),
                    localIdentifier: "date1",
                },
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("closed"),
                    localIdentifier: "date2",
                },
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("snapshot"),
                    localIdentifier: "date3",
                },
                {
                    ...dateItem,
                    dateDatasetRef: uriRef("created"),
                    localIdentifier: "date4",
                },
            ],
        },
        {
            localIdentifier: "columns",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const headlineWithMeasureInPrimaryBucket: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "secondary_measures",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            },
        ],
    },
};

export const headlineWithMeasureInSecondaryBucket: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        sortItems: [
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
            },
        ],
    },
};

export const twoAttributesWithFiltersReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 2),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const oneAttributeTwoFiltersReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 2),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const firstMeasureArithmeticAlongWithAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [arithmeticMeasureItems[0], masterMeasureItems[0], masterMeasureItems[1]],
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const firstMeasureArithmeticNoAttributeReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [arithmeticMeasureItems[0], masterMeasureItems[0], masterMeasureItems[1]],
        },
        {
            localIdentifier: "view",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedAreaReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
                arithmeticMeasureItems[5],
            ],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedBubbleReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                arithmeticMeasureItems[1],
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [derivedMeasureItems[1], arithmeticMeasureItems[0]],
        },
        {
            localIdentifier: "tertiary_measures",
            items: [arithmeticMeasureItems[3], arithmeticMeasureItems[5]],
        },
        {
            localIdentifier: "view",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedHeatMapReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                derivedMeasureItems[0],
                arithmeticMeasureItems[3],
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[5],
            ],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedPieReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
                arithmeticMeasureItems[5],
            ],
        },
        {
            localIdentifier: "view",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedScatterReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                derivedMeasureItems[0],
                arithmeticMeasureItems[3],
                masterMeasureItems[0],
                masterMeasureItems[1],
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[5],
            ],
        },
        {
            localIdentifier: "attribute",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const mixOfMeasuresWithDerivedAndArithmeticFromDerivedTreeMapReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
                arithmeticMeasureItems[5],
            ],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "segment",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
};

export const stackMeasuresToPercentReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [...masterMeasureItems.slice(0, 2)],
        },
        {
            localIdentifier: "view",
            items: [],
        },
        {
            localIdentifier: "segment",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        controls: {
            stackMeasuresToPercent: true,
        },
    },
};

export const oneMeasuresOneCategoryOneStackItemWithStackMeasuresToPercent: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: attributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        controls: {
            stackMeasuresToPercent: true,
        },
    },
};

export const oneMeasuresOneCategoryWithStackMeasuresToPercent: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        controls: {
            stackMeasuresToPercent: true,
        },
    },
};

export const twoMeasuresOneCategoryWithStackMeasuresToPercent: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "view",
            items: attributeItems.slice(0, 1),
        },
        {
            localIdentifier: "stack",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [],
    },
    properties: {
        controls: {
            stackMeasuresToPercent: true,
        },
    },
};

export const measureValueFilterReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(1),
        },
        {
            localIdentifier: "view",
            items: attributeItems,
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [
            {
                localIdentifier: "fbv1",
                filters: [
                    {
                        measureLocalIdentifier: masterMeasureItems[0].localIdentifier,
                        condition: {
                            comparison: {
                                operator: "GREATER_THAN",
                                value: 100,
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "fbv2",
                filters: [
                    {
                        measureLocalIdentifier: masterMeasureItems[1].localIdentifier,
                        condition: {
                            range: {
                                operator: "BETWEEN",
                                from: 100,
                                to: 200,
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "fbv3",
                filters: [
                    {
                        measureLocalIdentifier: masterMeasureItems[2].localIdentifier,
                    },
                ],
            },
        ],
    },
};

export const measureValueFilterByDerivedReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasureItems.slice(1).concat(derivedMeasureItems),
        },
        {
            localIdentifier: "view",
            items: attributeItems,
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: [
            {
                localIdentifier: "filter_by_derived_measure",
                filters: [
                    {
                        measureLocalIdentifier: derivedMeasureItems[0].localIdentifier,
                        condition: {
                            comparison: {
                                operator: "GREATER_THAN",
                                value: 100,
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "fbv2",
                filters: [
                    {
                        measureLocalIdentifier: masterMeasureItems[1].localIdentifier,
                        condition: {
                            range: {
                                operator: "BETWEEN",
                                from: 100,
                                to: 200,
                            },
                        },
                    },
                ],
            },
        ],
    },
};

export const simpleGeoPushpinReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "location",
            items: geoAttributeItems.slice(0, 1),
        },
        {
            localIdentifier: "size",
            items: masterMeasureItems.slice(0, 1),
        },
        {
            localIdentifier: "color",
            items: masterMeasureItems.slice(1, 2),
        },
        {
            localIdentifier: "segment",
            items: geoAttributeItems.slice(1, 2),
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: geoAttributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const twoMeasuresWithShowInPercentOnSecondaryAxisReferencePoint: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasuresWithPercentage.slice(2, 3),
        },
        {
            localIdentifier: "secondary_measures",
            items: masterMeasuresWithPercentage.slice(3, 4),
        },
        {
            localIdentifier: "view",
            items: geoAttributeItems.slice(0, 1),
        },
        {
            localIdentifier: "segment",
            items: [],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: geoAttributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [defaultSortItem],
    },
};

export const tableWithNativeTotal: IReferencePoint = {
    buckets: [
        {
            localIdentifier: "measures",
            items: masterMeasureItems.slice(0, 2),
        },
        {
            localIdentifier: "attribute",
            items: attributeItems.slice(0, 2),
            totals: [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                    alias: "Sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ],
        },
    ],
    filters: {
        localIdentifier: "filters",
        items: attributeFilters.slice(0, 1),
    },
    properties: {
        sortItems: [
            {
                attributeSortItem: {
                    attributeIdentifier: "a1",
                    direction: "asc",
                },
            },
        ],
    },
};

export const rankingFilterAndInvalidNatTotal: IReferencePoint = {
    ...tableWithNativeTotal,
    filters: {
        localIdentifier: "filters",
        items: [
            ...tableWithNativeTotal.filters.items,
            {
                localIdentifier: "ranking1",
                filters: [rankingFilter],
            },
        ],
    },
};

export const measureValueFilterAndInvalidNatTotal: IReferencePoint = {
    ...tableWithNativeTotal,
    filters: {
        localIdentifier: "filters",
        items: [
            ...tableWithNativeTotal.filters.items,
            {
                localIdentifier: "mvf1",
                filters: [measureValueFilter],
            },
        ],
    },
};
