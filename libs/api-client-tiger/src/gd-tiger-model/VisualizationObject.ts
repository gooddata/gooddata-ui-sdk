// (C) 2019-2020 GoodData Corporation
import { ExecuteAFM } from "./ExecuteAFM";
import { ISortItem } from "@gooddata/sdk-model";

export namespace VisualizationObject {
    export interface IVisualizationObject {
        visualizationObject: {
            title: string;
            visualizationUrl: string;
            buckets: IBucket[];
            filters: ExecuteAFM.FilterItem[]; // TODO make sure this includes Measure value filters when they land in tiger
            sorts: ISortItem[];
            properties: VisualizationProperties;
        };
    }

    interface IBucket {
        localIdentifier?: string;
        items: IAttributeOrMeasure[];
        totals?: ExecuteAFM.ITotalItem[];
    }

    type IAttributeOrMeasure = ExecuteAFM.IMeasure | ExecuteAFM.IAttribute;

    type VisualizationProperties = {
        [key: string]: any;
    };
}
