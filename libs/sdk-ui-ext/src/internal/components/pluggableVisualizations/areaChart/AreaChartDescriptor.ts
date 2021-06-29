// (C) 2021 GoodData Corporation
import { IDrillEvent } from "@gooddata/sdk-ui";
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableAreaChart } from "./PluggableAreaChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { IInsight } from "@gooddata/sdk-model";
import {
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
    addIntersectionFiltersToInsight,
} from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";

export class AreaChartDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableAreaChart(params);
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
