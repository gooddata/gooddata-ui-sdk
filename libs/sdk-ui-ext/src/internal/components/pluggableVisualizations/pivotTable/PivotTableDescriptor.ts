// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import {
    bucketAttributes,
    bucketMeasures,
    IInsight,
    IInsightDefinition,
    insightFilters,
    insightProperties,
    insightSanitize,
    insightSorts,
    insightTotals,
} from "@gooddata/sdk-model";
import {
    IAttributeColumnWidthItem,
    IColumnSizing,
    IPivotTableConfig,
    IPivotTableProps,
    isAttributeColumnWidthItem,
    pivotTableMenuForCapabilities,
} from "@gooddata/sdk-ui-pivot";
import { BucketNames } from "@gooddata/sdk-ui";
import { ISettings } from "@gooddata/sdk-backend-spi";

import {
    IEmbeddingCodeContext,
    IVisualizationDescriptor,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";
import { PluggablePivotTable } from "./PluggablePivotTable";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { IDrillDownContext } from "../../../interfaces/Visualization";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";

export class PivotTableDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
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

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "PivotTable",
            package: "@gooddata/sdk-ui-pivot",
        },
        insightToProps: getInsightToPropsConverter<IPivotTableProps>({
            measures: bucketConversion("measures", BucketNames.MEASURES, bucketMeasures),
            rows: bucketConversion("rows", BucketNames.ATTRIBUTE, bucketAttributes),
            columns: bucketConversion("columns", BucketNames.COLUMNS, bucketAttributes),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            totals: insightConversion("totals", insightTotals),
            config: insightConversion("config", getConfigFromInsight),
        }),
        additionalFactories: [
            {
                importInfo: {
                    name: "newWidthForAttributeColumn",
                    package: "@gooddata/sdk-ui-pivot",
                    importType: "named",
                },
                transformation: (obj) => {
                    return isAttributeColumnWidthItem(obj)
                        ? factoryNotationForAttributeColumnWidthItem(obj)
                        : undefined;
                },
            },
        ],
    });
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

function getConfigFromInsight(
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

function factoryNotationForAttributeColumnWidthItem(obj: IAttributeColumnWidthItem): string {
    const { attributeIdentifier, width } = obj.attributeColumnWidthItem;
    const { value: widthValue, allowGrowToFit } = width;
    return allowGrowToFit
        ? `newWidthForAttributeColumn(${attributeIdentifier}, ${widthValue}, true)`
        : `newWidthForAttributeColumn(${attributeIdentifier}, ${widthValue})`;
}
