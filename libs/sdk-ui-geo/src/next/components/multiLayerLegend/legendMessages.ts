// (C) 2026 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

import { type LegendMessageId, type LegendMessageValues } from "../../types/legend/messages.js";

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
    "geochart.legend.colorScale.title.allSegments": {
        id: "geochart.legend.colorScale.title.allSegments",
    },
});
