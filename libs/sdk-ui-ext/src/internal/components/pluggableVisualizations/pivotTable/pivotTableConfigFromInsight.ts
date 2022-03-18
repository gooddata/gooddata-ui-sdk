// (C) 2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IColumnSizing, IPivotTableConfig, pivotTableMenuForCapabilities } from "@gooddata/sdk-ui-pivot";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor";

export function pivotTableConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): IPivotTableConfig {
    const properties = insightProperties(insight);
    const controls = properties?.controls;
    const columnSizing = controls && getColumnSizingFromControls(controls, ctx);

    const menuConfig = ctx?.backend && pivotTableMenuForCapabilities(ctx.backend.capabilities);
    const menuProp = !isEmpty(menuConfig) ? { menu: menuConfig } : {};

    const separatorsConfig = ctx?.settings?.separators;
    const separatorsProp = !isEmpty(separatorsConfig) ? { separators: separatorsConfig } : {};

    return {
        columnSizing,
        ...menuProp,
        ...separatorsProp,
        // the user can fill the rest on their own later
    };
}

function getColumnSizingFromControls(
    controls: Record<string, any>,
    ctx: IEmbeddingCodeContext | undefined,
): IColumnSizing | undefined {
    const { columnWidths } = controls;
    const columnWidthsProp = !isEmpty(columnWidths) ? { columnWidths } : {};

    const growToFitConfig = ctx?.settings?.enableTableColumnsGrowToFit;
    const growToFitProp = !isNil(growToFitConfig) ? { growToFit: growToFitConfig } : {};

    return {
        ...columnWidthsProp,
        ...growToFitProp,
        // the user can fill the rest on their own later
    };
}
