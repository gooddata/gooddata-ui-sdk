import { IObjectMeta } from './Meta';

export namespace VisualizationClass {
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
