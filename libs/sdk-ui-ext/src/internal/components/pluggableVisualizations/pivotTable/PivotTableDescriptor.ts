// (C) 2021-2022 GoodData Corporation
import {
    bucketAttributes,
    bucketMeasures,
    IInsight,
    IInsightDefinition,
    insightBucket,
    insightFilters,
    insightProperties,
    insightSanitize,
    insightSorts,
    insightTotals,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import { IColumnSizing, IPivotTableConfig, IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";
import { PluggablePivotTable } from "./PluggablePivotTable";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { ISettings } from "@gooddata/sdk-backend-spi";
import { IDrillDownContext } from "../../../interfaces/Visualization";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";

export class PivotTableDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePivotTable(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: layoutDescriptor.gridColumnsCount,
                min: 3,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                min: this.getMinHeight(settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(settings.enableKDWidgetCustomHeight),
            },
        };
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const drillDownInsight = modifyBucketsAttributesForDrillDown(
            insight,
            drillDownContext.drillDefinition,
        );
        const drillDownInsightWithFilters = addIntersectionFiltersToInsight(
            drillDownInsight,
            drillDownContext.event.drillContext.intersection,
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator(
        {
            importType: "named",
            name: "PivotTable",
            package: "@gooddata/sdk-ui-pivot",
        },
        (insight): IPivotTableProps => {
            const measureBucket = insightBucket(insight, BucketNames.MEASURES);
            const rowsBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
            const columnsBucket = insightBucket(insight, BucketNames.COLUMNS);

            const measures = measureBucket && bucketMeasures(measureBucket);
            const rows = rowsBucket && bucketAttributes(rowsBucket);
            const columns = columnsBucket && bucketAttributes(columnsBucket);

            const filters = insightFilters(insight);
            const sortBy = insightSorts(insight);
            const totals = insightTotals(insight);

            const properties = insightProperties(insight);
            const config = getConfigFromProperties(properties);

            return {
                measures,
                rows,
                columns,
                filters,
                sortBy,
                totals,
                config,
            };
        },
    );
}

function getColumnSizingFromControls(controls: Record<string, any>): IColumnSizing | undefined {
    const { columnWidths } = controls;
    if (!columnWidths) {
        return undefined;
    }

    return {
        columnWidths,
        // the user can fill the rest on their own later
    };
}

function getConfigFromProperties(properties: VisualizationProperties | undefined): IPivotTableConfig {
    const controls = properties?.controls;
    const columnSizing = controls && getColumnSizingFromControls(controls);

    return {
        columnSizing,
        // menu: undefined, // TODO maybe use pivotTableMenuForCapabilities? we would need backend capabilities though
        // separators: undefined, // TODO fill from somewhere
        // the user can fill the rest on their own later
    };
}
