// (C) 2025-2026 GoodData Corporation

import {
    type ChartFillType,
    PatternFill,
    type PatternFillName,
    getPatternFill,
} from "@gooddata/sdk-ui-vis-commons";

export interface IOptionalPatternFillProps {
    chartFill: ChartFillType;
    patternFillIndex?: number | PatternFillName;
}

export function OptionalPatternFill({ chartFill, patternFillIndex }: IOptionalPatternFillProps) {
    if (chartFill !== "pattern" || patternFillIndex === undefined) {
        return null;
    }
    const patternFill = getPatternFill(patternFillIndex);
    return <PatternFill patternFill={patternFill} />;
}
