// (C) 2019-2020 GoodData Corporation
import { ExecuteAFM } from "./ExecuteAFM";

export namespace VisualizationObject {
    export interface IVisualizationObject {
        visualizationObject: {
            title: string;
            visualizationUrl: string;
            buckets: IBucket[];
            filters: ExecuteAFM.FilterItem[]; // TODO make sure this includes Measure value filters when they land in tiger
            sorts: ExecuteAFM.SortItem[];
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
