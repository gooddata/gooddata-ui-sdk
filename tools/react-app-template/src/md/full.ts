// (C) 2022 GoodData Corporation

/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2022-12-14T16:46:30.608Z; */
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
 * Attribute Title: Type
 * Attribute ID: type
 */
export const Type: IAttribute = newAttribute("type");
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
     * Display Form Title: Location
     * Display Form ID: geo__state__location
     */
    Location: newAttribute("geo__state__location"),
    /**
     * Display Form Title: State
     * Display Form ID: state
     */ Default: newAttribute("state"),
};
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
 * Metric Title: # of Active Customers
 * Metric ID: amount_of_active_customers
 * Metric Type: MAQL Metric
 */
export const NrOfActiveCustomers: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("amount_of_active_customers", "measure"),
);
/**
 * Metric Title: # of Orders
 * Metric ID: amount_of_orders
 * Metric Type: MAQL Metric
 */
export const NrOfOrders: IMeasure<IMeasureDefinition> = newMeasure(idRef("amount_of_orders", "measure"));
/**
 * Metric Title: # of Top Customers
 * Metric ID: amount_of_top_customers
 * Metric Type: MAQL Metric
 */
export const NrOfTopCustomers: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("amount_of_top_customers", "measure"),
);
/**
 * Metric Title: # of Valid Orders
 * Metric ID: amount_of_valid_orders
 * Metric Type: MAQL Metric
 */
export const NrOfValidOrders: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("amount_of_valid_orders", "measure"),
);
/**
 * Metric Title: Campaign Spend
 * Metric ID: campaign_spend
 * Metric Type: MAQL Metric
 */
export const CampaignSpend: IMeasure<IMeasureDefinition> = newMeasure(idRef("campaign_spend", "measure"));
/**
 * Metric Title: Link
 * Metric ID: link
 * Metric Type: MAQL Metric
 */
export const Link: IMeasure<IMeasureDefinition> = newMeasure(idRef("link", "measure"));
/**
 * Metric Title: Order Amount
 * Metric ID: order_amount
 * Metric Type: MAQL Metric
 */
export const OrderAmount: IMeasure<IMeasureDefinition> = newMeasure(idRef("order_amount", "measure"));
/**
 * Metric Title: % Revenue
 * Metric ID: percent_revenue
 * Metric Type: MAQL Metric
 */
export const PercentRevenue: IMeasure<IMeasureDefinition> = newMeasure(idRef("percent_revenue", "measure"));
/**
 * Metric Title: % Revenue from Top 10 Customers
 * Metric ID: percent_revenue_from_top_10_customers
 * Metric Type: MAQL Metric
 */
export const PercentRevenueFromTop10Customers: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_from_top_10_customers", "measure"),
);
/**
 * Metric Title: % Revenue from Top 10% Customers
 * Metric ID: percent_revenue_from_top_10_percent_customers
 * Metric Type: MAQL Metric
 */
export const PercentRevenueFromTop10PercentCustomers: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_from_top_10_percent_customers", "measure"),
);
/**
 * Metric Title: % Revenue from Top 10% Products
 * Metric ID: percent_revenue_from_top_10_percent_products
 * Metric Type: MAQL Metric
 */
export const PercentRevenueFromTop10PercentProducts: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_from_top_10_percent_products", "measure"),
);
/**
 * Metric Title: % Revenue from Top 10 Products
 * Metric ID: percent_revenue_from_top_10_products
 * Metric Type: MAQL Metric
 */
export const PercentRevenueFromTop10Products: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_from_top_10_products", "measure"),
);
/**
 * Metric Title: % Revenue in Category
 * Metric ID: percent_revenue_in_category
 * Metric Type: MAQL Metric
 */
export const PercentRevenueInCategory: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_in_category", "measure"),
);
/**
 * Metric Title: % Revenue per Product
 * Metric ID: percent_revenue_per_product
 * Metric Type: MAQL Metric
 */
export const PercentRevenuePerProduct: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("percent_revenue_per_product", "measure"),
);
/**
 * Metric Title: Revenue
 * Metric ID: revenue
 * Metric Type: MAQL Metric
 */
