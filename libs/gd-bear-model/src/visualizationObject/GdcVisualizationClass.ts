// (C) 2007-2018 GoodData Corporation
import { IObjectMeta } from "../meta/Meta";

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
        meta: IObjectMeta;
        content: IVisualizationClassContent;
    }

    export interface IVisualizationClassWrapped {
        visualizationClass: IVisualizationClass;
    }
}
