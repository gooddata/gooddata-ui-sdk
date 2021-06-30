// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableLineChart } from "./PluggableLineChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { IInsight } from "@gooddata/sdk-model";
import { IDrillEvent } from "@gooddata/sdk-ui";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";

export class LineChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableLineChart(params);
    }

    public applyDrillDown(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
