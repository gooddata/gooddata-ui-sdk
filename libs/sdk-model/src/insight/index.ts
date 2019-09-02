// (C) 2019 GoodData Corporation
import { ITotal, SortItem } from "../base";
import { IBucket } from "../buckets";
import { IFilter } from "../filter";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IInsight {
    insight: {
        identifier: string;
        uri?: string;
        title: string;
        visualizationClassIdentifier: string;
        buckets: IBucket[];
        filters: IFilter[];
        totals: ITotal[];
        sorts: SortItem;
        properties: VisualizationProperties;
    };
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IVisualizationClass {
    visualizationClass: {
        identifier: string;
        uri?: string;
        title: string;
        url: string;
        icon: string;
        iconSelected: string;
        checksum: string;
        orderIndex?: number;
    };
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export type VisualizationProperties = {
    [key: string]: any;
};
