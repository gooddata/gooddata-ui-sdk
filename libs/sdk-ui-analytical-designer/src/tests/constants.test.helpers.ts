// (C) 2007-2026 GoodData Corporation

import { omit } from "lodash-es";

import {
    type IFilter as IFilterModel,
    type IListedDashboard,
    type IMetadataObject,
    type IVisualizationClass,
    type ObjRef,
    idRef,
    localIdRef,
    newAbsoluteDateFilter,
    newMeasure,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { setDateDatasetsMeta } from "../actions/data_actions.js";
import { ATTRIBUTE, DATE } from "../constants/bucket.js";
import {
    LOCAL_BAR,
    LOCAL_COLUMN,
    LOCAL_COMBO2,
    LOCAL_HEADLINE,
    LOCAL_LINE,
    LOCAL_PIE,
    LOCAL_TABLE,
} from "../constants/visualization_types.js";
import { decoratedDateDatasets as createDecoratedDateDatasets } from "../models/date_dataset.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { DecoratedDateDataset, type IDecoratedDateDataset } from "../models/decorated_date_dataset.js";
import { type IDecoratedDateDatasets } from "../models/decorated_date_datasets.js";
import { combinedRootReducer } from "../reducers/combined_root_reducer.js";
import { dateDatasetsInitialState } from "../store/date_datasets/date_datasets_state.js";
import { type IDateFilter, type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { newInsight } from "../tests/insightMocking.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import {
    type IBucket as IVisualizationObjectBucket,
    type VisualizationObjectExtendedFilter,
} from "../typings/bear/bearTypes.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";
import { type IDateDataset } from "../typings/datasets.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

export const elements = [
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168279",
        title: "CompuSci",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
        title: "Educationly",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169655",
        title: "Explorer",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
        title: "Grammar Plus",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
        title: "PhoenixSoft",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169656",
        title: "TouchAll",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=965523",
        title: "WonderKid",
    },
];

// State fixtures hold these mocks BY REFERENCE, so a single in-place mutation anywhere would
// corrupt every later test in the worker. Deep-freeze turns that into a loud throw at the
// mutation site.
function deepFreezeMock<T>(value: T): T {
    if (value && typeof value === "object") {
        Object.values(value).forEach(deepFreezeMock);
        Object.freeze(value);
    }
    return value;
}

export const defaultBuckets: IRawBuckets = deepFreezeMock([
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
]);

export const tableVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:table",
        iconSelected: "local:table.selected",
        orderIndex: 0.0,
        identifier: "id_table",
        url: LOCAL_TABLE,
        uri: "/gdc/md/mockproject/obj/table",
        title: "Table",
    },
};

export const columnVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:column",
        iconSelected: "local:column.selected",
        orderIndex: 1.0,
        identifier: "id_column",
        uri: "/gdc/md/mockproject/obj/column",
        url: LOCAL_COLUMN,
        title: "Column chart",
    },
};

export const barVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:bar",
        iconSelected: "local:bar.selected",
        orderIndex: 2.0,
        identifier: "id_bar",
        uri: "/gdc/md/mockproject/obj/bar",
        url: LOCAL_BAR,
        title: "Bar chart",
    },
};

export const lineVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:line",
        iconSelected: "local:line.selected",
        orderIndex: 3.0,
        identifier: "id_line",
        uri: "/gdc/md/mockproject/obj/line",
        url: LOCAL_LINE,
        title: "Line chart",
    },
};

export const pieVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:pie",
        iconSelected: "local:pie.selected",
        orderIndex: 4.0,
        identifier: "id_pie",
        uri: "/gdc/md/mockproject/obj/pie",
        url: LOCAL_PIE,
        title: "Pie chart",
    },
};

export const comboVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:combo",
        iconSelected: "local:combo.selected",
        orderIndex: 4.0,
        identifier: "id_combo",
        uri: "/gdc/md/mockproject/obj/combo",
        url: LOCAL_COMBO2,
        title: "Combo chart",
    },
};

export const headlineVisualizationClass: IVisualizationClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:headline",
        iconSelected: "local:headline.selected",
        orderIndex: 4.0,
        identifier: "id_headline",
        uri: "/gdc/md/mockproject/obj/headline",
        url: LOCAL_HEADLINE,
        title: "Headline chart",
    },
};

export const defaultVisualizationClasses: IVisualizationClass[] = [
    tableVisualizationClass,
    columnVisualizationClass,
    barVisualizationClass,
    lineVisualizationClass,
    pieVisualizationClass,
];

export const defaultUiConfig = {
    buckets: {
        measures: {
            accepts: ["metric", "fact", "attribute"],
            allowsDuplicateItems: true,
            enabled: true,
            allowsReordering: true,
            allowsSwapping: false,
            itemsLimit: 20,
            isShowInPercentEnabled: false,
            canAddItems: true,
            title: "Measures",
        },
        view: {
            accepts: ["attribute", "date"],
            itemsLimit: 1,
            allowsSwapping: true,
            allowsReordering: false,
            enabled: true,
            canAddItems: true,
            isShowInPercentEnabled: false,
            title: "View by",
        },
        stack: {
            accepts: ["attribute"],
            itemsLimit: 1,
            allowsSwapping: true,
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
            canAddItems: true,
            title: "Stack by",
        },
        filters: {
            accepts: ["attribute", "date"],
            itemsLimit: 20,
            allowsReordering: false,
            enabled: true,
            isShowInPercentEnabled: false,
        },
    },
};

export const countryElements = [
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288",
        title: "US & A",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168289",
        title: "Canada",
    },
    {
        uri: "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168290",
        title: "Colombia",
    },
];

export const countryElementNotAvailable = {
    uri: "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666",
    title: "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666",
    available: false,
};

export const cartAdditionsFact = {
    id: "fact.spend_analysis.cart_additions",
    identifier: "fact.spend_analysis.cart_additions",
    isAvailable: true,
    summary: "",
    title: "Cart Additions",
    type: "fact",
    uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15418"),
};

export const awarenessMetric = {
    expression: "SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])",
    format: "[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0",
    id: "aaeFKXFYiCc0",
    identifier: "aaeFKXFYiCc0",
    isMeasure: true,
    isAvailable: true,
    summary: "",
    title: "Awareness",
    type: "metric",
    uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/16212"),
};

