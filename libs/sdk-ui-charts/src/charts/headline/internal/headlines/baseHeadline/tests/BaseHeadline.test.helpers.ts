// (C) 2023-2026 GoodData Corporation

import { type Mock, vi } from "vitest";

import { type IChartConfig } from "../../../../../../interfaces/chartConfig.js";
import { type FiredDrillEventCallback } from "../../../interfaces/DrillEvents.js";

export const createMockUseBaseHeadline = (mock: Mock) => {
    return (props?: {
        clientHeight?: number;
        clientWidth?: number;
        config?: IChartConfig;
        fireDrillEvent?: FiredDrillEventCallback;
    }) => {
        mock.mockReturnValue({
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
};
