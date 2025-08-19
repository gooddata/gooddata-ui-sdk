// (C) 2023-2025 GoodData Corporation
import { createContext, useContext } from "react";

import noop from "lodash/noop.js";

import { IChartConfig } from "../../../../../interfaces/index.js";
import { FiredDrillEventCallback } from "../../interfaces/DrillEvents.js";

interface IBaseHeadlineContextData {
    clientWidth: number;
    clientHeight: number;
    config: IChartConfig;
    fireDrillEvent: FiredDrillEventCallback;
}

export const BaseHeadlineContext = createContext<IBaseHeadlineContextData>({
    clientWidth: 0,
    clientHeight: 0,
    config: null,
    fireDrillEvent: noop,
});

export const useBaseHeadline = () => useContext<IBaseHeadlineContextData>(BaseHeadlineContext);
