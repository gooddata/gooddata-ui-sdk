// (C) 2020 GoodData Corporation
import isEmpty from "lodash/fp/isEmpty";
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
            dateDataSet?: string;
            ignoreDashboardFilters: Array<
                GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference
            >;
            drills?: IDrillDefinition[];
        };
    }

    export interface IWrappedVisualizationWidget {
        visualizationWidget: IVisualizationWidget;
    }

    export type IDrillDefinition = IDrillToVisualization;

    export interface IDrillToVisualization {
        target: "pop-up";
        from: GdcVisualizationObject.ILocalIdentifierQualifier;
        toVisualization: GdcVisualizationObject.IObjUriQualifier;
    }

    export function isVisualizationWidget(obj: any): obj is IVisualizationWidget {
        return !isEmpty(obj) && (obj as IVisualizationWidget).meta.category === "visualizationWidget";
    }

    export function isWrappedVisualizationWidget(obj: any): obj is IWrappedVisualizationWidget {
        return !isEmpty(obj) && obj.hasOwnProperty("visualizationWidget");
    }
}
