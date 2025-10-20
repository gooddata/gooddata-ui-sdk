// (C) 2025 GoodData Corporation

export * from "highcharts";

declare module "highcharts" {
    interface Point {
        /**
         * UNDOCUMENTED, but real HCH API.
         * Highlights a point as if the user was navigating the chart with keyboard.
         */
        highlight(): void;
    }

    interface Chart {
        /**
         * Custom property we add to be able to distinguish different charts
         * beyond just using the chart's internal index
         */
        id: string;
    }
}
