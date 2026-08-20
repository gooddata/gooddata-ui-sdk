// (C) 2023-2026 GoodData Corporation

import { type ReactElement, type ReactNode, createElement } from "react";

import { afterEach, vi } from "vitest";

import { type IChartConfig } from "../../../../../../interfaces/chartConfig.js";
import { type FiredDrillEventCallback } from "../../../interfaces/DrillEvents.js";
import { BaseHeadlineContext } from "../BaseHeadlineContext.js";

interface IBaseHeadlineContextProps {
    clientHeight?: number;
    clientWidth?: number;
    config?: IChartConfig;
    fireDrillEvent?: FiredDrillEventCallback;
}

const createBaseHeadlineContextValue = (props?: IBaseHeadlineContextProps) => ({
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

/**
 * Provides the base headline context to the tested components through the real React context provider.
 *
 * Mocking the BaseHeadlineContext module instead would leak into other test files whenever tests run
 * without isolation, as the module graph is then shared between them.
 */
export const createBaseHeadlineTestContext = () => {
    let props: IBaseHeadlineContextProps | undefined;

    afterEach(() => {
        props = undefined;
    });

    return {
        /**
         * Sets the context values used by the renders following this call.
         */
        setBaseHeadline: (nextProps?: IBaseHeadlineContextProps) => {
            props = nextProps;
        },
        /**
         * Wrapper to be passed to the render / renderHook options.
         */
        wrapper: ({ children }: { children?: ReactNode }): ReactElement =>
            createElement(
                BaseHeadlineContext.Provider,
                { value: createBaseHeadlineContextValue(props) },
                children,
            ),
    };
};
