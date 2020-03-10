// (C) 2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";
import { GdcVisualizationObject } from "../visualizationObject/GdcVisualizationObject";

/**
 * @public
 */
export namespace GdcVisualizationWidget {
    export interface IVisualizationWidget {
        meta: GdcMetadata.IObjectMeta;
        content: {
            visualization: string;
            dateDataSe?: string;
            ignoreDashboardFilters: Array<
                GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference
            >;
            drills?: IDrillDefinition;
        };
    }

    export type IDrillDefinition = IDrillToVisualization;

    export interface IDrillToVisualization {
        target: "pop-up";
        from: GdcVisualizationObject.ILocalIdentifierQualifier;
        toVisualization: GdcVisualizationObject.IObjUriQualifier;
    }
}
