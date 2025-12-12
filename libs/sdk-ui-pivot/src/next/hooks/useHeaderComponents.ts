// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { AttributeHeader } from "../components/Header/AttributeHeader.js";
import { EmptyMeasureGroupHeader } from "../components/Header/EmptyMeasureGroupHeader.js";
import { EmptyMeasureGroupValueHeader } from "../components/Header/EmptyMeasureGroupValueHeader.js";
import { MeasureGroupHeader } from "../components/Header/MeasureGroupHeader.js";
import { MeasureHeader } from "../components/Header/MeasureHeader.js";
import { PivotGroupHeader } from "../components/Header/PivotGroupHeader.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns an enhancer that registers custom header components for ag-grid.
 *
 * @internal
 */
export function useHeaderComponents(): (props: AgGridProps) => AgGridProps {
    return useCallback((props: AgGridProps): AgGridProps => {
        const existingComponents = props.components ?? {};
        if (
            existingComponents["PivotGroupHeader"] ||
            existingComponents["MeasureGroupHeader"] ||
            existingComponents["MeasureHeader"] ||
            existingComponents["AttributeHeader"] ||
            existingComponents["EmptyMeasureGroupHeader"] ||
            existingComponents["EmptyMeasureGroupValueHeader"]
        ) {
            throw new UnexpectedSdkError("Provided header component(s) is already set");
        }
        return {
            ...props,
            components: {
                ...(props.components ?? {}),
                PivotGroupHeader,
                MeasureGroupHeader,
                MeasureHeader,
                AttributeHeader,
                EmptyMeasureGroupHeader,
                EmptyMeasureGroupValueHeader,
            },
        };
    }, []);
}
