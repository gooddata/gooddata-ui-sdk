// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useResolvedPlaceholderValues } from "./useResolvedPlaceholderValues.js";
import { IGeoAreaChartProps } from "../../types/areaPublic.js";

/**
 * Resolves area props into a normalized format
 *
 * @remarks
 * Unlike pushpin charts, area always uses a single area attribute
 * (geographic areas like countries or regions), so no special resolution is needed.
 * This hook exists for consistency with the pushpin implementation.
 *
 * @param props - Raw props from component
 * @returns Resolved props ready for execution
 *
 * @internal
 */
export function useResolvedAreaProps(props: IGeoAreaChartProps): IGeoAreaChartProps {
    const [area, color, segmentBy, filters, sortBy] = useResolvedPlaceholderValues([
        props.area,
        props.color,
        props.segmentBy,
        props.filters,
        props.sortBy,
    ]);

    return useMemo(() => {
        return {
            ...props,
            area,
            color,
            segmentBy,
            filters,
            sortBy,
        };
    }, [props, area, color, segmentBy, filters, sortBy]);
}