export const awarenessMetricLong = {
    ...awarenessMetric,
    id: `${awarenessMetric.id}_long`,
    identifier: `${awarenessMetric.identifier}_long`,
    title: "Awareness_5UOwfhdsuaijxVxvh1Q6uYAcSZP1qTdDrnCW9m1RsDfTX0vHdk3tqWMxAM8JlcUxpP979Ip3GlbgzOtZQSG9jvNHUllj2AwY5FLc1L5Q91sBW5DFAelefEEvLSIhrqvhgdat2zu0TGxqJdPfcKSPoUciPtZYZ3vBLZWeX4sVpmrbVbga3cSuOIBzLBISJi7ie8Cd6yhdPxe3vE0OFHfV1ynuGpymtXAkJwcoI8F3NOQ6jXmbQdrGdjaFJWrDGGIRoNwWVI0mAhN8Rd1kJXJCccBiZISTlXOS1BgAFBsf2Z6uH1GDVu3NbCZeb3EdCfk3qWqeeVkSJTBtRnL5HIm2DKsNVaj3FtlgJvLc2jMYrPRdDbIRG3ivkc9Ergu5y82EvOpc1USG7QMb07T8A1fu9ihcUDYmdOlzVkUGfthYyXZI8jXxa6jVYEkbO32KimIYehXU0EOCNILkXHrAAZDqr6RmLEEm3PgSK4ZNaJghqQe2l6tPLTX6cp0glA3YFPUVuIeZYQ1H6455dm6yQqOE79abAMK0wOjyET2n9cSk6Qch3PIah2Oc9gwenKHsjgu0ol82a7xw3pWoCsTQFofPycEM45kO9eCfrks4BoObofynUvOJADkA9qUL72AKUxzC894nfGcLGPnlzal8lS9WASwRAFV9RXT5GqlMu5jo4xlXfOtEMnKaovQvw0Uh1nTsmT0OsiHlrRSwi3eCZrUr7XDJ3XSlAVCmLPJit4AGExvOXDBrYgLULBPcJTaHa3mvXQJ4iCjZWY552EOOMFCgmJKANFwLTUnytbHqq0piXYjyTUIWpHSIgsFAmqleiOfmMW41RbdjYRYZUyDv7unRd19U0TFCLSY35WvjiOrfyb30HlhRzEe8bvPu8RC6XxMREwIt51acbJp1tiHKlX4kW3zLk36wdwg6Na38mwb9xvXAMWSdi0rBDYm6SEPKdhhWeCTa590f3lqPwX9Mu7734ns8fleya3nste5vdbc8_end",
};

export const awarenessMetricPercent = {
    ...awarenessMetric,
    id: `${awarenessMetric.id}_percent`,
    identifier: `${awarenessMetric.identifier}_percent`,
    title: `${awarenessMetric.title}_percent`,
    format: "#,##0%",
};

export const productAttribute: ICatalogEntry = {
    dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/948",
    summary: "",
    identifier: "attr.product.id",
    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
    dfIdentifier: "label.product.id.name",
    uri: "/gdc/md/TeamOneGoodSales1/obj/949",
    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/949"),
    granularity: "attr.product.id",
    elementsUri: "/gdc/md/TeamOneGoodSales1/obj/952/elements",
    title: "Product",
    type: "attribute",
    id: "attr.product.id",
    attribute: "attr.product.id",
    isAvailable: true,
    displayForms: [
        {
            id: "label.product.id.name",
            uri: "/gdc/md/TeamOneGoodSales1/obj/952",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
            type: undefined,
            title: "Product (long)",
        },
        {
            id: "label.product.id.name.short",
            uri: "/gdc/md/TeamOneGoodSales1/obj/953",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/953"),
            type: undefined,
            title: "Product (short)",
        },
        {
            id: "label.product.id.name.legacyGeo",
            uri: "/gdc/md/TeamOneGoodSales1/obj/954",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/954"),
            type: "GDC.geo.ausstates.code",
            title: "Product (location)",
        },
    ],
};

// seeded both as an itemCache entry and as a raw VIEW bucket item (highlighting saga)
export const countryAttribute: ICatalogEntry & IRawBucketItem = {
    dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/902",
    summary: "",
    identifier: "attr.country.id",
    dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
    dfUri: "/gdc/md/TeamOneGoodSales1/obj/902",
    dfUris: ["/gdc/md/TeamOneGoodSales1/obj/902", "/gdc/md/TeamOneGoodSales1/obj/900"],
    dfIdentifier: "label.country.id.name",
    uri: "/gdc/md/TeamOneGoodSales1/obj/901",
    granularity: "attr.country.id",
    elementsUri: "/gdc/md/TeamOneGoodSales1/obj/901/elements",
    title: "Country",
    type: "attribute",
    id: "attr.country.id",
    attribute: "attr.country.id",
    isAvailable: true,
    localIdentifier: "a1",
};

export const currencyAttribute: ICatalogEntry = {
    dimensionUri: "/dimension/uri",
    summary: "",
    identifier: "attr.currency.id",
    dfRef: uriRef("/df/uri"),
    dfUri: "/df/uri",
    dfIdentifier: "label.currency.id.name",
    uri: "/uri",
    granularity: "attr.currency.id",
    elementsUri: "/uri/elements",
    title: "Currency",
    type: "attribute",
    id: "attr.currency.id",
    isAvailable: true,
    displayForms: [
        {
            id: "label.currency.id.name",
            uri: "/df/uri",
            ref: uriRef("/df/uri"),
            type: undefined,
            title: "Currency",
        },
    ],
};

export const cityAttribute: ICatalogEntry = {
    dimensionUri: "/dimension/uri",
    summary: "",
    identifier: "attr.city.id",
    dfUri: "/df/uri",
    dfIdentifier: "label.currency.id.name",
    uri: "/uri",
    granularity: "attr.currency.id",
    elementsUri: "/uri/elements",
    title: "Currency",
    type: "attribute",
    id: "attr.currency.id",
    isAvailable: true,
    isLocationIconVisible: true,
    locationDisplayFormUri: "/uri/geoDF",
    locationDisplayFormRef: uriRef("/uri/geoDF"),
    displayForms: [
        {
            id: "label.city.id.name",
            uri: "/city/df/uri",
            ref: uriRef("/city/df/uri"),
            type: "GDC.geo.pin",
            title: "City",
        },
    ],
};

