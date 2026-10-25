// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactElement, createContext, useContext } from "react";

import { type ISlotProps } from "@gooddata/sdk-ui-kit";

/**
 * Props of the region shown while Analytical Designer loads.
 *
 * @alpha
 */
export interface IAnalyticalDesignerLoadingProps {
    /**
     * Class name of the default loading indicator.
     */
    className?: string;
}

/**
 * Props of the region shown when Analytical Designer cannot start.
 *
 * @alpha
 */
export interface IAnalyticalDesignerErrorProps {
    /**
     * The error that stopped Analytical Designer from starting.
     */
    error: unknown;
}

/**
 * Component a host assigns to an Analytical Designer slot. It receives the default implementation of
 * the region and the props the default would get.
 *
 * @alpha
 */
export type AnalyticalDesignerSlotComponent<TProps> = ComponentType<ISlotProps<TProps>>;

/**
 * Regions of Analytical Designer that a host can replace or wrap.
 *
 * @alpha
 */
export interface IAnalyticalDesignerSlots {
    /**
     * Shown while Analytical Designer loads.
     */
    Loading?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerLoadingProps>;

    /**
     * Shown when Analytical Designer cannot start.
     */
    Error?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerErrorProps>;
}

const AdSlotsContext = createContext<IAnalyticalDesignerSlots>({});

export const AdSlotsProvider = AdSlotsContext.Provider;

export function useAdSlots(): IAnalyticalDesignerSlots {
    return useContext(AdSlotsContext);
}

/** AD's own loading indicator, the default of the Loading slot inside AD. */
export function MainLoading({ className = "main-loading" }: IAnalyticalDesignerLoadingProps) {
    return <div className={className} />;
}

/** Renders the host's slot with the default region, or the default region alone. */
export function renderSlot<TProps extends object>(
    Slot: AnalyticalDesignerSlotComponent<TProps> | undefined,
    Default: ComponentType<TProps>,
    defaultProps: TProps,
): ReactElement {
    return Slot ? <Slot Default={Default} defaultProps={defaultProps} /> : <Default {...defaultProps} />;
}
