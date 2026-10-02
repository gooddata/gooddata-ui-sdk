// (C) 2025-2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files, eslint-js/no-restricted-syntax

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

    /**
     * Highcharts has missing types for some of its officially supported APIs. See this issue:
     * https://github.com/highcharts/highcharts/issues/24856. This typing issue is resolved in Highcharts v13.0.1
     * (https://github.com/highcharts/highcharts/blob/v13.0.1/ts/Series/Funnel/FunnelDataLabelOptions.d.ts).
     * The Highcharts bundle exports no `FunnelDataLabelOptions` to augment, so augmenting
     * `SeriesPieDataLabelsOptionsObject`, which `FunnelDataLabelOptions` extends.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface SeriesPieDataLabelsOptionsObject {
        /**
         * Whether to render the data labels inside the funnel or pyramid shape.
         * By default, the labels are rendered outside the shape.
         */
        inside?: boolean;
    }
}
