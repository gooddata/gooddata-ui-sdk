// (C) 2025 GoodData Corporation

/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2025-05-07T10:19:33.204Z; */
// @ts-ignore ignore unused imports here if they happen (e.g. when there is no measure in the workspace)
import {
    newAttribute,
    newMeasure,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    idRef,
} from "@gooddata/sdk-model";

/**
 * Attribute Title: Campaign channel id
 * Attribute ID: campaign_channel_id
 */
export const CampaignChannelId: IAttribute = newAttribute("campaign_channel_id");
/**
 * Attribute Title: Category
 * Attribute ID: campaign_channels.category
 */
export const Category: IAttribute = newAttribute("campaign_channels.category");
/**
 * Attribute Title: Campaign id
 * Attribute ID: campaign_id
 */
export const CampaignId: IAttribute = newAttribute("campaign_id");
/**
 * Attribute Title: Campaign name
 * Attribute ID: campaign_name
 */
export const CampaignName: IAttribute = newAttribute("campaign_name");
/**
 * Attribute Title: Customer id
 * Attribute ID: customer_id
 */
export const CustomerId: IAttribute = newAttribute("customer_id");
/**
 * Attribute Title: Customer name
 * Attribute ID: customer_name
 */
export const CustomerName: IAttribute = newAttribute("customer_name");
/**
 * Attribute Title: Order id
 * Attribute ID: order_id
 */
export const OrderId: IAttribute = newAttribute("order_id");
/**
 * Attribute Title: Order line id
 * Attribute ID: order_line_id
 */
export const OrderLineId: IAttribute = newAttribute("order_line_id");
/**
 * Attribute Title: Order status
 * Attribute ID: order_status
 */
export const OrderStatus: IAttribute = newAttribute("order_status");
/**
 * Attribute Title: Product id
 * Attribute ID: product_id
 */
export const ProductId: IAttribute = newAttribute("product_id");
/**
 * Attribute Title: Product name
 * Attribute ID: product_name
 */
export const ProductName: IAttribute = newAttribute("product_name");
/**
 * Attribute Title: Category
 * Attribute ID: products.category
 */
export const Category_1: IAttribute = newAttribute("products.category");
/**
 * Attribute Title: Region
 * Attribute ID: region
 */
export const Region: IAttribute = newAttribute("region");
/**
 * Attribute Title: State
 * Attribute ID: state
 */
export const State = {
    /**
     * Display Form Title: Lon
     * Display Form ID: state.lon
     */
    Lon: newAttribute("state.lon"),
    /**
     * Display Form Title: Lat
     * Display Form ID: state.lat
     */ Lat: newAttribute("state.lat"),
    /**
     * Display Form Title: State
     * Display Form ID: state
     */ Default: newAttribute("state"),
    /**
     * Display Form Title: Location
     * Display Form ID: geo__state__location
     */ Location: newAttribute("geo__state__location"),
};
/**
 * Attribute Title: Type
 * Attribute ID: type
 */
export const Type: IAttribute = newAttribute("type");
/**
 * Metric Title: SELECT 1
 * Metric ID: select_1
 * Metric Type: MAQL Metric
 */
export const SELECT1: IMeasure<IMeasureDefinition> = newMeasure(idRef("select_1", "measure"));
/**
 * Metric Title: SELECT 0
 * Metric ID: select_0
 * Metric Type: MAQL Metric
 */
export const SELECT0: IMeasure<IMeasureDefinition> = newMeasure(idRef("select_0", "measure"));
/**
 * Metric Title: TEST
 * Metric ID: test
 * Metric Type: MAQL Metric
 */
export const TEST: IMeasure<IMeasureDefinition> = newMeasure(idRef("test", "measure"));
/**
 * Metric Title: Budget in DEL,FLO,WAS
 * Metric ID: budget_in_del_flo_was
 * Metric Type: MAQL Metric
 */
export const BudgetInDELFLOWAS: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("budget_in_del_flo_was", "measure"),
);
/**
 * Fact Title: Budget
 * Fact ID: budget
 */
