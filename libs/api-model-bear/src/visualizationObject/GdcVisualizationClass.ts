// (C) 2007-2019 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 * @public
 */
export namespace GdcVisualizationClass {
    export interface IVisualizationClassContent {
        url: string;
        icon: string;
        iconSelected: string;
        checksum: string;
        orderIndex?: number;
    }

    export interface IVisualizationClass {
        meta: GdcMetadata.IObjectMeta;
        content: IVisualizationClassContent;
    }

    export interface IVisualizationClassWrapped {
        visualizationClass: IVisualizationClass;
    }
}
