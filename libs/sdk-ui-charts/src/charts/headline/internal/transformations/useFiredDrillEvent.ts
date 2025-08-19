// (C) 2023-2025 GoodData Corporation
import { useCallback } from "react";

import { IDataView } from "@gooddata/sdk-backend-spi";
import { IDrillEventCallback, fireDrillEvent } from "@gooddata/sdk-ui";

import { HeadlineFiredDrillEvent, IHeadlineFiredDrillEventItemContext } from "../interfaces/DrillEvents.js";
import { buildDrillEventData } from "../utils/HeadlineTransformationUtils.js";

export const useFireDrillEvent = (dataView: IDataView, onDrill: IDrillEventCallback) => {
    const handleFiredDrillEvent = useCallback<HeadlineFiredDrillEvent>(
        (item: IHeadlineFiredDrillEventItemContext, elementTarget?: EventTarget) => {
            const drillEventData = buildDrillEventData(item, dataView);
            fireDrillEvent(onDrill, drillEventData, elementTarget);
        },
        [dataView, onDrill],
    );

    return { handleFiredDrillEvent };
};
