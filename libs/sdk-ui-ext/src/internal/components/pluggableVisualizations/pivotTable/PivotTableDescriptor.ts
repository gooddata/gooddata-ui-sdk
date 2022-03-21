// (C) 2021-2022 GoodData Corporation
import { IInsight, IInsightDefinition, insightSanitize } from "@gooddata/sdk-model";
import {
    IAttributeColumnWidthItem,
    IPivotTableProps,
    isAttributeColumnWidthItem,
} from "@gooddata/sdk-ui-pivot";
import { BucketNames } from "@gooddata/sdk-ui";
import { ISettings } from "@gooddata/sdk-backend-spi";

import {
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
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
    multipleAttributesBucketConversion,
    multipleAttributesOrMeasuresBucketConversion,
    sortsInsightConversion,
    totalsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { pivotTableConfigFromInsight } from "./pivotTableConfigFromInsight";

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
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            rows: multipleAttributesBucketConversion("rows", BucketNames.ATTRIBUTE),
            columns: multipleAttributesBucketConversion("columns", BucketNames.COLUMNS),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            totals: totalsInsightConversion("totals"),
            config: insightConversion(
                "config",
                {
                    propImport: {
                        importType: "named",
                        name: "IPivotTableConfig",
                        package: "@gooddata/sdk-ui-pivot",
                    },
                    propType: "scalar",
                },
                pivotTableConfigFromInsight,
            ),
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

function factoryNotationForAttributeColumnWidthItem(obj: IAttributeColumnWidthItem): string {
    const { attributeIdentifier, width } = obj.attributeColumnWidthItem;
    const { value: widthValue, allowGrowToFit } = width;
    return allowGrowToFit
        ? `newWidthForAttributeColumn(${attributeIdentifier}, ${widthValue}, true)`
        : `newWidthForAttributeColumn(${attributeIdentifier}, ${widthValue})`;
}
