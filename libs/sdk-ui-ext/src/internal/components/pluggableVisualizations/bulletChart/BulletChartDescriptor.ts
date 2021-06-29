// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableBulletChart } from "./PluggableBulletChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { IInsight } from "@gooddata/sdk-model";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { getIntersectionPartAfter, IDrillEvent } from "@gooddata/sdk-ui";

export class BulletChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBulletChart(params);
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForBullet(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    private addFiltersForBullet(insight: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(insight, cutIntersection);
    }
}