export const repPerformanceComputedAttribute: ICatalogEntry = {
    identifier: "rep_performance",
    ref: idRef("rep_performance", "computedAttribute"),
    dfRef: idRef("rep_performance", "computedAttribute"),
    dfIdentifier: "rep_performance",
    title: "Rep Performance",
    type: "computedAttribute",
};

export const itemCache: ICatalogEntries = {
    "fact.fact.spend_analysis.cart_additions": cartAdditionsFact,
    "attribute.fact.spend_analysis.cart_additions": cartAdditionsFact,
    "attribute.aaeFKXFYiCc0": awarenessMetric,
    "metric.aaeFKXFYiCc0": awarenessMetric,
    "metric.aaeFKXFYiCc0_long": awarenessMetricLong,
    "metric.aaeFKXFYiCc0_percent": awarenessMetricPercent,
    "attribute.attr.product.id": productAttribute,
    "computedAttribute.rep_performance": repPerformanceComputedAttribute,
    "attribute.attr.country.id": countryAttribute,
    "attribute.attr.currency.id": currencyAttribute,
    "attribute.attr.city.id": cityAttribute,
    "activity.date": idRef("activity.date"),
    "activity.week": idRef("activity.week"),
    "activity.month": idRef("activity.month"),
    "activity.quarter": idRef("activity.quarter"),
    "activity.year": idRef("activity.year"),
    "activity.day.in.week": idRef("activity.day.in.week"),
    "activity.day.in.month": idRef("activity.day.in.month"),
    "activity.day.in.quarter": idRef("activity.day.in.quarter"),
    "activity.day.in.year": idRef("activity.day.in.year"),
    "activity.week.in.quarter": idRef("activity.week.in.quarter"),
    "activity.week.in.year": idRef("activity.week.in.year"),
    "activity.month.in.quarter": idRef("activity.month.in.quarter"),
    "activity.month.in.year": idRef("activity.month.in.year"),
    "activity.quarter.in.year": idRef("activity.quarter.in.year"),
    "timeline.date": idRef("timeline.date"),
    "timeline.week": idRef("timeline.week"),
    "timeline.month": idRef("timeline.month"),
    "timeline.quarter": idRef("timeline.quarter"),
    "timeline.year": idRef("timeline.year"),
    "timeline.day.in.week": idRef("timeline.day.in.week"),
    "timeline.day.in.month": idRef("timeline.day.in.month"),
    "timeline.day.in.quarter": idRef("timeline.day.in.quarter"),
    "timeline.day.in.year": idRef("timeline.day.in.year"),
    "timeline.week.in.quarter": idRef("timeline.week.in.quarter"),
    "timeline.week.in.year": idRef("timeline.week.in.year"),
    "timeline.month.in.quarter": idRef("timeline.month.in.quarter"),
    "timeline.month.in.year": idRef("timeline.month.in.year"),
    "timeline.quarter.in.year": idRef("timeline.quarter.in.year"),
};

export const dateCreated: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.year",
            dfRef: uriRef("/gdc/md/project/obj/df_one"),
            dfUri: "/gdc/md/project/obj/df_one",
            dfIdentifier: "activity.df.one",
            uri: "/gdc/md/TeamOneGoodSales1/obj/701",
            granularity: "activity.year",
            title: "Year (Activity)",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/701"),
            displayForms: [
                {
                    id: "activity.df.one",
                    uri: "/gdc/md/project/obj/df_one",
                    ref: uriRef("/gdc/md/project/obj/df_one"),
                    title: "Year (Activity)",
                },
                {
                    id: "activity.df.two",
                    uri: "/gdc/md/project/obj/df_two",
                    ref: uriRef("/gdc/md/project/obj/df_two"),
                    title: "Year (Activity) - alternative",
                },
            ],
        },
        {
            dateType: "GDC.time.week_us",
            dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/629"),
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/629",
            dfIdentifier: "date.dim_date",
            uri: "/gdc/md/TeamOneGoodSales1/obj/624",
            granularity: "activity.euweek",
            title: "Week/Year (Activity)",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/624"),
            displayForms: [
                {
                    id: "date.dim_date",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/629",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/629"),
                    title: "Week/Year (Activity)",
                },
            ],
        },
        {
            dateType: "GDC.time.quarter",
            dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/1629"),
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/1629",
            dfIdentifier: "quarter.dim_date",
            uri: "/gdc/md/TeamOneGoodSales1/obj/1624",
            granularity: "GDC.time.quarter",
            title: "Quarter (Activity)",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/1624"),
            displayForms: [],
        },
    ],
    id: "date.dim_date",
    identifier: "date.dim_date",
    isAvailable: true,
    relevance: 0,
    summary: "Date dimension (Date Created)",
    title: "Date dimension (Date Created)",
    type: "dimension",
    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
};

