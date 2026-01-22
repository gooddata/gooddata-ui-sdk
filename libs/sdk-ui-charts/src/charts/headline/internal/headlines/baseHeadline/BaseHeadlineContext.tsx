// (C) 2023-2026 GoodData Corporation

import { createContext, useContext } from "react";

import { type IChartConfig } from "../../../../../interfaces/chartConfig.js";
import { type FiredDrillEventCallback } from "../../interfaces/DrillEvents.js";

interface IBaseHeadlineContextData {
    clientWidth: number;
    clientHeight: number;
    config?: IChartConfig;
    fireDrillEvent: FiredDrillEventCallback;
}

export const BaseHeadlineContext = createContext<IBaseHeadlineContextData>({
    clientWidth: 0,
    clientHeight: 0,
    config: undefined,
    fireDrillEvent: () => {},
});

export const useBaseHeadline = () => useContext<IBaseHeadlineContextData>(BaseHeadlineContext);
