// (C) 2026 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

export type LegendMessageId =
    | "geochart.legend.layer.hidden"
    | "geochart.legend.layer.shown"
    | "geochart.legend.item.hidden"
    | "geochart.legend.item.shown"
    | "geochart.legend.colorScale.label";

export type LegendMessageValues = Record<string, string | number | undefined>;

export type LegendMessageFormatter = (id: LegendMessageId, values?: LegendMessageValues) => string;

export const legendMessagesById: Record<LegendMessageId, MessageDescriptor> = defineMessages({
    "geochart.legend.layer.hidden": {
        id: "geochart.legend.layer.hidden",
    },
    "geochart.legend.layer.shown": {
        id: "geochart.legend.layer.shown",
    },
    "geochart.legend.item.hidden": {
        id: "geochart.legend.item.hidden",
    },
    "geochart.legend.item.shown": {
        id: "geochart.legend.item.shown",
    },
    "geochart.legend.colorScale.label": {
        id: "geochart.legend.colorScale.label",
    },
});