export const measureBucketItems: IRawBucketItems = deepFreezeMock([
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m1",
        type: "metric",
        format: null,
    },
    {
        aggregation: "sum",
        alias: null,
        attribute: "fact.spend_analysis.cart_additions",
        filters: [],
        showInPercent: true,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m2",
        type: "metric",
        format: "#,##0.00%",
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m3_pop",
        filters: [],
        masterLocalIdentifier: "m3",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        format: null,
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: "renamed",
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m3_renamed_pop",
        filters: [],
        masterLocalIdentifier: "m3",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        format: null,
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m3",
        format: null,
        filters: [
            {
                attribute: countryAttribute.id,
                displayFormRef: countryAttribute.dfRef,
                allElements: countryElements,
                selectedElements: [countryElements[0], countryElementNotAvailable],
                isInverted: false,
                totalElementsCount: countryElements.length,
            },
            {
                attribute: DATE_DATASET_ATTRIBUTE,
                allElements: [],
                selectedElements: [],
                isInverted: true,
                totalElementsCount: 0,
                dimension: "date.dim_date",
                overTimeComparisonType: null,
                interval: {
                    granularity: "GDC.time.year",
                    type: "relative",
                    interval: [-5, -5],
                },
            },
        ],
    },
    {
        aggregation: "count",
        attribute: "attr.product.id",
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        filters: [],
        localIdentifier: "m4",
        type: "metric",
        format: "#,##0",
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m3_previous_period",
        filters: [],
        masterLocalIdentifier: "m3",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
        format: null,
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: "previous_period_renamed",
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m3_renamed_previous_period",
        filters: [],
        masterLocalIdentifier: "m3",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m5",
        type: "metric",
        operandLocalIdentifiers: ["m1", "m2"],
        operator: ArithmeticOperatorType.SUM,
        format: "##AM",
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m6",
        type: "metric",
        operandLocalIdentifiers: ["m1", "m5"],
        operator: ArithmeticOperatorType.RATIO,
        format: "#,##0.00",
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m7",
        type: "metric",
        operandLocalIdentifiers: ["m1", "m6"],
        operator: ArithmeticOperatorType.DIFFERENCE,
        format: "#,##0.00",
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m8",
        type: "metric",
        operandLocalIdentifiers: ["m1", "m2"],
        operator: ArithmeticOperatorType.CHANGE,
        format: "#,##0.00%",
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m9",
        type: "metric",
        operandLocalIdentifiers: [null, null],
        operator: ArithmeticOperatorType.DIFFERENCE,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m10",
        type: "metric",
        operandLocalIdentifiers: [null, "m2"],
        operator: ArithmeticOperatorType.RATIO,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        localIdentifier: "m11",
        type: "metric",
        operandLocalIdentifiers: ["notAvailableMeasureIdentifier", null],
        operator: ArithmeticOperatorType.SUM,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m5_previous_period",
        filters: [],
        masterLocalIdentifier: "m5",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        type: "metric",
        localIdentifier: "m7_previous_period",
        filters: [],
        masterLocalIdentifier: "m7",
        overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
        format: null,
    },
    {
        attribute: "aaeFKXFYiCc0",
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m1_pop",
        type: "metric",
        masterLocalIdentifier: "m1",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        format: null,
    },
    {
        aggregation: "sum",
        alias: null,
        attribute: "fact.spend_analysis.cart_additions",
        filters: [],
        showInPercent: true,
        showOnSecondaryAxis: false,
        isTotalMeasure: false,
        isThresholdMeasure: false,
        localIdentifier: "m2_pop",
        type: "metric",
        masterLocalIdentifier: "m2",
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        format: null,
    },
    {
        attribute: null,
        aggregation: null,
        alias: null,
        filters: [],
        showInPercent: false,
        localIdentifier: "m12",
        type: "metric",
        operandLocalIdentifiers: ["m1", null],
        operator: ArithmeticOperatorType.SUM,
        format: null,
    },
]);

export const getBucketItemByLocalIdentifier = (localIdentifier: string) =>
    measureBucketItems.find((bucketItem) => bucketItem.localIdentifier === localIdentifier);

export const categoriesBucketItems: IRawBucketItems = [
    {
        attribute: "attr.product.id",
        localIdentifier: "product",
        filters: [],
        type: ATTRIBUTE,
    },
    {
        attribute: DATE_DATASET_ATTRIBUTE,
        localIdentifier: "week",
        filters: [],
        granularity: "GDC.time.week_us",
        type: DATE,
        dateDatasetRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
    },
];

export const enrichCategoriesBucketItems: IRawBucketItems = deepFreezeMock([
    {
        attribute: "attr.product.id",
        dfIdentifier: "label.product.id.name",
        dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
        dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/948",
        displayForm: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        elementsUri: "/gdc/md/TeamOneGoodSales1/obj/952/elements",
        granularity: "attr.product.id",
        id: "attr.product.id",
        identifier: "attr.product.id",
        isAvailable: true,
        localIdentifier: "product",
        summary: "",
        title: "Product",
        type: "attribute",
        uri: "/gdc/md/TeamOneGoodSales1/obj/949",
        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/949"),
        displayForms: productAttribute.displayForms,
    },
    {
        attribute: "attr.datedataset",
        dateType: "GDC.time.week_us",
        dfIdentifier: "date.dim_date",
        dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/629"),
        dfUri: "/gdc/md/TeamOneGoodSales1/obj/629",
        displayForm: { uri: "/gdc/md/TeamOneGoodSales1/obj/629" },
        granularity: "GDC.time.week_us",
        identifier: "attr.datedataset",
        localIdentifier: "week",
        title: "Week/Year (Activity)",
        type: "date",
        uri: "/gdc/md/TeamOneGoodSales1/obj/624",
        ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/624"),
        dateDatasetRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
        displayForms: [
            {
                id: "date.dim_date",
                uri: "/gdc/md/TeamOneGoodSales1/obj/629",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/629"),
                title: "Week/Year (Activity)",
            },
        ],
    },
    {
        attribute: "attr.country.id",
        dfIdentifier: "label.country.id.name",
        dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
        dfUri: "/gdc/md/TeamOneGoodSales1/obj/902",
        dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/901",
        displayForm: { uri: "/gdc/md/TeamOneGoodSales1/obj/902" },
        elementsUri: "/gdc/md/TeamOneGoodSales1/obj/902/elements",
        granularity: "attr.country.id",
        id: "attr.country.id",
        identifier: "attr.country.id",
        isAvailable: true,
        localIdentifier: "country",
        summary: "",
        title: "Country",
        type: "attribute",
        uri: "/gdc/md/TeamOneGoodSales1/obj/903",
    },
]);

export const stacksBucketItems: IRawBucketItems = [
    {
        attribute: "attr.product.id",
        localIdentifier: "f_product",
        filters: [],
        type: "attribute",
    },
];

export const dateBucketItemRefs: ObjRef[] = [
    uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity"),
    uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed"),
];

