// (C) 2025 GoodData Corporation

import { ChartFillType, PatternFill, PatternFillName, getPatternFill } from "@gooddata/sdk-ui-vis-commons";

export interface OptionalPatternFillProps {
    chartFill: ChartFillType;
    patternFillIndex?: number | PatternFillName;
}

export function OptionalPatternFill({ chartFill, patternFillIndex }: OptionalPatternFillProps) {
    if (chartFill !== "pattern" || patternFillIndex === undefined) {
        return null;
    }
    const patternFill = getPatternFill(patternFillIndex);
    return <PatternFill patternFill={patternFill} />;
}
