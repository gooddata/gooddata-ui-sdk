// (C) 2023 GoodData Corporation
import { vi } from "vitest";

import * as BaseHeadlineContext from "../BaseHeadlineContext.js";
import { IChartConfig } from "../../../../../../interfaces/index.js";
import { FiredDrillEventCallback } from "../../../interfaces/DrillEvents.js";

export const mockUseBaseHeadline = (props?: {
    clientHeight?: number;
    clientWidth?: number;
    config?: IChartConfig;
    fireDrillEvent?: FiredDrillEventCallback;
}) => {
    vi.spyOn(BaseHeadlineContext, "useBaseHeadline").mockReturnValue({
        clientHeight: props?.clientHeight || 0,
        clientWidth: props?.clientWidth || 0,
        config: props?.config || {
            separators: {
                decimal: ".",
                thousand: ",",
            },
        },
        fireDrillEvent: props?.fireDrillEvent || vi.fn(),
    });
};