export const metadataBucketMeasures: IVisualizationObjectBucket = {
    localIdentifier: "measures",
    items: [
        // 0 - simple measure
        {
            measure: {
                definition: {
                    measureDefinition: {
                        computeRatio: false,
                        item: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                        },
                    },
                },
                localIdentifier: "m1",
                title: "Awareness",
            },
        },
        // 1 - Fact-based Ad-hoc measure with "Show in % (computeRatio)"
        {
            measure: {
                definition: {
                    measureDefinition: {
                        aggregation: "sum",
                        computeRatio: true,
                        item: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
                        },
                    },
                },
                localIdentifier: "m2",
                format: "#,##0.00%",
                title: "% Sum of Cart Additions",
            },
        },
        // 2 - Same period previous year over time comparison measure
        {
            measure: {
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: "m3",
                        popAttribute: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/701",
                        },
                    },
                },
                localIdentifier: "m3_pop",
            },
        },
        // 3 - Renamed same period previous year over time comparison measure
        {
            measure: {
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: "m3",
                        popAttribute: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/701",
                        },
                    },
                },
                localIdentifier: "m3_renamed_pop",
                alias: "renamed",
            },
        },
        // 4 - Simple measure with filters
        {
            measure: {
                definition: {
                    measureDefinition: {
                        computeRatio: false,
                        filters: [
                            {
                                positiveAttributeFilter: {
                                    displayForm: {
                                        uri: "/gdc/md/TeamOneGoodSales1/obj/902",
                                    },
                                    in: [
                                        "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288",
                                        "/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666",
                                    ],
                                },
                            },
                            {
                                relativeDateFilter: {
                                    dataSet: {
                                        uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                                    },
                                    from: -5,
                                    granularity: "GDC.time.year",
                                    to: -5,
                                },
                            },
                        ],
                        item: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                        },
                    },
                },
                localIdentifier: "m3",
                title: "Awareness, Date (Date Created): 5 years ago (Country: US & A)",
            },
        },
        // 5 - Attribute-based ad-hoc  measure
        {
            measure: {
                definition: {
                    measureDefinition: {
                        aggregation: "count",
                        computeRatio: false,
                        item: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/949",
                        },
                    },
                },
                format: "#,##0",
                localIdentifier: "m4",
                title: "Count of Product",
            },
        },
        // 6 - Previous period over time comparison measure
        {
            measure: {
                definition: {
                    previousPeriodMeasure: {
                        measureIdentifier: "m3",
                        dateDataSets: [
                            {
                                dataSet: {
                                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                                },
                                periodsAgo: 1,
                            },
                        ],
                    },
                },
                localIdentifier: "m3_previous_period",
            },
        },
        // 7 - Renamed previous period over time comparison measure
        {
            measure: {
                definition: {
                    previousPeriodMeasure: {
                        measureIdentifier: "m3",
                        dateDataSets: [
                            {
                                dataSet: {
                                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                                },
                                periodsAgo: 1,
                            },
                        ],
                    },
                },
                localIdentifier: "m3_renamed_previous_period",
                alias: "previous_period_renamed",
            },
        },
        // 8 - Arithmetic measure with custom format
        {
            measure: {
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["m1", "m2"],
                        operator: ArithmeticOperatorType.SUM,
                    },
                },
                localIdentifier: "m5",
                format: "##AM",
            },
        },
        // 9 - Arithmetic measure based on simple and arithmetic measure
        {
            measure: {
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["m1", "m5"],
                        operator: ArithmeticOperatorType.RATIO,
                    },
                },
                localIdentifier: "m6",
                format: "#,##0.00",
            },
        },
        // 10 - Arithmetic measure based on simple and arithmetic measure which is again based on another arithmetic measure
        {
            measure: {
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["m1", "m6"],
                        operator: ArithmeticOperatorType.DIFFERENCE,
                    },
                },
                localIdentifier: "m7",
                format: "#,##0.00",
            },
        },
        // 11 - Arithmetic measure with operator Change
        {
            measure: {
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["m1", "m2"],
                        operator: ArithmeticOperatorType.CHANGE,
                    },
                },
                localIdentifier: "m8",
                format: "#,##0.00%",
            },
        },
        // 12 - over time comparison of an arithmetic measure
        {
            measure: {
                definition: {
                    previousPeriodMeasure: {
                        dateDataSets: [
                            {
                                dataSet: {
                                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                                },
                                periodsAgo: 1,
                            },
                        ],
                        measureIdentifier: "m5",
                    },
                },
                localIdentifier: "m5_previous_period",
            },
        },
        // 13 - over time comparison of an arithmetic measure based on anothe arithmetic measure
        {
            measure: {
                definition: {
                    previousPeriodMeasure: {
                        dateDataSets: [
                            {
                                dataSet: {
                                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                                },
                                periodsAgo: 1,
                            },
                        ],
                        measureIdentifier: "m7",
                    },
                },
                localIdentifier: "m7_previous_period",
            },
        },
        {
            measure: {
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: "m1",
                        popAttribute: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/701",
                        },
                    },
                },
                localIdentifier: "m1_pop",
            },
        },
        {
            measure: {
                definition: {
                    popMeasureDefinition: {
                        measureIdentifier: "m2",
                        popAttribute: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/701",
                        },
                    },
                },
                localIdentifier: "m2_pop",
            },
        },
    ],
};

export const metadataBucketCategories = {
    items: [
        {
            visualizationAttribute: {
                displayForm: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/952",
                },
                localIdentifier: "product",
            },
        },
        {
            visualizationAttribute: {
                displayForm: {
                    uri: "/gdc/md/TeamOneGoodSales1/obj/629",
                },
                localIdentifier: "week",
            },
        },
    ],
    localIdentifier: "view",
};

export const metadataBucketStacksItems = [
    {
        visualizationAttribute: {
            displayForm: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/952",
            },
            localIdentifier: "product",
        },
    },
];

export const metadataBucketCategoriesWithDate: IRawBucketItems = [
    {
        type: "attribute",
        attribute: "/gdc/md/TeamOneGoodSales1/obj/949",
        displayForm: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        uri: "/gdc/md/TeamOneGoodSales1/obj/591",
    },
    {
        type: "date",
        displayForm: uriRef("/gdc/md/TeamOneGoodSales1/obj/629"),
        attribute: "/gdc/md/TeamOneGoodSales1/obj/701",
        uri: "/gdc/md/TeamOneGoodSales1/obj/590",
    },
];

export const metadataBucketFiltersNoSelection: VisualizationObjectExtendedFilter[] = [
    {
        positiveAttributeFilter: {
            localIdentifier: "f_product",
            displayForm: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/952",
            },
            in: [],
        },
    },
    {
        relativeDateFilter: {
            dataSet: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
            },
            granularity: "GDC.time.year",
        },
    },
];

export const metadataFilterWithNonDefaultDisplayForm: VisualizationObjectExtendedFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/md/TeamOneGoodSales1/obj/900",
        },
        in: [],
    },
};

export const measuresWithDateFilter: IRawBucketItems = [
    {
        aggregation: null,
        attribute: "attr.currency.id",
        type: "metric",
        filters: [
            {
                attribute: "attr.datedataset",
                dimension: "activity.dataset.dt",
                interval: {
                    granularity: "GDC.time.year",
                    interval: [-1, -1],
                    type: "relative",
                },
            },
        ],
        localIdentifier: "129ecbcfcfa4441fb60545e81bd94e8e",
    },
];

