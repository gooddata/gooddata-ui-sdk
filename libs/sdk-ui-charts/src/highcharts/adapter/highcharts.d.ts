// (C) 2025-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

// eslint-disable-next-line no-restricted-syntax
export * from "highcharts";

declare module "highcharts" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Point {
        /**
         * UNDOCUMENTED, but real HCH API.
         * Highlights a point as if the user was navigating the chart with keyboard.
         */
        highlight(): void;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Chart {
        /**
         * Custom property we add to be able to distinguish different charts
         * beyond just using the chart's internal index
         */
        id: string;
    }
}