export const Revenue: IMeasure<IMeasureDefinition> = newMeasure(idRef("revenue", "measure"));
/**
 * Metric Title: Revenue (Clothing)
 * Metric ID: revenue-clothing
 * Metric Type: MAQL Metric
 */
export const RevenueClothing: IMeasure<IMeasureDefinition> = newMeasure(idRef("revenue-clothing", "measure"));
/**
 * Metric Title: Revenue (Electronic)
 * Metric ID: revenue-electronic
 * Metric Type: MAQL Metric
 */
export const RevenueElectronic: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("revenue-electronic", "measure"),
);
/**
 * Metric Title: Revenue (Home)
 * Metric ID: revenue-home
 * Metric Type: MAQL Metric
 */
export const RevenueHome: IMeasure<IMeasureDefinition> = newMeasure(idRef("revenue-home", "measure"));
/**
 * Metric Title: Revenue (Outdoor)
 * Metric ID: revenue-outdoor
 * Metric Type: MAQL Metric
 */
export const RevenueOutdoor: IMeasure<IMeasureDefinition> = newMeasure(idRef("revenue-outdoor", "measure"));
/**
 * Metric Title: Revenue per Customer
 * Metric ID: revenue_per_customer
 * Metric Type: MAQL Metric
 */
export const RevenuePerCustomer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("revenue_per_customer", "measure"),
);
/**
 * Metric Title: Revenue per Dollar Spent
 * Metric ID: revenue_per_dollar_spent
 * Metric Type: MAQL Metric
 */
export const RevenuePerDollarSpent: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("revenue_per_dollar_spent", "measure"),
);
/**
 * Metric Title: Revenue / Top 10
 * Metric ID: revenue_top_10
 * Metric Type: MAQL Metric
 */
export const RevenueTop10: IMeasure<IMeasureDefinition> = newMeasure(idRef("revenue_top_10", "measure"));
/**
 * Metric Title: Revenue / Top 10%
 * Metric ID: revenue_top_10_percent
 * Metric Type: MAQL Metric
 */
export const RevenueTop10Percent: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("revenue_top_10_percent", "measure"),
);
/**
 * Metric Title: Total Revenue
 * Metric ID: total_revenue
 * Metric Type: MAQL Metric
 */
export const TotalRevenue: IMeasure<IMeasureDefinition> = newMeasure(idRef("total_revenue", "measure"));
/**
 * Metric Title: Total Revenue (No Filters)
 * Metric ID: total_revenue-no_filters
 * Metric Type: MAQL Metric
 */
export const TotalRevenueNoFilters: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("total_revenue-no_filters", "measure"),
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
 * Attribute Title: Date - Date
 * Attribute ID: date.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateDate: IAttribute = newAttribute("date.day");