export const metadataBucketFilterWithSelection = {
    positiveAttributeFilter: {
        localIdentifier: "localIdentifier",
        displayForm: {
            uri: "/gdc/md/TeamOneGoodSales1/obj/952",
        },
        in: [
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
        ],
    },
};

export const metadataBucketFiltersWithSelection: VisualizationObjectExtendedFilter[] = [
    metadataBucketFilterWithSelection,
    {
        relativeDateFilter: {
            dataSet: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
            },
            granularity: "GDC.time.year",
            from: -6,
            to: 0,
        },
    },
    {
        absoluteDateFilter: {
            dataSet: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
            },
            from: "2017-01-01",
            to: "2018-01-01",
        },
    },
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m1",
            },
            conditions: [
                {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 12,
                    },
                },
            ],
        },
    },
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m2",
            },
            conditions: [
                {
                    range: {
                        operator: "BETWEEN",
                        from: 12,
                        to: 14,
                    },
                },
            ],
        },
    },
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m3",
            },
        },
    },
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m3_previous_period",
            },
        },
    },
    {
        rankingFilter: {
            measures: [
                {
                    localIdentifier: "m5",
                },
            ],
            attributes: [
                {
                    localIdentifier: "a1",
                },
                {
                    localIdentifier: "a2",
                },
            ],
            operator: "BOTTOM",
            value: 3,
        },
    },
    {
        rankingFilter: {
            measures: [
                {
                    localIdentifier: "m4",
                },
            ],
            operator: "TOP",
            value: 10,
        },
    },
];

export const bucketFilterWithSelection = newPositiveAttributeFilter(
    uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
    {
        uris: [
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
            "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
        ],
    },
    "localIdentifier",
);

export const bucketFiltersWithSelection: IFilterModel[] = [
    bucketFilterWithSelection,
    newRelativeDateFilter(uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"), "GDC.time.year", -6, 0),
    newAbsoluteDateFilter(uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"), "2017-01-01", "2018-01-01"),
    newMeasureValueFilter(localIdRef("m1"), "GREATER_THAN", 12),
    newMeasureValueFilter(localIdRef("m2"), "BETWEEN", 12, 14),
    // these cannot be created using a helper, because they are incomplete
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m3",
            },
        },
    },
    {
        measureValueFilter: {
            measure: {
                localIdentifier: "m3_previous_period",
            },
        },
    },
    newRankingFilter(localIdRef("m5"), [localIdRef("a1"), localIdRef("a2")], "BOTTOM", 3),
    newRankingFilter(localIdRef("m4"), "TOP", 10),
];

export const metadataBucketFiltersWithQuarterGranularity = [
    {
        relativeDateFilter: {
            dataSet: {
                uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
            },
            granularity: "GDC.time.quarter",
            from: -3,
            to: 0,
        },
    },
];

export const dateDatasetsAvailable: ReadonlyArray<IDateDataset> = [
    {
        title: "Date (Activity)",
        summary: "DataSet Date",
        ref: {
            identifier: "activity.dataset.dt",
        },
        identifier: "activity.dataset.dt",
        uri: "/gdc/md/TeamOneGoodSales1/obj/727",
        attributes: [
            {
                granularity: "activity.date",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/590"),
                dfRef: idRef("activity.date.mmddyyyy"),
                dfIdentifier: "activity.date.mmddyyyy",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/593",
                dateType: "GDC.time.date",
                uri: "/gdc/md/TeamOneGoodSales1/obj/590",
                displayForms: [],
            },
            {
                granularity: "activity.month",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/616"),
                dfRef: idRef("activity.act81lMifn6q"),
                dfIdentifier: "activity.act81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/617",
                dateType: "GDC.time.month",
                uri: "/gdc/md/TeamOneGoodSales1/obj/616",
                displayForms: [],
            },
            {
                granularity: "activity.euweek",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/644"),
                dfRef: idRef("activity.aa281lMifn6q"),
                dfIdentifier: "activity.aa281lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/649",
                dateType: "GDC.time.week_us",
                uri: "/gdc/md/TeamOneGoodSales1/obj/644",
                displayForms: [],
            },
            {
                granularity: "activity.quarter",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/656"),
                dfRef: idRef("activity.aci81lMifn6q"),
                dfIdentifier: "activity.aci81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/657",
                dateType: "GDC.time.quarter",
                uri: "/gdc/md/TeamOneGoodSales1/obj/656",
                displayForms: [],
            },
            {
                granularity: "activity.year",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/701"),
                dfRef: idRef("activity.aag81lMifn6q"),
                dfIdentifier: "activity.aag81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/721",
                dateType: "GDC.time.year",
                uri: "/gdc/md/TeamOneGoodSales1/obj/701",
                displayForms: [],
            },
        ],
        type: "dateDataset",
        id: "activity.dataset.dt",
        isAvailable: true,
        relevance: 1,
    },
    {
        title: "Date (Date)",
        summary: "DataSet Date",
        ref: idRef("date.dataset.dt"),
        identifier: "date.dataset.dt",
        uri: "/gdc/md/TeamOneGoodSales1/obj/319917",
        attributes: [
            {
                granularity: "date.year",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/319857"),
                dfRef: idRef("date.aag81lMifn6q"),
                dfIdentifier: "date.aag81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/319875",
                dateType: "GDC.time.year",
                uri: "/gdc/md/TeamOneGoodSales1/obj/319857",
                displayForms: [],
            },
            {
                granularity: "date.euweek",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/319862"),
                dfRef: idRef("date.aa281lMifn6q"),
                dfIdentifier: "date.aa281lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/319889",
                dateType: "GDC.time.week_us",
                uri: "/gdc/md/TeamOneGoodSales1/obj/319862",
                displayForms: [],
            },
            {
                granularity: "date.quarter",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/319872"),
                dfRef: idRef("date.aci81lMifn6q"),
                dfIdentifier: "date.aci81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/319907",
                dateType: "GDC.time.quarter",
                uri: "/gdc/md/TeamOneGoodSales1/obj/319872",
                displayForms: [],
            },
            {
                granularity: "date.month",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/319873"),
                dfRef: idRef("date.act81lMifn6q"),
                dfIdentifier: "date.act81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/319908",
                dateType: "GDC.time.month",
                uri: "/gdc/md/TeamOneGoodSales1/obj/319873",
                displayForms: [],
            },
            {
                granularity: "date.date",
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/319874"),
                dfRef: idRef("date.date.mmddyyyy"),
                dfIdentifier: "date.date.mmddyyyy",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/319913",
                dateType: "GDC.time.date",
                uri: "/gdc/md/TeamOneGoodSales1/obj/319874",
                displayForms: [],
            },
        ],
        type: "dateDataset",
        id: "date.dataset.dt",
        isAvailable: true,
        relevance: 2,
    },
    {
        title: "Date (Activity)",
        summary: "DataSet Date",
        ref: idRef("activity.dataset.dt"),
        identifier: "activity.dataset.dt",
        uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
        attributes: [],
        type: "dateDataset",
        id: "activity.dataset.dt",
        isAvailable: true,
        relevance: 3,
    },
];

