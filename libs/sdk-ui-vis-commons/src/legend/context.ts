// (C) 2025 GoodData Corporation

import { ISeriesItem } from "./types.js";
import React from "react";
import { createContextStore } from "@gooddata/sdk-ui";

export const useLegendSeriesContextValue = ({
    series,
    focusedIndex,
    id,
}: {
    series: ISeriesItem[];
    focusedIndex: number;
    id: string;
}) => {
    const descriptionId = `${id}-description`;

    const makeItemId = React.useCallback(
        (item?: ISeriesItem) => item && `${id}-${series.indexOf(item)}`,
        [id, series],
    );

    return React.useMemo(
        () => ({
            focusedItem: series[focusedIndex],
            makeItemId,
            descriptionId,
        }),
        [descriptionId, focusedIndex, makeItemId, series],
    );
};

export const LegendSeriesContextStore =
    createContextStore<ReturnType<typeof useLegendSeriesContextValue>>("LegendSeries");
