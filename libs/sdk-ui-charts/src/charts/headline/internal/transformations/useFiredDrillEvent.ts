// (C) 2023-2026 GoodData Corporation

import { useCallback } from "react";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type IChartCoordinates, type IDrillEventCallback, fireDrillEvent } from "@gooddata/sdk-ui";

import {
    type HeadlineFiredDrillEvent,
    type IHeadlineFiredDrillEventItemContext,
} from "../interfaces/DrillEvents.js";
import { buildDrillEventData } from "../utils/HeadlineTransformationUtils.js";

export const useFireDrillEvent = (dataView: IDataView, onDrill: IDrillEventCallback | undefined) => {
    const handleFiredDrillEvent = useCallback<HeadlineFiredDrillEvent>(
        (
            item: IHeadlineFiredDrillEventItemContext,
            elementTarget?: EventTarget,
            chartCoordinates?: IChartCoordinates,
        ) => {
            const drillEventData = buildDrillEventData(item, dataView, elementTarget, chartCoordinates);
            fireDrillEvent(onDrill, drillEventData, elementTarget!);
        },
        [dataView, onDrill],
    );

    return { handleFiredDrillEvent };
};