export const dateDataset: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.date",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15200"),
            dfRef: idRef("date.date.mmddyyyy"),
            dfIdentifier: "date.date.mmddyyyy",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15203",
            granularity: "date.date",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15200",
            displayForms: [],
        },
        {
            dateType: "GDC.time.week_us",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15254"),
            dfRef: idRef("date.aa281lMifn6q"),
            dfIdentifier: "date.aa281lMifn6q",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15259",
            granularity: "date.euweek",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15254",
            displayForms: [
                {
                    title: "Week DF1",
                    ref: {
                        uri: "/gdc/md/project/obj/df1",
                    },
                    id: "df1",
                    uri: "/gdc/md/project/obj/df1",
                    type: "displayForm",
                },
                {
                    title: "Week DF2",
                    ref: {
                        uri: "/gdc/md/project/obj/df2",
                    },
                    id: "df2",
                    uri: "/gdc/md/project/obj/df2",
                    type: "displayForm",
                },
            ],
        },
    ],
    id: "date.dim_date",
    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
    identifier: "date.dim_date",
    isAvailable: true,
    summary: "Date dimension (Date)",
    title: "Date dimension (Date)",
    type: "dimension",
    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
    relevance: 0,
};

export const dateDatasetRef: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.date",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15200"),
            dfRef: idRef("date.date.mmddyyyy"),
            dfIdentifier: "date.date.mmddyyyy",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15203",
            granularity: "date.date",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15200",
            displayForms: [],
        },
        {
            dateType: "GDC.time.week_us",
            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15254"),
            dfRef: idRef("date.aa281lMifn6q"),
            dfIdentifier: "date.aa281lMifn6q",
            dfUri: "/gdc/md/TeamOneGoodSales1/obj/15259",
            granularity: "date.euweek",
            uri: "/gdc/md/TeamOneGoodSales1/obj/15254",
            displayForms: [],
        },
    ],
    id: "date.dim_date",
    ref: uriRef("date.dim_date"),
    identifier: "date.dim_date",
    isAvailable: true,
    summary: "Date dimension (Date)",
    title: "Date dimension (Date)",
    type: "dimension",
    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
    relevance: 0,
};

export const dateDatasets = createDecoratedDateDatasets({
    available: [dateDataset],
    unavailable: 0,
});

export const emptyDateDatasets = createDecoratedDateDatasets({
    available: [],
    unavailable: 0,
});

export const selectedDateDatasets = {
    globalDateDatasets: dateDatasets,
    measureDateDatasets: new Map([
        [
            "m1",
            {
                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/624"),
                identifier: "attr.datedataset",
                uri: "/gdc/md/TeamOneGoodSales1/obj/624",
                type: "date",
                title: "Week/Year (Activity)",
                summary: "Week/Year based on EU Weeks (Mon-Sun).",
                attributes: [],
            },
        ],
    ]),
};

export function setupAppStateWithDateDatasetMeta(state: IAppState) {
    return seedDateDatasetsMeta(state, { items: [activityDateDataset, closedDateDataset] });
}

/**
 * Seeds the state exactly as a dispatched SET_DATE_DATASETS_META does: the meta leaf plus the
 * granularity entries derived into the itemCache.
 */
export function seedDateDatasetsMeta(state: IAppState, dateDatasetsMeta: IDateDatasetsMeta): IAppState {
    const action = setDateDatasetsMeta(dateDatasetsMeta);

    return combinedRootReducer(state, action);
}

export const activityDateDataset: IDateDataset = {
    attributes: [
        {
            ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/624"),
            dateType: "GDC.time.week_us",
            dfRef: idRef("activity.date.dim_date"),
            dfUri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/629",
            dfIdentifier: "activity.date.dim_date",
            uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/624",
            granularity: "activity.euweek",
            displayForms: [],
        },
    ],
    id: "date.activity",
    ref: idRef("attr.datedataset.activity"),
    identifier: "attr.datedataset.activity",
    isAvailable: true,
    summary: "Week/Year based on EU Weeks (Mon-Sun).",
    title: "Week/Year (Activity)",
    type: "dimension",
    uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
    relevance: 3,
};

export const closedDateDataset: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.week_us",
            ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623"),
            dfRef: idRef("closed.date.dim_date"),
            dfUri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/628",
            dfIdentifier: "closed.date.dim_date",
            uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623",
            granularity: "closed.euweek",
            displayForms: [],
        },
    ],
    id: "date.closed",
    ref: idRef("attr.datedataset.closed"),
    identifier: "attr.datedataset.closed",
    isAvailable: true,
    summary: "Week/Year based on EU Weeks (Mon-Sun).",
    title: "Week/Year (Closed)",
    type: "dimension",
    uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
    relevance: 4,
};

export const activityDateDatasetRef: IDateDataset = {
    attributes: [
        {
            ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/624"),
            dateType: "GDC.time.week_us",
            dfRef: idRef("date.dim_date"),
            dfUri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/629",
            dfIdentifier: "date.dim_date",
            uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/624",
            granularity: "activity.euweek",
            displayForms: [],
        },
    ],
    id: "date.activity",
    ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity"),
    identifier: "attr.datedataset.activity",
    isAvailable: true,
    summary: "Week/Year based on EU Weeks (Mon-Sun).",
    title: "Week/Year (Activity)",
    type: "dimension",
    uri: "attr.datedataset.activity",
    relevance: 3,
};

export const closedDateDatasetRef: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.week_us",
            ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623"),
            dfRef: idRef("date.dim_date"),
            dfUri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/628",
            dfIdentifier: "date.dim_date",
            uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/623",
            granularity: "closed.euweek",
            displayForms: [],
        },
    ],
    id: "date.closed",
    ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed"),
    identifier: "attr.datedataset.closed",
    isAvailable: true,
    summary: "Week/Year based on EU Weeks (Mon-Sun).",
    title: "Week/Year (Closed)",
    type: "dimension",
    uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
    relevance: 4,
};

