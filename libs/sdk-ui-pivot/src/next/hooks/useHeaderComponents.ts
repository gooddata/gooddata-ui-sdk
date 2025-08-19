// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { AttributeHeader } from "../components/Header/AttributeHeader.js";
import { MeasureGroupHeader } from "../components/Header/MeasureGroupHeader.js";
import { MeasureHeader } from "../components/Header/MeasureHeader.js";
import { PivotGroupHeader } from "../components/Header/PivotGroupHeader.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns an enhancer that registers custom header components for ag-grid.
 *
 * @internal
 */
export function useHeaderComponents(): (props: AgGridProps) => AgGridProps {
    return useCallback((props: AgGridProps): AgGridProps => {
        return {
            ...props,
            components: {
                ...(props.components ?? {}),
                PivotGroupHeader,
                MeasureGroupHeader,
                MeasureHeader,
                AttributeHeader,
            },
        };
    }, []);
}
