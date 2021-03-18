// (C) 2021 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";

import {
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";
import { PluggablePivotTable } from "./PluggablePivotTable";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { ISettings } from "@gooddata/sdk-backend-spi";

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
}
