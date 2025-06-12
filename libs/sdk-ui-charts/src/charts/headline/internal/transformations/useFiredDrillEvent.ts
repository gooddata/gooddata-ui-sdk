// (C) 2023 GoodData Corporation
import { useCallback } from "react";

import { IDataView } from "@gooddata/sdk-backend-spi";
import { fireDrillEvent, IDrillEventCallback } from "@gooddata/sdk-ui";

import { buildDrillEventData } from "../utils/HeadlineTransformationUtils.js";
import { HeadlineFiredDrillEvent, IHeadlineFiredDrillEventItemContext } from "../interfaces/DrillEvents.js";

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