export const decoratedActivityDateDataset = DecoratedDateDataset.createDecorated(activityDateDataset);
export const decoratedActivityDateDatasetRef = DecoratedDateDataset.createDecorated(activityDateDatasetRef);
export const decoratedClosedDateDataset = DecoratedDateDataset.createDecorated(closedDateDataset);
export const decoratedClosedDateDatasetRef = DecoratedDateDataset.createDecorated(closedDateDatasetRef);

export const decoratedClosedDateDatasetRefWithoutRelevance = omit(decoratedClosedDateDatasetRef, "relevance");

export function setupAppStateWithDateDatasets(state: IAppState) {
    return withData(state, {
        dateDatasets: {
            ...dateDatasetsInitialState,
            available: [activityDateDataset, closedDateDataset],
            unavailable: 2,
            loaded: true,
            dropdownLoaded: true,
        },
    });
}

export const decoratedDateDataset: IDecoratedDateDataset = decoratedActivityDateDataset;
export const decoratedDateDatasets: IDecoratedDateDatasets = {
    items: [decoratedActivityDateDataset, decoratedClosedDateDataset],
    unavailable: 2,
};
export const decoratedDateDatasetsRef: IDecoratedDateDatasets = {
    items: [decoratedActivityDateDatasetRef, decoratedClosedDateDatasetRef],
    unavailable: 2,
};

export const activityDateDatasetsMetaItem: IDateDatasetsMetaItem = {
    ref: uriRef(activityDateDataset.uri),
    identifier: activityDateDataset.identifier,
    uri: activityDateDataset.uri,
    type: activityDateDataset.type,
    title: activityDateDataset.title,
    summary: activityDateDataset.summary,
    attributes: [],
};

export const closedDateDatasetsMetaItem: IDateDatasetsMetaItem = {
    ref: uriRef(closedDateDataset.uri),
    identifier: closedDateDataset.identifier,
    uri: closedDateDataset.uri,
    type: closedDateDataset.type,
    title: closedDateDataset.title,
    summary: closedDateDataset.summary,
    attributes: [],
};

export const dateDatasetsMeta: IDateDatasetsMeta = {
    items: [activityDateDatasetsMetaItem, closedDateDatasetsMetaItem],
};

export const insightWithMeasuresWithVariousTypesOfFilters = newInsight(
    "local:foo",
    "foo",
    "gdc/md/foo",
    (i) =>
        i
            .buckets([
                {
                    localIdentifier: "measures",
                    items: [
                        newMeasure(uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/9211"), (m) =>
                            m
                                .localId("m1")
                                .title("Apples")
                                .filters(
                                    newRelativeDateFilter(
                                        uriRef(
                                            "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
                                        ),
                                        "GDC.time.year",
                                        -2,
                                        -2,
                                    ),
                                    newNegativeAttributeFilter(
                                        uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/992"),
                                        {
                                            uris: [
                                                "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/990/elements?id=964772",
                                                "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/990/elements?id=958078",
                                            ],
                                        },
                                    ),
                                ),
                        ),
                        newMeasure(uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/2723"), (m) =>
                            m
                                .localId("m2")
                                .title("Pears")
                                .filters(
                                    newRelativeDateFilter(
                                        uriRef(
                                            "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
                                        ),
                                        "GDC.time.year",
                                        -3,
                                        -3,
                                    ),
                                ),
                        ),
                        newMeasure(uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/4906"), (m) =>
                            m.localId("m3").title("Oranges"),
                        ),
                    ],
                },
            ])
            .title("foo"),
);

export const selectedDateDataSetRef: IDateDataset = {
    attributes: [
        {
            dateType: "GDC.time.year",
            ref: uriRef("closed.uri"),
            dfRef: idRef("closed.dfIdentifier"),
            dfIdentifier: "closed.dfIdentifier",
            dfUri: "closed.dfUri",
            granularity: "closed.year",
            uri: "closed.uri",
            displayForms: [],
        },
    ],
    id: "closed.dd",
    ref: idRef("closed.dd"),
    identifier: "closed.dd",
    isAvailable: true,
    relevance: 10,
    summary: "Closed date dataset",
    title: "Closed",
    type: "dateDataset",
    uri: "activity",
};

export const filterWithUnavailableElements: IFilter = {
    cacheItemIdentifier: "attr.product.id",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
    filterConfig: {
        isInverted: false,
        selectedElements: [
            {
                available: false,
                uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
                title: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282",
            },
            {
                available: false,
                uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
                title: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284",
            },
            {
                available: false,
                uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
                title: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771",
            },
        ],
        totalElementsCount: 0,
    },
    localIdentifier: "a1b783290dde460c92ded126aaae335d",
    type: "attribute",
};

export const dateFilterBarItem: IDateFilter = {
    localIdentifier: "localIdentifierDate",
    type: "date",
    cacheItemIdentifier: "date.created",
    filterConfig: {
        granularity: "GDC.time.date",
        type: "absolute",
        interval: ["2010-01-01", "2012-12-31"],
    },
    overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
    dateDatasetRef: uriRef("date/created/uri"),
};

export const dateFilterBarItemActivity: IDateFilter = {
    localIdentifier: "localIdentifierDate",
    type: "date",
    cacheItemIdentifier: "date.closed",
    filterConfig: {
        granularity: "GDC.time.date",
        type: "absolute",
        interval: ["2010-01-01", "2012-12-31"],
    },
    overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
    dateDatasetRef: activityDateDatasetRef.ref,
};

export const createAnalyticalDashboard = (name: string, identifier: string, id: number): IMetadataObject => {
    return {
        title: name,
        type: "analyticalDashboard",
        uri: `/gdc/md/mockProject/obj/${id}`,
        id: identifier,
        deprecated: false,
        unlisted: false,
        production: true,
        ref: idRef(identifier),
        description: "",
    };
};

export const createListedDashboard = (name: string, identifier: string, id: number): IListedDashboard => {
    const uri = `/gdc/md/mockProject/obj/${id}`;
    return {
        ref: uriRef(uri),
        uri,
        identifier,
        title: name,
        description: "",
        shareStatus: "shared",
        created: undefined,
        updated: undefined,
        availability: "full",
    };
};