export const Budget = {
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Budget
     * Fact ID: budget
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("budget", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Price
 * Fact ID: price
 */
export const Price = {
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("price", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("price", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("price", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("price", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("price", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Price
     * Fact ID: price
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("price", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Quantity
 * Fact ID: quantity
 */
export const Quantity = {
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Quantity
     * Fact ID: quantity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("quantity", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Spend
 * Fact ID: spend
 */
export const Spend = {
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Spend
     * Fact ID: spend
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("spend", "fact"), (m) => m.aggregation("runsum")),
};
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Date of DT (Date)
     * Date Data Set ID: date
     */
    DateOfDTDate: {
        ref: idRef("date", "dataSet"),
        identifier: "date",
        /**
         * Date Attribute: Date of DT (Date) - Date
         * Date Attribute ID: date.day
         */ DateOfDTDateDate: {
            ref: idRef("date.day", "attribute"),
            identifier: "date.day",
            /**
             * Display Form Title: Date of DT (Date) - Date
             * Display Form ID: date.day
             */ Default: newAttribute("date.day"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Day of Month
         * Date Attribute ID: date.dayOfMonth
         */ DateOfDTDateDayOfMonth: {
            ref: idRef("date.dayOfMonth", "attribute"),
            identifier: "date.dayOfMonth",
            /**
             * Display Form Title: Date of DT (Date) - Day of Month
             * Display Form ID: date.dayOfMonth
             */ Default: newAttribute("date.dayOfMonth"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Day of Week
         * Date Attribute ID: date.dayOfWeek
         */ DateOfDTDateDayOfWeek: {
            ref: idRef("date.dayOfWeek", "attribute"),
            identifier: "date.dayOfWeek",
            /**
             * Display Form Title: Date of DT (Date) - Day of Week
             * Display Form ID: date.dayOfWeek
             */ Default: newAttribute("date.dayOfWeek"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Day of Year
         * Date Attribute ID: date.dayOfYear
         */ DateOfDTDateDayOfYear: {
            ref: idRef("date.dayOfYear", "attribute"),
            identifier: "date.dayOfYear",
            /**
             * Display Form Title: Date of DT (Date) - Day of Year
             * Display Form ID: date.dayOfYear
             */ Default: newAttribute("date.dayOfYear"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Hour
         * Date Attribute ID: date.hour
         */ DateOfDTDateHour: {
            ref: idRef("date.hour", "attribute"),
            identifier: "date.hour",
            /**
             * Display Form Title: Date of DT (Date) - Hour
             * Display Form ID: date.hour
             */ Default: newAttribute("date.hour"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Hour of Day
         * Date Attribute ID: date.hourOfDay
         */ DateOfDTDateHourOfDay: {
            ref: idRef("date.hourOfDay", "attribute"),
            identifier: "date.hourOfDay",
            /**
             * Display Form Title: Date of DT (Date) - Hour of Day
             * Display Form ID: date.hourOfDay
             */ Default: newAttribute("date.hourOfDay"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Minute
         * Date Attribute ID: date.minute
         */ DateOfDTDateMinute: {
            ref: idRef("date.minute", "attribute"),
            identifier: "date.minute",
            /**
             * Display Form Title: Date of DT (Date) - Minute
             * Display Form ID: date.minute
             */ Default: newAttribute("date.minute"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Minute of Hour
         * Date Attribute ID: date.minuteOfHour
         */ DateOfDTDateMinuteOfHour: {
            ref: idRef("date.minuteOfHour", "attribute"),
            identifier: "date.minuteOfHour",
            /**
             * Display Form Title: Date of DT (Date) - Minute of Hour
             * Display Form ID: date.minuteOfHour
             */ Default: newAttribute("date.minuteOfHour"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Month/Year
         * Date Attribute ID: date.month
         */ DateOfDTDateMonthYear: {
            ref: idRef("date.month", "attribute"),
            identifier: "date.month",
            /**
             * Display Form Title: Date of DT (Date) - Month/Year
             * Display Form ID: date.month
             */ Default: newAttribute("date.month"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Month of Year
         * Date Attribute ID: date.monthOfYear
         */ DateOfDTDateMonthOfYear: {
            ref: idRef("date.monthOfYear", "attribute"),
            identifier: "date.monthOfYear",
            /**
             * Display Form Title: Date of DT (Date) - Month of Year
             * Display Form ID: date.monthOfYear
             */ Default: newAttribute("date.monthOfYear"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Quarter/Year
         * Date Attribute ID: date.quarter
         */ DateOfDTDateQuarterYear: {
            ref: idRef("date.quarter", "attribute"),
            identifier: "date.quarter",
            /**
             * Display Form Title: Date of DT (Date) - Quarter/Year
             * Display Form ID: date.quarter
             */ Default: newAttribute("date.quarter"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Quarter of Year
         * Date Attribute ID: date.quarterOfYear
         */ DateOfDTDateQuarterOfYear: {
            ref: idRef("date.quarterOfYear", "attribute"),
            identifier: "date.quarterOfYear",
            /**
             * Display Form Title: Date of DT (Date) - Quarter of Year
             * Display Form ID: date.quarterOfYear
             */ Default: newAttribute("date.quarterOfYear"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Week/Year
         * Date Attribute ID: date.week
         */ DateOfDTDateWeekYear: {
            ref: idRef("date.week", "attribute"),
            identifier: "date.week",
            /**
             * Display Form Title: Date of DT (Date) - Week/Year
             * Display Form ID: date.week
             */ Default: newAttribute("date.week"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Week of Year
         * Date Attribute ID: date.weekOfYear
         */ DateOfDTDateWeekOfYear: {
            ref: idRef("date.weekOfYear", "attribute"),
            identifier: "date.weekOfYear",
            /**
             * Display Form Title: Date of DT (Date) - Week of Year
             * Display Form ID: date.weekOfYear
             */ Default: newAttribute("date.weekOfYear"),
        },
        /**
         * Date Attribute: Date of DT (Date) - Year
         * Date Attribute ID: date.year
         */ DateOfDTDateYear: {
            ref: idRef("date.year", "attribute"),
            identifier: "date.year",
            /**
             * Display Form Title: Date of DT (Date) - Year
             * Display Form ID: date.year
             */ Default: newAttribute("date.year"),
        },
    },
};
export const Insights = {
    /**
     * Insight Title: F1-919
     * Insight ID: 01dcc632-a288-4577-9c0a-fb40db211637
     */
    F1919: "01dcc632-a288-4577-9c0a-fb40db211637",
    /**
     * Insight Title: L1
     * Insight ID: 01ecd8d6-bde6-4bb2-872e-a570c6d7237c
     */ L1: "01ecd8d6-bde6-4bb2-872e-a570c6d7237c",
    /**
     * Insight Title: Geo1
     * Insight ID: 0d76d651-66a7-4b46-9c69-0b110b2470c3
     */ Geo1: "0d76d651-66a7-4b46-9c69-0b110b2470c3",
    /**
     * Insight Title: DEPWHEEL1
     * Insight ID: 1014a7c9-153c-4b54-bbf7-21f43b869829
     */ DEPWHEEL1: "1014a7c9-153c-4b54-bbf7-21f43b869829",
    /**
     * Insight Title: tmp
     * Insight ID: 11be1ec7-6d4f-4fca-9d69-9feb6d212a0d
     */ Tmp: "11be1ec7-6d4f-4fca-9d69-9feb6d212a0d",
    /**
     * Insight Title: TOTAL
     * Insight ID: 128b48b3-3288-4549-b828-028616ad4750
     */ TOTAL: "128b48b3-3288-4549-b828-028616ad4750",
    /**
     * Insight Title: REFERENCES
     * Insight ID: 12c45c7e-eb67-4912-a6e2-47d7a2d2c229
     */ REFERENCES: "12c45c7e-eb67-4912-a6e2-47d7a2d2c229",
    /**
     * Insight Title: 1R
     * Insight ID: 197c4b39-6ba3-4816-9a82-1d50c3fb7400
     */ _1R: "197c4b39-6ba3-4816-9a82-1d50c3fb7400",
    /**
     * Insight Title: Column PoP only
     * Insight ID: 1ac6d77f-cebd-4691-9792-8572bb30a404
     */ ColumnPoPOnly: "1ac6d77f-cebd-4691-9792-8572bb30a404",
    /**
     * Insight Title: PIE1
     * Insight ID: 1bf5ffbc-7041-4003-b9cd-80c0eb520d9f
     */ PIE1: "1bf5ffbc-7041-4003-b9cd-80c0eb520d9f",
    /**
     * Insight Title: TREEMAP1
     * Insight ID: 270d335d-e597-4b71-b936-4e728096c492
     */ TREEMAP1: "270d335d-e597-4b71-b936-4e728096c492",
    /**
     * Insight Title: L2
     * Insight ID: 2f5c6349-ea01-41e4-bfd7-cdbb0160dc06
     */ L2: "2f5c6349-ea01-41e4-bfd7-cdbb0160dc06",
    /**
     * Insight Title: GEO1
     * Insight ID: 3858d45b-7764-4412-8c94-de85dc23f4a2
     */ GEO1: "3858d45b-7764-4412-8c94-de85dc23f4a2",
    /**
     * Insight Title: B1
     * Insight ID: 3ee4f66d-0c8b-4daf-9c6a-4e648e96b210
     */ B1: "3ee4f66d-0c8b-4daf-9c6a-4e648e96b210",
    /**
     * Insight Title: F1-919 BAR
     * Insight ID: 3f951de0-7a1f-4b61-9988-c28c49121bdd
     */ F1919BAR: "3f951de0-7a1f-4b61-9988-c28c49121bdd",
    /**
     * Insight Title: Column Combination
     * Insight ID: 4575a940-f5d5-4e12-8928-919e934b9fed
     */ ColumnCombination: "4575a940-f5d5-4e12-8928-919e934b9fed",
    /**
     * Insight Title: HL_NORMAL_%
     * Insight ID: 4a04d508-b461-4990-ae42-7ea03ccf9165
     */ HLNORMALPercent: "4a04d508-b461-4990-ae42-7ea03ccf9165",
    /**
     * Insight Title: FUNNEL1
     * Insight ID: 4c8abcca-1cb4-4cfe-b680-1e221f31ce4a
     */ FUNNEL1: "4c8abcca-1cb4-4cfe-b680-1e221f31ce4a",
    /**
     * Insight Title: Price per State
     * Insight ID: 4f53932f-7962-4e52-9de6-5a96c94346a4
     */ PricePerState: "4f53932f-7962-4e52-9de6-5a96c94346a4",
    /**
     * Insight Title: TEMP
     * Insight ID: 4fddc57b-7ecd-4801-95c6-392bbb38cb91
     */ TEMP: "4fddc57b-7ecd-4801-95c6-392bbb38cb91",
    /**
     * Insight Title: DRILL_INSIDE
     * Insight ID: 52ffa84d-e457-4a16-a578-6040fa60381f
     */ DRILLINSIDE: "52ffa84d-e457-4a16-a578-6040fa60381f",
    /**
     * Insight Title: METRIC VALUE FILTER
     * Insight ID: 57824ddc-41b8-43a9-a805-3bd1379185ee
     */ METRICVALUEFILTER: "57824ddc-41b8-43a9-a805-3bd1379185ee",
    /**
     * Insight Title: H1
     * Insight ID: 626dd8e0-a77d-4de4-960e-3a4f303e8b8c
     */ H1: "626dd8e0-a77d-4de4-960e-3a4f303e8b8c",
    /**
     * Insight Title: Drill_TEST
     * Insight ID: 75dc1fc7-eab3-4173-b318-31e786011be5
     */ DrillTEST: "75dc1fc7-eab3-4173-b318-31e786011be5",
    /**
     * Insight Title: T1
     * Insight ID: 83a07550-4fe9-4be5-aa16-237207bed327
     */ T1: "83a07550-4fe9-4be5-aa16-237207bed327",
    /**
     * Insight Title: F1-921
     * Insight ID: 8436620e-671f-4b8d-9670-1ea0ad68e2cf
     */ F1921: "8436620e-671f-4b8d-9670-1ea0ad68e2cf",
    /**
     * Insight Title: BULLET
     * Insight ID: 87465d9e-a9d8-446e-a472-2604e7421f7c
     */ BULLET: "87465d9e-a9d8-446e-a472-2604e7421f7c",
    /**
     * Insight Title: PYRAMID1
     * Insight ID: 8b143391-0cb1-4353-823d-6d0f92f9ed91
     */ PYRAMID1: "8b143391-0cb1-4353-823d-6d0f92f9ed91",
    /**
     * Insight Title: X
     * Insight ID: 8db1c94e-89fe-480f-86e1-3ec1c2785c30
     */ X: "8db1c94e-89fe-480f-86e1-3ec1c2785c30",
    /**
     * Insight Title: WATERFALL1
     * Insight ID: 8fd96b0e-5ef0-4dd8-81cb-3e0c1b5e7d4c
     */ WATERFALL1: "8fd96b0e-5ef0-4dd8-81cb-3e0c1b5e7d4c",
    /**
     * Insight Title: BUBBLE
     * Insight ID: 9196537d-71ab-494c-8b89-89e34cfee4ce
     */ BUBBLE: "9196537d-71ab-494c-8b89-89e34cfee4ce",
    /**
     * Insight Title: HEATMAP1
     * Insight ID: 94431272-194f-49fc-848d-20db5139a162
     */ HEATMAP1: "94431272-194f-49fc-848d-20db5139a162",
    /**
     * Insight Title: TABLE1
     * Insight ID: 99555ce4-5bd9-41ad-a7e3-77124cf4e4cd
     */ TABLE1: "99555ce4-5bd9-41ad-a7e3-77124cf4e4cd",
    /**
     * Insight Title: REP12
     * Insight ID: 9f337b50-90d9-4b18-846f-3ce460b9864b
     */ REP12: "9f337b50-90d9-4b18-846f-3ce460b9864b",
    /**
     * Insight Title: Column PP no filter
     * Insight ID: b857ab8c-35c3-40a9-9fbb-52bfcc56e5fc
     */ ColumnPPNoFilter: "b857ab8c-35c3-40a9-9fbb-52bfcc56e5fc",
    /**
     * Insight Title: HL_REVERSED
     * Insight ID: bd9a6dda-326a-4064-b5bd-189993ef00e8
     */ HLREVERSED: "bd9a6dda-326a-4064-b5bd-189993ef00e8",
    /**
     * Insight Title: Column DATE test
     * Insight ID: bfc90533-a44e-498e-9706-dcd687f5c628
     */ ColumnDATETest: "bfc90533-a44e-498e-9706-dcd687f5c628",
    /**
     * Insight Title: SELECT 1
     * Insight ID: cc6bad28-4d84-44c4-9434-c522c623daf4
     */ SELECT1_1: "cc6bad28-4d84-44c4-9434-c522c623daf4",
    /**
     * Insight Title: REPEATER M0
     * Insight ID: cdd4fbec-8f38-4b55-95a6-b0dcbce51ece
     */ REPEATERM0: "cdd4fbec-8f38-4b55-95a6-b0dcbce51ece",
    /**
     * Insight Title: Table with MVF
     * Insight ID: d21aee45-1a94-4bcb-aa84-45ebe27b0bb0
     */ TableWithMVF: "d21aee45-1a94-4bcb-aa84-45ebe27b0bb0",
    /**
     * Insight Title: Alert Checkbox
     * Insight ID: d52fb771-3af5-4af1-a9ab-045c83b7e84d
     */ AlertCheckbox: "d52fb771-3af5-4af1-a9ab-045c83b7e84d",
    /**
     * Insight Title: HL_NORMAL
     * Insight ID: d56ef4df-ba93-4d88-a36d-42a221755057
     */ HLNORMAL: "d56ef4df-ba93-4d88-a36d-42a221755057",
    /**
     * Insight Title: AlertsBug2
     * Insight ID: d5cbb32a-4455-4da0-85af-6d173c9c7637
     */ AlertsBug2: "d5cbb32a-4455-4da0-85af-6d173c9c7637",
    /**
     * Insight Title: DrillDown
     * Insight ID: d8505bb6-b392-41a5-945b-b98fa6895fcf
     */ DrillDown: "d8505bb6-b392-41a5-945b-b98fa6895fcf",
    /**
     * Insight Title: Column PP test
     * Insight ID: e6d5d993-e929-4220-b285-a1b53ab5d711
     */ ColumnPPTest: "e6d5d993-e929-4220-b285-a1b53ab5d711",
    /**
     * Insight Title: Column PP only filter
     * Insight ID: ee649c89-37a4-49ce-bfb5-e228737e03a5
     */ ColumnPPOnlyFilter: "ee649c89-37a4-49ce-bfb5-e228737e03a5",
    /**
     * Insight Title: AlertBug1
     * Insight ID: f87931b2-d0aa-4e99-b6a0-2023f8ed6c05
     */ AlertBug1: "f87931b2-d0aa-4e99-b6a0-2023f8ed6c05",
    /**
     * Insight Title: METRIC VALUE FILTER 1
     * Insight ID: f96c3d2d-9166-4492-a17a-3ab32ac04ebd
     */ METRICVALUEFILTER1: "f96c3d2d-9166-4492-a17a-3ab32ac04ebd",
    /**
     * Insight Title: GEO1
     * Insight ID: fd894e9a-5ca5-4ff2-9987-0a91bdeb90b5
     */ GEO1_1: "fd894e9a-5ca5-4ff2-9987-0a91bdeb90b5",
    /**
     * Insight Title: TREEMAP
     * Insight ID: ff7a4771-6764-4def-9c78-8ab5e9effe21
     */ TREEMAP: "ff7a4771-6764-4def-9c78-8ab5e9effe21",
};
export const Dashboards = {
    /**
     * Dashboard Title: Alerts Bug 2
     * Dashboard ID: 0235a44d-da7e-4521-a821-51550021b49a
     */
    AlertsBug2_1: "0235a44d-da7e-4521-a821-51550021b49a",
    /**
     * Dashboard Title: EXPORT_NESTED_SW
     * Dashboard ID: 02765f82-b83d-4f7a-ab0f-535d148638f9
     */ EXPORTNESTEDSW: "02765f82-b83d-4f7a-ab0f-535d148638f9",
    /**
     * Dashboard Title: 2
     * Dashboard ID: 02878baf-e286-4c66-aca1-8d8fdebbbb8b
     */ _2: "02878baf-e286-4c66-aca1-8d8fdebbbb8b",
    /**
     * Dashboard Title: EXPORTS - Complex Slides MIC 2
     * Dashboard ID: 07fe7970-c0a3-4aaa-91bd-dfaf3bd2fcfa
     */ EXPORTSComplexSlidesMIC2: "07fe7970-c0a3-4aaa-91bd-dfaf3bd2fcfa",
    /**
     * Dashboard Title: REFERENCES
     * Dashboard ID: 0b9b601d-fbf8-4e82-8ece-8a9dc9edc6bc
     */ REFERENCES_1: "0b9b601d-fbf8-4e82-8ece-8a9dc9edc6bc",
    /**
     * Dashboard Title: TOTAL
     * Dashboard ID: 24c9d9d1-82ab-499e-81b1-49b4141e0fda
     */ TOTAL_1: "24c9d9d1-82ab-499e-81b1-49b4141e0fda",
    /**
     * Dashboard Title: 1
     * Dashboard ID: 35178551-c87f-4938-8277-1a5616386eea
     */ _1: "35178551-c87f-4938-8277-1a5616386eea",
    /**
     * Dashboard Title: EXPORT_NESTED_2_SW
     * Dashboard ID: 367db946-3f11-4b6a-8c12-771971f30853
     */ EXPORTNESTED2SW: "367db946-3f11-4b6a-8c12-771971f30853",
    /**
     * Dashboard Title: MOC 3
     * Dashboard ID: 5a71f46a-6b20-470c-947d-c148d5a5cabe
     */ MOC3: "5a71f46a-6b20-470c-947d-c148d5a5cabe",
    /**
     * Dashboard Title: GEO
     * Dashboard ID: 60306c21-283f-42f1-a2c6-90657073caa6
     */ GEO: "60306c21-283f-42f1-a2c6-90657073caa6",
    /**
     * Dashboard Title: RICH_TEXT
     * Dashboard ID: 6075d916-b9b3-4f6e-854a-1a8b11731cc4
     */ RICHTEXT: "6075d916-b9b3-4f6e-854a-1a8b11731cc4",
    /**
     * Dashboard Title: Alerts Bugs 1
     * Dashboard ID: 81b5ed6d-6978-424b-85ff-fdc567e5d082
     */ AlertsBugs1: "81b5ed6d-6978-424b-85ff-fdc567e5d082",
    /**
     * Dashboard Title: Untitled
     * Dashboard ID: 8fcf9763-710f-4cb2-9bf3-59fa995cb0e3
     */ Untitled: "8fcf9763-710f-4cb2-9bf3-59fa995cb0e3",
    /**
     * Dashboard Title: AS OF DATE
     * Dashboard ID: 913cb4ca-ccb6-483a-b505-135cb0a2060f
     */ ASOFDATE: "913cb4ca-ccb6-483a-b505-135cb0a2060f",
    /**
     * Dashboard Title: EXPORTS - Complex Slides MIC 1
     * Dashboard ID: bec9a2bc-2f45-4e90-8907-bd92b7938d75
     */ EXPORTSComplexSlidesMIC1: "bec9a2bc-2f45-4e90-8907-bd92b7938d75",
    /**
     * Dashboard Title: Metric Value Filter
     * Dashboard ID: c80d69b2-4446-4358-a230-7b09b8cef92a
     */ MetricValueFilter: "c80d69b2-4446-4358-a230-7b09b8cef92a",
    /**
     * Dashboard Title: Headline css
     * Dashboard ID: eb33d559-f999-4f15-ac66-c04bb2effa24
     */ HeadlineCss: "eb33d559-f999-4f15-ac66-c04bb2effa24",
    /**
     * Dashboard Title: GEO
     * Dashboard ID: ef26e83e-bfd0-430a-b0a4-cce244cdd9b5
     */ GEO_1: "ef26e83e-bfd0-430a-b0a4-cce244cdd9b5",
};