/**
 * Attribute Title: Date - Week/Year
 * Attribute ID: date.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateWeekYear: IAttribute = newAttribute("date.week");
/**
 * Attribute Title: Date - Month/Year
 * Attribute ID: date.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateMonthYear: IAttribute = newAttribute("date.month");
/**
 * Attribute Title: Date - Quarter/Year
 * Attribute ID: date.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateQuarterYear: IAttribute = newAttribute("date.quarter");
/**
 * Attribute Title: Date - Year
 * Attribute ID: date.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateYear: IAttribute = newAttribute("date.year");
/**
 * Attribute Title: Date - Day of Week
 * Attribute ID: date.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateDayOfWeek: IAttribute = newAttribute("date.dayOfWeek");
/**
 * Attribute Title: Date - Day of Month
 * Attribute ID: date.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateDayOfMonth: IAttribute = newAttribute("date.dayOfMonth");
/**
 * Attribute Title: Date - Day of Year
 * Attribute ID: date.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateDayOfYear: IAttribute = newAttribute("date.dayOfYear");
/**
 * Attribute Title: Date - Week of Year
 * Attribute ID: date.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateWeekOfYear: IAttribute = newAttribute("date.weekOfYear");
/**
 * Attribute Title: Date - Month of Year
 * Attribute ID: date.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateMonthOfYear: IAttribute = newAttribute("date.monthOfYear");
/**
 * Attribute Title: Date - Quarter of Year
 * Attribute ID: date.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const DateQuarterOfYear: IAttribute = newAttribute("date.quarterOfYear");
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Date
     * Date Data Set ID: date
     */
    Date: {
        ref: idRef("date", "dataSet"),
        identifier: "date",
        /**
         * Date Attribute: Date - Date
         * Date Attribute ID: date.day
         */ DateDate: {
            ref: idRef("date.day", "attribute"),
            identifier: "date.day",
            /**
             * Display Form Title: Date - Date
             * Display Form ID: date.day
             */ Default: newAttribute("date.day"),
        },
        /**
         * Date Attribute: Date - Week/Year
         * Date Attribute ID: date.week
         */ DateWeekYear: {
            ref: idRef("date.week", "attribute"),
            identifier: "date.week",
            /**
             * Display Form Title: Date - Week/Year
             * Display Form ID: date.week
             */ Default: newAttribute("date.week"),
        },
        /**
         * Date Attribute: Date - Month/Year
         * Date Attribute ID: date.month
         */ DateMonthYear: {
            ref: idRef("date.month", "attribute"),
            identifier: "date.month",
            /**
             * Display Form Title: Date - Month/Year
             * Display Form ID: date.month
             */ Default: newAttribute("date.month"),
        },
        /**
         * Date Attribute: Date - Quarter/Year
         * Date Attribute ID: date.quarter
         */ DateQuarterYear: {
            ref: idRef("date.quarter", "attribute"),
            identifier: "date.quarter",
            /**
             * Display Form Title: Date - Quarter/Year
             * Display Form ID: date.quarter
             */ Default: newAttribute("date.quarter"),
        },
        /**
         * Date Attribute: Date - Year
         * Date Attribute ID: date.year
         */ DateYear: {
            ref: idRef("date.year", "attribute"),
            identifier: "date.year",
            /**
             * Display Form Title: Date - Year
             * Display Form ID: date.year
             */ Default: newAttribute("date.year"),
        },
        /**
         * Date Attribute: Date - Day of Week
         * Date Attribute ID: date.dayOfWeek
         */ DateDayOfWeek: {
            ref: idRef("date.dayOfWeek", "attribute"),
            identifier: "date.dayOfWeek",
            /**
             * Display Form Title: Date - Day of Week
             * Display Form ID: date.dayOfWeek
             */ Default: newAttribute("date.dayOfWeek"),
        },
        /**
         * Date Attribute: Date - Day of Month
         * Date Attribute ID: date.dayOfMonth
         */ DateDayOfMonth: {
            ref: idRef("date.dayOfMonth", "attribute"),
            identifier: "date.dayOfMonth",
            /**
             * Display Form Title: Date - Day of Month
             * Display Form ID: date.dayOfMonth
             */ Default: newAttribute("date.dayOfMonth"),
        },
        /**
         * Date Attribute: Date - Day of Year
         * Date Attribute ID: date.dayOfYear
         */ DateDayOfYear: {
            ref: idRef("date.dayOfYear", "attribute"),
            identifier: "date.dayOfYear",
            /**
             * Display Form Title: Date - Day of Year
             * Display Form ID: date.dayOfYear
             */ Default: newAttribute("date.dayOfYear"),
        },
        /**
         * Date Attribute: Date - Week of Year
         * Date Attribute ID: date.weekOfYear
         */ DateWeekOfYear: {
            ref: idRef("date.weekOfYear", "attribute"),
            identifier: "date.weekOfYear",
            /**
             * Display Form Title: Date - Week of Year
             * Display Form ID: date.weekOfYear
             */ Default: newAttribute("date.weekOfYear"),
        },
        /**
         * Date Attribute: Date - Month of Year
         * Date Attribute ID: date.monthOfYear
         */ DateMonthOfYear: {
            ref: idRef("date.monthOfYear", "attribute"),
            identifier: "date.monthOfYear",
            /**
             * Display Form Title: Date - Month of Year
             * Display Form ID: date.monthOfYear
             */ Default: newAttribute("date.monthOfYear"),
        },
        /**
         * Date Attribute: Date - Quarter of Year
         * Date Attribute ID: date.quarterOfYear
         */ DateQuarterOfYear: {
            ref: idRef("date.quarterOfYear", "attribute"),
            identifier: "date.quarterOfYear",
            /**
             * Display Form Title: Date - Quarter of Year
             * Display Form ID: date.quarterOfYear
             */ Default: newAttribute("date.quarterOfYear"),
        },
    },
};
export const Insights = {
    /**
     * Insight Title: Revenue (Electronics)
     * Insight ID: 001bd32c-1178-4679-bc7a-a1e81c101b9e
     */
    RevenueElectronics: "001bd32c-1178-4679-bc7a-a1e81c101b9e",
    /**
     * Insight Title: Outdoor Comparison (over previous period)
     * Insight ID: 02897730-0971-458b-8170-f0514c99c2a9
     */ OutdoorComparisonOverPreviousPeriod: "02897730-0971-458b-8170-f0514c99c2a9",
    /**
     * Insight Title: Home category
     * Insight ID: 068b737e-e6c1-41d5-8b1b-795ce8e27655
     */ HomeCategory: "068b737e-e6c1-41d5-8b1b-795ce8e27655",
    /**
     * Insight Title: # of Regions
     * Insight ID: 128d3764-da3d-43c3-acc4-5be9d9f1bc66
     */ NrOfRegions: "128d3764-da3d-43c3-acc4-5be9d9f1bc66",
    /**
     * Insight Title: Total active customers
     * Insight ID: 12a502de-ddc7-4718-8be6-24c5c6d19a73
     */ TotalActiveCustomers: "12a502de-ddc7-4718-8be6-24c5c6d19a73",
    /**
     * Insight Title: Customers (South)
     * Insight ID: 1b5d40eb-9d0b-4ffd-b8ae-850d2dfc385d
     */ CustomersSouth: "1b5d40eb-9d0b-4ffd-b8ae-850d2dfc385d",
    /**
     * Insight Title: Customers detail: Northeast
     * Insight ID: 28db2062-d7ee-4705-a82a-ec811e023e7f
     */ CustomersDetailNortheast: "28db2062-d7ee-4705-a82a-ec811e023e7f",
    /**
     * Insight Title: Revenue (Clothing)
     * Insight ID: 31e6cae6-52ba-47c7-b4d3-6ecd9de50343
     */ RevenueClothing_1: "31e6cae6-52ba-47c7-b4d3-6ecd9de50343",
    /**
     * Insight Title: Avg Revenue per Customer
     * Insight ID: 34b46f63-c311-4598-9433-43ed17855726
     */ AvgRevenuePerCustomer: "34b46f63-c311-4598-9433-43ed17855726",
    /**
     * Insight Title: Customers detail: South
     * Insight ID: 4171421f-4b2b-411c-a180-a7d1feb63158
     */ CustomersDetailSouth: "4171421f-4b2b-411c-a180-a7d1feb63158",
    /**
     * Insight Title: Revenue (Outdoor)
     * Insight ID: 430a7d73-2c47-48ab-bc42-99685f7059ab
     */ RevenueOutdoor_1: "430a7d73-2c47-48ab-bc42-99685f7059ab",
    /**
     * Insight Title: Total revenue
     * Insight ID: 4b7d6686-3eb1-4642-808c-519d3e49e8e7
     */ TotalRevenue_1: "4b7d6686-3eb1-4642-808c-519d3e49e8e7",
    /**
     * Insight Title: Customers Daily Trend
     * Insight ID: 634a86a3-7ec5-45db-a133-7aca324b14c0
     */ CustomersDailyTrend: "634a86a3-7ec5-45db-a133-7aca324b14c0",
    /**
     * Insight Title: Customers (West)
     * Insight ID: 691e98ef-69b6-496d-8eff-5e216a099ce7
     */ CustomersWest: "691e98ef-69b6-496d-8eff-5e216a099ce7",
    /**
     * Insight Title: Top 10 Customers by Region
     * Insight ID: 78bb0257-1f2a-452f-b16b-20022b1c3c3b
     */ Top10CustomersByRegion: "78bb0257-1f2a-452f-b16b-20022b1c3c3b",
    /**
     * Insight Title: Revenue Daily Trend
     * Insight ID: 816834f6-128d-4ff1-8ba1-83c8a92b29ac
     */ RevenueDailyTrend: "816834f6-128d-4ff1-8ba1-83c8a92b29ac",
    /**
     * Insight Title: Customers (Northeast)
     * Insight ID: 8a68f346-8d2b-4f9f-935b-b86b81ddfbe8
     */ CustomersNortheast: "8a68f346-8d2b-4f9f-935b-b86b81ddfbe8",
    /**
     * Insight Title: All products
     * Insight ID: 958ff1b9-2240-49c7-9bdd-cb9910f1d224
     */ AllProducts: "958ff1b9-2240-49c7-9bdd-cb9910f1d224",
    /**
     * Insight Title: Electronics Comparison (over previous period)
     * Insight ID: 9767e08a-a8b5-4b73-a933-e650d2a27670
     */ ElectronicsComparisonOverPreviousPeriod: "9767e08a-a8b5-4b73-a933-e650d2a27670",
    /**
     * Insight Title: # of Product categories
     * Insight ID: 9dbd459b-e2f2-42a2-8062-6f4df35dde63
     */ NrOfProductCategories: "9dbd459b-e2f2-42a2-8062-6f4df35dde63",
    /**
     * Insight Title: Electronics category
     * Insight ID: ad3474f3-34a2-484b-a849-4970bc68b87c
     */ ElectronicsCategory: "ad3474f3-34a2-484b-a849-4970bc68b87c",
    /**
     * Insight Title: Home Comparison (over previous period)
     * Insight ID: ad5d8ac3-1d2b-442e-ad9b-1fcd581160a1
     */ HomeComparisonOverPreviousPeriod: "ad5d8ac3-1d2b-442e-ad9b-1fcd581160a1",
    /**
     * Insight Title: Outdoor category
     * Insight ID: b0fa8d5a-457e-488d-95b0-e3730ceac3d9
     */ OutdoorCategory: "b0fa8d5a-457e-488d-95b0-e3730ceac3d9",
    /**
     * Insight Title: Clothing category
     * Insight ID: b34483a3-9a8a-496a-b831-1a067ba318a9
     */ ClothingCategory: "b34483a3-9a8a-496a-b831-1a067ba318a9",
    /**
     * Insight Title: Top 5 Product by Quantity
     * Insight ID: c428b84c-29f5-445a-a3a5-c09a359392a1
     */ Top5ProductByQuantity: "c428b84c-29f5-445a-a3a5-c09a359392a1",
    /**
     * Insight Title: Headline as a link
     * Insight ID: c72ad5d4-c647-4d22-b8b7-46144be1dfce
     */ HeadlineAsALink: "c72ad5d4-c647-4d22-b8b7-46144be1dfce",
    /**
     * Insight Title: Campaign Spend
     * Insight ID: campaign_spend
     */ CampaignSpend_1: "campaign_spend",
    /**
     * Insight Title: Customers detail: West
     * Insight ID: ce2cd647-d5bf-4905-8671-9d8090a4bcd2
     */ CustomersDetailWest: "ce2cd647-d5bf-4905-8671-9d8090a4bcd2",
    /**
     * Insight Title: Customers Trend
     * Insight ID: customers_trend
     */ CustomersTrend: "customers_trend",
    /**
     * Insight Title: All customers
     * Insight ID: d4ae9c48-4768-4c45-a061-d9fe55aab785
     */ AllCustomers: "d4ae9c48-4768-4c45-a061-d9fe55aab785",
    /**
     * Insight Title: Customers (Midwest)
     * Insight ID: dcf3d5c6-a8fe-42ba-9aa4-bcf872c7b165
     */ CustomersMidwest: "dcf3d5c6-a8fe-42ba-9aa4-bcf872c7b165",
    /**
     * Insight Title: Revenue (Home)
     * Insight ID: df9d3c04-357c-40ef-a996-fa62d5560f67
     */ RevenueHome_1: "df9d3c04-357c-40ef-a996-fa62d5560f67",
    /**
     * Insight Title: Total orders
     * Insight ID: e46663f0-ad17-41d3-bc27-8db96992a6f6
     */ TotalOrders: "e46663f0-ad17-41d3-bc27-8db96992a6f6",
    /**
     * Insight Title: Customers detail: Midwest
     * Insight ID: ec5ad801-0186-4fa4-93f6-11ced93e70ad
     */ CustomersDetailMidwest: "ec5ad801-0186-4fa4-93f6-11ced93e70ad",
    /**
     * Insight Title: # of Products
     * Insight ID: f10b4d01-9985-45e4-a968-82b524825a0a
     */ NrOfProducts: "f10b4d01-9985-45e4-a968-82b524825a0a",
    /**
     * Insight Title: % Revenue per Product by Customer and Category
     * Insight ID: percent_revenue_per_product_by_customer_and_category
     */ PercentRevenuePerProductByCustomerAndCategory: "percent_revenue_per_product_by_customer_and_category",
    /**
     * Insight Title: Percentage of Customers by Region
     * Insight ID: percentage_of_customers_by_region
     */ PercentageOfCustomersByRegion: "percentage_of_customers_by_region",
    /**
     * Insight Title: Product Breakdown
     * Insight ID: product_breakdown
     */ ProductBreakdown: "product_breakdown",
    /**
     * Insight Title: Product Categories Pie Chart
     * Insight ID: product_categories_pie_chart
     */ ProductCategoriesPieChart: "product_categories_pie_chart",
    /**
     * Insight Title: Product Revenue Comparison (over previous period)
     * Insight ID: product_revenue_comparison-over_previous_period
     */ ProductRevenueComparisonOverPreviousPeriod: "product_revenue_comparison-over_previous_period",
    /**
     * Insight Title: Product Saleability
     * Insight ID: product_saleability
     */ ProductSaleability: "product_saleability",
    /**
     * Insight Title: Revenue and Quantity by Product and Category
     * Insight ID: revenue_and_quantity_by_product_and_category
     */ RevenueAndQuantityByProductAndCategory: "revenue_and_quantity_by_product_and_category",
    /**
     * Insight Title: Revenue by Category Trend
     * Insight ID: revenue_by_category_trend
     */ RevenueByCategoryTrend: "revenue_by_category_trend",
    /**
     * Insight Title: Revenue by Product
     * Insight ID: revenue_by_product
     */ RevenueByProduct: "revenue_by_product",
    /**
     * Insight Title: Revenue per $ vs Spend by Campaign
     * Insight ID: revenue_per_usd_vs_spend_by_campaign
     */ RevenuePer$VsSpendByCampaign: "revenue_per_usd_vs_spend_by_campaign",
    /**
     * Insight Title: Revenue Trend
     * Insight ID: revenue_trend
     */ RevenueTrend: "revenue_trend",
    /**
     * Insight Title: Top 10 Customers
     * Insight ID: top_10_customers
     */ Top10Customers: "top_10_customers",
    /**
     * Insight Title: Top 10 Products
     * Insight ID: top_10_products
     */ Top10Products: "top_10_products",
};
export const Dashboards = {
    /**
     * Dashboard Title: 1. Overview
     * Dashboard ID: 0d9af187-ac18-4b11-8f74-b5acec32aa85
     */
    _1Overview: "0d9af187-ac18-4b11-8f74-b5acec32aa85",
    /**
     * Dashboard Title: 2. Customers
     * Dashboard ID: 0e436c43-e51b-4292-93ac-9261ef96dad3
     */ _2Customers: "0e436c43-e51b-4292-93ac-9261ef96dad3",
    /**
     * Dashboard Title: 3. Products
     * Dashboard ID: 3428a1f1-617c-422c-8c35-831c49f3d70f
     */ _3Products: "3428a1f1-617c-422c-8c35-831c49f3d70f",
};
