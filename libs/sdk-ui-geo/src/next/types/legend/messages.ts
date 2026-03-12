// (C) 2026 GoodData Corporation

export type LegendMessageId =
    | "geochart.legend.layer.hidden"
    | "geochart.legend.layer.shown"
    | "geochart.legend.item.hidden"
    | "geochart.legend.item.shown"
    | "geochart.legend.colorScale.label"
    | "geochart.legend.colorScale.title.allSegments";

export type LegendMessageValues = Record<string, string | number | undefined>;
