// (C) 2021 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableHeatmap } from "./PluggableHeatmap";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { IInsight } from "@gooddata/sdk-model";
import { IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";

export class HeatmapDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeatmap(params);
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
        const clicked = drillDownFromAttributeLocalId(drillConfig);
        const cutIntersection = (event.drillContext.intersection || []).filter(
            (i) =>
                isDrillIntersectionAttributeItem(i.header) &&
                i.header.attributeHeader.localIdentifier === clicked,
        );
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
