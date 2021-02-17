// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { DashboardLayoutColumnRenderer } from "./DashboardLayoutColumnRenderer";
import { DashboardLayoutRowHeader } from "./DashboardLayoutRowHeader";
import { IDashboardViewLayoutRowHeaderRenderProps } from "./interfaces/dashboardLayoutComponents";
import { FluidLayoutColumnRenderer } from "../FluidLayout";
import { IDashboardViewLayoutColumnFacade } from "./facade/interfaces";

const emptyColumnFacadeWithFullSize: IDashboardViewLayoutColumnFacade<any> = {
    index: () => 0,
    raw: () => null,
    content: () => null,
    row: () => undefined,
    size: () => ({ xl: { widthAsGridColumnsCount: 12 } }),
    sizeForScreen: () => ({ widthAsGridColumnsCount: 12 }),
    isLastInRow: () => true,
    contentEquals: () => false,
    contentIs: () => false,
    hasContent: () => false,
    hasSizeForScreen: () => false,
    indexIs: () => false,
    isFirstInRow: () => true,
    test: () => false,
    testRaw: () => false,
    hasCustomContent: () => false,
    hasInsightWidgetContent: () => false,
    hasInsightWidgetDefinitionContent: () => false,
    hasKpiWidgetContent: () => false,
    hasKpiWidgetDefinitionContent: () => false,
    hasLayoutContent: () => false,
    hasWidgetContent: () => false,
    hasWidgetDefinitionContent: () => false,
    hasWidgetWithInsightRef: () => false,
    hasWidgetWithKpiRef: () => false,
    hasWidgetWithRef: () => false,
    isEmpty: () => false,
};

export function DashboardLayoutRowHeaderRenderer<TCustomContent>(
    props: IDashboardViewLayoutRowHeaderRenderProps<TCustomContent>,
): JSX.Element {
    const { row, screen } = props;
    const rowHeader = row.header();

    return rowHeader ? (
        <DashboardLayoutColumnRenderer
            DefaultColumnRenderer={FluidLayoutColumnRenderer}
            column={emptyColumnFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutRowHeader title={rowHeader.title} description={rowHeader.description} />
        </DashboardLayoutColumnRenderer>
    ) : null;
}
